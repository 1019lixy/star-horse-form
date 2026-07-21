<template>
  <div class="property-panel">
    <div class="panel-header">
      <el-icon><Setting /></el-icon>
      <span>{{ i18n('rule.panel.propertyConfig') }}</span>
    </div>
    <div v-if="!selectedNode" class="empty-state">
      <el-icon :size="32"><Pointer /></el-icon>
      <p>{{ i18n('rule.panel.selectNodeHint') }}</p>
    </div>
    <div v-else class="panel-body">
      <!-- 节点信息 -->
      <div class="prop-section node-info-section">
        <div class="node-type-badge" :style="{ background: categoryColor + '15', borderColor: categoryColor, color: categoryColor }">
          <span class="badge-icon">{{ nodeDef?.icon || '⬡' }}</span>
          <span class="badge-label">{{ nodeDef?.label ? i18n(nodeDef.label) : selectedNode.type }}</span>
        </div>
        <p class="node-desc">{{ nodeDef?.desc ? i18n(nodeDef.desc) : '' }}</p>
      </div>

      <!-- 通用：基本信息 -->
      <div class="prop-section">
        <div class="section-title">{{ i18n('rule.panel.basicInfo') }}</div>
        <el-form label-width="70px" labelPosition="top">
          <el-form-item :label="i18n('rule.panel.nodeId')">
            <el-input :model-value="selectedNode.id" disabled  />
          </el-form-item>
          <el-form-item :label="i18n('rule.panel.nodeType')">
            <el-tag  :style="{ background: categoryColor + '15', borderColor: categoryColor, color: categoryColor }">{{ nodeDef?.label ? i18n(nodeDef.label) : selectedNode.type }}</el-tag>
          </el-form-item>
        </el-form>
      </div>

      <!-- 条件节点（基础类型） -->
      <div v-if="selectedNode.type === 'condition'" class="prop-section">
        <div class="section-title">
          <span>{{ i18n('rule.panel.conditionList') }}</span>
          <el-button type="primary" link  @click="emit('editCondition', selectedNode.id, -1)"><el-icon><Plus /></el-icon> {{ i18n('rule.add') }}</el-button>
        </div>
        <div class="logic-toggle">
          <span>{{ i18n('rule.panel.logic') }}：</span>
          <el-radio-group :model-value="selectedNode.data.logic" @change="updateField('logic', $event)" >
            <el-radio-button value="AND">{{ i18n('rule.option.and') }}</el-radio-button>
            <el-radio-button value="OR">{{ i18n('rule.option.or') }}</el-radio-button>
          </el-radio-group>
        </div>
        <div v-if="!conditions.length" class="empty-tip">{{ i18n('rule.panel.noCondition') }}</div>
        <div v-for="(cond, idx) in conditions" :key="idx" class="list-item">
          <div class="item-info">
            <span class="item-field">{{ cond.fieldName }}</span>
            <span class="item-op">{{ getOpSymbol(cond.operator) }}</span>
            <span class="item-val">{{ cond.value || i18n('rule.panel.emptyValue') }}</span>
          </div>
          <div class="item-actions">
            <el-button link  @click="emit('editCondition', selectedNode.id, idx)"><el-icon><Edit /></el-icon></el-button>
            <el-button link  type="danger" @click="deleteCondition(idx)"><el-icon><Delete /></el-icon></el-button>
          </div>
        </div>
      </div>

      <!-- 动作节点（基础类型） -->
      <div v-if="selectedNode.type === 'action'" class="prop-section">
        <div class="section-title">
          <span>{{ i18n('rule.panel.actionList') }}</span>
          <el-button type="primary" link  @click="emit('editAction', selectedNode.id, -1)"><el-icon><Plus /></el-icon> {{ i18n('rule.add') }}</el-button>
        </div>
        <div v-if="!actions.length" class="empty-tip">{{ i18n('rule.panel.noAction') }}</div>
        <div v-for="(act, idx) in actions" :key="idx" class="list-item">
          <div class="item-info">
            <el-tag  type="success" effect="plain">{{ getActionLabel(act.actionType) }}</el-tag>
            <span class="item-field">{{ act.targetField || '-' }}</span>
          </div>
          <div class="item-actions">
            <el-button link  @click="emit('editAction', selectedNode.id, idx)"><el-icon><Edit /></el-icon></el-button>
            <el-button link  type="danger" @click="deleteAction(idx)"><el-icon><Delete /></el-icon></el-button>
          </div>
        </div>
      </div>

      <!-- 变量赋值（基础类型） -->
      <div v-if="selectedNode.type === 'variable-assign'" class="prop-section">
        <div class="section-title">
          <span>{{ i18n('rule.panel.assignList') }}</span>
          <el-button type="primary" link  @click="emit('editCondition', selectedNode.id, -1)"><el-icon><Plus /></el-icon> {{ i18n('rule.add') }}</el-button>
        </div>
        <div v-if="!assignments.length" class="empty-tip">{{ i18n('rule.panel.noAssign') }}</div>
        <div v-for="(assign, idx) in assignments" :key="idx" class="list-item">
          <div class="item-info">
            <span class="item-field">{{ assign.variableName }}</span>
            <span class="item-op">=</span>
            <span class="item-val">{{ assign.value || i18n('rule.panel.empty') }}</span>
          </div>
          <div class="item-actions">
            <el-button link  type="danger" @click="deleteAssignment(idx)"><el-icon><Delete /></el-icon></el-button>
          </div>
        </div>
      </div>

      <!-- 网关节点（基础类型） -->
      <div v-if="isGateway" class="prop-section">
        <div class="section-title">{{ i18n('rule.panel.gatewayConfig') }}</div>
        <el-form label-width="70px" labelPosition="top">
          <el-form-item :label="i18n('rule.panel.name')">
            <el-input v-model="selectedNode.data.name" @input="updateField('name', selectedNode.data.name)" />
          </el-form-item>
          <el-form-item :label="i18n('rule.panel.branchCount')">
            <span>{{ branches.length }} {{ i18n('rule.panel.branchUnit') }}</span>
          </el-form-item>
        </el-form>
        <el-button type="primary"  @click="emit('editGateway', selectedNode.id)" style="width: 100%">
          <el-icon><Setting /></el-icon> {{ i18n('rule.panel.configBranch') }}
        </el-button>
      </div>

      <!-- 开始/结束节点 -->
      <div v-if="selectedNode.type === 'start' || selectedNode.type === 'end'" class="prop-section">
        <div class="section-title">{{ i18n('rule.panel.description') }}</div>
        <p class="node-desc">{{ selectedNode.type === 'start' ? i18n('rule.panel.startNodeDesc') : i18n('rule.panel.endNodeDesc') }}</p>
      </div>

      <!-- 通用企业级节点（generic类型）：基于paramSchema动态渲染 -->
      <template v-if="isGenericNode && paramSchema.length > 0">
        <!-- 复杂节点：详细配置入口（弹窗编辑，避免面板过长） -->
        <div v-if="hasDialogEditor" class="prop-section dialog-entry-section">
          <el-button type="primary" @click="openDialogEditor" class="open-dialog-btn">
            <el-icon><EditPen /></el-icon>
            <span>{{ i18n('rule.btn.openDialogConfig') }}</span>
          </el-button>
          <p class="dialog-tip">{{ dialogEditorHint }}</p>
        </div>
        <div v-for="group in groupedSchema" :key="group.name" class="prop-section">
          <div class="section-title">{{ i18n(group.name) }}</div>
          <el-form label-width="90px" labelPosition="top">
            <el-form-item
              v-for="field in group.fields"
              :key="field.name"
              :label="i18n(field.label)"
              :required="field.required"
            >
              <!-- input -->
              <el-input
                v-if="field.type === 'input' && !field.fieldSelect"
                v-model="selectedNode.data[field.name]"
                :placeholder="field.placeholder ? i18n(field.placeholder) : ''"
                @input="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- 字段选择器（fieldSelect: true 且有表单字段上下文） -->
              <FieldSelector
                v-else-if="field.type === 'input' && field.fieldSelect && formFields.length > 0"
                :model-value="selectedNode.data[field.name] || ''"
                :fields="formFields"
                :variables="variables"
                :placeholder="field.placeholder ? i18n(field.placeholder) : ''"
                @update:model-value="onFieldSelectChange(field.name, $event)"
              />
              <!-- 无表单字段上下文时降级为普通输入（仍允许手动输入变量名） -->
              <el-input
                v-else-if="field.type === 'input' && field.fieldSelect"
                v-model="selectedNode.data[field.name]"
                :placeholder="field.placeholder ? i18n(field.placeholder) : ''"
                @input="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- number -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="selectedNode.data[field.name]"
                :min="field.min"
                :max="field.max"
                :step="field.step || 1"
                :controls="false"
                style="width: 100%"
                @change="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- select -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="selectedNode.data[field.name]"
                style="width: 100%"
                @change="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              >
                <el-option v-for="opt in field.options" :key="opt.value" :label="typeof opt.label === 'function' ? opt.label() : i18n(opt.label)" :value="opt.value" />
              </el-select>
              <!-- multiselect -->
              <el-select
                v-else-if="field.type === 'multiselect'"
                v-model="selectedNode.data[field.name]"
                multiple
                style="width: 100%;z-index:999 !important;"
                @change="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              >
                <el-option v-for="opt in field.options" :key="opt.value" :label="typeof opt.label === 'function' ? opt.label() : i18n(opt.label)" :value="opt.value" />
              </el-select>
              <!-- textarea -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="selectedNode.data[field.name]"
                type="textarea"
                :rows="field.rows || 2"
                :placeholder="field.placeholder ? i18n(field.placeholder) : ''"
                @input="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- date -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="selectedNode.data[field.name]"
                type="datetime"
                :placeholder="field.placeholder ? i18n(field.placeholder) : i18n('rule.panel.selectDate')"
                value-format="YYYY-MM-DD HH:mm:ss"
                style="width: 100%"
                @change="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- switch -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="selectedNode.data[field.name]"
                active-value="Y"
                inactive-value="N"
                @change="emit('update', selectedNode.id, { [field.name]: selectedNode.data[field.name] })"
              />
              <!-- table（卡片式垂直堆叠，避免横向挤压） -->
              <div v-else-if="field.type === 'table'" class="schema-table">
                <div v-if="!getTableData(field.name).length" class="table-empty-tip">
                  {{ i18n('rule.panel.noData') }}
                </div>
                <div
                  v-for="(row, rowIdx) in getTableData(field.name)"
                  :key="rowIdx"
                  class="table-row-card"
                >
                  <div class="row-card-head">
                    <span class="row-card-idx">#{{ rowIdx + 1 }}</span>
                    <el-button link type="danger" :title="i18n('rule.delete')" @click="removeTableRow(field.name, rowIdx)">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                  <div class="row-card-body">
        <div v-for="col in field.columns" :key="col.prop" class="row-cell" v-show="isColumnVisible(col, row)">
          <label class="cell-label">{{ i18n(col.label) }}</label>
          <el-select
            v-if="col.type === 'select'"
            v-model="row[col.prop]"
            size="small"
            style="width: 100%"
            @change="emit('update', selectedNode.id, { [field.name]: getTableData(field.name) })"
          >
            <el-option v-for="opt in col.options" :key="opt.value" :label="typeof opt.label === 'function' ? opt.label() : i18n(opt.label)" :value="opt.value" />
          </el-select>
          <FieldSelector
            v-else-if="col.fieldSelect && formFields.length > 0"
            :model-value="row[col.prop] || ''"
            :fields="formFields"
            :variables="variables"
            @update:model-value="row[col.prop] = $event; emit('update', selectedNode.id, { [field.name]: getTableData(field.name) })"
          />
          <el-input
            v-else
            v-model="row[col.prop]"
            size="small"
            :placeholder="i18n(col.label)"
            @input="emit('update', selectedNode.id, { [field.name]: getTableData(field.name) })"
          />
        </div>
      </div>
                </div>
                <el-button
                  type="primary"
                  plain
                  size="small"
                  @click="addTableRow(field.name, field.columns)"
                  class="table-add-btn"
                >
                  <el-icon><Plus /></el-icon>
                  <span>{{ i18n('rule.addLine') }}</span>
                </el-button>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import { Setting, Pointer, Plus, Edit, EditPen, Delete } from '@element-plus/icons-vue'
