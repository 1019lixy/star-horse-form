<script setup lang="ts">
import { success, erroror} from "star-horse-lowcode";
import { ref, computed } from "vue";

const emit = defineEmits<{
  (e: "close"): vo
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
  if (previewFormRef.value && previewFormRef.value.$refs && previewFormRef.value.$refs.previewFormRef) {
    try {
      await previewFormRef.value.$refs.previewFormRef.validate();
      success("表单验证通过");
      return true;
    } catch (error) {
      error("表单验证失败，请检查输入");
      return false;
    }
  }
  return true;
};

// HTML export function
const exportToHtml = () => {
  if (!previewFormRef.value) return;
  
  // Get the form content
  const formContent = previewFormRef.value.$el.innerHTML;
  
  // Create HTML template
  const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>表单预览</title>
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
        <h1>表单预览</h1>
        <div class="${props.currentPageClass || 'main-design'}">
            ${formContent}
        </div>
    </div>
</body>
</html>
  `.trim();

  // Create blob and download
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'form-preview.html';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  success("HTML文件导出成功");
};

// Expose methods for parent component to use
defineExpose({
  validateForm,
  exportToHtml
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    :title="'表单预览'"
    :source="3"
  >
    <template #header>
      <div class="dialog-actions">
        <el-button @click="validateForm" type="primary" size="small">
          校验表单
        </el-button>
        <el-button @click="exportToHtml" type="success" size="small">
          导出HTML
        </el-button>
      </div>
    </template>
    <form-preview 
      :list="list" 
      ref="previewFormRef" 
      :class="currentPageClass"
    />
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}
</style>