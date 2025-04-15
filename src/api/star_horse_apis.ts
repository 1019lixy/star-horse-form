import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import router from "@/router";
import {Config} from "@/api/settings.ts";
import {reactive} from "vue";
import {delLoginInfo, getToken, getUserInfo, removeToken, setCustomerInfo, setToken, setUserInfo} from "@/utils/auth";
import {
    MenusInfo,
    SelectOption,
    useUserInfoStore,
    useButtonPermissionStore,
    error,
    warning,
    piniaInstance,
    loadData,
    getFingerId
} from "star-horse-lowcode";

import {useNavBarListStore} from "@/store/NavBarList.ts";
import {useViewCacheStore} from "@/store/ViewCache.ts";
import {NavigationGuardNext, RouteLocationNormalized} from "vue-router";
import {ServiceEnums} from "@/components/enums/ServiceEnums.ts";

const navBarListStore = useNavBarListStore(piniaInstance);
const userStore = useUserInfoStore(piniaInstance);
const pagePermission = useButtonPermissionStore(piniaInstance);
const viewListStore = useViewCacheStore(piniaInstance);

const service = axios.create({
    baseURL: "/",
    timeout: 50000,
    headers: {
        "Content-Type": "application/json; charset=utf-8"
    }
});
// 添加请求拦截器
service.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = getToken();
        const fingerToken = getFingerId();
        // 请求头带上token
        if (token && config.headers) {
            config.headers.token = token;
            config.headers["Finger-Token"] = fingerToken;
            config.headers["menuPosition"] = getMenuId();
        }
        return config;
    },
    (error: any) => {
        // 对请求错误做些什么
        return Promise.reject(error);
    }
);

const forceLoginOut = () => {
    let menusInfo = sessionStorage.getItem("menusInfo");
    if (!menusInfo || menusInfo == "undefined" || menusInfo == "null") {
        router.push({path: "/login"}).then((r) => {
            console.log(r);
        });
    } else {
        userStore.showLoginDialog();
    }
};
// 添加响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
        const code = response.data?.code;
        // 401 未登录
        if (code == 401) {
            forceLoginOut();
        } else {
            return response;
        }
    },
    (err) => {
        const data = err.toString().toLowerCase();
        if (data?.includes("status code 401")) {
            forceLoginOut();
        } else if (data?.includes("status code 500")) {
            error("服务接口异常，请联系管理员");
            return Promise.reject(err);
        } else {
            console.log(err);
            // 对响应错误做点什么
            return Promise.reject(err);
        }
    }
);

function getUserId() {
    const userInfo = getUserInfo();
    return userInfo?.idUsersinfo;
}

/**
 * 获取系统验证码
 */
export function getValidateImg() {
    return getRequest(`${ServiceEnums.GLOBAL_PREFIX}imageCode`);
}

/**
 * 加载二维码
 * @param content
 */
export async function rtCode(content: string) {
    let data = "";
    await getRequest(`${ServiceEnums.GLOBAL_PREFIX}qrCode/${content}`).then((res) => {
        data = res.data.data;
    });
    return data;
}


/**
 * 用户登录
 * @param loginData 登录参数
 */
export async function userLogin(loginData: any) {
    let data: any = {};
    let errMsg = null;
    const resultData = await loadData(`${ServiceEnums.SYSTEM_PREFIX}usersAuditEntity/userLogin`, loginData);
    if (resultData.error) {
        errMsg = resultData.error;
    } else {
        const userData = resultData.data;
        if (loginData.tokenId != userData.dataNo) {
            errMsg = "Token不一致，登录可能被非法劫持，请重新登录";
        } else {
            const condition = {
                userId: userData.idUsersinfo
            };
            userData["rememberMe"] = loginData.rememberMe;
            userStore.login(userData);
            setToken(userData.dataNo, data.rememberMe);
            setUserInfo(userData);
            setCustomerInfo(userData.customerInfo);
            //登录成功，获取当前用户的权限菜单
            await permissionMenus(condition, "-1").then((res2) => {
                createRouterAndMenuList(res2.data.data);
                data = userData;
            });
        }
    }
    return {data, errMsg};
}

/**
 * 退出登录
 * @param data 登出参数
 */
export async function userLogout(data: Array<any>) {
    const resultDdata = await loadData(`${ServiceEnums.SYSTEM_PREFIX}usersAuditEntity/userLogout`, data);
    if (resultDdata.error) {
        warning(resultDdata.error);
        return;
    }
    delLoginInfo();
    userStore.logout();
    navBarListStore.clearAll();
    viewListStore.clearAll();
    pagePermission.cleanPermission();
    router.push({path: "/login"});
}

export function getMenuId() {
    const meta = router.currentRoute.value.meta;
    let menuId = meta?.menuId as string;
    if (!menuId) {
        return "";
    }
    menuId = menuId.split("_")[1];
    return menuId;
}


/**
 * 一次性加载用户权限菜单
 * @param data
 * @param sysId
 */
export async function permissionMenus(data: any, sysId: string) {
    const userId = data.userId || getUserId();
    return await postRequest(`${ServiceEnums.SYSTEM_PREFIX}menusinfoEntity/permissionMenus/${userId}/${sysId}`, {});
}

