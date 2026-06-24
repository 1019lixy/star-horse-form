import {ApiUrls, postRequest, success, warning} from "star-horse-lowcode";
import type {ConfigTemplate, ConfigTemplateCategory, SaveTemplateParams} from "@/components/types/DataSourceTypes";
import {deleteLocalTemplate, getLocalTemplateList, saveLocalTemplate} from "@/api/cached_utils";
import {i18n} from "@/lang";
import {ref} from "vue";

const configApi = ref<ApiUrls>();

/**
 * 初始化接口配置
 * @param api
 */
export function init(api: ApiUrls) {
    configApi.value = api;
}

/**
 * 保存模板到数据库
 */
export function saveTemplateToDatabase(params: SaveTemplateParams): Promise<any> {
    return postRequest(configApi.value.mergeUrl, {
        templateName: params.name,
        category: params.category,
        description: params.description,
        configData: JSON.stringify(params.configData),
    });
}

/**
 * 从数据库查询模板列表（按分类）
 */
export function getTemplateListFromDatabase(category?: ConfigTemplateCategory): Promise<any> {
    const url = category ? `${configApi.value.customerUrl1}/${category}` : `${configApi.value.customerUrl1}/`;
    return postRequest(url, {});
}

/**
 * 从数据库删除模板
 */
export function deleteTemplateFromDatabase(id: string): Promise<any> {
    return postRequest(`${configApi.value.deleteUrl}/${id}`, {});
}

/**
 * 从数据库获取模板详情
 */
export function getTemplateFromDatabase(id: string): Promise<any> {
    return postRequest(`${configApi.value.loadByIdUrl}/${id}`, {});
}

/**
 * 统一保存模板（根据 storage 类型选择存储位置）
 */
export async function saveTemplate(params: SaveTemplateParams): Promise<ConfigTemplate> {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();
    const template: ConfigTemplate = {
        id,
        name: params.name,
        category: params.category,
        description: params.description,
        storage: params.storage,
        configData: params.configData,
        createdTime: now,
        updatedTime: now,
    };

    if (params.storage === "local") {
        saveLocalTemplate(template);
        success(i18n("dyform.template.save.success"));
        return template;
    } else {
        const result = await saveTemplateToDatabase(params);
        if (result.data.code) {
            warning(result.data.cnMessage);
            return;
        }
        success(i18n("dyform.template.save.success"));
        return template;
    }
}

/**
 * 统一查询模板列表
 */
export async function getTemplateList(category?: ConfigTemplateCategory): Promise<ConfigTemplate[]> {
    const localTemplates = getLocalTemplateList(category);
    try {
        const dbResult = await getTemplateListFromDatabase(category);
        const datas = dbResult.data?.data;
        const dbTemplates: ConfigTemplate[] = (datas || []).map((item: any) => ({
            id: item.idConfigTemplate,
            name: item.templateName,
            category: item.category,
            description: item.description,
            storage: "database" as const,
            configData: typeof item.configData === "string" ? JSON.parse(item.configData) : item.configData,
            createdTime: item.createdTime,
            updatedTime: item.updatedTime,
            createdBy: item.createdBy,
        }));
        return [...localTemplates, ...dbTemplates];
    } catch (err) {
        console.error(err);
        return localTemplates;
    }
}

/**
 * 统一删除模板
 */
export async function removeTemplate(template: ConfigTemplate): Promise<void> {
    if (template.storage === "local") {
        deleteLocalTemplate(template.id);
    } else {
        await deleteTemplateFromDatabase(template.id);
    }
}
