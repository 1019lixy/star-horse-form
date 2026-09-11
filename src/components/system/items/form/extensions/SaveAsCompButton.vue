<script setup lang="ts">
/**
 * 存为组件扩展按钮（自包含：按钮 + 保存自定义组件弹窗）。
 *
 * 放入设计器 #toolbar-extra 插槽即启用"存为自定义组件"能力。
 *
 * ⚠️ 与左侧"我的组件"Tab（MyComponentsPanel）配套使用：
 * 保存成功后会调用 loadCustomComponents 刷新组件列表，
 * 未引入 MyComponentsPanel 时按钮保存后无可见效果——
 * 两者应同步引入，保持按钮与功能一致。
 */
import {computed, ref} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import SaveAsCustomCompDialog from "@/components/system/items/form/dialogs/SaveAsCustomCompDialog.vue";
import ExtToolbarButton from "@/components/system/items/form/extensions/ExtToolbarButton.vue";
import {loadCustomComponents} from "@/components/system/items/utils/FieldOperationUtils";
import {FormConfig} from "@/components/types";

defineOptions({name: "SaveAsCompButton"});

const props = defineProps<{
  /** 与设计器一致的 FormConfig（自定义组件保存 API 由 optional 配置） */
  optional?: FormConfig;
}>();

const designForm = getDesignFormStore();
const currentComp = computed(() => designForm.currentComp);
const saveAsCompDialogRef = ref();
</script>

<template>
  <ExtToolbarButton
      icon="component"
      :label="i18n('dyform.action.saveAsComp')"
      @click="saveAsCompDialogRef?.open()"
  />
  <SaveAsCustomCompDialog
      ref="saveAsCompDialogRef"
      :currentComp="currentComp"
      :optional="props.optional"
      @saved="loadCustomComponents"
  />
</template>