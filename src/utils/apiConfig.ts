// 通用接口调用参数配置
import {httpMethod} from '@/api/system';
import {SelectOption} from 'star-horse-lowcode';

/**
 * 协议选项
 */
export const protocolOptions: SelectOption[] = [
    {name: 'HTTP', value: 'http'},
    {name: 'HTTPS', value: 'https'},
];

/**
 * 创建通用接口调用参数配置
 * 这些参数包括：系统环境、请求方式、协议、IP/域名/服务名、端口、接口地址
 */
export function createApiConfigProperties() {
    return [
        {
            name: 'env',
            label: '系统环境',
            type: 'select' as const,
            required: true,
            defaultValue: '',
            options: [], // 动态从字典加载
            description: '选择接口调用的系统环境'
        },
        {
            name: 'httpMethod',
            label: '请求方式',
            type: 'select' as const,
            required: true,
            defaultValue: 'POST',
            options: httpMethod(),
            description: '选择HTTP请求方式'
        },
        {
            name: 'protocol',
            label: '协议',
            type: 'select' as const,
            required: true,
            defaultValue: 'http',
            options: protocolOptions,
            description: '选择通信协议'
        },
        {
            name: 'host',
            label: 'IP/域名/服务名',
            type: 'input' as const,
            required: true,
            defaultValue: '',
            placeholder: '请输入IP地址、域名或服务名',
            description: '接口服务器的IP地址、域名或服务名'
        },
        {
            name: 'port',
            label: '端口',
            type: 'number' as const,
            required: false,
            defaultValue: '',
            min: 1,
            max: 65535,
            description: '接口服务器端口号'
        },
        {
            name: 'interfaceUrl',
            label: '接口地址',
            type: 'input' as const,
            required: true,
            defaultValue: '',
            placeholder: '请输入接口路径，如：/api/data/list',
            description: '接口的相对路径'
        },
        // Add periodic refresh configuration
        {
            name: 'enableAutoRefresh',
            label: '启用定时刷新',
            type: 'switch' as const,
            defaultValue: false,
            description: '是否启用定时自动刷新数据'
        },
        {
            name: 'refreshInterval',
            label: '刷新间隔(秒)',
            type: 'number' as const,
            required: false,
            defaultValue: 30,
            min: 5,
            max: 3600,
            description: '自动刷新数据的时间间隔，单位为秒',
            // Only show when auto refresh is enabled
            condition: (formData: any) => formData.enableAutoRefresh
        }
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
    const {protocol, host, port, interfaceUrl} = apiConfig;
    const portPart = port ? `:${port}` : '';
    return `${protocol}://${host}${portPart}${interfaceUrl}`;
}

/**
 * 验证API配置是否完整有效
 * @param apiConfig 接口配置对象
 * @returns 验证结果和错误信息
 */
export function validateApiConfig(apiConfig: Partial<ApiConfig>): { valid: boolean; error?: string } {
    if (!apiConfig.env) {
        return {valid: false, error: '请选择系统环境'};
    }

    if (!apiConfig.httpMethod) {
        return {valid: false, error: '请选择请求方式'};
    }

    if (!apiConfig.protocol) {
        return {valid: false, error: '请选择协议'};
    }

    if (!apiConfig.host) {
        return {valid: false, error: '请输入IP/域名/服务名'};
    }

    if (apiConfig.port && (isNaN(Number(apiConfig.port)) || Number(apiConfig.port) < 1 || Number(apiConfig.port) > 65535)) {
        return {valid: false, error: '端口号必须在1-65535之间'};
    }

    if (!apiConfig.interfaceUrl) {
        return {valid: false, error: '请输入接口地址'};
    }

    // Validate refresh configuration if enabled
    if (apiConfig.enableAutoRefresh) {
        if (!apiConfig.refreshInterval || apiConfig.refreshInterval < 5 || apiConfig.refreshInterval > 3600) {
            return {valid: false, error: '刷新间隔必须在5-3600秒之间'};
        }
    }

    return {valid: true};
}
