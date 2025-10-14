<template>
  <star-horse-dialog
    :dialogVisible="dataDialogVisible"
    @closeAction="dataDialogVisible = false"
    :selfFunc="true"
    :boxWidth="'45%'"
    :full-screen="false"
    :compSize="flowCommon.size"
    @merge="dataDoSave"
    :title="'流程信息'"
  >
    <BasicInfo ref="basicInfoRef" :dialogFlag="true" />
  </star-horse-dialog>
  <div class="sh-flow-editor-operate">
    <div
      class="flow-btn"
      @click="saveData('publish')"
      v-if="saveBtnVisible && !readable"
    >
      <el-tooltip content="发布流程">
        <star-horse-icon icon-class="publish" cursor="pointer" />
      </el-tooltip>
    </div>
    <div
      class="flow-btn"
      @click="saveData('save')"
      v-if="saveBtnVisible && !readable"
    >
      <el-tooltip content="保存数据">
        <star-horse-icon icon-class="save" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="saveImage">
      <el-tooltip content="保存图片">
        <star-horse-icon icon-class="image" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="mapVisibleOperation" v-if="mapBtnVisible">
      <el-tooltip content="开启/关闭小地图">
        <star-horse-icon icon-class="map" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="viewCode">
      <el-tooltip content="查看代码">
        <star-horse-icon icon-class="code" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="exportCode">
      <el-tooltip content="导出Bpmn">
        <star-horse-icon icon-class="export" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="sh-flow-editor-zoom" v-if="zoomBtnVisible">
      <div class="sh-flow-editor-zoom-less" @click="onZoomOut"></div>
      <span>{{ zoomValue }}%</span>
      <div class="sh-flow-editor-zoom-more" @click="onZoomIn"></div>
    </div>
    <div class="flow-btn" @click="controlScale">
      <el-tooltip content="关闭/打开自动缩放">
        <star-horse-icon icon-class="scale" cursor="pointer" />
      </el-tooltip>
    </div>
    <div class="flow-btn" @click="goBack">
      <el-tooltip content="返回列表">
        <star-horse-icon icon-class="return" cursor="pointer" />
      </el-tooltip>
    </div>
  </div>
  <el-drawer
    v-model="drawer"
    size="500px"
    class="drawer"
    :show-close="true"
    :closable="true"
    @click-outside="drawer = false"
    :with-header="false"
  >
    <div style="height: 100vh">
      <div style="padding: 1px; background-color: #3883fa">
        <el-button type="primary" plain @click="copyParseJson">
          复制格式化后的 JSON</el-button
        >
        <el-button type="primary" plain @click="copyJson">
          复制压缩后的 JSON</el-button
        >
        <el-button type="primary" plain @click="drawer = false">
          关闭弹窗</el-button
        >
      </div>
      <star-horse-json-editor
        class="editor"
        ref="jsonEditorRef"
        language="zh-CN"
        current-mode="json"
        v-model:modelValue="nodeData"
      />
    </div>
  </el-drawer>
</template>
<script setup lang="ts">
import {
  computed,
  ModelRef,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  ref,
} from "vue";
import { useFlowDesignStore } from "@/store/FlowDesign";
import {
  copy,
  downloadData,
  loadData,
  piniaInstance,
  uuid,
  warning,
} from "star-horse-lowcode";
import { flowCommon } from "@/views/workflow/plugin/utils/flowCommon";
import { doSaveData } from "@/views/workflow/utils/FlowFormUtils";
import { useRouter } from "vue-router";

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
  saveBtnVisible: {
    type: Boolean,
    default: true,
  },
  mapBtnVisible: {
    type: Boolean,
    default: true,
  },
  zoomBtnVisible: {
    type: Boolean,
    default: true,
  },
});
const flowDesign = useFlowDesignStore(piniaInstance);
const emits = defineEmits(["saveImage"]);
const zoomValue: ModelRef<any> = defineModel("zoomValue")!;
const basicInfoRef = ref();
let scaleEnable = ref<boolean>(false);
let nodeData = computed(() => flowDesign.node);
let formData = computed(() => flowDesign.flowFormInfo);
let readable = computed(() => flowDesign.readable);
const drawer = ref(false);
const dataDialogVisible = ref(false);
const jsonEditorRef = ref();
const router = useRouter();
const goBack = () => {
  router.push({
    path: "/workflow/FlowDefineUi",
  });
};
const mapVisibleOperation = () => {
  flowDesign.mapVisible = !flowDesign.mapVisible;
  if (flowDesign.mapVisible) {
    flowDesign.refreshMap(true);
  }
};
let operType: string = "";
const saveData = (type: string) => {
  operType = type;
  dataDialogVisible.value = true;
  nextTick(() => {
    basicInfoRef.value.$refs.flowFormRef.setFormData(formData.value);
  });
};
const dataDoSave = () => {
  let formInfo = basicInfoRef.value.$refs.flowFormRef.$refs.starHorseFormRef;
  formInfo.validate((valid: boolean) => {
    if (valid) {
      let formData = basicInfoRef.value.$refs.flowFormRef.getFormData();
      doSaveData(formData, operType);
      flowDesign.init();
      dataDialogVisible.value = false;
    }
  });
};
const controlScale = () => {
  scaleEnable.value = !scaleEnable.value;
  if (scaleEnable.value) {
    init();
  } else {
    deactivate();
    zoomValue.value = INIT_ZOOM_VALUE;
  }
};
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  if (e.wheelDelta < 0) {
    onZoomOut();
  } else {
    onZoomIn();
  }
};
const onZoomOut = () => {
  let value = zoomValue.value;
  value -= 5;
  if (value < MIN_ZOOM_VALUE) {
    value = MIN_ZOOM_VALUE;
  }
  zoomValue.value = value;
};
const onZoomIn = () => {
  let value = zoomValue.value;
  value += 5;
  if (value > MAX_ZOOM_VALUE) {
    value = MAX_ZOOM_VALUE;
  }
  zoomValue.value = value;
};
const saveImage = () => {
  emits("saveImage");
};
const copyParseJson = async () => {
  copy(JSON.stringify(nodeData.value, null, "  "));
};
const copyJson = async () => {
  copy(JSON.stringify(nodeData.value));
};
const viewCode = async () => {
  drawer.value = true;
  await nextTick(() => {
    jsonEditorRef.value?.setEditorContent(nodeData.value);
  });
};
const exportCode = async () => {
  let params = {
    flowDeploymentId: uuid(),
    process: nodeData.value,
    code: "test",
    name: "测试",
    version: 1,
    remark: "测试",
  };
  let reData = await loadData(
    "/flow-engine/workflow/flowdefinition/dataConvertJsonToXml",
    params,
  );
  if (reData.error) {
    warning(reData.error);
    return;
  } else {
    downloadData(reData.data, new Date().getDate() + "bpmn.xml");
  }
};
const init = () => {
  if (scaleEnable.value) {
    window.addEventListener("wheel", handleWheel, true);
  }
};
const deactivate = () => {
  window.removeEventListener("wheel", handleWheel, true);
};
onActivated(() => {
  init();
});
onDeactivated(() => {
  deactivate();
});
onMounted(() => {
  zoomValue.value = INIT_ZOOM_VALUE;
  init();
});
</script>
