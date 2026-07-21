<script setup lang="ts">
/**
 * 规则-表单 绑定管理面板
 *
 * 与 RuleConfigPanel 的差异：
 * - RuleConfigPanel：管理本表单已绑定的规则（CRUD + 设计器入口）
 * - RuleBindManager：从规则库选择已有规则/规则集绑定到当前表单，展示字段覆盖范围
 *
 * 主要功能：
 * 1. 列出当前表单绑定的规则集（ruleSet）
 * 2. 从规则库选择已有规则绑定（创建 ruleSetItem）
 * 3. 解除绑定
 * 4. 字段覆盖范围分析：扫描规则节点中的 targetField/fieldName，与 formFields 比对
 */
import { computed, ref, watch } from 'vue'
import { Plus, Delete, Search, Link, View } from '@element-plus/icons-vue'
import { i18n } from '@/lang'
import { success, warning, error, operationConfirm } from 'star-horse-lowcode'
import {
  ruleSetApi,
  ruleSetItemApi,
  ruleDefinitionApi,
  ruleExecutionLogApi,
} from '@/api/rule_engine_api'
import type { FormFieldMeta } from '@/components/rule/useFormRuleRuntime'

const props = defineProps<{
  modelValue: boolean
  formId: string
  formFields?: FormFieldMeta[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const closeAction = () => {
  dialogVisible.value = false
}

// ==================== 规则集列表（绑定到本表单） ====================
const setListLoading = ref(false)
const setList = ref<any[]>([])

const loadSetList = async () => {
  if (!props.formId) return
  setListLoading.value = true
  try {
    const res = await ruleSetApi.listByFormId(props.formId)
    if (res.data.code === 0) {
      setList.value = Array.isArray(res.data.data) ? res.data.data : []
    } else {
      warning(res.data.cnMessage || i18n('rule.bindManager.warning.loadSetFail'))
    }
  } catch (e: any) {
    error(i18n('rule.bindManager.warning.loadSetFail') + ': ' + (e?.message || e))
  } finally {
    setListLoading.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v && props.formId) {
      loadSetList()
      loadAvailableRules()
    }
  },
  { immediate: true },
)

// ==================== 当前展开的规则集 - 关联项 ====================
const expandedSetId = ref<string>('')
const setItems = ref<any[]>([])
const setItemsLoading = ref(false)

const toggleSet = async (setId: string) => {
  if (expandedSetId.value === setId) {
    expandedSetId.value = ''
    setItems.value = []
    return
  }
  expandedSetId.value = setId
  setItemsLoading.value = true
  try {
    const res = await ruleSetItemApi.listBySetId(setId)
    if (res.data.code === 0) {
      setItems.value = Array.isArray(res.data.data) ? res.data.data : []
    } else {
      setItems.value = []
    }
  } catch {
    setItems.value = []
  } finally {
    setItemsLoading.value = false
  }
}

const handleUnbindItem = async (item: any) => {
  if (!item?.idRuleSetItem) return
  try {
    await operationConfirm(i18n('rule.bindManager.confirm.unbind', [item.ruleName || item.idRule]))
    const res = await ruleSetItemApi.deleteSetItem(item.idRuleSetItem)
    if (res.data.code === 0) {
      success(i18n('rule.bindManager.success.unbound'))
      if (expandedSetId.value) {
        toggleSet(expandedSetId.value).then(() => toggleSet(expandedSetId.value))
      }
    } else {
      warning(res.data.cnMessage || i18n('rule.bindManager.warning.unbindFail'))
    }
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') {
      error(i18n('rule.bindManager.warning.unbindFail') + ': ' + (e?.message || e))
    }
  }
}

// ==================== 规则库（可选择绑定） ====================
const availableLoading = ref(false)
const availableRules = ref<any[]>([])
const searchKeyword = ref('')

const filteredAvailableRules = computed(() => {
  if (!searchKeyword.value.trim()) return availableRules.value
  const kw = searchKeyword.value.toLowerCase()
  return availableRules.value.filter(
    (r) =>
      (r.ruleName || '').toLowerCase().includes(kw) ||
      (r.ruleCode || '').toLowerCase().includes(kw),
  )
})

