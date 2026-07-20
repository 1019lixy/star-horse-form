<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="condition ? i18n('rule.dialog.editCondition') : i18n('rule.dialog.addCondition')"
    boxWidth="580px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="90px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.fieldName')" prop="fieldName">
        <el-select
          v-model="formData.fieldName"
          style="width: 100%;z-index:99999!important;"
          filterable
          allow-create
          default-first-option
          :placeholder="i18n('rule.ph.fieldNameExample')"
          @change="handleFieldChange"
        >
          <!-- 表单字段分组（来自当前表单的字段元数据） -->
          <el-option-group
            v-if="formFields.length"
            :label="i18n('rule.dialog.formFields')"
          >
            <el-option
              v-for="f in formFields"
              :key="f.fieldName"
              :label="`${f.label || f.fieldName} (${f.fieldName})`"
              :value="f.fieldName"
            >
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
                <span>{{ f.label || f.fieldName }}</span>
                <span class="var-opt-field">{{ f.fieldName }}</span>
              </div>
            </el-option>
          </el-option-group>
          <!-- 变量库分组（INPUT/CONTEXT/CONSTANT） -->
          <template v-if="groupedVariables.length">
            <el-option-group
              v-for="grp in groupedVariables"
              :key="grp.source"
              :label="grp.label"
            >
              <el-option
                v-for="v in grp.items"
                :key="v.field"
                :label="`${v.label || v.field} (${v.field})`"
                :value="v.field"
              >
                <span style="float: left">{{ v.label || v.field }}</span>
                <span class="var-opt-field">{{ v.field }}</span>
              </el-option>
            </el-option-group>
          </template>
        </el-select>
        <div v-if="!formFields.length && !variables.length" class="lock-tip">
          {{ i18n('rule.msg.noFormFieldsHint') }}
        </div>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.fieldLabel')">
        <el-input v-model="formData.fieldLabel" :placeholder="i18n('rule.ph.fieldLabelOptional')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.fieldType')" prop="fieldType">
        <el-select v-model="formData.fieldType" style="width: 100%;z-index:99999!important;"
                   @change="handleFieldTypeChange" :disabled="fieldTypeLocked">
          <el-option :label="i18n('rule.dialog.string')" value="STRING" />
          <el-option :label="i18n('rule.dialog.number')" value="NUMBER" />
          <el-option :label="i18n('rule.dialog.date')" value="DATE" />
          <el-option :label="i18n('rule.dialog.boolean')" value="BOOLEAN" />
          <el-option :label="i18n('rule.dialog.array')" value="ARRAY" />
        </el-select>
        <div v-if="fieldTypeLocked" class="lock-tip">{{ i18n('rule.var.typeLockedFromVar') }}</div>
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
import { computed, inject, reactive, ref, watch, type Ref } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { i18n } from '@/lang';
import type { FormFieldMeta } from '../useFormRuleRuntime';

const props = defineProps<{
  visible: boolean
  condition: any
  variables?: Array<{
    field: string; label: string; type: string;
    source: "INPUT" | "CONTEXT" | "CONSTANT"; defaultValue?: string; desc?: string;
  }>
}>();

// 从 RuleDesigner 注入表单字段列表（provide 时的 key: ruleFormFields）
// 用于在字段下拉中显示当前表单的所有可选字段
const injectedFormFields = inject<Ref<FormFieldMeta[]> | FormFieldMeta[] | undefined>('ruleFormFields', undefined);
const formFields = computed<FormFieldMeta[]>(() => {
  if (!injectedFormFields) return [];
  const v = (injectedFormFields as any).value ?? injectedFormFields;
  return Array.isArray(v) ? v : [];
});
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
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

// 变量库分组（按来源：入参/上下文/常量）
const sourceLabel = (s: string) => ({
  INPUT: i18n('rule.var.sourceInput'),
  CONTEXT: i18n('rule.var.sourceContext'),
  CONSTANT: i18n('rule.var.sourceConstant')
}[s] || s);
const groupedVariables = computed(() => {
  const list = props.variables || [];
  const order = ["INPUT", "CONTEXT", "CONSTANT"];
  return order.map(src => ({
    source: src,
    label: sourceLabel(src),
    items: list.filter(v => (v.source || "INPUT") === src)
  })).filter(g => g.items.length > 0);
});

// 当前选中字段是否来自变量库（决定类型是否锁定）
const selectedVariable = computed(() =>
  (props.variables || []).find(v => v.field === formData.fieldName)
);
const fieldTypeLocked = computed(() => !!selectedVariable.value);

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

// 选择变量字段：自动回填显示名与类型
const handleFieldChange = (val: string) => {
  // 优先匹配变量库
  const v = (props.variables || []).find(x => x.field === val);
  if (v) {
    formData.fieldLabel = v.label || "";
    if (v.type && v.type !== formData.fieldType) {
      formData.fieldType = v.type as any;
      // 类型变化后重置操作符与值
      const validOps = operatorGroups.value.flatMap(g => g.options.map(o => o.value));
      if (!validOps.includes(formData.operator)) formData.operator = "EQ";
      formData.value = "";
    }
    return;
  }
  // 其次匹配表单字段（注入的 ruleFormFields）
  const f = formFields.value.find(x => x.fieldName === val);
  if (f) {
    formData.fieldLabel = f.label || f.fieldName;
    // 根据 itemType 推断字段类型
    const inferred = inferFieldTypeFromItemType(f.itemType || f.type);
    if (inferred && inferred !== formData.fieldType) {
      formData.fieldType = inferred;
      const validOps = operatorGroups.value.flatMap(g => g.options.map(o => o.value));
      if (!validOps.includes(formData.operator)) formData.operator = "EQ";
      formData.value = "";
    }
  }
};

/**
 * 根据表单字段 itemType 推断规则字段类型
 * - input/textarea/autocomplete/tselect/transfer → STRING
 * - number/rate → NUMBER
 * - date/datetime/daterange → DATE
 * - switch/checkbox → BOOLEAN (除非多选)
 */
const inferFieldTypeFromItemType = (itemType: string): "STRING" | "NUMBER" | "DATE" | "BOOLEAN" | "ARRAY" | null => {
  if (!itemType) return null;
  const t = itemType.toLowerCase();
  if (['number', 'rate', 'slider'].includes(t)) return 'NUMBER';
  if (['date', 'datetime', 'daterange', 'time', 'timerange'].includes(t)) return 'DATE';
  if (['switch'].includes(t)) return 'BOOLEAN';
  if (['checkbox', 'cascader', 'transfer'].includes(t)) return 'ARRAY';
  if (['input', 'textarea', 'select', 'autocomplete', 'radio', 'tselect', 'password'].includes(t)) return 'STRING';
  return null;
};

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

<style scoped>
.var-opt-field {
  float: right;
  font-size: 11px;
  color: #9ca3af;
  font-family: ui-monospace, monospace;
}
.lock-tip {
  font-size: 11px;
  color: #9ca3af;
  margin-top: 4px;
  line-height: 1.4;
}
</style>
