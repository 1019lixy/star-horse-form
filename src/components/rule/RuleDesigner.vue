<template>
  <!-- 保留必要的弹窗（复杂编辑用） -->
  <ConditionEditDialog :visible="conditionDialogVisible" :condition="editingCondition"
                       @close="conditionDialogVisible = false" @save="handleConditionSave" />
  <ActionEditDialog :visible="actionDialogVisible" :action="editingAction" @close="actionDialogVisible = false"
                    @save="handleActionSave" />
  <GatewayConfigDialog :visible="gatewayDialogVisible" :gateway="editingGateway" @close="gatewayDialogVisible = false"
                       @save="handleGatewaySave" />
  <VariableAssignDialog :visible="variableDialogVisible" :assignments="editingAssignments"
                        @close="variableDialogVisible = false" @save="handleVariableSave" />
  <ScriptEditDialog :visible="scriptDialogVisible" :script="editingScript" @close="scriptDialogVisible = false"
                    @save="handleScriptSave" />
  <HttpCallDialog :visible="httpDialogVisible" :config="editingHttpConfig" @close="httpDialogVisible = false"
                  @save="handleHttpSave" />
  <RuleSetRefDialog :visible="ruleSetRefDialogVisible" :config="editingRuleSetRef"
                    @close="ruleSetRefDialogVisible = false" @save="handleRuleSetRefSave" />
  <LoopConfigDialog :visible="loopDialogVisible" :config="editingLoopConfig" @close="loopDialogVisible = false"
                    @save="handleLoopSave" />
  <RulePropertyDialog :visible="propertyDialogVisible" :rule-data="ruleData" @close="propertyDialogVisible = false"
                      @save="handlePropertySave" />

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
              <el-icon>
                <InfoFilled />
              </el-icon>
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
          <el-icon>
            <Check />
          </el-icon>
          保存
        </el-button>
        <el-button @click="handleTest">
          <el-icon>
            <VideoPlay />
          </el-icon>
          测试
        </el-button>
        <el-button @click="handlePublish" v-if="ruleData.status !== 'PUBLISHED'">
          <el-icon>
            <Upload />
          </el-icon>
          发布
        </el-button>
        <el-divider direction="vertical" />
        <el-button type="success" plain @click="loadDemoData">
          <el-icon>
            <MagicStick />
          </el-icon>
          Demo
        </el-button>
        <el-divider direction="vertical" />
        <el-input v-model="ruleData.ruleName" placeholder="规则名称" class="rule-name-input" size="large">
          <template #prefix>
            <el-icon>
              <EditPen />
            </el-icon>
          </template>
        </el-input>
      </div>
      <div class="toolbar-right">
        <el-popover placement="bottom-end" :width="420" trigger="click" popper-class="help-popper">
          <template #reference>
            <el-button link>
              <el-icon>
                <QuestionFilled />
              </el-icon>
              帮助
            </el-button>
          </template>
          <div class="help-panel">
            <div class="help-title">
              <el-icon>
                <QuestionFilled />
              </el-icon>
              快捷键 & 操作说明
            </div>
            <el-divider style="margin: 8px 0" />
            <div class="help-section">
              <div class="help-section-title">基础操作</div>
              <div class="help-row"><kbd>左键拖拽</kbd>节点库→画布<span>添加节点</span></div>
              <div class="help-row"><kbd>左键拖拽</kbd>节点端口→另一节点<span>创建连线</span></div>
              <div class="help-row"><kbd>双击</kbd>节点<span>打开编辑弹窗</span></div>
              <div class="help-row"><kbd>双击</kbd>连线<span>编辑连线标签</span></div>
              <div class="help-row"><kbd>右键</kbd>节点/画布<span>弹出上下文菜单</span></div>
            </div>
            <div class="help-section">
              <div class="help-section-title">选中 & 框选</div>
              <div class="help-row"><kbd>左键点击</kbd><span>选中单个节点</span></div>
              <div class="help-row"><kbd>Shift/Ctrl+点击</kbd><span>追加选中 / 多选</span></div>
              <div class="help-row"><kbd>Shift/Ctrl+拖拽空白</kbd><span>框选区域</span></div>
              <div class="help-row"><kbd>Ctrl+A</kbd><span>全选（画布聚焦时）</span></div>
            </div>
            <div class="help-section">
              <div class="help-section-title">编辑操作</div>
              <div class="help-row"><kbd>Delete</kbd> / <kbd>Backspace</kbd><span>删除选中</span></div>
              <div class="help-row"><kbd>Ctrl+Z</kbd><span>回退</span></div>
              <div class="help-row"><kbd>Ctrl+Y</kbd> / <kbd>Ctrl+Shift+Z</kbd><span>前进</span></div>
              <div class="help-row"><kbd>Ctrl+C</kbd> / <kbd>Ctrl+V</kbd><span>复制 / 粘贴节点</span></div>
            </div>
            <div class="help-section">
              <div class="help-section-title">画布操作</div>
              <div class="help-row"><kbd>滚轮</kbd><span>缩放画布</span></div>
              <div class="help-row"><kbd>左键拖拽空白</kbd><span>平移画布</span></div>
              <div class="help-row"><kbd>右键拖拽</kbd><span>平移画布</span></div>
              <div class="help-row"><kbd>工具栏</kbd>对齐下拉<span>8种对齐方式</span></div>
              <div class="help-row"><kbd>工具栏</kbd>连线样式<span>曲线/直线/折线切换</span></div>
            </div>
            <div class="help-section">
              <div class="help-section-title">测试模式</div>
              <div class="help-row"><kbd>测试按钮</kbd><span>打开控制台，输入参数执行</span></div>
              <div class="help-row"><kbd>执行</kbd><span>高亮显示执行路径</span></div>
              <div class="help-row"><kbd>关闭控制台</kbd><span>自动还原设计状态</span></div>
            </div>
          </div>
        </el-popover>
        <el-button link @click="openPropertyDialog">
          <el-icon>
            <Setting />
          </el-icon>
          规则属性
        </el-button>
        <el-tag :type="getStatusType(ruleData.status)" size="large" effect="dark">{{ getStatusText(ruleData.status) }}
        </el-tag>
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
                <!-- 回退前进 -->
                <el-tooltip content="回退 (Ctrl+Z)" placement="bottom">
                  <el-button link @click="undo" :disabled="!canUndo">
                    <el-icon>
                      <Back />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="前进 (Ctrl+Y)" placement="bottom">
                  <el-button link @click="redo" :disabled="!canRedo">
                    <el-icon>
                      <Right />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-divider direction="vertical" />
                <!-- 对齐工具（下拉） -->
                <el-dropdown trigger="click" :disabled="!hasMultiSelected" @command="handleAlign"
                             popper-class="designer-dropdown-popper">
                  <el-button link :disabled="!hasMultiSelected" title="对齐方式">
                    <el-icon>
                      <Grid />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="left">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        左对齐
                      </el-dropdown-item>
                      <el-dropdown-item command="center">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        水平居中
                      </el-dropdown-item>
                      <el-dropdown-item command="right">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        右对齐
                      </el-dropdown-item>
                      <el-dropdown-item divided command="top">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        顶部对齐
                      </el-dropdown-item>
                      <el-dropdown-item command="middle">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        垂直居中
                      </el-dropdown-item>
                      <el-dropdown-item command="bottom">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        底部对齐
                      </el-dropdown-item>
                      <el-dropdown-item divided command="hDist">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        水平分布
                      </el-dropdown-item>
                      <el-dropdown-item command="vDist">
                        <el-icon>
                          <DCaret />
                        </el-icon>
                        垂直分布
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <!-- 连线类型 -->
                <el-dropdown trigger="click" @command="handleEdgeType" popper-class="designer-dropdown-popper">
                  <el-button link title="连线样式">
                    <el-icon>
                      <Share />
                    </el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="default" :class="{ 'is-active': edgeType === 'default' }">贝塞尔曲线
                      </el-dropdown-item>
                      <el-dropdown-item command="straight" :class="{ 'is-active': edgeType === 'straight' }">直线
                      </el-dropdown-item>
                      <el-dropdown-item command="step" :class="{ 'is-active': edgeType === 'step' }">折线
                      </el-dropdown-item>
                      <el-dropdown-item command="smoothstep" :class="{ 'is-active': edgeType === 'smoothstep' }">
                        平滑折线
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-divider direction="vertical" />
                <el-tooltip content="删除选中" placement="bottom">
                  <el-button link @click="deleteSelected" :disabled="!hasSelected">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="适应画布" placement="bottom">
                  <el-button link @click="fitView">
                    <el-icon>
                      <FullScreen />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="自动布局" placement="bottom">
                  <el-button link @click="autoLayout">
                    <el-icon>
                      <Grid />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="布局选中节点" placement="bottom">
                  <el-button link @click="layoutSelected" :disabled="!hasSelected">
                    <el-icon>
                      <Operation />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="清空" placement="bottom">
                  <el-button link @click="clearCanvas">
                    <el-icon>
                      <Brush />
                    </el-icon>
                  </el-button>
                </el-tooltip>
                <el-divider direction="vertical" />
                <span class="canvas-tip">左键拖拽平移 · Shift/Ctrl+拖拽框选 · 滚轮缩放 · Ctrl+Z回退</span>
              </div>
            </div>
            <div class="canvas-body" @drop="onDrop" @dragover.prevent="onDragOver" @dragleave.prevent="onDragLeave"
                 @contextmenu.prevent="onCanvasContextMenu">
              <VueFlow
                v-model:nodes="nodes"
                v-model:edges="edges"
                :default-viewport="{ zoom: 1 }"
                :min-zoom="0.2" :max-zoom="2"
                :snap-to-grid="true" :snap-grid="[15, 15]"
                :connection-mode="isTestMode?ConnectionMode.Loose:ConnectionMode.Strict"
                :delete-key-code="['Delete', 'Backspace']"
                :elements-selectable="true"
                :selection-on-drag="false"
                :multi-selection-activated="true"
                :select-nodes-on-drag="true"
                :pan-on-drag="true"
                :selection-key-code="['Shift', 'Control']"
                fit-view-on-init
                class="vue-flow-instance"
                :class="{ 'test-mode': isTestMode }"
                @node-double-click="onNodeDoubleClick"
                @node-click="onNodeClick"
                @edge-double-click="onEdgeDoubleClick"
                @connect="onConnect"
              >
                <template #node-start="p">
                  <StartNode v-bind="p" />
                </template>
                <template #node-end="p">
                  <EndNode v-bind="p" />
                </template>
                <template #node-condition="p">
                  <ConditionNode v-bind="p" @edit="openConditionDialog(p.id, -1)"
                                 @editCondition="(i)=>openConditionDialog(p.id,i)"
                                 @deleteCondition="(i)=>deleteCondition(p.id,i)" />
                </template>
                <template #node-action="p">
                  <ActionNode v-bind="p" @edit="openActionDialog(p.id, -1)" @editAction="(i)=>openActionDialog(p.id,i)"
                              @deleteAction="(i)=>deleteAction(p.id,i)" />
                </template>
                <template #node-exclusive-gateway="p">
                  <ExclusiveGatewayNode v-bind="p" @edit="openGatewayDialog(p.id)" />
                </template>
                <template #node-parallel-gateway="p">
                  <ParallelGatewayNode v-bind="p" />
                </template>
                <template #node-inclusive-gateway="p">
                  <InclusiveGatewayNode v-bind="p" @edit="openGatewayDialog(p.id)" />
                </template>
                <template #node-variable-assign="p">
                  <VariableAssignNode v-bind="p" @edit="openVariableDialog(p.id)"
                                      @editAssignment="(i)=>openVariableDialog(p.id)"
                                      @deleteAssignment="(i)=>deleteAssignment(p.id,i)" />
                </template>
                <template #node-script="p">
                  <ScriptNode v-bind="p" @edit="openScriptDialog(p.id)" />
                </template>
                <template #node-http-call="p">
                  <HttpCallNode v-bind="p" @edit="openHttpDialog(p.id)" />
                </template>
                <template #node-rule-set-ref="p">
                  <RuleSetRefNode v-bind="p" @edit="openRuleSetRefDialog(p.id)" />
                </template>
                <template #node-loop="p">
                  <LoopNode v-bind="p" @edit="openLoopDialog(p.id)" />
                </template>
                <template #node-join="p">
                  <JoinNode v-bind="p" />
                </template>
                <template #node-decision-table="p">
                  <DecisionTableNode v-bind="p" />
                </template>
                <template #node-generic="p">
                  <GenericNode v-bind="p" />
                </template>
                <Background :gap="20" :size="1" />
                <Controls position="bottom-right" />
                <MiniMap position="bottom-left" />
              </VueFlow>

              <!-- 右键菜单 -->
              <div v-if="contextMenu.visible" class="context-menu"
                   :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }" @click.stop>
                <template v-if="contextMenu.type === 'node'">
                  <div class="menu-item" @click="handleCtxAction('edit')">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    <span>编辑节点</span></div>
                  <div class="menu-item" @click="handleCtxAction('copy')">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                    <span>复制节点</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item danger" @click="handleCtxAction('delete')">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <span>删除节点</span></div>
                </template>
                <template v-else-if="contextMenu.type === 'edge'">
                  <div class="menu-item" @click="handleCtxAction('editEdge')">
                    <el-icon>
                      <Edit />
                    </el-icon>
                    <span>编辑连线标签</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item danger" @click="handleCtxAction('delete')">
                    <el-icon>
                      <Delete />
                    </el-icon>
                    <span>删除连线</span></div>
                </template>
                <template v-else>
                  <div class="menu-item" @click="handleCtxAction('paste')">
                    <el-icon>
                      <CopyDocument />
                    </el-icon>
                    <span>粘贴节点</span></div>
                  <div class="menu-divider"></div>
                  <div class="menu-item" @click="handleCtxAction('fitView')">
                    <el-icon>
                      <FullScreen />
                    </el-icon>
                    <span>适应画布</span></div>
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
              <el-tag v-if="executionPath" :type="executionPath.success ? 'success' : 'danger'">
                {{ executionPath.success ? "成功" : "失败" }} · {{ executionPath.duration }}ms ·
                {{ executionPath.visitedNodeIds.length }}节点
              </el-tag>
            </div>
            <div class="console-actions">
              <el-button type="primary" @click="executeTest" :loading="executing">
                <el-icon>
                  <VideoPlay />
                </el-icon>
                执行
              </el-button>
              <el-button @click="stepExecute" :disabled="!executionPath">
                <el-icon>
                  <VideoPause />
                </el-icon>
                单步
              </el-button>
              <el-button @click="loadSampleData">
                <el-icon>
                  <DocumentCopy />
                </el-icon>
                示例
              </el-button>
              <el-button @click="clearTestResult">
                <el-icon>
                  <Brush />
                </el-icon>
                清除
              </el-button>
              <el-button link @click="closeTestConsole">
                <el-icon>
                  <Close />
                </el-icon>
              </el-button>
            </div>
          </div>
          <div class="console-body">
            <el-splitter class="console-splitter">
              <el-splitter-panel :size="350" resizable collapsible min="200" max="550">
                <div class="pane-header">
                  <span>输入参数</span>
                  <el-button link @click="switchToJsonMode">{{ jsonMode ? "表单模式" : "JSON模式" }}</el-button>
                </div>
                <div class="pane-body">
                  <!-- 表单模式：自动解析参数 -->
                  <div v-if="!jsonMode">
                    <div v-if="testFields.length === 0" class="empty-output">
                      <el-icon :size="28">
                        <Document />
                      </el-icon>
                      <p>暂无可测试参数</p>
                      <p class="hint">添加条件节点后自动解析字段</p>
                    </div>
                    <el-form v-else label-width="100px" labelPosition="top" class="param-form">
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
                        <el-tag type="info" class="field-type-tag">{{ field.type }}</el-tag>
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
              <el-splitter-panel>
                <div class="pane-header">
                  <span>执行输出</span>
                  <el-radio-group v-if="executionPath" v-model="outputTab">
                    <el-radio-button value="timeline">时间线</el-radio-button>
                    <el-radio-button value="conditions">条件</el-radio-button>
                    <el-radio-button value="actions">动作</el-radio-button>
                    <el-radio-button value="context">上下文</el-radio-button>
                  </el-radio-group>
                </div>
                <div class="pane-body">
                  <div v-if="!executionPath" class="empty-output">
                    <el-icon :size="32">
                      <Cpu />
                    </el-icon>
                    <p>点击执行按钮运行规则</p></div>
                  <div v-else-if="outputTab === 'timeline'" class="output-content">
                    <el-timeline>
                      <el-timeline-item v-for="(step, idx) in displaySteps" :key="idx" :type="getStepType(step.status)"
                                        :timestamp="`+${step.timestamp - executionPath.steps[0].timestamp}ms`"
                                        placement="top" size="large">
                        <div class="step-card" :class="{ 'step-current': isStepping && idx === stepIndex }">
                          <div class="step-header">
                            <el-tag :type="getStepType(step.status)" effect="dark">{{ step.status }}</el-tag>
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
                      <el-tag :type="cond.passed ? 'success' : 'info'" effect="dark">{{ cond.passed ? "✓ 满足" : "✗ 不满足"
                        }}
                      </el-tag>
                      <pre class="cond-detail">{{ cond.detail }}</pre>
                    </div>
                  </div>
                  <div v-else-if="outputTab === 'actions'" class="output-content">
                    <el-table :data="executionPath.actionResults" border stripe>
                      <el-table-column prop="actionType" label="动作类型" width="120" />
                      <el-table-column prop="targetField" label="目标字段" width="160" />
                      <el-table-column prop="success" label="状态" width="80">
                        <template #default="{ row }">
                          <el-tag :type="row.success ? 'success' : 'danger'">{{ row.success ? "成功" : "失败" }}
                          </el-tag>
                        </template>
                      </el-table-column>
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
import { computed, onMounted, onUnmounted, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import {
  Back,
  Brush,
  Check,
  Close,
  CopyDocument,
  Cpu,
  DCaret,
  Delete,
  Edit,
  EditPen,
  FullScreen,
  Grid,
  InfoFilled,
  MagicStick,
  Monitor,
  Operation,
  QuestionFilled,
  Right,
  Setting,
  Share,
  Upload,
  VideoPause,
  VideoPlay
} from "@element-plus/icons-vue";
import { ConnectionMode, type Edge, type Node, useVueFlow, VueFlow } from "@vue-flow/core";
import { Background, Controls, MiniMap } from "@vue-flow/additional-components";
import "@vue-flow/core/dist/style.css";
import "@vue-flow/core/dist/theme-default.css";
import { ruleActionApi, ruleConditionApi, ruleDefinitionApi } from "@/api/rule_engine_api";
import NodePanel from "./NodePanel.vue";
import PropertyPanel from "./PropertyPanel.vue";
import StartNode from "./nodes/StartNode.vue";
import EndNode from "./nodes/EndNode.vue";
import ConditionNode from "./nodes/ConditionNode.vue";
import ActionNode from "./nodes/ActionNode.vue";
import ExclusiveGatewayNode from "./nodes/ExclusiveGatewayNode.vue";
import ParallelGatewayNode from "./nodes/ParallelGatewayNode.vue";
import InclusiveGatewayNode from "./nodes/InclusiveGatewayNode.vue";
import VariableAssignNode from "./nodes/VariableAssignNode.vue";
import ScriptNode from "./nodes/ScriptNode.vue";
import HttpCallNode from "./nodes/HttpCallNode.vue";
import RuleSetRefNode from "./nodes/RuleSetRefNode.vue";
import LoopNode from "./nodes/LoopNode.vue";
import JoinNode from "./nodes/JoinNode.vue";
import DecisionTableNode from "./nodes/DecisionTableNode.vue";
import GenericNode from "./nodes/GenericNode.vue";
import { DEMO_LIST } from "./demos/demoData";
import { getNodeDefaultData, getNodeLabel } from "./nodeTypes";
// 弹窗组件懒加载，只在用户点击编辑时才加载
import { defineAsyncComponent } from "vue";
const ConditionEditDialog = defineAsyncComponent(() => import("./dialogs/ConditionEditDialog.vue"));
const ActionEditDialog = defineAsyncComponent(() => import("./dialogs/ActionEditDialog.vue"));
const GatewayConfigDialog = defineAsyncComponent(() => import("./dialogs/GatewayConfigDialog.vue"));
const VariableAssignDialog = defineAsyncComponent(() => import("./dialogs/VariableAssignDialog.vue"));
const ScriptEditDialog = defineAsyncComponent(() => import("./dialogs/ScriptEditDialog.vue"));
const HttpCallDialog = defineAsyncComponent(() => import("./dialogs/HttpCallDialog.vue"));
const RuleSetRefDialog = defineAsyncComponent(() => import("./dialogs/RuleSetRefDialog.vue"));
const LoopConfigDialog = defineAsyncComponent(() => import("./dialogs/LoopConfigDialog.vue"));
const RulePropertyDialog = defineAsyncComponent(() => import("./dialogs/RulePropertyDialog.vue"));
import { executeRuleFlow, type ExecutionPath } from "./engine/RuleExecutor";
import { success, warning, error, operationConfirm } from "star-horse-lowcode";
import { ElMessageBox } from "element-plus";

const props = defineProps<{ ruleId?: string }>();
const emit = defineEmits<{ (e: "saved"): void; (e: "close"): void }>();
const route = useRoute();
const ruleId = computed(() => props.ruleId || (route?.params?.id as string));
const { fitView: fitViewFn, screenToFlowCoordinate, addEdges, addNodes, removeNodes, removeEdges } = useVueFlow();

const saving = ref(false);
const nodes = ref<Node[]>([]);
const edges = ref<Edge[]>([]);
const selectedNode = ref<any>(null);

// 弹窗
const conditionDialogVisible = ref(false);
const actionDialogVisible = ref(false);
const gatewayDialogVisible = ref(false);
const variableDialogVisible = ref(false);
const scriptDialogVisible = ref(false);
const httpDialogVisible = ref(false);
const ruleSetRefDialogVisible = ref(false);
const loopDialogVisible = ref(false);
const propertyDialogVisible = ref(false);
const edgeLabelDialogVisible = ref(false);
const editingNodeId = ref("");
const editingCondition = ref<any>(null);
const editingConditionIndex = ref(-1);
const editingAction = ref<any>(null);
const editingActionIndex = ref(-1);
const editingGateway = ref<any>(null);
const editingAssignments = ref<any[]>([]);
const editingScript = ref<any>(null);
const editingHttpConfig = ref<any>(null);
const editingRuleSetRef = ref<any>(null);
const editingLoopConfig = ref<any>(null);
const editingEdge = ref<any>(null);
const edgeLabel = ref("");

// 测试控制台
const testConsoleVisible = ref(false);
const testDataStr = ref("");
const executing = ref(false);
const executionPath = ref<ExecutionPath | null>(null);
const stepIndex = ref(0);
const isStepping = ref(false);
const outputTab = ref("timeline");
const jsonMode = ref(false);
const testFormData = reactive<Record<string, any>>({});

// 自动从条件节点解析测试参数
const testFields = computed(() => {
  const fields: { name: string; type: string }[] = [];
  const seen = new Set<string>();
  nodes.value.forEach((n: any) => {
    if (n.type === "condition" && n.data?.conditions) {
      n.data.conditions.forEach((c: any) => {
        if (c.fieldName && !seen.has(c.fieldName)) {
          seen.add(c.fieldName);
          fields.push({ name: c.fieldName, type: c.fieldType || "STRING" });
        }
      });
    }
    if (n.type === "variable-assign" && n.data?.assignments) {
      n.data.assignments.forEach((a: any) => {
        if (a.variableName && !seen.has(a.variableName)) {
          seen.add(a.variableName);
          fields.push({ name: a.variableName, type: "STRING" });
        }
      });
    }
  });
  return fields;
});

// 右键菜单
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  type: "pane" as "node" | "edge" | "pane",
  nodeId: "",
  edgeId: ""
});
const clipboard = ref<Node | null>(null);

