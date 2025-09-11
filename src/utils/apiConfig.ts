// 通用接口调用参数配置
import { httpMethod } from "@/api/system";
import { SelectOption } from "star-horse-lowcode";
import { i18n } from "@/lang";

/**
 * 协议选项
 */
export const protocolOptions: SelectOption[] = [
  { name: i18n("system.apiConfig.protocolOptions.http"), value: "http" },
  { name: i18n("system.apiConfig.protocolOptions.https"), value: "https" },
];

/**
 * 创建通用接口调用参数配置
 * 这些参数包括：系统环境、请求方式、协议、IP/域名/服务名、端口、接口地址
 */
export function createApiConfigProperties() {
  return [
    {
      name: "env",
      label: i18n("system.apiConfig.createApiConfigProperties.env.label"),
      type: "select" as const,
      required: true,
      defaultValue: "",
      options: [], // 动态从字典加载
      description: i18n("system.apiConfig.createApiConfigProperties.env.description"),
    },
    {
      name: "httpMethod",
      label: i18n("system.apiConfig.createApiConfigProperties.httpMethod.label"),
      type: "select" as const,
      required: true,
      defaultValue: "POST",
      options: httpMethod(),
      description: i18n("system.apiConfig.createApiConfigProperties.httpMethod.description"),
    },
    {
      name: "protocol",
      label: i18n("system.apiConfig.createApiConfigProperties.protocol.label"),
      type: "select" as const,
      required: true,
      defaultValue: "http",
      options: protocolOptions,
      description: i18n("system.apiConfig.createApiConfigProperties.protocol.description"),
    },
    {
      name: "host",
      label: i18n("system.apiConfig.createApiConfigProperties.host.label"),
      type: "input" as const,
      required: true,
      defaultValue: "",
      placeholder: i18n("system.apiConfig.createApiConfigProperties.host.placeholder"),
      description: i18n("system.apiConfig.createApiConfigProperties.host.description"),
    },
    {
      name: "port",
      label: i18n("system.apiConfig.createApiConfigProperties.port.label"),
      type: "number" as const,
      required: false,
      defaultValue: "",
      min: 1,
      max: 65535,
      description: i18n("system.apiConfig.createApiConfigProperties.port.description"),
    },
    {
      name: "interfaceUrl",
      label: i18n("system.apiConfig.createApiConfigProperties.interfaceUrl.label"),
      type: "input" as const,
      required: true,
      defaultValue: "",
      placeholder: i18n("system.apiConfig.createApiConfigProperties.interfaceUrl.placeholder"),
      description: i18n("system.apiConfig.createApiConfigProperties.interfaceUrl.description"),
    },
    // Add periodic refresh configuration
    {
      name: "enableAutoRefresh",
      label: i18n("system.apiConfig.createApiConfigProperties.enableAutoRefresh.label"),
      type: "switch" as const,
      defaultValue: false,
      description: i18n("system.apiConfig.createApiConfigProperties.enableAutoRefresh.description"),
    },
    {
      name: "refreshInterval",
      label: i18n("system.apiConfig.createApiConfigProperties.refreshInterval.label"),
      type: "number" as const,
      required: false,
      defaultValue: 30,
      min: 5,
      max: 3600,
      description: i18n("system.apiConfig.createApiConfigProperties.refreshInterval.description"),
      // Only show when auto refresh is enabled
      condition: (formData: any) => formData.enableAutoRefresh,
    },
  ];
}

/**
 * 接口调用配置类型定义
 */
export interface ApiConfig {
  env: string;
  httpMethod: string;
  protocol: string;
  host: string;
  port: string | number;
  interfaceUrl: string;
  // Add periodic refresh properties
  enableAutoRefresh?: boolean;
  refreshInterval?: number;
}

/**
 * 构建完整的API请求URL
 * @param apiConfig 接口配置对象
 * @returns 完整的URL字符串
 */
export function buildApiUrl(apiConfig: ApiConfig): string {
  const { protocol, host, port, interfaceUrl } = apiConfig;
  const portPart = port ? `:${port}` : "";
  return `${protocol}://${host}${portPart}${interfaceUrl}`;
}

/**
 * 验证API配置是否完整有效
 * @param apiConfig 接口配置对象
 * @returns 验证结果和错误信息
 */
export function validateApiConfig(apiConfig: Partial<ApiConfig>): {
  valid: boolean;
  error?: string;
} {
  if (!apiConfig.env) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.env.error") };
  }

  if (!apiConfig.httpMethod) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.httpMethod.error") };
  }

  if (!apiConfig.protocol) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.protocol.error") };
  }

  if (!apiConfig.host) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.host.error") };
  }

  if (
    apiConfig.port &&
    (isNaN(Number(apiConfig.port)) ||
      Number(apiConfig.port) < 1 ||
      Number(apiConfig.port) > 65535)
  ) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.port.error") };
  }

  if (!apiConfig.interfaceUrl) {
    return { valid: false, error: i18n("system.apiConfig.validateApiConfig.interfaceUrl.error") };
  }

  // Validate refresh configuration if enabled
  if (apiConfig.enableAutoRefresh) {
    if (
      !apiConfig.refreshInterval ||
      apiConfig.refreshInterval < 5 ||
      apiConfig.refreshInterval > 3600
    ) {
      return { valid: false, error: i18n("system.apiConfig.validateApiConfig.refreshInterval.error") };
    }
  }

  return { valid: true };
}