const loadAvailableRules = async () => {
  availableLoading.value = true
  try {
    const res = await ruleDefinitionApi.listByRuleType('FORM_LINKAGE')
    if (res.data.code === 0) {
      availableRules.value = Array.isArray(res.data.data) ? res.data.data : []
    }
  } catch (e: any) {
    console.warn('[RuleBindManager] loadAvailableRules failed:', e)
  } finally {
    availableLoading.value = false
  }
}

// ==================== 绑定到规则集 ====================
const bindDialogVisible = ref(false)
const bindTargetSetId = ref('')
const bindSelectedRuleIds = ref<string[]>([])

const openBindDialog = (setId: string) => {
  bindTargetSetId.value = setId
  bindSelectedRuleIds.value = []
  bindDialogVisible.value = true
}

const handleConfirmBind = async () => {
  if (bindSelectedRuleIds.value.length === 0) {
    warning(i18n('rule.bindManager.warning.noSelection'))
    return
  }
  try {
    const items = bindSelectedRuleIds.value.map((ruleId, idx) => ({
      idRuleSet: bindTargetSetId.value,
      idRule: ruleId,
      priority: idx + 1,
      enabled: 'Y',
    }))
    const res = await ruleSetItemApi.batchSaveSetItems(items)
    if (res.data.code === 0) {
      success(i18n('rule.bindManager.success.bound', [items.length]))
      bindDialogVisible.value = false
      // 刷新关联项列表
      if (expandedSetId.value === bindTargetSetId.value) {
        await toggleSet(bindTargetSetId.value)
        await toggleSet(bindTargetSetId.value)
      }
    } else {
      warning(res.data.cnMessage || i18n('rule.bindManager.warning.bindFail'))
    }
  } catch (e: any) {
    error(i18n('rule.bindManager.warning.bindFail') + ': ' + (e?.message || e))
  }
}

// ==================== 字段覆盖范围分析 ====================
const coverageVisible = ref(false)
const coverageData = ref<Array<{ field: string; label: string; covered: boolean; rules: string[] }>>([])

const analyzeCoverage = (rules: any[]) => {
  const fieldRulesMap = new Map<string, string[]>()
  const collectFields = (node: any, ruleName: string) => {
    if (!node || !node.data) return
    const d = node.data
    // 收集 targetField
    if (d.targetField) {
      const arr = Array.isArray(d.targetField) ? d.targetField : [d.targetField]
      arr.forEach((f: string) => {
        if (!fieldRulesMap.has(f)) fieldRulesMap.set(f, [])
        if (!fieldRulesMap.get(f)!.includes(ruleName)) {
          fieldRulesMap.get(f)!.push(ruleName)
        }
      })
    }
    // 收集 actions 中的 targetField
    if (Array.isArray(d.actions)) {
      d.actions.forEach((a: any) => {
        if (a.targetField) {
          if (!fieldRulesMap.has(a.targetField)) fieldRulesMap.set(a.targetField, [])
          if (!fieldRulesMap.get(a.targetField)!.includes(ruleName)) {
            fieldRulesMap.get(a.targetField)!.push(ruleName)
          }
        }
      })
    }
    // 收集 conditions 中的 fieldName
    if (Array.isArray(d.conditions)) {
      d.conditions.forEach((c: any) => {
        if (c.fieldName) {
          if (!fieldRulesMap.has(c.fieldName)) fieldRulesMap.set(c.fieldName, [])
          if (!fieldRulesMap.get(c.fieldName)!.includes(ruleName)) {
            fieldRulesMap.get(c.fieldName)!.push(ruleName)
          }
        }
      })
    }
  }

  for (const rule of rules) {
    const ruleName = rule.ruleName || rule.ruleCode || rule.idRuleDefinition
    let flowContent: any = rule.flowContent
    if (typeof flowContent === 'string') {
      try {
        flowContent = JSON.parse(flowContent)
      } catch {
        flowContent = null
      }
    }
    if (flowContent && Array.isArray(flowContent.nodes)) {
      flowContent.nodes.forEach((n: any) => collectFields(n, ruleName))
    }
  }

  const formFields = props.formFields || []
  return formFields.map((f) => ({
    field: f.fieldName,
    label: f.label || f.fieldName,
    covered: fieldRulesMap.has(f.fieldName),
    rules: fieldRulesMap.get(f.fieldName) || [],
  }))
}

