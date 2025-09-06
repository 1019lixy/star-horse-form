<script setup lang="ts">
import {onMounted, provide, reactive, ref, shallowRef} from "vue";
import {type ApiConfig, protocolOptions,} from "@/utils/apiConfig";
import {loadDict} from "@/api/star_horse_apis";
import {error, FieldInfo, formFieldMapping, PageFieldInfo, SelectOption, success} from "star-horse-lowcode";

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    default: false,
  },
  title: {
    type: String,
    default: "API配置",
  },
});

// 定义组件事件
const emit = defineEmits<{
  "update:visible": [value: boolean];
  save: [value: ApiConfig];
}>();
const formRef = ref();
// 响应式数据
const dataForm = defineModel("dataForm", {});
const apiConfigForm = ref<any>({
  env: "none",
  httpMethod: "POST",
  protocol: "HTTP"
});
const envOptions = ref<SelectOption[]>([]);
const httpMethodOptions = ref<SelectOption[]>([
  {value: "GET", name: "GET"},
  {value: "POST", name: "POST"},
  {value: "PUT", name: "PUT"},
  {value: "DELETE", name: "DELETE"},
  {value: "PATCH", name: "PATCH"},
]);

// 加载系统环境字典
const loadEnvOptions = async () => {
  try {
    envOptions.value = await loadDict("system_environment");
  } catch (err) {
    error("加载系统环境失败");
    console.error("Failed to load environment options:", err);
  }
};

const formFields = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "系统环境",
      fieldName: "env",
      type: "select",
      formVisible: true,
      required: true,
      defaultValue: "none",
      preps: {
        values: envOptions
      }
    },
    {
      label: "请求方式",
      fieldName: "httpMethod",
      type: "select",
      formVisible: true,
      required: true,
      defaultValue: "POST",
      preps: {
        values: httpMethodOptions
      }
    }, {
      label: "协议",
      fieldName: "protocol",
      type: "select",
      formVisible: true,
      required: true,
      defaultValue: "HTTP",
      preps: {
        values: protocolOptions
      }
    },
    {
      label: "IP/域名/服务名",
      fieldName: "host",
      formVisible: true,
      required: true,
      defaultValue: "localhost",
    },
    {
      label: "端口",
      fieldName: "port",
      type: "number",
      formVisible: true,
    },
    {
      label: "接口路径",
      fieldName: "interfaceUrl",
      helpMsg: "如：/api/data/list",
      formVisible: true,
      required: true,
    },
    {
      label: "定时刷新",
      fieldName: "enableAutoRefresh",
      type: "switch",
      formVisible: true,
      preps: {
        activeText: "开启",
        inactiveText: "关闭",
        activeValue: "Y",
        inactiveValue: "N",
        dataRelation: {
          actionName: "change",
          relationDetails: [
            {
              matchType: "eq",
              controlCondition: "eqVisible",
              relationFields: ["refreshInterval"],
              matchFieldValue: ["Y"],
            }]
        }
      }
    },
    {
      label: "刷新时间(秒)",
      fieldName: "refreshInterval",
      type: "number",
      formVisible: false,
      defaultValue: 10,
      preps: {
        min: 5,
        max: 3600,
        step: 1,
      }
    }
  ]
});
const formFields2 = shallowRef<Array<FieldInfo>>([]);
provide("formFields", formFields2);

// 保存API配置
const handleSave = () => {
  formRef.value.validate((result: boolean) => {
    if (!result) {
      return;
    }
    // 验证API配置
    // 发送更新事件
    dataForm.value = apiConfigForm.value;
    emit("update:visible", false);
    success("API配置已保存");
  });
};

// 取消保存
const handleCancel = () => {
  // 恢复原始值
  emit("update:visible", false);
};
onMounted(() => {
  loadEnvOptions();
  formFields2.value = formFieldMapping(formFields).formFields;
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="props.visible"
      :title="props.title"
      boxWidth="50%"
      @resetForm="apiConfigForm={}"
      @closeAction="handleCancel"
      @merge="handleSave"
      :selfFunc="true"
  >
    <sh-form
        ref="formRef"
        v-model:dataForm="apiConfigForm"
        label-width="auto"
        label-position="left"
        size="default"
    >
      <star-horse-form-item
          ref="dataSourceFormRef"
          :fieldList="formFields"
          compSize="default"
          v-model:dataForm="apiConfigForm"
      />
    </sh-form>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
