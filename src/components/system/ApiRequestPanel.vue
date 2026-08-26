<template>
  <div class="api-request-panel">
    <!-- 接口来源 -->
    <div class="section">
      <div class="section-title">{{ i18n("dyform.apiConfig.apiType") }}</div>
      <el-radio-group v-model="localConfig.apiType" @change="emitChange">
        <el-radio-button value="thirdApi">{{ i18n("dyform.apiConfig.apiType.thirdApi") }}</el-radio-button>
        <el-radio-button value="systemApi">{{ i18n("dyform.apiConfig.apiType.systemApi") }}</el-radio-button>
      </el-radio-group>
    </div>

    <!-- 系统API模式：服务名/接口名/方法 -->
    <template v-if="localConfig.apiType === 'systemApi'">
      <div class="section">
        <div class="section-title">{{ i18n("dyform.apiConfig.section.apiInfo") }}</div>
        <el-input
          v-model="localConfig.serviceName"
          :placeholder="i18n('dyform.apiConfig.helpMsg.serviceName')"
          @change="emitChange"
        />
        <el-input
          v-model="localConfig.interfaceName"
          :placeholder="i18n('dyform.apiConfig.helpMsg.interfaceName')"
          class="mt-2"
          @change="emitChange"
        />
        <el-input
          v-model="localConfig.method"
          :placeholder="i18n('dyform.apiConfig.helpMsg.method')"
          class="mt-2"
          @change="emitChange"
        />
      </div>
    </template>

    <!-- 请求配置 -->
    <div class="section">
      <div class="section-title">{{ i18n("dyform.apiConfig.section.inputConfig") }}</div>
      <el-select
        v-model="localConfig.httpMethod"
        :placeholder="i18n('dyform.apiSource.httpMethod')"
        style="width: 100%"
        @change="emitChange"
      >
        <el-option v-for="m in httpMethods" :key="m" :label="m" :value="m" />
      </el-select>
      <el-input
        v-model="localConfig.url"
        :placeholder="i18n('dyform.apiSource.url.helpMsg')"
        class="mt-2"
        @change="emitChange"
      />
    </div>

    <!-- 请求头表格 -->
    <div class="section">
      <div class="section-title">
        {{ i18n("dyform.apiSource.headers") }}
        <el-button type="primary" link size="small" @click="addHeader">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div v-if="localConfig.headers.length === 0" class="empty-tip">
        {{ i18n("dyform.apiConfig.helpMsg.headerName") }}
      </div>
      <div v-for="(h, i) in localConfig.headers" :key="i" class="param-row">
        <el-input v-model="h.paramName" placeholder="Name" size="small" style="flex: 2" @change="emitChange" />
        <el-input v-model="h.paramValue" placeholder="Value" size="small" style="flex: 3" @change="emitChange" />
        <el-select v-model="h.valueType" size="small" style="width: 80px" @change="emitChange">
          <el-option label="静态" value="static" />
          <el-option label="动态" value="dynamic" />
        </el-select>
        <el-button type="danger" link size="small" @click="removeHeader(i)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>

    <!-- 查询参数表格 -->
    <div class="section">
      <div class="section-title">
        {{ i18n("dyform.apiSource.requestParams") }}
        <el-button type="primary" link size="small" @click="addParam">
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div v-if="localConfig.requestParams.length === 0" class="empty-tip">
        {{ i18n("dyform.apiConfig.helpMsg.paramName") }}
      </div>
      <div v-for="(p, i) in localConfig.requestParams" :key="i" class="param-row">
        <el-input v-model="p.paramName" placeholder="Name" size="small" style="flex: 2" @change="emitChange" />
        <el-input v-model="p.paramValue" placeholder="Value" size="small" style="flex: 3" @change="emitChange" />
        <el-select v-model="p.valueType" size="small" style="width: 80px" @change="emitChange">
          <el-option label="静态" value="static" />
          <el-option label="动态" value="dynamic" />
        </el-select>
        <el-button type="danger" link size="small" @click="removeParam(i)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
      <!-- Body -->
      <div class="mt-2">
        <span class="label-sm">Body (JSON)</span>
        <el-input
          v-model="localConfig.body"
          type="textarea"
          :rows="3"
          placeholder='{"key": "value"} 支持 ${字段名} 模板'
          @change="emitChange"
        />
      </div>
    </div>

    <!-- 响应配置 -->
    <div class="section">
      <div class="section-title">{{ i18n("dyform.apiConfig.section.outputConfig") }}</div>
      <el-row :gutter="8">
        <el-col :span="8">
          <span class="label-sm">{{ i18n("dyform.apiSource.successCode") }}</span>
          <el-input v-model="localConfig.successCode" placeholder="200" size="small" @change="emitChange" />
        </el-col>
        <el-col :span="8">
          <span class="label-sm">{{ i18n("dyform.apiSource.codePath") }}</span>
          <el-input v-model="localConfig.codePath" placeholder="code" size="small" @change="emitChange" />
        </el-col>
        <el-col :span="8">
          <span class="label-sm">{{ i18n("dyform.apiSource.dataPath") }}</span>
          <el-input v-model="localConfig.dataPath" placeholder="data" size="small" @change="emitChange" />
        </el-col>
      </el-row>
      <el-input
        v-model="localConfig.messagePath"
        :placeholder="i18n('dyform.apiSource.messagePath') || 'message'"
        size="small"
        class="mt-2"
        @change="emitChange"
      />

      <!-- 数据源模式：LabelField / ValueField -->
      <template v-if="mode === 'dataSource'">
        <el-row :gutter="8" class="mt-2">
          <el-col :span="12">
            <span class="label-sm">{{ i18n("dyform.apiSource.labelField") }}</span>
            <el-input v-model="localConfig.labelField" placeholder="name" size="small" @change="emitChange" />
          </el-col>
          <el-col :span="12">
            <span class="label-sm">{{ i18n("dyform.apiSource.valueField") }}</span>
            <el-input v-model="localConfig.valueField" placeholder="id" size="small" @change="emitChange" />
          </el-col>
        </el-row>
      </template>

      <!-- 联动/规则引擎模式：fieldMappings 表格 -->
      <template v-if="mode !== 'dataSource'">
        <div class="mt-2">
          <div class="section-title">
            {{ i18n("dyform.relation.apiLinkage.fieldMappings") || "字段映射" }}
            <el-button type="primary" link size="small" @click="addMapping">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <div v-if="localConfig.fieldMappings.length === 0" class="empty-tip">
            将接口返回字段映射到表单字段
          </div>
          <div v-for="(m, i) in localConfig.fieldMappings" :key="i" class="param-row">
            <el-input v-model="m.sourceField" placeholder="接口返回字段" size="small" style="flex: 2" @change="emitChange" />
            <el-icon class="mx-1"><Right /></el-icon>
            <el-input v-model="m.targetField" placeholder="目标字段" size="small" style="flex: 2" @change="emitChange" />
            <el-button type="danger" link size="small" @click="removeMapping(i)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </template>
    </div>

    <!-- 认证配置 -->
    <div class="section">
      <div class="section-title">{{ i18n("dyform.apiConfig.section.auth") || "认证" }}</div>
      <el-select
        v-model="localConfig.authType"
        style="width: 100%"
        @change="emitChange"
      >
        <el-option label="无" value="none" />
        <el-option label="Bearer Token" value="bearer" />
        <el-option label="Basic Auth" value="basic" />
        <el-option label="自定义" value="custom" />
      </el-select>
      <template v-if="localConfig.authType === 'bearer'">
        <el-input
          v-model="localConfig.bearerToken"
          placeholder="Bearer Token"
          class="mt-2"
          @change="emitChange"
        />
      </template>
      <template v-if="localConfig.authType === 'basic'">
        <el-input v-model="localConfig.basicUsername" placeholder="用户名" class="mt-2" @change="emitChange" />
        <el-input v-model="localConfig.basicPassword" placeholder="密码" class="mt-2" type="password" @change="emitChange" />
      </template>
      <template v-if="localConfig.authType === 'custom'">
        <el-input
          v-model="localConfig.customHeaders"
          type="textarea"
          :rows="2"
          placeholder='{"Authorization": "xxx"}'
          class="mt-2"
          @change="emitChange"
        />
      </template>
    </div>

    <!-- 高级 -->
    <div class="section">
      <div class="section-title">高级</div>
      <el-row :gutter="8">
        <el-col :span="12">
          <span class="label-sm">超时(ms)</span>
          <el-input-number v-model="localConfig.timeout" :min="1000" :step="1000" size="small" style="width: 100%" @change="emitChange" />
        </el-col>
        <el-col :span="12">
          <span class="label-sm">重试次数</span>
          <el-input-number v-model="localConfig.retryCount" :min="0" :max="5" size="small" style="width: 100%" @change="emitChange" />
        </el-col>
      </el-row>
      <div class="mt-2">
        <el-switch v-model="localConfig.proxyEnabled" size="small" active-text="代理转发" @change="emitChange" />
      </div>
    </div>

    <!-- 测试按钮 -->
    <div v-if="showTestButton" class="action-bar">
      <el-button type="primary" @click="handleTest" :loading="testing">
        <el-icon><Connection /></el-icon>
        {{ i18n("dyform.apiConfig.btn.verify") }}
      </el-button>
      <el-button v-if="testResult !== null" type="success" plain disabled>
        <el-icon><Check /></el-icon>
        {{ testResult }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {reactive, ref, watch, type PropType} from "vue";
import {Check, Connection, Delete, Plus, Right} from "@element-plus/icons-vue";
import {i18n} from "@/lang";

// ═══════════════════════════════════════════════════════════════
// Props（入参类型）
// ═══════════════════════════════════════════════════════════════
defineOptions({name: "ApiRequestPanel"});

const props = defineProps({
  modelValue: {
    type: Object as PropType<ApiRequestConfig>,
    default: null,
  },
  mode: {
    type: String as PropType<"dataSource" | "linkage" | "rule">,
    default: "linkage",
  },
  showTestButton: {
    type: Boolean,
    default: true,
  },
});

// ═══════════════════════════════════════════════════════════════
// Emits（出参类型）
// ═══════════════════════════════════════════════════════════════
const emit = defineEmits<{
  (e: "update:modelValue", config: ApiRequestConfig): void;
  (e: "test", result: ApiTestEvent): void;
  (e: "change", config: ApiRequestConfig): void;
}>();

// ═══════════════════════════════════════════════════════════════
// 内部类型定义
// ═══════════════════════════════════════════════════════════════
export interface HttpParamItem {
  paramName: string;
  paramValue: string;
  valueType: "static" | "dynamic";
}

export interface FieldMappingItem {
  sourceField: string;
  targetField: string;
  typeConvert?: "string" | "number" | "boolean" | "array";
}

export interface ApiRequestConfig {
  apiType: "thirdApi" | "systemApi";
  serviceName?: string;
  interfaceName?: string;
  method?: string;
  url: string;
  httpMethod: string;
  headers: HttpParamItem[];
  requestParams: HttpParamItem[];
  body?: string;
  successCode: string;
  codePath: string;
  messagePath: string;
  dataPath: string;
  labelField?: string;
  valueField?: string;
  fieldMappings: FieldMappingItem[];
  authType: "none" | "bearer" | "basic" | "custom";
  bearerToken?: string;
  basicUsername?: string;
  basicPassword?: string;
  customHeaders?: string;
  timeout: number;
  retryCount: number;
  proxyEnabled: boolean;
  proxyUrl?: string;
}

export interface ApiTestEvent {
  success: boolean;
  message: string;
  config: ApiRequestConfig;
  response?: any;
}

// ═══════════════════════════════════════════════════════════════
// 默认值
// ═══════════════════════════════════════════════════════════════
const defaultConfig = (): ApiRequestConfig => ({
  apiType: "thirdApi",
  url: "",
  httpMethod: "GET",
  headers: [],
  requestParams: [],
  body: "",
  successCode: "200",
  codePath: "code",
  messagePath: "message",
  dataPath: "data",
  labelField: "name",
  valueField: "id",
  fieldMappings: [],
  authType: "none",
  timeout: 10000,
  retryCount: 0,
  proxyEnabled: true,
  proxyUrl: "/system-config/redirect/apiLinkage",
});

const httpMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];

