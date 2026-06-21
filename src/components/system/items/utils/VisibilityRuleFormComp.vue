<script setup lang="ts">
import { relationDataField } from "@/components/system/items/utils/ItemPreps.js";
import { PageFieldInfo } from "star-horse-lowcode";
import { nextTick, PropType, reactive, ref } from "vue";

defineOptions({ name: "VisibilityRuleFormComp" });

const props = defineProps({
  formProps: {
    type: Object as PropType<any>,
    default: () => ({}),
  },
  model: {
    type: String,
    default: "simple",
  },
});

const formRef = ref();

const fieldConfig = reactive<PageFieldInfo | any>(relationDataField(props.formProps, props.model));

const setFormData = (data: any) => {
  nextTick(() => {
    if (data && formRef.value) {
      formRef.value.setFormData(data);
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
  }
  return flag;
};

defineExpose({ submitValid, setFormData, getFormData });
</script>

<template>
  <star-horse-form
    :fieldList="fieldConfig"
    ref="formRef"
  />
</template>

<style scoped lang="scss"></style>
