<template>
  <star-horse-dialog
    :dialogVisible="visible"
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
      <el-form-item :label="i18n('rule.lbl.ruleType')" prop="ruleType">
        <el-select v-model="formData.ruleType" style="width: 100%;z-index:999!important;">
          <el-option :label="i18n('rule.dialog.formLinkage')" value="FORM_LINKAGE" />
          <el-option :label="i18n('rule.dialog.dataValidation')" value="DATA_VALID" />
          <el-option :label="i18n('rule.dialog.businessRule')" value="BUSINESS" />
        </el-select>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.ruleCategory')">
        <el-input v-model="formData.ruleCategory" :placeholder="i18n('rule.ph.enterRuleCategory')" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.priority')">
        <el-input-number v-model="formData.priority" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.conditionLogic')">
        <el-radio-group v-model="formData.conditionLogic">
          <el-radio-button label="AND">{{ i18n('rule.dialog.andAll') }}</el-radio-button>
          <el-radio-button label="OR">{{ i18n('rule.dialog.orAny') }}</el-radio-button>
        </el-radio-group>
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

const props = defineProps<{
  visible: boolean
  ruleData: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', data: any): void
}>()

const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  idRuleDefinition: '',
  ruleCode: '',
  ruleName: '',
  ruleDesc: '',
  ruleType: 'FORM_LINKAGE',
  ruleCategory: '',
  priority: 0,
  enabled: 'Y',
  conditionLogic: 'AND',
  status: 'DRAFT',
  formId: ''
})

const formData = reactive(defaultFormData())

const rules = reactive<FormRules>({
  ruleCode: [{ required: true, message: i18n('rule.ph.enterRuleCode'), trigger: 'blur' }],
  ruleName: [{ required: true, message: i18n('rule.ph.enterRuleName'), trigger: 'blur' }],
  ruleType: [{ required: true, message: i18n('rule.ph.selectRuleType'), trigger: 'change' }]
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
