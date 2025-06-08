import "element-plus/theme-chalk/index.css";
import "star-horse-lowcode/assets/index.css";
import "@/assets/css/flow.scss";
import "@/assets/css/devops.scss";
import "tailwindcss/index.css";
import nodeComponent from "@/views/continuous/nodeInfo/nodecomp";
import itemsComponent from "@/components/formcomp/items/allitem";
import commonComponent from "@/components/common/index";
import systemComponent from "@/components/system/SystemComp";
import flowNodeComponent from "@/views/workflow/plugin/node/nodes";
import App from "@/App.vue";
import {createApp} from "vue";
// 导入svg图标
import "animate.css";
import router from "@/router/index";
import draggable from "vuedraggable";
import piniaCompInstance from "@/store";

// import ElementPlus from 'element-plus';
// import ZhLocale from "element-plus/dist/locale/zh-cn.mjs"; // 中文
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import VueParticles from "@tsparticles/vue3";
import {loadSlim} from "@tsparticles/slim";
import StarHorseLowCode from "star-horse-lowcode";

const app = createApp(App);
// window.app = app;
app.use(router);
app.use(StarHorseLowCode, {
    router,
});
app.use(piniaCompInstance);
// app.use(ElementPlus, {
//     locale: ZhLocale,
// });
app.component("draggable", draggable);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
/**
 * 加载elementplus 自己提供的图标
 */
app.use(commonComponent);
app.use(systemComponent);
app.use(itemsComponent);
app.use(nodeComponent);
app.use(flowNodeComponent);
app.use(VueParticles, {
    init: async engine => {
        await loadSlim(engine);
    },
});

app.config.performance = true;
/**
 * 处理未捕获异常
 * @param err
 * @param instance
 * @param info
 */
app.config.errorHandler = (err, instance, info) => {
    console.log(err);
    console.log(instance);
    console.log(info);
};
/**
 * 处理警告
 * @param err
 * @param instance
 * @param info
 */
app.config.warnHandler = () => null;
// app.config.warnHandler=(msg, instance, trace)=>{
//     console.log(msg);
//     console.log(instance);
//     console.log(trace);
// }
app.mount("#app");
