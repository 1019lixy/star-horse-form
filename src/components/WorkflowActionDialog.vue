<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {i18n} from "@/lang";
import {PageFieldInfo, StarHorseDialog} from "star-horse-lowcode";

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
const formFieldInfo = reactive<PageFieldInfo | any>({
  fieldList: []
});
// Form rules


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
  {id: "user1", name: "张三"},
  {id: "user2", name: "李四"},
  {id: "user3", name: "王五"},
  {id: "user4", name: "赵六"},
]);

// Mock sign users - in a real implementation, this would come from the workflow data
const signUsers = ref([
  {id: "user1", name: "张三"},
  {id: "user2", name: "李四"},
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
const init = () => {
  formFieldInfo.fieldList=[];
  if (["b", "n"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "rejectReason",
        type: "textarea",
        label: i18n("workflow.action.rejectReason"),
        required: true,
        formVisible: true,
        preps: {
          placeholder: i18n("workflow.action.rejectReason.placeholder"),
        }
      },
    ];
  } else if (["c", "d", "e"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "returnReason",
        type: "textarea",
        label: i18n("workflow.action.returnReason"),
        required: true,
        formVisible: true,
        preps: {
          placeholder: i18n("workflow.action.returnReason.placeholder"),
        }
      },
    ];
  } else if (["h"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "addSignUsers",
        type: "select",
        label: i18n("workflow.action.returnReason.placeholder"),
        required: true,
        formVisible: true,
        preps: {
          values: userList,
          props: {
            label: "name",
            value: "id"
          },
          placeholder: i18n("workflow.action.addSignUsers.placeholder"),
        }
      }
    ];
  } else if (["i"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "reduceSignUsers",
        type: "select",
        label: i18n("workflow.action.reduceSignUsers"),
        required: true,
        formVisible: true,
        preps: {
          values: signUsers,
          props: {
            label: "name",
            value: "id"
          },
          placeholder: i18n("workflow.action.reduceSignUsers.placeholder"),
        }
      }
    ];
  } else if (["g"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "transferTo",
        type: "select",
        label: i18n("workflow.action.transferTo"),
        required: true,
        formVisible: true,
        preps: {
          values: userList,
          props: {
            label: "name",
            value: "id"
          },
          placeholder: i18n("workflow.action.transferTo.placeholder"),
        }
      }
    ];
  } else if (["p"].includes(props.actionType)) {
    formFieldInfo.fieldList = [
      {
        fieldName: "assignApprover",
        type: "select",
        label: i18n("workflow.action.assignApprover"),
        required: true,
        formVisible: true,
        preps: {
          values: userList,
          props: {
            label: "name",
            value: "id"
          },
          placeholder: i18n("workflow.action.assignApprover.placeholder"),
        }
      }
    ];
  }
  formFieldInfo.fieldList.push({
    fieldName: "comments",
    type: "textarea",
    formVisible: true,
    label: i18n("workflow.action.comments"),
    preps: {
      placeholder: i18n("workflow.action.comments.placeholder"),
    }
  });
};
onMounted(() => {
  // init();
});
watch(() => props.actionType, () => {
  init();
}, {});
</script>
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
    <sh-form
        ref="formRef"
        v-model:dataForm="formData"
        label-width="auto"
        label-position="left"
        size="default"
    >
      <star-horse-form-item
          ref="dataSourceFormRef"
          :fieldList="formFieldInfo"
          compSize="default"
          v-model:dataForm="formData"
      />
    </sh-form>
  </star-horse-dialog>
</template>
<style scoped>
</style>
