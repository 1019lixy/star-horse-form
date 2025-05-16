<template>
  <div id="sh-flow-editor-map" class="sh-flow-editor-map">
    <img :src="mapImg"/>
    <div
        id="sh-flow-editor-map-mask"
        class="map-mask"
        :style="mapMask"
        @mousedown="handleMouseDown"
        @mouseup="handleMouseUp"
        @mouseleave="handleMouseUp"
    ></div>
  </div>
</template>
<script setup lang="ts">
import {computed, nextTick, onBeforeUnmount, onMounted, ref} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign.ts";
import {piniaInstance} from "star-horse-lowcode";

const props = defineProps({
  element: {
    type: String,
    default: "#sh-flow-editor-content"
  }
});
const flowDesignStore = useFlowDesignStore(piniaInstance);
const mapImg = computed(() => flowDesignStore.mapImg);
// 流程设计窗口
let flowDesign = ref<any>(null);
// 地图窗口
let flowMap = ref<any>(null);
// 地图窗口占比窗口(红色窗口)
let flowMapMsk = ref<any>(null);
// 流程设计整体高度,包含滚动条隐藏高度
let wrapHeight = ref<number>(0);
// 地图红色窗口top位置
let top = ref<number>(0);
// 鼠标是否点击
let mouseDown = ref<boolean>(false);
let scroll = ref<boolean>(false);
// 流程图视窗高度
const containerHeight = computed(() => {
  if (flowDesign.value) {
    return flowDesign.value.clientWeight;
  }
  return 0;
});
const scaleHeight = computed(() => containerHeight.value / wrapHeight.value);
const scaleOffsetHeight = computed(() => {
  if (!flowMap.value && wrapHeight.value) {
    return 1;
  }
  return flowMap.value.clientHeight / wrapHeight.value;
});
// 地图窗口占比窗口(红色窗口)样式
const mapMask = computed(() => {
  return {
    width: "100%",
    height: `${scaleHeight.value * 100}%`,
    left: "0px",
    top: `${top.value}px`
  };
});
const initSize = (flowDesign: any) => {
  wrapHeight.value = flowDesign.scrollHeight;
};
const handleScroll = (e: MouseEvent) => {
  top.value = flowDesign.value.scrollTop * scaleOffsetHeight.value;
};
const handleMouseDown = (e: MouseEvent) => {
  mouseDown.value = true;
};
const handleMouseMove = (e: MouseEvent) => {
  if (mouseDown.value) {
    const directionY = e.movementY || e.mozMovementY || e.webkitMovementY || 0;
    if (directionY >= 0 && flowMapMsk.value.offsetHeight + top.value < flowMap.value.offsetHeight) {
      top.value++;
    } else if (top.value > 0) {
      top.value--;
    }
    flowDesign.value.scrollTop = top.value / scaleOffsetHeight.value;
  }
};
const handleMouseUp = (e: MouseEvent) => {
  mouseDown.value = false;
  document.onmousemove = document.onmouseup = null;
};
let timer: any = null;
const init = async () => {
  await nextTick();
  flowDesign.value = document.querySelector("#sh-flow-editor");
  flowMap.value = document.querySelector("#sh-flow-editor-map");
  flowMapMsk.value = document.querySelector("#sh-flow-editor-map-mask");
  initSize(flowDesign.value);
  flowDesignStore.refreshMap();
  // 监听滚动条
  window.addEventListener("scroll", handleScroll, true);
  // 监听出现滚动条
  timer = setInterval(() => {
    if (flowDesign.value.scrollHeight > flowDesign.value.clientHeight) {
      scroll.value = true;
    } else {
      scroll.value = false;
    }
    initSize(flowDesign.value);
  }, 1000);
  // 监听鼠标移动
  window.addEventListener("mousemove", handleMouseMove);
  // 监听页面的mouseleave事件，当鼠标移出浏览器页面可用区域 并 松开按键时，停止拖动
  window.addEventListener("mouseleave", handleMouseUp);
};
onBeforeUnmount(() => {
  clearInterval(timer);
});
onMounted(async () => {
  await init();
});
</script>