const ruleData = reactive({
  idRuleDefinition: "", ruleCode: "", ruleName: "", ruleDesc: "",
  ruleType: "FORM_LINKAGE", ruleCategory: "", priority: 0, enabled: "Y",
  conditionLogic: "AND", status: "DRAFT", formId: "", flowContent: ""
});

const nodeDefaultData: Record<string, () => any> = {
  "start": () => ({}),
  "end": () => ({}),
  "condition": () => ({ conditions: [], logic: "AND" }),
  "action": () => ({ actions: [] }),
  "exclusive-gateway": () => ({ name: "排他网关", gatewayType: "XOR", branches: [] }),
  "parallel-gateway": () => ({ name: "并行网关" }),
  "inclusive-gateway": () => ({ name: "包容网关", gatewayType: "OR", branches: [] }),
  "variable-assign": () => ({ assignments: [] })
};
// 基础节点类型（有专用组件）
const BASIC_NODE_TYPES = new Set(["start", "end", "condition", "action",
  "exclusive-gateway", "parallel-gateway", "inclusive-gateway", "variable-assign",
  "loop", "join", "decision-table"]);
let nodeIdCounter = 0;
const generateNodeId = (type: string) => {
  nodeIdCounter++;
  return `${type}_${Date.now()}_${nodeIdCounter}`;
};

