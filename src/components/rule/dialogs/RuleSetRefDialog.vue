<template>
  <star-horse-dialog
    v-model="dialogVisible"
    :title="i18n('rule.dialog.ruleSetRefConfig')"
    boxWidth="560px"
    :selfFunc="true"
    @closeAction="handleClose"
    @merge="handleSave"
  >
    <el-form :model="formData" label-width="100px" size="default" ref="formRef" :rules="rules">
      <el-form-item :label="i18n('rule.lbl.ruleSet')" prop="ruleSetId">
        <el-select
          v-model="formData.ruleSetId"
          :placeholder="i18n('rule.ph.selectRuleSet')"
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
      <el-form-item :label="i18n('rule.lbl.ruleSetCode')">
        <el-input v-model="formData.ruleSetCode" :placeholder="i18n('rule.ph.autoFill')" disabled />
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.paramMode')" prop="paramMode">
        <el-radio-group v-model="formData.paramMode">
          <el-radio label="NONE">{{ i18n('rule.dialog.noParam') }}</el-radio>
          <el-radio label="CONTEXT">{{ i18n('rule.dialog.passCurrentContext') }}</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item :label="i18n('rule.lbl.description')">
        <div class="help-block">
          <div class="help-title">{{ i18n('rule.dialog.ruleSetRefInstructions') }}</div>
          <ul class="help-list">
            <li>{{ i18n('rule.dialog.noParamDesc') }}</li>
            <li>{{ i18n('rule.dialog.passContextDesc') }}</li>
            <li>{{ i18n('rule.dialog.refRuleSetReturnDesc') }}</li>
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
  ruleSetId: "",
  ruleSetName: "",
  ruleSetCode: "",
  paramMode: "CONTEXT"
});

const formData = reactive<any>(defaultFormData());

const rules = reactive<FormRules>({
  ruleSetId: [{ required: true, message: i18n('rule.ph.selectRuleSet'), trigger: "change" }],
  paramMode: [{ required: true, message: i18n('rule.ph.selectParamMode'), trigger: "change" }]
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
    console.error(i18n('rule.dialog.loadRuleSetListFailed'), e);
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
      warning(i18n('rule.ph.selectRuleSet'));
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
