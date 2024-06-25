import {createRouter, createWebHistory, NavigationGuardNext, RouteLocationNormalized} from "vue-router";
import routers from "./router";
import {starhorseProcess} from "@/utils/starhorseProcess";
import {Config} from "@/api/settings";
import {getToken} from "@/utils/auth";
import piniaInstance from "@/store";
import {createRouterAndMenuList} from "@/api/star_horse";
import {UserInfo} from "@/store/UserInfoStore";
import {navBarList} from "@/store/NavbarListStore";
import {viewList} from "@/store/ViewCacheStore";

const {start, done} = starhorseProcess();
const userInfoStore = UserInfo(piniaInstance);
const navBarListStore = navBarList(piniaInstance);
const viewListStore = viewList(piniaInstance);
//let dynamicMenus = computed(() => userInfoStore.dynamicMenus);
const router = createRouter({
    history: createWebHistory("/"),
    routes: routers,
    scrollBehavior: () => ({left: 0, top: 0}),
});
const whiteList = ["/login", "/dynamicform", "/workflowDesign"]; // N redirect whitelist
const assignTitle = (meta: any) => {
    if (meta.title) {
        document.title = meta.title + " - " + Config.title;
    }
};
router.beforeEach((to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    assignTitle(to.meta);
    start();
    // let menus = JSON.parse(JSON.stringify(userInfoStore.dynamicMenus));
    // console.log(to, menus, localStorage.getItem("userInfoStore"));
    if (getToken()) {
        // 已登录且要跳转的页面是登录页
        if (to.path === "/login") {
            next({path: "/"});
            done();
        } else {
            let path = to.path;
            //判断是不是动态菜单
            path = path.indexOf("page/") == -1 ? path : path.substring(0, path.lastIndexOf("/")) + "/:param";
            //第一次验证路由是不是存在，不存在则重新加载
            let toPath = router.getRoutes().find((item) => item.path === path);
            if (!toPath) {
                let data = localStorage.getItem("menusInfo");
                if (data) {
                    userInfoStore.addPermissionMenus(
                        createRouterAndMenuList(JSON.parse(data))
                    );
                } else {
                    //登录时，由于菜单时异步加载可能还没有加载成功，则直接跳转到主页
                    next({path: "/"});
                }
                //加载完成后再次验证，还是不存在，则说明当前用户没有权限或者是非法路由
                toPath = router.getRoutes().find((item) => item.path === path);
                if (!toPath) {
                    next("/404");
                } else {
                    next(to);
                }
            } else {
                if (to.path.indexOf("page/") == -1 && !toPath?.components) {
                    next("/404");
                } else if (toPath || to.path.indexOf("page/") != -1) {
                    next();
                } else {
                    next(to);
                }
            }
        }
    } else {
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next();
        } else {
            next({path: "/login", query: {redirect: to.fullPath}}); // 否则全部重定向到登录页
            done();
        }
    }
});
router.beforeResolve((to, from, next) => {
    next();
});
router.afterEach((to, from) => {
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
