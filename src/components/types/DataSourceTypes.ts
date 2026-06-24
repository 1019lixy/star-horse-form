import type {SelectOption} from "star-horse-lowcode";

// ═══════════════════════════════════════════════════════════════
// 数据源类型定义
// ═══════════════════════════════════════════════════════════════

/** 数据源类型枚举 */
export type DataSourceType = "data" | "url" | "dict" | "thirdParty";

/** 静态数据分析方式 */
export type AnalysisType = "path" | "func";

/** HTTP 请求方法 */
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

/** 请求数据格式 */
export type DataType = "JSON" | "FORM" | "XML";

/** 协议类型 */
export type Protocol = "http" | "https";

/** 响应模板类型 */
export type ResponseTemplate =
    | "result_data"
    | "result_data_list"
    | "result_data_map"
    | "map"
    | "list";

/** 认证类型 */
export type AuthType = "none" | "login" | "basic" | "bearer" | "custom";

/** 参数值类型（静态/动态） */
export type ValueType = "static" | "dynamic";

/** 类型转换选项 */
export type TypeConvert = "string" | "number" | "boolean" | "array";

/** 查询匹配类型 */
export type MatchType =
    | "eq"
    | "neq"
    | "like"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "isnull"
    | "notnull"
    | "in"
    | "between";

/** 联动触发事件类型 */
export type TriggerEvent = "change" | "input" | string;

// ═══════════════════════════════════════════════════════════════
// 静态数据源 (dataSource = "data")
// ═══════════════════════════════════════════════════════════════

/** 静态数据源配置 */
export interface StaticDataSource {
    /** 数据源类型，固定为 "data" */
    dataSource: "data";
    /** 数据分析方式 */
    analysisType: AnalysisType;
    /** 分析值（路径或函数名） */
    analysisValue: string;
    /** 静态选项数据 */
    values: SelectOption[];
    /** 选项标签字段名（用于表单展示） */
    label?: string;
}

// ═══════════════════════════════════════════════════════════════
// 内部接口数据源 (dataSource = "url")
// ═══════════════════════════════════════════════════════════════

/** 查询参数 */
export interface QueryParam {
    /** 参数名 */
    name: string;
    /** 匹配方式 */
    matchType: MatchType;
    /** 参数值 */
    value: string;
}

/** 内部接口数据源配置 */
export interface InternalApiDataSource {
    /** 数据源类型，固定为 "url" */
    dataSource: "url";
    /** 服务名 */
    host: string;
    /** 接口名 */
    interfaceName: string;
    /** 方法名 */
    method: string;
    /** 是否走网关转发 */
    redirect: boolean;
    /** HTTP 方法 */
    httpMethod: HttpMethod;
    /** 协议 */
    protocol: Protocol;
    /** 请求地址 */
    url: string;
    /** 标签字段 */
    selectLabel: string;
    /** 值字段 */
    selectValue: string;
    /** 查询参数列表 */
    queryParams: QueryParam[];
    /** 自定义参数（JSON 字符串） */
    customParams: string;
    /** 选项标签字段名 */
    label?: string;
}

// ═══════════════════════════════════════════════════════════════
// 字典数据源 (dataSource = "dict")
// ═══════════════════════════════════════════════════════════════

/** 字典数据源配置 */
export interface DictDataSource {
    /** 数据源类型，固定为 "dict" */
    dataSource: "dict";
    /** 字典编码 */
    urlOrDictName: string;
    /** 选项标签字段名 */
    label?: string;
}

// ═══════════════════════════════════════════════════════════════
// 第三方接口数据源 (dataSource = "thirdParty")
// ═══════════════════════════════════════════════════════════════

/** 请求头配置 */
export interface ApiHeader {
    /** 请求头名称 */
    name: string;
    /** 请求头值 */
    value: string;
    /** 值类型 */
    valueType: ValueType;
}

/** 请求参数配置 */
export interface ApiRequestParam {
    /** 参数名 */
    paramName: string;
    /** 参数值 */
    paramValue: string;
    /** 值类型 */
    valueType: ValueType;
}

/** 第三方接口 - 请求配置 */
export interface ApiSourceRequest {
    /** 请求地址 */
    url: string;
    /** HTTP 方法 */
    httpMethod: HttpMethod;
    /** 数据格式 */
    dataType: DataType;
    /** 协议 */
    protocol: Protocol;
    /** 主机地址 */
    host: string;
    /** 端口 */
    port: number;
    /** 环境标识 */
    env: string;
    /** 请求头列表 */
    headers: ApiHeader[];
    /** 请求参数列表 */
    requestParams: ApiRequestParam[];
    /** 自定义请求体（JSON 字符串） */
    customBody: string;
}

/** 第三方接口 - 响应配置 */
export interface ApiSourceResponse {
    /** 响应模板 */
    responseTemplate: ResponseTemplate;
    /** 成功码 */
    successCode: string | number;
    /** 状态码路径 */
    codePath: string;
    /** 数据路径 */
    dataPath: string;
    /** 选项标签字段 */
    labelField: string;
    /** 选项值字段 */
    valueField: string;
}

