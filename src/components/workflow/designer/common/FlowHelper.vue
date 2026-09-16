<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import { useFlowDesignStore } from "@/store/FlowDesign";
import {
  PageFieldInfo,
  piniaInstance,
} from "star-horse-lowcode";
import FlowHelperPanel from "@/components/workflow/designer/common/FlowHelperPanel.vue";
import { scale } from "@/components/workflow/utils/deviceUtil";

const flowDesign = useFlowDesignStore(piniaInstance);

const processVariablesRef = ref();
let processVariableVisible = ref<boolean>(false);
let panelVisible = ref<boolean>(false);

const processVariablesFields = reactive<PageFieldInfo>({
  fieldList: [],
containerFields: [
    {
      batchName: "variables",
      fieldList: [
        [
          {
            label: "变量名称",
            formVisible: true,
            required: true,
            fieldName: "paramLabel",
          },
          {
            label: "变量属性名",
            formVisible: true,
            required: true,
            fieldName: "paramName",
          },
        ],
        [
          {
            label: "变量值类型",
            fieldName: "paramValueType",
            formVisible: true,
            required: true,
            type: "select",
            preps: {
              values: [
                { name: "字符串", value: "string" },
                { name: "数字", value: "number" },
                { name: "数组", value: "array" },
                { name: "Json对象", value: "json" },
              ],
            },
          },
          {
            label: "默认值",
            formVisible: true,
            fieldName: "defaultValue",
          },
        ],
        [
          {
            label: "变量类型",
            type: "radio",
            formVisible: true,
            defaultValue: "process",
            fieldName: "type",
            preps: {
              values: [
                { name: "流程变量", value: "process" },
                { name: "任务变量", value: "task" },
              ],
            },
          },
          {
            label: "是否内置变量",
            type: "radio",
            formVisible: true,
            defaultValue: "inner",
            fieldName: "systemFlag",
            preps: {
              values: [
                { name: "内置变量", value: "inner" },
                { name: "扩展变量", value: "extend" },
              ],
            },
          },
        ],
      ],
    },
  ],
});

const processVariables = computed(() => flowDesign.processVariables);
const outerFormData = ref<any>({});

const togglePanel = () => {
  panelVisible.value = !panelVisible.value;
};

const closePanel = () => {
  panelVisible.value = false;
};

const editProcessVariable = () => {
  outerFormData.value = {
    variables: processVariables.value,
  };
  processVariableVisible.value = true;
};

const submitVariable = () => {
  processVariablesRef.value.validate().then((res: boolean) => {
    if (res) {
      const formData: any = processVariablesRef.value.getFormData().value;
      flowDesign.setProcessVariables(formData["variables"]);
      processVariableVisible.value = false;
    }
  });
};

const onClose = () => {
  processVariableVisible.value = false;
};
</script>

<template>
  <!-- 流程变量配置弹窗 -->
  <star-horse-panel
    v-model="processVariableVisible"
    @merge="submitVariable"
    @closeAction="onClose"
    :userAction="true"
    compSize="default"
    :title="'配置流程变量'"
  >
    <star-horse-form
      :outerFormData="outerFormData"
      :fieldList="processVariablesFields"
      ref="processVariablesRef"
    />
  </star-horse-panel>

  <!-- PC端：统一模板面板 -->
  <FlowHelperPanel
    v-if="panelVisible && !scale.isMobile()"
    @close="closePanel"
  />

  <!-- 移动端：模板面板改为底部抽屉 -->
  <el-drawer
    v-if="scale.isMobile()"
    v-model="panelVisible"
    direction="btt"
    :size="'70%'"
    :title="'模板与配置'"
    class="m-helper-drawer"
  >
    <FlowHelperPanel v-if="panelVisible" :mobile="true" @close="closePanel" />
  </el-drawer>

  <!-- PC端：左侧浮动工具栏 -->
  <div v-if="!scale.isMobile()" class="flow-helper" id="flow-helper">
    <div class="flow-helper-item" @click="editProcessVariable">
      <star-horse-icon icon-class="setting" size="20px" />
      <span class="flow-helper-label">流程变量</span>
    </div>
    <div
      class="flow-helper-item"
      :class="{ 'flow-helper-item-active': panelVisible }"
      @click="togglePanel"
    >
      <star-horse-icon icon-class="template" size="20px" />
      <span class="flow-helper-label">模板库</span>
    </div>
  </div>

  <!-- 移动端：底部浮动按钮组 -->
  <div v-else class="m-flow-helper">
    <div class="m-flow-helper-btn" @click="editProcessVariable">
      <star-horse-icon icon-class="setting" size="18px" />
      <span>变量</span>
    </div>
    <div
      class="m-flow-helper-btn"
      :class="{ 'm-flow-helper-btn-active': panelVisible }"
      @click="togglePanel"
    >
      <star-horse-icon icon-class="template" size="18px" />
      <span>模板</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.flow-helper {
  position: absolute;
  left: 16px;
  top: 60px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  padding: 6px;
}
.flow-helper-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 56px;
  height: 56px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #606266;
  &:hover {
    background: #f0f2f5;
    color: var(--star-horse-style);
  }
}
.flow-helper-item-active {
  background: rgba(64, 158, 255, 0.08);
  color: var(--star-horse-style);
}
.flow-helper-label {
  font-size: 11px;
  line-height: 1;
  white-space: nowrap;
}

/* 移动端底部浮动按钮组 */
.m-flow-helper {
  position: absolute;
  left: 50%;
  bottom: 16px;
  transform: translateX(-50%);
  z-index: 10;
  display: flex;
  gap: 8px;
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 4px;
}
.m-flow-helper-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  color: #606266;
  font-size: 13px;
  white-space: nowrap;
  &:active {
    background: #f0f2f5;
  }
}
.m-flow-helper-btn-active {
  background: rgba(64, 158, 255, 0.1);
  color: var(--star-horse-style);
}
</style>

<style lang="scss">
/* 移动端抽屉样式 */
.m-helper-drawer {
  .el-drawer__header {
    margin-bottom: 0;
    padding: 14px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;
    font-weight: 600;
  }
  .el-drawer__body {
    padding: 0;
    overflow: hidden;
  }
}
</style>
