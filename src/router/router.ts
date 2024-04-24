import {RouteRecordRaw} from "vue-router";

const routers: RouteRecordRaw[] = [];
routers.push({
    path: "/",
    component: () => import("@/components/Dashboard.vue"),
    name: "Index",
    redirect: "/home",
    children: [
        {
            path: "/home",
            name: "Home",
            component: () => import("@/components/Home.vue"),
            meta: {
                menuIcon: "house",
                title: "系统首页",
                keepAlive: false
            }
        },
        {
            path: "/continus/instanceDetail",
            name: "ContinusInstanceDetail",
            component: () => import("@/views/continus/ContinusInstanceDetail.vue"),
            meta: {
                title: "流水线详情",
                keepAlive: false
            }

        }, {
            path: "/dict_list",
            name: "DictinfoUi",
            component: () => import("@/views/system/DictinfoUI.vue"),
            meta: {
                title: "数据字典详情",
                keepAlive: false
            }
        }, {
            path: "/tab/page/:param",
            component: () => import("@/views/dyform/TabPage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "folder",
                keepAlive: true
            }
        }, {
            path: "/general/page/:param",
            component: () => import("@/views/dyform/NormalPage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "position",
                keepAlive: true
            }
        }, {
            path: "/formtb/page/:param",
            component: () => import("@/views/dyform/FormTablePage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "list",
                keepAlive: true
            }
        }, {
            path: "/view/page/:param",
            component: () => import("@/views/dyform/ViewPage.vue"),
            props: true,
            meta: {
                title: "动态视图",
                menuIcon: "list",
                keepAlive: true
            }
        }, {
            path: '/redirect',
            name: 'Redirect',
            component: () => import('@/views/utils/Redirect.vue'),
            meta: {noCache: true}
        }],
    meta: {
        title: "主页",
        keepAlive: false
    }
});
/*routers.push({
    path: '/redirect',
    component: () => import("@/components/Dashboard.vue"),
    name: 'Redirect',
    children: [
        {
            path: '/redirect/:path(.*)',
            name: 'Redirect',
            component: () => import('@/views/utils/Redirect.vue'),
            meta: {}
        }
    ],
    meta: {
        noCache: true,
    }
});*/

routers.push({
    path: "/login",
    component: () => import("@/components/Login.vue"),
    name: "登录",
    meta: {
        keepAlive: false,
        title: "系统登录"
    }
}, {
    path: "/404",
    component: () => import("@/components/404.vue"),
    name: "404",
    meta: {
        keepAlive: false,
        title: "404页面"
    }
});
export default routers;