const handleViewCoverage = async () => {
  if (!props.formFields || props.formFields.length === 0) {
    warning(i18n('rule.bindManager.warning.noFields'))
    return
  }
  // 加载当前表单所有规则
  try {
    const res = await ruleDefinitionApi.listByFormId(props.formId)
    if (res.data.code === 0 && Array.isArray(res.data.data)) {
      coverageData.value = analyzeCoverage(res.data.data)
      coverageVisible.value = true
    }
  } catch (e: any) {
    error(i18n('rule.bindManager.warning.coverageFail') + ': ' + (e?.message || e))
  }
}

const coveredCount = computed(() => coverageData.value.filter((c) => c.covered).length)
</script>

<template>
  <!-- 字段覆盖范围弹窗 -->
  <star-horse-dialog
    v-model="coverageVisible"
    :title="i18n('rule.bindManager.coverage.title')"
    :selfFunc="true"
    boxWidth="60%"
    boxHeight="70%"
    @closeAction="coverageVisible = false"
  >
    <template #merge>
      <el-button @click="coverageVisible = false">{{ i18n('common.close') }}</el-button>
    </template>
    <div class="coverage-panel">
      <div class="coverage-summary">
        <el-tag type="success" effect="dark">
          {{ i18n('rule.bindManager.coverage.covered', [coveredCount]) }}
        </el-tag>
        <el-tag type="info" effect="plain">
          {{ i18n('rule.bindManager.coverage.total', [coverageData.length]) }}
        </el-tag>
      </div>
      <el-table :data="coverageData" border stripe style="width: 100%">
        <el-table-column prop="field" :label="i18n('rule.bindManager.coverage.col.field')" width="160" />
        <el-table-column prop="label" :label="i18n('rule.bindManager.coverage.col.label')" min-width="140" />
        <el-table-column :label="i18n('rule.bindManager.coverage.col.covered')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.covered ? 'success' : 'info'" size="small">
              {{ row.covered ? i18n('common.yes') : i18n('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.bindManager.coverage.col.relatedRules')" min-width="220">
          <template #default="{ row }">
            <el-tag v-for="r in row.rules" :key="r" size="small" type="warning" effect="plain" style="margin-right: 4px">
              {{ r }}
            </el-tag>
            <span v-if="row.rules.length === 0" style="color: #cbd5e1">-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </star-horse-dialog>

  <!-- 绑定规则选择弹窗 -->
  <star-horse-dialog
    v-model="bindDialogVisible"
    :title="i18n('rule.bindManager.bind.title')"
    :selfFunc="true"
    boxWidth="60%"
    boxHeight="70%"
    @closeAction="bindDialogVisible = false"
  >
    <template #merge>
      <el-button @click="bindDialogVisible = false">{{ i18n('common.close') }}</el-button>
      <el-button type="primary" @click="handleConfirmBind">
        {{ i18n('rule.bindManager.bind.confirm') }}
      </el-button>
    </template>
    <div class="bind-dialog-content">
      <el-input
        v-model="searchKeyword"
        :placeholder="i18n('rule.bindManager.bind.searchPlaceholder')"
        clearable
        style="margin-bottom: 12px"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-table
        :data="filteredAvailableRules"
        v-loading="availableLoading"
        border
        stripe
        max-height="500"
        @selection-change="(rows: any[]) => (bindSelectedRuleIds = rows.map((r) => r.idRuleDefinition))"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="ruleName" :label="i18n('rule.bindManager.col.ruleName')" min-width="160" show-overflow-tooltip />
        <el-table-column prop="ruleCode" :label="i18n('rule.bindManager.col.ruleCode')" width="140" show-overflow-tooltip />
        <el-table-column prop="ruleType" :label="i18n('rule.bindManager.col.ruleType')" width="120" />
        <el-table-column prop="priority" :label="i18n('rule.bindManager.col.priority')" width="80" align="center" />
        <el-table-column :label="i18n('rule.bindManager.col.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 'PUBLISHED' ? 'success' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </star-horse-dialog>

  <!-- 主弹窗 -->
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.bindManager.title')"
    :selfFunc="true"
    boxWidth="70%"
    boxHeight="75%"
    @closeAction="closeAction"
  >
    <template #merge>
      <el-button @click="closeAction">{{ i18n('common.close') }}</el-button>
    </template>
    <div class="bind-manager">
      <!-- 顶部统计与操作 -->
      <div class="bind-toolbar">
        <div class="toolbar-left">
          <el-tag type="info" effect="plain">
            {{ i18n('rule.bindManager.formId') }}: {{ formId || '-' }}
          </el-tag>
          <el-tag type="success" effect="plain">
            {{ i18n('rule.bindManager.setCount', [setList.length]) }}
          </el-tag>
        </div>
        <div class="toolbar-right">
          <el-button @click="handleViewCoverage">
            <el-icon><View /></el-icon>
            <span>{{ i18n('rule.bindManager.viewCoverage') }}</span>
          </el-button>
          <el-button @click="loadSetList" :loading="setListLoading">
            <el-icon><Search /></el-icon>
            <span>{{ i18n('common.refresh') }}</span>
          </el-button>
        </div>
      </div>

      <!-- 规则集列表 -->
      <el-table
        :data="setList"
        v-loading="setListLoading"
        border
        stripe
        style="width: 100%"
        :empty-text="i18n('rule.bindManager.empty')"
      >
        <el-table-column type="expand" width="50">
          <template #default="{ row }">
            <div class="set-items-panel">
              <div class="set-items-header">
                <span>{{ i18n('rule.bindManager.boundRules', [setItems.length]) }}</span>
                <el-button type="primary" link @click="openBindDialog(row.idRuleSet)">
                  <el-icon><Plus /></el-icon>
                  <span>{{ i18n('rule.bindManager.bindRule') }}</span>
                </el-button>
              </div>
              <el-table
                :data="row.idRuleSet === expandedSetId ? setItems : []"
                v-loading="row.idRuleSet === expandedSetId && setItemsLoading"
                border
                size="small"
                style="width: 100%"
              >
                <el-table-column type="index" width="50" :label="i18n('common.index')" />
                <el-table-column prop="ruleName" :label="i18n('rule.bindManager.col.ruleName')" min-width="160" show-overflow-tooltip />
                <el-table-column prop="priority" :label="i18n('rule.bindManager.col.priority')" width="80" align="center" />
                <el-table-column prop="enabled" :label="i18n('rule.bindManager.col.enabled')" width="80" align="center">
                  <template #default="{ row: r }">
                    <el-tag :type="r.enabled === 'Y' ? 'success' : 'info'" size="small">
                      {{ r.enabled === 'Y' ? i18n('common.yes') : i18n('common.no') }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column :label="i18n('common.operation')" width="100" align="center">
                  <template #default="{ row: r }">
                    <el-button link type="danger" @click="handleUnbindItem(r)">
                      <el-icon><Delete /></el-icon>
                      <span>{{ i18n('rule.bindManager.unbind') }}</span>
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="setName" :label="i18n('rule.bindManager.col.setName')" min-width="160" show-overflow-tooltip />
        <el-table-column prop="setCode" :label="i18n('rule.bindManager.col.setCode')" width="160" show-overflow-tooltip />
        <el-table-column prop="setType" :label="i18n('rule.bindManager.col.setType')" width="120" />
        <el-table-column prop="priority" :label="i18n('rule.bindManager.col.priority')" width="80" align="center" />
        <el-table-column :label="i18n('rule.bindManager.col.enabled')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 'Y' ? 'success' : 'info'" size="small">
              {{ row.enabled === 'Y' ? i18n('common.yes') : i18n('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="setDesc" :label="i18n('rule.bindManager.col.desc')" min-width="180" show-overflow-tooltip />
      </el-table>
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.bind-manager {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
}

.bind-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .toolbar-left,
  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}

.set-items-panel {
  padding: 12px 16px;
  background: #f8fafc;

  .set-items-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 13px;
    color: #475569;
    font-weight: 600;
  }
}

.bind-dialog-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.coverage-panel {
  .coverage-summary {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
}
</style>
