<script setup lang="ts">
import {i18n} from "@/lang/index.js";
import {onMounted, ref, watch} from "vue";
import FormPreview from "@/components/system/items/form/components/FormPreview.vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();
const props = defineProps<{
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
const pageStyle = ref<string>("");
onMounted(() => {
});
watch(() => props.currentPageClass, (newVal) => {
  pageStyle.value = newVal;
}, {immediate: true});
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
      :fullScreen="true"
      :title="i18n('dyform.preview.dialog.title')"
      :source="3"
  >
    <el-tabs v-model="pageStyle">
      <el-tab-pane name="main-design" :label="i18n('dyform.dialog.411')">
        <FormPreview
            :compSize="compSize"
            :currentPageClass="pageStyle"
            :list="list"
            ref="previewFormRef"
        />
      </el-tab-pane>
      <el-tab-pane name="main-design-pad" :label="i18n('dyform.dialog.412')">
        <FormPreview
            :compSize="compSize"
            :currentPageClass="pageStyle"
            :list="list"
            ref="previewFormRef"
        />
      </el-tab-pane>
      <el-tab-pane name="main-design-phone" :label="i18n('dyform.dialog.413')">
        <FormPreview
            :compSize="compSize"
            :currentPageClass="pageStyle"
            :list="list"
            ref="previewFormRef"
        />
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}
</style>
