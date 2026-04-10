<script setup lang="ts">
import { i18n } from "@/lang/index.js";
import { error, success } from "star-horse-lowcode";
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  compSize: string;
  list: any[];
  currentPageClass?: string;
  formStyle?: string;
}>();
const previewFormRef = ref();
const validateForm = async () => {
  if (
    previewFormRef.value &&
    previewFormRef.value.$refs &&
    previewFormRef.value.$refs.previewFormRef
  ) {
    try {
      await previewFormRef.value.$refs.previewFormRef.validate();
      success(i18n("dyform.preview.validate.success"));
      return true;
    } catch (e) {
      error(i18n("dyform.preview.validate.failure"));
      return false;
    }
  }
  return true;
};

// HTML export function
const exportToHtml = () => {
  // if (!previewFormRef.value) return;
  // let formContent = "";
  // if (
  //   previewFormRef.value.$el &&
  //   typeof previewFormRef.value.$el.innerHTML === "string"
  // ) {
  //   formContent = previewFormRef.value.$el.innerHTML;
  // } else {
  //   console.error("Unable to access form content for export");
  //   error(i18n("dyform.preview.html.export.failure"));
  //   return;
  // }


  // Create blob and download
  // const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  // const url = URL.createObjectURL(blob);
  // const link = document.createElement("a");
  // link.href = url;
  // link.download = "form-preview.html";
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
  // URL.revokeObjectURL(url);
  // success(i18n("dyform.preview.html.export.success"));
};
const selectDatas = ref<any>([]);
const formData = ref<any>({
  pageStyle: "normal",
});
onMounted(() => {
  nextTick(() => {
    selectDatas.value = [
      { name: "默认", value: "normal", key: "normal" },
      { name: "表单", value: "form", key: "form" },
      { name: "表单列表", value: "form-table", key: "form-table" },
      { name: "Tab", value: "tab", key: "tab" },
      { name: "查看", value: "view", key: "view" },
    ];
  });
});
watch(
  () => props.formStyle,
  (val) => {
    formData.value.pageStyle = val ?? "form";
  },
  { immediate: true },
);
defineExpose({
  validateForm,
  exportToHtml,
});
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <el-form-item label="页面风格" class="w-[240px]!">
      <select-item
        v-model:formData="formData"
        source="1"
        :field="{
          fieldName: 'pageStyle',
          preps: {
            values: selectDatas,
          },
        }"
      />
    </el-form-item>
    <div class="flex-1 w-full h-full relative" :class="currentPageClass">
      <NormalPage v-if="formData.pageStyle == 'normal'" :compList="list" :currentPageClass="currentPageClass" />
      <FormPage v-if="formData.pageStyle == 'form'" :compList="list" :currentPageClass="currentPageClass"/>
      <FormTablePage
        v-if="formData.pageStyle == 'form-table'"
        :compList="list"
        :currentPageClass="currentPageClass"
      />
      <TabPage v-if="formData.pageStyle == 'tab'" :compList="list" :currentPageClass="currentPageClass"/>
      <ViewFormPage v-if="formData.pageStyle == 'view'" :compList="list" :currentPageClass="currentPageClass"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}
</style>
