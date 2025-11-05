<script setup lang="ts">
import { ref } from "vue";
import { buttonClickDataField } from "@/components/system/items/utils/ItemPreps.js";
import { i18n } from "@/lang/index.js";

const props = defineProps<{
  visible: boolean;
  formProps: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const buttonClickFormRef = ref<any>(null);

const buttonEventMerge = () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    if (!res) {
      return;
    }
    const formData = buttonClickFormRef.value.getFormData();
    Object.entries(formData.value).forEach(([key, value]) => {
      props.formProps[key] = value;
    });
    emit("merge");
  });
};

const buttonEventReset = () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.resetFields();
};

defineExpose({
  buttonEventReset,
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="i18n('dyform.button.event.title')"
    :isBatch="false"
    @merge="buttonEventMerge"
    @closeAction="emit('close')"
    @resetForm="buttonEventReset"
    :selfFunc="true"
  >
    <star-horse-form
      :outerFormData="formProps"
      primary-key=""
      ref="buttonClickFormRef"
      :fieldList="buttonClickDataField()"
    />
  </star-horse-dialog>
</template>
