import {warning} from "star-horse-lowcode";

/**
 * 自定义的svg图标
 */
export function loadSvgIcons() {
    const items = import.meta.glob("@/icons/*.svg");
    const menuIconList = [];
    for (const [key, value] of Object.entries(items)) {
        const name = key.slice(key.lastIndexOf("/") + 1, key.lastIndexOf("."));
        menuIconList.push({ name: name, value: name });
    }
    return menuIconList;
}
export async function loadSvgIconsByPath(path: string) {
    import(path).then((res) => {
        console.log("xxxx", res);
    });
    warning("暂未实现");
    return [];
}
