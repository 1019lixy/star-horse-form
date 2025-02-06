import axios, {AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {getToken, getUserInfo, removeToken, setCustomerInfo, setToken, setUserInfo} from "@/utils/auth";
import router from "@/router";
import {error, warning} from "../utils/message";
import {Config} from "@/api/settings.ts";
import {reactive} from "vue";
import {MenusInfo} from "@/components/types/MenusInfo";
import piniaInstance from "@/store";
import {navBarList} from "@/store/NavbarListStore";
import {userInfoStore} from "@/store/UserInfoStore";
import {viewList} from "@/store/ViewCacheStore";
import {SelectOption} from "@/components/types/SearchProps";
import {RouteLocationNormalized} from "vue-router";
import {useButtonPermission} from "@/store/ButtonPermissionStore.ts";
import {loadData} from "@/api/sh_api.ts";

const navBarListStore = navBarList(piniaInstance);
const userStore = userInfoStore(piniaInstance);
const pagePermission = useButtonPermission(piniaInstance);
const viewListStore = viewList(piniaInstance);
const service = axios.create({
    baseURL: "/",
    timeout: 50000,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})
// 添加请求拦截器
service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = getToken();
    // 请求头带上token
    if (token && config.headers) {
        config.headers.token = token;
        config.headers.menuPosition = getMenuId();
    }
    return config;
}, (error: any) => {
    // 对请求错误做些什么
    return Promise.reject(error);
});
const forceLoginOut = () => {
    console.log("系统超时，请登录后再操出");
    removeToken();
    navBarListStore.clearAll();
    userStore.logout();
    router.push({path: "/login", query: {redirect: router.currentRoute.value.fullPath}}).then(r => {
        console.log(r);
    });
}
// 添加响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
    const code = response.data?.code;
    // 401 未登录
    if (code == 401) {
        forceLoginOut();
    } else {
        return response;
    }

}, (err) => {
    const data = err.toString().toLowerCase();
    if (data?.includes("status code 401")) {
        forceLoginOut();
    } else if (data?.includes("status code 500")) {
        error("服务接口异常，请联系管理员");
        return Promise.reject(err);
    } else {
        console.log(err)
        // 对响应错误做点什么
        return Promise.reject(err);
    }
});

function getUserId() {
    const userInfo = getUserInfo();
    return userInfo?.idUsersinfo;
}

/**
 * 获取系统验证码
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getValidateImg() {
    return getRequest("/system-config/global/imageCode");
}

/**
 * 加载二维码
 * @param content
 */
export async function rtCode(content: string) {
    let data = "";
    await getRequest(`/system-config/global/qrCode/${content}`).then(res => {
        data = res.data.data;
    });
    return data;
}

/**
 * 菜单选择树
 * @param data
 * @returns {[]}
 */
export function selectMenusTreeData(data: any) {
    const list: any = [];
    data.forEach((item: any) => {
        const temp: any = {};
        temp["value"] = item.idMenusinfo;
        temp["label"] = item.menuName;
        if (item.children && item.children.length > 0) {
            temp["children"] = [];
            item.children.forEach((sitem: any) => {
                const stemp: any = {};
                stemp["value"] = sitem.idMenusinfo;
                stemp["label"] = sitem.menuName;
                temp["children"].push(stemp);
            });
        }
        list.push(temp);
    });
    return list;
}

/**
 * 用户登录
 * @param loginData
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function userLogin(loginData: any) {
    let data: any = {};
    let errMsg = null;
    let resultData = await loadData("/system-config/system/usersAuditEntity/userLogin", loginData);
    if (resultData.error) {
        errMsg = resultData.error;
    } else {
        let userData = resultData.data;
        let condition = {
            "userId": userData.idUsersinfo,
        };
        userStore.login({...userData, rememberMe: loginData.rememberMe});
        setToken(userData.dataNo, data.rememberMe);
        setUserInfo({...userData, ...loginData, rememberMe: loginData.rememberMe});
        setCustomerInfo(userData.customerInfo);
        //登录成功，获取当前用户的权限菜单
        await permissionMenus(condition, "-1").then(res2 => {
            createRouterAndMenuList(res2.data.data);
            data = userData;
        });
    }
    return {data, errMsg};
}

/**
 * 退出登录
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function userLogout(data: Array<any>) {
    let resultDdata = await loadData("/system-config/system/usersAuditEntity/userLogout", data);
    if (resultDdata.error) {
        warning(resultDdata.error);
        return;
    }
    removeToken()
    userStore.logout();
    navBarListStore.clearAll();
    viewListStore.clearAll();
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
 * 加载权限
 * @param menuId 菜单id
 */
export async function loadPagePermission(menuId: string) {
    const permission: any = {};
    const data: any = {"menuId": menuId};
    const redata: Array<any> = await permissionResources(data);
    redata?.forEach((item: any) => {
        permission[item.resCode] = item.resCode;
    });
    return permission
}

