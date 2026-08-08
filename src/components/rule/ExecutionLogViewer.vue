<template>
  <div class="execution-log-viewer">
    <div v-if="logList.length === 0" class="empty-state">
      <el-icon class="empty-icon">
        <Document />
      </el-icon>
      <span>{{ i18n('rule.log.noLogs') }}</span>
    </div>
    <template v-else>
      <div class="log-list">
        <div
          v-for="log in paginatedLogs"
          :key="log.id || log.executionTime"
          class="log-item"
          @click="viewDetail(log)"
        >
          <div class="log-header">
            <el-tag :type="getResultType(log.executionResult)" effect="dark">
              {{ getResultText(log.executionResult) }}
            </el-tag>
            <span class="log-time">{{ formatTime(log.executionTime) }}</span>
          </div>
          <div class="log-body">
            <span class="log-duration">{{ log.executionDuration }}ms</span>
            <span class="log-trigger" v-if="log.triggeredBy">{{ log.triggeredBy }}</span>
          </div>
          <div class="log-error" v-if="log.errorMessage">
            {{ log.errorMessage }}
          </div>
        </div>
      </div>
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        layout="total, prev, pager, next"
        :total="total"

        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        style="margin-top: 12px"
      />
    </template>

    <!-- 详情弹窗 -->
    <star-horse-dialog
      v-model="detailVisible"
      :title="i18n('rule.log.executionDetail')"
      boxWidth="800px"
      boxHeight="80%"
      :selfFunc="true"
      @closeAction="detailVisible = false"
    >
      <div v-if="currentLog" class="log-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item :label="i18n('rule.log.ruleId')">{{ currentLog.idRuleDefinition }}</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.ruleCode')">{{ currentLog.ruleCode }}</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.ruleName')">{{ currentLog.ruleName }}</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.executionTime')">{{ formatTime(currentLog.executionTime) }}</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.executionResult')">
            <el-tag :type="getResultType(currentLog.executionResult)">
              {{ getResultText(currentLog.executionResult) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.executionDuration')">{{ currentLog.executionDuration }} ms</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.triggeredBy')">{{ currentLog.triggeredBy }}</el-descriptions-item>
          <el-descriptions-item :label="i18n('rule.log.formId')">{{ currentLog.formId }}</el-descriptions-item>
        </el-descriptions>

        <el-divider content-position="left">{{ i18n('rule.log.inputData') }}</el-divider>
        <pre class="json-content">{{ formatJson(currentLog.inputData) }}</pre>

        <el-divider content-position="left">{{ i18n('rule.log.outputData') }}</el-divider>
        <pre class="json-content">{{ formatJson(currentLog.outputData) }}</pre>

        <el-divider content-position="left">{{ i18n('rule.log.executionDetails') }}</el-divider>
        <pre class="json-content">{{ formatJson(currentLog.executionDetails) }}</pre>

        <div v-if="currentLog.errorMessage">
          <el-divider content-position="left">{{ i18n('rule.log.errorMessage') }}</el-divider>
          <el-alert type="error" :closable="false">
            {{ currentLog.errorMessage }}
          </el-alert>
        </div>
      </div>
    </star-horse-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ruleExecutionLogApi } from "@/api/rule_engine_api";
import { Document } from "@element-plus/icons-vue";
import { error } from "star-horse-lowcode";
import { i18n } from '@/lang'

const props = defineProps<{
  ruleId?: string
}>();

const logList = ref<any[]>([]);
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);
const detailVisible = ref(false);
const currentLog = ref<any>(null);

const paginatedLogs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return logList.value.slice(start, start + pageSize.value);
});

const loadLogs = async () => {
  if (!props.ruleId) return;

  try {
    const res = await ruleExecutionLogApi.listByRuleId(props.ruleId);
    if (res.data.code === 200) {
      logList.value = res.data.data || [];
      total.value = logList.value.length;
    }
  } catch (err) {
    error(i18n('rule.log.loadFailed'));
  }
};

const handleSizeChange = (val: number) => {
  pageSize.value = val;
  currentPage.value = 1;
};

const handleCurrentChange = (val: number) => {
  currentPage.value = val;
};

const viewDetail = (log: any) => {
  currentLog.value = log;
  detailVisible.value = true;
};

const formatTime = (time: string) => {
  if (!time) return "";
  return new Date(time).toLocaleString("zh-CN");
};

const getResultType = (result: string) => {
  const map: any = { SUCCESS: "success", FAILED: "danger", SKIPPED: "warning" };
  return map[result] || "info";
};

const getResultText = (result: string) => {
  const map: any = { SUCCESS: i18n('rule.log.success'), FAILED: i18n('rule.log.failed'), SKIPPED: i18n('rule.log.skipped') };
  return map[result] || result;
};

const formatJson = (str: string) => {
  if (!str) return "";
  try {
    return JSON.stringify(JSON.parse(str), null, 2);
  } catch {
    return str;
  }
};

watch(() => props.ruleId, () => {
  loadLogs();
});

onMounted(() => {
  loadLogs();
});

defineExpose({ loadLogs });
</script>

<style scoped lang="scss">
.execution-log-viewer {
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
    color: #94a3b8;

    .empty-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }

    span {
      font-size: 13px;
    }
  }

  .log-list {
    display: flex;
    flex-direction: column;
    gap: 8px;

    .log-item {
      padding: 10px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        border-color: #3b82f6;
        background: #eff6ff;
        box-shadow: 0 2px 4px rgba(59, 130, 246, 0.1);
      }

      .log-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;

        .log-time {
          font-size: 11px;
          color: #94a3b8;
        }
      }

      .log-body {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 12px;

        .log-duration {
          color: #64748b;
          font-weight: 600;
        }

        .log-trigger {
          color: #94a3b8;
        }
      }

      .log-error {
        margin-top: 4px;
        font-size: 11px;
        color: #ef4444;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }
  }

  .log-detail {
    .json-content {
      background: #f5f7fa;
      padding: 15px;
      border-radius: 6px;
      max-height: 300px;
      overflow-y: auto;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      line-height: 1.5;
    }
  }
}
</style>
