<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import Guides from "vue3-guides";
import { VueInfiniteViewer } from "vue3-infinite-viewer";
defineOptions({
  name: "StarHorseRuler"

});
defineProps({
  needInfiniteViewer: { type: Boolean, default: true },
  theme: { type: String, default: "light" },
})
const horizontalGuides = ref();
const verticalGuides = ref();
const vueInfiniteViewerRef = ref();
const scrollX = ref(0);
const scrollY = ref(0);
const onChange = () => {

}
const onRestore = () => {
  horizontalGuides.value?.scroll(0);
  horizontalGuides.value?.scrollGuides(0);
  verticalGuides.value?.scroll(0);
  verticalGuides.value?.scrollGuides(0);
  vueInfiniteViewerRef.value?.scrollTo(0, 0);
  vueInfiniteViewerRef.value?.resize();
}
const resizeFun = (e: any) => {
  horizontalGuides.value?.resize();
  verticalGuides.value?.resize();
}
const sheelFun = (e: any) => {
  scrollX.value += e.deltaX;
  scrollY.value += e.deltaY;
  horizontalGuides.value?.scroll(scrollX.value);
  horizontalGuides.value?.scrollGuides(scrollY.value);
  verticalGuides.value?.scroll(scrollY.value);
  verticalGuides.value?.scrollGuides(scrollX.value);
}
const initGuides = () => {
  nextTick(() => {
    setTimeout(() => {
      horizontalGuides.value?.resize();
      verticalGuides.value?.resize();
    }, 500);
    window.addEventListener("resize", resizeFun);
    window.addEventListener("wheel", sheelFun);
  });

};
const viewScroller = (e: any) => {
  let type = e.currentTarget.horizontalScrollbar.type;
  if (type == "horizontal") {
    horizontalGuides.value?.scroll(e.scrollLeft);
    horizontalGuides.value?.scrollGuides(e.scrollTop);
  } else {
    verticalGuides.value?.scroll(e.scrollTop);
    verticalGuides.value?.scrollGuides(e.scrollLeft);
  }
};
/**
 * 初始化
 */
const init = () => {
  initGuides();
};
onMounted(() => {
  init();
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", resizeFun);
  window.removeEventListener("wheel", sheelFun);
})
</script>
<template>
  <div class="h-full w-full relative">
    <div class="relative h-[30px] w-[30px] box-border flex items-center z-[21]" @click="onRestore" ref="box">
      <star-horse-icon icon-class="reset" />
    </div>
    <div class="absolute left-0 top-0 w-full h-[30px]">
      <Guides ref="horizontalGuides" type="horizontal" v-bind:rulerStyle="{
        left: '30px',
        width: 'calc(100% - 30px)',
        height: '30px'
      }" />
    </div>
    <div class="absolute left-0 top-0 h-full w-[30px]">
      <Guides ref="verticalGuides" type="vertical"  displayDragPos="true"  v-bind:rulerStyle="{
        top: '30px',
        height: 'calc(100% - 30px)',
        width: '30px'
      }" v-on:changeGuides="onChange" />
    </div>
    <VueInfiniteViewer v-if="needInfiniteViewer" ref="vueInfiniteViewerRef" :usePinch="true" :useWheelScroll="true" :maxPinchWheel="1" :zoom="1" @scroll="viewScroller" class="viewer">
      <slot></slot>
    </VueInfiniteViewer>
    <div v-else class="viewer">
      <slot></slot>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.viewer {
  display: flex;
  flex: 1;
  position: absolute !important;
  left: calc(30px);
  top: 30px;
  width: calc(100% - 30px);
  height: calc(100% - 30px);
}
</style>
