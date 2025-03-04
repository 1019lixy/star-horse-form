<script setup lang="ts" name="SubNodeInfo">
  import { onMounted, reactive, ref } from "vue";
  import { FieldInfo, PageFieldInfo } from "@/components/types/PageFieldInfo";
  import { SelectOption } from "@/components/types/SearchProps";
  import { loadPlugin } from "@/views/continus/utils/ToolsParams.ts";
  import { loadData } from "@/api/sh_api.ts";
  import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";

  const nodeInfoRef = ref<any>();
  const nodeTypeList = ref<SelectOption[]>([]);
  const execTypeList = ref<SelectOption[]>([]);
  const compileTypeList = ref<SelectOption[]>([]);
  let nodeParams = ref<FieldInfo[]>([]);
  let dataForm=ref<any>({});
  const fieldList = reactive<PageFieldInfo | any>({
    fieldList: [
      {
        cardList: [
          {
            title: "节点信息",
            subFormFlag: "Y",
            tabName: "subNodeInfo2",
            objectName: "subNodeInfo2",
            headerFieldList: [
              {
                label: "拷贝已配置信息",
                type: "button",
                fieldName: "copyNodeBtn",
                actionName: "click",
                actions: (val: any) => {
                  if (val["starHorseBtnName"] == "copyNodeBtn") {
                  }
                },
                preps: {
                  text: "Y",
                  icon: "copy"
                }
              }
            ],
            fieldList: [
              [
                {
                  label: "节点类型",
                  fieldName: "nodeType",
                  type: "select",
                  optionList: nodeTypeList,
                  required: true,
                  formVisible: true
                },
                {
                  label: "节点名称",
                  fieldName: "nodeName",
                  type: "input",
                  required: true,
                  formVisible: true
                },
                {
                  label: "执行方式",
                  fieldName: "execType",
                  type: "select",
                  optionList: execTypeList,
                  required: true,
                  formVisible: true
                }
              ],
              [
                {
                  label: "归档制品",
                  fieldName: "uploadProduct",
                  type: "input",
                  required: true,
                  formVisible: true,
                  brotherNodes: [
                    {
                      label: "添加目录",
                      fieldName: "uploadProductBtn",
                      type: "button",
                      formVisible: true,
                      preps: {
                        text: "Y",
                        icon: "plus"
                      }
                    }
                  ]
                },
                {
                  label: "获取制品",
                  fieldName: "downloadProduct",
                  type: "input",
                  required: true,
                  formVisible: true,
                  brotherNodes: [
                    {
                      label: "添加制品来源",
                      fieldName: "downloadProductBtn",
                      type: "button",
                      formVisible: true,
                      preps: {
                        text: "Y",
                        icon: "plus"
                      }
                    }
                  ]
                }
              ]
            ]
          },
          {
            title: "节点参数",
            subFormFlag: "Y",
            tabName: "subNodeInfoParams",
            objectName: "subNodeInfoParams",
            headerFieldList: [
              {
                label: "编译类型",
                fieldName: "compileType",
                type: "select",
                defaultValue: "maven",
                actionName: "change",
                actions: (val: any) => {
                  nodeParams.value = loadPlugin(val["compileType"]);
                },
                optionList: compileTypeList,
                required: true,
                formVisible: true
              }
            ],
            fieldList: nodeParams
          }
        ]
      }
    ]
  });
  const init = async () => {
    let reData = await loadData("/devops-continus/continus/baseInfo/projectType", {});
    compileTypeList.value = reData?.data;
  };
  onMounted(async () => {
    await init();
  });
</script>

<template>
  <star-horse-form-item
      ref="nodeInfoRef"
      :fieldList="fieldList"
      class="node-info"
      v-model:dataForm="dataForm"

  />
</template>
<style lang="scss" scoped>
  .el-card {
    width: 100%;
  }
  .comp-info {
    display: block !important;
    border: 1px solid #e8e8e8;
  }
  .el-tabs {
    margin: 5px 10px;
  }

  .report-switch {
    display: block;
    width: 100%;
    vertical-align: middle;
    margin-left: 15px;
  }

  .report-content {
    margin: 0 20px;
  }

  .el-sub-menu {
    margin-top: 10px;
    border: 1px solid #e8e8e8;
  }
</style>
