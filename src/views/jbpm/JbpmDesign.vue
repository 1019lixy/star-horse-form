<script setup lang="ts" name="JbpmDesign">
import {flowTemplate} from "@/views/jbpm/utils/template.ts";
import JbpmHeader from "@/views/jbpm/JbpmHeader.vue";
import JbpmPropertyPanel from "@/views/jbpm/panel/JbpmPropertyPanel.vue";
import 'bpmn-js/dist/assets/diagram-js.css';
import 'bpmn-js/dist/assets/bpmn-js.css';
import 'bpmn-js/dist/assets/bpmn-font/css/bpmn-embedded.css';
import "bpmn-js-bpmnlint/dist/assets/css/bpmn-js-bpmnlint.css";
import "bpmn-js-token-simulation/assets/css/bpmn-js-token-simulation.css";
import "@/assets/css/diagram-js-minimap.css";
import {computed, nextTick, onMounted, ref} from "vue";
import {uuid} from "@/api/system.ts"
import {createBpmnModeler, createNewFlow} from "@/views/jbpm/utils/FlowData.ts";
import {xmlStrNew} from './utils/linting-cloud.js';
import {useFlowDesign} from "@/store/FlowDesignStore.ts";
import piniaInstance from "@/store";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {ElementRegistry} from "bpmn-js/lib/features/auto-place/BpmnAutoPlaceUtil";
// 模拟流转流程


let bpmnModeler: any = null;
const initData = ref<any>({});
const initTemplateRef = ref<string>("");
const canvas = ref(null);
const properties = ref(null);
let isShow = ref<boolean>(false);
const flowDesign = useFlowDesign(piniaInstance);
let lintDatas = computed(() => {
  let datas = flowDesign.lintData;
  let elements: any = {};
  for (let key in datas) {
    let temps = datas[key];
    for (let i in temps) {
      let temp = temps[i];
      if (Object.keys(elements).includes(temp.id)) {
        elements[temp.id].push(temp);
      } else {
        elements[temp.id] = [temp];
      }
    }
  }
  return elements;
});
let errorNums = computed(() => {
  let datas = flowDesign.lintData;
  let nums = 0;
  for (let key in datas) {
    let temp = datas[key];
    if (Array.isArray(temp)) {
      nums += temp.filter(item => item.category == "error").length;
    } else {
      if (temp.category == "error") {
        nums += 1;
      }
    }
  }
  return nums;
});
let warningNums = computed(() => {
  let datas = flowDesign.lintData;
  let nums = 0;
  for (let key in datas) {
    let temp = datas[key];
    if (Array.isArray(temp)) {
      nums += temp.filter(item => item.category == "warning").length;
    } else {
      if (temp.category == "warning") {
        nums += 1;
      }
    }
  }
  return nums;
});
let infoNums = computed(() => {
  let datas = flowDesign.lintData;
  let nums = 0;
  for (let key in datas) {
    let temp = datas[key];
    if (Array.isArray(temp)) {
      nums += temp.filter(item => item.category == "info").length;
    } else {
      if (temp.category == "info") {
        nums += 1;
      }
    }
  }
  return nums;
});
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
const showMessage = () => {
  isShow.value = !isShow.value;
}
const elementPosition = (elementKey: string, event: MouseEvent) => {
  event?.preventDefault();
  event?.stopPropagation();
  let registry = bpmnModeler.get<ElementRegistry>("elementRegistry");
  bpmnModeler.get('selection').select([registry.find((item: any) => item.id == elementKey)]);
}
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
          <div class="bpmn-linter open">
            <div class="toggle-btn" @click="showMessage">
              <star-horse-icon :iconClass="isShow?'arrow-double-down':'arrow-double-up'"/>
            </div>
            <el-card>
              <template #header>
                <div class="flow-message">
                  <div class="title">流程校验</div>
                  <div class="message-count">
                    <el-tag type="danger">错误 {{ errorNums }}</el-tag>
                    <el-tag type="warning">警告 {{ warningNums }}</el-tag>
                    <el-tag type="info">提示 {{ infoNums }}</el-tag>
                  </div>
                </div>
              </template>
              <el-collapse accordion v-if="isShow">
                <el-collapse-item v-for="(data,key) in lintDatas">
                  <template #title>
                    <div class="title" style="justify-content: space-between;display: flex;align-items: center">
                      <div style="width: 80%">{{ key }}</div>
                      <star-horse-icon icon-class="position" style="cursor:pointer"
                                       @click="elementPosition(key,$event)"/>
                    </div>
                  </template>
                  <div class="message-item" v-for="(item,sindex) in data">
                    {{ sindex + 1 }}.{{ item.message }}
                  </div>
                </el-collapse-item>
              </el-collapse>

            </el-card>
          </div>
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
      /*padding: 10px;*/
      position: relative;
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

:deep(.bjsl-button) {
  display: none !important;
}

.bpmn-linter {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 120;
  width: 360px;
}

.bpmn-linter .toggle-btn {
  width: 64px;
  height: 20px;
  position: absolute;
  z-index: 10;
  top: 0;
  left: 50%;
  transform: translate(-50%, -100%);
  cursor: pointer;
  border-radius: 8px 8px 0 0;
  color: var(--star-horse-style);
  background-color: #f5f5f7;
  border-top: 1px solid var(--star-horse-style);
  border-left: 1px solid var(--star-horse-style);
  border-right: 1px solid var(--star-horse-style);
  box-shadow: 0 -2px 6px 0 var(--star-horse-shadow);
  text-align: center;
  line-height: 20px;
}

//.bpmn-linter .toggle-btn {
//  transition: all ease .24s;
//  transform: scaleX(1.5)
//}

.flow-message {

  display: flex;
  width: 100%;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  .message-count {
    flex-direction: row;
    align-items: center;

    .el-tag {
      margin-left: 5px;
    }
  }
}

.message-item {
  font-size: 13px;
  font-weight: bold;
  padding-left: 15px;
  line-height: 30px;
  height: 30px;
  margin-top: 5px;
}

</style>
