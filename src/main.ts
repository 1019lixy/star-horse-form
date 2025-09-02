// import 'element-plus/theme-chalk/index.css';
import "@/assets/css/flow.scss";
import "star-horse-lowcode/assets/index.css";
import "@/assets/css/devops.scss";
import "@/assets/css/table-enhancements.scss";
import "tailwindcss/index.css";
// import nodeComponent from "@/views/continuous/nodeInfo/nodecomp";
import itemsComponent from "@/components/formcomp/items/allitem";
import commonComponent from "@/components/common/index";
import systemComponent from "@/components/system/SystemComp";
import App from "@/App.vue";
import { createApp } from "vue";
// 导入svg图标
import "animate.css";
import router from "@/router/index";
import draggable from "vuedraggable";
import piniaCompInstance from "@/store";
import { axiosInstance } from "@/api/star_horse_apis";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
// import VueParticles from '@tsparticles/vue3';
// import { loadSlim } from '@tsparticles/slim';
import StarHorseLowCode from "star-horse-lowcode";
import { getLang } from "@/theme/localStorge";
import { LangType } from "@/theme/theme";

const app = createApp(App);
export const appInstance = app;
app.use(router);

// Initialize the language based on stored preference
const currentLang = getLang() || LangType.ZH_CN;
// We could potentially pass language info to the plugin if it supports it
// But for now, we'll rely on the custom event approach

app.use(StarHorseLowCode, {
  router,
  axiosInstance,
  lang: currentLang,
});

app.use(piniaCompInstance);
// app.use(ElementPlus, {
//     locale: ZhLocale,
// });
app.component("draggable", draggable);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  // @ts-ignore
  app.component(key, component);
}
/**
 * 加载elementplus 自己提供的图标
 */
app.use(commonComponent);
app.use(systemComponent);
app.use(itemsComponent);
// app.use(VueParticles, {
//   init: async (engine) => {
//     await loadSlim(engine);
//   },
// });

app.config.performance = false;
/**
 * 处理未捕获异常
 * @param err
 * @param instance
 * @param info
 */
app.config.errorHandler = (err, instance, info) => {
  console.error("未捕获异常", err, instance, info);
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