/** 第三方接口 - 认证配置 */
export interface ApiSourceAuth {
    /** 认证类型 */
    authType: AuthType;
    /** 登录地址（authType = "login"） */
    loginUrl?: string;
    /** 登录方法（authType = "login"） */
    loginMethod?: HttpMethod;
    /** 登录账号（authType = "login"） */
    loginAccount?: string;
    /** 登录密码（authType = "login"） */
    loginPassword?: string;
    /** 登录参数（JSON 字符串，authType = "login"） */
    loginParams?: string;
    /** Token 路径（authType = "login"） */
    loginTokenPath?: string;
    /** Token 请求头名称（authType = "login"） */
    loginHeaderName?: string;
    /** Basic 用户名（authType = "basic"） */
    basicUsername?: string;
    /** Basic 密码（authType = "basic"） */
    basicPassword?: string;
    /** Bearer Token（authType = "bearer"） */
    bearerToken?: string;
    /** 自定义请求头（JSON 字符串，authType = "custom"） */
    customHeaders?: string;
}

/** 第三方接口数据源完整配置 */
export interface ThirdPartyDataSource {
    /** 请求配置 */
    apiSourceRequest: ApiSourceRequest;
    /** 响应配置 */
    apiSourceResponse: ApiSourceResponse;
    /** 认证配置 */
    apiSourceAuth: ApiSourceAuth;
}

// ═══════════════════════════════════════════════════════════════
// 统一数据源类型（兼容所有类型）
// ═══════════════════════════════════════════════════════════════

/** 统一数据源配置 - 兼容所有数据源类型 */
export interface UnifiedDataSource {
    /** 数据源类型 */
    dataSource: DataSourceType;
    /** 选项标签字段名 */
    label?: string;

    // ── 静态数据字段 (dataSource = "data") ──
    analysisType?: AnalysisType;
    analysisValue?: string;
    values?: SelectOption[];

    // ── 内部接口字段 (dataSource = "url") ──
    host?: string;
    interfaceName?: string;
    method?: string;
    redirect?: boolean;
    httpMethod?: HttpMethod;
    protocol?: Protocol;
    url?: string;
    selectLabel?: string;
    selectValue?: string;
    queryParams?: QueryParam[];
    customParams?: string;

    // ── 字典字段 (dataSource = "dict") ──
    urlOrDictName?: string;

    // ── 第三方接口字段 (dataSource = "thirdParty") ──
    apiDataSource?: ThirdPartyDataSource;
}

// ═══════════════════════════════════════════════════════════════
// 联动策略类型定义
// ═══════════════════════════════════════════════════════════════

/** 可见性规则 - 条件配置 */
export interface VisibilityCondition {
    /** 被控制字段名 */
    fieldName: string;
    /** 匹配方式 */
    matchType: MatchType;
    /** 匹配值 */
    value: string;
}

/** 可见性规则配置 */
export interface VisibilityRule {
    /** 联动动作名 */
    actionName: string;
    /** 控制条件 */
    controlCondition: string;
    /** 关联字段列表 */
    relationFields: string[];
    /** 匹配值 */
    matchFieldValue: string | string[];
}

/** 可见性联动配置（dataRelation） */
export interface DataRelation {
    /** 联动规则列表 */
    relationDetails: VisibilityRule[];

    [key: string]: any;
}

// ═══════════════════════════════════════════════════════════════
// 接口联动类型定义 (apiLinkage)
// ═══════════════════════════════════════════════════════════════

/** 字段映射配置 */
export interface FieldMapping {
    /** 源字段（接口返回数据中的字段名） */
    sourceField: string;
    /** 目标字段（表单字段名） */
    targetField: string;
    /** 类型转换 */
    typeConvert?: TypeConvert;
    /** 转换表达式 */
    transform?: string;
}

/** 接口联动 - 请求配置 */
export interface ApiLinkageRequest {
    /** 请求地址 */
    url: string;
    /** HTTP 方法 */
    httpMethod: HttpMethod;
    /** 数据格式 */
    dataType: DataType;
    /** 协议 */
    protocol: Protocol;
    /** 主机地址 */
    host: string;
    /** 端口 */
    port: number;
    /** 环境标识 */
    env: string;
    /** 超时时间（秒） */
    timeout: number;
    /** Nacos 服务名 */
    serviceName: string;
    /** 请求参数列表 */
    requestParams: ApiRequestParam[];
    /** 自定义请求体（JSON 字符串） */
    body: string;
}

/** 接口联动 - 响应配置 */
export interface ApiLinkageResponse {
    /** 响应模板 */
    responseTemplate: ResponseTemplate;
    /** 成功码 */
    successCode: string | number;
    /** 状态码路径 */
    codePath: string;
    /** 数据路径 */
    dataPath: string;
    /** 消息路径 */
    messagePath: string;
    /** 字段映射列表 */
    fieldMappings: FieldMapping[];
}

