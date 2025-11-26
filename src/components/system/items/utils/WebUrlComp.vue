<script setup lang="ts">
import {
  getInterfaceUtils,
  getUrlFieldConfig,
  validOperation,
} from "@/components/system/items/utils/ItemPreps";
import { PageFieldInfo, searchMatchList } from "star-horse-lowcode";
import {
  ModelRef,
  nextTick,
  onMounted,
  PropType,
  reactive,
  ref,
  unref,
} from "vue";

defineOptions({
  name: "WebUrlComp",
});
const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => {},
  },

  preps: {
    type: Object as PropType<any>,
    default: () => {},
  },

  item: {
    type: Object as PropType<PageFieldInfo>,
    default: () => {},
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
const currentTabName = ref<string>("data");

// 使用从ItemPreps导入的接口工具函数
const interfaceUtils = getInterfaceUtils();
const { fieldList, disableUrl } = interfaceUtils;
// 使用getUrlFieldConfig函数生成URL配置字段列表
const urlFields = getUrlFieldConfig(interfaceUtils, {
  urlColspan: 20,
  validateButtonText: "校验",
  showLabelFields: true,
  validateCallback: {
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
});

const dataSourceField = reactive<PageFieldInfo | any>({
  fieldList: [
    ...urlFields,
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
  await validOperation(
    props.formProps,
    dataSourceFormRef,
    fieldList,
    disableUrl,
    !dataForm.value,
    dataForm,
    true,
  )
    .then(() => {
      // 如果验证成功，需要保存数据
      if (props.formProps) {
        const dataSource = unref(dataSourceFormRef)?.getFormData()?.value;
        if (dataSource) {
          props.formProps["values"] = dataSource["values"];
        }
      }
      flag = true;
    })
    .catch(() => {
      flag = false;
    });
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
