/**
 * 全局可配置端点
 *
 * 无状态 lib 库原则：所有后端交互路径必须可配置注入，
 * 不硬编码任何业务特定接口。
 *
 * 使用方式：在项目入口 main.ts 中按需调用配置函数覆盖默认值。
 * 默认值为示例路径，仅保证开箱可用，生产环境应根据实际后端调整。
 */
import type {ApiUrls} from "star-horse-lowcode";

/** 全局配置快照（只读） */
export interface AppEndpoints {
  /** WebSocket 端点（SockJS），默认 /api/ws/form */
  wsEndpoint: string;
  /** 网关重定向前缀（含前导 /），默认 /system-config/redirect */
  redirectPrefix: string;
  /** 接口联动代理 URL，默认 /system-config/redirect/apiLinkage */
  apiLinkageProxyUrl: string;
  /** 接口执行代理 URL，默认 /system-config/redirect/execute */
  executeProxyUrl: string;
  /** 内部服务列表接口，默认 /userdb-manage/redirect/api/service/list */
  serviceListUrl: string;
  /** 数据字典分页列表接口，默认 /system-config/system/dictinfoType/pageList */
  dictPageListUrl: string;
  /** 表单设计器分页列表请求 URL，默认 userdb-manage/userdb/dynamicForm/pageList */
  formDesignPageListUrl: string;
  /** 表单设计器基础路径（无前导/，供 getById 等操作拼接），默认 userdb-manage/userdb/dynamicForm */
  formDesignBaseUrl: string;
  /** 网关前缀（含前导 /，用于 URL 拼接），默认 /userdb-manage */
  gatewayPrefix: string;
  /** 网关服务名（无前导 /，用于 apiInstance 函数），默认 userdb-manage */
  gatewayServiceName: string;
}

let endpoints: AppEndpoints = {
  wsEndpoint: "/api/ws/form",
  redirectPrefix: "/system-config/redirect",
  apiLinkageProxyUrl: "/system-config/redirect/apiLinkage",
  executeProxyUrl: "/system-config/redirect/execute",
  serviceListUrl: "/userdb-manage/redirect/api/service/list",
  dictPageListUrl: "/system-config/system/dictinfoType/pageList",
  formDesignPageListUrl: "userdb-manage/userdb/dynamicForm/pageList",
  formDesignBaseUrl: "userdb-manage/userdb/dynamicForm",
  gatewayPrefix: "/userdb-manage",
  gatewayServiceName: "userdb-manage",
};

/**
 * 配置全局 API 端点（无状态注入）
 *
 * 仅需覆盖与默认不同的端点即可，未传入的保持默认值。
 *
 * @example
 * ```ts
 * import { configureAppEndpoints } from "star-horse-form";
 * configureAppEndpoints({
 *   gatewayPrefix: "/my-gateway",
 *   apiLinkageProxyUrl: "/my-gateway/redirect/apiLinkage",
 *   executeProxyUrl: "/my-gateway/redirect/execute",
 * });
 * ```
 */
export function configureAppEndpoints(
  partial: Partial<AppEndpoints>,
): void {
  Object.assign(endpoints, partial);
}

/** 获取当前全局端点配置（只读） */
export function getAppEndpoints(): Readonly<AppEndpoints> {
  return { ...endpoints };
}

// ═══════════════════════════════════════════════════════
// 兼容性 sink — 供各模块按需读取
// ═══════════════════════════════════════════════════════

export const appEndpoints: Readonly<AppEndpoints> = endpoints;