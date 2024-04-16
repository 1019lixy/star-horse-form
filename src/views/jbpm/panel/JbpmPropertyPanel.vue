<script setup lang="ts" name="JbpmPropertyPanel">
import {onMounted, ref} from "vue";
import NodePropertyPanel from "@/views/jbpm/panel/NodePropertyPanel.vue";
import ProcessPropertyPanel from "@/views/jbpm/panel/ProcessPropertyPanel.vue";

const props = defineProps({
  modeler: {
    type: Object,
    required: true
  },
  process: {
    type: Object,
    required: true
  }
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
  props.modeler.on("root.added", e => {
    let el = e.element;
    if (isImplicitRoot(el)) {
      return;
    }
    element.value = el;
  });
  //
  props.modeler.on("commandStack.changed", () => {
    console.log("commandStack.changed");
    props.modeler.saveXML({format: true}, function (err, xml) {
      emits('updateXml', xml)
    });
  })
  //节点选择变化
  props.modeler.on("selection.changed", e => {
    console.log("selection.changed");
    const element = e.newSelection[0];
    if (!element) {
      return;
    }
    modifyConfigTab(element);
    handleFormData(element);
  })
  //节点属性变化
  emits.modeler.on("element.changed", e => {
    console.log("element.changed");
    const {element} = e;
    if (!element) {
      return;
    }
    handleFormData(element);
  });
  //节点点击事件
  props.modeler.on("element.click", e => {
    console.log("element.click");
    const {element} = e;
    if (element.type == props.modeler._definitions.rootElements[0].$type) {
      modifyConfigTab(0)
    } else {
      modifyConfigTab(1)
      if (element.type == "bpmn:UserTask") {
        let _businessObject = element.businessObject;
        if (_businessObject.assignee) {
          formData.value.userType = "assignee";
          formData.value.assignee = _businessObject.assignee;
        }
      }
    }
  })
};
const isImplicitRoot = (element: any) => {
  return element.id === '__implicitroot';
};
const modifyConfigTab = (element: any) => {
  let tab = 'node'
  if (!element) {
    tab = 'process'
  }
  configTab.value = tab;
};
const handleFormData = (element: any) => {
  if (!element.id) {
    return;
  }
  let businessObject = element.businessObject;
  formData.value = {
    type: element.type,
    id: businessObject.id,
    name: businessObject.name,
    userType: businessObject.$attrs.userType,
    assignee: businessObject.$attrs.assignee,
    candidateGroups: businessObject.$attrs.candidateGroups,
    candidateUsers: businessObject.$attrs.candidateUsers ? businessObject.$attrs.candidateUsers.split(",") : [],
    sequenceFlow: businessObject.conditionExpression ? businessObject.conditionExpression.body : ''
  }
  console.log(element);
  nodeElement.value = element;
};
const modifyFormData = (data: any) => {
  formData.value.assignee = data.assignee;
  formData.value.userType = data.userType;
};

</script>

<style scoped>
.bpmn-panel {
  width: 350px;
  border: 1px solid #eeeeee;
  padding: 0 5px;
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
  border-bottom: solid 2px #409EFF;
}

.bpmn-panel {
  width: 370px;
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
  padding: 0px;
  margin: 0 20px;
  border: 1px solid #cccccc;
}

.default-undo {
  color: #c0c4cc;
}
</style>
<template>
  <div class="bpmn-panel">
    <el-container>
      <el-header height="45px">
        <div :class="{active: configTab=='node'}" @click="handleConfigSelect('node')" class="config-tab">节点属性
        </div>
        <div :class="{active: configTab=='process'}" @click="handleConfigSelect('process')" class="config-tab">
          流程属性
        </div>
      </el-header>
      <el-main>

        <node-property-panel :formData="formData" :modeler="modeler" :nodeElement="nodeElement"
                             @modifyConfigTab="modifyConfigTab" @modifyFormData="modifyFormData"
                             v-if="configTab=='node'"/>
        <process-property-panel :element="element" :modeler="modeler" :process-data="process"
                                v-if="configTab=='process'"/>
      </el-main>
    </el-container>

  </div>
</template>