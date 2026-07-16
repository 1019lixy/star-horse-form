<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.httpCallConfig')"
    boxWidth="700px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.requestMethod')" prop="method">
        <el-select v-model="formData.method" style="width: 100%;z-index:999 !important;">
          <el-option label="GET" value="GET" />
          <el-option label="POST" value="POST" />
          <el-option label="PUT" value="PUT" />
          <el-option label="DELETE" value="DELETE" />
          <el-option label="PATCH" value="PATCH" />
        </el-select>
      </el-form-item>
      <el-form-item label="URL" prop="url">
        <el-input v-model="formData.url" placeholder="https://api.example.com/resource" />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.requestHeaders')">
        <div class="kv-editor">
          <div v-if="formData.headers.length === 0" class="kv-empty">{{ i18n('rule.dialog.noRequestHeaders') }}</div>
          <div v-for="(item, index) in formData.headers" :key="'h-' + index" class="kv-row">
            <el-input v-model="item.key" :placeholder="i18n('rule.ph.headerName')" class="kv-key" />
            <span class="kv-sep">:</span>
            <el-input v-model="item.value" :placeholder="i18n('rule.ph.headerValue')" class="kv-value" />
            <el-button type="danger" link @click="removeKv('headers', index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
          <el-button type="primary" plain @click="addKv('headers')" class="kv-add">
            <el-icon>
              <Plus />
            </el-icon>
            {{ i18n('rule.btn.addRequestHeaders') }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.requestParams')">
        <div class="kv-editor">
          <div v-if="formData.params.length === 0" class="kv-empty">{{ i18n('rule.dialog.noRequestParams') }}</div>
          <div v-for="(item, index) in formData.params" :key="'p-' + index" class="kv-row">
            <el-input v-model="item.key" :placeholder="i18n('rule.ph.paramName')" class="kv-key" />
            <span class="kv-sep">:</span>
            <el-input v-model="item.value" :placeholder="i18n('rule.ph.paramValue')" class="kv-value" />
            <el-button type="danger" link @click="removeKv('params', index)">
              <el-icon>
                <Delete />
              </el-icon>
            </el-button>
          </div>
          <el-button type="primary" plain @click="addKv('params')" class="kv-add">
            <el-icon>
              <Plus />
            </el-icon>
            {{ i18n('rule.btn.addParams') }}
          </el-button>
        </div>
      </el-form-item>

      <el-form-item v-if="['POST', 'PUT', 'PATCH'].includes(formData.method)" :label="i18n('rule.lbl.requestBody')">
        <el-input
          v-model="formData.body"
          type="textarea"
          :rows="5"
          placeholder='{"key": "value"}'
          class="body-textarea"
        />
      </el-form-item>

      <el-form-item :label="i18n('rule.lbl.responseVarName')" prop="responseVar">
        <el-input v-model="formData.responseVar" :placeholder="i18n('rule.ph.responseVarNameExample')" />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
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
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
const formRef = ref<FormInstance>();

const defaultFormData = () => ({
  method: "GET",
  url: "",
  headers: [] as any[],
  params: [] as any[],
  body: "",
  responseVar: ""
});

const formData = reactive<any>(defaultFormData());

const rules = reactive<FormRules>({
  method: [{ required: true, message: i18n('rule.ph.selectRequestMethod'), trigger: "change" }],
  url: [{ required: true, message: i18n('rule.ph.enterUrl'), trigger: "blur" }],
  responseVar: [{ required: true, message: i18n('rule.ph.enterResponseVarName'), trigger: "blur" }]
});

watch(() => props.visible, (val) => {
  if (val) {
    if (props.config) {
      formData.method = props.config.method || "GET";
      formData.url = props.config.url || "";
      formData.headers = props.config.headers ? JSON.parse(JSON.stringify(props.config.headers)) : [];
      formData.params = props.config.params ? JSON.parse(JSON.stringify(props.config.params)) : [];
      formData.body = props.config.body || "";
      formData.responseVar = props.config.responseVar || "";
    } else {
      Object.assign(formData, defaultFormData());
    }
    formRef.value?.clearValidate();
  }
});

const addKv = (field: "headers" | "params") => {
  formData[field].push({ key: "", value: "" });
};

const removeKv = (field: "headers" | "params", index: number) => {
  formData[field].splice(index, 1);
};

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (!valid) return;
    if (!formData.url.trim()) {
      warning(i18n('rule.ph.enterUrl'));
      return;
    }
    const cleanHeaders = formData.headers.filter((h: any) => h.key && h.key.trim());
    const cleanParams = formData.params.filter((p: any) => p.key && p.key.trim());
    emit("save", {
      method: formData.method,
      url: formData.url,
      headers: cleanHeaders,
      params: cleanParams,
      body: ["POST", "PUT", "PATCH"].includes(formData.method) ? formData.body : "",
      responseVar: formData.responseVar
    });
  });
};
</script>

<style scoped lang="scss">
.kv-editor {
  width: 100%;

  .kv-empty {
    padding: 6px 0;
    font-size: 12px;
    color: #9ca3af;
  }

  .kv-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;

    .kv-key {
      flex: 1;
    }

    .kv-sep {
      color: #9ca3af;
      font-size: 12px;
    }

    .kv-value {
      flex: 1.5;
    }
  }

  .kv-add {
    width: 100%;
    margin-top: 4px;
  }
}

:deep(.body-textarea) {
  textarea {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }
}
</style>