/**
 * 将Store里的菜单还原
 */
export async function restoreMenu(to: RouteLocationNormalized, _next: NavigationGuardNext) {
    const data = sessionStorage.getItem("menusInfo");
    if (data) {
        createRouterAndMenuList(JSON.parse(data));
    }
    const redata = router.getRoutes().find((item) => item.path == to.fullPath);
    if (redata) {
        await router.push(to);
    } else {
        await router.push("/");
    }
}

/**
 * 创建路由和菜单数据
 * @param redata
 * @returns {[]}
 */
export function createRouterAndMenuList(redata: Array<object>): MenusInfo[] {
    let leftMenuDatas: MenusInfo[] = [];
    const pageButtonPermissions: any = {};
    if (redata?.length == 0) {
        return leftMenuDatas;
    }
    const baseDir = "/src/views";
    const compPath = import.meta.glob("@/views/**/*.vue");

    /**
     * 递归组装菜单
     * @param redata
     * @param key_index
     */
    function loopCreateMenu(redata: any, key_index: number) {
        let sindex = 1;
        const menuDatas: MenusInfo[] = [];
        for (let index = 0; index < redata.length; index++) {
            const item = redata[index];
            if (item.menuPath == "#" && item.children?.length == 0) {
                continue;
            }
            const menuId = item.idMenusinfo;
            if (menuId) {
                pageButtonPermissions[menuId.toString()] = item["pageButtonPermissions"];
            }
            const arr = item.menuPath.split("/");
            let menuName = arr[arr.length - 1];
            menuName = menuName.endsWith(Config.fileExt) ? menuName.split(".")[0] : menuName;
            let path = item.menuPath?.startsWith("/") ? item.menuPath : "/" + item.menuPath;
            path = path.endsWith(Config.fileExt) ? path : path + Config.fileExt;
            const prefix = key_index + "_";
            const data = reactive<MenusInfo>({
                path: item.menuPath,
                component: compPath[`${baseDir}${path}`],
                name: menuName,
                children: [],
                meta: {
                    menuIcon: item.menuIcon,
                    title: item.menuName,
                    menuId: menuId ? prefix + menuId : prefix + sindex++,
                    keepAlive: item.keepAlive
                }
            });
            if (path.indexOf("/page/") == -1) {
                if (item.openType == "self") {
                    router.addRoute("Index", data);
                } else {
                    router.addRoute(data);
                }
            } else {
                userStore.addDynamicMenus(data);
            }
            //如果有子节点
            if (item.children && item.children.length > 0) {
                data.children = loopCreateMenu(item.children, key_index + 1);
            }
            menuDatas.push(data);
        }
        return menuDatas;
    }

    leftMenuDatas = loopCreateMenu(redata, 1);

    userStore.addPermissionMenus(leftMenuDatas);
    pagePermission.addAllPermission(pageButtonPermissions);
    sessionStorage.setItem("menusInfo", JSON.stringify(redata));
    sessionStorage.setItem("dynamicMenusLists", JSON.stringify(userStore.dynamicMenus));
    return leftMenuDatas;
}

/**
 * 下载文件,
 * @param url 路径
 * @param param 参数
 */
export function download(url: string, param: any) {
    return new Promise((resolve, reject) => {
        service
            .post(url, param, {responseType: "blob"})
            .then((res) => {
                downloadData(res.data, decodeURI(res.headers["content-disposition"].split("=")[1]));
                resolve(null);
            })
            .catch((err) => {
                console.log(err);
                reject(err);
            });
    });
}

/**
 * 下载文件,
 * @param data 数据
 * @param name 文件名称
 */
export function downloadData(data: any, name: string) {
    const blob = new Blob([data]);
    const delement = document.createElement("a");
    const href = window.URL.createObjectURL(blob);
    delement.href = href;
    delement.download = name;
    document.body.appendChild(delement);
    delement.click();
    document.body.removeChild(delement);
    window.URL.revokeObjectURL(href); //释放URL 对象
}


/**
 * 获取数据字典
 * @param dictName
 * @returns {Promise<unknown>}
 */
export async function loadDict(dictName: string) {
    let redata: Array<SelectOption> = [];
    const param = {
        fieldList: [{propertyName: "dictType", value: dictName ? dictName : "common"}]
    };
    await postRequest(`${ServiceEnums.SYSTEM_PREFIX}dictinfoEntity/getAllByCondition`, param)
        .then((res) => {
            if (res?.data?.code != 0) {
                console.log(res.data.cnMessage);
            } else {
                const resdata = res?.data?.data;
                redata = resdata?.map((item: any) => {
                    return {
                        name: item.dictName,
                        value: item.dictCode
                    }
                });
            }
        })
        .catch((err) => console.log(err));
    return redata;
}


/**
 * Post 请求
 * @param url
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export function postRequest(url: string, data: Array<any> | any) {
    return service.post(url, data);
}

/**
 * Get请求
 * @param url
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getRequest(url: string) {
    return service.get(url);
}



