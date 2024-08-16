import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized} from "vue-router";
import routers from "./router";
import {starhorseProcess} from "@/utils/starhorseProcess";
import {Config} from "@/api/settings.ts";
import {getToken} from "@/utils/auth";
import piniaInstance from "@/store";
import {restoreMenu} from "@/api/star_horse";
import {navBarList} from "@/store/NavbarListStore";
import {viewList} from "@/store/ViewCacheStore";

const {start, done} = starhorseProcess();
const navBarListStore = navBarList(piniaInstance);
const viewListStore = viewList(piniaInstance);
const router = createRouter({
    history: createWebHistory("/"),
    routes: routers,
    scrollBehavior: () => ({left: 0, top: 0}),
});
const whiteList = ["/login", "/continus", "/workflowDesign"]; // N redirect whitelist
const assignTitle = (meta: any) => {
    if (meta.title) {
        document.title = meta.title + " - " + Config.title;
    }
};
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
    assignTitle(to.meta);
    console.log(to,to.name);
    start();
    if (getToken()) {
        // 已登录且要跳转的页面是登录页
        if (to.path === "/login") {
            next({path: "/"});
        } else {
            //第一次验证路由是不是存在，不存在则重新加载
            if (!to.name||!router.hasRoute(to.name)) {
                restoreMenu(to);
                // next({...to, replace: true});
            } else {
                let path = to.path;
                //判断是不是动态菜单
                path = path.indexOf("page/") == -1 ? path : path.substring(0, path.lastIndexOf("/")) + "/:param";
                let toPath = router.getRoutes().find((item) => item.path === path);
                if (to.path.indexOf("page/") == -1 && !toPath?.components) {
                    next("/404");
                } else {
                    next();
                }
            }
        }
    } else {
        if (whiteList.find((item: string) => to.path.includes(item))) {
            // 在免登录白名单，直接放行
            next();
        } else {
            //中断当前导航执行新的导航
            next({path: "/login", query: {redirect: to.fullPath}}); // 否则全部重定向到登录页
        }
    }
});
router.beforeResolve((_to, _from, next) => {
    next();
});
router.afterEach((to, _from) => {
    done();
    if (to.path !== "/login" && to.path !== "/404") {
        //动态表单路由，导航信息拼接
        if (to.path.indexOf("page/") != -1) {
            let menuLists = localStorage.getItem("dynamicMenusLists");
            if (menuLists) {
                let menus = JSON.parse(menuLists);
                let fdata = menus.find((item: any) => item.path == to.path);
                to.meta = fdata?.meta || to.meta;
            }
        }
        let keepAlive = to.meta?.keepAlive;
        assignTitle(to.meta);
        navBarListStore.setCurrentView(to);
        if (!to.meta.noCache) {
            navBarListStore.addNavBar(to);
        }
        if (keepAlive == "Y") {
            viewListStore.setViewCache(to);
        }
    }
});
export default router;
