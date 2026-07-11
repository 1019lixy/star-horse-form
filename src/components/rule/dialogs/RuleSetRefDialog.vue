<template>
  <star-horse-dialog
    :dialogVisible="visible"
    title="规则集引用配置"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item label="规则集" prop="ruleSetId">
        <el-select
          v-model="formData.ruleSetId"
          placeholder="请选择规则集"
          filterable
          :loading="loading"
          style="width: 100%"
          @change="handleRuleSetChange"
        >
          <el-option
            v-for="item in ruleSetOptions"
            :key="item.idRuleSet"
            :label="item.ruleSetName"
            :value="item.idRuleSet"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="规则集编码">
        <el-input v-model="formData.ruleSetCode" placeholder="自动填充" disabled />
      </el-form-item>
      <el-form-item label="传参方式" prop="paramMode">
        <el-radio-group v-model="formData.paramMode">
          <el-radio label="NONE">不传参</el-radio>
          <el-radio label="CONTEXT">传入当前上下文</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="说明">
        <div class="help-block">
          <div class="help-title">规则集引用说明：</div>
          <ul class="help-list">
            <li>不传参：被引用规则集独立执行，不共享当前规则变量</li>
            <li>传入当前上下文：将当前 context、formData、variables 传入被引用规则集</li>
            <li>被引用规则集执行完成后会返回执行结果</li>
          </ul>
        </div>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ruleSetApi } from "@/api/rule_engine_api";
import { warning } from "star-horse-lowcode";

const props = defineProps<{
  visible: boolean
  config: any
}>();

const emit = defineEmits<{
  (e: "close"): void
  (e: "save", config: any): void
}>();

const formRef = ref<FormInstance>();

const defaultFormData = () => ({
  ruleSetId: "",
  ruleSetName: "",
  ruleSetCode: "",
  paramMode: "CONTEXT"
});

const formData = reactive<any>(defaultFormData());

const rules = reactive<FormRules>({
  ruleSetId: [{ required: true, message: "请选择规则集", trigger: "change" }],
  paramMode: [{ required: true, message: "请选择传参方式", trigger: "change" }]
});

const ruleSetOptions = ref<any[]>([]);
const loading = ref(false);

watch(() => props.visible, (val) => {
  if (val) {
    if (props.config) {
      formData.ruleSetId = props.config.ruleSetId || "";
      formData.ruleSetName = props.config.ruleSetName || "";
      formData.ruleSetCode = props.config.ruleSetCode || "";
      formData.paramMode = props.config.paramMode || "CONTEXT";
    } else {
      Object.assign(formData, defaultFormData());
    }
    formRef.value?.clearValidate();
    loadRuleSetList();
  }
});

const loadRuleSetList = async () => {
  loading.value = true;
  try {
    const res: any = await ruleSetApi.getRuleSetList({ pageNo: 1, pageSize: 999 });
    ruleSetOptions.value = res?.data?.list || res?.data?.records || res?.list || res?.records || [];
  } catch (e) {
    console.error("加载规则集列表失败", e);
    ruleSetOptions.value = [];
  } finally {
    loading.value = false;
  }
};

const handleRuleSetChange = (val: string) => {
  const selected = ruleSetOptions.value.find((item: any) => item.idRuleSet === val);
  if (selected) {
    formData.ruleSetName = selected.ruleSetName || "";
    formData.ruleSetCode = selected.ruleSetCode || selected.code || "";
  } else {
    formData.ruleSetName = "";
    formData.ruleSetCode = "";
  }
};

const handleClose = () => {
  emit("close");
};

const handleSave = async () => {
  if (!formRef.value) return;
  await formRef.value.validate((valid) => {
    if (!valid) return;
    if (!formData.ruleSetId) {
      warning("请选择规则集");
      return;
    }
    emit("save", {
      ruleSetId: formData.ruleSetId,
      ruleSetName: formData.ruleSetName,
      ruleSetCode: formData.ruleSetCode,
      paramMode: formData.paramMode
    });
  });
};
</script>

<style scoped lang="scss">
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
  }
}
</style>
