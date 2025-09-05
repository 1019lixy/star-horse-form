<template>
  <star-horse-dialog
    :dialogVisible="dialogVisible"
    :draggable="true"
    :self-func="true"
    :title="dialogTitle"
    boxWidth="500px"
    @merge="handleSubmit"
    @closeAction="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="120px"
    >
      <!-- Reject Reason -->
      <el-form-item
        v-if="actionType === 'b' || actionType === 'n'"
        :label="i18n('workflow.action.rejectReason')"
        prop="rejectReason"
      >
        <el-input
          v-model="formData.rejectReason"
          type="textarea"
          :placeholder="i18n('workflow.action.rejectReason.placeholder')"
        />
      </el-form-item>

      <!-- Return Reason -->
      <el-form-item
        v-if="actionType === 'c' || actionType === 'd' || actionType === 'e'"
        :label="i18n('workflow.action.returnReason')"
        prop="returnReason"
      >
        <el-input
          v-model="formData.returnReason"
          type="textarea"
          :placeholder="i18n('workflow.action.returnReason.placeholder')"
        />
      </el-form-item>

      <!-- Add Sign -->
      <el-form-item
        v-if="actionType === 'h'"
        :label="i18n('workflow.action.addSignUsers')"
        prop="addSignUsers"
      >
        <el-select
          v-model="formData.addSignUsers"
          multiple
          filterable
          :placeholder="i18n('workflow.action.addSignUsers.placeholder')"
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- Reduce Sign -->
      <el-form-item
        v-if="actionType === 'i'"
        :label="i18n('workflow.action.reduceSignUsers')"
        prop="reduceSignUsers"
      >
        <el-select
          v-model="formData.reduceSignUsers"
          multiple
          filterable
          :placeholder="i18n('workflow.action.reduceSignUsers.placeholder')"
          style="width: 100%"
        >
          <el-option
            v-for="user in signUsers"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- Transfer -->
      <el-form-item
        v-if="actionType === 'g'"
        :label="i18n('workflow.action.transferTo')"
        prop="transferTo"
      >
        <el-select
          v-model="formData.transferTo"
          filterable
          :placeholder="i18n('workflow.action.transferTo.placeholder')"
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- Assign Approver -->
      <el-form-item
        v-if="actionType === 'p'"
        :label="i18n('workflow.action.assignApprover')"
        prop="assignApprover"
      >
        <el-select
          v-model="formData.assignApprover"
          filterable
          :placeholder="i18n('workflow.action.assignApprover.placeholder')"
          style="width: 100%"
        >
          <el-option
            v-for="user in userList"
            :key="user.id"
            :label="user.name"
            :value="user.id"
          />
        </el-select>
      </el-form-item>

      <!-- Comments -->
      <el-form-item
        v-if="showComments"
        :label="i18n('workflow.action.comments')"
        prop="comments"
      >
        <el-input
          v-model="formData.comments"
          type="textarea"
          :placeholder="i18n('workflow.action.comments.placeholder')"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { i18n } from "@/lang";
import { StarHorseDialog } from "star-horse-lowcode";

// Props
const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  actionType: {
    type: String,
    required: true,
  },
  workflowData: {
    type: Object,
    default: null,
  },
});

// Emits
const emit = defineEmits(["update:modelValue", "confirm", "close"]);

// Reactive data
const dialogVisible = ref(false);
const formRef = ref();
const formData = ref({
  rejectReason: "",
  returnReason: "",
  addSignUsers: [],
  reduceSignUsers: [],
  transferTo: "",
  assignApprover: "",
  comments: "",
});

// Form rules
const formRules = computed(() => {
  const rules: any = {};

  if (props.actionType === "b" || props.actionType === "n") {
    rules.rejectReason = [
      {
        required: true,
        message: i18n("workflow.action.rejectReason.required"),
        trigger: "blur",
      },
    ];
  }

  if (
    props.actionType === "c" ||
    props.actionType === "d" ||
    props.actionType === "e"
  ) {
    rules.returnReason = [
      {
        required: true,
        message: i18n("workflow.action.returnReason.required"),
        trigger: "blur",
      },
    ];
  }

  if (props.actionType === "h") {
    rules.addSignUsers = [
      {
        required: true,
        message: i18n("workflow.action.addSignUsers.required"),
        trigger: "change",
      },
    ];
  }

  if (props.actionType === "i") {
    rules.reduceSignUsers = [
      {
        required: true,
        message: i18n("workflow.action.reduceSignUsers.required"),
        trigger: "change",
      },
    ];
  }

  if (props.actionType === "g") {
    rules.transferTo = [
      {
        required: true,
        message: i18n("workflow.action.transferTo.required"),
        trigger: "change",
      },
    ];
  }

  if (props.actionType === "p") {
    rules.assignApprover = [
      {
        required: true,
        message: i18n("workflow.action.assignApprover.required"),
        trigger: "change",
      },
    ];
  }

  return rules;
});

// Computed properties
const dialogTitle = computed(() => {
  const actionTitles: Record<string, string> = {
    a: i18n("workflow.btn.agree"),
    b: i18n("workflow.btn.reject"),
    c: i18n("workflow.btn.return"),
    d: i18n("workflow.btn.returnToStart"),
    e: i18n("workflow.btn.returnToHistory"),
    f: i18n("workflow.btn.revoke"),
    g: i18n("workflow.btn.transfer"),
    h: i18n("workflow.btn.addSign"),
    i: i18n("workflow.btn.reduceSign"),
    j: i18n("workflow.btn.save"),
    k: i18n("workflow.btn.terminate"),
    l: i18n("workflow.btn.countersign"),
    m: i18n("workflow.btn.agreeCountersign"),
    n: i18n("workflow.btn.rejectCountersign"),
    o: i18n("workflow.btn.abstainCountersign"),
    p: i18n("workflow.btn.assignApprover"),
    q: i18n("workflow.btn.assignJump"),
  };

  return actionTitles[props.actionType] || i18n("workflow.action.title");
});

const showComments = computed(() => {
  return [
    "a",
    "b",
    "c",
    "d",
    "e",
    "g",
    "h",
    "i",
    "j",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
  ].includes(props.actionType);
});

// Mock user data - in a real implementation, this would come from an API
const userList = ref([
  { id: "user1", name: "张三" },
  { id: "user2", name: "李四" },
  { id: "user3", name: "王五" },
  { id: "user4", name: "赵六" },
]);

// Mock sign users - in a real implementation, this would come from the workflow data
const signUsers = ref([
  { id: "user1", name: "张三" },
  { id: "user2", name: "李四" },
]);

// Watch for model value changes
watch(
  () => props.modelValue,
  (newValue) => {
    dialogVisible.value = newValue;
  },
);

// Handle close
const handleClose = () => {
  emit("update:modelValue", false);
  emit("close");
  dialogVisible.value = false;
  // Reset form data
  formData.value = {
    rejectReason: "",
    returnReason: "",
    addSignUsers: [],
    reduceSignUsers: [],
    transferTo: "",
    assignApprover: "",
    comments: "",
  };
};

// Handle submit
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();

    // Emit the action with form data
    emit("confirm", {
      actionType: props.actionType,
      workflowData: props.workflowData,
      formData: formData.value,
    });

    handleClose();
  } catch (error) {
    console.error("Form validation failed:", error);
  }
};
</script>

<style scoped>
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
