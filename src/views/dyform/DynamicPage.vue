<script lang="ts" setup name="DynamicPage">
import {nextTick, onMounted, ref} from "vue";
import {apiInstance} from "@/api/sh_api";
import Guides from "vue3-guides";
import {VueInfiniteViewer} from "vue3-infinite-viewer"
import {i18n} from "@/lang";
import PageHeader from "@/views/dyform/page/PageHeader.vue";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicPage");
const horizontalGuides = ref();
const verticalGuides = ref();
const vueInfiniteViewerRef = ref();
let panelModel = ref<string>("first");
let scrollX = ref<number>(0);
let scrollY = ref<number>(0);
const initGuides = async () => {

  await nextTick(() => {
    horizontalGuides.value?.resize();
    verticalGuides.value?.resize();
    window.addEventListener("resize", () => {
      horizontalGuides.value?.resize();
      verticalGuides.value?.resize();
    });
    window.addEventListener("wheel", e => {
      scrollX.value += e.deltaX;
      scrollY.value += e.deltaY;
      horizontalGuides.value?.scroll(scrollX.value);
      horizontalGuides.value?.scrollGuides(scrollY.value);
      verticalGuides.value?.scroll(scrollY.value);
      verticalGuides.value?.scrollGuides(scrollX.value);
    });
  });

}
const init = async () => {
  await initGuides();
};
const onChange = (e: any) => {
  console.log(e);
}
const viewScroller = (e: any) => {
  let type = e.currentTarget.horizontalScrollbar.type;
  if (type == "horizontal") {
    horizontalGuides.value?.scroll(e.scrollLeft);
    horizontalGuides.value?.scrollGuides(e.scrollTop);
  } else {
    verticalGuides.value?.scroll(e.scrollTop);
    verticalGuides.value?.scrollGuides(e.scrollLeft);
  }
}
const onRestore = () => {
  scrollX.value = 0;
  scrollY.value = 0;
  horizontalGuides.value?.scroll(0);
  horizontalGuides.value?.scrollGuides(0);
  verticalGuides.value?.scroll(0);
  verticalGuides.value?.scrollGuides(0);
  vueInfiniteViewerRef.value?.scrollCenter();
}
onMounted(async () => {
  await init();
});
</script>
<template>
  <el-card class="inner_content">
    <page-header/>
    <div class="page-content">
      <div class="panel">
        <el-tabs style="width: 100%;height: 100%;background: #1d2129;border: none" tab-position="left"
                 type="border-card" v-model="panelModel">
          <el-tab-pane label="基础信息" name="first">
          </el-tab-pane>
          <el-tab-pane label="高级信息" name="second">
          </el-tab-pane>
          <el-tab-pane label="扩展信息" name="third">
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="page">
        <div class="box" @click="onRestore" ref="box">
          <star-horse-icon icon-class="reset" color="#fefefe"/>
        </div>
        <div class="ruler horizontal">
          <Guides
              ref="horizontalGuides"
              type="horizontal"
              v-bind:rulerStyle="{
                left: '30px',
                width: 'calc(100% - 30px)',
                height: '30px',
              }"
          />
        </div>
        <div class="ruler vertical">
          <Guides
              ref="verticalGuides"
              type="vertical"
              displayDragPos="true"
              v-bind:rulerStyle="{
                top: '30px',
                height: 'calc(100% - 30px)',
                width: '30px',
             }"
              v-on:changeGuides="onChange"
          />
        </div>
        <VueInfiniteViewer
            ref="vueInfiniteViewerRef"
            :usePinch="true"
            :useWheelScroll="()=>{
              return true;
            }"
            :maxPinchWheel="3"
            :zoom="1"
            @scroll="viewScroller"
            class="viewer">
          <div class="viewport">AA</div>
        </VueInfiniteViewer>

      </div>
      <div class="property">

      </div>
    </div>
    <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
  </el-card>
</template>


<style lang="scss" scoped>
:deep(.el-tabs__content) {
  padding: 5px;
}

.viewer {
  display: flex;
  flex: 1;
  position: absolute !important;
  left: calc(30px);
  top: 30px;
  height: 100%;
  width: calc(100% - 30px);
  height: calc(100% - 30px);

}

:deep(.el-tabs__header) {
  background: #1d2129;
  border: none;
}

:deep(.el-tabs__item) {
  height: 80px !important;
  display: flex;
  padding: 0 5px;
  align-items: center;
  justify-content: center !important;
  vertical-align: middle !important;
  writing-mode: vertical-lr;
  flex-direction: row !important;
  text-align: center;
}

.page-header {
  height: 50px;
  background-color: #1d2129;
  border-bottom: 1px solid #4e5969;
  color: #c9ddd4;
  display: flex;
  justify-content: space-between;
}

.page-content {
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;

  .panel {
    width: 200px;
    height: inherit;
    background-color: #1d2129;
    border-bottom: 1px solid #4e5969;
    color: #c9ddd4;
    display: flex;
    justify-content: space-between;
  }

  .page {
    position: relative;
    flex: 1;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: #86909c;

    .container {
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
  }

  .property {
    border-left: 1px solid #4e5969;
    width: 260px;
    background-color: #272e3b;
    color: #fff;
    display: flex;
    min-height: 35px;
    min-width: 35px;
  }
}

a {
  text-decoration: none;
  color: #333;
}

.ruler {
  position: absolute;
  top: 0;
  left: 0;
}

.ruler.horizontal {
  left: 0;
  width: 100%;
  height: 30px;
}

.ruler.vertical {
  top: 0;
  width: 30px;
  height: 100%;
}

.box {
  position: relative;
  width: 30px;
  height: 30px;
  background: #444;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  cursor: pointer;
  z-index: 21;
}

.container {
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  max-width: calc(100% - 60px);
  width: 100%;
}


</style>

