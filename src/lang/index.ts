import zh_CN from "@/lang/zh_CN.ts";
import en_US from "@/lang/en_US.ts";
import {LangType} from "@/theme/theme.ts";
import {getLang} from "@/theme/localStorge.ts";
const language = {
    "zh_cn": zh_CN,
    "en_us": en_US
}
export const currentLang: LangType = getLang() || LangType.ZH_CN;
export const isEn = currentLang === LangType.EN_US;
export const isZH = currentLang === LangType.ZH_CN;
const langSet: Record<string, string> = language[currentLang];
/**
 *
 * @param key
 * @param args
 */
export function i18n(key: keyof typeof zh_CN, ...args: any[]) {
    let result = langSet[key];
    let resultList: Array<String> = [];
    if (result === undefined) {
        return `[${key}]`;
    } else {
        resultList.push(result)
        args.forEach((arg, i) => {
            let temp = langSet[arg];
            if (temp) {
                resultList.push(temp);
            }
        });
        return resultList.join("en_us" === LangType.EN_US ? " " : "");
    }
}
