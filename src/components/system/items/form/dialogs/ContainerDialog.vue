<script setup lang="ts">
import { ref } from "vue";
import { containerField } from "@/components/system/items/utils/ItemPreps.js";
import { i18n } from "@/lang/index.js";

const props = defineProps<{
  visible: boolean;
  formProps: any;
  formInfo: any;
  currentItemType: string;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const containerPrepRef = ref<any>(null);

const containerAction = () => {
  const formData = containerPrepRef.value.getFormData();
  for (let key in formData.value) {
    props.formProps[key] = formData.value[key];
  }
  emit("merge");
};

const resetForm = () => {
  // Reset logic if needed
};

defineExpose({
  setFormData: (data: any) => {
    if (containerPrepRef.value) {
      containerPrepRef.value.setFormData(data);
    }
  },
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="i18n('dyform.container.dialog.title')"
    :isBatch="false"
    @merge="containerAction"
    @closeAction="emit('close')"
    @resetForm="resetForm"
    :selfFunc="true"
  >
    <star-horse-form
      ref="containerPrepRef"
      :outerFormData="formInfo"
      :fieldList="containerField(currentItemType)"
    />
  </star-horse-dialog>
</template>
