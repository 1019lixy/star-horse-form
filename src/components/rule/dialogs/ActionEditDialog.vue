<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="action ? i18n('rule.dialog.editAction') : i18n('rule.dialog.addAction')"
    boxWidth="600px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.actionType')" prop="actionType">
        <el-select v-model="formData.actionType" style="width: 100%;z-index:999 !important;" @change="handleActionTypeChange">
          <el-option-group v-for="group in actionGroups" :key="group.label" :label="group.label">
            <el-option v-for="act in group.options" :key="act.value" :label="act.label" :value="act.value" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.targetField')" v-if="needsTargetField" prop="targetField">
        <el-input v-model="formData.targetField" :placeholder="i18n('rule.ph.targetFieldExample')" />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.valueType')" v-if="needsValue">
        <el-radio-group v-model="formData.actionValueType">
          <el-radio-button value="CONSTANT">{{ i18n('rule.dialog.constant') }}</el-radio-button>
          <el-radio-button value="VARIABLE">{{ i18n('rule.dialog.variable') }}</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.actionValue')" v-if="needsValue" prop="actionValue">
        <el-input
          v-if="formData.actionValueType === 'CONSTANT'"
          v-model="formData.actionValue"
          :placeholder="i18n('rule.ph.enterValue')"
        />
        <el-input
          v-else
          v-model="formData.actionValue"
          :placeholder="i18n('rule.ph.variableFieldNameExample')"
        />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.messageContent')" v-if="formData.actionType === 'SHOW_MESSAGE'">
        <el-input v-model="formData.message" type="textarea" :rows="2" :placeholder="i18n('rule.ph.enterMessageContent')" />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.messageType')" v-if="formData.actionType === 'SHOW_MESSAGE'">
        <el-select v-model="formData.messageType" style="width: 100%;z-index:999 !important;">
          <el-option :label="i18n('rule.dialog.info')" value="INFO" />
          <el-option :label="i18n('rule.dialog.success')" value="SUCCESS" />
          <el-option :label="i18n('rule.dialog.warning')" value="WARNING" />
          <el-option :label="i18n('rule.dialog.error')" value="ERROR" />
        </el-select>
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.redirectUrl')" v-if="formData.actionType === 'REDIRECT'">
        <el-input v-model="formData.actionValue" :placeholder="i18n('rule.ph.redirectUrlExample')" />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.description')">
        <el-input v-model="formData.description" :placeholder="i18n('rule.ph.actionDescriptionOptional')" />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.stopOnError')">
        <el-switch
          v-model="formData.stopOnError"
          active-value="Y"
          inactive-value="N"
          :active-text="i18n('rule.dialog.yes')"
          :inactive-text="i18n('rule.dialog.no')"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { i18n } from '@/lang'

const props = defineProps<{
  visible: boolean
  action: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', action: any): void
}>()

const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  actionType: 'SET_VALUE',
  targetField: '',
  actionValueType: 'CONSTANT',
  actionValue: '',
  message: '',
  messageType: 'INFO',
  description: '',
  stopOnError: 'N'
})

const formData = reactive(defaultFormData())

const rules = reactive<FormRules>({
  actionType: [{ required: true, message: i18n('rule.ph.selectActionType'), trigger: 'change' }],
  targetField: [{ required: true, message: i18n('rule.ph.enterTargetField'), trigger: 'blur' }],
  actionValue: [{ required: true, message: i18n('rule.ph.enterValue'), trigger: 'blur' }]
})

// 动作类型分组（值与RuleExecutor一致）
const actionGroups = computed(() => [
  {
    label: i18n('rule.dialog.fieldVisibility'),
    options: [
      { label: i18n('rule.dialog.showField'), value: 'SHOW_FIELD' },
      { label: i18n('rule.dialog.hideField'), value: 'HIDE_FIELD' }
    ]
  },
  {
    label: i18n('rule.dialog.fieldStatus'),
    options: [
      { label: i18n('rule.dialog.setRequired'), value: 'SET_REQUIRED' },
      { label: i18n('rule.dialog.setOptional'), value: 'SET_OPTIONAL' },
      { label: i18n('rule.dialog.setReadonly'), value: 'SET_READONLY' },
      { label: i18n('rule.dialog.setEditable'), value: 'SET_EDITABLE' },
      { label: i18n('rule.dialog.setDisabled'), value: 'SET_DISABLED' },
      { label: i18n('rule.dialog.setEnabled'), value: 'SET_ENABLED' }
    ]
  },
  {
    label: i18n('rule.dialog.dataOperations'),
    options: [
      { label: i18n('rule.dialog.setFieldValue'), value: 'SET_VALUE' },
      { label: i18n('rule.dialog.clearFieldValue'), value: 'CLEAR_VALUE' }
    ]
  },
  {
    label: i18n('rule.dialog.messagePrompt'),
    options: [
      { label: i18n('rule.dialog.showMessage'), value: 'SHOW_MESSAGE' }
    ]
  },
  {
    label: i18n('rule.dialog.pageOperations'),
    options: [
      { label: i18n('rule.dialog.pageRedirect'), value: 'REDIRECT' }
    ]
  }
])

const needsTargetField = computed(() => {
  return ['SHOW_FIELD', 'HIDE_FIELD', 'SET_REQUIRED', 'SET_OPTIONAL', 'SET_READONLY', 'SET_EDITABLE', 'SET_DISABLED', 'SET_ENABLED', 'SET_VALUE', 'CLEAR_VALUE'].includes(formData.actionType)
})

const needsValue = computed(() => {
  return ['SET_VALUE'].includes(formData.actionType)
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.action) {
      Object.assign(formData, defaultFormData(), props.action)
    } else {
      Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
  }
})

const handleActionTypeChange = () => {
  if (!needsValue.value) {
    formData.actionValue = ''
    formData.actionValueType = 'CONSTANT'
  }
  if (!needsTargetField.value) {
    formData.targetField = ''
  }
  if (formData.actionType === 'SHOW_MESSAGE' && !formData.message) {
    formData.messageType = 'INFO'
  }
}

const handleClose = () => emit('close')

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      emit('save', { ...formData })
    }
  })
}
</script>