import { NODE_TYPE_MAP, getParamSchema, getCategoryColor, type ParamField } from './nodeTypes'
import { i18n } from '@/lang'
import FieldSelector from './components/FieldSelector.vue'
import type { FormFieldMeta } from './useFormRuleRuntime'

const props = defineProps<{
  selectedNode: any
}>()

const emit = defineEmits<{
  (e: 'update', nodeId: string, data: any): void
  (e: 'editCondition', nodeId: string, index: number): void
  (e: 'editAction', nodeId: string, index: number): void
  (e: 'editGateway', nodeId: string): void
  (e: 'editScript', nodeId: string): void
  (e: 'editHttp', nodeId: string): void
}>()

// 从 RuleDesigner 注入表单字段列表（provide 时的 key: ruleFormFields）
// 若未注入（独立使用 RuleDesigner 时），降级为空数组，FieldSelector 不渲染
const injectedFormFields = inject<Ref<FormFieldMeta[]> | FormFieldMeta[] | undefined>('ruleFormFields', undefined)
const formFields = computed<FormFieldMeta[]>(() => {
  if (!injectedFormFields) {
    console.log('[PropertyPanel] formFields computed | injected=NONE (未注入 ruleFormFields)')
    return []
  }
  const v = (injectedFormFields as any).value ?? injectedFormFields
  const arr = Array.isArray(v) ? v : []
  console.log('[PropertyPanel] formFields computed | injected.type=', typeof injectedFormFields, '| value.length=', arr.length, '| firstField=', arr[0]?.fieldName)
  return arr
})

