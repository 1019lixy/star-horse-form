<template>
  <div class="designer-wrap">
    <div class="designer-content-box" :style="{ height: readable ? '100vh' : 'calc(100vh - 50px)' }">
      <div class="flow-design-wrap">
        <div id="flow-design" class="flow-design-container" :style="zoomStyle">
          <div id="flow-design-content" class="flow-design-content">
            <!--            {{nodeData}}-->
            <FlowStartNode :node="nodeData"/>
            <FlowNode :node="nodeData" :readable="readable"/>
            <FlowEndNode :node="nodeData" :readable="readable"/>
          </div>
        </div>
        <FlowHelper v-if="!readable"/>
        <FlowTips v-if="readable"/>
        <FlowZoom v-model:zoomValue="zoomValue"/>
        <FlowMap v-if="!scale.isMobile()"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {getStartNode} from '@/views/workflow/plugin/util/nodeUtil';
import FlowZoom from '@/views/workflow/plugin/Common/FlowZoom.vue';
import FlowMap from '@/views/workflow/plugin/Common/FlowMap.vue';
import FlowHelper from '@/views/workflow/plugin/Common/FlowHelper.vue';
import FlowTips from '@/views/workflow/plugin/Common/FlowTips.vue';
import FlowNode from '@/views/workflow/plugin/FlowNode/index.vue';
import FlowStartNode from '@/views/workflow/plugin/FlowNode/Start/index.vue';
import FlowEndNode from '@/views/workflow/plugin/FlowNode/End/index.vue';
import {computed, onMounted, ref} from "vue";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {scale} from "@/views/workflow/plugin/util/deviceUtil.ts";

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
const init = () => {
  flowDesign.flowSetNode(getStartNode());
}
onMounted(() => {
  init();
});
defineExpose({
  nodeData
});
</script>