// ═══════════════════════════════════════════════════════════════
// 本地状态（双向绑定）
// ═══════════════════════════════════════════════════════════════
const localConfig = reactive<ApiRequestConfig>(defaultConfig());

watch(
  () => props.modelValue,
  (val) => {
    if (val) Object.assign(localConfig, defaultConfig(), val);
    else Object.assign(localConfig, defaultConfig());
  },
  {immediate: true, deep: true},
);

const testing = ref(false);
const testResult = ref<string | null>(null);

// ═══════════════════════════════════════════════════════════════
// 操作
// ═══════════════════════════════════════════════════════════════
const emitChange = () => {
  emit("update:modelValue", {...localConfig});
  emit("change", {...localConfig});
};

const addHeader = () => {
  localConfig.headers.push({paramName: "", paramValue: "", valueType: "static"});
  emitChange();
};
const removeHeader = (i: number) => {
  localConfig.headers.splice(i, 1);
  emitChange();
};
const addParam = () => {
  localConfig.requestParams.push({paramName: "", paramValue: "", valueType: "static"});
  emitChange();
};
const removeParam = (i: number) => {
  localConfig.requestParams.splice(i, 1);
  emitChange();
};
const addMapping = () => {
  localConfig.fieldMappings.push({sourceField: "", targetField: ""});
  emitChange();
};
const removeMapping = (i: number) => {
  localConfig.fieldMappings.splice(i, 1);
  emitChange();
};

