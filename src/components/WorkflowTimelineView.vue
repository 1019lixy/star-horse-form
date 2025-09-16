<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { i18n } from "@/lang";
import WorkflowActionDialog from "./WorkflowActionDialog.vue";

// Props
const props = defineProps({
  workflowType: {
    type: String,
    required: true,
  },
  workflowData: {
    type: Object,
    default: null,
  },
  showBackButton: {
    type: Boolean,
    default: true,
  },
});

// Emits
const emit = defineEmits(["close", "action", "back"]);

// Reactive data
const loading = ref(false);
const workflowNodes = ref<any[]>([]);
const actionDialogVisible = ref(false);
const currentActionType = ref("");

// btnTypeList from FlowPropertyPanel.vue
const btnTypeList = [
  { name: i18n("workflow.btn.agree"), value: "a" },
  { name: i18n("workflow.btn.reject"), value: "b" },
  { name: i18n("workflow.btn.return"), value: "c" },
  { name: i18n("workflow.btn.returnToStart"), value: "d" },
  { name: i18n("workflow.btn.returnToHistory"), value: "e" },
  { name: i18n("workflow.btn.revoke"), value: "f" },
  { name: i18n("workflow.btn.transfer"), value: "g" },
  { name: i18n("workflow.btn.addSign"), value: "h" },
  { name: i18n("workflow.btn.reduceSign"), value: "i" },
  { name: i18n("workflow.btn.save"), value: "j" },
  { name: i18n("workflow.btn.terminate"), value: "k" },
  { name: i18n("workflow.btn.countersign"), value: "l" },
  { name: i18n("workflow.btn.agreeCountersign"), value: "m" },
  { name: i18n("workflow.btn.rejectCountersign"), value: "n" },
  { name: i18n("workflow.btn.abstainCountersign"), value: "o" },
  { name: i18n("workflow.btn.assignApprover"), value: "p" },
  { name: i18n("workflow.btn.assignJump"), value: "q" },
];

// Computed properties
const workflowTitle = computed(() => {
  if (props.workflowData?.processName) {
    return props.workflowData.processName;
  }

  switch (props.workflowType) {
    case "unreceived":
      return i18n("home.unreceived");
    case "processing":
      return i18n("home.processing");
    case "completed":
      return i18n("home.completed");
    case "following":
      return i18n("home.following");
    case "suspended":
      return i18n("home.suspended");
    case "delegated":
      return i18n("home.delegated");
    case "allWork":
      return i18n("home.allWork");
    default:
      return i18n("workflow.process.details");
  }
});

const mockWorkflowNodes = computed(() => {
  return [
    {
      name: i18n("workflow.initiator"),
      status: "completed",
      timestamp: "2023-05-01 09:00",
      description: i18n("workflow.submitted.by", {
        user: props.workflowData?.createdBy || "System",
      }),
      assignee: props.workflowData?.createdBy || "System",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: props.workflowData?.createdBy || "System"
    },
    {
      name: i18n("workflow.approval.node"),
      status: "current",
      timestamp: "2023-05-01 10:30",
      description: i18n("workflow.pending.approval"),
      assignee: i18n("workflow.pending.assignee"),
      action: getActionForCurrentNode(),
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "审批人"
    },
    {
      name: i18n("workflow.final.approval"),
      status: "pending",
      timestamp: "",
      description: i18n("workflow.not.started"),
      assignee: "",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "待定"
    },
    {
      name: i18n("workflow.final.approval"),
      status: "pending",
      timestamp: "",
      description: i18n("workflow.not.started"),
      assignee: "",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "待定"
    },
    {
      name: i18n("workflow.final.approval"),
      status: "pending",
      timestamp: "",
      description: i18n("workflow.not.started"),
      assignee: "",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "待定"
    },
    {
      name: i18n("workflow.final.approval"),
      status: "pending",
      timestamp: "",
      description: i18n("workflow.not.started"),
      assignee: "",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "待定"
    },
    {
      name: i18n("workflow.final.approval"),
      status: "pending",
      timestamp: "",
      description: i18n("workflow.not.started"),
      assignee: "",
      // Add user photo or name for avatar
      userPhoto: "", // In real implementation, this would come from user data
      userName: "待定"
    },
  ];
});

// Get appropriate action for current node based on workflow type
const getActionForCurrentNode = () => {
  switch (props.workflowType) {
    case "unreceived":
      return "claim";
    case "processing":
      return "complete";
    case "completed":
      return "revoke";
    case "following":
      return "unfollow";
    case "suspended":
      return "resume";
    case "delegated":
      return "recall";
    default:
      return "claim";
  }
};

