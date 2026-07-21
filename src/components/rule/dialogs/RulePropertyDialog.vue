<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.ruleProperty')"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="90px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.ruleCode')" prop="ruleCode">
        <el-input v-model="formData.ruleCode" :placeholder="i18n('rule.ph.enterRuleCode')" :disabled="!!formData.idRuleDefinition" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.ruleName')" prop="ruleName">
        <el-input v-model="formData.ruleName" :placeholder="i18n('rule.ph.enterRuleName')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.ruleCategory')">
        <el-select v-model="formData.ruleCategory" :placeholder="i18n('rule.ph.selectRuleCategory')" style="width: 100%;z-index:999!important;" clearable>
          <el-option v-for="cat in CATEGORY_OPTIONS" :key="cat.value" :label="i18n(cat.label)" :value="cat.value" />
        </el-select>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.priority')">
        <el-input-number v-model="formData.priority" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.enabledStatus')">
        <el-switch v-model="formData.enabled" active-value="Y" inactive-value="N" :active-text="i18n('rule.dialog.enabled')" :inactive-text="i18n('rule.dialog.disabled')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.relatedForm')">
        <el-input v-model="formData.formId" :placeholder="i18n('rule.ph.enterFormId')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.ruleDescription')">
        <el-input v-model="formData.ruleDesc" type="textarea" :rows="3" :placeholder="i18n('rule.ph.enterRuleDescription')" />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { i18n } from '@/lang'

// 规则分类选项（业务域分类，非自由文本）
const CATEGORY_OPTIONS = [
  {label: 'rule.category.formLinkage', value: 'FORM_LINKAGE'},
  {label: 'rule.category.dataValidation', value: 'DATA_VALIDATION'},
  {label: 'rule.category.processControl', value: 'PROCESS_CONTROL'},
  {label: 'rule.category.calcAssignment', value: 'CALC_ASSIGNMENT'},
  {label: 'rule.category.businessRule', value: 'BUSINESS_RULE'},
  {label: 'rule.category.notificationMsg', value: 'NOTIFICATION_MSG'},
  {label: 'rule.category.dataTransform', value: 'DATA_TRANSFORM'},
  {label: 'rule.category.other', value: 'OTHER'},
];

const props = defineProps<{
  visible: boolean
  ruleData: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
}>()
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  idRuleDefinition: '',
  ruleCode: '',
  ruleName: '',
  ruleDesc: '',
  ruleCategory: '',
  priority: 0,
  enabled: 'Y',
  status: 'DRAFT',
  formId: ''
})

const formData = reactive(defaultFormData())

const rules = reactive<FormRules>({
  ruleCode: [{ required: true, message: i18n('rule.ph.enterRuleCode'), trigger: 'blur' }],
  ruleName: [{ required: true, message: i18n('rule.ph.enterRuleName'), trigger: 'blur' }]
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.ruleData) {
      Object.assign(formData, { ...props.ruleData })
    } else {
      Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
  }
})

const handleClose = () => {
  emit('close')
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('save', { ...formData })
    }
  })
}
</script>