// 注入规则变量列表（ruleData.variables），用于：
// 1. FieldSelector 同时显示表单字段 + 规则变量两组
// 2. 校验时合并 form fields + variables 作为合法引用集合
const injectedVariables = inject<Ref<any[]> | any[] | undefined>('ruleVariables', undefined)
const variables = computed<any[]>(() => {
  if (!injectedVariables) return []
  const v = (injectedVariables as any).value ?? injectedVariables
  return Array.isArray(v) ? v : []
})

/**
 * 判断表格列在当前行是否应该显示
 * - hideOnActionTypes：行数据的 actionType 命中时隐藏
 * - showOnActionTypes：行数据的 actionType 不命中时隐藏（白名单）
 */
const isColumnVisible = (col: any, row: any): boolean => {
  const actionType = row?.actionType
  if (!actionType) return true
  if (Array.isArray(col.hideOnActionTypes) && col.hideOnActionTypes.includes(actionType)) {
    return false
  }
  if (Array.isArray(col.showOnActionTypes) && col.showOnActionTypes.length > 0 && !col.showOnActionTypes.includes(actionType)) {
    return false
  }
  return true
}

/**
 * FieldSelector 值变更处理：写入 selectedNode.data 并触发 update 事件
 */
const onFieldSelectChange = (fieldName: string, value: string) => {
  if (!props.selectedNode) return
  props.selectedNode.data[fieldName] = value
  emit('update', props.selectedNode.id, { [fieldName]: value })
}

