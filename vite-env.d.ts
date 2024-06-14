/// <reference types="vite/client" />
declare module "*.vue" {
    import type {DefineComponent, ComponentOptions} from "vue";
    import Vue from "vue";
    const component: DefineComponent<{}, {}, any> | ComponentOptions | Vue;
    export default component;
}
