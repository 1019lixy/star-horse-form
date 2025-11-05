// 在文件最顶部添加以下代码
import {App} from "vue";
import "tailwindcss/index.css";
import "@/assets/css/devops.scss";
import "element-plus/theme-chalk/index.css";
import "@/assets/icons.css";
import {AxiosInstance} from "axios";
import type {Router} from "vue-router";
import ElementPlus from "element-plus";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import StarHorsePageDesign from "@/components/system/StarHorsePageDesign.vue";
import {LangType} from "@/theme/theme";


// 声明全局变量存储宿主应用的 router
declare global {
    var __hostRouter__: Router | undefined;
    var __hostAxios__: AxiosInstance | undefined;
    var __starHorseHostApp__: App<Element> | undefined;
    var __starHorseHostLang__: LangType | undefined;
}
// 插件安装方法
const install = (
    app: App<Element>,
    options?: {
        router?: Router,
        axiosInstance?: AxiosInstance,//如果外部传入axios实例，就使用外部传入的，否则使用默认的
        elementPlusOptions?: any,// 添加Element Plus配置选项
        lang?: LangType, //国际化语音
        initElementPlus?: boolean   // 是否初始化element-plus
    },
) => {
    // 注入宿主应用的 router 实例
    if (options?.router) {
        window.__hostRouter__ = options.router;
    }
    // 注入axios实例
    if (options?.axiosInstance) {
        window.__hostAxios__ = options.axiosInstance;
    }
    if (options?.lang) {
        window.__starHorseHostLang__ = options.lang;
    }
    if (options?.initElementPlus ?? true) {
        // 只在没有配置时才设置中文
        app.use(ElementPlus, options?.elementPlusOptions);
    }
    window.__starHorseHostApp__ = app;

};
//表单组件增加调用参数source: { type: Number, default: 1 },//调用来源1 表单新增 2 表单编辑 3 查看视图 4 查询 5 列表 6 表单设计 7 页面设计
// 导出所有组件用于按需引入


// 导出所有store
// export * from "@/store/ButtonPermission";


const StarHorseForm = StarHorseFormDesign;
const StarHorsePage = StarHorsePageDesign;
export default {
    install,
    StarHorseForm,
    StarHorsePage,
};
