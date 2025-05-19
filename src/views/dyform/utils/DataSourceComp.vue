<script setup lang="ts">
import {ModelRef, nextTick, onMounted, PropType, reactive, ref, watch} from "vue";
import {error, httpMethod, loadDict, PageFieldInfo, searchMatchList, SelectOption} from "star-horse-lowcode";
import {createData, urlReturnDataHelpMsg, validInterface, validOperation} from "@/views/dyform/utils/ItemPreps";

defineOptions({
  name: "DataSourceComp",
})
const props = defineProps({
  formProps: {type: Object as PropType<any>},
  preps: {type: Object as PropType<any>},
  item: {type: Object as PropType<PageFieldInfo>, required: true},
});
const dataSourceList: Array<SelectOption> = [
  {value: "data", name: "静态数据"},
  {value: "url", name: "动态接口"},
  {value: "dict", name: "数据字典"}
];
const dataSourceFormRef = ref();
const dataForm: ModelRef<any> = defineModel("dataForm");
const matchTypeList = searchMatchList();
const disableData = ref<boolean>(false);
const disableUrl = ref<boolean>(true);
const disableDict = ref<boolean>(true);
const dataRequired = ref<boolean>(true);
const urlRequired = ref<boolean>(false);
const dictRequired = ref<boolean>(false);
const currentTabName = ref<string>("data");
const fieldList = ref<SelectOption[]>([]);
let envList = ref<Array<SelectOption>>([]);

const innerFunc = (type: string) => {
  disableData.value = true;
  disableUrl.value = true;
  disableDict.value = true;
  dataRequired.value = false;
  urlRequired.value = false;
  dictRequired.value = false;
  currentTabName.value = type;
  if (type == "url") {
    disableUrl.value = false;
    urlRequired.value = true;
  } else if (type == "data") {
    disableData.value = false;
    dataRequired.value = true;
  } else if (type == "dict") {
    disableDict.value = false;
    dictRequired.value = true;
  }
}

