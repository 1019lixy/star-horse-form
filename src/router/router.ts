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
                keepAlive: "N"
            }
        },
        {
            path: "/dict_list",
            name: "DictinfoUi",
            component: () => import("@/views/system/DictinfoUI.vue"),
            meta: {
                title: "数据字典详情",
                keepAlive: "N"
            }
        },
        {
            path: "/continus/instanceConfig",
            name: "ContinusInstanceConfig",
            component: () => import("@/views/continus/ContinusInstanceConfig.vue"),
            meta: {
                title: "持续集成实例配置",
                keepAlive: "N"
            }
        },
        {
            path: "/continus/instanceItem",
            name: "InstanceItem",
            component: () => import("@/views/continus/InstanceItem.vue"),
            meta: {
                title: "实例项目",
                keepAlive: "N"
            }
        },

        {
            path: "/tab/page/:param",
            name: "TabPage",
            component: () => import("@/views/dyform/TabPage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "folder",
                keepAlive: "Y"
            }
        }, {
            path: "/general/page/:param",
            name: "NormalPage",
            component: () => import("@/views/dyform/NormalPage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "position",
                keepAlive: "Y"
            }
        }, {
            path: "/formtb/page/:param",
            name: "FormTablePage",
            component: () => import("@/views/dyform/FormTablePage.vue"),
            props: true,
            meta: {
                title: "动态表单实例",
                menuIcon: "list",
                keepAlive: "Y"
            }
        }, {
            path: "/view/page/:param",
            name: "ViewPage",
            component: () => import("@/views/dyform/ViewPage.vue"),
            props: true,
            meta: {
                title: "动态视图",
                menuIcon: "list",
                keepAlive: "Y"
            }
        }, {
            path: '/redirect',
            name: 'Redirect',
            component: () => import('@/views/utils/Redirect.vue'),
            meta: {noCache: true}
        }],
    meta: {
        title: "首页",
        keepAlive: "N"
    }
});
routers.push(
    /*    {
        path: "/login",
        component: () => import("@/components/Login.vue"),
        name: "登录",
        meta: {
            keepAlive: "N",
            title: "系统登录"
        }
    },*/
    {
        path: "/login",
        component: () => import("@/components/Login1.vue"),
        name: "登录",
        meta: {
            keepAlive: "N",
            title: "系统登录"
        }
    }, {
        path: "/404",
        component: () => import("@/components/404.vue"),
        name: "404",
        meta: {
            keepAlive: "N",
            title: "404页面"
        }
    },{
        path: "/workFlow",
        component: () => import("@/views/workflow/dingDingStyle/workFlow.vue"),
        name: "workFlow",
        meta: {
            keepAlive: "N",
            title: "钉钉流程模式"
        }
    });
export default routers;
