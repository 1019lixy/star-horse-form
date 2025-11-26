import { SelectOption, warning } from "star-horse-lowcode";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { formIcons } from "@/assets/form_icons";
/**
 * 自定义的svg图标
 */
export function loadSvgIcons():SelectOption[] {
  return formIcons;
}
export async function loadSvgIconsByPath(path: string) {
  import(path).then((res) => {
    console.log("xxxx", res);
  });
  warning("暂未实现");
  return [];
}
/**
 * 获取系统图标
 * @returns 
 */
export async function loadElementPlusIcon() {
  const menuIconList = [];
  for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    menuIconList.push({ name: key, value: component.name });
  }
  return menuIconList;
}
