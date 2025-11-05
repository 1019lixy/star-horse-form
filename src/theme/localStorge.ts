import { LangType } from "./theme.js";

/**
 * 获取系统语言
 */
export function getLang(): LangType {
  return (localStorage.getItem("lang") as LangType) || LangType.ZH_CN;
}

/**
 * 设置系统语言
 * @param lang
 */
export function setLang(lang: LangType) {
  // Use the language synchronization service to set the language
  // languageSyncService.setLanguage(lang);
  return localStorage.setItem("lang", lang);
}
