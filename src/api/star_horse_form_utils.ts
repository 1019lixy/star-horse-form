import { SelectOption, warning } from "star-horse-lowcode";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { markRaw } from "vue";
import { formIcons } from "@/assets/form_icons";
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
