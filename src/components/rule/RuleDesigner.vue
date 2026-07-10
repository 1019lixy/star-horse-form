<template>
  <!-- 保留必要的弹窗（复杂编辑用） -->
  <ConditionEditDialog :visible="conditionDialogVisible" :condition="editingCondition" @close="conditionDialogVisible = false" @save="handleConditionSave" />
  <ActionEditDialog :visible="actionDialogVisible" :action="editingAction" @close="actionDialogVisible = false" @save="handleActionSave" />
  <GatewayConfigDialog :visible="gatewayDialogVisible" :gateway="editingGateway" @close="gatewayDialogVisible = false" @save="handleGatewaySave" />
  <VariableAssignDialog :visible="variableDialogVisible" :assignments="editingAssignments" @close="variableDialogVisible = false" @save="handleVariableSave" />
  <ScriptEditDialog :visible="scriptDialogVisible" :script="editingScript" @close="scriptDialogVisible = false" @save="handleScriptSave" />
  <HttpCallDialog :visible="httpDialogVisible" :config="editingHttpConfig" @close="httpDialogVisible = false" @save="handleHttpSave" />
  <RuleSetRefDialog :visible="ruleSetRefDialogVisible" :config="editingRuleSetRef" @close="ruleSetRefDialogVisible = false" @save="handleRuleSetRefSave" />
  <LoopConfigDialog :visible="loopDialogVisible" :config="editingLoopConfig" @close="loopDialogVisible = false" @save="handleLoopSave" />
  <RulePropertyDialog :visible="propertyDialogVisible" :rule-data="ruleData" @close="propertyDialogVisible = false" @save="handlePropertySave" />
  
  <!-- 边标签编辑弹窗 -->
  <star-horse-dialog
    :dialogVisible="edgeLabelDialogVisible"
    title="编辑连线标签"
    boxWidth="500px"
    :selfFunc="true"
    @closeAction="edgeLabelDialogVisible = false"
    @merge="handleEdgeLabelSave"
  >
    <el-form label-width="100px">
      <el-form-item label="连线标签">
        <el-input v-model="edgeLabel" placeholder="输入连线标签，留空则自动生成" />
      </el-form-item>
      <el-form-item>
        <el-alert type="info" :closable="false">
          <template #title>
            <div style="display: flex; align-items: center; gap: 8px;">
              <el-icon><InfoFilled /></el-icon>
              <span>留空将根据节点类型自动生成标签，手动输入的内容不会被自动覆盖</span>
            </div>
          </template>
        </el-alert>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  
  <div class="rule-designer">
    <!-- 顶部菜单栏 -->
    <div class="designer-toolbar">
      <div class="toolbar-left">
        <el-button type="primary" @click="handleSave" :loading="saving">
          <el-icon><Check /></el-icon> 保存
        </el-button>
        <el-button @click="handleTest">
          <el-icon><VideoPlay /></el-icon> 测试
        </el-button>
        <el-button @click="handlePublish" v-if="ruleData.status !== 'PUBLISHED'">
          <el-icon><Upload /></el-icon> 发布
        </el-button>
        <el-divider direction="vertical" />
        <el-button type="success" plain @click="loadDemoData">
          <el-icon><MagicStick /></el-icon> Demo
        </el-button>
        <el-divider direction="vertical" />
        <el-input v-model="ruleData.ruleName" placeholder="规则名称" class="rule-name-input" size="large">
          <template #prefix><el-icon><EditPen /></el-icon></template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-button link @click="openPropertyDialog"><el-icon><Setting /></el-icon> 规则属性</el-button>
        <el-tag :type="getStatusType(ruleData.status)" size="large" effect="dark">{{ getStatusText(ruleData.status) }}</el-tag>
      </div>
    </div>

    <!-- 主体：el-splitter 嵌套布局（上=设计区三栏，下=测试控制台） -->
    <el-splitter layout="vertical" class="designer-body">
      <!-- 上部：设计区 -->
      <el-splitter-panel>
        <el-splitter class="designer-main">
          <!-- 左侧：节点面板 -->
          <el-splitter-panel collapsible :size="220" min="160" max="400" class="left-pane">
            <NodePanel @add="handleNodeAdd" />
          </el-splitter-panel>

          <!-- 中间：画布舞台 -->
          <el-splitter-panel class="center-pane flex flex-col">
            <div class="canvas-toolbar">
              <span class="canvas-title"><el-icon><Share /></el-icon> 规则设计</span>
              <div class="canvas-actions">
                <el-tooltip content="删除选中" placement="bottom">
                  <el-button link @click="deleteSelected" :disabled="!hasSelected"><el-icon><Delete /></el-icon></el-button>
                </el-tooltip>
                <el-tooltip content="适应画布" placement="bottom">
                  <el-button link @click="fitView"><el-icon><FullScreen /></el-icon></el-button>
                </el-tooltip>
                <el-tooltip content="自动布局" placement="bottom">
                  <el-button link @click="autoLayout"><el-icon><Grid /></el-icon></el-button>
                </el-tooltip>
                <el-tooltip content="清空" placement="bottom">
                  <el-button link @click="clearCanvas"><el-icon><Brush /></el-icon></el-button>
                </el-tooltip>
                <el-divider direction="vertical" />
                <span class="canvas-tip">选中节点按Delete删除 · 右键更多操作</span>
              </div>
            </div>
            <div class="canvas-body" @drop="onDrop" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave" @contextmenu.prevent="onCanvasContextMenu">
              <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                :default-viewport="{ zoom: 1 }"
                :min-zoom="0.2" :max-zoom="2"
                :snap-to-grid="true" :snap-grid="[15, 15]"
                :connection-mode="ConnectionMode.Loose"
                :delete-key-code="['Delete', 'Backspace']"
                :elements-selectable="true"
                :selection-on-drag="true"
                :multi-selection-activated="true"
                :select-nodes-on-drag="true"
                fit-view-on-init
                class="vue-flow-instance"
                :class="{ 'test-mode': isTestMode }"
                @node-double-click="onNodeDoubleClick"
                @node-click="onNodeClick"
                @edge-double-click="onEdgeDoubleClick"
                @connect="onConnect"
              >
                <template #node-start="p"><StartNode v-bind="p" /></template>
                <template #node-end="p"><EndNode v-bind="p" /></template>
                <template #node-condition="p"><ConditionNode v-bind="p" @edit="openConditionDialog(p.id, -1)" @editCondition="(i)=>openConditionDialog(p.id,i)" @deleteCondition="(i)=>deleteCondition(p.id,i)" /></template>
                <template #node-action="p"><ActionNode v-bind="p" @edit="openActionDialog(p.id, -1)" @editAction="(i)=>openActionDialog(p.id,i)" @deleteAction="(i)=>deleteAction(p.id,i)" /></template>
                <template #node-exclusive-gateway="p"><ExclusiveGatewayNode v-bind="p" @edit="openGatewayDialog(p.id)" /></template>
                <template #node-parallel-gateway="p"><ParallelGatewayNode v-bind="p" /></template>
                <template #node-inclusive-gateway="p"><InclusiveGatewayNode v-bind="p" @edit="openGatewayDialog(p.id)" /></template>
                <template #node-variable-assign="p"><VariableAssignNode v-bind="p" @edit="openVariableDialog(p.id)" @editAssignment="(i)=>openVariableDialog(p.id)" @deleteAssignment="(i)=>deleteAssignment(p.id,i)" /></template>
                <template #node-script="p"><ScriptNode v-bind="p" @edit="openScriptDialog(p.id)" /></template>
                <template #node-http-call="p"><HttpCallNode v-bind="p" @edit="openHttpDialog(p.id)" /></template>
                <template #node-rule-set-ref="p"><RuleSetRefNode v-bind="p" @edit="openRuleSetRefDialog(p.id)" /></template>
                <template #node-loop="p"><LoopNode v-bind="p" @edit="openLoopDialog(p.id)" /></template>
                <template #node-join="p"><JoinNode v-bind="p" /></template>
                <template #node-decision-table="p"><DecisionTableNode v-bind="p" /></template>
                <template #node-generic="p"><GenericNode v-bind="p" /></template>
                <Background :gap="20" :size="1" />
                <Controls position="bottom-right" />
                <MiniMap position="bottom-left" />
              </VueFlow>

              <!-- 右键菜单 -->
              <div v-if="contextMenu.visible" class="context-menu" :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
                <template v-if="contextMenu.type === 'node'">
                  <div class="menu-item" @click="handleCtxAction('edit')"><el-icon><Edit /></el-icon><span>编辑节点</span></div>
                  <div class="menu-item" @click="handleCtxAction('copy')"><el-icon><CopyDocument /></el-icon><span>复制节点</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item danger" @click="handleCtxAction('delete')"><el-icon><Delete /></el-icon><span>删除节点</span></div>
                </template>
                <template v-else-if="contextMenu.type === 'edge'">
                  <div class="menu-item" @click="handleCtxAction('editEdge')"><el-icon><Edit /></el-icon><span>编辑连线标签</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item danger" @click="handleCtxAction('delete')"><el-icon><Delete /></el-icon><span>删除连线</span></div>
                </template>
                <template v-else>
                  <div class="menu-item" @click="handleCtxAction('paste')"><el-icon><CopyDocument /></el-icon><span>粘贴节点</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item" @click="handleCtxAction('fitView')"><el-icon><FullScreen /></el-icon><span>适应画布</span></div>
                </template>
              </div>
            </div>
          </el-splitter-panel>

          <!-- 右侧：属性面板 -->
          <el-splitter-panel collapsible :size="320" min="240" max="500" class="right-pane">
            <PropertyPanel
              :selected-node="selectedNode"
              @update="handlePropertyUpdate"
              @edit-condition="openConditionDialog"
              @edit-action="openActionDialog"
              @edit-gateway="openGatewayDialog"
              @edit-script="openScriptDialog"
              @edit-http="openHttpDialog"
              @edit-rule-set-ref="openRuleSetRefDialog"
              @edit-loop="openLoopDialog"
            />
          </el-splitter-panel>
        </el-splitter>
      </el-splitter-panel>

      <!-- 下部：测试控制台（按需显示） -->
      <el-splitter-panel v-if="testConsoleVisible" :size="300" min="150" max="600" class="test-console-panel">
        <div class="test-console">
          <div class="console-header">
            <div class="console-tabs">
              <span class="console-tab"><el-icon><Monitor /></el-icon> 测试控制台</span>
              <el-tag v-if="executionPath"  :type="executionPath.success ? 'success' : 'danger'">
                {{ executionPath.success ? '成功' : '失败' }} · {{ executionPath.duration }}ms · {{ executionPath.visitedNodeIds.length }}节点
              </el-tag>
            </div>
            <div class="console-actions">
              <el-button type="primary"  @click="executeTest" :loading="executing"><el-icon><VideoPlay /></el-icon> 执行</el-button>
              <el-button  @click="stepExecute" :disabled="!executionPath"><el-icon><VideoPause /></el-icon> 单步</el-button>
              <el-button  @click="loadSampleData"><el-icon><DocumentCopy /></el-icon> 示例</el-button>
              <el-button  @click="clearTestResult"><el-icon><Brush /></el-icon> 清除</el-button>
              <el-button  link @click="testConsoleVisible = false"><el-icon><Close /></el-icon></el-button>
            </div>
          </div>
          <div class="console-body">
            <el-splitter class="console-splitter">
              <el-splitter-panel :size="350" resizable collapsible min="200" max="550" >
                <div class="pane-header">
                  <span>输入参数</span>
                  <el-button link  @click="switchToJsonMode">{{ jsonMode ? '表单模式' : 'JSON模式' }}</el-button>
                </div>
                <div class="pane-body">
                  <!-- 表单模式：自动解析参数 -->
                  <div v-if="!jsonMode">
                    <div v-if="testFields.length === 0" class="empty-output">
                      <el-icon :size="28"><Document /></el-icon>
                      <p>暂无可测试参数</p>
                      <p class="hint">添加条件节点后自动解析字段</p>
                    </div>
                    <el-form v-else label-width="100px" labelPosition="top"  class="param-form">
                      <el-form-item v-for="field in testFields" :key="field.name" :label="field.name">
                        <!-- 数字 -->
                        <el-input-number
                          v-if="field.type === 'NUMBER'"
                          v-model="testFormData[field.name]"
                          :controls="false"
                          placeholder="请输入数字"
                          style="width: 100%"
                        />
                        <!-- 日期 -->
                        <el-date-picker
                          v-else-if="field.type === 'DATE'"
                          v-model="testFormData[field.name]"
                          type="datetime"
                          placeholder="选择日期"
                          value-format="YYYY-MM-DD HH:mm:ss"
                          style="width: 100%"
                        />
                        <!-- 布尔 -->
                        <el-select
                          v-else-if="field.type === 'BOOLEAN'"
                          v-model="testFormData[field.name]"
                          style="width: 100%"
                        >
                          <el-option label="是" :value="true" />
                          <el-option label="否" :value="false" />
                        </el-select>
                        <!-- 字符串/数组 -->
                        <el-input
                          v-else
                          v-model="testFormData[field.name]"
                          :placeholder="field.type === 'ARRAY' ? '多个值用逗号分隔' : '请输入值'"
                        />
                        <el-tag  type="info" class="field-type-tag">{{ field.type }}</el-tag>
                      </el-form-item>
                    </el-form>
                  </div>
                  <!-- JSON模式 -->
                  <el-input
                    v-else
                    v-model="testDataStr"
                    type="textarea"
                    :autosize="{ minRows: 4, maxRows: 15 }"
                    placeholder='{"amount": 6000}'
                    class="json-input"
                  />
                </div>
              </el-splitter-panel>
              <el-splitter-panel >
                <div class="pane-header">
                  <span>执行输出</span>
                  <el-radio-group v-if="executionPath" v-model="outputTab" >
                    <el-radio-button value="timeline">时间线</el-radio-button>
                    <el-radio-button value="conditions">条件</el-radio-button>
                    <el-radio-button value="actions">动作</el-radio-button>
                    <el-radio-button value="context">上下文</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="pane-body">
                  <div v-if="!executionPath" class="empty-output"><el-icon :size="32"><Cpu /></el-icon><p>点击执行按钮运行规则</p></div>
                  <div v-else-if="outputTab === 'timeline'" class="output-content">
                    <el-timeline>
                      <el-timeline-item v-for="(step, idx) in displaySteps" :key="idx" :type="getStepType(step.status)" :timestamp="`+${step.timestamp - executionPath.steps[0].timestamp}ms`" placement="top" size="large">
                        <div class="step-card" :class="{ 'step-current': isStepping && idx === stepIndex }">
                          <div class="step-header">
                            <el-tag :type="getStepType(step.status)"  effect="dark">{{ step.status }}</el-tag>
                            <span class="step-node-name">{{ step.nodeName }}</span>
                            <span class="step-node-type">[{{ step.nodeType }}]</span>
                            <span class="step-duration">{{ step.duration || 0 }}ms</span>
                          </div>
                          <div class="step-message">{{ step.message }}</div>
                        </div>
                      </el-timeline-item>
                    </el-timeline>
                  </div>
                  <div v-else-if="outputTab === 'conditions'" class="output-content">
                    <div v-for="cond in executionPath.conditionResults" :key="cond.nodeId" class="cond-item">
                      <el-tag :type="cond.passed ? 'success' : 'info'"  effect="dark">{{ cond.passed ? '✓ 满足' : '✗ 不满足' }}</el-tag>
                      <pre class="cond-detail">{{ cond.detail }}</pre>
                    </div>
                  </div>
                  <div v-else-if="outputTab === 'actions'" class="output-content">
                    <el-table :data="executionPath.actionResults" border  stripe>
                      <el-table-column prop="actionType" label="动作类型" width="120" />
                      <el-table-column prop="targetField" label="目标字段" width="160" />
                      <el-table-column prop="success" label="状态" width="80"><template #default="{ row }"><el-tag :type="row.success ? 'success' : 'danger'" >{{ row.success ? '成功' : '失败' }}</el-tag></template></el-table-column>
                      <el-table-column prop="message" label="消息" show-overflow-tooltip />
                    </el-table>
                  </div>
                  <div v-else-if="outputTab === 'context'" class="output-content">
                    <pre class="json-output">{{ formatJson(executionPath.context) }}</pre>
                  </div>
                </div>
              </el-splitter-panel>
            </el-splitter>
          </div>
        </div>
      </el-splitter-panel>
    </el-splitter>


  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, VideoPlay, Upload, EditPen, Setting, Share, FullScreen, Grid, Delete, Brush, Edit, CopyDocument, MagicStick, Monitor, Close, VideoPause, DocumentCopy, Cpu, InfoFilled } from '@element-plus/icons-vue'
