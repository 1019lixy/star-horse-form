/**
 * 缓存数据
 * @param key
 * @param data
 */
const setCacheData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};
/**
 * 获取缓存数据
 * @param key
 */
const getCacheData = (key: string) => {
  const item = localStorage.getItem(key);
  if (item) {
    return JSON.parse(item);
  }
  return null;
};
/**
 * 获取并删除缓存数据
 * @param key
 */
const getAndDelCacheData = (key: string) => {
  const data = getCacheData(key);
  delCacheData(key);
  return data;
};
/**
 * 删除缓存数据
 * @param key
 */
const delCacheData = (key: string) => {
  localStorage.removeItem(key);
};
export { setCacheData, getCacheData, getAndDelCacheData, delCacheData };

// ═══════════════════════════════════════════════════════════════
// 配置模板本地存储
// ═══════════════════════════════════════════════════════════════

const LOCAL_TEMPLATE_KEY = "star_horse_config_templates";

import type {ConfigTemplate, ConfigTemplateCategory} from "@/components/types/DataSourceTypes";

/**
 * 获取本地所有模板
 */
const getLocalAllTemplates = (): ConfigTemplate[] => {
  const data = localStorage.getItem(LOCAL_TEMPLATE_KEY);
  return data ? JSON.parse(data) : [];
};

/**
 * 保存本地所有模板
 */
const setLocalAllTemplates = (templates: ConfigTemplate[]) => {
  localStorage.setItem(LOCAL_TEMPLATE_KEY, JSON.stringify(templates));
};

/**
 * 保存模板到本地
 */
export const saveLocalTemplate = (template: ConfigTemplate) => {
  const templates = getLocalAllTemplates();
  const idx = templates.findIndex(t => t.id === template.id);
  if (idx >= 0) {
    templates[idx] = template;
  } else {
    templates.push(template);
  }
  setLocalAllTemplates(templates);
};

/**
 * 获取本地模板列表（可按分类筛选）
 */
export const getLocalTemplateList = (category?: ConfigTemplateCategory): ConfigTemplate[] => {
  const templates = getLocalAllTemplates();
  if (category) {
    return templates.filter(t => t.category === category);
  }
  return templates;
};

/**
 * 根据ID获取本地模板
 */
export const getLocalTemplateById = (id: string): ConfigTemplate | null => {
  const templates = getLocalAllTemplates();
  return templates.find(t => t.id === id) || null;
};

/**
 * 删除本地模板
 */
export const deleteLocalTemplate = (id: string) => {
  const templates = getLocalAllTemplates();
  const filtered = templates.filter(t => t.id !== id);
  setLocalAllTemplates(filtered);
};
