<script lang="ts" setup>
import AppHeader from "@/components/AppHeader.vue";
import AppLeft from "@/components/AppLeft.vue";
import router from "@/router";
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {navBarList} from "@/store/NavbarListStore";
import {viewList} from "@/store/ViewCacheStore";
import TagsView from "@/components/tags/TagsView.vue";
import zhCn from 'element-plus/dist/locale/zh-cn.mjs'
import en from 'element-plus/dist/locale/en.mjs'
import {Config} from "@/api/settings.js";
import {warning} from "@/utils/message.ts";
import {LangType} from "@/theme/theme.ts";

const route = router.getRoutes().find(item => item.path == "/home");
let navBarListStore = navBarList();
let viewListStore = viewList();
let isCollapse = ref<boolean>(true);
let sysemId = ref<string>("-1");
let outerIsCollapse = ref<number>(64);
navBarListStore.addNavBar(route);
let locale = ref();
const changeLang = (lang: LangType) => {
  locale.value = lang == LangType.ZH_CN ? zhCn : en;
};
const loadMenuFun = (data: string) => {
  sysemId.value = data;
}
provide("loadMenu", loadMenuFun);
const mouseOver = () => {
  jQuery(".star-horse-left").addClass('show-scroll-bar');
};
const mouseOut = () => {
  jQuery(".star-horse-left").removeClass('show-scroll-bar');
};

const collopseOperation = () => {
  isCollapse.value = !isCollapse.value;
};


watch(
    () => isCollapse.value,
    (val: boolean) => {
      setTimeout(function () {
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
  resizerRef.value.onmousedown = dragStart;
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
  console.log(outerIsCollapse.value);
};
</script>
<template>
  <el-config-provider :locale="locale">
    <el-container style="height: 100%">
      <el-header class="star-horse-header">
        <app-header :is-collapse="!isCollapse" @collopseOperation="collopseOperation" @changeLang="changeLang"/>
      </el-header>
      <el-container style="padding-bottom: 1px !important;">
        <el-aside :width="outerIsCollapse+'px'" ref="mainLeftAside"
                  class="star-horse-left animate__animated animate__bounceInLeft"
                  @mouseover="mouseOver" @mouseout="mouseOut">
          <app-left :sysem-id="sysemId" :is-collapse="!isCollapse" style="overflow-x: hidden"/>
          <span
              ref="resizerRef"
              class="Resizer vertical"
              @mousedown="dragStart">
            ⁝
          </span>
        </el-aside>
        <el-main class="star-horse-main  animate__animated animate__bounceInUp">
          <tags-view/>
          <router-view v-slot="{ Component }" class="animate__animated animate__fadeIn">
            <transition name="solid">
              <keep-alive :include="viewListStore.getViewCache">
                <component :is="Component"/>
              </keep-alive>
            </transition>
          </router-view>
          <div class="main-copyright">{{ Config.footerTxt }}</div>
        </el-main>
      </el-container>
    </el-container>
    <el-backtop :bottom="100">
      <div class="page-up">
        UP
      </div>
    </el-backtop>
  </el-config-provider>
</template>


<style lang="scss" scoped>
.el-header {
  box-shadow: 0px 10px 5px var(--star-horse-white);
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
  background: padding-box rgb(240, 240, 240);
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


:deep(.el-aside) {
  overflow: hidden;
}

.main-copyright {
  display: flex;
  margin-top: 3px;
  line-height: 30px;
  border-radius: 2px;
  font-weight: bold;
  align-items: center;
  justify-content: center;
  background: #fff;
  width: 100%;
}
</style>
