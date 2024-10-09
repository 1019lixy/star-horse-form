import {Config} from '@/api/settings.ts'
import {SearchParams} from "@/components/types/Params";

const TokenKey = Config.TokenKey || "STAR-HORSE-TOEKN";

export function getToken() {
    return sessionStorage.getItem(TokenKey)
}

export function setUserInfo(userInfo: any) {
    const s = JSON.stringify(userInfo);
    sessionStorage.setItem(Config.loginInfo, s);
}

/**
 * 设置客户信息
 * @param customerInfo
 */
export function setCustomerInfo(customerInfo: any) {
    const s = JSON.stringify(customerInfo);
    sessionStorage.setItem(Config.customerInfo, s);
}

/**
 * 获取客户信息
 */
export function getCustomerInfo() {
    const str = sessionStorage.getItem(Config.customerInfo);
    if (!str || str == "undefined") {
        console.log("未找到客户编码");
        return null;
    }
    return JSON.parse(str);
}

/**
 * 获取查询对象
 */
export function getCustomerParam(propertyName:string): SearchParams | null {
    const customerInfo = getCustomerInfo();
    if (!customerInfo) {
        return null;
    }
    return {propertyName: propertyName, value: customerInfo.dataNo};
}

export function getUserInfo() {
    const userInfo = sessionStorage.getItem(Config.loginInfo);
    if (!userInfo) {
        console.log("未找到用户信息");
        return null;
    }
    return JSON.parse(userInfo);
}

export function setToken(token: string, rememberMe: any) {
    if (rememberMe) {
    } else {
        sessionStorage.setItem(TokenKey, token);
    }
}

export function removeToken() {
    sessionStorage.removeItem(TokenKey);
}