const initDefaultFlow = () => {
  nodes.value = [
    { id: "start_1", type: "start", position: { x: 400, y: 50 }, data: {} },
    { id: "end_1", type: "end", position: { x: 400, y: 400 }, data: {} }
  ];
  edges.value = [];
};

// ========== 拖拽创建 ==========
const onDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
};
const onDragLeave = (e: DragEvent) => {
  e.preventDefault();
};
const onDrop = (e: DragEvent) => {
  e.preventDefault();
  const nodeType = e.dataTransfer?.getData("application/vueflow");
  if (!nodeType) return;
  const position = screenToFlowCoordinate({ x: e.clientX, y: e.clientY });
  // 清除其他节点的选中状态
  nodes.value.forEach(n => n.selected = false);
  let newNode: Node;
  if (BASIC_NODE_TYPES.has(nodeType)) {
    newNode = {
      id: generateNodeId(nodeType),
      type: nodeType,
      position,
      data: nodeDefaultData[nodeType] ? nodeDefaultData[nodeType]() : {},
      selected: true
    };
  } else {
    const defaultData = getNodeDefaultData(nodeType);
    newNode = {
      id: generateNodeId(nodeType),
      type: "generic",
      position,
      data: { ...defaultData, __nodeType: nodeType },
      selected: true
    };
  }
  addNodes(newNode);
  selectedNode.value = newNode;
  pushHistory();
  success(`已添加 ${getNodeLabel(nodeType)}`);
};

