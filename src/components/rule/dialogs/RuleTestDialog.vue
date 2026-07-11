<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="规则测试执行"
    boxWidth="780px"
    boxHeight="80%"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleClose"
  >
    <div class="rule-test-dialog">
      <!-- 测试数据输入 -->
      <el-form label-width="100px">
        <el-form-item label="测试数据">
          <el-input
            v-model="testDataStr"
            type="textarea"
            :rows="8"
            placeholder='请输入JSON格式的测试数据，例如：&#10;{&#10;  "amount": 1500,&#10;  "status": "approved",&#10;  "userType": "vip"&#10;}'
          />
        </el-form-item>
      </el-form>

      <div class="test-actions">
        <el-button type="primary" @click="executeTest" :loading="executing">
          <el-icon>
            <VideoPlay />
          </el-icon>
          执行测试
        </el-button>
        <el-button @click="loadSampleData">
          <el-icon>
            <DocumentCopy />
          </el-icon>
          加载示例数据
        </el-button>
        <el-button @click="stepExecute" :disabled="!executionPath || executing">
          <el-icon>
            <VideoPause />
          </el-icon>
          单步回放
        </el-button>
        <el-button @click="resetHighlight" :disabled="!executionPath">
          <el-icon>
            <RefreshRight />
          </el-icon>
          清除高亮
        </el-button>
      </div>

      <!-- 执行步骤时间线 -->
      <div v-if="executionPath" class="test-result">
        <el-divider content-position="left">
          <span class="divider-title">执行路径回放</span>
        </el-divider>

        <el-descriptions :column="3" border class="result-summary">
          <el-descriptions-item label="执行状态">
            <el-tag :type="executionPath.success ? 'success' : 'danger'">
              {{ executionPath.success ? "成功" : "失败" }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="执行耗时">
            {{ executionPath.duration }} ms
          </el-descriptions-item>
          <el-descriptions-item label="经过节点">
            {{ executionPath.visitedNodeIds.length }} 个
          </el-descriptions-item>
        </el-descriptions>

        <!-- 时间线 -->
        <el-timeline class="exec-timeline">
          <el-timeline-item
            v-for="(step, idx) in displaySteps"
            :key="idx"
            :type="getStepType(step.status)"
            :timestamp="`${step.duration || 0}ms`"
            placement="top"
          >
            <div class="step-card">
              <div class="step-header">
                <el-tag :type="getStepType(step.status)" effect="dark">
                  {{ step.status }}
                </el-tag>
                <span class="step-node-name">{{ step.nodeName }}</span>
                <span class="step-node-type">[{{ step.nodeType }}]</span>
              </div>
              <div class="step-message">{{ step.message }}</div>
            </div>
          </el-timeline-item>
        </el-timeline>

        <!-- 条件评估结果 -->
        <div v-if="executionPath.conditionResults.length > 0">
          <el-divider content-position="left">条件评估</el-divider>
          <div v-for="cond in executionPath.conditionResults" :key="cond.nodeId" class="cond-result">
            <el-tag :type="cond.passed ? 'success' : 'info'">
              {{ cond.passed ? "满足" : "不满足" }}
            </el-tag>
            <pre class="cond-detail">{{ cond.detail }}</pre>
          </div>
        </div>

        <!-- 动作执行结果 -->
        <div v-if="executionPath.actionResults.length > 0">
          <el-divider content-position="left">动作执行结果</el-divider>
          <el-table :data="executionPath.actionResults" border>
            <el-table-column prop="actionType" label="动作类型" width="120" />
            <el-table-column prop="targetField" label="目标字段" width="150" />
            <el-table-column prop="success" label="状态" width="80">
              <template #default="{ row }">
                <el-tag :type="row.success ? 'success' : 'danger'">
                  {{ row.success ? "成功" : "失败" }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="消息" show-overflow-tooltip />
          </el-table>
        </div>

        <!-- 上下文数据 -->
        <el-divider content-position="left">执行后上下文数据</el-divider>
        <pre class="json-content">{{ formatJson(executionPath.context) }}</pre>
      </div>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { DocumentCopy, RefreshRight, VideoPause, VideoPlay } from "@element-plus/icons-vue";
import { executeRuleFlow, type ExecutionPath } from "../engine/RuleExecutor";
import { error, success, warning } from "star-horse-lowcode";

const props = defineProps<{
  visible: boolean
  ruleId: string
  conditions?: any[]
  nodes?: any[]
  edges?: any[]
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "highlight", path: ExecutionPath): void
  (e: "resetHighlight"): void
}>();

const testDataStr = ref("");
const executing = ref(false);
const executionPath = ref<ExecutionPath | null>(null);
const stepIndex = ref(0);
const isStepping = ref(false);

const displaySteps = computed(() => {
  if (!executionPath.value) return [];
  if (isStepping.value) {
    return executionPath.value.steps.slice(0, stepIndex.value + 1);
  }
  return executionPath.value.steps;
});

const executeTest = async () => {
  if (!testDataStr.value.trim()) {
    warning("请输入测试数据");
    return;
  }

  let testData: any;
  try {
    testData = JSON.parse(testDataStr.value);
  } catch (error) {
    error("测试数据格式错误，请输入有效的JSON");
    return;
  }

  if (!props.nodes || props.nodes.length === 0) {
    warning("流程图为空，请先添加节点");
    return;
  }

  executing.value = true;
  isStepping.value = false;

  try {
    // 延迟一下让loading显示
    await new Promise(r => setTimeout(r, 300));

    const result = executeRuleFlow(props.nodes, props.edges || [], testData);
    executionPath.value = result;

    // 触发画布高亮
    emit("highlight", result);

    success(`执行完成，经过 ${result.visitedNodeIds.length} 个节点`);
  } catch (err: any) {
    error("执行失败: " + (err.message || err));
  } finally {
    executing.value = false;
  }
};

const stepExecute = () => {
  if (!executionPath.value) return;
  if (!isStepping.value) {
    isStepping.value = true;
    stepIndex.value = 0;
  } else {
    if (stepIndex.value < executionPath.value.steps.length - 1) {
      stepIndex.value++;
    } else {
      success("已到达最后一步");
    }
  }
  // 高亮到当前步
  const partialPath: ExecutionPath = {
    ...executionPath.value,
    visitedNodeIds: executionPath.value.visitedNodeIds.slice(0, stepIndex.value + 1),
    visitedEdgeIds: executionPath.value.visitedEdgeIds.slice(0, stepIndex.value + 1),
    steps: executionPath.value.steps.slice(0, stepIndex.value + 1)
  };
  emit("highlight", partialPath);
};

const resetHighlight = () => {
  isStepping.value = false;
  executionPath.value = null;
  emit("resetHighlight");
};

const loadSampleData = () => {
  const sampleData: any = {};
  // 从所有条件节点收集字段名
  if (props.nodes) {
    props.nodes.forEach((node: any) => {
      if (node.type === "condition" && node.data?.conditions) {
        node.data.conditions.forEach((cond: any) => {
          if (cond.fieldName && !(cond.fieldName in sampleData)) {
            sampleData[cond.fieldName] = getSampleValue(cond.fieldType);
          }
        });
      }
      // 从变量赋值节点收集变量名
      if (node.type === "variable-assign" && node.data?.assignments) {
        node.data.assignments.forEach((assign: any) => {
          if (assign.variableName && !(assign.variableName in sampleData)) {
            sampleData[assign.variableName] = getSampleValue(assign.valueType);
          }
        });
      }
    });
  }

  if (Object.keys(sampleData).length === 0) {
    // 默认示例
    sampleData.amount = 1500;
    sampleData.status = "approved";
    sampleData.userType = "vip";
  }

  testDataStr.value = JSON.stringify(sampleData, null, 2);
  success("已加载示例数据");
};

const getSampleValue = (fieldType: string) => {
  switch (fieldType) {
    case "STRING":
      return "sample_value";
    case "NUMBER":
    case "CONSTANT":
      return 100;
    case "DATE":
      return new Date().toISOString().split("T")[0];
    case "BOOLEAN":
      return true;
    case "ARRAY":
      return ["value1", "value2"];
    case "VARIABLE":
      return "variable_ref";
    case "EXPRESSION":
      return "1 + 2";
    default:
      return "";
  }
};

const getStepType = (status: string) => {
  switch (status) {
    case "SUCCESS":
      return "success";
    case "FAILED":
      return "danger";
    case "SKIPPED":
      return "info";
    case "RUNNING":
      return "primary";
    default:
      return "info";
  }
};

const formatJson = (obj: any) => {
  if (!obj) return "";
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const handleClose = () => {
  emit("resetHighlight");
  emit("close");
};
</script>

<style scoped lang="scss">
.rule-test-dialog {
  .test-actions {
    margin: 12px 0;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .test-result {
    margin-top: 12px;

    .divider-title {
      font-weight: 600;
      color: #374151;
    }

    .result-summary {
      margin-bottom: 16px;
    }

    .exec-timeline {
      max-height: 350px;
      overflow-y: auto;
      padding: 10px 0 0 10px;

      .step-card {
        .step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;

          .step-node-name {
            font-weight: 600;
            font-size: 13px;
            color: #1f2937;
          }

          .step-node-type {
            font-size: 11px;
            color: #9ca3af;
          }
        }

        .step-message {
          font-size: 12px;
          color: #4b5563;
          line-height: 1.5;
          padding: 4px 8px;
          background: #f9fafb;
          border-radius: 4px;
        }
      }
    }

    .cond-result {
      margin-bottom: 8px;

      .cond-detail {
        margin-top: 4px;
        background: #f5f7fa;
        padding: 8px 12px;
        border-radius: 4px;
        font-size: 12px;
        font-family: 'Courier New', monospace;
        white-space: pre-wrap;
        word-break: break-all;
      }
    }

    .json-content {
      background: #1e293b;
      color: #93c5fd;
      padding: 15px;
      border-radius: 6px;
      max-height: 250px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
    }
  }
}
</style>
