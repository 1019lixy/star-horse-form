/// <reference types="vite/client" />
declare module "*.mjs"
declare module "*.d.ts"
declare module "element-plus/dist/locale/zh-cn" {
    const content: any;
    export default content;
}
declare module "*.vue" {
    import type {DefineComponent, ComponentOptions} from "vue";
    import Vue from "vue";
    const component: DefineComponent<{}, {}, any> | ComponentOptions | Vue;
    export default component;
}
interface ImportMeta {
    readonly glob: (pattern: string) => Record<string, () => Promise<any>>;
}
interface Window {
    /** 全局调试开关：控制设计器等模块的控制台调试日志 */
    _isDebug_?: boolean;
}
