<script setup lang="ts">
import {i18n} from "@/lang";
import {createApiDataSourceConfig} from "@/components/system/items/utils/ApiDataSourceConfig";
import {PageFieldInfo} from "star-horse-lowcode";
import {nextTick, PropType, reactive, ref} from "vue";

defineOptions({
  name: "ApiDataSourceComp",
});

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
});

const dataSourceFormRef = ref();

const apiDataSourceField = reactive<PageFieldInfo | any>({
    fieldList:[createApiDataSourceConfig()]
});

const setFormData = (data: any) => {
  nextTick(() => {
    if (data?.apiDataSource && dataSourceFormRef.value) {
      dataSourceFormRef.value.setFormData(data.apiDataSource);
    }
  });
};

const getFormData = () => {
  return dataSourceFormRef.value?.getFormData();
};

const submitValid = async () => {
  let flag = false;
  const starForm = dataSourceFormRef.value?.$refs?.starHorseFormRef;
  if (starForm) {
    await starForm.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      return flag;
    }
  }
  const formData = dataSourceFormRef.value?.getFormData();
  if (formData && props.formProps) {
    props.formProps["apiDataSource"] = formData.value ?? formData;
  }
  return true;
};

defineExpose({
  submitValid,
  setFormData,
  getFormData,
});
</script>

<template>
  <star-horse-form
    :fieldList="apiDataSourceField"
    ref="dataSourceFormRef"
  />
</template>

<style scoped lang="scss"></style>
