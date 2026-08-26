/**
 * 统一 HTTP 客户端组件
 *
 * 以数据源中的第三方接口为基准，统一封装 lib 中的多套 HTTP 调用逻辑：
 *   1. 数据源（DataSource）  — 第三方接口数据加载
 *   2. 联动策略（Linkage）   — 接口回填
 *   3. 规则引擎 http-call 节点 — 流程中发起 API 请求
 *
 * 核心职责：
 *   - 统一请求配置（URL / 方法 / 请求头 / 查询参数 / 请求体 / 认证 / 超时 / 重试 / 代理）
 *   - 模板解析（${fieldName} → 上下文赋值）
 *   - 响应解析（状态码校验 → 数据路径提取 → 字段映射 / 标签值字段）
 *   - 代理模式（通过后端代理转发，前端无需直接暴露接口地址）
 *
 * 用法示例：
 *
 *   // 数据源模式
 *   const { data, options } = await httpClient.execute(requestConfig, responseConfig, {
 *     formData: {},
 *     dataSourceLabelField: 'name',
 *     dataSourceValueField: 'id',
 *   });
 *
 *   // 联动 / 规则引擎模式
 *   const { success, data, mappedFields } = await httpClient.execute(requestConfig, responseConfig, {
 *     formData: { amount: 5000, name: 'demo' },
 *     extraContext: { __triggerEvent: 'ON_CHANGE' },
 *   });
 */

import type { SelectOption } from "star-horse-lowcode";

// ═══════════════════════════════════════════════════════════════
// 一级：基础类型（对外公开，供各模块引用）
// ═══════════════════════════════════════════════════════════════

/** HTTP 方法 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** 参数值类型 */
export type ParamValueType = "static" | "dynamic";

/** 通用请求参数项（请求头 / 查询参数共用） */
export interface HttpParam {
  /** 参数名（header 名 或 query 参数名） */
  paramName: string;
  /** 参数值（static 模式填原始值，dynamic 模式填表单字段名） */
  paramValue: string;
  /** 值类型 */
  valueType: ParamValueType;
}

/** 认证类型 */
export type AuthType = "none" | "login" | "basic" | "bearer" | "custom";

/** 认证配置 */
export interface HttpAuthConfig {
  /** 认证类型 */
  authType: AuthType;
  /** 登录地址（login） */
  loginUrl?: string;
  /** 登录方法（login） */
  loginMethod?: HttpMethod;
  /** 登录账号（login） */
  loginAccount?: string;
  /** 登录密码（login） */
  loginPassword?: string;
  /** Token 提取路径（login） */
  loginTokenPath?: string;
  /** Token 请求头名称（login） */
  loginHeaderName?: string;
  /** Basic 用户名（basic） */
  basicUsername?: string;
  /** Basic 密码（basic） */
  basicPassword?: string;
  /** Bearer Token 值（bearer） */
  bearerToken?: string;
  /** 自定义请求头 JSON 字符串（custom） */
  customHeaders?: string;
}

// ═══════════════════════════════════════════════════════════════
// 请求 / 响应配置
// ═══════════════════════════════════════════════════════════════

/** HTTP 请求配置 */
export interface HttpRequestConfig {
  /** 请求地址（支持 ${fieldName} 模板） */
  url: string;
  /** HTTP 方法，默认 GET */
  httpMethod?: HttpMethod;
  /** 请求头列表 */
  headers?: HttpParam[];
  /** 查询参数列表 */
  requestParams?: HttpParam[];
  /** 请求体（JSON 字符串或对象，支持 ${fieldName} 模板） */
  body?: string | Record<string, any>;
  /** 超时时间（毫秒），默认 10000 */
  timeout?: number;
  /** 重试次数，默认 0 */
  retryCount?: number;
  /** 认证配置 */
  auth?: HttpAuthConfig;
  /** 是否走代理转发，默认 true */
  proxyEnabled?: boolean;
  /** 代理接口地址，默认 /system-config/redirect/apiLinkage */
  proxyUrl?: string;
}

