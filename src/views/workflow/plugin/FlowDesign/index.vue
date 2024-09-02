<template>
  <div class="designer-wrap">
    <FlowNav v-if="navable && !readable" :currentNav="3" @click="publish" @change="change"/>
    <div class="designer-content-box" :style="{ height: readable ? '100vh' : 'calc(100vh - 50px)' }">
      <div class="flow-design-wrap">
        <div id="flow-design" class="flow-design-container" :style="zoomStyle">
          <div id="flow-design-content" class="flow-design-content">
            <FlowStartNode :node="nodeData"/>
            <FlowNode :node="nodeData" :readable="readable"/>
            <FlowEndNode :node="nodeData" :readable="readable"/>
          </div>
        </div>
        <FlowHelper v-if="!readable"/>
        <FlowTips v-if="readable"/>
        <FlowZoom v-model="zoomValue"/>
        <FlowMap v-if="!isMobile"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {flowMixin} from '../mixins/flowMixin';
import {getStartNode} from '../util/nodeUtil';
import FlowZoom from '../Common/FlowZoom.vue';
import FlowMap from '../Common/FlowMap.vue';
import FlowNav from '../Common/FlowNav.vue';
import FlowHelper from '../Common/FlowHelper.vue';
import FlowTips from '../Common/FlowTips.vue';
import FlowNode from '../FlowNode/index.vue';
import FlowStartNode from '../FlowNode/Start';
import FlowEndNode from '../FlowNode/End';
import {computed, onMounted, ref} from "vue";

const props = defineProps({
  node: {
    type: Object,
    default: function () {
      return getStartNode();
    },
  },
  navable: {
    type: Boolean,
    default: true,
  },
  readable: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["publish"]);
let zoomValue = ref<number>(100);
let zoomStyle = computed(() => {
  const zoom = zoomValue.value / 100;
  return {
    zoom: zoom,
  };
});
let nodeData = computed(() => store.getters['flow/node']);
const toReturn = () => {
}
const change = (type) => {
}
const handleSave = () => {
}
const getData = () => {
  return nodeData;
}
const publish = () => {
  emits('publish', nodeData);
}
const init = () => {
  store.dispatch('flow/setNode', props.node);
}
onMounted(() => {
  init();
});

</script>
