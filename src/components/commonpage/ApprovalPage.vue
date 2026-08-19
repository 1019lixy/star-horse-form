<script setup lang="ts">
import {ref} from "vue";
import {useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";
import {success, error} from "star-horse-lowcode";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview: {type: Boolean, default: false},
  compList: {type: Array, required: true},
});

const approvalFormRef = ref();
const approvalNodes = ref<any[]>([]);
const currentApprovalIdx = ref(0);
const approvalComment = ref("");
const approvalLoading = ref(false);
const approvalHistory = ref<any[]>([]);

const {
  isLoading, hasData, errorMsg, primaryKey, rules, relationTables,
  tableFieldList, dataUrl, dialogProps,
  onFormDataLoaded, handleBeforeSubmit, dataFormat,
} = useCommonPage({
  props,
  formRef: approvalFormRef,
  enableOnChange: true,
});

const buildApprovalNodes = () => {
  const list = props.compList as any[];
  const approvalComp = list?.find((c: any) => c?.preps?.approvalNodes);
  approvalNodes.value = approvalComp?.preps?.approvalNodes || [
    {name: i18n("commonPage.approval.start"), status: "done", user: ""},
    {name: i18n("commonPage.approval.dept"), status: "current", user: ""},
    {name: i18n("commonPage.approval.finance"), status: "pending", user: ""},
    {name: i18n("commonPage.approval.done"), status: "pending", user: ""},
  ];
  currentApprovalIdx.value = approvalNodes.value.findIndex(
      (n) => n.status === "current",
  );
  if (currentApprovalIdx.value < 0) currentApprovalIdx.value = 0;
};
buildApprovalNodes();

const statusType = (status: string) =>
    ({done: "success", current: "primary", pending: "info", rejected: "danger"} as any)[
        status
    ] || "info";

const recordHistory = (action: string) => {
  approvalHistory.value.push({
    node: approvalNodes.value[currentApprovalIdx.value]?.name,
    action,
    comment: approvalComment.value,
    time: new Date().toLocaleString(),
  });
};

const handleApprove = async () => {
  approvalLoading.value = true;
  try {
    if (currentApprovalIdx.value < approvalNodes.value.length - 1) {
      approvalNodes.value[currentApprovalIdx.value].status = "done";
      currentApprovalIdx.value++;
      approvalNodes.value[currentApprovalIdx.value].status = "current";
    } else {
      approvalNodes.value[currentApprovalIdx.value].status = "done";
    }
    recordHistory(i18n("commonPage.approval.approve"));
    approvalComment.value = "";
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
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton v-if="isLoading" :showHeader="true" :showForm="true" :formRowCount="6"/>

    <template v-else-if="hasData">
      <el-card class="inner_content flex flex-col gap-4">
        <div class="approval-flow">
          <div class="section-title">{{ i18n("commonPage.approval.flow") }}</div>
          <el-steps :active="currentApprovalIdx" align-center>
            <el-step
                v-for="(node, i) in approvalNodes"
                :key="i"
                :title="node.name"
                :status="node.status === 'rejected' ? 'error' : undefined"
            />
          </el-steps>
        </div>

        <div class="approval-form">
          <div class="section-title">{{ i18n("commonPage.approval.form") }}</div>
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

        <div class="approval-actions">
          <div class="section-title">{{ i18n("commonPage.approval.actions") }}</div>
          <el-input
              v-model="approvalComment"
              type="textarea"
              :rows="3"
              :placeholder="i18n('commonPage.approval.commentPlaceholder')"
              class="mb-3"
          />
          <div class="flex gap-2">
            <el-button type="success" :loading="approvalLoading" @click="handleApprove">
              {{ i18n("commonPage.approval.approve") }}
            </el-button>
            <el-button type="danger" :loading="approvalLoading" @click="handleReject">
              {{ i18n("commonPage.approval.reject") }}
            </el-button>
            <el-button :loading="approvalLoading" @click="handleTransfer">
              {{ i18n("commonPage.approval.transfer") }}
            </el-button>
          </div>
        </div>

        <div class="approval-history" v-if="approvalHistory.length">
          <div class="section-title">{{ i18n("commonPage.approval.history") }}</div>
          <el-timeline>
            <el-timeline-item
                v-for="(h, i) in approvalHistory"
                :key="i"
                :timestamp="h.time"
                :type="statusType(h.action === i18n('commonPage.approval.approve') ? 'done' : 'rejected')"
            >
              <div>{{ h.node }} - {{ h.action }}</div>
              <div v-if="h.comment" class="text-sm text-gray-500">{{ h.comment }}</div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else/>
  </div>
</template>
<style lang="scss" scoped>
.section-title {
  font-weight: 600;
  padding: 4px 0;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
  margin-bottom: 8px;
}
</style>