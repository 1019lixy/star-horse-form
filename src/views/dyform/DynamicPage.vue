<script lang="ts" setup name="DynamicPage">
import {nextTick, onMounted, ref} from "vue";
import {apiInstance} from "@/api/sh_api";
import Guides from "vue3-guides";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {i18n} from "@/lang";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicPage");
const horizontalGuides = ref();
const verticalGuides = ref();
let panelModel = ref<string>("first");
let scrollX = ref<number>(0);
let scrollY = ref<number>(0);
const initGuides = async () => {

  await nextTick(() => {
    horizontalGuides.value.resize();
    window.addEventListener("resize", () => {
      horizontalGuides.value.resize();
      verticalGuides.value.resize();
    });
    window.addEventListener("wheel", e => {
      scrollX.value += e.deltaX;
      scrollY.value += e.deltaY;
      horizontalGuides.value.scroll(scrollX);
      horizontalGuides.value.scrollGuides(scrollY);
      verticalGuides.value.scroll(scrollY);
      verticalGuides.value.scrollGuides(scrollX);
    });
  });

}
const init = async () => {
  await initGuides();
};
const onChange = (e: any) => {
  console.log(e);
}
const onRestore = () => {
  scrollX.value = 0;
  scrollY.value = 0;
  horizontalGuides.value.scroll(0);
  horizontalGuides.value.scrollGuides(0);
  verticalGuides.value.scroll(0);
  verticalGuides.value.scrollGuides(0);
}
onMounted(async () => {
  await init();
});
</script>
<template>
  <el-card class="inner_content">
    <div class="page-header">
    </div>
    <div class="page-content">
      <div class="panel">
        <el-tabs style="width: 100%;height: 100%;background: #1d2129;border: none" tab-position="left" type="border-card" v-model="panelModel">
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
              ref="guides1"
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
              ref="guides2"
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

        <div class="container">
          <el-scrollbar>
            功能开发中
          </el-scrollbar>
        </div>

      </div>
      <div class="property"></div>
    </div>
    <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
  </el-card>
</template>


<style lang="scss" scoped>
:deep(.el-tabs__content){
  padding: 5px;
}
:deep(.el-tabs__header){
  background:  #1d2129;
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

