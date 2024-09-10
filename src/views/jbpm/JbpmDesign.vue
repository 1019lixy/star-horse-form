<script setup lang="ts" name="JbpmDesign">
import {flowTemplate} from "@/views/jbpm/utils/template.ts";
import {xmlStr} from "@/views/jbpm/utils/xml";
import JbpmHeader from "@/views/jbpm/JbpmHeader.vue";
import JbpmPropertyPanel from "@/views/jbpm/panel/JbpmPropertyPanel.vue";
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import "bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css";
import "@/assets/css/diagram-js-minimap.css";
import {nextTick, onMounted, ref} from "vue";
import {uuid} from "@/api/system.ts"
import {createBpmnModeler, createNewFlow} from "@/views/jbpm/utils/FlowData.ts";
import {xmlStrNew} from './utils/linting-cloud.js';
// 模拟流转流程


let bpmnModeler: any = null;
const initData = ref<any>({});
const initTemplateRef = ref<string>("");
const canvas = ref(null);
const properties = ref(null);


const createData = () => {
  let processId = uuid();
  let processName = "UnSaved";
  initTemplateRef.value = flowTemplate(processName, processId);
  initData.value = {
    flowName: processName,
    flowId: processId,
    isUpdate: false,
    processTypeList: [
      {name: "请假", value: "001"},
      {name: "报销", value: "002"},
      {name: "聚餐", value: "003"},
    ]
  }
};
const flowCheck = () => {
};

const init = async () => {
  bpmnModeler = createBpmnModeler(canvas.value, properties.value);
  await nextTick();
  await createNewFlow(bpmnModeler, xmlStrNew);

};

const restart = () => {
  createData();
  createNewFlow(bpmnModeler, initTemplateRef.value);
};
onMounted(() => {
  createData();
  init();
});

</script>
<template>
  <el-card class="inner_content">
    <div class="flow-design">
      <div class="jbpm">
        <jbpm-header :modeler="bpmnModeler" :process-data="initData" @flowCheck="flowCheck"
                     @restart="restart"/>
        <div class="bpmn-container">
          <div class="bpmn-content" ref="canvas"></div>
        </div>
      </div>
<!--            <div class="property" ref="properties"></div>-->
      <jbpm-property-panel :modeler="bpmnModeler" :process="initData" v-if="bpmnModeler"/>
    </div>
  </el-card>
</template>
<style lang="scss" scoped>
:deep(.el-card__body) {
  display: flex;
  width: 100%;
}
.panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: calc(100% - 250px - 1px);
  height: 200px;
  display: flex;
  flex-direction: column;
  background-color: #f7f7f8;
  padding: 5px;
  box-sizing: border-box;
  border-top: solid 1px #ccc;
  font-family: sans-serif;
}

.panel .errorContainer {
  resize: none;
  flex-grow: 1;
  background-color: #f7f7f8;
  border: none;
  margin-bottom: 5px;
  font-family: sans-serif;
  line-height: 1.5;
  outline: none;
}

.panel .errorItem {
  cursor: pointer;
}

.panel button,
.panel input {
  width: 200px;
}
.flow-design {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: row;

  .jbpm {
    display: flex;
    flex: 1;
    flex-direction: column;

    .bpmn-container {
      padding: 10px;
      height: 100%;
      flex: 1;

      .bpmn-content {
        width: 100%;
        height: 100%;
        background: url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBmaWxsPSJub25lIiBzdHJva2U9IiNlMGUwZTAiIG9wYWNpdHk9Ii4yIi8+PHBhdGggZD0iTTQwIDBIMHY0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjZTBlMGUwIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+") repeat !important;
      }

      .canvas {
        width: 100%;
        height: 100%;
      }
    }
  }

  .property {
    width: 30%;
  }
}

.container {
  height: inherit;
  display: flex;
  border: 1px solid #e3e9f2;
}


.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 500px;
}

:deep( .bjs-powered-by) {
  display: none;
}

.container {
  width: 100%;
  height: 100%;
}

:deep(.djs-palette) {
  left: 0 !important;
  top: 1px !important;
}

.djs-minimap {
  top: unset !important;
  bottom: 50px;

  .toggle {
    display: none;
  }

  .map {
    display: block;
  }
}

:deep(.bio-properties-panel-header) {
  padding: 4px 10px !important;
}

:deep(.bio-properties-panel-header-labels) {
  display: flex;
  align-items: center;

  .bio-properties-panel-header-label {
    margin-left: 15px;
  }
}
:deep(.bjsl-button){
  display: none !important;
}

</style>
