// 在文件最顶部添加以下代码
import {defineAsyncComponent} from "vue";
import "star-horse-lowcode/assets/index.css";
import "tailwindcss/index.css";
import "@/assets/css/devops.scss";
import "element-plus/theme-chalk/index.css";
import "@/assets/icons.css";
import {LangType} from "@/theme/theme";
import StarHorseLowcode from "star-horse-lowcode";
import piniaCompInstance from "@/store/index";
import draggable from "vuedraggable-es";

const items = import.meta.glob([
    // "@/components/common/*.vue",
    // "@/components/commonpage/*.vue",
    "@/components/system/*.vue",
    "@/components/formcomp/items/*.vue",
    // "@/components/formcomp/pageitems/*.vue"
]);
// 插件安装方法
const install = (
    app: any,
    options?: {
        router?: any;
        axiosInstance?: any; //如果外部传入axios实例，就使用外部传入的，否则使用默认的
        elementPlusOptions?: any; // 添加Element Plus配置选项
        lang?: LangType; //国际化语音
        initElementPlus?: boolean; // 是否初始化element-plus
    },
) => {
    console.log("StarHorseForm init...");
    app.component("draggable", draggable);
    // 1. 首先初始化当前项目的pinia store
    app.use(piniaCompInstance);
    // 3. 最后使用StarHorseLowcode组件
    app.use(StarHorseLowcode, options);
    Object.entries(items).forEach(([path, component]) => {
        const name = path
            .split("/")
            .pop() // 获取文件名
            ?.replace(/\.vue$/, ""); // 移除扩展名

        if (name) {
            app.component(name, defineAsyncComponent(component as any));
        }
    });
};
export * from "@/components/formcomp/items";
// export * from "@/components/formcomp/pageitems";
export * from "@/components/types";
export * from "@/components/system";
export default {
    install,
};
