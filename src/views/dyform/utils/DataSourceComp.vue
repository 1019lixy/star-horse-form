<script setup lang="ts" >
import {onMounted, reactive, ref, unref, PropType} from "vue";
import {
  SelectOption, searchMatchList, httpMethod, PageFieldInfo, loadDict,
  error
} from "star-horse-lowcode";
import {createData, urlReturnDataHelpMsg, validInterface, validOperation} from "@/views/dyform/utils/ItemPreps.ts";
defineOptions({
  name: "DataSourceComp",
})
const props = defineProps({
  formProps: {type: Object as PropType<any>},
});
const dataSourceList: Array<SelectOption> = [
  {value: "data", name: "静态数据"},
  {value: "url", name: "动态接口"},
  {value: "dict", name: "数据字典"}
];
const dataSourceFormRef = ref();
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
onMounted(async () => {
  // matchTypeList.value = searchMatchList();
  envList.value = await loadDict("system_environment");
});
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

//解决窗口改变是数据变成默认的情况
// const formData: any = unref(dataSourceRef)?.getFormData()?.value;
// if (formData && Object.keys(formData).length > 0) {
//   innerFunc(formData["dataSource"]);
//   // validOperation(formData["dataSource"], dataSourceRef, fieldList, disableUrl);
// }
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
                    await validOperation(val, dataSourceFormRef, fieldList, disableUrl);
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
                    await validOperation(val, dataSourceFormRef, fieldList, disableUrl);
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
      props.formProps["values"] = createData(dataSourceFormRef, dataList).reDataList;
      flag = true;
    } else {
      error(errorMsg);
      flag = false;
    }
  });
  return flag;
};
const setFormData = (data: any) => {
  dataSourceFormRef.value?.setFormData(data);
}
defineExpose({
  submitValid,
  setFormData
});
</script>

<template>
  <star-horse-form
      :outerFormData="formProps"
      ref="dataSourceFormRef"
      :fieldList="dataSourceField"
  />
</template>

<style scoped lang="scss">

</style>
