import { RouteRecordRaw } from "vue-router";

const routeDefine: RouteRecordRaw[] = [];
routeDefine.push({
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
        keepAlive: "N",
      },
    },
    {
      path: "/userCenter",
      name: "UserCenter",
      component: () => import("@/components/UserCenter.vue"),
      meta: {
        menuIcon: "user",
        title: "用户中心",
        keepAlive: "Y",
      },
    },
    {
      path: "/dict_list",
      name: "DictinfoUi",
      component: () => import("@/views/system/DictinfoUI.vue"),
      meta: {
        title: "数据字典详情",
        keepAlive: "N",
      },
    },
    {
      path: "/shcalendar",
      name: "StarHorseCalendar",
      component: () => import("@/views/system/calendar/StarHorseCalendar.vue"),
      meta: {
        title: "日程表",
        keepAlive: "N",
      },
    },

    {
      path: "/tab/page/:param",
      name: "TabPage",
      component: () => import("@/components/commonpage/TabPage.vue"),
      props: true,
      meta: {
        title: "动态表单实例",
        menuIcon: "folder",
        keepAlive: "Y",
      },
    },
    {
      path: "/general/page/:param",
      name: "NormalPage",
      component: () => import("@/components/commonpage/NormalPage.vue"),
      props: true,
      meta: {
        title: "动态表单实例",
        menuIcon: "position",
        keepAlive: "Y",
      },
    },
    {
      path: "/list/page/:param",
      name: "FormTablePage",
      component: () => import("@/components/commonpage/FormTablePage.vue"),
      props: true,
      meta: {
        title: "动态表单实例",
        menuIcon: "list",
        keepAlive: "Y",
      },
    },
    {
      path: "/form/page/:param",
      name: "TabPage",
      component: () => import("@/components/commonpage/FormPage.vue"),
      props: true,
      meta: {
        title: "动态表单实例",
        menuIcon: "form",
        keepAlive: "Y",
      },
    },
    {
      path: "/view/page/:param",
      name: "ViewPage",
      component: () => import("@/components/commonpage/ViewPage.vue"),
      props: true,
      meta: {
        title: "动态视图",
        menuIcon: "list",
        keepAlive: "Y",
      },
    },
    {
      path: "/redirect",
      name: "Redirect",
      component: () => import("@/views/utils/Redirect.vue"),
      meta: { noCache: true },
    },
  ],
  meta: {
    title: "首页",
    keepAlive: "N",
  },
});
routeDefine.push(
  {
    path: "/flex",
    component: () => import("@/components/system/StarHorseFlexComp.vue"),
    name: "弹性布局",
    meta: {
      keepAlive: "N",
      title: "弹性布局",
    },
  },
  {
    path: "/test",
    component: () => import("@/components/Test.vue"),
    name: "测试",
    meta: {
      keepAlive: "N",
      title: "测试",
    },
  },
  {
    path: "/mindMap",
    name: "MindMap",
    component: () => import("@/views/tools/MindMap.vue"),
    meta: {
      title: "思维导图",
      keepAlive: "N",
    },
  },
  {
    path: "/login",
    component: () => import("@/components/Login.vue"),
    name: "登录",
    meta: {
      keepAlive: "N",
      title: "系统登录",
    },
  },
  {
    path: "/register",
    component: () => import("@/components/Register.vue"),
    name: "Register",
    meta: {
      keepAlive: "N",
      title: "用户注册",
    },
  },
  {
    path: "/forgot-password",
    component: () => import("@/components/ForgotPassword.vue"),
    name: "ForgotPassword",
    meta: {
      keepAlive: "N",
      title: "忘记密码",
    },
  },
  {
    path: "/404",
    component: () => import("@/components/404.vue"),
    name: "404",
    meta: {
      keepAlive: "N",
      title: "404页面",
    },
  },
  {
    path: "/jbpmDesign",
    component: () => import("@/views/jbpm/JbpmDesign.vue"),
    name: "JbpmDesign",
    meta: {
      keepAlive: "N",
      title: "流程设计器",
    },
  },
  {
    path: "/workFlowForm",
    component: () => import("@/views/workflow/WorkFlowForm.vue"),
    name: "WorkFlowForm",
    meta: {
      keepAlive: "N",
      title: "表单流程设计器",
    },
  },
  {
    path: "/flowDesign",
    component: () => import("@/views/workflow/plugin/FlowDesign.vue"),
    name: "FlowDesign",
    meta: {
      keepAlive: "N",
      title: "流程表单",
    },
  },
   {
    path: "/execRecord",
    component: () => import("@/views/continuous/ContinusInstanceExecRecord.vue"),
    name: "ExecRecord",
    meta: {
      keepAlive: "N",
      title: "执行记录",
    },
  },
);
export default routeDefine;
