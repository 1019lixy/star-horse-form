import { ApiUrls, postRequest, success, warning } from "star-horse-lowcode";
import { ref } from "vue";
import { i18n } from "@/lang";

const customCompApi = ref<ApiUrls>();
let basePrefix = "/userdb-manage";

/** 存储模式: db-数据库, local-本地缓存 */
export type CustomCompStorageMode = "db" | "local";

const LOCAL_CUSTOM_COMP_KEY = "star_horse_custom_components";

/**
 * 初始化自定义组件接口配置
 * @param api 接口配置(可选,未配置时使用默认路径)
 * @param prefix 网关前缀(可选,默认 /userdb-manage)
 */
export function initCustomCompApi(api?: ApiUrls, prefix?: string) {
  if (api) customCompApi.value = api;
  if (prefix) basePrefix = prefix;
}

/**
 * 保存自定义组件到数据库
 */
export function saveCustomComponent(params: {
  idCustomComponent?: string;
  compName: string;
  compIcon: string;
  description?: string;
  baseItemType: string;
  baseCompType: string;
  prepSnapshot: string;
  isShared?: number;
}): Promise<any> {
  const url =
    customCompApi.value?.mergeUrl ||
    `${basePrefix}/userdb/customComponent/merge`;
  return postRequest(url, params);
}

/**
 * 查询所有有效的自定义组件(数据库)
 */
export function getCustomComponentList(): Promise<any> {
  const url =
    customCompApi.value?.customerUrl1 ||
    `${basePrefix}/userdb/customComponent/listAll`;
  return postRequest(url, {});
}

/**
 * 删除自定义组件(数据库)
 */
export function deleteCustomComponent(id: string): Promise<any> {
  const url =
    customCompApi.value?.deleteUrl ||
    `${basePrefix}/userdb/customComponent/deleteById/${id}`;
  return postRequest(url, {});
}

// ═══════════════════════════════════════════════════════════════
// 本地缓存模式(localStorage)
// ═══════════════════════════════════════════════════════════════

/** 自定义组件本地缓存数据结构 */
export interface CustomCompLocalData {
  idCustomComponent: string;
  compName: string;
  compIcon: string;
  description?: string;
  baseItemType: string;
  baseCompType: string;
  prepSnapshot: string;
  storageMode: "local";
  isShared?: number;
  createdTime?: string;
}

/** 获取本地所有自定义组件 */
const getLocalAllCustomComps = (): CustomCompLocalData[] => {
  const data = localStorage.getItem(LOCAL_CUSTOM_COMP_KEY);
  return data ? JSON.parse(data) : [];
};

/** 保存本地所有自定义组件 */
const setLocalAllCustomComps = (list: CustomCompLocalData[]) => {
  localStorage.setItem(LOCAL_CUSTOM_COMP_KEY, JSON.stringify(list));
};

/** 保存自定义组件到本地缓存(本地缓存天然私有,不涉及共享) */
export const saveLocalCustomComponent = (params: {
  compName: string;
  compIcon: string;
  description?: string;
  baseItemType: string;
  baseCompType: string;
  prepSnapshot: string;
}): CustomCompLocalData => {
  const list = getLocalAllCustomComps();
  const item: CustomCompLocalData = {
    idCustomComponent: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    compName: params.compName,
    compIcon: params.compIcon || "component",
    description: params.description || "",
    baseItemType: params.baseItemType,
    baseCompType: params.baseCompType || "formItem",
    prepSnapshot: params.prepSnapshot,
    storageMode: "local",
    isShared: 0,
    createdTime: new Date().toISOString(),
  };
  list.push(item);
  setLocalAllCustomComps(list);
  return item;
};

/** 获取本地自定义组件列表 */
export const getLocalCustomComponentList = (): CustomCompLocalData[] => {
  return getLocalAllCustomComps();
};

/** 删除本地自定义组件 */
export const deleteLocalCustomComponent = (id: string) => {
  const list = getLocalAllCustomComps();
  const filtered = list.filter((t) => t.idCustomComponent !== id);
  setLocalAllCustomComps(filtered);
};

// ═══════════════════════════════════════════════════════════════
// 通用方法(兼容两种存储模式)
// ═══════════════════════════════════════════════════════════════

/**
 * 实例专属字段(保存快照时需要排除)
 */
const INSTANCE_KEYS = [
  "id",
  "name",
  "label",
  "itemNameLabel",
  "elements",
  "children",
  "items",
];

/**
 * 从舞台组件preps中提取配置快照(去除实例专属字段)
 */
export function extractPrepSnapshot(
  preps: Record<string, any>,
): Record<string, any> {
  const snapshot: Record<string, any> = {};
  if (!preps || typeof preps !== "object") return snapshot;
  for (const key in preps) {
    if (!INSTANCE_KEYS.includes(key)) {
      snapshot[key] = preps[key];
    }
  }
  return snapshot;
}

/**
 * 保存当前选中组件为自定义组件(自动判断存储模式)
 */
export async function saveCurrentCompAsCustom(params: {
  compName: string;
  compIcon: string;
  description?: string;
  baseItemType: string;
  baseCompType: string;
  preps: Record<string, any>;
  storageMode: CustomCompStorageMode;
  isShared?: boolean;
}): Promise<boolean> {
  const snapshot = extractPrepSnapshot(params.preps);
  if (Object.keys(snapshot).length === 0) {
    warning(i18n("dyform.customComp.save.emptyPreps"));
    return false;
  }
  const snapshotStr = JSON.stringify(snapshot);
  const sharedVal = params.isShared ? 1 : 0;
  // 本地缓存模式(天然私有,不涉及共享)
  if (params.storageMode === "local") {
    try {
      saveLocalCustomComponent({
        compName: params.compName.trim(),
        compIcon: params.compIcon || "component",
        description: params.description?.trim() || "",
        baseItemType: params.baseItemType,
        baseCompType: params.baseCompType || "formItem",
        prepSnapshot: snapshotStr,
      });
      success(i18n("dyform.customComp.save.success"));
      return true;
    } catch (_) {
      warning(i18n("dyform.customComp.save.failed"));
      return false;
    }
  }
  // 数据库模式
  try {
    const result = await saveCustomComponent({
      compName: params.compName.trim(),
      compIcon: params.compIcon || "component",
      description: params.description?.trim() || "",
      baseItemType: params.baseItemType,
      baseCompType: params.baseCompType || "formItem",
      prepSnapshot: snapshotStr,
      isShared: sharedVal,
    });
    if (result.data?.code != 200) {
      warning(result.data?.cnMessage || i18n("dyform.customComp.save.failed"));
      return false;
    }
    success(i18n("dyform.customComp.save.success"));
    return true;
  } catch (_) {
    warning(i18n("dyform.customComp.save.failed"));
    return false;
  }
}
