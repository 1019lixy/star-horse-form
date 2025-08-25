<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  visible: boolean;
  formProps: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const dataSourceFormRef = ref<any>(null);

const submitValid = async () => {
  const result = await dataSourceFormRef.value.submitValid();
  if (result) {
    emit("merge");
  }
};

const resetDataSourceForm = () => {
  props.formProps["dataSource"] = "data";
  props.formProps["httpMethod"] = null;
  props.formProps["urlOrDictName"] = null;
  props.formProps["queryParams"] = [];
  props.formProps["values"] = [];
};

defineExpose({
  setFormData: (data: any) => {
    if (dataSourceFormRef.value) {
      dataSourceFormRef.value.setFormData(data);
    }
  }
});
</script>

<template>
  <star-horse-dialog 
    :dialogVisible="visible" 
    title="数据源配置" 
    :isBatch="false" 
    @merge="submitValid"
    @closeAction="emit('close')" 
    @resetForm="resetDataSourceForm" 
    :selfFunc="true">
    <data-source-comp 
      ref="dataSourceFormRef" 
      :formProps="formProps" />
  </star-horse-dialog>
</template>