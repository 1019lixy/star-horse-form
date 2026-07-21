<script setup lang="ts">
/**
 * 字段下拉选择器（企业级：表单字段 + 规则变量 双源）
 * 供规则设计器中的字段参数使用，支持从表单字段列表 + 规则变量库中选择
 * 替代手动输入 fieldPath，避免拼写错误
 */
import { computed } from 'vue'
import { i18n } from '@/lang'

export interface FieldOption {
  fieldName: string
  label: string
  itemType: string
  type: string
}

export interface VariableOption {
  field: string
  label: string
  type: string
  source: string
}

const props = defineProps<{
  /** 当前值（v-model） */
  modelValue: string
  /** 可选字段列表（表单字段） */
  fields: FieldOption[]
  /** 可选变量列表（规则变量库） */
  variables?: VariableOption[]
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 表单字段按组件类型分组
const fieldGroups = computed(() => {
  const groupMap = new Map<string, FieldOption[]>()

  // 基本分组定义
  const typeGroups: Record<string, string[]> = {
    [i18n('rule.fieldSelector.text')]: ['input', 'textarea', 'number'],
    [i18n('rule.fieldSelector.select')]: ['select', 'autocomplete', 'radio', 'checkbox', 'tselect', 'transfer', 'cascade'],
    [i18n('rule.fieldSelector.date')]: ['date', 'datetime', 'daterange', 'time'],
    [i18n('rule.fieldSelector.other')]: [],
  }

  for (const field of props.fields || []) {
    let grouped = false
    for (const [groupName, types] of Object.entries(typeGroups)) {
      if (groupName === i18n('rule.fieldSelector.other')) continue
      if (types.includes(field.itemType || field.type)) {
        if (!groupMap.has(groupName)) groupMap.set(groupName, [])
        groupMap.get(groupName)!.push(field)
        grouped = true
        break
      }
    }
    if (!grouped) {
      const otherGroup = i18n('rule.fieldSelector.other')
      if (!groupMap.has(otherGroup)) groupMap.set(otherGroup, [])
      groupMap.get(otherGroup)!.push(field)
    }
  }

  return Array.from(groupMap.entries())
    .filter(([_, fields]) => fields.length > 0)
    .map(([label, fields]) => ({ label, fields }))
})

// 规则变量按 source 分组（INPUT/CONTEXT/CONSTANT）
const variableGroups = computed(() => {
  const groupMap = new Map<string, VariableOption[]>()
  for (const v of props.variables || []) {
    if (!v || !v.field) continue
    const groupName = sourceLabel(v.source)
    if (!groupMap.has(groupName)) groupMap.set(groupName, [])
    groupMap.get(groupName)!.push(v)
  }
  return Array.from(groupMap.entries())
    .filter(([_, vars]) => vars.length > 0)
    .map(([label, vars]) => ({ label, vars }))
})

// 变量来源标签
const sourceLabel = (source: string): string => {
  switch (source) {
    case 'INPUT': return i18n('rule.fieldSelector.varInput') || '表单字段派生变量'
    case 'CONTEXT': return i18n('rule.fieldSelector.varContext') || '上下文变量'
    case 'CONSTANT': return i18n('rule.fieldSelector.varConstant') || '常量'
    default: return i18n('rule.fieldSelector.varOther') || '其他变量'
  }
}

// 变量类型标签颜色
const varTypeTagType = (type: string): string => {
  const map: Record<string, string> = {
    STRING: 'info',
    NUMBER: 'success',
    DATE: 'danger',
    BOOLEAN: 'warning',
    ARRAY: '',
  }
  return map[type] || 'info'
}

const currentValue = computed({
  get: () => props.modelValue,
  set: (val: string) => emit('update:modelValue', val),
})

// 字段类型标签颜色映射
const typeTagType = (itemType: string): string => {
  const map: Record<string, string> = {
    input: 'info',
    number: 'success',
    select: 'warning',
    date: 'danger',
    datetime: 'danger',
    checkbox: '',
  }
  return map[itemType] || 'info'
}
</script>

<template>
  <el-select
    v-model="currentValue"
    filterable
    clearable
    :placeholder="placeholder || i18n('rule.fieldSelector.placeholder')"
    :disabled="disabled"
    style="width: 100%"
  >
    <!-- 表单字段分组 -->
    <el-option-group
      v-for="group in fieldGroups"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="f in group.fields"
        :key="f.fieldName"
        :label="`${f.label} (${f.fieldName})`"
        :value="f.fieldName"
      >
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
          <span>{{ f.label }}</span>
          <el-tag size="small" :type="typeTagType(f.itemType || f.type)" style="margin-left: 8px">
            {{ f.itemType || f.type }}
          </el-tag>
        </div>
      </el-option>
    </el-option-group>
    <!-- 规则变量分组 -->
    <el-option-group
      v-for="group in variableGroups"
      :key="group.label"
      :label="group.label"
    >
      <el-option
        v-for="v in group.vars"
        :key="v.field"
        :label="`${v.label || v.field} (${v.field})`"
        :value="v.field"
      >
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%">
          <span>{{ v.label || v.field }}</span>
          <el-tag size="small" :type="varTypeTagType(v.type)" style="margin-left: 8px">
            {{ v.type }}
          </el-tag>
        </div>
      </el-option>
    </el-option-group>
  </el-select>
</template>