// Get buttons for current node based on workflow type
const getCurrentNodeButtons = () => {
  // In a real implementation, this would be determined by the actual workflow configuration
  // For now, we'll provide a default set based on the workflow type
  switch (props.workflowType) {
    case "unreceived":
      return btnTypeList.filter((btn) => ["g", "p"].includes(btn.value)); // Transfer, Assign Approver
    case "processing":
      return btnTypeList.filter((btn) =>
        ["a", "b", "c", "g", "h", "i"].includes(btn.value),
      ); // Agree, Reject, Return, Transfer, Add Sign, Reduce Sign
    case "completed":
      return btnTypeList.filter((btn) => ["f"].includes(btn.value)); // Revoke
    case "following":
      return btnTypeList.filter((btn) => ["o"].includes(btn.value)); // Unfollow
    case "suspended":
      return btnTypeList.filter((btn) => ["k"].includes(btn.value)); // Resume
    case "delegated":
      return btnTypeList.filter((btn) => ["g"].includes(btn.value)); // Recall
    default:
      return btnTypeList.slice(0, 3); // Default to first 3 buttons
  }
};

// Get button type for styling
const getButtonType = (btnValue: string) => {
  switch (btnValue) {
    case "a": // Agree
      return "success";
    case "b": // Reject
    case "c": // Return
    case "d": // Return to start
    case "e": // Return to history
      return "danger";
    case "f": // Revoke
    case "k": // Terminate
      return "warning";
    default:
      return "primary";
  }
};

// Get status tag type
const getStatusTagType = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
      return "primary";
    case "pending":
      return "warning";
    case "error":
      return "danger";
    default:
      return "info";
  }
};

// Load workflow timeline data
const loadWorkflowTimeline = async (data: any) => {
  loading.value = true;
  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, this would fetch actual timeline data from the API
    workflowNodes.value = mockWorkflowNodes.value;
  } catch (error) {
    console.error("Error loading workflow timeline:", error);
    workflowNodes.value = [];
  } finally {
    loading.value = false;
  }
};

// Get node status type for timeline
const getNodeStatusType = (status: string) => {
  switch (status) {
    case "completed":
      return "success";
    case "current":
      return "primary";
    case "error":
      return "danger";
    default:
      return "info";
  }
};

// Get node status color
const getNodeStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "#67C23A";
    case "current":
      return "#409EFF";
    case "error":
      return "#F56C6C";
    default:
      return "#909399";
  }
};

// Get node status label
const getNodeStatusLabel = (status: string) => {
  switch (status) {
    case "completed":
      return i18n("system.completed");
    case "current":
      return i18n("system.current");
    case "pending":
      return i18n("system.pending");
    case "error":
      return i18n("system.error");
    default:
      return status;
  }
};

// Get user initials for avatar
const getUserInitials = (userName: string) => {
  if (!userName) return "U";

  // If name has more than 2 characters, take last 2
  // If name has 2 or fewer characters, show full name
  if (userName.length > 2) {
    return userName.substring(userName.length - 2);
  } else {
    return userName;
  }
};

// Check if user photo is valid
const hasValidUserPhoto = (userPhoto: string) => {
  return userPhoto && userPhoto.trim() !== "";
};

// Handle workflow actions
const handleAction = (action: string) => {
  // Check if the action requires data input
  const actionsRequiringInput = ["b", "c", "d", "e", "g", "h", "i", "n", "p"];

  if (actionsRequiringInput.includes(action)) {
    // Show dialog to collect data
    currentActionType.value = action;
    actionDialogVisible.value = true;
  } else {
    // Direct action without data input
    emit("action", action, props.workflowData);
  }
};

// Handle action confirm from dialog
const handleActionConfirm = (data: any) => {
  emit("action", data.actionType, props.workflowData, data.formData);
};

// Handle action dialog close
const handleActionClose = () => {
  actionDialogVisible.value = false;
  currentActionType.value = "";
};

// Go back
const goBack = () => {
  emit("back");
};

// Initialize component
onMounted(() => {
  if (props.workflowData) {
    loadWorkflowTimeline(props.workflowData);
  }
});
// Watch for workflow data changes
watch(
  () => props.workflowData,
  (newData) => {
    if (newData) {
      loadWorkflowTimeline(newData);
    }
  },
  { immediate: false },
);
</script>