const onConnect = (c: any) => {
  const sourceNode = nodes.value.find(n => n.id === c.source);
  const targetNode = nodes.value.find(n => n.id === c.target);
  if (!sourceNode || !targetNode) return;

  // 根据源节点类型自动生成边标签
  let label = "";
  let labelStyle = { fill: "#64748b", fontSize: 11, fontWeight: 500 };
  const sourceType = sourceNode.type === "generic" ? sourceNode.data.__nodeType : sourceNode.type;

  switch (sourceType) {
    case "condition": {
      // 条件节点：第一条出边标注"满足✓"，第二条标注"不满足✗"
      const outEdges = edges.value.filter(e => e.source === c.source);
      if (outEdges.length === 0) {
        label = "满足 ✓";
        labelStyle = { fill: "#10b981", fontSize: 11, fontWeight: 600 };
      } else {
        label = "不满足 ✗";
        labelStyle = { fill: "#ef4444", fontSize: 11, fontWeight: 600 };
      }
      break;
    }
    case "exclusive-gateway": {
      // 排他网关：根据分支配置自动生成条件摘要
      const branches = sourceNode.data.branches || [];
      const outEdges = edges.value.filter(e => e.source === c.source);
      const branchIndex = outEdges.length;
      if (branchIndex < branches.length) {
        const branch = branches[branchIndex];
        label = branch.condition || branch.label || `分支${branchIndex + 1}`;
      } else {
        label = "默认分支";
      }
      labelStyle = { fill: "#f59e0b", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "parallel-gateway": {
      label = "并行执行";
      labelStyle = { fill: "#06b6d4", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "inclusive-gateway": {
      const branches = sourceNode.data.branches || [];
      const outEdges = edges.value.filter(e => e.source === c.source);
      const branchIndex = outEdges.length;
      if (branchIndex < branches.length) {
        const branch = branches[branchIndex];
        label = branch.condition || branch.label || `分支${branchIndex + 1}`;
      } else {
        label = "默认分支";
      }
      labelStyle = { fill: "#8b5cf6", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "variable-assign": {
      const assignments = sourceNode.data.assignments || [];
      if (assignments.length > 0) {
        label = `设置 ${assignments.map(a => a.variableName).join(", ")}`;
      } else {
        label = "变量赋值";
      }
      labelStyle = { fill: "#6366f1", fontSize: 11, fontWeight: 500 };
      break;
    }
    case "action": {
      const actions = sourceNode.data.actions || [];
      if (actions.length > 0) {
        label = `${actions.length}个动作`;
      } else {
        label = "执行动作";
      }
      break;
    }
    case "loop": {
      label = `遍历 ${sourceNode.data.collectionVar || "集合"}`;
      break;
    }
    case "script": {
      label = "执行脚本";
      break;
    }
    case "http-call": {
      label = `${sourceNode.data.method || "GET"} ${sourceNode.data.url || "接口"}`;
      break;
    }
    default: {
      // 其他节点：显示节点类型
      const nodeLabel = getNodeLabel(sourceType);
      label = nodeLabel || sourceType;
    }
  }

  addEdges({
    id: `e_${c.source}_${c.target}_${Date.now()}`,
    source: c.source,
    target: c.target,
    label,
    labelStyle,
    labelShowBg: true,
    labelBgStyle: { fill: "#fff", fillOpacity: 0.9 },
    animated: false,
    type: edgeType.value,
    style: { stroke: "#6366f1", strokeWidth: 2 },
    data: { manualLabel: false } // 标记为自动生成，可被用户编辑覆盖
  });
  pushHistory();
};

// 点击节点库添加节点
const handleNodeAdd = (nodeType: string) => {
  const offset = nodes.value.length * 30;
  const position = { x: 350 + offset % 300, y: 150 + Math.floor(offset / 300) * 120 };
  // 清除其他节点的选中状态
  nodes.value.forEach(n => n.selected = false);
  let newNode: Node;
  if (BASIC_NODE_TYPES.has(nodeType)) {
    newNode = {
      id: generateNodeId(nodeType),
      type: nodeType,
      position,
      data: nodeDefaultData[nodeType] ? nodeDefaultData[nodeType]() : {},
      selected: true
    };
  } else {
    newNode = {
      id: generateNodeId(nodeType),
      type: "generic",
      position,
      data: { ...getNodeDefaultData(nodeType), __nodeType: nodeType },
      selected: true
    };
  }
  addNodes(newNode);
  selectedNode.value = newNode;
  pushHistory();
  success(`已添加 ${getNodeLabel(nodeType)}`);
};

// ========== 节点选中 ==========
const onNodeClick = (params: any) => {
  closeContextMenu();
  // VueFlow 自带选中状态管理，这里同步 selectedNode
  // 如果是多选模式（Ctrl/Shift），取第一个选中节点
  const selected = nodes.value.filter(n => n.selected);
  selectedNode.value = selected.length > 0 ? selected[0] : params.node;
};
const onNodeDoubleClick = (params: any) => {
  const { id, type } = params.node;
  editingNodeId.value = id;
  switch (type) {
    case "condition":
      openConditionDialog(id, -1);
      break;
    case "action":
      openActionDialog(id, -1);
      break;
    case "exclusive-gateway":
    case "inclusive-gateway":
      openGatewayDialog(id);
      break;
    case "variable-assign":
      openVariableDialog(id);
      break;
    case "script":
      openScriptDialog(id);
      break;
    case "http-call":
      openHttpDialog(id);
      break;
    case "rule-set-ref":
      openRuleSetRefDialog(id);
      break;
    case "loop":
      openLoopDialog(id);
      break;
  }
};

// 双击边编辑标签
const onEdgeDoubleClick = (params: any) => {
  const edge = params.edge;
  if (edge) {
    editingEdge.value = edge;
    edgeLabel.value = (edge.label as string) || "";
    edgeLabelDialogVisible.value = true;
  }
};

const handlePropertyUpdate = (nodeId: string, data: any) => {
  const node = nodes.value.find(n => n.id === nodeId);
  if (node) {
    node.data = { ...node.data, ...data };
    selectedNode.value = { ...node };
  }
};

// ========== 数据操作 ==========
const getNodeData = (id: string) => nodes.value.find(n => n.id === id)?.data || {};
const updateNodeData = (id: string, data: any) => {
  const n = nodes.value.find(n => n.id === id);
  if (n) n.data = { ...n.data, ...data };
};

const openConditionDialog = (nodeId: string, index: number) => {
  editingNodeId.value = nodeId;
  editingConditionIndex.value = index;
  const data = getNodeData(nodeId);
  editingCondition.value = index >= 0 ? { ...data.conditions[index] } : null;
  conditionDialogVisible.value = true;
};
const handleConditionSave = (c: any) => {
  const data = getNodeData(editingNodeId.value);
  const list = [...(data.conditions || [])];
  if (editingConditionIndex.value >= 0) list[editingConditionIndex.value] = c; else list.push(c);
  updateNodeData(editingNodeId.value, { conditions: list });
  conditionDialogVisible.value = false;
  if (selectedNode.value?.id === editingNodeId.value) selectedNode.value = {
    ...selectedNode.value,
    data: { ...data, conditions: list }
  };
};
const deleteCondition = (nodeId: string, i: number) => {
  const d = getNodeData(nodeId);
  const l = [...(d.conditions || [])];
  l.splice(i, 1);
  updateNodeData(nodeId, { conditions: l });
};

const openActionDialog = (nodeId: string, index: number) => {
  editingNodeId.value = nodeId;
  editingActionIndex.value = index;
  const data = getNodeData(nodeId);
  editingAction.value = index >= 0 ? { ...data.actions[index] } : null;
  actionDialogVisible.value = true;
};
const handleActionSave = (a: any) => {
  const data = getNodeData(editingNodeId.value);
  const list = [...(data.actions || [])];
  if (editingActionIndex.value >= 0) list[editingActionIndex.value] = a; else list.push(a);
  updateNodeData(editingNodeId.value, { actions: list });
  actionDialogVisible.value = false;
  if (selectedNode.value?.id === editingNodeId.value) selectedNode.value = {
    ...selectedNode.value,
    data: { ...data, actions: list }
  };
};
const deleteAction = (nodeId: string, i: number) => {
  const d = getNodeData(nodeId);
  const l = [...(d.actions || [])];
  l.splice(i, 1);
  updateNodeData(nodeId, { actions: l });
};

const openGatewayDialog = (id: string) => {
  editingNodeId.value = id;
  const d = getNodeData(id);
  editingGateway.value = {
    name: d.name || "网关",
    gatewayType: d.gatewayType || "XOR",
    branches: d.branches ? JSON.parse(JSON.stringify(d.branches)) : []
  };
  gatewayDialogVisible.value = true;
};
const handleGatewaySave = (g: any) => {
  updateNodeData(editingNodeId.value, g);
  gatewayDialogVisible.value = false;
};

const openVariableDialog = (id: string) => {
  editingNodeId.value = id;
  const d = getNodeData(id);
  editingAssignments.value = d.assignments ? JSON.parse(JSON.stringify(d.assignments)) : [];
  variableDialogVisible.value = true;
};
const handleVariableSave = (a: any[]) => {
  updateNodeData(editingNodeId.value, { assignments: a });
  variableDialogVisible.value = false;
};
const deleteAssignment = (nodeId: string, i: number) => {
  const d = getNodeData(nodeId);
  const l = [...(d.assignments || [])];
  l.splice(i, 1);
  updateNodeData(nodeId, { assignments: l });
};

const openScriptDialog = (id: string) => {
  editingNodeId.value = id;
  const d = getNodeData(id);
  editingScript.value = { scriptLang: d.scriptLang || "javascript", scriptContent: d.scriptContent || "" };
  scriptDialogVisible.value = true;
};
const handleScriptSave = (s: any) => {
  updateNodeData(editingNodeId.value, s);
  scriptDialogVisible.value = false;
};

const openHttpDialog = (id: string) => {
  editingNodeId.value = id;
  editingHttpConfig.value = JSON.parse(JSON.stringify(getNodeData(id)));
  httpDialogVisible.value = true;
};
const handleHttpSave = (c: any) => {
  updateNodeData(editingNodeId.value, c);
  httpDialogVisible.value = false;
};

const openRuleSetRefDialog = (id: string) => {
  editingNodeId.value = id;
  editingRuleSetRef.value = JSON.parse(JSON.stringify(getNodeData(id)));
  ruleSetRefDialogVisible.value = true;
};
const handleRuleSetRefSave = (c: any) => {
  updateNodeData(editingNodeId.value, c);
  ruleSetRefDialogVisible.value = false;
};

const openLoopDialog = (id: string) => {
  editingNodeId.value = id;
  editingLoopConfig.value = JSON.parse(JSON.stringify(getNodeData(id)));
  loopDialogVisible.value = true;
};
const handleLoopSave = (c: any) => {
  updateNodeData(editingNodeId.value, c);
  loopDialogVisible.value = false;
};

const openPropertyDialog = () => {
  propertyDialogVisible.value = true;
};
const handlePropertySave = (d: any) => {
  Object.assign(ruleData, d);
  propertyDialogVisible.value = false;
};

const handleEdgeLabelSave = () => {
  if (editingEdge.value) {
    editingEdge.value.label = edgeLabel.value;
    editingEdge.value.labelShowBg = true;
    // 标记为手动编辑，后续自动更新不会覆盖
    if (!editingEdge.value.data) editingEdge.value.data = {};
    // 如果用户清空了标签，恢复自动生成逻辑
    if (!edgeLabel.value || edgeLabel.value.trim() === "") {
      editingEdge.value.data.manualLabel = false;
      // 立即触发自动更新
      const sourceNode = nodes.value.find(n => n.id === editingEdge.value.source);
      if (sourceNode) {
        const outEdges = edges.value.filter(e => e.source === editingEdge.value.source);
        const edgeIndex = outEdges.findIndex(e => e.id === editingEdge.value.id);
        if (edgeIndex >= 0) {
          const { label, labelStyle } = generateEdgeLabel(sourceNode, edgeIndex);
          editingEdge.value.label = label;
          editingEdge.value.labelStyle = labelStyle;
        }
      }
    } else {
      editingEdge.value.data.manualLabel = true;
    }
  }
  edgeLabelDialogVisible.value = false;
};

// ========== 边标签自动同步 ==========
// 根据节点类型和配置自动生成边标签
const generateEdgeLabel = (sourceNode: any, edgeIndex: number): { label: string; labelStyle: any } => {
  const sourceType = sourceNode.type === "generic" ? sourceNode.data.__nodeType : sourceNode.type;
  let label = "";
  let labelStyle = { fill: "#64748b", fontSize: 11, fontWeight: 500 };

  switch (sourceType) {
    case "condition": {
      // 条件节点：第一条出边标注"满足✓"，第二条标注"不满足✗"
      if (edgeIndex === 0) {
        label = "满足 ✓";
        labelStyle = { fill: "#10b981", fontSize: 11, fontWeight: 600 };
      } else {
        label = "不满足 ✗";
        labelStyle = { fill: "#ef4444", fontSize: 11, fontWeight: 600 };
      }
      break;
    }
    case "exclusive-gateway": {
      // 排他网关：根据分支配置自动生成条件摘要
      const branches = sourceNode.data.branches || [];
      if (edgeIndex < branches.length) {
        const branch = branches[edgeIndex];
        label = branch.condition || branch.label || `分支${edgeIndex + 1}`;
      } else {
        label = "默认分支";
      }
      labelStyle = { fill: "#f59e0b", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "parallel-gateway": {
      label = "并行执行";
      labelStyle = { fill: "#06b6d4", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "inclusive-gateway": {
      const branches = sourceNode.data.branches || [];
      if (edgeIndex < branches.length) {
        const branch = branches[edgeIndex];
        label = branch.condition || branch.label || `分支${edgeIndex + 1}`;
      } else {
        label = "默认分支";
      }
      labelStyle = { fill: "#8b5cf6", fontSize: 11, fontWeight: 600 };
      break;
    }
    case "variable-assign": {
      const assignments = sourceNode.data.assignments || [];
      if (assignments.length > 0) {
        label = `设置 ${assignments.map(a => a.variableName).join(", ")}`;
      } else {
        label = "变量赋值";
      }
      labelStyle = { fill: "#6366f1", fontSize: 11, fontWeight: 500 };
      break;
    }
    case "action": {
      const actions = sourceNode.data.actions || [];
      if (actions.length > 0) {
        label = `${actions.length}个动作`;
      } else {
        label = "执行动作";
      }
      break;
    }
    case "loop": {
      label = `遍历 ${sourceNode.data.collectionVar || "集合"}`;
      break;
    }
    case "script": {
      label = "执行脚本";
      break;
    }
    case "http-call": {
      label = `${sourceNode.data.method || "GET"} ${sourceNode.data.url || "接口"}`;
      break;
    }
    default: {
      const nodeLabel = getNodeLabel(sourceType);
      label = nodeLabel || sourceType;
    }
  }

  return { label, labelStyle };
};

// 更新指定节点的所有出边标签（跳过手动编辑过的边）
const updateEdgeLabelsForNode = (nodeId: string) => {
  const sourceNode = nodes.value.find(n => n.id === nodeId);
  if (!sourceNode) return;

  const outEdges = edges.value.filter(e => e.source === nodeId);
  outEdges.forEach((edge, index) => {
    // 如果边被手动编辑过，跳过自动更新
    if (edge.data?.manualLabel) return;

    const { label, labelStyle } = generateEdgeLabel(sourceNode, index);
    edge.label = label;
    edge.labelStyle = labelStyle;
    edge.labelShowBg = true;
    edge.labelBgStyle = { fill: "#fff", fillOpacity: 0.9 };
  });
};

// 监听节点数据变化，自动更新边标签
watch(() => nodes.value, (newNodes) => {
  // 遍历所有节点，更新其出边标签
  newNodes.forEach(node => {
    const nodeType = node.type === "generic" ? node.data.__nodeType : node.type;
    // 只对需要自动生成边标签的节点类型进行处理
    if (["condition", "exclusive-gateway", "inclusive-gateway", "parallel-gateway",
      "variable-assign", "action", "loop", "script", "http-call"].includes(nodeType)) {
      updateEdgeLabelsForNode(node.id);
    }
  });
}, { deep: true });

// ========== 右键菜单 ==========
const onCanvasContextMenu = (e: MouseEvent) => {
  const target = e.target as HTMLElement;
  const nodeEl = target.closest(".vue-flow__node");
  const edgeEl = target.closest(".vue-flow__edge");
  contextMenu.visible = true;
  contextMenu.x = e.clientX;
  contextMenu.y = e.clientY;
  if (nodeEl) {
    const id = nodeEl.getAttribute("data-id") || "";
    contextMenu.type = "node";
    contextMenu.nodeId = id;
    contextMenu.edgeId = "";
    nodes.value.forEach(n => {
      n.selected = n.id === id;
    });
  } else if (edgeEl) {
    const id = edgeEl.getAttribute("data-id") || "";
    contextMenu.type = "edge";
    contextMenu.nodeId = "";
    contextMenu.edgeId = id;
    edges.value.forEach(e2 => {
      e2.selected = e2.id === id;
    });
  } else {
    contextMenu.type = "pane";
    contextMenu.nodeId = "";
    contextMenu.edgeId = "";
  }
};
const closeContextMenu = () => {
  contextMenu.visible = false;
};
const handleCtxAction = (action: string) => {
  const { type, nodeId, edgeId } = contextMenu;
  switch (action) {
    case "edit":
      if (nodeId) {
        const n = nodes.value.find(n => n.id === nodeId);
        if (n) onNodeDoubleClick({ node: n });
      }
      break;
    case "copy":
      if (nodeId) {
        const n = nodes.value.find(n => n.id === nodeId);
        if (n) {
          clipboard.value = JSON.parse(JSON.stringify(n));
          success("已复制");
        }
      }
      break;
    case "paste":
      if (clipboard.value) {
        addNodes({
          ...JSON.parse(JSON.stringify(clipboard.value)),
          id: generateNodeId(clipboard.value.type || "node"),
          position: { x: clipboard.value.position.x + 60, y: clipboard.value.position.y + 60 },
          selected: false
        });
        success("已粘贴");
      } else warning("剪贴板为空");
      break;
    case "delete":
      if (type === "node" && nodeId) {
        edges.value = edges.value.filter(e => e.source !== nodeId && e.target !== nodeId);
        removeNodes([nodeId]);
        success("已删除");
      } else if (type === "edge" && edgeId) {
        removeEdges([edgeId]);
        success("已删除");
      }
      break;
    case "editEdge":
      if (edgeId) {
        const e = edges.value.find(e => e.id === edgeId);
        if (e) {
          editingEdge.value = e;
          edgeLabel.value = (e.label as string) || "";
          edgeLabelDialogVisible.value = true;
        }
      }
      break;
    case "fitView":
      fitViewFn({ duration: 300 });
      break;
  }
  closeContextMenu();
};

// ========== 删除选中 ==========
const hasSelected = computed(() => nodes.value?.some(n => n.selected) || edges.value?.some(e => e.selected));
const hasMultiSelected = computed(() => nodes.value?.filter(n => n.selected).length >= 2);
const deleteSelected = () => {
  const sn = nodes.value.filter(n => n.selected);
  const se = edges.value.filter(e => e.selected);
  if (!sn.length && !se.length) {
    warning("请先选中");
    return;
  }
  if (sn.length) {
    const ids = sn.map(n => n.id);
    edges.value = edges.value.filter(e => !ids.includes(e.source) && !ids.includes(e.target));
    removeNodes(ids);
  }
  if (se.length) removeEdges(se.map(e => e.id));
  success(`已删除 ${sn.length} 节点, ${se.length} 连线`);
  pushHistory();
};

// ========== Undo/Redo 历史栈 ==========
const historyStack = ref<{ nodes: any[]; edges: any[] }[]>([]);
const historyIndex = ref(-1);
const MAX_HISTORY = 50;
let historyTimer: any = null;

const canUndo = computed(() => historyIndex.value > 0);
const canRedo = computed(() => historyIndex.value < historyStack.value.length - 1);

// 防抖推入历史栈（避免拖拽时频繁记录）
const pushHistory = () => {
  if (historyTimer) clearTimeout(historyTimer);
  historyTimer = setTimeout(() => {
    const snapshot = {
      nodes: JSON.parse(JSON.stringify(nodes.value)),
      edges: JSON.parse(JSON.stringify(edges.value))
    };
    // 如果当前不在末尾，截断后面的历史
    if (historyIndex.value < historyStack.value.length - 1) {
      historyStack.value = historyStack.value.slice(0, historyIndex.value + 1);
    }
    historyStack.value.push(snapshot);
    if (historyStack.value.length > MAX_HISTORY) historyStack.value.shift();
    historyIndex.value = historyStack.value.length - 1;
  }, 300);
};

const undo = () => {
  if (!canUndo.value) return;
  historyIndex.value--;
  const snapshot = historyStack.value[historyIndex.value];
  nodes.value = JSON.parse(JSON.stringify(snapshot.nodes));
  edges.value = JSON.parse(JSON.stringify(snapshot.edges));
  selectedNode.value = null;
};

const redo = () => {
  if (!canRedo.value) return;
  historyIndex.value++;
  const snapshot = historyStack.value[historyIndex.value];
  nodes.value = JSON.parse(JSON.stringify(snapshot.nodes));
  edges.value = JSON.parse(JSON.stringify(snapshot.edges));
  selectedNode.value = null;
};

// ========== 对齐工具 ==========
const handleAlign = (cmd: string) => {
  const selected = nodes.value.filter(n => n.selected);
  if (selected.length < 2) {
    warning("请框选至少2个节点");
    return;
  }

  switch (cmd) {
    case "left": {
      const minX = Math.min(...selected.map(n => n.position.x));
      selected.forEach(n => n.position = { ...n.position, x: minX });
      break;
    }
    case "right": {
      const maxX = Math.max(...selected.map(n => n.position.x + getNodeSize(n).width));
      selected.forEach(n => n.position = { ...n.position, x: maxX - getNodeSize(n).width });
      break;
    }
    case "center": {
      const minX = Math.min(...selected.map(n => n.position.x));
      const maxX = Math.max(...selected.map(n => n.position.x + getNodeSize(n).width));
      const centerX = (minX + maxX) / 2;
      selected.forEach(n => n.position = { ...n.position, x: centerX - getNodeSize(n).width / 2 });
      break;
    }
    case "top": {
      const minY = Math.min(...selected.map(n => n.position.y));
      selected.forEach(n => n.position = { ...n.position, y: minY });
      break;
    }
    case "bottom": {
      const maxY = Math.max(...selected.map(n => n.position.y + getNodeSize(n).height));
      selected.forEach(n => n.position = { ...n.position, y: maxY - getNodeSize(n).height });
      break;
    }
    case "middle": {
      const minY = Math.min(...selected.map(n => n.position.y));
      const maxY = Math.max(...selected.map(n => n.position.y + getNodeSize(n).height));
      const centerY = (minY + maxY) / 2;
      selected.forEach(n => n.position = { ...n.position, y: centerY - getNodeSize(n).height / 2 });
      break;
    }
    case "hDist": {
      // 水平分布：按X排序后均匀分布
      const sorted = [...selected].sort((a, b) => a.position.x - b.position.x);
      if (sorted.length < 3) {
        warning("至少需要3个节点");
        return;
      }
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalWidth = (last.position.x + getNodeSize(last).width) - first.position.x;
      const gap = (totalWidth - sorted.reduce((s, n) => s + getNodeSize(n).width, 0)) / (sorted.length - 1);
      let xPos = first.position.x;
      sorted.forEach(n => {
        n.position = { ...n.position, x: xPos };
        xPos += getNodeSize(n).width + gap;
      });
      break;
    }
    case "vDist": {
      // 垂直分布：按Y排序后均匀分布
      const sorted = [...selected].sort((a, b) => a.position.y - b.position.y);
      if (sorted.length < 3) {
        warning("至少需要3个节点");
        return;
      }
      const first = sorted[0];
      const last = sorted[sorted.length - 1];
      const totalHeight = (last.position.y + getNodeSize(last).height) - first.position.y;
      const gap = (totalHeight - sorted.reduce((s, n) => s + getNodeSize(n).height, 0)) / (sorted.length - 1);
      let yPos = first.position.y;
      sorted.forEach(n => {
        n.position = { ...n.position, y: yPos };
        yPos += getNodeSize(n).height + gap;
      });
      break;
    }
  }
  pushHistory();
  success("对齐完成");
};

// ========== 连线类型 ==========
const edgeType = ref<string>("default");
const handleEdgeType = (type: string) => {
  edgeType.value = type;
  edges.value.forEach(e => {
    e.type = type;
  });
};

// ========== 画布操作 ==========
const fitView = () => fitViewFn({ duration: 300 });

// 估算节点尺寸（用于自动布局避免重叠）
const getNodeSize = (node: any): { width: number; height: number } => {
  const t = node.type === "generic" ? node.data?.__nodeType : node.type;
  switch (t) {
    case "start":
    case "end":
      return { width: 80, height: 80 };
    case "exclusive-gateway":
    case "parallel-gateway":
    case "inclusive-gateway":
    case "join":
      return { width: 80, height: 80 };
    case "condition":
      return { width: 300, height: 120 + ((node.data?.conditions?.length || 0) * 28) };
    case "action":
      return { width: 300, height: 100 + ((node.data?.actions?.length || 0) * 28) };
    case "variable-assign":
      return { width: 300, height: 100 + ((node.data?.assignments?.length || 0) * 28) };
    case "decision-table":
      return { width: 320, height: 160 };
    case "script":
      return { width: 300, height: 140 };
    case "http-call":
      return { width: 300, height: 160 };
    case "rule-set-ref":
      return { width: 300, height: 140 };
    case "loop":
      return { width: 300, height: 120 };
    default:
      return { width: 260, height: 100 };
  }
};

const autoLayout = () => {
  if (!nodes.value.length) {
    warning("画布为空");
    return;
  }

  // 1. BFS分层（拓扑排序）
  const startNodes = nodes.value.filter(n => n.type === "start");
  const visited = new Set<string>();
  const levels: Record<string, number> = {};
  const queue = (startNodes.length ? startNodes : [nodes.value[0]]).map(n => ({ id: n.id, level: 0 }));
  while (queue.length) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) {
      levels[id] = Math.max(levels[id] || 0, level);
      continue;
    }
    visited.add(id);
    levels[id] = level;
    edges.value.filter(e => e.source === id).forEach(e => {
      queue.push({ id: e.target, level: level + 1 });
    });
  }
  let maxLevel = 0;
  nodes.value.forEach(n => {
    if (!(n.id in levels)) levels[n.id] = 0;
    maxLevel = Math.max(maxLevel, levels[n.id]);
  });
  nodes.value.forEach(n => {
    if (!visited.has(n.id)) levels[n.id] = maxLevel + 1;
  });

  // 2. 按层分组
  const groups: Record<number, string[]> = {};
  Object.entries(levels).forEach(([id, lv]) => {
    if (!groups[lv]) groups[lv] = [];
    groups[lv].push(id);
  });

  // 3. 动态计算每层位置（Y轴根据上层最大节点高度累加，避免重叠）
  const NODE_GAP_X = 80;    // 节点间水平间距
  const LAYER_GAP_Y = 80;   // 层间额外垂直间距
  const START_Y = 50;
  let currentY = START_Y;

  // 按层级从小到大处理
  const sortedLayers = Object.keys(groups).map(Number).sort((a, b) => a - b);
  sortedLayers.forEach((layer, idx) => {
    const ids = groups[layer];
    const layerNodes = ids.map(id => nodes.value.find(n => n.id === id)).filter(Boolean) as any[];
    if (!layerNodes.length) return;

    // 计算该层所有节点的总宽度
    const sizes = layerNodes.map(n => getNodeSize(n));
    const totalWidth = sizes.reduce((sum, s) => sum + s.width, 0) + (layerNodes.length - 1) * NODE_GAP_X;
    // 该层最大高度
    const max_height = Math.max(...sizes.map(s => s.height));

    // 从中心开始水平排布
    let xPos = -totalWidth / 2;
    layerNodes.forEach((n, i) => {
      const size = sizes[i];
      n.position = { x: xPos + size.width / 2, y: currentY };
      xPos += size.width + NODE_GAP_X;
    });

    // Y轴累加：当前层最大高度 + 层间距
    currentY += max_height + LAYER_GAP_Y;
  });

  setTimeout(() => fitViewFn({ duration: 300 }), 100);
  success("已自动布局");
};

// 对选中节点进行局部自动布局
const layoutSelected = () => {
  const selectedNodes = nodes.value.filter(n => n.selected);
  if (selectedNodes.length < 2) {
    warning("请框选至少2个节点");
    return;
  }

  // 提取选中节点之间的边（仅选中节点构成的子图）
  const selectedIds = new Set(selectedNodes.map(n => n.id));
  const subEdges = edges.value.filter(e => selectedIds.has(e.source) && selectedIds.has(e.target));

  // BFS分层（在子图内）
  const levels: Record<string, number> = {};
  const visited = new Set<string>();
  // 入口：选中节点中没有入边（在子图内）的节点
  const entryNodes = selectedNodes.filter(n => !subEdges.some(e => e.target === n.id));
  const queue = (entryNodes.length ? entryNodes : [selectedNodes[0]]).map(n => ({ id: n.id, level: 0 }));
  while (queue.length) {
    const { id, level } = queue.shift()!;
    if (visited.has(id)) {
      levels[id] = Math.max(levels[id] || 0, level);
      continue;
    }
    visited.add(id);
    levels[id] = level;
    subEdges.filter(e => e.source === id).forEach(e => {
      queue.push({ id: e.target, level: level + 1 });
    });
  }
  selectedNodes.forEach(n => {
    if (!(n.id in levels)) levels[n.id] = 0;
  });

  // 分组
  const groups: Record<number, any[]> = {};
  Object.entries(levels).forEach(([id, lv]) => {
    if (!groups[lv]) groups[lv] = [];
    groups[lv].push(nodes.value.find(n => n.id === id));
  });

  // 计算选中节点整体的中心点（作为布局起点）
  const centerX = selectedNodes.reduce((sum, n) => sum + n.position.x, 0) / selectedNodes.length;
  const startY = Math.min(...selectedNodes.map(n => n.position.y));

  const NODE_GAP_X = 80;
  const LAYER_GAP_Y = 80;
  let currentY = startY;

  const sortedLayers = Object.keys(groups).map(Number).sort((a, b) => a - b);
  sortedLayers.forEach(layer => {
    const layerNodes = groups[layer].filter(Boolean);
    if (!layerNodes.length) return;
    const sizes = layerNodes.map((n: any) => getNodeSize(n));
    const totalWidth = sizes.reduce((sum: number, s: any) => sum + s.width, 0) + (layerNodes.length - 1) * NODE_GAP_X;
    const maxH = Math.max(...sizes.map((s: any) => s.height));

    let xPos = centerX - totalWidth / 2;
    layerNodes.forEach((n: any, i: number) => {
      const size = sizes[i];
      n.position = { x: xPos + size.width / 2, y: currentY };
      xPos += size.width + NODE_GAP_X;
    });
    currentY += maxH + LAYER_GAP_Y;
  });

  success(`已对 ${selectedNodes.length} 个选中节点布局`);
};
const clearCanvas = async () => {
  await operationConfirm("确定清空画布？");
  nodes.value = [];
  edges.value = [];
  initDefaultFlow();
};

// ========== 高亮 ==========
const isTestMode = ref(false);
const handleHighlightPath = (path: any) => {
  isTestMode.value = true;
  const nodeIds = new Set(path.visitedNodeIds);
  const edgeIds = new Set(path.visitedEdgeIds);
  nodes.value.forEach(n => {
    const v = nodeIds.has(n.id);
    if (n.data) {
      n.data.__highlighted = v;
      n.data.__dimmed = !v;
    }
    ;n.class = v ? "node-highlighted" : (path.visitedNodeIds.length ? "node-dimmed" : "");
  });
  edges.value.forEach(e => {
    const v = edgeIds.has(e.id);
    if (v) {
      e.animated = true;
      e.style = { stroke: "#10b981", strokeWidth: 3 };
      e.class = "edge-highlighted";
    } else {
      e.animated = false;
      e.style = { stroke: "#cbd5e1", strokeWidth: 1 };
      e.class = path.visitedEdgeIds.length ? "edge-dimmed" : "";
    }
  });
};
const handleResetHighlight = () => {
  isTestMode.value = false;
  nodes.value.forEach(n => {
    if (n.data) {
      delete n.data.__highlighted;
      delete n.data.__dimmed;
    }
    ;n.class = "";
  });
  edges.value.forEach(e => {
    e.animated = false;
    e.style = { stroke: "#6366f1", strokeWidth: 2 };
    e.class = "";
  });
};

// ========== 测试控制台 ==========
const displaySteps = computed(() => {
  if (!executionPath.value) return [];
  return isStepping.value ? executionPath.value.steps.slice(0, stepIndex.value + 1) : executionPath.value.steps;
});
const executeTest = async () => {
  let d: any;
  if (jsonMode.value) {
    if (!testDataStr.value.trim()) {
      warning("请输入测试数据");
      return;
    }
    try {
      d = JSON.parse(testDataStr.value);
    } catch {
      error("JSON格式错误");
      return;
    }
  } else {
    // 表单模式：从testFormData构建
    d = {};
    testFields.value.forEach(f => {
      const val = testFormData[f.name];
      if (val !== undefined && val !== "") {
        if (f.type === "NUMBER") d[f.name] = Number(val);
        else if (f.type === "ARRAY") d[f.name] = String(val).split(",").map(s => s.trim());
        else if (f.type === "BOOLEAN") d[f.name] = val;
        else d[f.name] = val;
      }
    });
  }
  executing.value = true;
  isStepping.value = false;
  try {
    await new Promise(r => setTimeout(r, 200));
    const r = executeRuleFlow(nodes.value, edges.value, d);
    executionPath.value = r;
    handleHighlightPath(r);
    outputTab.value = "timeline";
    success(`执行完成，经过 ${r.visitedNodeIds.length} 节点`);
  } catch (e: any) {
    error("执行失败: " + e.message);
  } finally {
    executing.value = false;
  }
};
const stepExecute = () => {
  if (!executionPath.value) return;
  if (!isStepping.value) {
    isStepping.value = true;
    stepIndex.value = 0;
  } else if (stepIndex.value < executionPath.value.steps.length - 1) stepIndex.value++; else {
    warning("已到最后一步");
    return;
  }
  handleHighlightPath({
    ...executionPath.value,
    visitedNodeIds: executionPath.value.visitedNodeIds.slice(0, stepIndex.value + 1),
    visitedEdgeIds: executionPath.value.visitedEdgeIds.slice(0, stepIndex.value + 1),
    steps: executionPath.value.steps.slice(0, stepIndex.value + 1)
  });
};
const clearTestResult = () => {
  isStepping.value = false;
  executionPath.value = null;
  handleResetHighlight();
};
const closeTestConsole = () => {
  testConsoleVisible.value = false;
  isStepping.value = false;
  executionPath.value = null;
  handleResetHighlight();
};
const loadSampleData = () => {
  if (jsonMode.value) {
    const d: any = {};
    testFields.value.forEach(f => {
      d[f.name] = f.type === "NUMBER" ? 100 : "sample";
    });
    if (!Object.keys(d).length) {
      d.amount = 6000;
      d.userType = "vip";
    }
    testDataStr.value = JSON.stringify(d, null, 2);
  } else {
    // 表单模式：填充默认值
    testFields.value.forEach(f => {
      if (f.type === "NUMBER") testFormData[f.name] = 100;
      else if (f.type === "BOOLEAN") testFormData[f.name] = true;
      else testFormData[f.name] = "sample";
    });
  }
  success("已加载示例数据");
};

const switchToJsonMode = () => {
  if (!jsonMode.value) {
    // 切到JSON模式：把表单数据序列化
    const d: any = {};
    testFields.value.forEach(f => {
      const val = testFormData[f.name];
      if (val !== undefined && val !== "") d[f.name] = val;
    });
    testDataStr.value = JSON.stringify(d, null, 2);
  }
  jsonMode.value = !jsonMode.value;
};
const getStepType = (s: string) => s === "SUCCESS" ? "success" : s === "FAILED" ? "danger" : s === "SKIPPED" ? "info" : "primary";
const formatJson = (o: any) => {
  try {
    return JSON.stringify(o, null, 2);
  } catch {
    return String(o);
  }
};

// ========== 数据加载保存 ==========
const allConditions = computed(() => {
  const c: any[] = [];
  nodes.value.filter(n => n.type === "condition").forEach(n => (n.data.conditions || []).forEach((cond: any) => c.push({
    ...cond,
    logic: n.data.logic || "AND"
  })));
  return c;
});
const allActions = computed(() => {
  const a: any[] = [];
  nodes.value.filter(n => n.type === "action").forEach(n => (n.data.actions || []).forEach((act: any) => a.push(act)));
  return a;
});

const loadRuleData = async () => {
  if (!ruleId.value) {
    initDefaultFlow();
    return;
  }
  try {
    const res = await ruleDefinitionApi.getRuleById(ruleId.value);
    if (res.data.code === 200 && res.data.data) {
      Object.assign(ruleData, res.data.data);
      if (ruleData.flowContent) {
        try {
          const f = JSON.parse(ruleData.flowContent);
          nodes.value = f.nodes || [];
          edges.value = f.edges || [];
        } catch {
          initDefaultFlow();
        }
      } else {
        initDefaultFlow();
      }
    }
  } catch {
    error("加载失败");
    initDefaultFlow();
  }
};

const handleSave = async () => {
  if (!ruleData.ruleCode || !ruleData.ruleName) {
    warning("请填写规则编码和名称");
    return;
  }
  saving.value = true;
  try {
    ruleData.flowContent = JSON.stringify({
      nodes: nodes.value.map(n => ({ ...n, selected: false })),
      edges: edges.value.map(e => ({ ...e, selected: false }))
    });
    let id = ruleData.idRuleDefinition;
    if (id) await ruleDefinitionApi.updateRule(ruleData);
    else {
      const r = await ruleDefinitionApi.saveRule(ruleData);
      if (r.data.code === 200) {
        id = r.data.data;
        ruleData.idRuleDefinition = id;
      }
    }
    await ruleConditionApi.deleteByRuleId(id);
    const cs = allConditions.value;
    if (cs.length) await ruleConditionApi.batchSaveConditions(cs.map((c, i) => ({
      ...c,
      idRuleDefinition: id,
      conditionIndex: i
    })));
    await ruleActionApi.deleteByRuleId(id);
    const as = allActions.value;
    if (as.length) await ruleActionApi.batchSaveActions(as.map((a, i) => ({
      ...a,
      idRuleDefinition: id,
      actionIndex: i
    })));
    success("保存成功");
    emit("saved");
  } catch {
    error("保存失败");
  } finally {
    saving.value = false;
  }
};

const handleTest = () => {
  if (!nodes.value.length) {
    warning("流程图为空");
    return;
  }
  testConsoleVisible.value = true;
};
const handlePublish = async () => {
  await operationConfirm("确定发布？");
  try {
    ruleData.status = "PUBLISHED";
    await ruleDefinitionApi.updateRule(ruleData);
    success("发布成功");
  } catch {
    error("发布失败");
  }
};

const getStatusType = (s: string) => ({ DRAFT: "info", PUBLISHED: "success", DISABLED: "danger" }[s] || "info");
const getStatusText = (s: string) => ({ DRAFT: "草稿", PUBLISHED: "已发布", DISABLED: "已禁用" }[s] || s);

const loadDemoData = async () => {
  const { value: demoType } = await ElMessageBox.prompt(
    "请选择规则引擎Demo类型：\n" + DEMO_LIST.map(d => `${d.id}. ${d.name}（${d.desc}）`).join("\n"),
    "加载规则引擎Demo",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPattern: /^[1-6]$/,
      inputErrorMessage: "请输入1-6之间的数字",
      inputValue: "1"
    }
  );

  const demo = DEMO_LIST.find(d => d.id === demoType);
  if (demo) {
    ruleData.ruleCode = demo.data.ruleCode;
    ruleData.ruleName = demo.data.ruleName;
    ruleData.ruleDesc = demo.data.ruleDesc;
    nodes.value = JSON.parse(JSON.stringify(demo.data.nodes));
    edges.value = JSON.parse(JSON.stringify(demo.data.edges));
    setTimeout(() => fitViewFn({ duration: 500 }), 100);
    success("规则引擎Demo已加载，点击测试体验决策路径");
    pushHistory();
  }
};

const onGlobalClick = () => {
  if (contextMenu.visible) closeContextMenu();
};

// 键盘快捷键
const handleKeydown = (e: KeyboardEvent) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
    e.preventDefault();
    undo();
  } else if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
    e.preventDefault();
    redo();
  }
};

onMounted(() => {
  loadRuleData();
  document.addEventListener("click", onGlobalClick);
  document.addEventListener("keydown", handleKeydown);
  // 初始化历史栈
  setTimeout(() => pushHistory(), 500);
});
onUnmounted(() => {
  document.removeEventListener("click", onGlobalClick);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped lang="scss">
.rule-designer {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;

  .designer-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: #fff;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    z-index: 10;

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .rule-name-input {
        width: 260px;

        :deep(.el-input__inner) {
          font-size: 14px;
          font-weight: 600;
        }
      }
    }

    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  .designer-body {
    flex: 1;
    overflow: hidden;
    border-top: 1px solid #e2e8f0;
  }

  .left-pane {
    background: #fff;
    overflow: hidden;
  }

  .right-pane {
    background: #fff;
    overflow: hidden;
  }

  .center-pane {
    display: flex;
    flex-direction: column;
    background: #f8fafc;
    min-width: 0;
    overflow: hidden;

    .canvas-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 14px;
      background: #fff;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;

      .canvas-title {
        display: flex;
        align-items: center;
        gap: 5px;
        font-weight: 600;
        font-size: 13px;
        color: #1e293b;
      }

      .canvas-actions {
        display: flex;
        align-items: center;
        gap: 2px;

        .canvas-tip {
          font-size: 11px;
          color: #94a3b8;
          margin-left: 4px;
        }

        :deep(.is-active) {
          color: #6366f1;
          font-weight: 600;
        }
      }
    }

    .canvas-body {
      flex: 1;
      position: relative;
      overflow: hidden;

      .vue-flow-instance {
        width: 100%;
        height: 100%;
      }

      /* 节点选中交互效果 */
      :deep(.vue-flow__node) {
        transition: box-shadow 0.2s, transform 0.2s;

        &.selected {
          .rule-node, .gateway-shape, .start-shape, .end-shape, .generic-node {
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.5), 0 8px 24px rgba(99, 102, 241, 0.3) !important;
            transform: translateY(-2px);
          }

          .gateway-shape {
            filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
          }
        }

        &:hover:not(.selected) {
          .rule-node, .generic-node {
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          }
        }
      }

      /* 连线选中效果 */
      :deep(.vue-flow__edge) {
        &.selected {
          .vue-flow__edge-path {
            stroke: #6366f1 !important;
            stroke-width: 3 !important;
          }

          .vue-flow__edge-text {
            fill: #6366f1 !important;
            font-weight: 600;
          }
        }

        &:hover:not(.selected) {
          .vue-flow__edge-path {
            stroke: #818cf8 !important;
            stroke-width: 2.5 !important;
          }
        }
      }

      /* 框选选择框样式 */
      :deep(.vue-flow__selection) {
        border: 2px dashed #6366f1 !important;
        background: rgba(99, 102, 241, 0.08) !important;
        border-radius: 4px;
      }

      /* 框选时节点提示 */
      :deep(.vue-flow__nodesselection-rect) {
        border: 2px dashed #6366f1 !important;
        background: rgba(99, 102, 241, 0.08) !important;
        border-radius: 4px;
      }

      .context-menu {
        position: fixed;
        z-index: 9999;
        min-width: 150px;
        background: #fff;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
        padding: 4px 0;
        user-select: none;

        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 14px;
          font-size: 13px;
          color: #334155;
          cursor: pointer;
          transition: background 0.15s;

          &:hover {
            background: #f1f5f9;
          }

          &.danger {
            color: #ef4444;

            &:hover {
              background: #fef2f2;
            }
          }

          .el-icon {
            font-size: 14px;
          }
        }

        .menu-divider {
          height: 1px;
          background: #e2e8f0;
          margin: 4px 0;
        }
      }
    }
  }

  .test-console-panel {
    overflow: hidden;
  }

  .test-console {
    height: 100%;
    background: #fff;
    display: flex;
    flex-direction: column;
    overflow: hidden;

    .console-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 12px;
      height: 36px;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      flex-shrink: 0;

      .console-tabs {
        display: flex;
        align-items: center;
        gap: 10px;

        .console-tab {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          color: #475569;
          font-weight: 600;
        }
      }

      .console-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }
    }

    .console-body {
      flex: 1;
      overflow: hidden;

      .console-left {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .console-right {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .pane-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 5px 12px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 11px;
        color: #64748b;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.4px;
        flex-shrink: 0;
      }

      .pane-body {
        flex: 1;
        overflow-y: auto;
        padding: 8px;

        .param-form {
          .el-form-item {
            margin-bottom: 12px;
          }

          .field-type-tag {
            margin-left: 6px;
          }
        }

        .json-input {
          :deep(.el-textarea__inner) {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            color: #1e293b;
            font-family: 'JetBrains Mono', 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.6;
            border-radius: 4px;

            &:focus {
              border-color: #6366f1;
              background: #fff;
            }
          }
        }

        .empty-output {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #94a3b8;

          p {
            margin: 8px 0 0;
            font-size: 13px;
          }

          .hint {
            font-size: 11px;
            color: #cbd5e1;
          }
        }

        .output-content {
          .step-card {
            background: #f8fafc;
            border-radius: 6px;
            padding: 8px 10px;
            margin-bottom: 6px;
            border-left: 3px solid transparent;

            &.step-current {
              border-left-color: #10b981;
              box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2);
            }

            .step-header {
              display: flex;
              align-items: center;
              gap: 6px;
              margin-bottom: 4px;

              .step-node-name {
                font-size: 12px;
                font-weight: 600;
                color: #1e293b;
              }

              .step-node-type {
                font-size: 10px;
                color: #94a3b8;
              }

              .step-duration {
                margin-left: auto;
                font-size: 10px;
                color: #94a3b8;
              }
            }

            .step-message {
              font-size: 11px;
              color: #475569;
              line-height: 1.5;
              padding: 4px 6px;
              background: #f1f5f9;
              border-radius: 3px;
              font-family: 'JetBrains Mono', monospace;
            }
          }

          .cond-item {
            margin-bottom: 8px;

            .cond-detail {
              margin-top: 4px;
              background: #f1f5f9;
              color: #1e293b;
              padding: 6px 10px;
              border-radius: 4px;
              font-size: 11px;
              font-family: 'JetBrains Mono', monospace;
              white-space: pre-wrap;
            }
          }

          .json-output {
            background: #f1f5f9;
            color: #1e293b;
            padding: 10px;
            border-radius: 4px;
            font-family: 'JetBrains Mono', monospace;
            font-size: 12px;
            line-height: 1.5;
          }
        }
      }
    }
  }
}

