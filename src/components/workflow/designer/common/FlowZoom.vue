<template>
  <star-horse-panel
      v-model="dataDialogVisible"
      @closeAction="dataDialogVisible = false"
      :selfFunc="true"
      :boxWidth="'45%'"
      :full-screen="false"
      :compSize="flowCommon.size"
      @merge="dataDoSave"
      :title="'流程信息'"
  >
    <BasicInfo ref="basicInfoRef" :dialogFlag="true"/>
  </star-horse-panel>
  <div class="sh-flow-editor-operate" :class="{ 'm-operate': scale.isMobile() }">
    <!-- 移动端：精简按钮 + 更多菜单 -->
    <template v-if="scale.isMobile()">
      <div class="sh-flow-editor-zoom" v-if="zoomBtnVisible">
        <div class="sh-flow-editor-zoom-less" @click="onZoomOut"></div>
        <span>{{ zoomValue }}%</span>
        <div class="sh-flow-editor-zoom-more" @click="onZoomIn"></div>
      </div>
      <el-dropdown trigger="click" @command="handleOperateCommand" class="m-operate-more">
        <div class="flow-btn m-more-trigger">
          <el-icon><More /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="saveBtnVisible && !readable" command="publish" icon="Upload">
              发布流程
            </el-dropdown-item>
            <el-dropdown-item v-if="saveBtnVisible && !readable" command="save" icon="Document">
              保存数据
            </el-dropdown-item>
            <el-dropdown-item command="image" icon="Picture">
              保存图片
            </el-dropdown-item>
            <el-dropdown-item v-if="mapBtnVisible" command="map" icon="MapLocation">
              小地图
            </el-dropdown-item>
            <el-dropdown-item command="code" icon="View">
              查看代码
            </el-dropdown-item>
            <el-dropdown-item command="export" icon="Download">
              导出Bpmn
            </el-dropdown-item>
            <el-dropdown-item command="scale" icon="ScaleToOriginal">
              自动缩放
            </el-dropdown-item>
            <el-dropdown-item divided command="back" icon="Back">
              返回列表
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>

    <!-- PC端：原有全部按钮 -->
    <template v-else>
      <div
          class="flow-btn"
          @click="saveData('publish')"
          v-if="saveBtnVisible && !readable"
      >
        <el-tooltip content="发布流程">
          <star-horse-icon icon-class="publish" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div
          class="flow-btn"
          @click="saveData('save')"
          v-if="saveBtnVisible && !readable"
      >
        <el-tooltip content="保存数据">
          <star-horse-icon icon-class="save" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="flow-btn" @click="saveImage">
        <el-tooltip content="保存图片">
          <star-horse-icon icon-class="image" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="flow-btn" @click="mapVisibleOperation" v-if="mapBtnVisible">
        <el-tooltip content="开启/关闭小地图">
          <star-horse-icon icon-class="map" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="flow-btn" @click="viewCode">
        <el-tooltip content="查看代码">
          <star-horse-icon icon-class="code" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="flow-btn" @click="exportCode">
        <el-tooltip content="导出Bpmn">
          <star-horse-icon icon-class="export" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="sh-flow-editor-zoom" v-if="zoomBtnVisible">
        <div class="sh-flow-editor-zoom-less" @click="onZoomOut"></div>
        <span>{{ zoomValue }}%</span>
        <div class="sh-flow-editor-zoom-more" @click="onZoomIn"></div>
      </div>
      <div class="flow-btn" @click="controlScale">
        <el-tooltip content="关闭/打开自动缩放">
          <star-horse-icon icon-class="scale" cursor="pointer"/>
        </el-tooltip>
      </div>
      <div class="flow-btn" @click="goBack" v-if="saveBtnVisible && !readable">
        <el-tooltip content="返回列表">
          <star-horse-icon icon-class="return" cursor="pointer"/>
        </el-tooltip>
      </div>
    </template>
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
          复制格式化后的 JSON
        </el-button
        >
        <el-button type="primary" plain @click="copyJson">
          复制压缩后的 JSON
        </el-button
        >
        <el-button type="primary" plain @click="drawer = false">
          关闭弹窗
        </el-button
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
import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
import {computed, ModelRef, nextTick, onActivated, onDeactivated, onMounted, ref,} from "vue";
import {useFlowDesignStore} from "@/store/FlowDesign";
import { downloadData, loadData, piniaInstance, uuid, warning,} from "star-horse-lowcode";
import {flowCommon} from "@/components/workflow/utils/flowCommon";
import {doSaveData} from "@/components/workflow/validator/FlowFormUtils";
import {useRouter} from "vue-router";
import {scale} from "@/components/workflow/utils/deviceUtil";
import {copy} from "@/api/star_horse_form_utils";

const INIT_ZOOM_VALUE = 100;
const MIN_ZOOM_VALUE = 10;
const MAX_ZOOM_VALUE = 300;
defineProps({
  min: {
    type: Number,

    default: MIN_ZOOM_VALUE,
  },
  max: {
    type: Number,

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
  if (!router) {
    dwarn("[FlowZoom] router unavailable, skip goBack");
    return;
  }
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
      doSaveData(formData, operType, null,(data: any) => {
        if (!data.code) {
          flowDesign.init();
          dataDialogVisible.value = false;
        }
      });
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
const handleOperateCommand = (command: string) => {
  switch (command) {
    case "publish":
      saveData("publish");
      break;
    case "save":
      saveData("save");
      break;
    case "image":
      saveImage();
      break;
    case "map":
      mapVisibleOperation();
      break;
    case "code":
      viewCode();
      break;
    case "export":
      exportCode();
      break;
    case "scale":
      controlScale();
      break;
    case "back":
      goBack();
      break;
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
