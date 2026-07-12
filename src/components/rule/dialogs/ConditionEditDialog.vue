<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="condition ? i18n('rule.dialog.editCondition') : i18n('rule.dialog.addCondition')"
    boxWidth="580px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="90px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.fieldName')" prop="fieldName">
        <el-input v-model="formData.fieldName" :placeholder="i18n('rule.ph.fieldNameExample')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.fieldLabel')">
        <el-input v-model="formData.fieldLabel" :placeholder="i18n('rule.ph.fieldLabelOptional')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.fieldType')" prop="fieldType">
        <el-select v-model="formData.fieldType" style="width: 100%;z-index:99999!important;"
                   @change="handleFieldTypeChange">
          <el-option :label="i18n('rule.dialog.string')" value="STRING" />
          <el-option :label="i18n('rule.dialog.number')" value="NUMBER" />
          <el-option :label="i18n('rule.dialog.date')" value="DATE" />
          <el-option :label="i18n('rule.dialog.boolean')" value="BOOLEAN" />
          <el-option :label="i18n('rule.dialog.array')" value="ARRAY" />
        </el-select>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.operator')" prop="operator">
        <el-select v-model="formData.operator" style="width: 100%;z-index:99999!important;"
                   @change="handleOperatorChange">
          <el-option-group v-for="group in operatorGroups" :key="group.label" :label="group.label">
            <el-option v-for="op in group.options" :key="op.value" :label="op.label" :value="op.value" />
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.valueType')" v-if="needsValue">
        <el-radio-group v-model="formData.valueType">
          <el-radio-button value="CONSTANT">{{ i18n('rule.dialog.constant') }}</el-radio-button>
          <el-radio-button value="VARIABLE">{{ i18n('rule.dialog.variable') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.conditionValue')" v-if="needsValue" prop="value">
        <!-- 日期选择器 -->
        <el-date-picker
          v-if="formData.fieldType === 'DATE' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          type="datetime"
          :placeholder="i18n('rule.ph.selectDateTime')"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
        <!-- 布尔选择 -->
        <el-select
          v-else-if="formData.fieldType === 'BOOLEAN' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          style="width: 100%"
        >
          <el-option :label="i18n('rule.dialog.yes')" value="true" />
          <el-option :label="i18n('rule.dialog.no')" value="false" />
        </el-select>
        <!-- 数组输入 -->
        <el-input
          v-else-if="formData.fieldType === 'ARRAY' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          :placeholder="i18n('rule.ph.arrayValuesCommaSeparated')"
        />
        <!-- 数字输入 -->
        <el-input-number
          v-else-if="formData.fieldType === 'NUMBER' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          :controls="false"
          :placeholder="i18n('rule.ph.enterNumber')"
          style="width: 100%"
        />
        <!-- 字符串输入 -->
        <el-input
          v-else-if="formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          :placeholder="i18n('rule.ph.enterConditionValue')"
        />
        <!-- 变量模式 -->
        <el-input
          v-else
          v-model="formData.value"
          :placeholder="i18n('rule.ph.enterVariableFieldName')"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { i18n } from '@/lang';

const props = defineProps<{
  visible: boolean
  condition: any
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", condition: any): void
}>();

const formRef = ref<FormInstance>();

const defaultFormData = () => ({
  fieldName: "",
  fieldLabel: "",
  fieldType: "STRING",
  operator: "EQ",
  valueType: "CONSTANT",
  value: "",
  logicOperator: "AND"
});

const formData = reactive(defaultFormData());

const rules = reactive<FormRules>({
  fieldName: [{ required: true, message: i18n('rule.ph.enterFieldName'), trigger: "blur" }],
  fieldType: [{ required: true, message: i18n('rule.ph.selectFieldType'), trigger: "change" }],
  operator: [{ required: true, message: i18n('rule.ph.selectOperator'), trigger: "change" }]
});

// 操作符分组（值与RuleExecutor一致）
const operatorGroups = computed(() => {
  const base = [
    { label: i18n('rule.dialog.equalTo'), value: "EQ" },
    { label: i18n('rule.dialog.notEqualTo'), value: "NE" }
  ];
  const numeric = [
    { label: i18n('rule.dialog.greaterThan'), value: "GT" },
    { label: i18n('rule.dialog.greaterThanOrEqualTo'), value: "GTE" },
    { label: i18n('rule.dialog.lessThan'), value: "LT" },
    { label: i18n('rule.dialog.lessThanOrEqualTo'), value: "LTE" }
  ];
  const string = [
    { label: i18n('rule.dialog.contains'), value: "CONTAINS" },
    { label: i18n('rule.dialog.notContains'), value: "NOT_CONTAINS" },
    { label: i18n('rule.dialog.startsWith'), value: "STARTS_WITH" },
    { label: i18n('rule.dialog.endsWith'), value: "ENDS_WITH" }
  ];
  const collection = [
    { label: i18n('rule.dialog.inList'), value: "IN" },
    { label: i18n('rule.dialog.notInList'), value: "NOT_IN" }
  ];
  const nullCheck = [
    { label: i18n('rule.dialog.isNull'), value: "IS_NULL" },
    { label: i18n('rule.dialog.isNotNull'), value: "NOT_NULL" }
  ];

  const groups: { label: string; options: any[] }[] = [
    { label: i18n('rule.dialog.basicComparison'), options: base }
  ];
  if (formData.fieldType === "NUMBER" || formData.fieldType === "DATE") {
    groups.push({ label: i18n('rule.dialog.numericComparison'), options: numeric });
  }
  if (formData.fieldType === "STRING") {
    groups.push({ label: i18n('rule.dialog.stringOperations'), options: string });
  }
  if (formData.fieldType === "ARRAY" || formData.fieldType === "STRING") {
    groups.push({ label: i18n('rule.dialog.collectionOperations'), options: collection });
  }
  groups.push({ label: i18n('rule.dialog.nullCheck'), options: nullCheck });
  return groups;
});

const needsValue = computed(() => {
  return !["IS_NULL", "NOT_NULL"].includes(formData.operator);
});

watch(() => props.visible, (val) => {
  if (val) {
    if (props.condition) {
      Object.assign(formData, defaultFormData(), props.condition);
    } else {
      Object.assign(formData, defaultFormData());
    }
    formRef.value?.clearValidate();
  }
});

const handleFieldTypeChange = () => {
  // 字段类型变化时，重置不适用的操作符
  const validOps = operatorGroups.value.flatMap(g => g.options.map(o => o.value));
  if (!validOps.includes(formData.operator)) {
    formData.operator = "EQ";
  }
  formData.value = "";
};

const handleOperatorChange = () => {
  if (!needsValue.value) {
    formData.value = "";
    formData.valueType = "CONSTANT";
  }
};

const handleClose = () => emit("close");

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (valid) {
      const data = { ...formData };
      // 数字类型转换值
      if (data.fieldType === "NUMBER" && data.valueType === "CONSTANT" && data.value !== "") {
        data.value = String(data.value);
      }
      emit("save", data);
    }
  });
};
</script>
