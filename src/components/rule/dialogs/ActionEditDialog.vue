<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="action ? '编辑动作' : '添加动作'"
    boxWidth="600px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="动作类型" prop="actionType">
        <el-select v-model="formData.actionType" style="width: 100%" @change="handleActionTypeChange">
          <el-option-group v-for="group in actionGroups" :key="group.label" :label="group.label">
            <el-option v-for="act in group.options" :key="act.value" :label="act.label" :value="act.value" />
          </el-option-group>
        </el-select>
      </el-form-item>

      <el-form-item label="目标字段" v-if="needsTargetField" prop="targetField">
        <el-input v-model="formData.targetField" placeholder="如：amount、approvalSection、submitBtn" />
      </el-form-item>

      <el-form-item label="值类型" v-if="needsValue">
        <el-radio-group v-model="formData.actionValueType">
          <el-radio-button value="CONSTANT">常量</el-radio-button>
          <el-radio-button value="VARIABLE">变量</el-radio-button>
        </el-radio-group>
      </el-form-item>

      <el-form-item label="动作值" v-if="needsValue" prop="actionValue">
        <el-input
          v-if="formData.actionValueType === 'CONSTANT'"
          v-model="formData.actionValue"
          placeholder="请输入值"
        />
        <el-input
          v-else
          v-model="formData.actionValue"
          placeholder="变量字段名（如：formData.defaultAmount）"
        />
      </el-form-item>

      <el-form-item label="消息内容" v-if="formData.actionType === 'SHOW_MESSAGE'">
        <el-input v-model="formData.message" type="textarea" :rows="2" placeholder="请输入提示消息内容" />
      </el-form-item>

      <el-form-item label="消息类型" v-if="formData.actionType === 'SHOW_MESSAGE'">
        <el-select v-model="formData.messageType" style="width: 100%">
          <el-option label="信息 (Info)" value="INFO" />
          <el-option label="成功 (Success)" value="SUCCESS" />
          <el-option label="警告 (Warning)" value="WARNING" />
          <el-option label="错误 (Error)" value="ERROR" />
        </el-select>
      </el-form-item>

      <el-form-item label="跳转地址" v-if="formData.actionType === 'REDIRECT'">
        <el-input v-model="formData.actionValue" placeholder="/page/url 或 https://..." />
      </el-form-item>

      <el-form-item label="描述说明">
        <el-input v-model="formData.description" placeholder="动作说明（可选）" />
      </el-form-item>

      <el-form-item label="出错停止">
        <el-switch
          v-model="formData.stopOnError"
          active-value="Y"
          inactive-value="N"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

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
  actionType: [{ required: true, message: '请选择动作类型', trigger: 'change' }],
  targetField: [{ required: true, message: '请输入目标字段', trigger: 'blur' }],
  actionValue: [{ required: true, message: '请输入值', trigger: 'blur' }]
})

// 动作类型分组（值与RuleExecutor一致）
const actionGroups = computed(() => [
  {
    label: '字段显隐',
    options: [
      { label: '显示字段', value: 'SHOW_FIELD' },
      { label: '隐藏字段', value: 'HIDE_FIELD' }
    ]
  },
  {
    label: '字段状态',
    options: [
      { label: '设为必填', value: 'SET_REQUIRED' },
      { label: '取消必填', value: 'SET_OPTIONAL' },
      { label: '设为只读', value: 'SET_READONLY' },
      { label: '设为可编辑', value: 'SET_EDITABLE' },
      { label: '禁用字段', value: 'SET_DISABLED' },
      { label: '启用字段', value: 'SET_ENABLED' }
    ]
  },
  {
    label: '数据操作',
    options: [
      { label: '设置字段值', value: 'SET_VALUE' },
      { label: '清空字段值', value: 'CLEAR_VALUE' }
    ]
  },
  {
    label: '消息提示',
    options: [
      { label: '显示消息', value: 'SHOW_MESSAGE' }
    ]
  },
  {
    label: '页面操作',
    options: [
      { label: '页面跳转', value: 'REDIRECT' }
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