/** 接口联动 - 认证配置 */
export interface ApiLinkageAuth {
    /** 认证类型 */
    authType: AuthType;
    /** 认证信息（后端存储格式，根据 authType 不同而不同） */
    authInfo?: Record<string, any> | null;
    /** 登录地址（authType = "login"） */
    loginUrl?: string;
    /** 登录方法（authType = "login"） */
    loginMethod?: HttpMethod;
    /** 登录账号（authType = "login"） */
    loginAccount?: string;
    /** 登录密码（authType = "login"） */
    loginPassword?: string;
    /** 登录参数（JSON 字符串，authType = "login"） */
    loginParams?: string;
    /** Token 路径（authType = "login"） */
    loginTokenPath?: string;
    /** Token 请求头名称（authType = "login"） */
    loginHeaderName?: string;
    /** Basic 用户名（authType = "basic"） */
    basicUsername?: string;
    /** Basic 密码（authType = "basic"） */
    basicPassword?: string;
    /** Bearer Token（authType = "bearer"） */
    bearerToken?: string;
    /** 自定义请求头（JSON 字符串，authType = "custom"） */
    customHeaders?: string;
    /** 非认证自定义请求头（JSON 字符串） */
    headers?: string | Record<string, any>;
}

/** 接口联动触发配置 */
export interface ApiLinkageTrigger {
    /** 触发事件 */
    triggerEvent: TriggerEvent;
}

/** 接口联动完整配置 */
export interface ApiLinkage {
    /** 触发配置 */
    triggerConfig?: ApiLinkageTrigger;
    /** 请求配置 */
    basic?: ApiLinkageRequest;
    /** 响应配置 */
    response?: ApiLinkageResponse;
    /** 认证配置 */
    auth?: ApiLinkageAuth;
}

// ═══════════════════════════════════════════════════════════════
// 统一联动策略类型
// ═══════════════════════════════════════════════════════════════

/** 统一联动策略配置 */
export interface UnifiedLinkage {
    /** 可见性联动规则 */
    dataRelation?: DataRelation;
    /** 接口联动配置 */
    apiLinkage?: ApiLinkage;
}

// ═══════════════════════════════════════════════════════════════
// 表单属性中的数据源 & 联动字段（挂载在 formProps 上）
// ═══════════════════════════════════════════════════════════════

/** 表单属性中数据源与联动相关字段 */
export interface FormPropsDataSourceMixin {
    /** 数据源类型 */
    dataSource?: DataSourceType;
    /** 选项标签字段名 */
    label?: string;

    // ── 静态数据 ──
    analysisType?: AnalysisType;
    analysisValue?: string;
    values?: SelectOption[];

    // ── 内部接口 ──
    host?: string;
    interfaceName?: string;
    method?: string;
    redirect?: boolean;
    httpMethod?: HttpMethod;
    protocol?: Protocol;
    url?: string;
    selectLabel?: string;
    selectValue?: string;
    queryParams?: QueryParam[];
    customParams?: string;

    // ── 字典 ──
    urlOrDictName?: string;

    // ── 第三方接口数据源 ──
    apiDataSource?: ThirdPartyDataSource;

    // ── 联动策略 ──
    dataRelation?: DataRelation;
    apiLinkage?: ApiLinkage;
}

/** 数据源类型选项（用于 UI 展示） */
export interface DataSourceTypeOption {
    value: DataSourceType;
    label: string;
    icon: string;
    desc: string;
}

// ═══════════════════════════════════════════════════════════════
// 配置模板持久化类型定义
// ═══════════════════════════════════════════════════════════════

/** 配置模板分类 */
export type ConfigTemplateCategory = "staticData" | "thirdPartyDataSource" | "apiLinkage";

/** 配置模板存储位置 */
export type ConfigTemplateStorage = "local" | "database";

/** 配置模板 */
export interface ConfigTemplate {
    /** 模板ID */
    id: string;
    /** 模板名称 */
    name: string;
    /** 模板分类 */
    category: ConfigTemplateCategory;
    /** 模板描述 */
    description?: string;
    /** 存储位置 */
    storage: ConfigTemplateStorage;
    /** 模板配置数据（JSON） */
    configData: Record<string, any>;
    /** 创建时间 */
    createdTime?: string;
    /** 更新时间 */
    updatedTime?: string;
    /** 创建人 */
    createdBy?: string;
}

/** 保存模板请求参数 */
export interface SaveTemplateParams {
    /** 模板名称 */
    name: string;
    /** 模板分类 */
    category: ConfigTemplateCategory;
    /** 模板描述 */
    description?: string;
    /** 存储位置 */
    storage: ConfigTemplateStorage;
    /** 模板配置数据 */
    configData: Record<string, any>;
}

/** 模板分类选项（用于 UI 展示） */
export interface ConfigTemplateCategoryOption {
    value: ConfigTemplateCategory;
    label: string;
    icon: string;
    desc: string;
}