/** HTTP 响应配置 */
export interface HttpResponseConfig {
  /** 成功状态码（数字或字符串），默认 "200" */
  successCode?: string | number;
  /** 状态码路径（用于从响应体中提取 code），默认 "code" */
  codePath?: string;
  /** 消息路径，默认 "message" */
  messagePath?: string;
  /** 数据提取路径（用于从响应体中提取 data），默认 "data" */
  dataPath?: string;
  /** 字段映射列表（联动/规则引擎用） */
  fieldMappings?: FieldMapping[];
  /** 数据源模式：标签字段名 */
  labelField?: string;
  /** 数据源模式：值字段名 */
  valueField?: string;
}

/** 字段映射 */
export interface FieldMapping {
  /** 响应数据中的源字段名 */
  sourceField: string;
  /** 目标字段名（表单字段名 / 上下文变量名） */
  targetField: string;
  /** 类型转换 */
  typeConvert?: "string" | "number" | "boolean" | "array";
}

// ═══════════════════════════════════════════════════════════════
// 执行上下文 & 结果
// ═══════════════════════════════════════════════════════════════

/** 执行上下文（模板解析用） */
export interface HttpCallContext {
  /** 表单数据（用于模板解析 & 动态参数替换） */
  formData?: Record<string, any>;
  /** 额外上下文（规则引擎执行时的变量等） */
  extraContext?: Record<string, any>;
}

/** 统一 HTTP 调用结果 */
export interface HttpCallResult<T = any> {
  /** 调用是否成功（网络可达 + 状态码匹配） */
  success: boolean;
  /** 业务状态码 */
  code: string | number;
  /** 响应消息 */
  message: string;
  /** 按 dataPath 提取后的数据 */
  data: T;
  /** 原始响应体 */
  raw: any;
  /** 数据源模式：按 labelField/valueField 转换的选项列表 */
  options?: SelectOption[];
  /** 联动 / 规则引擎模式：按 fieldMappings 映射后的字段值 */
  mappedFields?: Record<string, any>;
}

// ═══════════════════════════════════════════════════════════════
// 模板解析工具
// ═══════════════════════════════════════════════════════════════

/** 解析 ${field} 模板，从上下文替换值 */
const resolveTemplate = (
  template: string,
  ctx: Record<string, any>,
): string => {
  if (!template || typeof template !== "string" || !template.includes("${")) {
    return template;
  }
  return template.replace(/\$\{([^}]+)\}/g, (_, key: string) => {
    const v = resolveByPath(ctx, key.trim());
    return v === undefined || v === null ? "" : String(v);
  });
};

/** 按 a.b.c 点路径取值 */
const resolveByPath = (obj: any, path: string): any => {
  if (obj == null || !path) return undefined;
  const parts = path.split(".");
  let cur = obj;
  for (const p of parts) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[p];
  }
  return cur;
};

/** 深度解析对象中的模板字符串 */
const resolveBody = (
  body: any,
  ctx: Record<string, any>,
): any => {
  if (typeof body === "string") return resolveTemplate(body, ctx);
  if (Array.isArray(body)) return body.map((item) => resolveBody(item, ctx));
  if (body && typeof body === "object") {
    const result: Record<string, any> = {};
    for (const [k, v] of Object.entries(body)) {
      result[k] = resolveBody(v, ctx);
    }
    return result;
  }
  return body;
};

// ═══════════════════════════════════════════════════════════════
// 请求构建
// ═══════════════════════════════════════════════════════════════

/**
 * 解析参数列表中的 dynamic 参数值并返回扁平 key-value
 */
const resolveParamValues = (
  params: HttpParam[],
  ctx: Record<string, any>,
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const p of params) {
    if (!p.paramName) continue;
    let val: string;
    if (p.valueType === "dynamic") {
      val = String(resolveByPath(ctx, p.paramValue) ?? "");
    } else {
      val = p.paramValue ?? "";
    }
    result[p.paramName] = val;
  }
  return result;
};

/**
 * 构建带查询参数的完整 URL
 */
