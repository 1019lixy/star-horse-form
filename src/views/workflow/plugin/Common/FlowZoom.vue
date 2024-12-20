<template>
  <div class="sh-flow-editor-operate">
    <div class="flow-btn" @click="saveImage">
      <el-tooltip content="保存图片">
        <star-horse-icon icon-class="image" cursor="pointer"/>
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="viewCode">
      <el-tooltip content="查看代码">
        <star-horse-icon icon-class="code" cursor="pointer"/>
      </el-tooltip>
    </div>
    <div class="sh-flow-editor-zoom">
      <div class="sh-flow-editor-zoom-less" @click="onZoomOut"></div>
      <span>{{ zoomValue }}%</span>
      <div class="sh-flow-editor-zoom-more" @click="onZoomIn"></div>
    </div>
  </div>
  <el-drawer
      v-model="drawer"
      size="500px"
      class="drawer"
      :append-to-body="true"
      :modal="false"
      :with-header="false">
    <div style="height: 100vh">
      <div style="padding: 1px; background-color: #3883fa">
        <el-button
            type="primary"
            plain
            @click="copyParseJson">
          复制格式化后的 JSON
        </el-button>
        <el-button
            type="primary"
            plain
            @click="copyJson">
          复制压缩后的 JSON
        </el-button>
        <el-button
            type="primary"
            plain
            @click="drawer = false">
          关闭弹窗
        </el-button>
      </div>
      <star-horse-json-editor
          class="editor"
          language="zh-CN"
          current-mode="view"
          v-model:modelValue="nodeData"/>
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import {ModelRef} from "vue-demi";
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import {computed, onActivated, onDeactivated, onMounted, ref} from "vue";
import {copy} from "@/api/sh_api.ts";

const INIT_ZOOM_VALUE = 100;
const MIN_ZOOM_VALUE = 10;
const MAX_ZOOM_VALUE = 300;
defineProps({
  min: {
    type: Number,
    required: false,
    default: MIN_ZOOM_VALUE,
  },
  max: {
    type: Number,
    required: false,
    default: MAX_ZOOM_VALUE,
  },
});
const flowDesign = useFlowDesign(piniaInstance);
const emits = defineEmits(["saveImage"]);
const zoomValue: ModelRef<number> = defineModel("zoomValue")!;
let nodeData = computed(() => flowDesign.node);
const drawer = ref(false);
const handleWeel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.wheelDelta < 0) {
    onZoomOut();
  } else {
    onZoomIn();
  }
}
const onZoomOut = () => {
  let value = zoomValue.value;
  value -= 5;
  if (value < MIN_ZOOM_VALUE) {
    value = MIN_ZOOM_VALUE;
  }
  zoomValue.value = value;
}
const onZoomIn = () => {
  let value = zoomValue.value;
  value += 5;
  if (value > MAX_ZOOM_VALUE) {
    value = MAX_ZOOM_VALUE;
  }
  zoomValue.value = value;
}
const saveImage = () => {
  emits('saveImage');
}
const copyParseJson = async () => {
  copy(JSON.stringify(nodeData.value, null, '  '))
}
const copyJson = async () => {
  copy(JSON.stringify(nodeData.value))
}
const viewCode = () => {
  drawer.value = true;
}
const init = () => {
  window.addEventListener("wheel", handleWeel, true);
}
onActivated(() => {
  init();
});
onDeactivated(() => {
  window.removeEventListener("wheel", handleWeel, true);
})
onMounted(() => {
  zoomValue.value = INIT_ZOOM_VALUE;
  init();
})
</script>
