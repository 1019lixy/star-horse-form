// import 'core-js/stable';
// import 'regenerator-runtime/runtime';
import "element-plus/theme-chalk/index.css";
import "star-horse-lowcode/dist/assets/index.css";
import "@/assets/css/flow.scss";
import "tailwindcss/index.css";
import nodeComponent from "@/views/continuous/nodeInfo/nodecomp";
import commonComponent from "@/components/common/index";
import flowNodeComponent from "@/views/workflow/plugin/node/nodes.ts";
import App from "@/App.vue";
import {createApp} from "vue";
// 导入svg图标
// import "virtual:svg-icons-register";
// import "highlight.js/styles/idea.css"; //这里有多个样式，自己可以根据需要切换
// import "highlight.js/lib/common";
// import hljsVuePlugin from "@highlightjs/vue-plugin";
import "animate.css";
import router from "@/router/index.ts";
import draggable from "vuedraggable";
import piniaCompInstance from "@/store";
// import VMEditor from "v-md-editor";
// import "v-md-editor/lib/style/base-editor.css";
// import vuepressTheme from "v-md-editor/lib/theme/vuepress.js";
// import "v-md-editor/lib/theme/style/vuepress.css";
// import Prism from "prismjs";
// import "prismjs/components/prism-json.js";
// import hljs from "highlight.js";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import VueParticles from "@tsparticles/vue3";
import {loadSlim} from "@tsparticles/slim";
import StarHorseLowCode from "star-horse-lowcode";

const app = createApp(App);
// window.app = app;
app.use(StarHorseLowCode,{
    router,
});
app.use(piniaCompInstance);
app.use(ElementPlus);
app.component("draggable", draggable);
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component);
}
/**
 * 加载elementplus 自己提供的图标
 */
app.use(commonComponent);
app.use(nodeComponent);
app.use(flowNodeComponent);
app.use(VueParticles, {
    init: async engine => {
        await loadSlim(engine);
    },
});
app.use(router);
// VMEditor.use(vuepressTheme, {
//     Prism,
//     Hljs: hljs
// });
// app.use(VMEditor);
//
// app.use(hljsVuePlugin);
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