import { VueFlow, useVueFlow, ConnectionMode, type Node, type Edge } from '@vue-flow/core'
import { Background, Controls, MiniMap } from '@vue-flow/additional-components'
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import { ruleActionApi, ruleConditionApi, ruleDefinitionApi } from '@/api/rule_engine_api'
import NodePanel from './NodePanel.vue'
import PropertyPanel from './PropertyPanel.vue'
import StartNode from './nodes/StartNode.vue'
import EndNode from './nodes/EndNode.vue'
import ConditionNode from './nodes/ConditionNode.vue'
import ActionNode from './nodes/ActionNode.vue'
import ExclusiveGatewayNode from './nodes/ExclusiveGatewayNode.vue'
import ParallelGatewayNode from './nodes/ParallelGatewayNode.vue'
import InclusiveGatewayNode from './nodes/InclusiveGatewayNode.vue'
import VariableAssignNode from './nodes/VariableAssignNode.vue'
import ScriptNode from './nodes/ScriptNode.vue'
import HttpCallNode from './nodes/HttpCallNode.vue'
import RuleSetRefNode from './nodes/RuleSetRefNode.vue'
import LoopNode from './nodes/LoopNode.vue'
import JoinNode from './nodes/JoinNode.vue'
import DecisionTableNode from './nodes/DecisionTableNode.vue'
import GenericNode from './nodes/GenericNode.vue'
import { NODE_TYPE_MAP, getNodeDefaultData, getNodeLabel } from './nodeTypes'
import ConditionEditDialog from './dialogs/ConditionEditDialog.vue'
import ActionEditDialog from './dialogs/ActionEditDialog.vue'
import GatewayConfigDialog from './dialogs/GatewayConfigDialog.vue'
import VariableAssignDialog from './dialogs/VariableAssignDialog.vue'
import ScriptEditDialog from './dialogs/ScriptEditDialog.vue'
import HttpCallDialog from './dialogs/HttpCallDialog.vue'
import RuleSetRefDialog from './dialogs/RuleSetRefDialog.vue'
import LoopConfigDialog from './dialogs/LoopConfigDialog.vue'
import RulePropertyDialog from './dialogs/RulePropertyDialog.vue'
import ExecutionLogViewer from './ExecutionLogViewer.vue'
import { executeRuleFlow, type ExecutionPath } from './engine/RuleExecutor'

