<script setup lang="ts">
import {i18n} from "@/lang/index.js";
import {onMounted, ref} from "vue";
import FormPreview from "@/components/system/items/form/components/FormPreview.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();
defineProps<{
  visible: boolean;
  compSize: string;
  list: any[];
  currentPageClass?: string; // Add currentPageClass prop
}>();
const closeAction = () => {
  emit("close");
};

const previewFormRef = ref();

// Form validation function
const validateForm = async () => {
  previewFormRef.value?.validateForm();
};

// HTML export function
const exportToHtml = () => {
  previewFormRef.value?.exportToHtml();

};
// Expose methods for parent component to use
onMounted(() => {

});
defineExpose({
  validateForm,
  exportToHtml,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      box-height="80%"
      :selfFunc="true"
      :compSize="compSize"
      :title="i18n('dyform.preview.dialog.title')"
      :source="3"
  >
    <div :class="currentPageClass">
      <FormPreview :compSize="compSize" :currentPageClass="currentPageClass" :list="list" ref="previewFormRef"/>
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}
</style>
