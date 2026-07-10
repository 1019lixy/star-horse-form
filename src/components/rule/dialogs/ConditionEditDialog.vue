<template>
  <star-horse-dialog
    :dialogVisible="visible"
    :title="condition ? '编辑条件' : '添加条件'"
    boxWidth="580px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="90px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="字段名" prop="fieldName">
        <el-input v-model="formData.fieldName" placeholder="如：amount、status、userType" />
      </el-form-item>
      <el-form-item label="字段标签">
        <el-input v-model="formData.fieldLabel" placeholder="字段显示标签（可选）" />
      </el-form-item>
      <el-form-item label="字段类型" prop="fieldType">
        <el-select v-model="formData.fieldType" style="width: 100%" @change="handleFieldTypeChange">
          <el-option label="字符串 (String)" value="STRING" />
          <el-option label="数字 (Number)" value="NUMBER" />
          <el-option label="日期 (Date)" value="DATE" />
          <el-option label="布尔 (Boolean)" value="BOOLEAN" />
          <el-option label="数组 (Array)" value="ARRAY" />
        </el-select>
      </el-form-item>
      <el-form-item label="操作符" prop="operator">
        <el-select v-model="formData.operator" style="width: 100%" @change="handleOperatorChange">
          <el-option-group v-for="group in operatorGroups" :key="group.label" :label="group.label">
            <el-option v-for="op in group.options" :key="op.value" :label="op.label" :value="op.value" />
          </el-option-group>
        </el-select>
      </el-form-item>
      <el-form-item label="值类型" v-if="needsValue">
        <el-radio-group v-model="formData.valueType">
          <el-radio-button value="CONSTANT">常量</el-radio-button>
          <el-radio-button value="VARIABLE">变量</el-radio-button>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="条件值" v-if="needsValue" prop="value">
        <!-- 日期选择器 -->
        <el-date-picker
          v-if="formData.fieldType === 'DATE' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          type="datetime"
          placeholder="选择日期时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
        <!-- 布尔选择 -->
        <el-select
          v-else-if="formData.fieldType === 'BOOLEAN' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          style="width: 100%"
        >
          <el-option label="是 (true)" value="true" />
          <el-option label="否 (false)" value="false" />
        </el-select>
        <!-- 数组输入 -->
        <el-input
          v-else-if="formData.fieldType === 'ARRAY' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          placeholder='多个值用逗号分隔，如：value1,value2'
        />
        <!-- 数字输入 -->
        <el-input-number
          v-else-if="formData.fieldType === 'NUMBER' && formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          :controls="false"
          placeholder="请输入数字"
          style="width: 100%"
        />
        <!-- 字符串输入 -->
        <el-input
          v-else-if="formData.valueType === 'CONSTANT'"
          v-model="formData.value"
          placeholder="请输入条件值"
        />
        <!-- 变量模式 -->
        <el-input
          v-else
          v-model="formData.value"
          placeholder="请输入变量字段名（如：formData.amount）"
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
  condition: any
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', condition: any): void
}>()

const formRef = ref<FormInstance>()

const defaultFormData = () => ({
  fieldName: '',
  fieldLabel: '',
  fieldType: 'STRING',
  operator: 'EQ',
  valueType: 'CONSTANT',
  value: '',
  logicOperator: 'AND'
})

const formData = reactive(defaultFormData())

const rules = reactive<FormRules>({
  fieldName: [{ required: true, message: '请输入字段名', trigger: 'blur' }],
  fieldType: [{ required: true, message: '请选择字段类型', trigger: 'change' }],
  operator: [{ required: true, message: '请选择操作符', trigger: 'change' }]
})

// 操作符分组（值与RuleExecutor一致）
const operatorGroups = computed(() => {
  const base = [
    { label: '等于 (=)', value: 'EQ' },
    { label: '不等于 (≠)', value: 'NE' }
  ]
  const numeric = [
    { label: '大于 (>)', value: 'GT' },
    { label: '大于等于 (≥)', value: 'GTE' },
    { label: '小于 (<)', value: 'LT' },
    { label: '小于等于 (≤)', value: 'LTE' }
  ]
  const string = [
    { label: '包含', value: 'CONTAINS' },
    { label: '不包含', value: 'NOT_CONTAINS' },
    { label: '以...开头', value: 'STARTS_WITH' },
    { label: '以...结尾', value: 'ENDS_WITH' }
  ]
  const collection = [
    { label: '在列表中 (∈)', value: 'IN' },
    { label: '不在列表中 (∉)', value: 'NOT_IN' }
  ]
  const nullCheck = [
    { label: '为空', value: 'IS_NULL' },
    { label: '不为空', value: 'NOT_NULL' }
  ]

  const groups: { label: string; options: any[] }[] = [
    { label: '基本比较', options: base }
  ]
  if (formData.fieldType === 'NUMBER' || formData.fieldType === 'DATE') {
    groups.push({ label: '数值比较', options: numeric })
  }
  if (formData.fieldType === 'STRING') {
    groups.push({ label: '字符串操作', options: string })
  }
  if (formData.fieldType === 'ARRAY' || formData.fieldType === 'STRING') {
    groups.push({ label: '集合操作', options: collection })
  }
  groups.push({ label: '空值检查', options: nullCheck })
  return groups
})

const needsValue = computed(() => {
  return !['IS_NULL', 'NOT_NULL'].includes(formData.operator)
})

watch(() => props.visible, (val) => {
  if (val) {
    if (props.condition) {
      Object.assign(formData, defaultFormData(), props.condition)
    } else {
      Object.assign(formData, defaultFormData())
    }
    formRef.value?.clearValidate()
  }
})

const handleFieldTypeChange = () => {
  // 字段类型变化时，重置不适用的操作符
  const validOps = operatorGroups.value.flatMap(g => g.options.map(o => o.value))
  if (!validOps.includes(formData.operator)) {
    formData.operator = 'EQ'
  }
  formData.value = ''
}

const handleOperatorChange = () => {
  if (!needsValue.value) {
    formData.value = ''
    formData.valueType = 'CONSTANT'
  }
}

const handleClose = () => emit('close')

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      const data = { ...formData }
      // 数字类型转换值
      if (data.fieldType === 'NUMBER' && data.valueType === 'CONSTANT' && data.value !== '') {
        data.value = String(data.value)
      }
      emit('save', data)
    }
  })
}
</script>