const buildUrl = (
  baseUrl: string,
  requestParams: HttpParam[] | undefined,
  ctx: Record<string, any>,
): string => {
  const resolved = resolveTemplate(baseUrl, ctx);
  if (!requestParams || requestParams.length === 0) return resolved;
  const paramValues = resolveParamValues(requestParams, ctx);
  const qs = Object.entries(paramValues)
    .filter(([, v]) => v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  if (!qs) return resolved;
  return resolved + (resolved.includes("?") ? "&" : "?") + qs;
};

/**
 * 构建请求头 Record
 * 1. 从 headers 参数构建
 * 2. 根据 auth 认证配置追加认证头
 */
const buildHeaders = (
  config: HttpRequestConfig,
  ctx: Record<string, any>,
): Record<string, string> => {
  const headers: Record<string, string> = {};

  // 用户自定义请求头
  if (config.headers && config.headers.length > 0) {
    Object.assign(headers, resolveParamValues(config.headers, ctx));
  }

  // 认证
  const auth = config.auth;
  if (auth && auth.authType) {
    switch (auth.authType) {
      case "bearer":
        if (auth.bearerToken) {
          headers["Authorization"] = `Bearer ${auth.bearerToken}`;
        }
        break;
      case "basic":
        if (auth.basicUsername || auth.basicPassword) {
          const cred = btoa(
            `${auth.basicUsername ?? ""}:${auth.basicPassword ?? ""}`,
          );
          headers["Authorization"] = `Basic ${cred}`;
        }
        break;
      case "custom":
        if (auth.customHeaders) {
          try {
            const custom = JSON.parse(auth.customHeaders);
            Object.assign(headers, custom);
          } catch {
            // ignore parse error
          }
        }
        break;
      case "login":
        // login 类型需要先调用登录接口获取 token，此处略（由上层处理）
        break;
      default:
        break;
    }
  }

  // 默认 Content-Type
  if (!headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json; charset=utf-8";
  }

  return headers;
};

// ═══════════════════════════════════════════════════════════════
// 响应解析
// ═══════════════════════════════════════════════════════════════

/**
 * 从响应体中提取 code / message / data
 */
const parseResponse = (
  rawResponse: any,
  config: HttpResponseConfig,
): { code: string | number; message: string; data: any } => {
  const codePath = config.codePath || "code";
  const messagePath = config.messagePath || "message";
  const dataPath = config.dataPath || "data";

  const body = rawResponse?.data ?? rawResponse;
  const code =
    resolveByPath(body, codePath) ??
    rawResponse?.code ??
    rawResponse?.status ??
    "";
  const message =
    resolveByPath(body, messagePath) ??
    rawResponse?.cnMessage ??
    rawResponse?.message ??
    "";
  const data = resolveByPath(body, dataPath) ?? body ?? null;

  return { code, message, data };
};

/**
 * 校验状态码是否匹配成功码
 */
const isCodeSuccess = (code: string | number, successCode: string | number): boolean => {
  const codeStr = String(code);
  const successStr = String(successCode);
  return (
    codeStr === successStr ||
    codeStr === "200" ||
    codeStr === "0" ||
    codeStr === "success"
  );
};

/**
 * 对提取的 data 做字段映射
 */
const applyFieldMappings = (
  data: any,
  mappings: FieldMapping[],
): Record<string, any> => {
  const mapped: Record<string, any> = {};
  if (!data || !mappings.length) return mapped;
  for (const m of mappings) {
    if (!m.sourceField || !m.targetField) continue;
    let val = resolveByPath(data, m.sourceField);
    if (val === undefined || val === null) continue;
    switch (m.typeConvert) {
      case "string":
        val = String(val);
        break;
      case "number":
        val = Number(val);
        break;
      case "boolean":
        val = val === true || val === "true" || val === 1;
        break;
      case "array":
        val = Array.isArray(val) ? val : [val];
        break;
      default:
        break;
    }
    mapped[m.targetField] = val;
  }
  return mapped;
};

/**
 * 将 data 按 labelField / valueField 转为 SelectOption[]
 */
const buildOptions = (
  data: any,
  labelField: string,
  valueField: string,
): SelectOption[] => {
  if (!data) return [];
  const list = Array.isArray(data) ? data : [data];
  return list
    .filter((item: any) => item != null)
    .map((item: any) => ({
      name: String(
        resolveByPath(item, labelField) ??
          item["name"] ??
          item["label"] ??
          "",
      ),
      value:
        resolveByPath(item, valueField) ??
        item["value"] ??
        item["id"] ??
        item,
    }));
};

// ═══════════════════════════════════════════════════════════════
// 核心执行函数
// ═══════════════════════════════════════════════════════════════

/**
 * 发送 HTTP 请求（代理模式：通过后端统一代理转发）
 *
 * @param reqConfig  请求配置（url / 方法 / params / headers / body / auth）
 * @param respConfig 响应配置（状态码路径 / 数据路径 / 映射规则）
 * @param context    执行上下文（表单数据 / 规则变量等，用于模板解析）
 * @returns 统一调用结果
 */
const execute = async (
  reqConfig: HttpRequestConfig,
  respConfig: HttpResponseConfig = {},
  context: HttpCallContext = {},
): Promise<HttpCallResult> => {
  const ctx: Record<string, any> = {
    ...(context.extraContext ?? {}),
    ...(context.formData ?? {}),
  };

  const url = buildUrl(reqConfig.url, reqConfig.requestParams, ctx);
  const headers = buildHeaders(reqConfig, ctx);
  const body =
    typeof reqConfig.body === "object"
      ? resolveBody(reqConfig.body, ctx)
      : resolveTemplate(reqConfig.body ?? "", ctx);

  // 构建代理请求负载
  const useProxy = reqConfig.proxyEnabled !== false;
  const proxyUrl = reqConfig.proxyUrl || "/system-config/redirect/apiLinkage";

  const payload: Record<string, any> = {
    url,
    httpMethod: reqConfig.httpMethod || "GET",
    headers: reqConfig.headers ?? [],
    requestParams: reqConfig.requestParams ?? [],
    body: body || null,
    timeout: reqConfig.timeout ?? 10000,
    retryCount: reqConfig.retryCount ?? 0,
    successCode: respConfig.successCode ?? "200",
    codePath: respConfig.codePath ?? "code",
    messagePath: respConfig.messagePath ?? "message",
    dataPath: respConfig.dataPath ?? "data",
    labelField: respConfig.labelField ?? "",
    valueField: respConfig.valueField ?? "",
    fieldMappings: respConfig.fieldMappings ?? [],
  };

  if (reqConfig.auth) {
    payload.authInfo = reqConfig.auth;
  }

  // 发起请求
  let response: any;
  let lastError: Error | null = null;
  const maxRetries = reqConfig.retryCount ?? 0;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (useProxy) {
        // 代理模式：通过后端统一转发
        const { postRequest: proxyRequest } = await import(
          "star-horse-lowcode"
        );
        response = await proxyRequest(proxyUrl, payload);
      } else {
        // 直连模式：前端直接发请求
        const { fetch: rawFetch } = globalThis as any;
        const resp = await rawFetch(url, {
          method: reqConfig.httpMethod || "GET",
          headers,
          body:
            body && (reqConfig.httpMethod || "GET").toUpperCase() !== "GET"
              ? JSON.stringify(body)
              : undefined,
        });
        response = await resp.json();
      }
      break;
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500));
      }
    }
  }

  if (!response) {
    return {
      success: false,
      code: "NETWORK_ERROR",
      message: lastError?.message ?? "网络请求失败",
      data: null,
      raw: null,
      options: [],
      mappedFields: {},
    };
  }

  // 解析响应
  const { code, message, data } = parseResponse(response, respConfig);
  const success = isCodeSuccess(code, respConfig.successCode ?? "200");

  // 构建结果
  const result: HttpCallResult = {
    success,
    code,
    message,
    data,
    raw: response,
    options: [],
    mappedFields: {},
  };

  // 数据源模式：构建选项列表
  if (respConfig.labelField && respConfig.valueField && data) {
    result.options = buildOptions(data, respConfig.labelField, respConfig.valueField);
  }

  // 联动 / 规则引擎模式：字段映射
  if (respConfig.fieldMappings && respConfig.fieldMappings.length > 0 && data) {
    result.mappedFields = applyFieldMappings(data, respConfig.fieldMappings);
  }

  return result;
};

/**
 * 统一 HTTP 客户端
 */
export const httpClient = {
  /** 执行 HTTP 调用（代理模式，通过后端统一转发） */
  execute,

  /** 解析 ${field} 模板 */
  resolveTemplate,

  /** 按点路径从对象中提取值 */
  resolveByPath,

  /** 将 data 数组转为 SelectOption[]（数据源模式） */
  buildOptions,

  /** 对提取的 data 做字段映射（联动模式） */
  applyFieldMappings,
};

export default httpClient;