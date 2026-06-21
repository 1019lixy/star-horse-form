import { SelectOption } from "star-horse-lowcode";

/**
 * 数据适配器配置选项
 */
export interface DataAdapterOptions {
  /** 响应数据路径，默认 'data.data' */
  dataPath?: string;
  /** 成功码路径，默认 'data.code' */
  codePath?: string;
  /** 成功码值，默认 0 */
  successCode?: number | string;
}

/**
 * 字段映射配置
 * 支持两种形式：
 *   1. 对象属性名映射：{ name: 'dictName', value: 'dictCode' }
 *   2. 自定义函数映射：{ name: (item) => item.label, value: (item) => item.id }
 * 可选 children 字段映射，用于树形数据
 */
export type FieldMapping<T = any> = {
  name: keyof T | ((item: T) => string);
  value: keyof T | ((item: T) => string | number);
  /** 子节点字段名，默认 'children'，设为 null 可禁用递归 */
  children?: keyof T | null;
};

/**
 * 从嵌套对象中按路径取值
 * 支持 'data.data'、'data.list' 等路径格式
 */
function getNestedValue(obj: any, path: string): any {
  if (!obj || !path) return obj;
  const keys = path.split(".");
  let current = obj;
  for (const key of keys) {
    if (current == null) return undefined;
    current = current[key];
  }
  return current;
}

/**
 * 将单条原始数据转换为 SelectOption（递归处理 children）
 */
function mapItemToSelectOption<T>(
  item: T,
  mapping: FieldMapping<T>,
): SelectOption {
  const nameValue =
    typeof mapping.name === "function"
      ? mapping.name(item)
      : String(item[mapping.name] ?? "");
  const valueValue =
    typeof mapping.value === "function"
      ? mapping.value(item)
      : (item[mapping.value] as string | number);

  const result: SelectOption = { name: nameValue, value: valueValue };

  // 递归处理 children（树形数据）
  const childrenKey = mapping.children !== undefined ? mapping.children : "children" as keyof T;
  if (childrenKey && item[childrenKey] && Array.isArray(item[childrenKey])) {
    result.children = (item[childrenKey] as T[]).map((child: T) =>
      mapItemToSelectOption(child, mapping),
    );
  }

  return result;
}

/**
 * 核心转换逻辑：请求 → 响应校验 → 数据提取 → 字段映射 → SelectOption[]
 */
async function fetchAndMap<T = any>(
  request: () => Promise<any>,
  mapping: FieldMapping<T>,
  options?: DataAdapterOptions,
): Promise<SelectOption[]> {
  const {
    dataPath = "data.data",
    codePath = "data.code",
    successCode = 0,
  } = options ?? {};

  try {
    const res = await request();
    if (res == null) return [];

    // 校验响应码（宽松比较，兼容字符串 "0" 和数字 0）
    const code = getNestedValue(res, codePath);
    if (code !== undefined && code !== null && code != successCode) {
      return [];
    }

    // 提取数据数组
    const raw = getNestedValue(res, dataPath);
    const data: T[] = Array.isArray(raw) ? raw : raw != null ? [raw] : [];

    // 字段映射
    return data.map((item) => mapItemToSelectOption(item, mapping));
  } catch (err) {
    console.warn("[createDataAdapter] 请求失败:", err);
    return [];
  }
}

// ──────────────────────────────────────────────
// 公开 API
// ──────────────────────────────────────────────

/**
 * 创建无参数数据适配器
 *
 * 用于 loadAppList、loadRolesList、loadDbList 等不需要参数的回调场景。
 * 自动处理：Promise 包装、响应码校验、数据提取、字段映射。
 *
 * @example
 * ```ts
 * loadAppList: createDataAdapter(
 *   () => loadSystemInfo(params, url),
 *   { name: 'sysName', value: 'idInformations' },
 * ),
 *
 * loadRolesList: createDataAdapter(
 *   () => loadRolesInfo([]),
 *   { name: 'roleName', value: 'idRolesinfo' },
 * ),
 * ```
 */
export function createDataAdapter<T = any>(
  /** 发起请求的函数，返回任意 Promise */
  request: () => Promise<any>,
  /** 字段映射配置 */
  mapping: FieldMapping<T>,
  /** 可选的响应解析配置 */
  options?: DataAdapterOptions,
): () => Promise<SelectOption[]> {
  return () => fetchAndMap(request, mapping, options);
}

/**
 * 创建带参数的数据适配器
 *
 * 用于 loadDicts、loadMenuList、loadTableColumns 等需要参数的回调场景。
 * 自动处理：参数透传、Promise 包装、响应码校验、数据提取、字段映射。
 *
 * @example
 * ```ts
 * loadDicts: createParamDataAdapter(
 *   (dictName) => postRequest('/api/dict', { fieldList: [{ propertyName: 'dictType', value: dictName }] }),
 *   { name: 'dictName', value: 'dictCode' },
 * ),
 *
 * loadTableColumns: createParamDataAdapter(
 *   (tableName) => getRequest(`/api/columns/${dsId}/${tableName}`),
 *   { name: 'comment', value: 'fieldName' },
 * ),
 *
 * loadMenuList: createParamDataAdapter(
 *   (appId) => permissionMenus({}, appId),
 *   { name: 'menuName', value: 'idMenusinfo' },
 *   { dataPath: 'data.data' },
 * ),
 * ```
 */
export function createParamDataAdapter<T = any>(
  /** 发起请求的函数，接收一个字符串参数 */
  request: (param: string) => Promise<any>,
  /** 字段映射配置 */
  mapping: FieldMapping<T>,
  /** 可选的响应解析配置 */
  options?: DataAdapterOptions,
): (param: string) => Promise<SelectOption[]> {
  return (param: string) => {
    if (!param) return Promise.resolve([]);
    return fetchAndMap(() => request(param), mapping, options);
  };
}

/**
 * 创建双参数数据适配器
 *
 * 用于 loadTableColumns 等需要两个参数的回调场景。
 * 自动处理：参数透传、Promise 包装、响应码校验、数据提取、字段映射。
 *
 * @example
 * ```ts
 * loadTableColumns: createBiParamDataAdapter(
 *   (dataSourceId, tableName) => getRequest(`/api/columns/${dataSourceId}/${tableName}`),
 *   { name: 'comment', value: 'fieldName' },
 * ),
 * ```
 */
export function createBiParamDataAdapter<T = any>(
  /** 发起请求的函数，接收两个字符串参数 */
  request: (param1: string, param2: string) => Promise<any>,
  /** 字段映射配置 */
  mapping: FieldMapping<T>,
  /** 可选的响应解析配置 */
  options?: DataAdapterOptions,
): (param1: string, param2: string) => Promise<SelectOption[]> {
  return (param1: string, param2: string) => {
    if (!param1 || !param2) return Promise.resolve([]);
    return fetchAndMap(() => request(param1, param2), mapping, options);
  };
}
