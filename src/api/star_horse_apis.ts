import { getUserInfo } from "@/utils/auth";

import { ServiceEnums } from "@/components/enums/ServiceEnums";

function getUserId() {
  const userInfo = getUserInfo();
  return userInfo?.idUsersinfo;
}

/**
 * 一次性加载用户权限菜单
 * @param data
 * @param sysId
 */
export async function permissionMenus(data: any, sysId: string) {
  const userId = data?.userId || getUserId();
  return await postRequest(
    `${ServiceEnums.SYSTEM_PREFIX}menusinfo/permissionMenus/${userId}/${sysId}`,
    {},
  );
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
  return [];
}

/**
 * Post 请求
 * @param url
 * @param data
 * @param signal - Optional AbortSignal for request cancellation
 * @returns {Promise<AxiosResponse<any>>}
 */
export function postRequest(
  url: string,
  data: Array<any> | any,
  signal?: AbortSignal,
) {
  const config: any = {};
  if (signal) {
    config.signal = signal;
  }
  return new Promise((resolve, reject) => {});
}

/**
 * Get请求
 * @param url
 * @param signal - Optional AbortSignal for request cancellation
 * @returns {Promise<AxiosResponse<any>>}
 */
export function getRequest(url: string, signal?: AbortSignal) {
  const config: any = {};
  if (signal) {
    config.signal = signal;
  }
  return new Promise((resolve, reject) => {});
}
