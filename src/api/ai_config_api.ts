import {ApiUrls, getRequest, postRequest} from "star-horse-lowcode";
import {ref} from "vue";

const aiApi = ref<ApiUrls>();

export function initAiConfigApi(api: ApiUrls) {
    aiApi.value = api;
}

export interface AiConfigData {
    idAiConfig?: string;
    profileName: string;
    apiKey: string;
    apiUrl: string;
    model: string;
    maxTokens: number;
    temperature: number;
    timeout: number;
    isActive?: boolean;
}

/**
 * 获取 AI 配置
 */
export function getAiConfig(): Promise<any> {
    const baseUrl = aiApi.value?.appName || "userdb-manage";
    return getRequest(`/${baseUrl}/userdb/aiConfig`);
}

/**
 * 获取所有 AI 配置列表
 */
export function getAiConfigList(): Promise<any> {
    const baseUrl = aiApi.value?.appName || "userdb-manage";
    return getRequest(`/${baseUrl}/userdb/aiConfig/list`);
}

/**
 * 保存 AI 配置（新增/更新）
 */
export function saveAiConfig(config: AiConfigData): Promise<any> {
    const baseUrl =aiApi.value?.appName || "userdb-manage";
    return postRequest(`/${baseUrl}/userdb/aiConfig/save`, config);
}

/**
 * 激活 AI 配置
 */
export function activateAiConfig(id: string): Promise<any> {
    const baseUrl = aiApi.value?.appName || "userdb-manage";
    return postRequest(`/${baseUrl}/userdb/aiConfig/activate/${id}`, {});
}

/**
 * 删除 AI 配置
 */
export function deleteAiConfig(id: string): Promise<any> {
    const baseUrl = aiApi.value?.appName || "userdb-manage";
    return getRequest(`/${baseUrl}/userdb/aiConfig/delete/${id}`);
}