const props = defineProps<{ ruleId?: string }>()
const emit = defineEmits<{ (e: 'saved'): void; (e: 'close'): void }>()
const route = useRoute()
const ruleId = computed(() => props.ruleId || (route?.params?.id as string))
const { fitView: fitViewFn, screenToFlowCoordinate, addEdges, addNodes, removeNodes, removeEdges } = useVueFlow()

const saving = ref(false)
const nodes = ref<Node[]>([])
const edges = ref<Edge[]>([])
const selectedNode = ref<any>(null)

// 弹窗
const conditionDialogVisible = ref(false)
const actionDialogVisible = ref(false)
const gatewayDialogVisible = ref(false)
const variableDialogVisible = ref(false)
const scriptDialogVisible = ref(false)
const httpDialogVisible = ref(false)
const ruleSetRefDialogVisible = ref(false)
const loopDialogVisible = ref(false)
const propertyDialogVisible = ref(false)
const edgeLabelDialogVisible = ref(false)
const editingNodeId = ref('')
const editingCondition = ref<any>(null)
const editingConditionIndex = ref(-1)
const editingAction = ref<any>(null)
const editingActionIndex = ref(-1)
const editingGateway = ref<any>(null)
const editingAssignments = ref<any[]>([])
const editingScript = ref<any>(null)
const editingHttpConfig = ref<any>(null)
const editingRuleSetRef = ref<any>(null)
const editingLoopConfig = ref<any>(null)
const editingEdge = ref<any>(null)
const edgeLabel = ref('')

// 测试控制台
const testConsoleVisible = ref(false)
const testDataStr = ref('')
const executing = ref(false)
const executionPath = ref<ExecutionPath | null>(null)
const stepIndex = ref(0)
const isStepping = ref(false)
const outputTab = ref('timeline')
const jsonMode = ref(false)
const testFormData = reactive<Record<string, any>>({})

// 自动从条件节点解析测试参数
const testFields = computed(() => {
  const fields: { name: string; type: string }[] = []
  const seen = new Set<string>()
  nodes.value.forEach((n: any) => {
    if (n.type === 'condition' && n.data?.conditions) {
      n.data.conditions.forEach((c: any) => {
        if (c.fieldName && !seen.has(c.fieldName)) {
          seen.add(c.fieldName)
          fields.push({ name: c.fieldName, type: c.fieldType || 'STRING' })
        }
      })
    }
    if (n.type === 'variable-assign' && n.data?.assignments) {
      n.data.assignments.forEach((a: any) => {
        if (a.variableName && !seen.has(a.variableName)) {
          seen.add(a.variableName)
          fields.push({ name: a.variableName, type: 'STRING' })
        }
      })
    }
  })
  return fields
})

// 右键菜单
const contextMenu = reactive({ visible: false, x: 0, y: 0, type: 'pane' as 'node' | 'edge' | 'pane', nodeId: '', edgeId: '' })
const clipboard = ref<Node | null>(null)

const ruleData = reactive({
  idRuleDefinition: '', ruleCode: '', ruleName: '', ruleDesc: '',
  ruleType: 'FORM_LINKAGE', ruleCategory: '', priority: 0, enabled: 'Y',
  conditionLogic: 'AND', status: 'DRAFT', formId: '', flowContent: ''
})

const nodeDefaultData: Record<string, () => any> = {
  'start': () => ({}),
  'end': () => ({}),
  'condition': () => ({ conditions: [], logic: 'AND' }),
  'action': () => ({ actions: [] }),
  'exclusive-gateway': () => ({ name: '排他网关', gatewayType: 'XOR', branches: [] }),
  'parallel-gateway': () => ({ name: '并行网关' }),
  'inclusive-gateway': () => ({ name: '包容网关', gatewayType: 'OR', branches: [] }),
  'variable-assign': () => ({ assignments: [] }),
}
const nodeLabels: Record<string, string> = {
  'start': '开始', 'end': '结束', 'condition': '条件判断', 'action': '执行动作',
  'exclusive-gateway': '排他网关', 'parallel-gateway': '并行网关', 'inclusive-gateway': '包容网关',
  'variable-assign': '变量赋值',
}
// 基础节点类型（有专用组件）
const BASIC_NODE_TYPES = new Set(['start', 'end', 'condition', 'action', 'exclusive-gateway', 'parallel-gateway', 'inclusive-gateway', 'variable-assign', 'loop', 'join', 'decision-table'])
let nodeIdCounter = 0
const generateNodeId = (type: string) => { nodeIdCounter++; return `${type}_${Date.now()}_${nodeIdCounter}` }

const initDefaultFlow = () => {
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 50 }, data: {} },
    { id: 'end_1', type: 'end', position: { x: 400, y: 400 }, data: {} }
  ]
  edges.value = []
}

// ========== 拖拽创建 ==========
const onDragOver = (e: DragEvent) => { e.preventDefault(); if (e.dataTransfer) e.dataTransfer.dropEffect = 'move' }
const onDragLeave = (e: DragEvent) => { e.preventDefault() }
const onDrop = (e: DragEvent) => {
  e.preventDefault()
  const nodeType = e.dataTransfer?.getData('application/vueflow')
  if (!nodeType) return
  const position = screenToFlowCoordinate({ x: e.clientX, y: e.clientY })
  let newNode: Node
  if (BASIC_NODE_TYPES.has(nodeType)) {
    // 基础节点用专用组件
    newNode = { id: generateNodeId(nodeType), type: nodeType, position, data: nodeDefaultData[nodeType] ? nodeDefaultData[nodeType]() : {} }
  } else {
    // 企业级节点用generic组件，实际类型存在data.__nodeType中
    const defaultData = getNodeDefaultData(nodeType)
    newNode = { id: generateNodeId(nodeType), type: 'generic', position, data: { ...defaultData, __nodeType: nodeType } }
  }
  addNodes(newNode)
  ElMessage.success(`已添加 ${getNodeLabel(nodeType)}`)
}

