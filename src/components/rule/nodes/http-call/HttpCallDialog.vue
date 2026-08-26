<template>
  <star-horse-panel
      v-model="dialogVisible"
      :title="i18n('rule.dialog.httpCallConfig')"
      boxWidth="900px"
      :selfFunc="true"
      @closeAction="handleClose"
      @merge="handleSave"
  >
    <ApiConfigForm
        ref="formRef"
        mode="dataSource"
        :currentField="formData"
    />
  </star-horse-panel>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from "vue";
import type {FormInstance} from "element-plus";
import {warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {appEndpoints} from "@/api/app_config";
import ApiConfigForm from "@/components/system/items/utils/ApiConfigForm.vue";

const props = defineProps<{
  visible: boolean;
  config: any;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", config: any): void;
}>();

const dialogVisible = ref<boolean>(false);
watch(
    () => props.visible,
    (val) => {
      dialogVisible.value = val;
    },
    {immediate: true},
);

const formRef = ref<FormInstance>();
const activeTab = ref("source");

// 默认数据：与 nodeTypes.ts http-call defaultData 对齐
const defaultFormData = () => ({
  apiMode: "custom",
  apiType: "thirdApi",
  serviceName: "",
  interfaceName: "",
  httpMethod: "POST",
  url: "",
  protocol: "https",
  timeout: 5000,
  requestDataType: "json",
  headers: [] as any[],
  requestParams: [] as any[],
  body: "",
  successCode: "200",
  codePath: "code",
  messagePath: "message",
  dataPath: "data",
  fieldMappings: [] as any[],
  authEnabled: false,
  authInfo: "",
  proxyEnabled: true,
  proxyUrl: appEndpoints.apiLinkageProxyUrl,
  retryCount: 0,
  description: "",
});

const formData = reactive<any>(defaultFormData());

watch(
    () => props.visible,
    (val) => {
      if (val) {
        if (props.config) {
          // 合并配置，确保所有字段都有值
          Object.assign(
              formData,
              defaultFormData(),
              JSON.parse(JSON.stringify(props.config)),
          );
          // 兼容旧数据：headers/requestParams 可能是对象格式 {key,value}
          formData.headers = normalizeParamArray(formData.headers);
          formData.requestParams = normalizeParamArray(formData.requestParams);
          // 兼容旧数据：fieldMappings 可能是 undefined
          if (!Array.isArray(formData.fieldMappings)) formData.fieldMappings = [];
        } else {
          Object.assign(formData, defaultFormData());
        }
        activeTab.value = "source";
      }
    },
    {immediate: true},
);

/** 将旧格式 {key, value} 转换为新格式 {paramName, valueType, paramValue} */
const normalizeParamArray = (arr: any[]): any[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item: any) => {
    if (item.paramName !== undefined) {
      return {valueType: "static", ...item};
    }
    // 兼容旧 {key, value} 格式
    return {
      paramName: item.key || item.name || "",
      valueType: "static",
      paramValue: item.value || "",
    };
  });
};

const addRow = (field: "headers" | "requestParams") => {
  formData[field].push({paramName: "", valueType: "static", paramValue: ""});
};

const removeRow = (
    field: "headers" | "requestParams" | "fieldMappings",
    index: number,
) => {
  formData[field].splice(index, 1);
};

const addMapping = () => {
  formData.fieldMappings.push({sourceField: "", distField: ""});
};

const handleClose = () => emit("close");

const handleSave = async () => {
  if (!formData.url.trim()) {
    warning(i18n("rule.ph.enterUrl"));
    activeTab.value = "request";
    return;
  }
  // 清理空行
  const cleanHeaders = formData.headers.filter(
      (h: any) => h.paramName && h.paramName.trim(),
  );
  const cleanParams = formData.requestParams.filter(
      (p: any) => p.paramName && p.paramName.trim(),
  );
  const cleanMappings = formData.fieldMappings.filter(
      (m: any) => m.sourceField && m.distField,
  );
  emit("save", {
    ...formData,
    headers: cleanHeaders,
    requestParams: cleanParams,
    fieldMappings: cleanMappings,
  });
};
</script>

<style scoped lang="scss">
.http-config-tabs {
  :deep(.el-tabs__content) {
    max-height: 480px;
    overflow-y: auto;
    padding-right: 8px;
  }

  :deep(.el-tab-pane) {
    padding-top: 8px;
  }
}

.kv-table {
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px;
  background: #fafbfc;

  .kv-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;

    &.kv-head {
      padding: 0 4px 6px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 8px;
      font-size: 12px;
      color: #6b7280;
      font-weight: 600;
    }

    .kv-col {
      &.col-name {
        flex: 1;
      }

      &.col-type {
        width: 120px;
      }

      &.col-value {
        flex: 1.3;
      }

      &.col-source {
        flex: 1;
      }

      &.col-dist {
        flex: 1;
      }

      &.col-op {
        width: 40px;
        text-align: center;
      }
    }
  }

  .kv-add {
    width: 100%;
    margin-top: 4px;
    border-style: dashed;
  }
}

.unit {
  margin-left: 6px;
  color: #9ca3af;
  font-size: 12px;
}

:deep(.body-textarea) {
  textarea {
    font-family: "Consolas", "Monaco", "Courier New", monospace;
    font-size: 13px;
  }
}

.http-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 12px;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 13px;

  .sum-url {
    flex: 1;
    color: #374151;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: "Consolas", monospace;
  }
}
</style>
