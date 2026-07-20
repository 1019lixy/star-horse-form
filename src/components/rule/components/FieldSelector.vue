<script setup lang="ts">
/**
 * 表单字段下拉选择器
 * 供规则设计器中的字段参数使用，支持从表单字段列表中选择字段
 * 替代手动输入 fieldPath，避免拼写错误
 */
import { computed, ref } from 'vue'
import { i18n } from '@/lang'

export interface FieldOption {
  fieldName: string
  label: string
  itemType: string
  type: string
}

const props = defineProps<{
  /** 当前值（v-model） */
  modelValue: string
  /** 可选字段列表 */
  fields: FieldOption[]
  /** 占位符 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// 按组件类型分组
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
  </el-select>
</template>
