<script setup lang="ts">
import {loadDict} from "@/api/star_horse_apis";
import {httpMethod} from "@/api/system";
import {createData, urlReturnDataHelpMsg, validInterface, validOperation,} from "@/views/dyform/utils/ItemPreps";
import {error, loadGetData, PageFieldInfo, searchMatchList, SelectOption,} from "star-horse-lowcode";
import {ModelRef, nextTick, onMounted, PropType, reactive, ref,} from "vue";

defineOptions({
  name: "WebUrlComp",
});
const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => {
    },
  },

  preps: {
    type: Object as PropType<any>,
    default: () => {
    },
  },

  item: {
    type: Object as PropType<PageFieldInfo>,
    default: () => {
    },
  },
  source: {
    type: Number,
    default: 0,
  },
  batchName: {
    type: String,
    default: "",
  },
  subFormFlag: {
    type: Boolean,
    default: false,
  },
});

const dataSourceFormRef = ref();
const dataForm: ModelRef<any> = defineModel("dataForm");
const matchTypeList = searchMatchList();
const disableUrl = ref<boolean>(false);
const currentTabName = ref<string>("data");
const fieldList = ref<SelectOption[]>([]);
let envList = ref<Array<SelectOption>>([]);
const interfaceDatas = ref<any>({});
const methodList = ref<SelectOption[]>([]);
const interfaceList = ref<SelectOption[]>([]);
const loadInterface = (serviceName: string) => {
  loadGetData(`/userdb-manage/redirect/api/webApis2/${serviceName}`).then((res: any) => {
    interfaceDatas.value = res.data.apiList;
    interfaceList.value = res.data.options;
    console.log(interfaceDatas.value);
  });
};
const dataSourceField = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "应用名称",
        fieldName: "host",
        type: "select",
        formVisible: true,
        listVisible: true,
        actions: {
          change: (val: any) => {
            loadInterface(val["host"]);
          },
        },
        preps: {
          dataSource: "url",
          redirect: false,
          httpMethod: "GET",
          url: "/userdb-manage/redirect/api/service/list",
        },
      },
      {
        label: "接口",
        fieldName: "interfaceName",
        type: "select",
        formVisible: true,
        listVisible: true,
        actions: {
          change: (val: any) => {
            methodList.value = interfaceDatas.value[val["interfaceName"]];
          }
        },
        preps: {
          values: interfaceList,
        },
      },
      {
        label: "方法/函数",
        fieldName: "method",
        type: "select",
        formVisible: true,
        listVisible: true,
        actions: {
          change: (val: any) => {
            let temp = val["method"];
            let result: any = methodList.value.find((item: any) => item.methodName == temp);
            if (result) {
              val["httpMethod"] = result.method;
              val["url"] = result.serviceUrl;
            }
          }
        },
        preps: {
          values: methodList,
          props: {
            label: "summary",
            value: "methodName",
          },
        },
      },
    ],
    [
      {
        label: "请求方式",
        fieldName: "httpMethod",
        type: "select",
        required: true,
        defaultValue: "POST",
        formVisible: true,
        listVisible: true,
        preps: {
          values: httpMethod(),
        },
      },
      {
        label: "协议",
        fieldName: "protocol",
        type: "select",
        required: true,
        defaultValue: "http",
        formVisible: true,
        listVisible: true,
        preps: {
          values: [
            {name: "HTTP", value: "http"},
            {name: "HTTPS", value: "https"},
          ],
        },
      },
      {
        label: "接口代理",
        fieldName: "redirect",
        type: "switch",
        defaultValue: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "接口地址",
        fieldName: "url",
        required: true,
        helpMsg: urlReturnDataHelpMsg,
        formVisible: true,
        colspan: 20,
      },
      {
        label: "校验",
        type: "button",
        formVisible: true,
        actions: {
          click: async (val: any) => {
            await validOperation(
                val,
                dataSourceFormRef,
                fieldList,
                disableUrl,
                !dataForm.value,
                dataForm.value[props.batchName],
                true,
            );
          },
        },
        preps: {
          icon: "valid",
          colspan: 4,
        },
      },
    ],
    [
      {
        label: "标签名字段",
        fieldName: "selectLabel",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: fieldList,
        },
      },
      {
        label: "标签值字段",
        fieldName: "selectValue",
        type: "select",
        preps: {
          values: fieldList,
        },
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      fieldName: "queryParams",
      tabList: [
        {
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
                  required: true,
                  formVisible: true,
                  listVisible: true,
                  preps: {
                    values: fieldList,
                    allowCreate: "Y",
                  },
                },
                {
                  label: "参数值",
                  fieldName: "value",
                  required: true,
                  formVisible: true,
                  listVisible: true,
                },
                {
                  label: "匹配方式",
                  fieldName: "matchType",
                  type: "select",
                  defaultValue: "eq",
                  required: false,
                  formVisible: true,
                  listVisible: true,
                  preps: {
                    values: matchTypeList,
                  },
                },
              ],
            },
          ],
        },
        {
          title: "自定义参数",
          tabName: "customParams",
          objectName: "customParams",
          fieldList: [
            {
              fieldName: "customParams",
              label: "自定义JSON参数",
              type: "json",
              formVisible: true,
              listVisible: true,
              required: false,
              defaultValue: "",
              preps: {
                devType: "Y",
              },
            },
          ],
        },
      ],
    },
  ],
});
const submitValid = async () => {
  let flag: boolean = false;
  await validInterface(
      props.formProps,
      dataSourceFormRef,
      (dataList: any, _successMsg: string, errorMsg: string) => {
        if (!errorMsg) {
          //只保存静态数据,
          if (props.formProps) {
            props.formProps["values"] = createData(
                dataSourceFormRef,
                dataList,
            ).reDataList;
          }
          flag = true;
        } else {
          error(errorMsg);
          flag = false;
        }
      },
      !dataForm.value,
      dataForm,
      true,
  );
  return flag;
};
const isInited = ref<boolean>(false);
const createSubForm = () => {
  if (props.subFormFlag && !dataForm.value[props.batchName]) {
    dataForm.value[props.batchName] = {};
  }
  return props.batchName;
};
const init = () => {
  loadDict("system_environment").then((res) => {
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
};
const setFormData = (data: any) => {
  !dataForm.value && dataSourceFormRef.value?.setFormData(data);
};
const getFormData = () => {
  return dataSourceFormRef.value?.getFormData();
};

onMounted(() => {
  init();
});

defineExpose({
  submitValid,
  setFormData,
  getFormData,
});
</script>

<template>
  <el-scrollbar height="100%">
    <star-horse-form
        :fieldList="dataSourceField"
        ref="dataSourceFormRef"
        v-if="!dataForm"
    />
    <star-horse-form-item
        v-else
        ref="dataSourceFormRef"
        :fieldList="dataSourceField"
        :dataIndex="(props.preps?.params?.totalTab || 1) - 1"
        :subFormFlag="subFormFlag ? 'Y' : 'N'"
        :propPrefix="batchName"
        :key="createSubForm()"
        :batchName="batchName"
        :source="source"
        v-model:dataForm="dataForm[batchName]"
    />
  </el-scrollbar>
</template>

<style scoped lang="scss"></style>
