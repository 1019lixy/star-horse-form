<template>
  <div class="bpmn-panel">
    <div style="height: 45px">
      <div
        :class="{ active: configTab == 'node' }"
        @click="handleConfigSelect('node')"
        class="config-tab"
      >
        节点属性
      </div>
      <div
        :class="{ active: configTab == 'process' }"
        @click="handleConfigSelect('process')"
        class="config-tab"
      >
        流程属性
      </div>
    </div>
    <el-scrollbar height="100%">
      <node-property-panel
        :formData="formData"
        :modeler="modeler"
        :nodeElement="nodeElement"
        :tab="configTab"
        v-if="configTab == 'node'"
        @modifyConfigTab="modifyConfigTab"
        @modifyFormData="modifyFormData"
      />
      <process-property-panel
        v-if="configTab == 'process'"
        :element="nodeElement"
        :modeler="modeler"
      />
    </el-scrollbar>
  </div>
</template>
<script setup lang="ts" name="JbpmPropertyPanel">
import { onMounted, ref } from "vue";

const props = defineProps({
  modeler: {
    type: Object,
    required: true,
  },
  process: {
    type: Object,
    required: true,
  },
});
const emits = defineEmits(["updateXml"]);
let configTab = ref<string>("node");
let panelIndex = ref<number>(1);
let element = ref<any>(null);
let nodeElement = ref<any>({});
let formData = ref<any>({});
onMounted(() => {
  handleModeler();
});
const handleConfigSelect = (value: string) => {
  configTab.value = value;
};
const handleModeler = () => {
  //根节点添加事件
  props.modeler.on("root.added", (e) => {
    let el = e.element;
    if (isImplicitRoot(el)) {
      return;
    }
    element.value = el;
  });

  //节点选择变化
  props.modeler.on("selection.changed", (e: any) => {
    console.log("selection.changed", e);
    const element = e.newSelection[0];
    if (!element) {
      return;
    }
    modifyConfigTab(element);
    handleFormData(element);
  });
  // //节点属性变化
  props.modeler.on("element.changed", (e: any) => {
    console.log("element.changed", e);
    const { element } = e;
    if (!element) {
      return;
    }
    // handleFormData(element);
  });
  // //节点点击事件
  props.modeler.on("element.click", (e: any) => {
    console.log("element.click", e);
    const { element } = e;
    if (element.type == props.modeler._definitions.rootElements[0].$type) {
      modifyConfigTab(0);
    } else {
      modifyConfigTab(1);
      if (element.type == "bpmn:UserTask") {
        let _businessObject = element.businessObject;
        if (_businessObject.assignee) {
          formData.value.userType = "assignee";
          formData.value.assignee = _businessObject.assignee;
        }
      }
    }
  });
};
const isImplicitRoot = (element: any) => {
  return element.id === "__implicitroot";
};
const modifyConfigTab = (element: any) => {
  let tab = "node";
  if (!element) {
    tab = "process";
  }
  configTab.value = tab;
};
const handleFormData = (element: any) => {
  if (!element.id) {
    return;
  }
  nodeElement.value = element;
};
const modifyFormData = (data: any) => {
  formData.value.assignee = data.assignee;
  formData.value.userType = data.userType;
};
</script>

<style lang="scss" scoped>
.bpmn-panel {
  width: 100%;
  border: 1px solid var(--star-horse-border—color);
  padding: 0 5px;
  height: 100%;
  overflow: hidden;
}

:deep(.el-main) {
  padding: unset !important;
}

.el-header {
  border-bottom: solid 2px #e4e7ed;
  padding: 0;
}

.config-tab {
  height: 43px;
  line-height: 43px;
  display: inline-block;
  width: 50%;
  text-align: center;
  font-size: 14px;
  font-weight: 500;
  position: relative;
  cursor: pointer;
}

.config-tab.active {
  border-bottom: solid 2px #409eff;
}

.bpmn-panel {
  width: 100%;
  border: 1px solid #eeeeee;
  padding: 0 5px;
}

.el-select--small {
  width: 100%;
}

.el-dialog > .el-dialog__header {
  padding: 5px 20px;
}

.el-dialog > .el-dialog__body {
  padding: 0;
  margin: 0 20px;
  border: 1px solid #cccccc;
}

.default-undo {
  color: #c0c4cc;
}
</style>