const handleTest = async () => {
  testing.value = true;
  testResult.value = null;
  try {
    const {postRequest} = await import("star-horse-lowcode");
    const payload = {
      ...localConfig,
      proxyUrl: localConfig.proxyUrl ?? "/userdb-manage/redirect/apiValid",
    };
    const data = await postRequest(payload.proxyUrl, payload);
    const result = data?.data;
    const code = result?.code ?? result?.data?.code;
    const msg = result?.cnMessage ?? result?.message ?? result?.data?.message ?? "验证成功";
    const ok = [200, 0, "200", "0", "success"].includes(String(code ?? ""));
    if (ok) {
      testResult.value = String(msg);
    } else {
      testResult.value = null;
    }
    emit("test", {
      success: ok,
      message: String(msg),
      config: {...localConfig},
      response: data,
    });
  } catch (err: any) {
    testResult.value = null;
    emit("test", {
      success: false,
      message: err?.message ?? "网络请求失败",
      config: {...localConfig},
    });
  } finally {
    testing.value = false;
  }
};

// ─── 兼容旧 ApiConfigForm 的 defineExpose API ───
const setFormData = (data: any) => {
  if (data) Object.assign(localConfig, defaultConfig(), data);
  else Object.assign(localConfig, defaultConfig());
};
const getFormData = (): ApiRequestConfig => {
  return {...localConfig};
};
const submitValid = async (): Promise<boolean> => {
  return true;
};

defineExpose({ setFormData, getFormData, submitValid });
</script>

<style scoped lang="scss">
.api-request-panel {
  padding: 4px;
  width: 100%;
  box-sizing: border-box;

  .section {
    margin-bottom: 12px;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 10px;
    background: #fafbfc;

    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  }

  .empty-tip {
    text-align: center;
    color: #9ca3af;
    font-size: 11px;
    padding: 8px 0;
    border: 1px dashed #d1d5db;
    border-radius: 4px;
    background: #f9fafb;
  }

  .param-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .label-sm {
    font-size: 11px;
    color: #6b7280;
    display: block;
    margin-bottom: 2px;
  }

  .mt-2 { margin-top: 8px; }
  .mx-1 { margin: 0 4px; }

  .action-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 12px;
  }
}
</style>