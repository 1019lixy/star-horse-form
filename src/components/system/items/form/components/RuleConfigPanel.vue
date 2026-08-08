<script setup lang="ts">
/**
 * 表单设计器 - 规则配置面板
 *
 * 在 StarHorseFormDesign 工具栏点击"规则配置"按钮后打开。
 * 核心职责：
 * 1. 列出当前表单绑定的所有规则（调用 ruleDefinitionApi.listByFormId）
 * 2. 新建/编辑规则：内嵌 RuleDesigner，传入 formId + formFields 上下文
 * 3. 删除/启用/禁用规则
 * 4. 查看执行日志（复用 ExecutionLogViewer）
 * 5. 联动策略一键转规则（调用 linkageToRule.ts）
 */
import { computed, nextTick, ref, watch } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Lock, Unlock, Document, Refresh, Back, MagicStick, Connection } from '@element-plus/icons-vue'
import { i18n } from '@/lang'
import { success, warning, error, operationConfirm } from 'star-horse-lowcode'
import { ruleDefinitionApi } from '@/api/rule_engine_api'
import RuleDesigner from '@/components/rule/RuleDesigner.vue'
import RuleBindManager from '@/components/system/items/form/components/RuleBindManager.vue'
import ExecutionLogViewer from '@/components/rule/ExecutionLogViewer.vue'
import { convertLinkageToRule, extractLinkageFromCompList } from '@/components/rule/utils/linkageToRule'
import { extractFieldMetaList, type FormFieldMeta } from '@/components/rule/useFormRuleRuntime'

const props = defineProps<{
  /** 弹窗显示控制（v-model） */
  modelValue: boolean
  /** 表单ID */
  formId: string
  /** 表单字段元数据列表（来自 compList） */
  formFields?: FormFieldMeta[]
  /** 表单设计器的 compList（用于联动策略转换） */
  compList?: any[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', v: boolean): void
}>()

// ==================== 弹窗控制 ====================
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
})

const closeAction = () => {
  dialogVisible.value = false
}

// ==================== 规则列表 ====================
const loading = ref(false)
const ruleList = ref<any[]>([])