const conditions = computed(() => props.selectedNode?.data?.conditions || [])
const actions = computed(() => props.selectedNode?.data?.actions || [])
const branches = computed(() => props.selectedNode?.data?.branches || [])
const assignments = computed(() => props.selectedNode?.data?.assignments || [])

const isGateway = computed(() => {
  const t = props.selectedNode?.type
  return t === 'exclusive-gateway' || t === 'parallel-gateway' || t === 'inclusive-gateway'
})

const isGenericNode = computed(() => props.selectedNode?.type === 'generic')

// 支持"详细配置"弹窗的节点类型：参数较多，面板编辑不便
const DIALOG_EDITABLE_NODES: Record<string, { hintKey: string; evt: string }> = {
  'http-call': { hintKey: 'rule.hint.httpCallDialog', evt: 'editHttp' },
  'datasource-fetch': { hintKey: 'rule.hint.datasourceDialog', evt: 'editHttp' },
  'action-set-options': { hintKey: 'rule.hint.setOptionsDialog', evt: 'editHttp' },
}
const hasDialogEditor = computed(() => {
  if (!isGenericNode.value) return false
  return !!DIALOG_EDITABLE_NODES[actualType.value]
})
const dialogEditorHint = computed(() => {
  const cfg = DIALOG_EDITABLE_NODES[actualType.value]
  return cfg ? i18n(cfg.hintKey) : ''
})
const openDialogEditor = () => {
  if (!props.selectedNode) return
  const cfg = DIALOG_EDITABLE_NODES[actualType.value]
  if (!cfg) return
  emit(cfg.evt as any, props.selectedNode.id)
}

