<script setup lang="ts">
import { ref, computed } from "vue";
import { useCommonPage } from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import { i18n } from "@/lang";
import { success, error } from "star-horse-lowcode";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const approvalFormRef = ref();
const approvalNodes = ref<any[]>([]);
const currentApprovalIdx = ref(0);
const approvalComment = ref("");
const approvalLoading = ref(false);
const approvalHistory = ref<any[]>([]);
const selectedApprover = ref("");
const activeTab = ref("form");

const {
  isLoading,
  hasData,
  errorMsg,
  primaryKey,
  rules,
  relationTables,
  tableFieldList,
  dataUrl,
  dialogProps,
  onFormDataLoaded,
  handleBeforeSubmit,
  dataFormat,
} = useCommonPage({
  props,
  formRef: approvalFormRef,
  enableOnChange: true,
});

const buildApprovalNodes = () => {
  const list = props.compList as any[];
  const flowComp = list?.find(
    (c: any) => c?.preps?.approvalFlow || c?.preps?.approvalNodes,
  );
  const flowDef =
    flowComp?.preps?.approvalFlow || flowComp?.preps?.approvalNodes;
  if (Array.isArray(flowDef) && flowDef.length) {
    approvalNodes.value = flowDef.map((n: any) => ({
      name: n.name || n.nodeName || "",
      candidates: n.candidates || n.approvers || [],
      status: "pending",
      approver: "",
    }));
    if (approvalNodes.value.length) {
      approvalNodes.value[0].status = "current";
    }
  } else {
    approvalNodes.value = [];
  }
  currentApprovalIdx.value = approvalNodes.value.findIndex(
    (n) => n.status === "current",
  );
  if (currentApprovalIdx.value < 0) currentApprovalIdx.value = 0;
};
buildApprovalNodes();

const currentCandidates = computed(
  () => approvalNodes.value[currentApprovalIdx.value]?.candidates || [],
);
const needApprover = computed(() => currentCandidates.value.length > 0);

const statusType = (status: string) =>
  (
    ({
      done: "success",
      current: "primary",
      pending: "info",
      rejected: "danger",
    }) as any
  )[status] || "info";

const recordHistory = (action: string) => {
  approvalHistory.value.push({
    node: approvalNodes.value[currentApprovalIdx.value]?.name,
    action,
    approver: selectedApprover.value,
    comment: approvalComment.value,
    time: new Date().toLocaleString(),
  });
};

