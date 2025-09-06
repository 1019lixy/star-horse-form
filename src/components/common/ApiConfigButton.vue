<script setup lang="ts">
import { ref } from "vue";
import { ElButton } from "element-plus";
import ApiConfigDialog from "./ApiConfigDialog.vue";
import type { ApiConfig } from "@/utils/apiConfig";

// 定义组件属性
const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      env: "",
      httpMethod: "POST",
      protocol: "http",
      host: "",
      port: "",
      interfaceUrl: "",
    }),
  },
  buttonText: {
    type: String,
    default: "配置API",
  },
  buttonType: {
    type: String,
    default: "primary",
  },
  buttonSize: {
    type: String,
    default: "small",
  },
  buttonPlain: {
    type: Boolean,
    default: false,
  },
  dialogTitle: {
    type: String,
    default: "API配置",
  },
});

// 定义组件事件
const emit = defineEmits<{
  save: [value: ApiConfig];
}>();

// 响应式数据
const dialogVisible = ref(false);
const configForm = defineModel<ApiConfig>("dataForm");
// 打开弹窗
const openDialog = () => {
  dialogVisible.value = true;
};

// 处理保存事件
const handleSave = (config: ApiConfig) => {
  emit("save", config);
};
</script>

<template>
  <div class="api-config-button">
    <el-button
      :type="buttonType"
      :size="buttonSize"
      :plain="buttonPlain"
      @click="openDialog"
    >
      {{ buttonText }}
    </el-button>
    <ApiConfigDialog
      v-model:visible="dialogVisible"
      v-model:dataForm="configForm"
      :title="dialogTitle"
      @save="handleSave"
    />
  </div>
</template>

<style scoped lang="scss">
.api-config-button {
  display: inline-block;
}
</style>
