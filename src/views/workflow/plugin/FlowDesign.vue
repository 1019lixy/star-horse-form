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
        <FlowZoom
            v-model:zoomValue="zoomValue"
            @saveImage="saveAsPng"
            :saveBtnVisible="saveBtnVisible"
            :mapBtnVisible="mapBtnVisible"
            :zoomBtnVisible="zoomBtnVisible"
        />
        <FlowMap v-if="mapVisible && !scale.isMobile()"/>
        <PrepIndex v-if="!readable"/>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import html2canvas from "html2canvas";
import {scale} from "@/views/workflow/plugin/utils/deviceUtil";
import {useRouter} from "vue-router";
import {apiInstance, ApiUrls, piniaInstance} from "star-horse-lowcode";

defineProps({
  saveBtnVisible: {
    type: Boolean,
    default: true
  },
  mapBtnVisible: {
    type: Boolean,
    default: false
  },
  zoomBtnVisible: {
    type: Boolean,
    default: true
  }
});
const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowDefine");
const router = useRouter();
const flowDesign = useFlowDesignStore(piniaInstance);
let zoomValue = ref<number>(100);
let zoomStyle = computed(() => {
  const zoom = zoomValue.value / 100;
  return {
    zoom: zoom
  };
});
let nodeData = computed(() => flowDesign.node);
let readable = computed(() => flowDesign.readable);
let mapVisible = computed(() => flowDesign.mapVisible);
const saveAsPng = async () => {
  const element: HTMLElement = document.getElementById("sh-flow-editor-content")!;
  element.parentElement!.style.transform = "scale(1)";
  const canvas = await html2canvas(element, {
    backgroundColor: "#efefef"
  });
  const image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
  let link = document.createElement("a");
  link.download = `star-flow-${Date.now()}.png`;
  link.href = image;
  link.click();
};

const init = () => {
  flowDesign.init();
  if (!nodeData.value || Object.keys(nodeData.value).length == 0) {
    flowDesign.flowSetNode(null);
  }
};
const loadData = async () => {
  let id = router.currentRoute.value.query.data;
  let isView = router.currentRoute.value.query.isView;
  flowDesign.setReadable("Y" == isView);
  if (id) {
    let data = await dataUrl.loadByIdAction!(id, "Y" == isView);
    data["bindForm"] = data["bindForm"]?.split(";");
    data["flowManager"] = data["flowManager"]?.split(";");
    flowDesign.flowSetFormInfo(data);
    flowDesign.setNode(JSON.parse(data.jsonFile)?.process);
  }
};
onMounted(() => {
  init();
});
defineExpose({
  nodeData
});
watch(
    () => router.currentRoute.value.query,
    () => {
      loadData();
    },
    {immediate: true, deep: true}
);
</script>
