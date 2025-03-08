<script setup lang="ts" name="SubNodeInfo">
import {onMounted, PropType, reactive, ref} from "vue";
import {FieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import {SelectOption} from "@/components/types/SearchProps";
import {compileTypeList, dataInit, extendCommonFields, loadPlugin} from "@/views/continus/utils/ToolsParams.ts";
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {ModelRef} from "vue-demi";
import {loadDict} from "@/api/star_horse.ts";
import {loadProp} from "@/api/sh_api.ts";

const props = defineProps({
  preps: {
    type: Object as PropType<any>, default: () => {
    }
  }
});
const nodeInfoRef = ref<any>();
const nodeTypeList = ref<SelectOption[]>([]);
const execTypeList = ref<SelectOption[]>([]);
let nodeParams = ref<FieldInfo[]>([]);
const dataForm: ModelRef<any> = defineModel("dataForm");
const fieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      cardList: [
        {
          title: "节点信息",
          subFormFlag: "Y",
          tabName: "subNodeInfo",
          objectName: "subNodeInfo",
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
            ],
            {
              cardList: [
                {
                  title: "节点参数",
                  subFormFlag: "Y",
                  tabName: "nodeParams",
                  objectName: "nodeParams",
                  headerFieldList: [
                    {
                      label: "编译工具",
                      fieldName: "compileType",
                      type: "select",
                      actionName: "change",
                      actions: async (val: any) => {
                        let plugin = val["compileType"];
                        if (!plugin) {
                          return;
                        }
                        nodeParams.value =await loadPlugin(plugin);
                        console.log(nodeParams.value);
                      },
                      optionList: compileTypeList,
                      required: true,
                      formVisible: true
                    }
                  ],
                  fieldList: nodeParams
                }
              ]
            },
            ...extendCommonFields
          ]
        }
      ]
    }
  ]
});
const init = async () => {
  dataInit();
  let dictDatas = await loadDict("CONTINUS_NODE_TYPE");
  nodeTypeList.value = dictDatas?.filter((item: any) => item.value != "all");
  execTypeList.value = await loadDict("EXECUTION_TYPE");

};
onMounted(async () => {
  await init();
});
</script>

<template>
  <div class="node-info">
    <el-scrollbar height="100%">
      <star-horse-form-item
          ref="nodeInfoRef"
          :fieldList="fieldList"
          :dataIndex="(props.preps?.params?.totalTab||1)-1"
          :subFormFlag="'Y'"
          :objectName="'subNodeInfo'"
          v-model:dataForm="dataForm"
      />
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>
.node-info {
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow: hidden;
}

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
