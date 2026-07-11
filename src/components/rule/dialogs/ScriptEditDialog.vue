<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="脚本编辑"
    boxWidth="680px"
    boxHeight="auto"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="脚本语言" prop="scriptLang">
        <el-select v-model="formData.scriptLang" style="width: 100%;z-index:999 !important;">
          <el-option label="JavaScript" value="javascript" />
          <el-option label="TypeScript" value="typescript" />
        </el-select>
      </el-form-item>
      <el-form-item label="脚本内容" prop="scriptContent">
        <el-input
          v-model="formData.scriptContent"
          type="textarea"
          :rows="15"
          placeholder="请输入脚本代码..."
          resize="vertical"
          class="script-textarea"
        />
      </el-form-item>
      <el-form-item label="可用变量">
        <div class="help-block">
          <div class="help-title">脚本中可使用以下内置变量：</div>
          <ul class="help-list">
            <li><code>context</code> - 规则执行上下文对象</li>
            <li><code>formData</code> - 当前表单数据对象</li>
            <li><code>variables</code> - 规则变量集合</li>
          </ul>
          <div class="help-example">
            示例：<code>formData.fieldName = variables.result;</code>
          </div>
        </div>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { warning } from "star-horse-lowcode";

const props = defineProps<{
  visible: boolean
  script: any
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", script: any): void
}>();

const formRef = ref<FormInstance>();

const defaultFormData = () => ({
  scriptLang: "javascript",
  scriptContent: ""
});

const formData = reactive<any>(defaultFormData());

const rules = reactive<FormRules>({
  scriptLang: [{ required: true, message: "请选择脚本语言", trigger: "change" }],
  scriptContent: [{ required: true, message: "请输入脚本内容", trigger: "blur" }]
});

watch(() => props.visible, (val) => {
  if (val) {
    if (props.script) {
      formData.scriptLang = props.script.scriptLang || "javascript";
      formData.scriptContent = props.script.scriptContent || "";
    } else {
      Object.assign(formData, defaultFormData());
    }
    formRef.value?.clearValidate();
  }
});

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (!valid) return;
    if (!formData.scriptContent.trim()) {
      warning("脚本内容不能为空");
      return;
    }
    emit("save", {
      scriptLang: formData.scriptLang,
      scriptContent: formData.scriptContent
    });
  });
};
</script>

<style scoped lang="scss">
:deep(.script-textarea) {
  textarea {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
    line-height: 1.6;
  }
}

.help-block {
  width: 100%;
  padding: 10px 12px;
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  border-radius: 6px;

  .help-title {
    font-size: 12px;
    font-weight: 600;
    color: #0369a1;
    margin-bottom: 6px;
  }

  .help-list {
    margin: 0;
    padding-left: 18px;
    font-size: 12px;
    color: #0c4a6e;
    line-height: 1.8;

    code {
      padding: 1px 5px;
      background: #e0f2fe;
      border-radius: 3px;
      color: #0c4a6e;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
    }
  }

  .help-example {
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px dashed #bae6fd;
    font-size: 12px;
    color: #0c4a6e;

    code {
      padding: 1px 5px;
      background: #e0f2fe;
      border-radius: 3px;
      font-family: 'Consolas', 'Monaco', monospace;
      font-size: 12px;
    }
  }
}
</style>