const loadRules = async () => {
  if (!props.formId) {
    warning(i18n('rule.configPanel.warning.noFormId'))
    return
  }
  loading.value = true
  try {
    const res = await ruleDefinitionApi.listByFormId(props.formId)
    if (res.data.code === 200) {
      ruleList.value = Array.isArray(res.data.data) ? res.data.data : []
    } else {
      warning(res.data.cnMessage || i18n('rule.configPanel.warning.loadFail'))
    }
  } catch (e: any) {
    error(i18n('rule.configPanel.warning.loadFail') + ': ' + (e?.message || e))
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (v) => {
    if (v && props.formId) {
      loadRules()
    }
  },
  { immediate: true },
)

// ==================== 设计器模式 ====================
// 'list' = 规则列表; 'designer' = 嵌入 RuleDesigner
const mode = ref<'list' | 'designer'>('list')
const editingRuleId = ref<string | undefined>(undefined)
// 联动转换预填数据（mode=designer 时若提供则 RuleDesigner 初始化使用）
const prefilledFlow = ref<any>(null)

const fieldMetaList = computed<FormFieldMeta[]>(() => {
  const v = props.formFields || []
  console.log('[RuleConfigPanel] fieldMetaList computed | props.formFields=', props.formFields?.length, '| result=', v.length)
  return v
})

const openDesigner = (ruleId?: string, prefill?: any) => {
  editingRuleId.value = ruleId
  prefilledFlow.value = prefill || null
  mode.value = 'designer'
}

const handleDesignerClose = () => {
  mode.value = 'list'
  editingRuleId.value = undefined
  prefilledFlow.value = null
  // 设计器关闭后刷新列表（可能有新建/修改）
  loadRules()
}

const handleDesignerSaved = () => {
  // 保存成功后也刷新列表，但不关闭设计器（用户可能继续编辑）
  loadRules()
}

// ==================== 新建规则 ====================
const handleCreate = () => {
  if (!props.formId) {
    warning(i18n('rule.configPanel.warning.noFormId'))
    return
  }
  openDesigner(undefined)
}

// ==================== 编辑规则 ====================
const handleEdit = (row: any) => {
  if (!row?.idRuleDefinition) {
    warning(i18n('rule.configPanel.warning.invalidRule'))
    return
  }
  openDesigner(row.idRuleDefinition)
}

// ==================== 删除规则 ====================
const handleDelete = async (row: any) => {
  if (!row?.idRuleDefinition) return
  try {
    await operationConfirm(i18n('rule.configPanel.confirm.delete', [row.ruleName || row.ruleCode]))
    const res = await ruleDefinitionApi.deleteRule(row.idRuleDefinition)
    if (res.data.code === 200) {
      success(i18n('rule.configPanel.success.deleted'))
      loadRules()
    } else {
      warning(res.data.cnMessage || i18n('rule.configPanel.warning.deleteFail'))
    }
  } catch (e: any) {
    // 用户取消 operationConfirm 会走到 catch，过滤掉
    if (e !== 'cancel' && e !== 'close') {
      error(i18n('rule.configPanel.warning.deleteFail') + ': ' + (e?.message || e))
    }
  }
}

// ==================== 启用/禁用 ====================
const handleToggleEnabled = async (row: any) => {
  const newEnabled = row.enabled === 'Y' ? 'N' : 'Y'
  try {
    const res = await ruleDefinitionApi.updateRule({
      ...row,
      enabled: newEnabled,
    })
    if (res.data.code === 200) {
      row.enabled = newEnabled
      success(newEnabled === 'Y' ? i18n('rule.configPanel.success.enabled') : i18n('rule.configPanel.success.disabled'))
    } else {
      warning(res.data.cnMessage || i18n('rule.configPanel.warning.updateFail'))
    }
  } catch (e: any) {
    error(i18n('rule.configPanel.warning.updateFail') + ': ' + (e?.message || e))
  }
}

// ==================== 执行日志 ====================
const logVisible = ref(false)
const logRuleId = ref<string>('')

const handleViewLog = (row: any) => {
  if (!row?.idRuleDefinition) return
  logRuleId.value = row.idRuleDefinition
  logVisible.value = true
}

// ==================== 规则绑定管理 ====================
const bindManagerVisible = ref(false)
const handleOpenBindManager = () => {
  if (!props.formId) {
    warning(i18n('rule.configPanel.warning.noFormId'))
    return
  }
  bindManagerVisible.value = true
}

// ==================== 联动转规则 ====================
const handleConvertLinkage = async () => {
  if (!props.compList || props.compList.length === 0) {
    warning(i18n('rule.configPanel.warning.noCompList'))
    return
  }
  const sources = extractLinkageFromCompList(props.compList)
  if (sources.length === 0) {
    warning(i18n('rule.configPanel.warning.noLinkage'))
    return
  }
  try {
    await operationConfirm(i18n('rule.configPanel.confirm.convertLinkage', [sources.length]))
    const result = convertLinkageToRule(sources, fieldMetaList.value, props.formId)
    if (result.flowContent.nodes.length <= 2) {
      warning(i18n('rule.configPanel.warning.convertEmpty'))
      return
    }
    // 提示转换统计
    const stats = result.sourceStats
    const msg = i18n('rule.configPanel.success.converted', [
      stats.visibilityCount,
      stats.apiFillCount,
      stats.customCount,
    ])
    if (stats.skipped.length > 0) {
      warning(msg + '\n' + i18n('rule.configPanel.warning.skipped', [stats.skipped.length]))
    } else {
      success(msg)
    }
    // 用预填数据打开设计器
    openDesigner(undefined, result)
  } catch (e: any) {
    if (e !== 'cancel' && e !== 'close') {
      error(i18n('rule.configPanel.warning.convertFail') + ': ' + (e?.message || e))
    }
  }
}

// ==================== 状态/类型展示 ====================
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: 'info',
    TEST: 'warning',
    PUBLISHED: 'success',
    DISABLED: 'danger',
  }
  return map[status] || 'info'
}
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    DRAFT: i18n('rule.status.draft'),
    TEST: i18n('rule.status.test'),
    PUBLISHED: i18n('rule.status.published'),
    DISABLED: i18n('rule.status.disabled'),
  }
  return map[status] || status
}

// ==================== 预填数据应用 ====================
// 当 prefilledFlow 存在时，RuleDesigner 需要应用该数据初始化
// 由于 RuleDesigner 通过 props.formId/formFields 接收上下文，prefilledFlow 通过 ref 传递
// 设计器侧应在 onMounted 中检查并提供"应用预填数据"的入口（或自动应用）
// 这里我们通过 key 重新挂载 RuleDesigner 来确保状态干净
const designerKey = ref(0)
watch(mode, (m) => {
  if (m === 'designer') {
    designerKey.value++
  }
})
</script>

