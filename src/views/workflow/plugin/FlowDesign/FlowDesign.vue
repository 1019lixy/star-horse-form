<template>
  <div class="designer-wrap">
    <div class="designer-content-box" :style="{ height: readable ? '100vh' : 'calc(100vh - 50px)' }">
      <div class="sh-flow-editor-wrap">
        <div id="sh-flow-editor" class="sh-flow-editor-container" :style="zoomStyle">
          <div id="sh-flow-editor-content" class="sh-flow-editor-content">
<!--            <FlowStartNode :node="nodeData"/>-->
            <FlowNode :node="nodeData" :readable="readable"/>
<!--            <FlowEndNode :node="nodeData" :readable="readable"/>-->
          </div>
        </div>
        <FlowHelper v-if="!readable"/>
        <FlowTips v-if="readable"/>
        <FlowZoom v-model:zoomValue="zoomValue" @saveImage="saveAsPng"/>
<!--        <FlowMap v-if="!scale.isMobile()"/>-->
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {getStartNode} from '@/views/workflow/plugin/util/nodeUtil';
import FlowZoom from '@/views/workflow/plugin/common/FlowZoom.vue';
import FlowMap from '@/views/workflow/plugin/common/FlowMap.vue';
import FlowHelper from '@/views/workflow/plugin/common/FlowHelper.vue';
import FlowTips from '@/views/workflow/plugin/common/FlowTips.vue';
import FlowNode from '@/views/workflow/plugin/FlowNode/FlowNode.vue';
import FlowStartNode from '@/views/workflow/plugin/FlowNode/StartNode.vue';
import FlowEndNode from '@/views/workflow/plugin/FlowNode/EndNode.vue';
import {computed, onMounted, ref, watch} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";
import html2canvas from "html2canvas";

const flowDesign = useFlowDesign(piniaInstance);
let zoomValue = ref<number>(100);
let zoomStyle = computed(() => {
  const zoom = zoomValue.value / 100;
  return {
    zoom: zoom,
  };
});
let nodeData = computed(() => flowDesign.node);
let readable = computed(() => flowDesign.readable);
// watch(() => nodeData.value,
//     () => {
//       flowDesign.refreshMap(true)
//     }, {
//       deep: true
//     })
const saveAsPng = async () => {
  const element: HTMLElement = document.getElementById('sh-flow-editor-content')!;
  element.parentElement!.style.transform = 'scale(1)'
  const canvas = await html2canvas(element, {
    backgroundColor: '#efefef'
  })
  const image = canvas.toDataURL('image/png').replace('image/png', 'image/octet-stream')
  let link = document.createElement('a')
  link.download = `star-flow-${Date.now()}.png`
  link.href = image
  link.click()
}
const init = () => {
  flowDesign.flowSetNode(getStartNode());
  flowDesign.init();
}
onMounted(() => {
  init();
});
defineExpose({
  nodeData
});
</script>
