<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.httpCallConfig')"
    boxWidth="900px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-tabs v-model="activeTab" class="http-config-tabs">
      <!-- ===== 接口来源 ===== -->
      <el-tab-pane :label="i18n('rule.group.apiSource')" name="source">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.apiMode')" required>
            <el-radio-group v-model="formData.apiMode">
              <el-radio-button value="system">{{ i18n('rule.opt.systemApi') }}</el-radio-button>
              <el-radio-button value="custom">{{ i18n('rule.opt.customApi') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.apiType')">
            <el-radio-group v-model="formData.apiType">
              <el-radio-button value="thirdApi">{{ i18n('rule.opt.thirdApi') }}</el-radio-button>
              <el-radio-button value="systemApi">{{ i18n('rule.opt.systemApiType') }}</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.serviceName')">
            <el-input v-model="formData.serviceName" :placeholder="i18n('rule.ph.serviceName')" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.interfaceName')">
            <el-input v-model="formData.interfaceName" :placeholder="i18n('rule.ph.interfaceName')" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 请求配置 ===== -->
      <el-tab-pane :label="i18n('rule.group.request')" name="request">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.httpMethod')" required>
            <el-radio-group v-model="formData.httpMethod">
              <el-radio-button value="GET">GET</el-radio-button>
              <el-radio-button value="POST">POST</el-radio-button>
              <el-radio-button value="PUT">PUT</el-radio-button>
              <el-radio-button value="DELETE">DELETE</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.apiUrl')" required>
            <el-input v-model="formData.url" placeholder="https://api.example.com/data" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.protocol')">
            <el-radio-group v-model="formData.protocol">
              <el-radio-button value="https">https</el-radio-button>
              <el-radio-button value="http">http</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.requestDataType')">
            <el-radio-group v-model="formData.requestDataType">
              <el-radio-button value="json">JSON</el-radio-button>
              <el-radio-button value="form">Form</el-radio-button>
              <el-radio-button value="binary">Binary</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.timeout')">
            <el-input-number v-model="formData.timeout" :min="1000" :step="1000" :controls="false" style="width: 200px" />
            <span class="unit">ms</span>
          </el-form-item>

          <!-- 请求头 -->
          <el-form-item :label="i18n('rule.lbl.headers')">
            <div class="kv-table">
              <div class="kv-row kv-head">
                <span class="kv-col col-name">{{ i18n('rule.lbl.paramName') }}</span>
                <span class="kv-col col-type">{{ i18n('rule.lbl.valueType') }}</span>
                <span class="kv-col col-value">{{ i18n('rule.lbl.paramValue') }}</span>
                <span class="kv-col col-op">{{ i18n('rule.operation') }}</span>
              </div>
              <div v-for="(item, idx) in formData.headers" :key="'h-'+idx" class="kv-row">
                <el-input v-model="item.paramName" class="kv-col col-name" :placeholder="i18n('rule.lbl.paramName')" />
                <el-select v-model="item.valueType" class="kv-col col-type">
                  <el-option :label="i18n('rule.opt.static')" value="static" />
                  <el-option :label="i18n('rule.opt.dynamic')" value="dynamic" />
                </el-select>
                <el-input v-model="item.paramValue" class="kv-col col-value" :placeholder="i18n('rule.lbl.paramValue')" />
                <el-button link type="danger" class="kv-col col-op" @click="removeRow('headers', idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow('headers')" class="kv-add">
                <el-icon><Plus /></el-icon> {{ i18n('rule.addLine') }}
              </el-button>
            </div>
          </el-form-item>

          <!-- 请求参数 -->
          <el-form-item :label="i18n('rule.lbl.requestParams')">
            <div class="kv-table">
              <div class="kv-row kv-head">
                <span class="kv-col col-name">{{ i18n('rule.lbl.paramName') }}</span>
                <span class="kv-col col-type">{{ i18n('rule.lbl.valueType') }}</span>
                <span class="kv-col col-value">{{ i18n('rule.lbl.paramValue') }}</span>
                <span class="kv-col col-op">{{ i18n('rule.operation') }}</span>
              </div>
              <div v-for="(item, idx) in formData.requestParams" :key="'p-'+idx" class="kv-row">
                <el-input v-model="item.paramName" class="kv-col col-name" :placeholder="i18n('rule.lbl.paramName')" />
                <el-select v-model="item.valueType" class="kv-col col-type">
                  <el-option :label="i18n('rule.opt.static')" value="static" />
                  <el-option :label="i18n('rule.opt.dynamic')" value="dynamic" />
                </el-select>
                <el-input v-model="item.paramValue" class="kv-col col-value" :placeholder="i18n('rule.lbl.paramValue')" />
                <el-button link type="danger" class="kv-col col-op" @click="removeRow('requestParams', idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addRow('requestParams')" class="kv-add">
                <el-icon><Plus /></el-icon> {{ i18n('rule.addLine') }}
              </el-button>
            </div>
          </el-form-item>

          <el-form-item :label="i18n('rule.lbl.requestBody')" v-if="['POST','PUT','PATCH'].includes(formData.httpMethod)">
            <el-input v-model="formData.body" type="textarea" :rows="5" placeholder='{"key": "value"}' class="body-textarea" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 响应解析 ===== -->
      <el-tab-pane :label="i18n('rule.group.response')" name="response">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.successCode')">
            <el-input v-model="formData.successCode" placeholder="200" style="width: 200px" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.codePath')">
            <el-input v-model="formData.codePath" placeholder="data.code" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.messagePath')">
            <el-input v-model="formData.messagePath" placeholder="data.message" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.dataPath')">
            <el-input v-model="formData.dataPath" placeholder="data.list" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 字段映射 ===== -->
      <el-tab-pane :label="i18n('rule.group.mapping')" name="mapping">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.fieldMappings')">
            <div class="kv-table">
              <div class="kv-row kv-head">
                <span class="kv-col col-source">{{ i18n('rule.lbl.sourceField') }}</span>
                <span class="kv-col col-dist">{{ i18n('rule.lbl.distField') }}</span>
                <span class="kv-col col-op">{{ i18n('rule.operation') }}</span>
              </div>
              <div v-for="(item, idx) in formData.fieldMappings" :key="'m-'+idx" class="kv-row">
                <el-input v-model="item.sourceField" class="kv-col col-source" :placeholder="i18n('rule.lbl.sourceField')" />
                <el-input v-model="item.distField" class="kv-col col-dist" :placeholder="i18n('rule.lbl.distField')" />
                <el-button link type="danger" class="kv-col col-op" @click="removeRow('fieldMappings', idx)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" plain size="small" @click="addMapping" class="kv-add">
                <el-icon><Plus /></el-icon> {{ i18n('rule.addLine') }}
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 认证接口 ===== -->
      <el-tab-pane :label="i18n('rule.group.auth')" name="auth">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.authEnabled')">
            <el-switch v-model="formData.authEnabled" />
          </el-form-item>
          <el-form-item v-if="formData.authEnabled" :label="i18n('rule.lbl.authConfig')">
            <el-input v-model="formData.authInfo" type="textarea" :rows="6" :placeholder="i18n('rule.ph.authConfig')" class="body-textarea" />
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- ===== 高级 ===== -->
      <el-tab-pane :label="i18n('rule.group.advanced')" name="advanced">
        <el-form :model="formData" label-width="120px" size="default">
          <el-form-item :label="i18n('rule.lbl.proxyEnabled')">
            <el-switch v-model="formData.proxyEnabled" />
          </el-form-item>
          <el-form-item v-if="formData.proxyEnabled" :label="i18n('rule.lbl.proxyUrl')">
            <el-input v-model="formData.proxyUrl" placeholder="/system-config/redirect/apiLinkage" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.retryCount')">
            <el-input-number v-model="formData.retryCount" :min="0" :max="5" :controls="false" style="width: 200px" />
          </el-form-item>
          <el-form-item :label="i18n('rule.lbl.nodeDesc')">
            <el-input v-model="formData.description" type="textarea" :rows="2" />
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 摘要预览（底部固定） -->
    <div class="http-summary">
      <el-tag size="small" type="primary">{{ formData.httpMethod }}</el-tag>
      <span class="sum-url">{{ formData.url || '(未配置)' }}</span>
      <el-tag v-if="formData.fieldMappings.length" size="small" type="success">
        {{ formData.fieldMappings.length }} {{ i18n('rule.lbl.fieldMappings') }}
      </el-tag>
      <el-tag v-if="formData.authEnabled" size="small" type="warning">{{ i18n('rule.lbl.authEnabled') }}</el-tag>
    </div>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance } from "element-plus";
import { Delete, Plus } from "@element-plus/icons-vue";
import { warning } from "star-horse-lowcode";
import { i18n } from '@/lang';

const props = defineProps<{
  visible: boolean
  config: any
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", config: any): void
}>();

const dialogVisible = ref<boolean>(false);
watch(() => props.visible, (val) => { dialogVisible.value = val; }, { immediate: true });

const formRef = ref<FormInstance>();
const activeTab = ref('source');

// 默认数据：与 nodeTypes.ts http-call defaultData 对齐
const defaultFormData = () => ({
  apiMode: 'custom',
  apiType: 'thirdApi',
  serviceName: '',
  interfaceName: '',
  httpMethod: 'GET',
  url: '',
  protocol: 'https',
  timeout: 5000,
  requestDataType: 'json',
  headers: [] as any[],
  requestParams: [] as any[],
  body: '',
  successCode: '200',
  codePath: 'code',
  messagePath: 'message',
  dataPath: 'data',
  fieldMappings: [] as any[],
  authEnabled: false,
  authInfo: '',
  proxyEnabled: true,
  proxyUrl: '/system-config/redirect/apiLinkage',
  retryCount: 0,
  description: ''
});

const formData = reactive<any>(defaultFormData());

watch(() => props.visible, (val) => {
  if (val) {
    if (props.config) {
      // 合并配置，确保所有字段都有值
      Object.assign(formData, defaultFormData(), JSON.parse(JSON.stringify(props.config)));
      // 兼容旧数据：headers/requestParams 可能是对象格式 {key,value}
      formData.headers = normalizeParamArray(formData.headers);
      formData.requestParams = normalizeParamArray(formData.requestParams);
      // 兼容旧数据：fieldMappings 可能是 undefined
      if (!Array.isArray(formData.fieldMappings)) formData.fieldMappings = [];
    } else {
      Object.assign(formData, defaultFormData());
    }
    activeTab.value = 'source';
  }
});

/** 将旧格式 {key, value} 转换为新格式 {paramName, valueType, paramValue} */
const normalizeParamArray = (arr: any[]): any[] => {
  if (!Array.isArray(arr)) return [];
  return arr.map((item: any) => {
    if (item.paramName !== undefined) {
      return { valueType: 'static', ...item };
    }
    // 兼容旧 {key, value} 格式
    return { paramName: item.key || item.name || '', valueType: 'static', paramValue: item.value || '' };
  });
};

const addRow = (field: 'headers' | 'requestParams') => {
  formData[field].push({ paramName: '', valueType: 'static', paramValue: '' });
};

const removeRow = (field: 'headers' | 'requestParams', index: number) => {
  formData[field].splice(index, 1);
};

const addMapping = () => {
  formData.fieldMappings.push({ sourceField: '', distField: '' });
};

const handleClose = () => emit("close");

const handleSave = async () => {
  if (!formData.url.trim()) {
    warning(i18n('rule.ph.enterUrl'));
    activeTab.value = 'request';
    return;
  }
  // 清理空行
  const cleanHeaders = formData.headers.filter((h: any) => h.paramName && h.paramName.trim());
  const cleanParams = formData.requestParams.filter((p: any) => p.paramName && p.paramName.trim());
  const cleanMappings = formData.fieldMappings.filter((m: any) => m.sourceField && m.distField);
  emit("save", {
    ...formData,
    headers: cleanHeaders,
    requestParams: cleanParams,
    fieldMappings: cleanMappings
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
      &.col-name { flex: 1; }
      &.col-type { width: 120px; }
      &.col-value { flex: 1.3; }
      &.col-source { flex: 1; }
      &.col-dist { flex: 1; }
      &.col-op { width: 40px; text-align: center; }
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
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
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
    font-family: 'Consolas', monospace;
  }
}
</style>
