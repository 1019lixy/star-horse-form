<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.variableAssignConfig')"
    boxWidth="720px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" size="default" ref="formRef" label-position="top">
      <div class="assign-toolbar">
        <span class="toolbar-title">{{ i18n('rule.lbl.assignList') }}</span>
        <el-button type="primary" plain @click="addAssignment">
          <el-icon>
            <Plus />
          </el-icon>
          {{ i18n('rule.btn.addAssignment') }}
        </el-button>
      </div>
      <el-table :data="formData.assignments" border style="width: 100%" :empty-text="i18n('rule.dialog.noAssignments')">
        <el-table-column :label="i18n('rule.lbl.index')" type="index" width="60" align="center" />
        <el-table-column :label="i18n('rule.lbl.variableName')" width="200">
          <template #default="{ row }">
            <el-select
              v-model="row.variableName"
              filterable
              allow-create
              default-first-option
              :placeholder="i18n('rule.ph.variableName')"
              style="width: 100%;z-index:999 !important;"
            >
              <el-option-group
                v-if="formFields.length"
                :label="i18n('rule.dialog.formFields')"
              >
                <el-option
                  v-for="f in formFields"
                  :key="f.fieldName"
                  :label="`${f.label || f.fieldName} (${f.fieldName})`"
                  :value="f.fieldName"
                />
              </el-option-group>
              <el-option-group
                v-if="variables && variables.length"
                :label="i18n('rule.var.sourceInput')"
              >
                <el-option
                  v-for="v in variables"
                  :key="v.field"
                  :label="`${v.label || v.field} (${v.field})`"
                  :value="v.field"
                />
              </el-option-group>
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.lbl.valueType')" width="130">
          <template #default="{ row }">
            <el-select v-model="row.valueType" style="width: 100%;z-index:999 !important;">
              <el-option :label="i18n('rule.dialog.constant')" value="CONSTANT" />
              <el-option :label="i18n('rule.dialog.variable')" value="VARIABLE" />
              <el-option :label="i18n('rule.dialog.expression')" value="EXPRESSION" />
            </el-select>
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.lbl.value')" min-width="240">
          <template #default="{ row }">
            <el-select
              v-if="row.valueType === 'VARIABLE'"
              v-model="row.value"
              filterable
              allow-create
              default-first-option
              :placeholder="i18n('rule.var.selectField')"
              style="width: 100%;z-index:999 !important;"
            >
              <el-option-group
                v-if="formFields.length"
                :label="i18n('rule.dialog.formFields')"
              >
                <el-option
                  v-for="f in formFields"
                  :key="f.fieldName"
                  :label="`${f.label || f.fieldName} (${f.fieldName})`"
                  :value="f.fieldName"
                />
              </el-option-group>
              <el-option
                v-for="v in variables"
                :key="v.field"
                :label="`${v.label || v.field} (${v.field})`"
                :value="v.field"
              />
            </el-select>
            <ExpressionEditor
              v-else-if="row.valueType === 'EXPRESSION'"
              v-model="row.value"
              :variables="variables"
              :rows="2"
              :placeholder="i18n('rule.ph.enterValue')"
            />
            <el-input v-else v-model="row.value" :placeholder="i18n('rule.ph.enterValue')" />
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.lbl.description')" min-width="140">
          <template #default="{ row }">
            <el-input v-model="row.description" :placeholder="i18n('rule.ph.descriptionOptional')" />
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.lbl.operation')" width="80" align="center">
          <template #default="{ $index }">
            <el-button type="danger" link @click="removeAssignment($index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch, inject, computed, type Ref } from "vue";
import type { FormInstance } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import { warning } from "star-horse-lowcode";
import { i18n } from '@/lang';
import ExpressionEditor from '../components/ExpressionEditor.vue';
import type { FormFieldMeta } from '../useFormRuleRuntime';

const props = defineProps<{
  visible: boolean
  assignments: any[]
  variables?: Array<{ field: string; label: string; type: string; source: string; defaultValue?: string; desc?: string }>
}>();

// 从 RuleDesigner 注入表单字段列表
const injectedFormFields = inject<Ref<FormFieldMeta[]> | FormFieldMeta[] | undefined>('ruleFormFields', undefined);
const formFields = computed<FormFieldMeta[]>(() => {
  if (!injectedFormFields) return [];
  const v = (injectedFormFields as any).value ?? injectedFormFields;
  return Array.isArray(v) ? v : [];
});

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", assignments: any[]): void
}>();

const formRef = ref<FormInstance>();
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const formData = reactive<{ assignments: any[] }>({
  assignments: []
});

watch(() => props.visible, (val) => {
  if (val) {
    if (props.assignments && props.assignments.length > 0) {
      formData.assignments = JSON.parse(JSON.stringify(props.assignments));
    } else {
      formData.assignments = [];
    }
  }
});

const addAssignment = () => {
  formData.assignments.push({
    variableName: "",
    valueType: "CONSTANT",
    value: "",
    description: ""
  });
};

const removeAssignment = (index: number) => {
  formData.assignments.splice(index, 1);
};

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (formData.assignments.length === 0) {
    warning(i18n('rule.dialog.addAtLeastOneAssignment'));
    return;
  }
  const invalid = formData.assignments.find((item: any) => !item.variableName || !item.variableName.trim());
  if (invalid) {
    warning(i18n('rule.dialog.variableNameCannotBeEmpty'));
    return;
  }
  const noValue = formData.assignments.find((item: any) => !item.value && item.value !== 0);
  if (noValue) {
    warning(i18n('rule.dialog.fillAllAssignmentValues'));
    return;
  }
  emit("save", JSON.parse(JSON.stringify(formData.assignments)));
};
</script>

<style scoped lang="scss">
.assign-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;

  .toolbar-title {
    font-size: 13px;
    font-weight: 600;
    color: #374151;
  }
}
</style>
