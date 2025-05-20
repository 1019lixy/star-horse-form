<script lang="ts" setup>
import router from "@/router";
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {useNavBarListStore} from "@/store/NavBarList";
import {useViewCacheStore} from "@/store/ViewCache";
import piniaCompInstance from "@/store";
import zhCn from "element-plus/dist/locale/zh-cn.mjs";
import en from "element-plus/dist/locale/en.mjs";
import {LangType} from "@/theme/theme";
import {getLang} from "@/theme/localStorge";
import {i18n} from "@/lang";
import {piniaInstance, useGlobalConfigStore} from "star-horse-lowcode";

let configStore = useGlobalConfigStore(piniaInstance);
const route = router.getRoutes().find((item) => item.path == "/home");
let viewListStore = useViewCacheStore(piniaCompInstance);
const navBarListStore = useNavBarListStore(piniaCompInstance);
const cachedDatas = computed(() => viewListStore.viewListDatas);
let isCollapse = ref<boolean>(true);
let sysemId = ref<string>("-1");
let outerIsCollapse = ref<number>(64);

let locale = ref(zhCn);
let direction = ref();
const changeLang = (lang: LangType, _isInit: boolean) => {
  locale.value = lang == LangType.ZH_CN ? zhCn : en;
  // console.log(isInit);
};
const layoutConfig = () => {
  drawer.value = true;
};
const loadMenuFun = (data: string) => {
  sysemId.value = data;
};
provide("loadMenu", loadMenuFun);
const mouseOver = () => {
  if (configInfo.value.menusCfg == "fixed") {
    return;
  }
  $(".star-horse-left").addClass("show-scroll-bar");
};
const mouseOut = () => {
  $(".star-horse-left").removeClass("show-scroll-bar");
};
const collapseOperation = () => {
  isCollapse.value = !isCollapse.value;
};
watch(
    () => isCollapse.value,
    (val: boolean) => {
      setTimeout(() => {
        outerIsCollapse.value = val ? 200 : 64;
      }, 200);
    },
    {
      immediate: true
    }
);
let dragging = ref<boolean>(false);
let mainLeftAside = ref();
let resizerRef = ref();
// 移动完成

let initialX = ref<number>(0); // 记录鼠标按下时的初始位置

const mouseDow = (event: MouseEvent) => {
  event.preventDefault();
  dragging.value = true;
  initialX.value = event.clientX;
  // 添加全局事件监听
  document.addEventListener('mousemove', dragStart);
  document.addEventListener('mouseup', () => {
    dragging.value = false;
    resizerRef.value.style.cursor = '';
    document.body.style.cursor = '';
    document.removeEventListener('mousemove', dragStart);
  }, {once: true});
};
const dragStart = (event: MouseEvent) => {
  if (!dragging.value) return;
  event.preventDefault();
  if (configInfo.value.menusCfg != "tradition") {
    return;
  }

  const offsetX = event.clientX - initialX.value; // 计算偏移量
  const newWidth = outerIsCollapse.value + offsetX; // 计算新的宽度
  //设置最小和最大宽带
  if (newWidth <= 64) {
    isCollapse.value = false;
    outerIsCollapse.value = 64;
  } else if (newWidth > 500) {
    outerIsCollapse.value = 500;
  } else {
    isCollapse.value = true;
    outerIsCollapse.value = newWidth;
  }
  initialX.value = event.clientX; // 更新初始位置
};

onMounted(async () => {
  await nextTick();
  changeLang(getLang(), true);
  navBarListStore.addNavBar(route);
  configStore.clearAll();
  $(".star-horse-left").addClass("animate__animated animate__bounceInLeft");
  setTimeout(() => {
    $(".star-horse-left").removeClass("animate__animated animate__bounceInLeft");
  }, 1000);

  //添加浏览器事件，当从其它地方切换过来时，检查session 是否超时
  window.addEventListener("visibilitychange", () => {
    // if (!document.hidden) {}
  });
  window.addEventListener("mouseup", () => {
    dragging.value = false;
  });
});

let drawer = ref<boolean>(false);
const configInfo = computed(() => configStore.configFormInfo);
</script>
<template>
  <el-config-provider :locale="zh">
    <el-container class="star-horse-container">
      <el-header class="star-horse-header">
        <header-comp :is-collapse="!isCollapse" @changeLang="changeLang" @layoutConfig="layoutConfig"/>
      </el-header>
      <el-container class="star-horse-container-main">
        <el-aside
            :width="(configInfo.menusCfg == 'tradition' ? outerIsCollapse : 90) + 'px'"
            ref="mainLeftAside"
            class="star-horse-left"
            @mouseover="mouseOver"
            @mouseout="mouseOut"
        >
          <left-menu
              v-if="configInfo.menusCfg == 'tradition'"
              :sysem-id="sysemId"
              :is-collapse="!isCollapse"
              @collapseOperation="collapseOperation"
          />
          <FixedMenu
              :sysem-id="sysemId"
              :top="configInfo.shortCutMenus == 'N' ? '53px' : '83px'"
              v-if="configInfo.menusCfg == 'fixed'"
          />
        </el-aside>
        <div
            v-if="configInfo.menusCfg == 'tradition'"
            ref="resizerRef"
            class="vertical"
            @mousemove="dragStart"
            @mousedown="mouseDow"
            style="user-select: none;"
        >
        </div>
        <el-main class="star-horse-main animate__animated animate__bounceInUp">
          <tags-view v-if="configInfo.tagsView == 'Y'"/>
          <router-view v-slot="{ Component }">
            <transition name="solid">
              <keep-alive :include="cachedDatas">
                <Suspense>
                  <component :is="Component"/>
                  <template #fallback> 数据加载中...</template>
                </Suspense>
              </keep-alive>
            </transition>
          </router-view>
          <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
        </el-main>
      </el-container>
    </el-container>
    <el-drawer v-model="drawer" :direction="direction">
      <template #header>
        <h3>操作习惯配置</h3>
      </template>
      <template #default>
        <el-card class="inner_content operation-area">
          <page-config/>
        </el-card>
      </template>
      <template #footer></template>
    </el-drawer>
  </el-config-provider>
</template>
<style lang="scss" scoped>
:deep(.el-header) {
  height: unset;
  padding: unset;
}

.operation-area {
  height: 100%;
  overflow: hidden;
}

.vertical {
  z-index: 1500;
  position: relative;
  box-sizing: border-box;
  background: padding-box var(--star-horse-background);
  display: flex;
  justify-content: center;
  vertical-align: middle;
  align-items: center;
  width: 9px;

  &:hover {
    margin: 2px auto;
    background-color: var(--star-horse-style);
    border-left: 2px solid transparent;
    border-right: 2px solid transparent;
    cursor: col-resize;

    &::after {
      content: "║";
      color: white;
      font-size: 14px;
      position: absolute;
      width: 12px;
      left: 50%;
      transform: translateX(-50%);
    }
  }
}

.moveBox {
  width: 10px;
  height: 100%;
  border: 1px solid var(--star-horse-style);
  line-height: 100%;
  color: var(--star-horse-style);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;

  &:hover {
    cursor: col-resize;
  }
}

.el-menu--collapse {
  width: 100%;
  height: 100%;
}

:deep(.el-drawer__close-btn) {
  background-color: unset;

  svg {
    color: unset !important;
  }
}
</style>
