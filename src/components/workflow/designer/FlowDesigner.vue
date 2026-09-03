/**
 * 流程设计器主组件（从 shdevopsui 的 FlowDesign.vue 移植并解耦）。
 *
 * 与原版差异：
 * - 移除 vue-router 依赖：不再从路由 query 读取流程定义 ID 加载数据，
 *   节点树数据完全由外部通过 FlowDesign Store 注入（flowSetNode / setNode），
 *   使其可嵌入对话框（如表单设计器的"在线设计流程"）或独立页面。
 * - 移除 appInstance 全局组件注册：改由宿主项目调用 registerWorkflowDesigner()。
 * - 保留缩放、缩略图、属性面板等完整设计能力。
 *
 * 使用方式：
 * ```vue
 * <FlowDesigner :stopInitFormInfo="true" ref="designerRef" />
 * ```
 * 读取设计结果：designerRef.value.nodeData（即节点树根节点）。
 */
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import html2canvas from "html2canvas";
import { useFlowDesignStore } from "@/store/FlowDesign";
import { piniaInstance } from "star-horse-lowcode";
import { dlog } from "@/utils/debugLog";
import { scale } from "@/components/workflow/utils/deviceUtil";
import PrepIndex from "@/components/workflow/designer/preps/PrepIndex.vue";
import "@/components/workflow/designer/styles/flow-designer.scss";

const props = defineProps({
  /** 是否显示发布/保存按钮（独立流程管理页使用，嵌入表单设计器时关闭） */
  saveBtnVisible: {
    type: Boolean,
    default: true,
  },
  /** 是否显示小地图按钮 */
  mapBtnVisible: {
    type: Boolean,
    default: false,
  },
  /** 是否显示缩放按钮 */
  zoomBtnVisible: {
    type: Boolean,
    default: true,
  },
  /** 初始化时不重置流程表单信息（嵌入场景传入 true） */
  stopInitFormInfo: {
    type: Boolean,
    default: false,
  },
  /** 初始节点树（回显已有流程设计，如 formInfo.flowConfigures.process） */
  initialNode: {
    type: Object,
    default: () => ({}),
  },
});

const flowDesign = useFlowDesignStore(piniaInstance);
let zoomValue = ref<number>(100);
let zoomStyle = computed(() => {
  const zoom = zoomValue.value / 100;
  return {
    zoom: zoom,
  };
});
let nodeData = computed(() => flowDesign.node);
let readable = computed(() => flowDesign.readable);
let mapVisible = computed(() => flowDesign.mapVisible);

const saveAsPng = async () => {
  const element: HTMLElement = document.getElementById(
    "sh-flow-editor-content",
  )!;
  element.parentElement!.style.transform = "scale(1)";
  const canvas = await html2canvas(element, {
    backgroundColor: "#efefef",
  });
  const image = canvas
    .toDataURL("image/png")
    .replace("image/png", "image/octet-stream");
  let link = document.createElement("a");
  link.download = `star-flow-${Date.now()}.png`;
  link.href = image;
  link.click();
};

const init = () => {
  dlog("[FlowDesigner] init() called, initialNode keys:", props.initialNode ? Object.keys(props.initialNode).length : "no prop");
  flowDesign.init(props.stopInitFormInfo);
  if (props.initialNode && Object.keys(props.initialNode).length > 0) {
    dlog("[FlowDesigner] init() restoring initialNode");
    flowDesign.flowSetNode(props.initialNode);
  } else if (!nodeData.value || Object.keys(nodeData.value).length == 0) {
    flowDesign.flowSetNode(null);
  }
  dlog("[FlowDesigner] init() done, node childNode:", !!nodeData.value?.childNode);
};

onMounted(() => {
  init();
});

defineExpose({
  nodeData,
});
</script>
<template>
  <div class="designer-wrap">
    <div class="designer-content-box h-full">
      <div class="sh-flow-editor-wrap" :class="{ 'mobile-flow': scale.isMobile() }">
        <div
          id="sh-flow-editor"
          class="sh-flow-editor-container"
          :style="zoomStyle"
        >
          <div id="sh-flow-editor-content" class="sh-flow-editor-content">
            <FlowNode :node="nodeData" :readable="readable" />
          </div>
        </div>
        <FlowHelper v-if="!readable" />
        <FlowTips v-if="readable" />
        <FlowZoom
          v-model:zoomValue="zoomValue"
          @saveImage="saveAsPng"
          :saveBtnVisible="saveBtnVisible"
          :mapBtnVisible="mapBtnVisible"
          :zoomBtnVisible="zoomBtnVisible"
        />
        <FlowMap v-if="mapVisible && !scale.isMobile()" />
        <PrepIndex v-if="!readable" />
      </div>
    </div>
  </div>
</template>