<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="规则属性"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="90px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="规则编码" prop="ruleCode">
        <el-input v-model="formData.ruleCode" placeholder="请输入规则编码" :disabled="!!formData.idRuleDefinition" />
      </el-form-item>
      <el-form-item label="规则名称" prop="ruleName">
        <el-input v-model="formData.ruleName" placeholder="请输入规则名称" />
      </el-form-item>
      <el-form-item label="规则类型" prop="ruleType">
        <el-select v-model="formData.ruleType" style="width: 100%">
          <el-option label="表单联动" value="FORM_LINKAGE" />
          <el-option label="数据校验" value="DATA_VALID" />
          <el-option label="业务规则" value="BUSINESS" />
        </el-select>
      </el-form-item>
      <el-form-item label="规则分类">
        <el-input v-model="formData.ruleCategory" placeholder="请输入规则分类" />
      </el-form-item>
      <el-form-item label="优先级">
        <el-input-number v-model="formData.priority" :min="0" :max="999" style="width: 100%" />
      </el-form-item>
      <el-form-item label="条件逻辑">
        <el-radio-group v-model="formData.conditionLogic">
          <el-radio-button label="AND">AND (全部满足)</el-radio-button>
          <el-radio-button label="OR">OR (任一满足)</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="启用状态">
        <el-switch v-model="formData.enabled" active-value="Y" inactive-value="N" active-text="启用" inactive-text="禁用" />
      </el-form-item>
      <el-form-item label="关联表单">
        <el-input v-model="formData.formId" placeholder="请输入表单ID" />
      </el-form-item>
      <el-form-item label="规则描述">
        <el-input v-model="formData.ruleDesc" type="textarea" :rows="3" placeholder="请输入规则描述" />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

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
  ruleCode: [{ required: true, message: '请输入规则编码', trigger: 'blur' }],
  ruleName: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  ruleType: [{ required: true, message: '请选择规则类型', trigger: 'change' }]
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
