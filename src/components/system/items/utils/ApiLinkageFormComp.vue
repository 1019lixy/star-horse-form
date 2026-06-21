<script setup lang="ts">
import { i18n } from "@/lang";
import { createApiLinkageConfig } from "@/components/system/items/utils/ApiLinkageConfig";
import { PageFieldInfo, SelectOption } from "star-horse-lowcode";
import { nextTick, PropType, reactive, ref } from "vue";

defineOptions({ name: "ApiLinkageFormComp" });

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  formFields: {
    type: Array as PropType<SelectOption[]>,
    default: () => [],
  },
});

const formRef = ref();

const fieldConfig = reactive<PageFieldInfo | any>(createApiLinkageConfig(props.formFields));

const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.apiLinkage && formRef.value) {
      formRef.value.setFormData(data.apiLinkage);
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
    props.formProps["apiLinkage"] = formData.value ?? formData;
  }
  return true;
};

defineExpose({ submitValid, setFormData, getFormData });
</script>

<template>
  <star-horse-form :fieldList="fieldConfig" ref="formRef" />
</template>

<style scoped lang="scss"></style>
