<script setup lang="ts">
/**
 * 规则引擎扩展按钮（自包含：按钮 + 规则配置面板）。
 *
 * 放入设计器 #toolbar-extra 插槽即启用规则配置能力：
 * 表单 ID 与字段元数据自动从设计器 store 提取。
 */
import {computed, ref} from "vue";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import RuleConfigPanel from "@/components/system/items/form/components/RuleConfigPanel.vue";
import ExtToolbarButton from "@/components/system/items/form/extensions/ExtToolbarButton.vue";
import {extractFieldMetaList} from "@/components/rule/useFormRuleRuntime";
import {FormConfig} from "@/components/types";

defineOptions({name: "RuleConfigButton"});

const props = defineProps<{
  /** 与设计器一致的 FormConfig（取 primaryKey） */
  optional?: FormConfig;
  /** 主键兜底（与 StarHorseFormDesign.primaryKey 一致） */
  primaryKey?: string;
}>();

const designForm = getDesignFormStore();
const list = computed(() => designForm.compList);
const formInfo = computed(() => designForm.formInfo);
const ruleConfigDialogVisible = ref(false);

/** 从 formInfo 提取表单主键作为规则引擎 formId */
const ruleFormId = computed(() => {
  const pk = props.optional?.primaryKey ?? props.primaryKey ?? "idDynamicForm";
  return formInfo.value?.[pk] || formInfo.value?.formId || "";
});

/** 从 compList 提取字段元数据列表，供规则设计器 FieldSelector 使用 */
const ruleFormFields = computed(() => extractFieldMetaList(list.value || []));
</script>

<template>
  <ExtToolbarButton
      icon="rule"
      :label="i18n('dyform.toolbar.ruleConfig')"
      @click="ruleConfigDialogVisible = true"
  />
  <RuleConfigPanel
      v-model="ruleConfigDialogVisible"
      :formId="ruleFormId"
      :formFields="ruleFormFields"
      :compList="list"
  />
</template>