// el-splitter 样式微调（统一配色与拖拽条样式）
:deep(.el-splitter__bar) {
  background: #e2e8f0 !important;
  transition: background 0.2s ease;

  &:hover {
    background: #6366f1 !important;
  }
}

:deep(.el-splitter__bar-draggable) {
  &::after {
    background: transparent !important;
  }
}

:deep(.vue-flow) {
  .node-highlighted .node-card, .node-highlighted .gateway-shape {
    box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16, 185, 129, 0.4) !important;
    animation: pulse-h 1.5s ease-in-out infinite;
  }

  .node-dimmed {
    opacity: 0.3;
    transition: opacity 0.3s;
  }

  .edge-highlighted .vue-flow__edge-path {
    stroke: #10b981 !important;
    stroke-width: 3 !important;
    filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
    stroke-dasharray: 8;
    animation: dash-f 0.5s linear infinite;
  }

  .edge-dimmed .vue-flow__edge-path {
    opacity: 0.15;
  }
}

@keyframes pulse-h {
  0%, 100% {
    box-shadow: 0 0 0 3px #10b981, 0 0 20px rgba(16, 185, 129, 0.4);
  }
  50% {
    box-shadow: 0 0 0 5px #10b981, 0 0 30px rgba(16, 185, 129, 0.7);
  }
}

@keyframes dash-f {
  to {
    stroke-dashoffset: -16;
  }
}
</style>

<!-- 全局样式：确保 dropdown 弹出层不被裁剪 -->
<style>
.designer-dropdown-popper {
  z-index: 9999 !important;
}

.designer-dropdown-popper .is-active {
  color: #6366f1 !important;
  font-weight: 600 !important;
  background: #eef2ff !important;
}

/* 帮助面板样式 */
.help-popper.help-popper {
  z-index: 9999 !important;
}

.help-popper .help-panel {
  max-height: 480px;
  overflow-y: auto;
}

.help-popper .help-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.help-popper .help-section {
  margin-bottom: 10px;
}

.help-popper .help-section-title {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  margin-bottom: 4px;
  padding-left: 2px;
}

.help-popper .help-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #475569;
  padding: 2px 0;
}

.help-popper .help-row span {
  color: #94a3b8;
  margin-left: auto;
}

.help-popper kbd {
  display: inline-block;
  padding: 1px 6px;
  font-size: 11px;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #475569;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  white-space: nowrap;
}
</style>
