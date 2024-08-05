<script setup lang="ts" name="PipelineCfg">
import {onMounted, ref, reactive} from "vue";
import {SelectOption} from "@/components/types/SearchProps";
import {loadData} from "@/api/sh_api.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import NodeList from "@/views/continus/NodeList.vue";

const buildCfgRef = ref();
let repoList = ref<SelectOption[]>([]);
let execTypeList = ref<SelectOption[]>([]);
let nodeSuccessConditionList = ref<SelectOption[]>([]);
let subNodeList = ref<SelectOption[]>([]);
const nodeDialog = ref<boolean>(false);
let assignSelect = ref<boolean>(false);
//页面属性
const fieldList = reactive<PageFieldInfo | any>({
      fieldList: [
        {
          cardList: [
            {
              title: "节点信息",
              tabName: "nodeInfo",
              fieldList: [[{
                label: "名称",
                fieldName: "nodeName",
                type: "input",
                required: true,
                formShow: true,
                tableShow: true,
              }, {
                label: "执行方式",
                fieldName: "nodeExecType",
                type: "select",
                optionList: execTypeList,
                required: true,
                formShow: true,
                tableShow: true,
              }], [{
                label: "节点成功条件",
                fieldName: "nodeSuccessCondition",
                type: "radio",
                optionList: nodeSuccessConditionList,
                actionName: "change",
                actions: (val: any) => {
                  console.log(val);
                  assignSelect.value = val["nodeSuccessCondition"] == "assign";
                },
                required: true,
                formShow: true,
                tableShow: true
              }, {
                label: "",
                fieldName: "assignNode",
                type: "select",
                optionList: subNodeList,
                required: true,
                formShow: assignSelect,
                preps: {
                  colSpan: 6
                }
              }],
                {
                  cardList: [{
                    title: "子节点配置",
                    subFormFlag: true,
                    tabName: "subNodeInfo",
                    objectName:"subNodeInfo",
                    headerFieldList: [{
                      label: "添加子节点",
                      type: "button",
                      fieldName: "subNodeBtn",
                      actionName: "click",
                      actions: (val: any) => {
                        if (val["starHorseBtnName"] == "subNodeBtn") {
                          addSubNode();
                        }
                      },
                      preps: {
                        text: "Y",
                        icon: "plus",
                      }
                    }],
                    fieldList: [{
                      fieldName:"tab1",
                      tabList: [{
                        title: "节点一",
                        tabName: "tab1",
                        subFormFlag: true,
                        objectName: "sub",
                        fieldList: [{
                          label: "",
                          type: "comp",
                          formShow: true,
                          fieldName: "SubNodeInfo"
                        }]
                      }]
                    }
                    ]
                  }]
                },
              ],
            },
          ],
        },
      ],
    })
;
const getFormData = () => {
  return buildCfgRef.value.getFormData();
}
const setFormData = (data: any) => {
  buildCfgRef.value.setDataForm(data);
}
const addSubNode = () => {
  nodeDialog.value = true;
};
const closeAction = () => {
  nodeDialog.value = false;
}
const dataSubmit = () => {

}
const init = async () => {
  repoList.value = (await loadData("/devops-continus/continus/baseInfo/repoTypes")).data;
  execTypeList.value.push({name: "并行", value: "serial"});
  execTypeList.value.push({name: "串行", value: "parallel"});
  nodeSuccessConditionList.value.push({name: "成功完成所有子任务", value: "all"});
  nodeSuccessConditionList.value.push({name: "成功完成任意子任务", value: "any"});
  nodeSuccessConditionList.value.push({name: "成功完成指定子任务", value: "assign"});
};
onMounted(async () => {
  await init();
});
defineExpose({
  getFormData,
  setFormData,
});
</script>

<template>
  <star-horse-dialog :title="'节点列表'" :dialogVisible="nodeDialog" :self-func="true" @closeAction="closeAction"
                     @merge="dataSubmit" :is-batch="false" :is-show-btn-continue="false">
    <node-list/>
  </star-horse-dialog>
  <star-horse-form ref="buildCfgRef" class="build-cfg" :fieldList="fieldList"/>
</template>

<style scoped lang="scss">
.build-cfg {
  height: 100%;

  .el-card {
    height: 100%;
  }
}
</style>
