<script setup lang="ts">
import { i18n } from "@/lang";
import { createApiDataSourceConfig } from "@/components/system/items/utils/ApiDataSourceConfig";
import { PageFieldInfo } from "star-horse-lowcode";
import { nextTick, PropType, reactive, ref } from "vue";

defineOptions({ name: "ApiSourceFormComp" });

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
});

const formRef = ref();

const fieldConfig = reactive<PageFieldInfo | any>(createApiDataSourceConfig());

const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.apiDataSource && formRef.value) {
      formRef.value.setFormData(data.apiDataSource);
    }
  });
};

const getFormData = () => {
  return formRef.value?.getFormData();
};

const submitValid = async () => {
  let flag = false;
  const starForm = formRef.value?.$refs?.starHorseFormRef;
  if (starForm) {
    await starForm.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) return flag;
  }
  const formData = formRef.value?.getFormData();
  if (formData && props.formProps) {
    props.formProps["apiDataSource"] = formData.value ?? formData;
  }
  return true;
};

defineExpose({ submitValid, setFormData, getFormData });
</script>

<template>
  <star-horse-form :fieldList="fieldConfig" ref="formRef" />
</template>

<style scoped lang="scss"></style>
