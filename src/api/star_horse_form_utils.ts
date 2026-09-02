import {SelectOption, warning} from "star-horse-lowcode";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import {markRaw} from "vue";
import {formIcons} from "@/assets/form_icons";
import {i18n} from "@/lang";

/**
 * 自定义的svg图标（模块级缓存 + markRaw，避免被 Vue 响应式代理后
 * 触发 Array.values 与 star-horse-lowcode 互相递归导致栈溢出）
 */
let _cachedFormIcons: SelectOption[] | null = null;
export function loadSvgIcons(): SelectOption[] {
  if (!_cachedFormIcons) {
    _cachedFormIcons = markRaw(formIcons);
  }
  return _cachedFormIcons;
}
export function loadSvgIconsByPath(path: string) {
  warning(i18n("dyform.api.notImplemented"));
  return [];
}
/**
 * 获取系统图标
 * @returns
 */
export function loadElementPlusIcon() {
  const menuIconList = [];
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    menuIconList.push({ name: key, value: component.name });
  }
  return menuIconList;
}
/**
 * 复制文本到剪贴板，兼容主流浏览器
 * @param data 要复制的数据
 * @returns Promise<boolean> true成功 false失败
 */
export function copy(data: any): Promise<boolean> {
  // 统一转为字符串
  const text = String(data ?? "");

  // 现代浏览器剪贴板API，安全上下文：https / localhost
  if (navigator?.clipboard) {
    return navigator.clipboard
        .writeText(text)
        .then(() => true)
        .catch(() => {
          // 现代API失败，走dom降级方案
          return fallbackCopyText(text);
        });
  } else {
    // 不支持clipboard直接走降级
    return fallbackCopyText(text);
  }
}

/**
 * 降级方案：创建临时textarea执行copy命令
 */
function fallbackCopyText(text: string): Promise<boolean> {
  return new Promise((resolve) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    // 视觉移出屏幕，不干扰页面
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "-9999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const ok = document.execCommand("copy");
      resolve(ok);
    } catch (err) {
      console.error("copy fallback error:", err);
      resolve(false);
    } finally {
      document.body.removeChild(textArea);
    }
  });
}