const handleApprove = async () => {
  if (needApprover.value && !selectedApprover.value) {
    error(i18n("commonPage.approval.selectApprover"));
    return;
  }
  approvalLoading.value = true;
  try {
    if (currentApprovalIdx.value < approvalNodes.value.length - 1) {
      approvalNodes.value[currentApprovalIdx.value].status = "done";
      approvalNodes.value[currentApprovalIdx.value].approver =
        selectedApprover.value;
      currentApprovalIdx.value++;
      approvalNodes.value[currentApprovalIdx.value].status = "current";
    } else {
      approvalNodes.value[currentApprovalIdx.value].status = "done";
      approvalNodes.value[currentApprovalIdx.value].approver =
        selectedApprover.value;
    }
    recordHistory(i18n("commonPage.approval.approve"));
    approvalComment.value = "";
    selectedApprover.value = "";
    success(i18n("commonPage.approval.approveSuccess"));
  } catch {
    error(i18n("commonPage.approval.approveFail"));
  } finally {
    approvalLoading.value = false;
  }
};
const handleReject = async () => {
  if (!approvalComment.value) {
    error(i18n("commonPage.approval.needComment"));
    return;
  }
  approvalLoading.value = true;
  try {
    approvalNodes.value[currentApprovalIdx.value].status = "rejected";
    recordHistory(i18n("commonPage.approval.reject"));
    approvalComment.value = "";
    success(i18n("commonPage.approval.rejectSuccess"));
  } finally {
    approvalLoading.value = false;
  }
};
const handleTransfer = async () => {
  if (!approvalComment.value) {
    error(i18n("commonPage.approval.needComment"));
    return;
  }
  approvalLoading.value = true;
  try {
    recordHistory(i18n("commonPage.approval.transfer"));
    approvalComment.value = "";
    success(i18n("commonPage.approval.transferSuccess"));
  } finally {
    approvalLoading.value = false;
  }
};
</script>
<template>
  <div class="approval-page">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showForm="true"
      :formRowCount="6"
    />

    <template v-else-if="hasData">
      <el-card class="approval-card">
        <el-tabs v-model="activeTab" class="approval-tabs">
          <el-tab-pane :label="i18n('commonPage.approval.form')" name="form">
            <div class="tab-body">
              <star-horse-form
                :compUrl="dataUrl"
                :preview="preview"
                :fieldList="tableFieldList"
                :primary-key="primaryKey"
                :rules="rules"
                ref="approvalFormRef"
                :globalCondition="relationTables"
                :dynamicForm="true"
                :typeModel="'form'"
                @dataLoaded="onFormDataLoaded"
                @beforeSubmit="handleBeforeSubmit"
              />
            </div>
          </el-tab-pane>

          <el-tab-pane :label="i18n('commonPage.approval.flow')" name="flow">
            <div class="tab-body">
              <el-empty
                v-if="!approvalNodes.length"
                :description="i18n('commonPage.approval.noFlow')"
                size="small"
              />
              <el-steps
                v-else
                :active="currentApprovalIdx"
                align-center
                class="flow-steps"
              >
                <el-step
                  v-for="(node, i) in approvalNodes"
                  :key="i"
                  :title="node.name"
                  :status="node.status === 'rejected' ? 'error' : undefined"
                />
              </el-steps>
            </div>
          </el-tab-pane>

          <el-tab-pane
            :label="i18n('commonPage.approval.history')"
            name="history"
            v-if="approvalHistory.length"
          >
            <div class="tab-body">
              <el-timeline>
                <el-timeline-item
                  v-for="(h, i) in approvalHistory"
                  :key="i"
                  :timestamp="h.time"
                  :type="
                    statusType(
                      h.action === i18n('commonPage.approval.approve')
                        ? 'done'
                        : 'rejected',
                    )
                  "
                >
                  <div class="history-node">{{ h.node }} - {{ h.action }}</div>
                  <div v-if="h.comment" class="history-comment">
                    {{ h.comment }}
                  </div>
                </el-timeline-item>
              </el-timeline>
            </div>
          </el-tab-pane>
        </el-tabs>

        <div class="approval-bar" v-if="approvalNodes.length">
          <div class="approval-bar-left">
            <el-select
              v-if="needApprover"
              v-model="selectedApprover"
              :placeholder="i18n('commonPage.approval.selectApprover')"
              clearable
              style="width: 200px"
            >
              <el-option
                v-for="c in currentCandidates"
                :key="c.id || c.value"
                :label="c.name || c.label"
                :value="c.id || c.value"
              />
            </el-select>
            <el-input
              v-model="approvalComment"
              type="textarea"
              :rows="1"
              :placeholder="i18n('commonPage.approval.commentPlaceholder')"
              class="approval-comment"
            />
          </div>
          <div class="approval-bar-right">
            <el-button
              type="success"
              :loading="approvalLoading"
              @click="handleApprove"
            >
              {{ i18n("commonPage.approval.approve") }}
            </el-button>
            <el-button
              type="danger"
              :loading="approvalLoading"
              @click="handleReject"
            >
              {{ i18n("commonPage.approval.reject") }}
            </el-button>
            <el-button :loading="approvalLoading" @click="handleTransfer">
              {{ i18n("commonPage.approval.transfer") }}
            </el-button>
          </div>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style lang="scss" scoped>
.approval-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.approval-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }
}

.approval-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0 12px;

  :deep(.el-tabs__header) {
    margin-bottom: 0;
    flex-shrink: 0;
  }

  :deep(.el-tabs__content) {
    flex: 1;
    overflow: hidden;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}

.tab-body {
  height: 100%;
  overflow-y: auto;
  padding: 12px 4px;
}

.flow-steps {
  padding: 20px 16px;
}

.history-node {
  font-weight: 500;
  font-size: 13px;
}

.history-comment {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-top: 2px;
}

.approval-bar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: var(--el-fill-color-light);
  border-top: 1px solid var(--el-border-color-lighter);
}

.approval-bar-left {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
}

.approval-comment {
  flex: 1;
}

.approval-bar-right {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}
</style>
