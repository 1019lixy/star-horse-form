import {LangType} from "./theme.ts";

export function getLang(): LangType {
    return (localStorage.getItem('lang') as LangType) || 'zh_cn';
}

export function setLang(lang: LangType) {
    return localStorage.setItem('lang', lang);
}