const actualType = computed(() => props.selectedNode?.data?.__nodeType || '')
const nodeDef = computed(() => NODE_TYPE_MAP[actualType.value])
const categoryColor = computed(() => {
  if (isGenericNode.value && actualType.value) return getCategoryColor(actualType.value)
  const t = props.selectedNode?.type
  if (t === 'start') return '#7c3aed'
  if (t === 'end') return '#ef4444'
  if (t === 'condition') return '#3b82f6'
  if (t === 'action') return '#22c55e'
  if (t === 'variable-assign') return '#8b5cf6'
  if (isGateway.value) return '#f59e0b'
  return '#64748b'
})

const paramSchema = computed<ParamField[]>(() => {
  if (!isGenericNode.value || !actualType.value) return []
  return getParamSchema(actualType.value)
})

// 按group分组
const groupedSchema = computed(() => {
  const groups: { name: string; fields: ParamField[] }[] = []
  const groupMap: Record<string, ParamField[]> = {}
  paramSchema.value.forEach(f => {
    const g = f.group || i18n('rule.panel.basicConfig')
    if (!groupMap[g]) groupMap[g] = []
    groupMap[g].push(f)
  })
  Object.entries(groupMap).forEach(([name, fields]) => {
    groups.push({ name, fields })
  })
  return groups
})

const updateField = (field: string, value: any) => {
  if (!props.selectedNode) return
  emit('update', props.selectedNode.id, { [field]: value })
}

const deleteCondition = (idx: number) => {
  const list = [...conditions.value]
  list.splice(idx, 1)
  updateField('conditions', list)
}
const deleteAction = (idx: number) => {
  const list = [...actions.value]
  list.splice(idx, 1)
  updateField('actions', list)
}
const deleteAssignment = (idx: number) => {
  const list = [...assignments.value]
  list.splice(idx, 1)
  updateField('assignments', list)
}

// 表格数据操作
const getTableData = (fieldName: string) => {
  const data = props.selectedNode?.data?.[fieldName]
  return Array.isArray(data) ? data : []
}
const addTableRow = (fieldName: string, columns: any[]) => {
  if (!props.selectedNode) return
  const newRow: Record<string, any> = {}
  columns.forEach(c => { newRow[c.prop] = '' })
  const list = [...getTableData(fieldName), newRow]
  emit('update', props.selectedNode.id, { [fieldName]: list })
}
const removeTableRow = (fieldName: string, idx: number) => {
  const list = [...getTableData(fieldName)]
  list.splice(idx, 1)
  emit('update', props.selectedNode.id, { [fieldName]: list })
}

const getOpSymbol = (op: string) => {
  const map: Record<string, string> = {
    EQ: '=', NE: '≠', GT: '>', GTE: '≥', LT: '<', LTE: '≤',
    IN: '∈', NOT_IN: '∉', CONTAINS: '⊃', NOT_CONTAINS: '⊄',
    IS_NULL: '∅', NOT_NULL: '∃', STARTS_WITH: '⊙', ENDS_WITH: '⊛'
  }
  return map[op] || op
}
const getActionLabel = (type: string) => {
  const map: Record<string, string> = {
    SHOW_FIELD: 'rule.action.showField', HIDE_FIELD: 'rule.action.hideField', SET_VALUE: 'rule.action.setValue',
    CLEAR_VALUE: 'rule.action.clearValue', SET_REQUIRED: 'rule.action.setRequired', SET_OPTIONAL: 'rule.action.setOptional',
    SET_READONLY: 'rule.action.setReadonly', SET_EDITABLE: 'rule.action.setEditable',
    SET_DISABLED: 'rule.action.setDisabled', SET_ENABLED: 'rule.action.setEnabled',
    SHOW_MESSAGE: 'rule.action.showMessage', REDIRECT: 'rule.action.redirect'
  }
  return i18n(map[type] || type)
}
</script>

