<script setup lang="ts" name="ApiInterfaceTest">
  import { onMounted, reactive, ref } from "vue";
  import { SelectOption } from "@/components/types/SearchProps";
  import { loadData } from "@/api/star_horse_utils.ts";
  import { FieldInfo, PageFieldInfo } from "@/components/types/PageFieldInfo";
  import ToolInfo from "@/views/continus/ToolInfo.vue";
  import { warning } from "@/utils/message.ts";

  const buildCfgRef = ref();
  const toolInfoRef = ref();
  let repoList = ref<SelectOption[]>([]);
  let execTypeList = ref<SelectOption[]>([]);
  let nodeSuccessConditionList = ref<SelectOption[]>([]);
  let subNodeList = ref<SelectOption[]>([]);
  const nodeDialog = ref<boolean>(false);
  let assignSelect = ref<boolean>(false);
  let currentTabName = ref<string>("tab1");
  let subNodeFieldList = ref<FieldInfo[]>([]);
  //页面属性
  const fieldList = reactive<PageFieldInfo | any>({
    fieldList: [
      {
        cardList: [
          {
            title: "节点信息",
            tabName: "nodeInfo",
            fieldList: [
              [
                {
                  label: "名称",
                  fieldName: "nodeName",
                  type: "input",
                  required: true,
                  formVisible: true,
                  listVisible: true
                },
                {
                  label: "执行方式",
                  fieldName: "nodeExecType",
                  type: "select",
                  optionList: execTypeList,
                  required: true,
                  formVisible: true,
                  listVisible: true
                }
              ],
              [
                {
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
                  formVisible: true,
                  listVisible: true,
                  brotherNodes: [
                    {
                      label: "  ",
                      fieldName: "assignNode",
                      type: "select",
                      optionList: subNodeList,
                      required: true,
                      formVisible: assignSelect,
                      preps: {
                        colspan: 6
                      }
                    }
                  ],
                  preps: {
                    colspan: 13
                  }
                }
              ],
              {
                cardList: [
                  {
                    title: "子节点配置",
                    subFormFlag: "Y",
                    tabName: "subNodeInfo",
                    objectName: "subNodeInfo",
                    headerFieldList: [
                      {
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
                          icon: "plus"
                        }
                      }
                    ],
                    fieldList: [
                      {
                        fieldName: currentTabName,
                        closable: "Y",
                        tabList: subNodeFieldList
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  });
  const getFormData = () => {
    return buildCfgRef.value.getFormData();
  };
  const setFormData = (data: any) => {
    buildCfgRef.value.setFormData(data);
  };
  const addSubNode = () => {
    nodeDialog.value = true;
  };
  const closeAction = () => {
    nodeDialog.value = false;
  };
  const dataSubmit = () => {
    let node = toolInfoRef.value.getNode();
    if (!node) {
      warning("请先选择要配置的节点");
      return;
    }
    let len = subNodeFieldList.value.length + 1;
    subNodeFieldList.value.push({
      title: "节点" + len,
      tabName: "tab" + len,
      subFormFlag: "Y",
      objectName: "sub" + len,
      fieldList: [
        {
          label: "",
          type: "comp",
          formVisible: true,
          fieldName: "SubNodeInfo"
        }
      ]
    });
    currentTabName.value = "tab" + len;
    closeAction();
  };
  const init = async () => {
    subNodeFieldList.value.push({
      title: "节点一",
      tabName: "tab1",
      subFormFlag: "Y",
      objectName: "sub",
      fieldList: [
        {
          label: "",
          type: "comp",
          formVisible: true,
          fieldName: "SubNodeInfo"
        }
      ]
    });
    repoList.value = (await loadData("/devops-continus/continus/baseInfo/repoTypes")).data;
    execTypeList.value.push({ name: "并行", value: "serial" });
    execTypeList.value.push({ name: "串行", value: "parallel" });
    nodeSuccessConditionList.value.push({ name: "成功完成所有子任务", value: "all" });
    nodeSuccessConditionList.value.push({ name: "成功完成任意子任务", value: "any" });
    nodeSuccessConditionList.value.push({ name: "成功完成指定子任务", value: "assign" });
  };
  onMounted(async () => {
    await init();
  });
  defineExpose({
    getFormData,
    setFormData
  });
</script>

<template>
  <star-horse-dialog
    :title="'节点列表'"
    :dialogVisible="nodeDialog"
    :self-func="true"
    @closeAction="closeAction"
    @merge="dataSubmit"
    :is-batch="false"
    :is-show-btn-continue="false"
  >
    <ToolInfo ref="toolInfoRef" />
  </star-horse-dialog>
  <star-horse-form ref="buildCfgRef" class="build-cfg" :fieldList="fieldList" />
</template>

<style scoped lang="scss">
  .build-cfg {
    height: 100%;
  }
</style>