/**
 * 一次性加载用户权限菜单
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function permissionMenus(data: any, sysId: string) {
    const userId = data.userId || getUserId();
    return await postRequest(`/system-config/system/menusinfoEntity/permissionMenus/${userId}/${sysId}`, {});
}

export async function permissionResources(data: any) {
    const permissons = userStore.pageButtonPermission[data.menuId];
    if (permissons && permissons.length > 0) {
        return permissons;
    } else {
        const userId = getUserId();
        let redata: any = [];
        //没拿到则到数据库中去取
        await postRequest(`/system-config/system/resourcesEntity/permissionResources/${userId}/${data.menuId}`, {}).then(res => {
            if (res.data.code) {
                console.log(res.data.cnMessage);
                return;
            }
            redata = res.data.data;
        });
        if (redata && redata.length > 0) {
            userStore.pushPageButtonPermission(data.menuId, redata);
        } else {
            console.log("没有页面按钮操作权限,请联系系统管理员授权");
        }
        return redata;
    }
}

/**
 * 将Store里的菜单还原
 */
export function restoreMenu(to: RouteLocationNormalized) {
    const data = localStorage.getItem("menusInfo");
    if (data) {
        createRouterAndMenuList(JSON.parse(data));
    }
    const redata = router.getRoutes().find(item => item.path == to.fullPath);
    if (redata) {
        router.push({...redata});
    } else {
        router.push("/");
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
    if (!redata) {
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
                    menuId: menuId ? prefix + menuId : prefix + (sindex++),
                    keepAlive: item.keepAlive
                },
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
    // localStorage.setItem("pageButtonPermissions", JSON.stringify(pageButtonPermissions));
    localStorage.setItem("menusInfo", JSON.stringify(redata));
    localStorage.setItem("dynamicMenusLists", JSON.stringify(userStore.dynamicMenus));
    return leftMenuDatas;
}

/**
 * 下载文件,
 * @param url 路径
 * @param param 参数
 */
export function download(url: string, param: any) {
    return new Promise((resolve, reject) => {
        service.post(url, param, {responseType: "blob"}).then(res => {
            downloadData(res.data, decodeURI(res.headers["content-disposition"].split("=")[1]));
            // const blob = new Blob([res.data]);
            // const delement = document.createElement("a");
            // const href = window.URL.createObjectURL(blob);
            // delement.href = href;
            // delement.download = decodeURI(res.headers["content-disposition"].split("=")[1]);
            // document.body.appendChild(delement);
            // delement.click();
            // document.body.removeChild(delement);
            // window.URL.revokeObjectURL(href);
            resolve(null);
        }).catch(err => {
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
    window.URL.revokeObjectURL(href);    //释放URL 对象
}

/**
 * 加载资源文件
 * @param url
 */
export async function blobData(url: string) {
    let redata: any = null;
    await service.post(url, [], {responseType: "blob"}).then(res => {
        redata = new Blob([res.data]);
    });
    return redata;
}

/**
 * 加载已配置的菜单
 * @param param
 * @returns {Promise<AxiosResponse<*>>}
 */
export function loadConfigedMenus(param: Array<object>) {
    return postRequest("/system-config/system/menusinfoEntity/getAllByCondition", param);
}

/**
 * 获取部门信息
 * @param param
 * @returns {Promise<AxiosResponse<*>>}
 */
export async function loadDepartments(param: Array<object>) {
    let redata: any[] = [];
    let errMsg = null;
    await postRequest("/system-config/system/departmentEntity/getAllByCondition", param).then(res => {
        if (res.data.code != 0) {
            errMsg = res.data.cnMessage;
        } else {
            redata = res.data.data
        }
    }).catch(err => errMsg = err)
    return {redata, errMsg};
}

/**
 * 获取部门信息
 * @param param
 * @returns {Promise<AxiosResponse<*>>}
 */
export async function loadSystems(param: Array<object>) {
    let redata: any[] = [];
    let errMsg = null;
    await postRequest("/system-config/system/informationsEntity/getAllByCondition", param).then(res => {
        if (res.data.code != 0) {
            errMsg = res.data.cnMessage;
        } else {
            redata = res.data.data
        }
    }).catch(err => errMsg = err)
    return {redata, errMsg};
}

/**
 * 获取数据字典
 * @param dictName
 * @returns {Promise<unknown>}
 */
export async function loadDict(dictName: string) {
    const redata: Array<SelectOption> = [];
    const param = {
        fieldList: [{propertyName: "dictType", value: dictName ? dictName : "common"}]
    };
    await postRequest("/system-config/system/dictinfoEntity/getAllByCondition", param).then(res => {
        if (res.data.code != 0) {
            console.log(res.data.cnMessage);
        } else {
            const resdata = res.data.data;
            resdata.forEach((item: any) => {
                redata.push({
                    name: item.dictName,
                    value: item.dictCode
                })
            });
        }
    }).catch(err => console.log(err));
    return redata;
}

/**
 * 获取下拉数据
 * @param param
 * @returns {Promise<unknown>}
 */
export async function loadRoleDatas(param: Array<object>) {
    let redata: any[] = [];
    let errMsg = null;
    await postRequest("/system-config/system/rolesinfoEntity/queryUserAllRoles", param).then(res => {
        if (res.data.code != 0) {
            errMsg = res.data.cnMessage;
        } else {
            const resdata = res.data.data;
            redata = resdata as any;
        }
    }).catch(err => errMsg = err);
    return {redata, errMsg}
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

/**
 * Post Upload 请求
 * @param url
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export function uploadRequest(url: string, data: Array<any>) {
    return service.post(url, data, {headers: {"Content-Type": "multipart/form-data"}});
}

/**
 * 去除空格
 * @param data
 * @returns {*}
 */
export function trim(data: string) {
    if (!data) {
        return data;
    }
    return data.replace(/(^\s*)|(\s*$)/g, '');
}