const onConnect = (c: any) => {
  const sourceNode = nodes.value.find(n => n.id === c.source)
  const targetNode = nodes.value.find(n => n.id === c.target)
  if (!sourceNode || !targetNode) return

  // 根据源节点类型自动生成边标签
  let label = ''
  let labelStyle = { fill: '#64748b', fontSize: 11, fontWeight: 500 }
  const sourceType = sourceNode.type === 'generic' ? sourceNode.data.__nodeType : sourceNode.type

  switch (sourceType) {
    case 'condition': {
      // 条件节点：第一条出边标注"满足✓"，第二条标注"不满足✗"
      const outEdges = edges.value.filter(e => e.source === c.source)
      if (outEdges.length === 0) {
        label = '满足 ✓'
        labelStyle = { fill: '#10b981', fontSize: 11, fontWeight: 600 }
      } else {
        label = '不满足 ✗'
        labelStyle = { fill: '#ef4444', fontSize: 11, fontWeight: 600 }
      }
      break
    }
    case 'exclusive-gateway': {
      // 排他网关：根据分支配置自动生成条件摘要
      const branches = sourceNode.data.branches || []
      const outEdges = edges.value.filter(e => e.source === c.source)
      const branchIndex = outEdges.length
      if (branchIndex < branches.length) {
        const branch = branches[branchIndex]
        label = branch.condition || branch.label || `分支${branchIndex + 1}`
      } else {
        label = '默认分支'
      }
      labelStyle = { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'parallel-gateway': {
      label = '并行执行'
      labelStyle = { fill: '#06b6d4', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'inclusive-gateway': {
      const branches = sourceNode.data.branches || []
      const outEdges = edges.value.filter(e => e.source === c.source)
      const branchIndex = outEdges.length
      if (branchIndex < branches.length) {
        const branch = branches[branchIndex]
        label = branch.condition || branch.label || `分支${branchIndex + 1}`
      } else {
        label = '默认分支'
      }
      labelStyle = { fill: '#8b5cf6', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'variable-assign': {
      const assignments = sourceNode.data.assignments || []
      if (assignments.length > 0) {
        label = `设置 ${assignments.map(a => a.variableName).join(', ')}`
      } else {
        label = '变量赋值'
      }
      labelStyle = { fill: '#6366f1', fontSize: 11, fontWeight: 500 }
      break
    }
    case 'action': {
      const actions = sourceNode.data.actions || []
      if (actions.length > 0) {
        label = `${actions.length}个动作`
      } else {
        label = '执行动作'
      }
      break
    }
    case 'loop': {
      label = `遍历 ${sourceNode.data.collectionVar || '集合'}`
      break
    }
    case 'script': {
      label = '执行脚本'
      break
    }
    case 'http-call': {
      label = `${sourceNode.data.method || 'GET'} ${sourceNode.data.url || '接口'}`
      break
    }
    default: {
      // 其他节点：显示节点类型
      const nodeLabel = getNodeLabel(sourceType)
      label = nodeLabel || sourceType
    }
  }

  addEdges({
    id: `e_${c.source}_${c.target}_${Date.now()}`,
    source: c.source,
    target: c.target,
    label,
    labelStyle,
    labelShowBg: true,
    labelBgStyle: { fill: '#fff', fillOpacity: 0.9 },
    animated: true,
    style: { stroke: '#6366f1', strokeWidth: 2 },
    data: { manualLabel: false } // 标记为自动生成，可被用户编辑覆盖
  })
}

// 点击节点库添加节点
const handleNodeAdd = (nodeType: string) => {
  const offset = nodes.value.length * 30
  const position = { x: 350 + offset % 300, y: 150 + Math.floor(offset / 300) * 120 }
  let newNode: Node
  if (BASIC_NODE_TYPES.has(nodeType)) {
    newNode = { id: generateNodeId(nodeType), type: nodeType, position, data: nodeDefaultData[nodeType] ? nodeDefaultData[nodeType]() : {} }
  } else {
    newNode = { id: generateNodeId(nodeType), type: 'generic', position, data: { ...getNodeDefaultData(nodeType), __nodeType: nodeType } }
  }
  addNodes(newNode)
  ElMessage.success(`已添加 ${getNodeLabel(nodeType)}`)
}

// ========== 节点选中 ==========
const onNodeClick = (params: any) => {
  closeContextMenu()
  selectedNode.value = params.node
}
const onNodeDoubleClick = (params: any) => {
  const { id, type } = params.node
  editingNodeId.value = id
  switch (type) {
    case 'condition': openConditionDialog(id, -1); break
    case 'action': openActionDialog(id, -1); break
    case 'exclusive-gateway': case 'inclusive-gateway': openGatewayDialog(id); break
    case 'variable-assign': openVariableDialog(id); break
    case 'script': openScriptDialog(id); break
    case 'http-call': openHttpDialog(id); break
    case 'rule-set-ref': openRuleSetRefDialog(id); break
    case 'loop': openLoopDialog(id); break
  }
}

// 双击边编辑标签
const onEdgeDoubleClick = (params: any) => {
  const edge = params.edge
  if (edge) {
    editingEdge.value = edge
    edgeLabel.value = (edge.label as string) || ''
    edgeLabelDialogVisible.value = true
  }
}

const handlePropertyUpdate = (nodeId: string, data: any) => {
  const node = nodes.value.find(n => n.id === nodeId)
  if (node) {
    node.data = { ...node.data, ...data }
    selectedNode.value = { ...node }
  }
}

// ========== 数据操作 ==========
const getNodeData = (id: string) => nodes.value.find(n => n.id === id)?.data || {}
const updateNodeData = (id: string, data: any) => { const n = nodes.value.find(n => n.id === id); if (n) n.data = { ...n.data, ...data } }

const openConditionDialog = (nodeId: string, index: number) => {
  editingNodeId.value = nodeId; editingConditionIndex.value = index
  const data = getNodeData(nodeId)
  editingCondition.value = index >= 0 ? { ...data.conditions[index] } : null
  conditionDialogVisible.value = true
}
const handleConditionSave = (c: any) => {
  const data = getNodeData(editingNodeId.value)
  const list = [...(data.conditions || [])]
  if (editingConditionIndex.value >= 0) list[editingConditionIndex.value] = c; else list.push(c)
  updateNodeData(editingNodeId.value, { conditions: list })
  conditionDialogVisible.value = false
  if (selectedNode.value?.id === editingNodeId.value) selectedNode.value = { ...selectedNode.value, data: { ...data, conditions: list } }
}
const deleteCondition = (nodeId: string, i: number) => { const d = getNodeData(nodeId); const l = [...(d.conditions || [])]; l.splice(i, 1); updateNodeData(nodeId, { conditions: l }) }

const openActionDialog = (nodeId: string, index: number) => {
  editingNodeId.value = nodeId; editingActionIndex.value = index
  const data = getNodeData(nodeId)
  editingAction.value = index >= 0 ? { ...data.actions[index] } : null
  actionDialogVisible.value = true
}
const handleActionSave = (a: any) => {
  const data = getNodeData(editingNodeId.value)
  const list = [...(data.actions || [])]
  if (editingActionIndex.value >= 0) list[editingActionIndex.value] = a; else list.push(a)
  updateNodeData(editingNodeId.value, { actions: list })
  actionDialogVisible.value = false
  if (selectedNode.value?.id === editingNodeId.value) selectedNode.value = { ...selectedNode.value, data: { ...data, actions: list } }
}
const deleteAction = (nodeId: string, i: number) => { const d = getNodeData(nodeId); const l = [...(d.actions || [])]; l.splice(i, 1); updateNodeData(nodeId, { actions: l }) }

const openGatewayDialog = (id: string) => { editingNodeId.value = id; const d = getNodeData(id); editingGateway.value = { name: d.name || '网关', gatewayType: d.gatewayType || 'XOR', branches: d.branches ? JSON.parse(JSON.stringify(d.branches)) : [] }; gatewayDialogVisible.value = true }
const handleGatewaySave = (g: any) => { updateNodeData(editingNodeId.value, g); gatewayDialogVisible.value = false }

const openVariableDialog = (id: string) => { editingNodeId.value = id; const d = getNodeData(id); editingAssignments.value = d.assignments ? JSON.parse(JSON.stringify(d.assignments)) : []; variableDialogVisible.value = true }
const handleVariableSave = (a: any[]) => { updateNodeData(editingNodeId.value, { assignments: a }); variableDialogVisible.value = false }
const deleteAssignment = (nodeId: string, i: number) => { const d = getNodeData(nodeId); const l = [...(d.assignments || [])]; l.splice(i, 1); updateNodeData(nodeId, { assignments: l }) }

const openScriptDialog = (id: string) => { editingNodeId.value = id; const d = getNodeData(id); editingScript.value = { scriptLang: d.scriptLang || 'javascript', scriptContent: d.scriptContent || '' }; scriptDialogVisible.value = true }
const handleScriptSave = (s: any) => { updateNodeData(editingNodeId.value, s); scriptDialogVisible.value = false }

const openHttpDialog = (id: string) => { editingNodeId.value = id; editingHttpConfig.value = JSON.parse(JSON.stringify(getNodeData(id))); httpDialogVisible.value = true }
const handleHttpSave = (c: any) => { updateNodeData(editingNodeId.value, c); httpDialogVisible.value = false }

const openRuleSetRefDialog = (id: string) => { editingNodeId.value = id; editingRuleSetRef.value = JSON.parse(JSON.stringify(getNodeData(id))); ruleSetRefDialogVisible.value = true }
const handleRuleSetRefSave = (c: any) => { updateNodeData(editingNodeId.value, c); ruleSetRefDialogVisible.value = false }

const openLoopDialog = (id: string) => { editingNodeId.value = id; editingLoopConfig.value = JSON.parse(JSON.stringify(getNodeData(id))); loopDialogVisible.value = true }
const handleLoopSave = (c: any) => { updateNodeData(editingNodeId.value, c); loopDialogVisible.value = false }

const openPropertyDialog = () => { propertyDialogVisible.value = true }
const handlePropertySave = (d: any) => { Object.assign(ruleData, d); propertyDialogVisible.value = false }

const handleEdgeLabelSave = () => { 
  if (editingEdge.value) { 
    editingEdge.value.label = edgeLabel.value
    editingEdge.value.labelShowBg = true
    // 标记为手动编辑，后续自动更新不会覆盖
    if (!editingEdge.value.data) editingEdge.value.data = {}
    // 如果用户清空了标签，恢复自动生成逻辑
    if (!edgeLabel.value || edgeLabel.value.trim() === '') {
      editingEdge.value.data.manualLabel = false
      // 立即触发自动更新
      const sourceNode = nodes.value.find(n => n.id === editingEdge.value.source)
      if (sourceNode) {
        const outEdges = edges.value.filter(e => e.source === editingEdge.value.source)
        const edgeIndex = outEdges.findIndex(e => e.id === editingEdge.value.id)
        if (edgeIndex >= 0) {
          const { label, labelStyle } = generateEdgeLabel(sourceNode, edgeIndex)
          editingEdge.value.label = label
          editingEdge.value.labelStyle = labelStyle
        }
      }
    } else {
      editingEdge.value.data.manualLabel = true
    }
  } 
  edgeLabelDialogVisible.value = false 
}

// ========== 边标签自动同步 ==========
// 根据节点类型和配置自动生成边标签
const generateEdgeLabel = (sourceNode: any, edgeIndex: number): { label: string; labelStyle: any } => {
  const sourceType = sourceNode.type === 'generic' ? sourceNode.data.__nodeType : sourceNode.type
  let label = ''
  let labelStyle = { fill: '#64748b', fontSize: 11, fontWeight: 500 }

  switch (sourceType) {
    case 'condition': {
      // 条件节点：第一条出边标注"满足✓"，第二条标注"不满足✗"
      if (edgeIndex === 0) {
        label = '满足 ✓'
        labelStyle = { fill: '#10b981', fontSize: 11, fontWeight: 600 }
      } else {
        label = '不满足 ✗'
        labelStyle = { fill: '#ef4444', fontSize: 11, fontWeight: 600 }
      }
      break
    }
    case 'exclusive-gateway': {
      // 排他网关：根据分支配置自动生成条件摘要
      const branches = sourceNode.data.branches || []
      if (edgeIndex < branches.length) {
        const branch = branches[edgeIndex]
        label = branch.condition || branch.label || `分支${edgeIndex + 1}`
      } else {
        label = '默认分支'
      }
      labelStyle = { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'parallel-gateway': {
      label = '并行执行'
      labelStyle = { fill: '#06b6d4', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'inclusive-gateway': {
      const branches = sourceNode.data.branches || []
      if (edgeIndex < branches.length) {
        const branch = branches[edgeIndex]
        label = branch.condition || branch.label || `分支${edgeIndex + 1}`
      } else {
        label = '默认分支'
      }
      labelStyle = { fill: '#8b5cf6', fontSize: 11, fontWeight: 600 }
      break
    }
    case 'variable-assign': {
      const assignments = sourceNode.data.assignments || []
      if (assignments.length > 0) {
        label = `设置 ${assignments.map(a => a.variableName).join(', ')}`
      } else {
        label = '变量赋值'
      }
      labelStyle = { fill: '#6366f1', fontSize: 11, fontWeight: 500 }
      break
    }
    case 'action': {
      const actions = sourceNode.data.actions || []
      if (actions.length > 0) {
        label = `${actions.length}个动作`
      } else {
        label = '执行动作'
      }
      break
    }
    case 'loop': {
      label = `遍历 ${sourceNode.data.collectionVar || '集合'}`
      break
    }
    case 'script': {
      label = '执行脚本'
      break
    }
    case 'http-call': {
      label = `${sourceNode.data.method || 'GET'} ${sourceNode.data.url || '接口'}`
      break
    }
    default: {
      const nodeLabel = getNodeLabel(sourceType)
      label = nodeLabel || sourceType
    }
  }

  return { label, labelStyle }
}

// 更新指定节点的所有出边标签（跳过手动编辑过的边）
const updateEdgeLabelsForNode = (nodeId: string) => {
  const sourceNode = nodes.value.find(n => n.id === nodeId)
  if (!sourceNode) return

  const outEdges = edges.value.filter(e => e.source === nodeId)
  outEdges.forEach((edge, index) => {
    // 如果边被手动编辑过，跳过自动更新
    if (edge.data?.manualLabel) return
    
    const { label, labelStyle } = generateEdgeLabel(sourceNode, index)
    edge.label = label
    edge.labelStyle = labelStyle
    edge.labelShowBg = true
    edge.labelBgStyle = { fill: '#fff', fillOpacity: 0.9 }
  })
}

// 监听节点数据变化，自动更新边标签
watch(() => nodes.value, (newNodes) => {
  // 遍历所有节点，更新其出边标签
  newNodes.forEach(node => {
    const nodeType = node.type === 'generic' ? node.data.__nodeType : node.type
    // 只对需要自动生成边标签的节点类型进行处理
    if (['condition', 'exclusive-gateway', 'inclusive-gateway', 'parallel-gateway', 'variable-assign', 'action', 'loop', 'script', 'http-call'].includes(nodeType)) {
      updateEdgeLabelsForNode(node.id)
    }
  })
}, { deep: true })

// ========== 右键菜单 ==========
const onCanvasContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  const nodeEl = target.closest('.vue-flow__node')
  const edgeEl = target.closest('.vue-flow__edge')
  contextMenu.visible = true; contextMenu.x = e.clientX; contextMenu.y = e.clientY
  if (nodeEl) { const id = nodeEl.getAttribute('data-id') || ''; contextMenu.type = 'node'; contextMenu.nodeId = id; contextMenu.edgeId = ''; nodes.value.forEach(n => { n.selected = n.id === id }) }
  else if (edgeEl) { const id = edgeEl.getAttribute('data-id') || ''; contextMenu.type = 'edge'; contextMenu.nodeId = ''; contextMenu.edgeId = id; edges.value.forEach(e2 => { e2.selected = e2.id === id }) }
  else { contextMenu.type = 'pane'; contextMenu.nodeId = ''; contextMenu.edgeId = '' }
}
const closeContextMenu = () => { contextMenu.visible = false }
const handleCtxAction = (action: string) => {
  const { type, nodeId, edgeId } = contextMenu
  switch (action) {
    case 'edit': if (nodeId) { const n = nodes.value.find(n => n.id === nodeId); if (n) onNodeDoubleClick({ node: n }) } break
    case 'copy': if (nodeId) { const n = nodes.value.find(n => n.id === nodeId); if (n) { clipboard.value = JSON.parse(JSON.stringify(n)); ElMessage.success('已复制') } } break
    case 'paste': if (clipboard.value) { addNodes({ ...JSON.parse(JSON.stringify(clipboard.value)), id: generateNodeId(clipboard.value.type || 'node'), position: { x: clipboard.value.position.x + 60, y: clipboard.value.position.y + 60 }, selected: false }); ElMessage.success('已粘贴') } else ElMessage.warning('剪贴板为空'); break
    case 'delete': if (type === 'node' && nodeId) { edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId); removeNodes([nodeId]); ElMessage.success('已删除') } else if (type === 'edge' && edgeId) { removeEdges([edgeId]); ElMessage.success('已删除') } break
    case 'editEdge': if (edgeId) { const e = edges.value.find(e => e.id === edgeId); if (e) { editingEdge.value = e; edgeLabel.value = (e.label as string) || ''; edgeLabelDialogVisible.value = true } } break
    case 'fitView': fitViewFn({ duration: 300 }); break
  }
  closeContextMenu()
}

// ========== 删除选中 ==========
const hasSelected = computed(() => nodes.value.some(n => n.selected) || edges.value.some(e => e.selected))
const deleteSelected = () => {
  const sn = nodes.value.filter(n => n.selected)
  const se = edges.value.filter(e => e.selected)
  if (!sn.length && !se.length) { ElMessage.warning('请先选中'); return }
  if (sn.length) { const ids = sn.map(n => n.id); edges.value = edges.value.filter(e => !ids.includes(e.source) && !ids.includes(e.target)); removeNodes(ids) }
  if (se.length) removeEdges(se.map(e => e.id))
  ElMessage.success(`已删除 ${sn.length} 节点, ${se.length} 连线`)
}

// ========== 画布操作 ==========
const fitView = () => fitViewFn({ duration: 300 })
const autoLayout = () => {
  const startNodes = nodes.value.filter(n => n.type === 'start')
  const visited = new Set<string>(); const levels: Record<string, number> = {}
  const queue = startNodes.map(n => ({ id: n.id, level: 0 }))
  while (queue.length) { const { id, level } = queue.shift()!; if (visited.has(id)) continue; visited.add(id); levels[id] = level; edges.value.filter(e => e.source === id).forEach(e => { if (!visited.has(e.target)) queue.push({ id: e.target, level: level + 1 }) }) }
  nodes.value.forEach(n => { if (!(n.id in levels)) levels[n.id] = 0 })
  const groups: Record<number, string[]> = {}
  Object.entries(levels).forEach(([id, lv]) => { if (!groups[lv]) groups[lv] = []; groups[lv].push(id) })
  Object.entries(groups).forEach(([lv, ids]) => { const l = parseInt(lv); ids.forEach((id, i) => { const n = nodes.value.find(n => n.id === id); if (n) n.position = { x: 400 + (i - ids.length / 2) * 280, y: 50 + l * 180 } }) })
  setTimeout(() => fitViewFn({ duration: 300 }), 100)
  ElMessage.success('已自动布局')
}
const clearCanvas = async () => { await ElMessageBox.confirm('确定清空画布？', '警告', { type: 'warning' }); nodes.value = []; edges.value = []; initDefaultFlow() }

// ========== 高亮 ==========
const isTestMode = ref(false)
const handleHighlightPath = (path: any) => {
  isTestMode.value = true
  const nodeIds = new Set(path.visitedNodeIds); const edgeIds = new Set(path.visitedEdgeIds)
  nodes.value.forEach(n => { const v = nodeIds.has(n.id); if (n.data) { n.data.__highlighted = v; n.data.__dimmed = !v }; n.class = v ? 'node-highlighted' : (path.visitedNodeIds.length ? 'node-dimmed' : '') })
  edges.value.forEach(e => { const v = edgeIds.has(e.id); if (v) { e.animated = true; e.style = { stroke: '#10b981', strokeWidth: 3 }; e.class = 'edge-highlighted' } else { e.animated = false; e.style = { stroke: '#cbd5e1', strokeWidth: 1 }; e.class = path.visitedEdgeIds.length ? 'edge-dimmed' : '' } })
}
const handleResetHighlight = () => {
  isTestMode.value = false
  nodes.value.forEach(n => { if (n.data) { delete n.data.__highlighted; delete n.data.__dimmed }; n.class = '' })
  edges.value.forEach(e => { e.animated = true; e.style = { stroke: '#6366f1', strokeWidth: 2 }; e.class = '' })
}

// ========== 测试控制台 ==========
const displaySteps = computed(() => { if (!executionPath.value) return []; return isStepping.value ? executionPath.value.steps.slice(0, stepIndex.value + 1) : executionPath.value.steps })
const executeTest = async () => {
  let d: any
  if (jsonMode.value) {
    if (!testDataStr.value.trim()) { ElMessage.warning('请输入测试数据'); return }
    try { d = JSON.parse(testDataStr.value) } catch { ElMessage.error('JSON格式错误'); return }
  } else {
    // 表单模式：从testFormData构建
    d = {}
    testFields.value.forEach(f => {
      const val = testFormData[f.name]
      if (val !== undefined && val !== '') {
        if (f.type === 'NUMBER') d[f.name] = Number(val)
        else if (f.type === 'ARRAY') d[f.name] = String(val).split(',').map(s => s.trim())
        else if (f.type === 'BOOLEAN') d[f.name] = val
        else d[f.name] = val
      }
    })
  }
  executing.value = true; isStepping.value = false
  try { await new Promise(r => setTimeout(r, 200)); const r = executeRuleFlow(nodes.value, edges.value, d); executionPath.value = r; handleHighlightPath(r); outputTab.value = 'timeline'; ElMessage.success(`执行完成，经过 ${r.visitedNodeIds.length} 节点`) } catch (e: any) { ElMessage.error('执行失败: ' + e.message) } finally { executing.value = false }
}
const stepExecute = () => {
  if (!executionPath.value) return
  if (!isStepping.value) { isStepping.value = true; stepIndex.value = 0 } else if (stepIndex.value < executionPath.value.steps.length - 1) stepIndex.value++; else { ElMessage.info('已到最后一步'); return }
  handleHighlightPath({ ...executionPath.value, visitedNodeIds: executionPath.value.visitedNodeIds.slice(0, stepIndex.value + 1), visitedEdgeIds: executionPath.value.visitedEdgeIds.slice(0, stepIndex.value + 1), steps: executionPath.value.steps.slice(0, stepIndex.value + 1) })
}
const clearTestResult = () => { isStepping.value = false; executionPath.value = null; handleResetHighlight() }
const loadSampleData = () => {
  if (jsonMode.value) {
    const d: any = {}
    testFields.value.forEach(f => { d[f.name] = f.type === 'NUMBER' ? 100 : 'sample' })
    if (!Object.keys(d).length) { d.amount = 6000; d.userType = 'vip' }
    testDataStr.value = JSON.stringify(d, null, 2)
  } else {
    // 表单模式：填充默认值
    testFields.value.forEach(f => {
      if (f.type === 'NUMBER') testFormData[f.name] = 100
      else if (f.type === 'BOOLEAN') testFormData[f.name] = true
      else testFormData[f.name] = 'sample'
    })
  }
  ElMessage.success('已加载示例数据')
}

const switchToJsonMode = () => {
  if (!jsonMode.value) {
    // 切到JSON模式：把表单数据序列化
    const d: any = {}
    testFields.value.forEach(f => {
      const val = testFormData[f.name]
      if (val !== undefined && val !== '') d[f.name] = val
    })
    testDataStr.value = JSON.stringify(d, null, 2)
  }
  jsonMode.value = !jsonMode.value
}
const getStepType = (s: string) => s === 'SUCCESS' ? 'success' : s === 'FAILED' ? 'danger' : s === 'SKIPPED' ? 'info' : 'primary'
const formatJson = (o: any) => { try { return JSON.stringify(o, null, 2) } catch { return String(o) } }
const formatJsonInput = () => { try { testDataStr.value = JSON.stringify(JSON.parse(testDataStr.value), null, 2); ElMessage.success('已格式化') } catch { ElMessage.error('JSON格式错误') } }

// ========== 数据加载保存 ==========
const allConditions = computed(() => { const c: any[] = []; nodes.value.filter(n => n.type === 'condition').forEach(n => (n.data.conditions || []).forEach((cond: any) => c.push({ ...cond, logic: n.data.logic || 'AND' }))); return c })
const allActions = computed(() => { const a: any[] = []; nodes.value.filter(n => n.type === 'action').forEach(n => (n.data.actions || []).forEach((act: any) => a.push(act))); return a })

const loadRuleData = async () => {
  if (!ruleId.value) { initDefaultFlow(); return }
  try {
    const res = await ruleDefinitionApi.getRuleById(ruleId.value)
    if (res.data.code === 200 && res.data.data) {
      Object.assign(ruleData, res.data.data)
      if (ruleData.flowContent) { try { const f = JSON.parse(ruleData.flowContent); nodes.value = f.nodes || []; edges.value = f.edges || [] } catch { initDefaultFlow() } }
      else { initDefaultFlow() }
    }
  } catch { ElMessage.error('加载失败'); initDefaultFlow() }
}

const handleSave = async () => {
  if (!ruleData.ruleCode || !ruleData.ruleName) { ElMessage.warning('请填写规则编码和名称'); return }
  saving.value = true
  try {
    ruleData.flowContent = JSON.stringify({ nodes: nodes.value.map(n => ({ ...n, selected: false })), edges: edges.value.map(e => ({ ...e, selected: false })) })
    let id = ruleData.idRuleDefinition
    if (id) await ruleDefinitionApi.updateRule(ruleData)
    else { const r = await ruleDefinitionApi.saveRule(ruleData); if (r.data.code === 200) { id = r.data.data; ruleData.idRuleDefinition = id } }
    await ruleConditionApi.deleteByRuleId(id)
    const cs = allConditions.value
    if (cs.length) await ruleConditionApi.batchSaveConditions(cs.map((c, i) => ({ ...c, idRuleDefinition: id, conditionIndex: i })))
    await ruleActionApi.deleteByRuleId(id)
    const as = allActions.value
    if (as.length) await ruleActionApi.batchSaveActions(as.map((a, i) => ({ ...a, idRuleDefinition: id, actionIndex: i })))
    ElMessage.success('保存成功'); emit('saved')
  } catch { ElMessage.error('保存失败') } finally { saving.value = false }
}

const handleTest = () => { if (!nodes.value.length) { ElMessage.warning('流程图为空'); return } testConsoleVisible.value = true }
const handlePublish = async () => { await ElMessageBox.confirm('确定发布？', '提示', { type: 'warning' }); try { ruleData.status = 'PUBLISHED'; await ruleDefinitionApi.updateRule(ruleData); ElMessage.success('发布成功') } catch { ElMessage.error('发布失败') } }

const getStatusType = (s: string) => ({ DRAFT: 'info', PUBLISHED: 'success', DISABLED: 'danger' }[s] || 'info')
const getStatusText = (s: string) => ({ DRAFT: '草稿', PUBLISHED: '已发布', DISABLED: '已禁用' }[s] || s)

const loadDemoData = async () => {
  const { value: demoType } = await ElMessageBox.prompt(
    '请选择规则引擎Demo类型：\n1. 商品定价决策（多条件路由+动作执行）\n2. 风控评分卡（多条件嵌套+阈值判定）\n3. 会员等级判定（决策表+变量赋值）\n4. 优惠券权益计算（规则集+条件组合）\n5. 异常交易识别（复合条件+HTTP调用验证）\n6. 订单满减规则（循环遍历+条件匹配）',
    '加载规则引擎Demo',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^[1-6]$/,
      inputErrorMessage: '请输入1-6之间的数字',
      inputValue: '1'
    }
  )

  const demoMap: Record<string, () => void> = {
    '1': loadDemo1_ProductPricing,
    '2': loadDemo2_RiskScoring,
    '3': loadDemo3_MemberLevel,
    '4': loadDemo4_CouponBenefit,
    '5': loadDemo5_AbnormalTransaction,
    '6': loadDemo6_OrderDiscount
  }

  const loader = demoMap[demoType]
  if (loader) {
    loader()
    setTimeout(() => fitViewFn({ duration: 500 }), 100)
    ElMessage.success('规则引擎Demo已加载，点击测试体验决策路径')
  }
}

// Demo 1: 商品定价决策（多条件路由+动作执行）
const loadDemo1_ProductPricing = () => {
  ruleData.ruleCode = 'RULE_PRICING'; ruleData.ruleName = 'Demo1: 商品定价决策'; ruleData.ruleDesc = '根据商品类目、库存、季节计算最终售价'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 130 }, data: { conditions: [{ fieldName: 'category', fieldType: 'STRING', operator: 'EQ', value: 'electronics' }, { fieldName: 'stock', fieldType: 'NUMBER', operator: 'LT', value: '50' }], logic: 'AND' } },
    { id: 'gw_1', type: 'exclusive-gateway', position: { x: 380, y: 280 }, data: { name: '价格策略路由', gatewayType: 'XOR', branches: [{ id: 'b1', label: '稀缺电子产品', condition: 'category == "electronics" && stock < 50' }, { id: 'b2', label: '普通商品', condition: 'default' }] } },
    { id: 'var_1', type: 'variable-assign', position: { x: 100, y: 420 }, data: { assignments: [{ variableName: 'priceMultiplier', valueType: 'CONSTANT', value: '1.2' }, { variableName: 'discount', valueType: 'CONSTANT', value: '0' }] } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 560 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalPrice', actionValue: 'basePrice * priceMultiplier', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '稀缺商品溢价20%', messageType: 'WARNING' }] } },
    { id: 'var_2', type: 'variable-assign', position: { x: 620, y: 420 }, data: { assignments: [{ variableName: 'priceMultiplier', valueType: 'CONSTANT', value: '1.0' }, { variableName: 'discount', valueType: 'CONSTANT', value: '0.1' }] } },
    { id: 'action_2', type: 'action', position: { x: 620, y: 560 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalPrice', actionValue: 'basePrice * (1 - discount)', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '普通商品9折优惠', messageType: 'SUCCESS' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 700 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e_s_c', source: 'start_1', target: 'cond_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e_c_g', source: 'cond_1', target: 'gw_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_g_v1', source: 'gw_1', target: 'var_1', animated: true, label: '稀缺电子产品', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_g_v2', source: 'gw_1', target: 'var_2', animated: true, label: '普通商品', style: { stroke: '#22c55e', strokeWidth: 2 }, labelStyle: { fill: '#22c55e', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_v1_a1', source: 'var_1', target: 'action_1', animated: true, label: '设置 priceMultiplier, discount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_v2_a2', source: 'var_2', target: 'action_2', animated: true, label: '设置 priceMultiplier, discount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_a1_e', source: 'action_1', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_a2_e', source: 'action_2', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 2: 风控评分卡（多条件嵌套+阈值判定）
const loadDemo2_RiskScoring = () => {
  ruleData.ruleCode = 'RULE_RISK_SCORE'; ruleData.ruleName = 'Demo2: 风控评分卡'; ruleData.ruleDesc = '多条件嵌套评估用户风险等级'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'riskScore', valueType: 'CONSTANT', value: '0' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'age', fieldType: 'NUMBER', operator: 'LT', value: '25' }, { fieldName: 'income', fieldType: 'NUMBER', operator: 'LT', value: '5000' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskScore', actionValue: 'riskScore + 30', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '年轻低收入群体风险+30', messageType: 'WARNING' }] } },
    { id: 'cond_2', type: 'condition', position: { x: 560, y: 400 }, data: { conditions: [{ fieldName: 'creditHistory', fieldType: 'STRING', operator: 'EQ', value: 'bad' }, { fieldName: 'debtRatio', fieldType: 'NUMBER', operator: 'GT', value: '0.5' }], logic: 'AND' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskScore', actionValue: 'riskScore + 50', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '信用不良且负债率高风险+50', messageType: 'ERROR' }] } },
    { id: 'cond_3', type: 'condition', position: { x: 330, y: 680 }, data: { conditions: [{ fieldName: 'riskScore', fieldType: 'NUMBER', operator: 'GTE', value: '80' }], logic: 'AND' } },
    { id: 'action_3', type: 'action', position: { x: 100, y: 820 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskLevel', actionValue: 'HIGH', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '高风险用户，拒绝交易', messageType: 'ERROR' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 960 }, data: { endType: 'fail' } },
    { id: 'action_4', type: 'action', position: { x: 560, y: 820 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskLevel', actionValue: 'LOW', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '低风险用户，允许交易', messageType: 'SUCCESS' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 960 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: true, label: '设置 riskScore', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'action_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'cond_2', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'action_1', target: 'cond_3', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_2', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'cond_3', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'cond_3', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'cond_3', target: 'action_3', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e10', source: 'cond_3', target: 'action_4', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e11', source: 'action_3', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e12', source: 'action_4', target: 'end_2', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 3: 会员等级判定（决策表+变量赋值）
const loadDemo3_MemberLevel = () => {
  ruleData.ruleCode = 'RULE_MEMBER_LEVEL'; ruleData.ruleName = 'Demo3: 会员等级判定'; ruleData.ruleDesc = '根据消费金额和频次判定会员等级，计算权益'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'totalSpend', valueType: 'VARIABLE', value: 'annualSpend' }, { variableName: 'orderCount', valueType: 'VARIABLE', value: 'annualOrders' }] } },
    { id: 'gw_1', type: 'exclusive-gateway', position: { x: 380, y: 270 }, data: { name: '会员等级路由', gatewayType: 'XOR', branches: [{ id: 'b1', label: '钻石会员', condition: 'totalSpend >= 50000 && orderCount >= 100' }, { id: 'b2', label: '金卡会员', condition: 'totalSpend >= 20000' }, { id: 'b3', label: '银卡会员', condition: 'totalSpend >= 5000' }, { id: 'b4', label: '普通会员', condition: 'default' }] } },
    { id: 'action_1', type: 'action', position: { x: 20, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'DIAMOND', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.7', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'freeShipping', actionValue: 'true', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '钻石会员：7折+免运费', messageType: 'SUCCESS' }] } },
    { id: 'action_2', type: 'action', position: { x: 260, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'GOLD', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.85', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '金卡会员：8.5折', messageType: 'SUCCESS' }] } },
    { id: 'action_3', type: 'action', position: { x: 500, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'SILVER', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.95', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '银卡会员：9.5折', messageType: 'INFO' }] } },
    { id: 'action_4', type: 'action', position: { x: 740, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'NORMAL', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '1.0', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '普通会员：无折扣', messageType: 'INFO' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 580 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'gw_1', animated: true, label: '设置 totalSpend, orderCount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'gw_1', target: 'action_1', animated: true, label: '钻石会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'gw_1', target: 'action_2', animated: true, label: '金卡会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'gw_1', target: 'action_3', animated: true, label: '银卡会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'gw_1', target: 'action_4', animated: true, label: '普通会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'action_1', target: 'end_1', animated: true, label: '4个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'end_1', animated: true, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_3', target: 'end_1', animated: true, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e10', source: 'action_4', target: 'end_1', animated: true, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 4: 优惠券权益计算（规则集+条件组合）
const loadDemo4_CouponBenefit = () => {
  ruleData.ruleCode = 'RULE_COUPON'; ruleData.ruleName = 'Demo4: 优惠券权益计算'; ruleData.ruleDesc = '根据优惠券类型和使用条件计算权益'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'couponType', valueType: 'VARIABLE', value: 'type' }, { variableName: 'orderAmount', valueType: 'VARIABLE', value: 'amount' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'couponType', fieldType: 'STRING', operator: 'EQ', value: 'FULL_REDUCTION' }, { fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: '200' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: '50', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '满200减50优惠券', messageType: 'SUCCESS' }] } },
    { id: 'cond_2', type: 'condition', position: { x: 560, y: 400 }, data: { conditions: [{ fieldName: 'couponType', fieldType: 'STRING', operator: 'EQ', value: 'PERCENTAGE' }, { fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: '100' }], logic: 'AND' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: 'orderAmount * 0.2', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '8折优惠券', messageType: 'SUCCESS' }] } },
    { id: 'action_3', type: 'action', position: { x: 330, y: 680 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: '0', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '优惠券不满足使用条件', messageType: 'WARNING' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 820 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: true, label: '设置 couponType, orderAmount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'action_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'cond_2', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'action_1', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_2', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'action_3', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_3', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 5: 异常交易识别（复合条件+HTTP调用验证）
const loadDemo5_AbnormalTransaction = () => {
  ruleData.ruleCode = 'RULE_ABNORMAL_TXN'; ruleData.ruleName = 'Demo5: 异常交易识别'; ruleData.ruleDesc = '多条件组合识别异常交易，调用外部接口验证'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'txnAmount', valueType: 'VARIABLE', value: 'amount' }, { variableName: 'txnTime', valueType: 'VARIABLE', value: 'timestamp' }, { variableName: 'userLocation', valueType: 'VARIABLE', value: 'location' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'txnAmount', fieldType: 'NUMBER', operator: 'GT', value: '10000' }, { fieldName: 'txnTime', fieldType: 'DATE', operator: 'BETWEEN', value: '00:00-06:00' }], logic: 'AND' } },
    { id: 'http_1', type: 'http-call', position: { x: 100, y: 400 }, data: { method: 'POST', url: '/api/risk/check-location', body: '{"userId": "${userId}", "location": "${userLocation}"}', responseVar: 'locationRisk', timeout: 3000 } },
    { id: 'cond_2', type: 'condition', position: { x: 100, y: 540 }, data: { conditions: [{ fieldName: 'locationRisk', fieldType: 'STRING', operator: 'EQ', value: 'HIGH_RISK' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 680 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'txnStatus', actionValue: 'BLOCKED', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '异常交易：深夜大额+高风险地点', messageType: 'ERROR' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 820 }, data: { endType: 'fail' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'txnStatus', actionValue: 'PASSED', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '交易正常', messageType: 'SUCCESS' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 540 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: true, label: '设置 txnAmount, txnTime, userLocation', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'http_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'action_2', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'http_1', target: 'cond_2', animated: true, label: 'POST /api/risk/check-location', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'action_2', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_1', target: 'end_1', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_2', target: 'end_2', animated: true, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 6: 订单满减规则（循环遍历+条件匹配）
const loadDemo6_OrderDiscount = () => {
  ruleData.ruleCode = 'RULE_ORDER_DISCOUNT'; ruleData.ruleName = 'Demo6: 订单满减规则'; ruleData.ruleDesc = '遍历订单商品，根据金额区间计算满减优惠'
  nodes.value = [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'orderAmount', valueType: 'VARIABLE', value: 'totalAmount' }, { variableName: 'discountRules', valueType: 'CONSTANT', value: '[{threshold:100,discount:10},{threshold:200,discount:30},{threshold:500,discount:80}]' }] } },
    { id: 'loop_1', type: 'loop', position: { x: 330, y: 260 }, data: { loopType: 'forEach', collectionVar: 'discountRules', itemVar: 'rule', indexVar: 'ruleIndex' } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 400 }, data: { conditions: [{ fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: 'rule.threshold' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalDiscount', actionValue: 'rule.discount', actionValueType: 'EXPRESSION' }, { actionType: 'SET_VALUE', targetField: 'finalAmount', actionValue: 'orderAmount - rule.discount', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '满${rule.threshold}减${rule.discount}，最终价格：${finalAmount}', messageType: 'SUCCESS' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 680 }, data: { endType: 'success' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalDiscount', actionValue: '0', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'finalAmount', actionValue: 'orderAmount', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '未满足任何满减条件，原价：${orderAmount}', messageType: 'INFO' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 680 }, data: { endType: 'success' } }
  ]
  edges.value = [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: true, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'loop_1', animated: true, label: '设置 orderAmount, discountRules', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'loop_1', target: 'cond_1', animated: true, label: '遍历 discountRules', style: { stroke: '#ec4899', strokeWidth: 2 }, labelStyle: { fill: '#ec4899', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'action_1', animated: true, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'cond_1', target: 'action_2', animated: true, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'action_1', target: 'end_1', animated: true, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'action_2', target: 'end_2', animated: true, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

const onGlobalClick = () => { if (contextMenu.visible) closeContextMenu() }
onMounted(() => { loadRuleData(); document.addEventListener('click', onGlobalClick) })
onUnmounted(() => { document.removeEventListener('click', onGlobalClick) })
</script>

<style scoped lang="scss">
.rule-designer {
  height: 100%; display: flex; flex-direction: column; background: #f0f2f5;

  .designer-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 8px 16px; background: #fff; border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04); z-index: 10;
    .toolbar-left { display: flex; align-items: center; gap: 8px;
      .rule-name-input { width: 260px; :deep(.el-input__inner) { font-size: 14px; font-weight: 600; } } }
    .toolbar-right { display: flex; align-items: center; gap: 10px; }
  }

  .designer-body {
    flex: 1; overflow: hidden; border-top: 1px solid #e2e8f0;
  }

  .left-pane { background: #fff; overflow: hidden; }
  .right-pane { background: #fff; overflow: hidden; }

  .center-pane {
    display: flex; flex-direction: column; background: #f8fafc; min-width: 0; overflow: hidden;
    .canvas-toolbar {
      display: flex; align-items: center; justify-content: space-between;
      padding: 6px 14px; background: #fff; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
      .canvas-title { display: flex; align-items: center; gap: 5px; font-weight: 600; font-size: 13px; color: #1e293b; }
      .canvas-actions { display: flex; align-items: center; gap: 2px;
        .canvas-tip { font-size: 11px; color: #94a3b8; margin-left: 4px; } }
    }
    .canvas-body { flex: 1; position: relative; overflow: hidden;
      .vue-flow-instance { width: 100%; height: 100%; }
      .context-menu {
        position: fixed; z-index: 9999; min-width: 150px; background: #fff;
        border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); padding: 4px 0; user-select: none;
        .menu-item { display: flex; align-items: center; gap: 8px; padding: 7px 14px; font-size: 13px; color: #334155; cursor: pointer; transition: background 0.15s;
          &:hover { background: #f1f5f9; } &.danger { color: #ef4444; &:hover { background: #fef2f2; } } .el-icon { font-size: 14px; } }
        .menu-divider { height: 1px; background: #e2e8f0; margin: 4px 0; }
      }
    }
  }

  .test-console-panel { overflow: hidden; }
  .test-console {
    height: 100%; background: #fff; display: flex; flex-direction: column; overflow: hidden;
    .console-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 12px; height: 36px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; flex-shrink: 0;
      .console-tabs { display: flex; align-items: center; gap: 10px;
        .console-tab { display: flex; align-items: center; gap: 5px; font-size: 12px; color: #475569; font-weight: 600; } }
      .console-actions { display: flex; align-items: center; gap: 6px; }
    }
    .console-body { flex: 1; overflow: hidden;
      .console-left { display: flex; flex-direction: column; overflow: hidden; }
      .console-right { display: flex; flex-direction: column; overflow: hidden; }
      .pane-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 5px 12px; background: #f8fafc; border-bottom: 1px solid #e2e8f0;
        font-size: 11px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 0.4px; flex-shrink: 0;
      }
      .pane-body { flex: 1; overflow-y: auto; padding: 8px;
        .param-form {
          .el-form-item { margin-bottom: 12px; }
          .field-type-tag { margin-left: 6px; }
        }
        .json-input { :deep(.el-textarea__inner) {
          background: #f8fafc; border: 1px solid #e2e8f0; color: #1e293b;
          font-family: 'JetBrains Mono', 'Courier New', monospace; font-size: 12px; line-height: 1.6; border-radius: 4px;
          &:focus { border-color: #6366f1; background: #fff; } } }
        .empty-output { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #94a3b8;
          p { margin: 8px 0 0; font-size: 13px; }
          .hint { font-size: 11px; color: #cbd5e1; } }
        .output-content {
          .step-card { background: #f8fafc; border-radius: 6px; padding: 8px 10px; margin-bottom: 6px; border-left: 3px solid transparent;
            &.step-current { border-left-color: #10b981; box-shadow: 0 0 0 1px rgba(16,185,129,0.2); }
            .step-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px;
              .step-node-name { font-size: 12px; font-weight: 600; color: #1e293b; }
              .step-node-type { font-size: 10px; color: #94a3b8; }
              .step-duration { margin-left: auto; font-size: 10px; color: #94a3b8; } }
            .step-message { font-size: 11px; color: #475569; line-height: 1.5; padding: 4px 6px; background: #f1f5f9; border-radius: 3px; font-family: 'JetBrains Mono', monospace; } }
          .cond-item { margin-bottom: 8px;
            .cond-detail { margin-top: 4px; background: #f1f5f9; color: #1e293b; padding: 6px 10px; border-radius: 4px; font-size: 11px; font-family: 'JetBrains Mono', monospace; white-space: pre-wrap; } }
          .json-output { background: #f1f5f9; color: #1e293b; padding: 10px; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 12px; line-height: 1.5; }
        }
      }
    }
  }
}

// el-splitter 样式微调（统一配色与拖拽条样式）
:deep(.el-splitter__bar) {
  background: #e2e8f0 !important;
  transition: background 0.2s ease;
  &:hover { background: #6366f1 !important; }
}
:deep(.el-splitter__bar-draggable) {
  &::after { background: transparent !important; }
}

:deep(.vue-flow) {
  .node-highlighted .node-card, .node-highlighted .gateway-shape { box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16,185,129,0.4) !important; animation: pulse-h 1.5s ease-in-out infinite; }
  .node-dimmed { opacity: 0.3; transition: opacity 0.3s; }
  .edge-highlighted .vue-flow__edge-path { stroke: #10b981 !important; stroke-width: 3 !important; filter: drop-shadow(0 0 6px rgba(16,185,129,0.5)); stroke-dasharray: 8; animation: dash-f 0.5s linear infinite; }
  .edge-dimmed .vue-flow__edge-path { opacity: 0.15; }
}
@keyframes pulse-h { 0%,100% { box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16,185,129,0.4); } 50% { box-shadow: 0 0 0 5px #10b981, 0 0 30px rgba(16,185,129,0.7); } }
@keyframes dash-f { to { stroke-dashoffset: -16; } }
</style>