<style scoped lang="scss">
.property-panel {
  height: 100%; display: flex; flex-direction: column; background: #fff;

  .panel-header {
    display: flex; align-items: center; gap: 6px;
    padding: 10px 14px; background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
    font-weight: 600; font-size: 13px; color: #1e293b; flex-shrink: 0;
  }

  .empty-state {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    height: 100%; color: #94a3b8;
    p { margin-top: 8px; font-size: 13px; }
  }

  .panel-body { flex: 1; overflow-y: auto; }

  .prop-section {
    border-bottom: 1px solid #f1f5f9; padding: 12px 14px;

    &.node-info-section { padding: 14px; background: #f8fafc; }

    &.dialog-entry-section {
      background: linear-gradient(135deg, #eff6ff 0%, #f0f9ff 100%);
      border-bottom: 1px solid #dbeafe;
      text-align: center;

      .open-dialog-btn {
        width: 100%;
        font-weight: 600;
      }
      .dialog-tip {
        margin-top: 8px;
        font-size: 11px;
        color: #64748b;
        line-height: 1.5;
        text-align: left;
      }
    }

    .section-title {
      display: flex; align-items: center; justify-content: space-between;
      font-size: 11px; font-weight: 600; color: #475569;
      text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;
    }

    .node-type-badge {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 6px; border: 1px solid; font-size: 12px; font-weight: 600;
      .badge-icon { font-size: 14px; }
    }

    .node-desc { font-size: 11px; color: #64748b; line-height: 1.6; margin-top: 8px; }

    .empty-tip { text-align: center; color: #cbd5e1; font-size: 12px; padding: 16px 0; }

    .logic-toggle {
      display: flex; align-items: center; gap: 8px; margin-bottom: 10px;
      span { font-size: 12px; color: #475569; }
    }

    .list-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 8px; margin-bottom: 4px;
      background: #f8fafc; border-radius: 4px; border: 1px solid #f1f5f9;
      &:hover { background: #f1f5f9; }
      .item-info {
        display: flex; align-items: center; gap: 6px; flex: 1; min-width: 0;
        .item-field { font-size: 12px; font-weight: 600; color: #1e293b; }
        .item-op { font-size: 11px; color: #6366f1; font-family: monospace; }
        .item-val { font-size: 11px; color: #64748b; }
      }
      .item-actions { display: flex; gap: 2px; }
    }

    .schema-table {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .table-empty-tip {
        text-align: center;
        color: #cbd5e1;
        font-size: 11px;
        padding: 12px 0;
        background: #f8fafc;
        border: 1px dashed #e2e8f0;
        border-radius: 6px;
      }

      .table-row-card {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        overflow: hidden;
        transition: border-color 0.2s, box-shadow 0.2s;

        &:hover {
          border-color: #c7d2fe;
          box-shadow: 0 1px 4px rgba(99, 102, 241, 0.08);
        }

        .row-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 4px 8px 4px 10px;
          background: #f1f5f9;
          border-bottom: 1px solid #e2e8f0;

          .row-card-idx {
            font-size: 11px;
            font-weight: 600;
            color: #6366f1;
            font-family: 'JetBrains Mono', Consolas, monospace;
            letter-spacing: 0.3px;
          }
        }

        .row-card-body {
          padding: 8px 10px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .row-cell {
          display: flex;
          flex-direction: column;
          gap: 3px;

          .cell-label {
            font-size: 11px;
            color: #64748b;
            font-weight: 500;
            line-height: 1.3;
            user-select: none;
          }

          :deep(.el-input__inner),
          :deep(.el-select .el-input__inner) {
            font-size: 12px;
            height: 28px;
            line-height: 28px;
          }
        }
      }

      .table-add-btn {
        width: 100%;
        border-style: dashed;
        margin-top: 2px;
      }
    }
  }

  :deep(.el-form-item) { margin-bottom: 10px; }
  :deep(.el-form-item__label) { font-size: 12px; color: #475569; }
  :deep(.el-input__inner), :deep(.el-textarea__inner) { font-size: 12px; }
}
</style>
