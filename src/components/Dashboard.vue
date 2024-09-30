<script lang="ts" setup>
import router from "@/router";
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {navBarList} from "@/store/NavbarListStore";
import {viewList} from "@/store/ViewCacheStore";
import TagsView from "@/components/tags/TagsView.vue";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import {warning} from "@/utils/message.ts";
import {LangType} from "@/theme/theme.ts";
import {getLang} from "@/theme/localStorge.ts";
import {i18n} from "@/lang";
import piniaInstance from "@/store";
import LeftMenu from "@/components/LeftMenu.vue";
import HeaderComp from "@/components/HeaderComp.vue";
import PageConfig from "@/components/PageConfig.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import FixedMenu from "@/components/FixedMenu.vue";

let configStore = GlobalConfig(piniaInstance);
const route = router.getRoutes().find(item => item.path == "/home");
let viewListStore = viewList(piniaInstance);
const navBarListStore = navBarList(piniaInstance);
const cachedDatas = computed(() => viewListStore.viewListDatas);
let isCollapse = ref<boolean>(true);
let sysemId = ref<string>("-1");
let outerIsCollapse = ref<number>(64);

let locale = ref();
let direction = ref();
const changeLang = (lang: LangType, _isInit: boolean) => {
  locale.value = lang == LangType.ZH_CN ? zhCn : en;
  // console.log(isInit);
};
const layoutConfig = () => {
  drawer.value = true;
}
const loadMenuFun = (data: string) => {
  sysemId.value = data;
}
provide("loadMenu", loadMenuFun);
const mouseOver = () => {
  if (configInfo.value.menusCfg == "fixed") {
    return;
  }
  $(".star-horse-left").addClass('show-scroll-bar');
};
const mouseOut = () => {
  $(".star-horse-left").removeClass('show-scroll-bar');
};
const collopseOperation = () => {
  isCollapse.value = !isCollapse.value;
};
watch(
    () => isCollapse.value,
    (val: boolean) => {
      setTimeout(() => {
        outerIsCollapse.value = val ? 200 : 64;
      }, 200);
    }, {
      immediate: true
    }
)
let currentX = ref<number>(0);
let dragging = ref<boolean>(false);
let mainLeftAside = ref();
let resizerRef = ref();
const dragStart = (event: MouseEvent) => {
  // event.preventDefault();
  if (configInfo.value.menusCfg != 'tradition') {
    return;
  }
  currentX.value = event.x;
  dragging.value = true;
  document.onmousemove = (_e) => {
    if (_e.clientX % 2 == 0) {
      compDragging(_e.clientX);
    }
  };
  document.onmouseup = () => {
    dragging.value = false;
    document.onmouseup = null;
    document.onmousemove = null;
  };
};
onMounted(async () => {
  await nextTick();
  if (resizerRef.value) {
    resizerRef.value.onmousedown = dragStart;
  }
  changeLang(getLang(), true);
  navBarListStore.addNavBar(route);
  configStore.clearAll();
  $(".star-horse-left").addClass("animate__animated animate__bounceInLeft");
  setTimeout(() => {
    $(".star-horse-left").removeClass("animate__animated animate__bounceInLeft");
  }, 1000);
  //添加浏览器事件，当从其它地方切换过来时，检查session 是否超时
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) {
      // router.go(router.currentRoute.value);
     // document.location.reload();
    }
  });
})
// 移动完成
const compDragging = (x: number) => {
  if (!dragging.value) {
    return;
  }
  if (!isCollapse.value) {
    dragging.value = false;
    warning("隐藏状态不能拖动");
    return;
  }
  let move = (currentX.value - x) / 50;
  outerIsCollapse.value = outerIsCollapse.value - move;
  //设置最小和最大宽带
  if (outerIsCollapse.value <= 64) {
    isCollapse.value = false;
    outerIsCollapse.value = 64;
  } else if (outerIsCollapse.value >= 500) {
    outerIsCollapse.value = 500;
  }
};
let drawer = ref<boolean>(false);
const configInfo = computed(() => configStore.configFormInfo);

</script>
<template>
  <el-config-provider :locale="locale">
    <el-container class="star-horse-container">
      <el-header class="star-horse-header">
        <header-comp :is-collapse="!isCollapse" @changeLang="changeLang" @layoutConfig="layoutConfig"/>
      </el-header>
      <el-container class="star-horse-container-main">
        <el-aside :width="(configInfo.menusCfg=='tradition'?outerIsCollapse:90)+'px'" ref="mainLeftAside"
                  class="star-horse-left" @mouseover="mouseOver" @mouseout="mouseOut">
          <left-menu v-if="configInfo.menusCfg=='tradition'" :sysem-id="sysemId" :is-collapse="!isCollapse"
                     @collopseOperation="collopseOperation"/>
          <span v-if="configInfo.menusCfg=='tradition'"
                ref="resizerRef"
                class="Resizer vertical"
                @mousedown="dragStart">
            ⁝
          </span>
          <FixedMenu :sysem-id="sysemId" :top="configInfo.shortCutMenus=='N'?'53px':'83px'"
                     v-if="configInfo.menusCfg=='fixed'"/>
        </el-aside>
        <el-main class="star-horse-main animate__animated animate__bounceInUp">
          <!--          <el-header class="star-horse-header" v-if="configInfo.menusCfg=='fixed'">
                      <header-comp :is-collapse="!isCollapse" @changeLang="changeLang"/>
                    </el-header>-->
          <tags-view v-if="configInfo.tagsView=='Y'"/>
          <router-view v-slot="{ Component }">
            <transition name="solid">
              <keep-alive :include="cachedDatas">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
          <!--          <router-view v-slot="{ Component, route }">
                      <transition name="router-fade" mode="out-in">
                        <keep-alive :include="cachedDatas">
                          <component :is="Component" :key="route.fullPath"/>
                        </keep-alive>
                      </transition>
                    </router-view>-->
          <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
        </el-main>
      </el-container>
    </el-container>
    <!--    <div class="main-config" @click="drawer=true">
          <el-tooltip content="主题设置">
            <star-horse-icon icon-class="setting" color="var(&#45;&#45;star-horse-style)"/>
          </el-tooltip>
        </div>-->
    <el-drawer v-model="drawer" :direction="direction">
      <template #header>
        <h3>操作习惯配置</h3>
      </template>
      <template #default>
        <el-card class="inner_content operation-area">
          <page-config/>
        </el-card>
      </template>
      <template #footer>
      </template>
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

.Resizer.vertical {
  width: 5px;
  margin: 0px -2px;
  border-left: 2px solid transparent;
  border-right: 2px solid transparent;

  &:hover {
    background-color: var(--star-horse-style);
    cursor: col-resize;
  }
}

.Resizer {
  z-index: 1;
  box-sizing: border-box;
  background: padding-box var(--star-horse-background);
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

/*:deep(.el-aside) {
  overflow: hidden;
}*/

/*.main-config {
  position: absolute;
  top: 50%;
  right: 1px;
  border-radius: 3px;
  background: var(--star-horse-font-color);

  &:hover, svg:hover {
    cursor: pointer;
  }
}*/
:deep(.el-drawer__close-btn) {
  background-color: unset;

  svg {
    color: unset !important;
  }
}


</style>