<template>
  <!-- 执行日志弹窗（独立） -->
  <ExecutionLogViewer v-if="logVisible" :ruleId="logRuleId" @close="logVisible = false" />

  <!-- 规则绑定管理弹窗（独立） -->
  <RuleBindManager v-model="bindManagerVisible" :formId="formId" :formFields="fieldMetaList" />

  <!-- 主弹窗：根据 mode 切换显示列表/设计器 -->
  <star-horse-dialog
    v-model="dialogVisible"
    :title="mode === 'list' ? i18n('rule.configPanel.title') : i18n('rule.configPanel.title.designer')"
    :selfFunc="true"
    boxWidth="80%"
    boxHeight="85%"
    @closeAction="mode === 'designer' ? handleDesignerClose() : closeAction()"
  >
    <template #merge>
      <el-button v-if="mode === 'designer'" @click="handleDesignerClose">
        <el-icon><Back /></el-icon>
        <span>{{ i18n('rule.configPanel.backToList') }}</span>
      </el-button>
      <el-button v-else @click="closeAction">
        <span>{{ i18n('common.close') }}</span>
      </el-button>
    </template>

    <!-- 列表模式 -->
    <div v-if="mode === 'list'" class="rule-config-list">
      <!-- 顶部操作栏 -->
      <div class="list-toolbar">
        <div class="toolbar-left">
          <el-tag type="info" effect="plain">
            {{ i18n('rule.configPanel.formId') }}: {{ formId || '-' }}
          </el-tag>
          <el-tag type="success" effect="plain">
            {{ i18n('rule.configPanel.ruleCount', [ruleList.length]) }}
          </el-tag>
          <el-tag v-if="fieldMetaList.length" type="warning" effect="plain">
            {{ i18n('rule.configPanel.fieldCount', [fieldMetaList.length]) }}
          </el-tag>
        </div>
        <div class="toolbar-right">
          <el-button @click="loadRules" :loading="loading">
            <el-icon><Refresh /></el-icon>
            <span>{{ i18n('common.refresh') }}</span>
          </el-button>
          <el-button type="success" plain @click="handleOpenBindManager">
            <el-icon><Connection /></el-icon>
            <span>{{ i18n('rule.configPanel.bindManager') }}</span>
          </el-button>
          <el-button type="warning" plain @click="handleConvertLinkage">
            <el-icon><MagicStick /></el-icon>
            <span>{{ i18n('rule.configPanel.convertLinkage') }}</span>
          </el-button>
          <el-button type="primary" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            <span>{{ i18n('rule.configPanel.createRule') }}</span>
          </el-button>
        </div>
      </div>

      <!-- 规则列表 -->
      <el-table
        :data="ruleList"
        v-loading="loading"
        border
        stripe
        style="width: 100%"
        :empty-text="i18n('rule.configPanel.empty')"
      >
        <el-table-column type="index" width="50" :label="i18n('common.index')" />
        <el-table-column prop="ruleName" :label="i18n('rule.configPanel.col.ruleName')" min-width="160" show-overflow-tooltip />
        <el-table-column prop="ruleCode" :label="i18n('rule.configPanel.col.ruleCode')" width="160" show-overflow-tooltip />
        <el-table-column prop="ruleType" :label="i18n('rule.configPanel.col.ruleType')" width="140" />
        <el-table-column prop="priority" :label="i18n('rule.configPanel.col.priority')" width="80" align="center" />
        <el-table-column :label="i18n('rule.configPanel.col.status')" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small" effect="dark">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="i18n('rule.configPanel.col.enabled')" width="80" align="center">
          <template #default="{ row }">
            <el-tag :type="row.enabled === 'Y' ? 'success' : 'info'" size="small">
              {{ row.enabled === 'Y' ? i18n('common.yes') : i18n('common.no') }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="ruleDesc" :label="i18n('rule.configPanel.col.desc')" min-width="180" show-overflow-tooltip />
        <el-table-column :label="i18n('common.operation')" width="240" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" @click="handleEdit(row)">
              <el-icon><Edit /></el-icon>
              <span>{{ i18n('common.edit') }}</span>
            </el-button>
            <el-button link type="info" @click="handleViewLog(row)">
              <el-icon><Document /></el-icon>
              <span>{{ i18n('rule.configPanel.viewLog') }}</span>
            </el-button>
            <el-button link :type="row.enabled === 'Y' ? 'warning' : 'success'" @click="handleToggleEnabled(row)">
              <el-icon>
                <Unlock v-if="row.enabled === 'Y'" />
                <Lock v-else />
              </el-icon>
              <span>{{ row.enabled === 'Y' ? i18n('common.disable') : i18n('common.enable') }}</span>
            </el-button>
            <el-button link type="danger" @click="handleDelete(row)">
              <el-icon><Delete /></el-icon>
              <span>{{ i18n('common.delete') }}</span>
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 设计器模式：嵌入 RuleDesigner，传入 formId + formFields -->
    <div v-else class="rule-config-designer">
      <RuleDesigner
        :key="designerKey"
        :ruleId="editingRuleId"
        :formId="formId"
        :formFields="fieldMetaList"
        :prefilledData="prefilledFlow"
        @saved="handleDesignerSaved"
        @close="handleDesignerClose"
      />
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.rule-config-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;

  .list-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }
}

.rule-config-designer {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
