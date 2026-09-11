<script setup lang="ts">
/**
 * AI 助手扩展按钮（自包含：按钮 + AI 对话弹窗 + 应用生成表单）。
 *
 * 放入设计器 #toolbar-extra 插槽即启用 AI 助手能力：
 * AI 生成的表单组件列表会直接应用到当前设计器。
 */
import {ref} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import AiDialog from "@/components/system/items/utils/AiDialog.vue";
import ExtToolbarButton from "@/components/system/items/form/extensions/ExtToolbarButton.vue";
import {initContainerDimensions} from "@/components/system/items/utils/FieldOperationUtils";
import {deepClone} from "@/api/system";

defineOptions({name: "AiChatButton"});

const designForm = getDesignFormStore();
const aiDialogVisible = ref(false);

/** AI 生成结果应用到设计器 */
const applyAiForm = (dataList: any[]) => {
  if (!Array.isArray(dataList) || dataList.length === 0) return;
  const parsed = deepClone(dataList);
  initContainerDimensions(parsed);
  designForm.setCompList(parsed);
};
</script>

<template>
  <ExtToolbarButton
      icon="ai"
      :label="i18n('dyform.aiChat.title')"
      @click="aiDialogVisible = true"
  />
  <AiDialog v-model:dialogVisible="aiDialogVisible" @applyForm="applyAiForm"/>
</template>