const dataSourceField = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "表单属性",
        fieldName: "label",
        type: "tag",
        formVisible: true,
        listVisible: true,
        preps: {
          colspan: 8
        }
      },
      {
        label: "数据源类型",
        fieldName: "dataSource",
        type: "radio",
        required: true,
        formVisible: true,
        listVisible: true,
        defaultValue: "data",
        optionList: dataSourceList,
        actionName: "change",
        actions: (val: any) => {
          const type = val["dataSource"];
          innerFunc(type);
        }
      }
    ],
    {
      fieldName: currentTabName,
      tabList: [
        {
          title: "静态数据",
          tabName: "data",
          disabled: disableData,
          batchFieldList: [
            {
              batchName: "values",
              fieldList: [
                {
                  label: "属性名",
                  fieldName: "name",
                  type: "input",
                  required: dataRequired,
                  formVisible: true,
                  listVisible: true
                },
                {
                  label: "属性值",
                  fieldName: "value",
                  type: "input",
                  required: dataRequired,
                  formVisible: true,
                  listVisible: true
                }
              ]
            }
          ]
        },
        {
          title: "动态接口参数",
          tabName: "url",
          disabled: disableUrl,
          fieldList: [
            [
              {
                label: "系统环境",
                fieldName: "env",
                type: "select",
                required: urlRequired,
                defaultValue: "",
                formVisible: true,
                listVisible: true,
                optionList: envList
              },
              {
                label: "请求方式",
                fieldName: "httpMethod",
                type: "select",
                required: urlRequired,
                defaultValue: "POST",
                formVisible: true,
                listVisible: true,
                optionList: httpMethod()
              },
              {
                label: "协议",
                fieldName: "protocol",
                type: "select",
                required: urlRequired,
                defaultValue: "http",
                formVisible: true,
                listVisible: true,
                optionList: [
                  {name: "HTTP", value: "http"},
                  {name: "HTTPS", value: "https"}
                ]
              }
            ],
            [
              {
                label: "IP/域名/服务名",
                fieldName: "host",
                type: "input",
                required: urlRequired,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 16
                }
              },
              {
                label: "端口",
                fieldName: "port",
                type: "number",
                min: 1,
                max: 65535,
                formVisible: true,
                listVisible: true,
                preps: {
                  colspan: 8
                }
              }
            ],
            {
              label: "接口地址",
              fieldName: "interfaceUrl",
              type: "input",
              required: urlRequired,
              helpMsg: urlReturnDataHelpMsg,
              formVisible: true,
              preps: {
                appendAction: {
                  icon: "valid",
                  actions: async (val: any) => {
                    await validOperation(val, dataSourceFormRef, fieldList, disableUrl, !dataForm.value, dataForm);
                  }
                }
              }
            },
            [
              {
                label: "标签名字段",
                fieldName: "selectLabel",
                type: "select",
                optionList: fieldList,
                required: urlRequired,
                formVisible: true,
                listVisible: true
              },
              {
                label: "标签值字段",
                fieldName: "selectValue",
                type: "select",
                optionList: fieldList,
                required: urlRequired,
                formVisible: true,
                listVisible: true
              }
            ],
            {
              fieldName: "queryParams",
              tabList: [{
                title: "标准参数",
                tabName: "queryParams",
                objectName: "queryParams",
                batchFieldList: [
                  {
                    batchName: "queryParams",
                    fieldList: [
                      {
                        label: "参数名",
                        fieldName: "name",
                        type: "select",
                        optionList: fieldList,
                        required: urlRequired,
                        formVisible: true,
                        listVisible: true,
                        preps: {
                          allowCreate: "Y",
                        }
                      },
                      {
                        label: "参数值",
                        fieldName: "value",
                        type: "input",
                        required: urlRequired,
                        formVisible: true,
                        listVisible: true
                      },
                      {
                        label: "匹配方式",
                        fieldName: "matchType",
                        type: "select",
                        defaultValue: "eq",
                        required: urlRequired,
                        formVisible: true,
                        listVisible: true,
                        optionList: matchTypeList
                      }
                    ]
                  }
                ]
              }, {
                title: "自定义参数",
                tabName: "customParams",
                objectName: "customParams",
                fieldList: [{
                  fieldName: "customParams",
                  label: "自定义JSON参数",
                  type: "json",
                  formVisible: true,
                  listVisible: true,
                  required: urlRequired,
                  defaultValue: "",
                  preps: {
                    devType: "Y"
                  }
                }]
              }]
            }
          ],

        },
        {
          title: "数据字典",
          tabName: "dict",
          disabled: disableDict,
          fieldList: [
            {
              label: "字典名称",
              fieldName: "urlOrDictName",
              type: "input",
              required: dictRequired,
              formVisible: true,
              listVisible: true,
              preps: {
                appendAction: {
                  icon: "valid",
                  actionTitle: "验证",
                  actions: async (val: any) => {
                    await validOperation(val, dataSourceFormRef, fieldList, disableUrl, !dataForm.value, dataForm);
                  }
                }
              }
            }
          ]
        }
      ]
    }
  ]
});
const submitValid = async () => {
  let flag: boolean = false;
  await validInterface(props.formProps, dataSourceFormRef, (dataList: any, _successMsg: string, errorMsg: string) => {
    if (!errorMsg) {
      //只保存静态数据,
      if (props.formProps) {
        props.formProps["values"] = createData(dataSourceFormRef, dataList).reDataList;
      }
      flag = true;
    } else {
      error(errorMsg);
      flag = false;
    }
  }, !dataForm.value, dataForm);
  return flag;
};
const isInited = ref<boolean>(false);
const init = () => {
  loadDict("system_environment").then(res => {
    envList.value = res;
  });
  nextTick(() => {
    if (props.preps?.objectName && dataForm.value) {
      let temp = dataForm.value;

      setFormData(temp);
      currentTabName.value = temp.dataSource || "data";
      isInited.value = true;
    }
  });
}
const setFormData = (data: any) => {
  !dataForm.value && dataSourceFormRef.value?.setFormData(data);
}
const getFormData = () => {
  return dataSourceFormRef.value?.getFormData();
}
watch(() => dataForm.value?.dataSource, (val) => {
  currentTabName.value = val || "data";
});
onMounted(() => {
  init();
});

defineExpose({
  submitValid,
  setFormData,
  getFormData
});
</script>

<template>
  <el-scrollbar height="100%">
    <star-horse-form :fieldList="dataSourceField" ref="dataSourceFormRef" v-if="!dataForm"/>
    <star-horse-form-item
        v-else
        ref="dataSourceFormRef"
        :fieldList="dataSourceField"
        :dataIndex="(props.preps?.params?.totalTab||1)-1"
        :subFormFlag="'Y'"
        :objectName="'dataSource'"
        v-model:dataForm="dataForm"
    />
  </el-scrollbar>
</template>

<style scoped lang="scss">

</style>

