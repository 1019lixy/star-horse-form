<script setup lang="ts">
import { ModelRef, ref } from "vue";
import { i18n } from "@/lang/index.js";
import DataSourceComp from "@/components/system/items/utils/DataSourceComp.vue";
 defineProps<{
  visible: boolean;
  formProps: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const dataSourceFormRef = ref<any>(null);
const dataForm: ModelRef<any> = defineModel("dataForm");
const submitValid = async () => {
  const result = await dataSourceFormRef.value.submitValid();
  if (result) {
    emit("merge");
  }
};

const resetDataSourceForm = () => {
  dataForm.value["dataSource"] = "data";
  dataForm.value["httpMethod"] = null;
  dataForm.value["urlOrDictName"] = null;
  dataForm.value["queryParams"] = [];
  dataForm.value["values"] = [];
};

defineExpose({
  setFormData: (data: any) => {
    if (dataSourceFormRef.value) {
      dataSourceFormRef.value.setFormData(data);
    }
  },
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="i18n('dyform.data.source.dialog.title')"
    :isBatch="false"
    @merge="submitValid"
    @closeAction="emit('close')"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
  >
    <data-source-comp ref="dataSourceFormRef" :formProps="formProps" />
  </star-horse-dialog>
</template>
