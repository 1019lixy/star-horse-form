import axios, {AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig} from "axios";
import {getToken, getUserInfo, removeToken, setCustomerInfo, setToken, setUserInfo} from "@/utils/auth";
import router from "@/router";
import {error, warning} from "../utils/message";
import {Config} from "@/api/settings.ts";
import {reactive} from "vue";
import {MenusInfo} from "@/components/types/MenusInfo";
import piniaInstance from "@/store";
import {navBarList} from "@/store/NavbarListStore";
import {UserInfo} from "@/store/UserInfoStore";
import {viewList} from "@/store/ViewCacheStore";
import {SelectOption} from "@/components/types/SearchProps";

const navBarListStore = navBarList(piniaInstance);
const userInfoStore = UserInfo(piniaInstance);
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
    let token = getToken();
    // 请求头带上token
    if (token && config.headers) {
        config.headers.token = token;
    }
    return config;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});
// 添加响应拦截器
service.interceptors.response.use((response: AxiosResponse) => {
    return response;
}, (err) => {
    let data = err.toString().toLowerCase();
    if (data?.includes("status code 401")) {
        console.log("系统超时，请登录后再操出");
        removeToken();
        navBarListStore.clearAll();
        userInfoStore.logout();
        router.push({path: "/login", query: {redirect: router.currentRoute.value.fullPath}});
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
    let userInfo = getUserInfo();
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
    let list: any = [];
    data.forEach((item: any) => {
        let temp: any = {};
        temp["value"] = item.idMenusinfo;
        temp["label"] = item.menuName;
        if (item.children && item.children.length > 0) {
            temp["children"] = [];
            item.children.forEach((sitem: any) => {
                let stemp: any = {};
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
    await postRequest("/system-config/system/usersAuditEntity/userLogin", loginData).then(async (res) => {
        let redata = res.data;
        let userData = redata.data;
        if (redata.code != 0) {
            errMsg = redata.cnMessage;
        } else {
            let condition = {
                "userId": userData.idUsersinfo,
            };
            userInfoStore.login({...userData, rememberMe: loginData.rememberMe});
            setToken(userData.dataNo, data.rememberMe);
            setUserInfo({...userData, ...loginData, rememberMe: loginData.rememberMe});
            setCustomerInfo(userData.customerInfo);
            //登录成功，获取当前用户的权限菜单
            await permissionMenus(condition, "-1").then(res2 => {
                let redata2: MenusInfo[] = createRouterAndMenuList(res2.data.data);
                localStorage.setItem("menusInfo", JSON.stringify(res2.data.data));
                userInfoStore.addPermissionMenus(redata2);
                data = userData;
            });
        }
    }).catch(error => {
        errMsg = error;
    });
    return {data, errMsg};
}

/**
 * 退出登录
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function userLogout(data: Array<Object>) {
    await postRequest("/system-config/system/usersAuditEntity/userLogout", data).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            warning(redata.cnMessage);
        } else {
            removeToken()
            userInfoStore.logout();
            navBarListStore.clearAll();
            viewListStore.clearAll();
            router.push({
                path: "/login",
                query: {redirect: router.currentRoute.value.fullPath}
            });
        }
    }).catch(err => error(err));
}

/**
 * 一次性加载用户权限菜单
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function permissionMenus(data: any, sysId: string) {
    let userId = data.userId || getUserId();
    return await postRequest(`/system-config/system/menusinfoEntity/permissionMenus/${userId}/${sysId}`, {});
}

export function permissionResources(data: any) {
    let userId = data.userId || getUserId();
    return postRequest(`/system-config/system/resourcesEntity/permissionResources/${userId}/${data.menuId}`, {})
}

/**
 * 创建路由和菜单数据
 * @param redata
 * @returns {[]}
 */
export function createRouterAndMenuList(redata: Array<Object>): MenusInfo[] {
    let leftMenuDatas: MenusInfo[] = [];
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
        let menuDatas: MenusInfo[] = [];
        for (let index = 0; index < redata.length; index++) {
            let item = redata[index];
            if (item.menuPath == "#" && item.children?.length == 0) {
                continue;
            }
            let arr = item.menuPath.split("/");
            let menuName = arr[arr.length - 1];
            menuName = menuName.endsWith(Config.fileExt) ? menuName.split(".")[0] : menuName;
            let path = item.menuPath?.startsWith("/") ? item.menuPath : "/" + item.menuPath;
            path = path.endsWith(Config.fileExt) ? path : path + Config.fileExt;
            let prefix = key_index + "_";
            let data = reactive<MenusInfo>({
                path: item.menuPath,
                component: compPath[`${baseDir}${path}`],
                name: menuName,
                children: [],
                meta: {
                    menuIcon: item.menuIcon,
                    title: item.menuName,
                    menuId: item.idMenusinfo ? prefix + item.idMenusinfo : prefix + (sindex++),
                    keepAlive: item.keepAlive
                },
            });
            if (path.indexOf("/page/") == -1) {
                router.addRoute("Index", data);
            } else {
                userInfoStore.addDynamicMenus(data);
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
    localStorage.setItem("dynamicMenusLists", JSON.stringify(userInfoStore.dynamicMenus));
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
            let blob = new Blob([res.data]);
            let delement = document.createElement("a");
            let href = window.URL.createObjectURL(blob);
            delement.href = href;
            delement.download = decodeURI(res.headers["content-disposition"].split("=")[1]);
            document.body.appendChild(delement);
            delement.click();
            document.body.removeChild(delement);
            window.URL.revokeObjectURL(href);
            resolve(null);
        }).catch(err => {
            console.log(err);
            reject(err);
        });
    });
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
export function loadConfigedMenus(param: Array<Object>) {
    return postRequest("/system-config/system/menusinfoEntity/getAllByCondition", param);
}

/**
 * 获取部门信息
 * @param param
 * @returns {Promise<AxiosResponse<*>>}
 */
export async function loadDepartments(param: Array<Object>) {
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
export async function loadSystems(param: Array<Object>) {
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
 * @param param
 * @returns {Promise<unknown>}
 */
export async function loadDict(dictName: String) {
    let redata: Array<SelectOption> = [];
    let param = {
        fieldList: [{propertyName: "dictType", value: dictName ? dictName : "common"}]
    };
    await postRequest("/system-config/system/dictinfoEntity/getAllByCondition", param).then(res => {
        if (res.data.code != 0) {
            console.log(res.data.cnMessage);
        } else {
            let resdata = res.data.data;
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
export async function loadRoleDatas(param: Array<Object>) {
    let redata: any[] = [];
    let errMsg = null;
    await postRequest("/system-config/system/rolesinfoEntity/queryUserAllRoles", param).then(res => {
        if (res.data.code != 0) {
            errMsg = res.data.cnMessage;
        } else {
            let resdata = res.data.data;
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
export function uploadRequest(url: string, data: Array<Object>) {
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

/**
 * PostV2 请求
 * @param url
 * @param data
 * @returns {Promise<AxiosResponse<any>>}
 */
export async function iPostRequest(url: string, data: Array<any> | any) {
    const res = await service.post(url, data)
    if (res.data.code) {
        error(res.data.cnMessage)
        throw new Error(res.data.cnMessage)
    }
    return res.data.data
}
