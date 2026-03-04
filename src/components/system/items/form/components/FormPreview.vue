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
  if (!previewFormRef.value) return;
  let formContent = "";
  if (
    previewFormRef.value.$el &&
    typeof previewFormRef.value.$el.innerHTML === "string"
  ) {
    formContent = previewFormRef.value.$el.innerHTML;
  } else {
    console.error("Unable to access form content for export");
    error(i18n("dyform.preview.html.export.failure"));
    return;
  }
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${i18n("dyform.preview.html.title")}</title>
    <link rel="stylesheet" href="https://unpkg.com/element-plus/dist/index.css">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f7fa;
        }
        .form-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
        }
        .main-design {
            padding: 15px;
            background: rgba(247, 250, 250, 0.8);
        }
        .main-design-phone {
            width: 420px;
            margin: 15px auto;
            border-radius: 10px;
            box-shadow: 0 0 1px 10px #dcdfe6;
        }
        .main-design-pad {
            width: 960px;
            margin: 15px auto;
            border-radius: 10px;
            box-shadow: 0 0 1px 10px #dcdfe6;
        }
    </style>
</head>
<body>
    <div class="form-container">
        <h1>${i18n("dyform.preview.html.title")}</h1>
        <div class="${props.currentPageClass || "main-design"}">
            ${formContent}
        </div>
    </div>
</body>
</html>
  `.trim();

  // Create blob and download
  const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "form-preview.html";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  success(i18n("dyform.preview.html.export.success"));
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
    <div class="flex-1 w-full h-full relative">
      <NormalPage v-if="formData.pageStyle == 'normal'" :compList="list" />
      <FormPage v-if="formData.pageStyle == 'form'" :compList="list" />
      <FormTablePage
        v-if="formData.pageStyle == 'form-table'"
        :compList="list"
      />
      <TabPage v-if="formData.pageStyle == 'tab'" :compList="list" />
      <ViewFormPage v-if="formData.pageStyle == 'view'" :compList="list" />
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