<template>
  <div class="workflow-timeline-view">
    <div class="timeline-header">
      <h3>{{ workflowTitle }}</h3>
      <el-button @click="goBack" size="small" v-if="showBackButton">
        {{ i18n("system.back") }}
      </el-button>
    </div>

    <!-- Application details section -->
    <div class="application-details" v-if="workflowData">
      <el-descriptions :column="2" border>
        <el-descriptions-item :label="i18n('workflow.application.id')">
          {{ workflowData.id || "N/A" }}
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.name')">
          {{ workflowData.processName || "N/A" }}
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.category')">
          {{ workflowData.category || "N/A" }}
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.status')">
          <el-tag :type="getStatusTagType(workflowData.status)">
            {{ getNodeStatusLabel(workflowData.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.createdBy')">
          {{ workflowData.createdBy || "N/A" }}
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.createdDate')">
          {{ workflowData.createdDate || "N/A" }}
        </el-descriptions-item>
        <el-descriptions-item :label="i18n('workflow.application.description')" :span="2">
          {{
            workflowData.description ||
            i18n("workflow.application.noDescription")
          }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    <div class="font-bold ml-10 text-[16px]"><span>{{ i18n("system.auditing.opinion") }}</span></div>
  <el-divider />
   <div class="h-[30px]"/>
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <el-skeleton animated>
        <template #template>
          <el-skeleton-item variant="text" style="width: 30%" />
          <div style="margin-top: 20px">
            <el-skeleton-item variant="text" style="width: 50%" />
          </div>
          <div style="margin-top: 20px">
            <el-skeleton-item variant="text" style="width: 70%" />
          </div>
        </template>
      </el-skeleton>
    </div>

    <!-- Timeline view -->
    <el-timeline v-else class="workflow-timeline">
      <el-timeline-item v-for="(node, index) in workflowNodes" :key="index" :type="getNodeStatusType(node.status)"
        :hollow="node.status === 'pending'" :color="getNodeStatusColor(node.status)">
        <!-- Custom timeline dot with circular icon -->
        <template #dot>
          <div class="timeline-node-icon" :class="`status-${node.status}`">
            <img v-if="hasValidUserPhoto(node.userPhoto)" :src="node.userPhoto" :alt="node.userName"
              class="user-photo" />
            <div v-else class="user-initials">
              {{ getUserInitials(node.userName) }}
            </div>
          </div>
        </template>

        <div class="node-content">
          <div class="node-header">
            <div class="node-title">{{ node.name }}</div>
            <div class="node-timestamp" v-if="node.timestamp">
              {{ node.timestamp }}
            </div>
          </div>
          <div class="node-description" v-if="node.description">
            {{ node.description }}
          </div>
          <div class="node-assignee" v-if="node.assignee">
            <el-tag size="small" :type="getNodeStatusType(node.status)">
              {{ node.assignee }}
            </el-tag>
          </div>
          <div class="node-actions" v-if="node.action && node.status === 'current'">
            <!-- Render buttons based on btnTypeList -->
            <el-button v-for="btn in getCurrentNodeButtons()" :key="btn.value" size="small"
              :type="getButtonType(btn.value)" @click="handleAction(btn.value)" class="action-button">
              {{ btn.name }}
            </el-button>
          </div>
        </div>
      </el-timeline-item>
    </el-timeline>

    <!-- Empty state -->
    <div v-if="!loading && workflowNodes.length === 0" class="empty-state">
      <el-empty :description="i18n('workflow.no.timeline.data')" />
    </div>

    <!-- Workflow Action Dialog -->
    <WorkflowActionDialog v-model="actionDialogVisible" :action-type="currentActionType" :workflow-data="workflowData"
      @confirm="handleActionConfirm" @close="handleActionClose" />
  </div>
</template>

<style lang="scss" scoped>
.workflow-timeline-view {
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ebeef5;
}

.application-details {
  margin-bottom: 20px;
}

.workflow-timeline {
  padding: 0 20px;

  // Adjust the timeline to align with custom icons
  :deep(.el-timeline-item) {
    .el-timeline-item__wrapper {
      position: relative;
      top: -24px; // Move content up to align with icon center
      padding-left: 56px; // Make space for the icon
    }

    .el-timeline-item__tail {
      left: 24px; // Align tail with icon center
    }

    .el-timeline-item__node {
      left: 24px; // Align node with icon center
      display: none; // Hide default node as we're using custom icons
    }
  }
}

.timeline-node-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  color: white;
  border: 3px solid white;
  box-shadow: 0 0 0 3px #ebeef5, 0 2px 6px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: absolute;
  left: 0px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1;
  transition: all 0.3s ease;

  &.status-completed {
    background: linear-gradient(135deg, #67C23A, #489c2d);
  }

  &.status-current {
    background: linear-gradient(135deg, #409EFF, #1a7be0);
    box-shadow: 0 0 0 3px #ebeef5, 0 2px 12px rgba(64, 158, 255, 0.4);
  }

  &.status-pending {
    background: linear-gradient(135deg, #909399, #6c6f75);
  }

  &.status-error {
    background: linear-gradient(135deg, #F56C6C, #e04343);
  }

  .user-photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .user-initials {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
}

.node-content {
  padding: 12px 16px;
  margin-left: 0;
  background-color: #f5f7fa;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.node-content:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.node-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.node-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.node-timestamp {
  font-size: 12px;
  color: #909399;
}

.node-description {
  font-size: 14px;
  color: #606266;
  margin: 8px 0;
  line-height: 1.5;
}

.node-assignee {
  margin: 8px 0;
}

.node-assignee :deep(.el-tag) {
  font-size: 12px;
}

.node-actions {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #ebeef5;
}

.action-button {
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.action-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.loading-container {
  padding: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
}
</style>
