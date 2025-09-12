import zh_CN from "@/lang/zh_CN";
import en_US from "@/lang/en_US";
import zh_TW from "@/lang/zh_TW";
import ja_JP from "@/lang/ja_JP";
import de_DE from "@/lang/de_DE";
import { LangType } from "@/theme/theme";
import { getLang } from "@/theme/localStorge";

const language = {
  zh_cn: zh_CN,
  en_us: en_US,
  zh_tw: zh_TW,
  ja_jp: ja_JP,
  de_de: de_DE,
};
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
  const result = langSet[key];

  if (result === undefined) {
    return `[${key}]`;
  }

  // Check if the translation string contains placeholders like {0}, {1}, etc.
  if (/\{\d+\}/.test(result)) {
    // Replace placeholders with corresponding arguments
    let translated = result;
    args.forEach((arg, index) => {
      // If arg is a string and exists as a key in langSet, use its translation
      // Otherwise, use the arg value directly
      const value =
        typeof arg === "string" && langSet[arg] ? langSet[arg] : arg;
      translated = translated.replace(new RegExp(`\\{${index}\\}`, "g"), value);
    });
    return translated;
  } else {
    // Fall back to concatenation behavior for backward compatibility
    const resultList: Array<string> = [result];
    args.forEach((arg, i) => {
      const temp = langSet[arg];
      if (temp) {
        resultList.push(temp);
      }
    });
    return resultList.join("en_us" === LangType.EN_US ? " " : "");
  }
}