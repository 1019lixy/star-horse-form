<script setup lang="ts">
import { computed, ref } from "vue";
import { analysisCompDatas, convertCompToAppComps } from "star-horse-lowcode";
import { useCommonPage } from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import { i18n } from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const wizardFormRefs = ref<any[]>([]);
const currentStep = ref(0);
const stepSubmitting = ref(false);

const {
  isLoading,
  hasData,
  errorMsg,
  primaryKey,
  rules,
  relationTables,
  tableFieldList,
  dataUrl,
  dialogProps,
  ruleFormId,
  onFormDataLoaded,
  handleBeforeSubmit,
  dataRecall,
} = useCommonPage({
  props,
  formRef: computed(() => wizardFormRefs.value[currentStep.value]) as any,
  enableOnChange: true,
});

interface StepInfo {
  title: string;
  fieldList: any;
}
const steps = ref<StepInfo[]>([]);

const parseStepFields = (el: any): any => {
  let comps: any[] = [];
  if (Array.isArray(el.items)) comps = el.items;
  else if (Array.isArray(el.columns)) {
    for (const col of el.columns) {
      if (col && Array.isArray(col.items)) comps = comps.concat(col.items);
    }
  }
  let fl = analysisCompDatas(comps);
  if (props.currentPageClass == "main-design-phone") {
    fl = convertCompToAppComps(fl);
  }
  return fl;
};

const buildSteps = () => {
  const list = props.compList as any[];
  const stepComp = list?.find(
    (c: any) => c?.preps?.itemType == "step" || c?.itemType == "step",
  );
  if (stepComp) {
    const elements = stepComp.preps?.elements || [];
    steps.value = elements.map((el: any, i: number) => ({
      title:
        el.title || el.name || `${i18n("commonPage.wizard.step")} ${i + 1}`,
      fieldList: parseStepFields(el),
    }));
  } else {
    steps.value = [
      {
        title: i18n("commonPage.wizard.step"),
        fieldList: tableFieldList.value,
      },
    ];
  }
};
buildSteps();

const isLastStep = computed(() => currentStep.value === steps.value.length - 1);
const currentFieldList = computed(
  () => steps.value[currentStep.value]?.fieldList ?? { fieldList: [] },
);

const validateCurrentStep = async (): Promise<boolean> => {
  const formRef = wizardFormRefs.value[currentStep.value];
  if (!formRef) return true;
  try {
    if (formRef.validateForm) {
      return await formRef.validateForm();
    }
    if (formRef.$refs?.previewFormRef?.validate) {
      await formRef.$refs.previewFormRef.validate();
      return true;
    }
    return true;
  } catch {
    return false;
  }
};

const handleNext = async () => {
  const ok = await validateCurrentStep();
  if (!ok) return;
  if (currentStep.value < steps.value.length - 1) currentStep.value++;
};
const handlePrev = () => {
  if (currentStep.value > 0) currentStep.value--;
};
const handleSubmit = async () => {
  const ok = await validateCurrentStep();
  if (!ok) return;
  stepSubmitting.value = true;
  try {
    const beforeOk = await handleBeforeSubmit({ type: "merge", formData: {} });
    if (beforeOk === false) return;
    const lastForm = wizardFormRefs.value[steps.value.length - 1];
    if (lastForm?.merge) await lastForm.merge("merge");
    else dataRecall({}, {});
  } finally {
    stepSubmitting.value = false;
  }
};
const setFormRef = (el: any, idx: number) => {
  if (el) wizardFormRefs.value[idx] = el;
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showForm="true"
      :formRowCount="6"
    />

    <template v-else-if="hasData">
      <el-card class="inner_content">
        <el-steps :active="currentStep" align-center class="mb-6">
          <el-step v-for="(s, i) in steps" :key="i" :title="s.title" />
        </el-steps>

        <div class="wizard-body">
          <star-horse-form
            v-for="(step, idx) in steps"
            v-show="idx === currentStep"
            :key="idx"
            :compUrl="dataUrl"
            :preview="preview"
            :fieldList="step.fieldList"
            :primary-key="primaryKey"
            :rules="rules"
            :globalCondition="relationTables"
            :dynamicForm="true"
            :typeModel="'form'"
            :ref="(el: any) => setFormRef(el, idx)"
            @dataLoaded="onFormDataLoaded"
          />
        </div>

        <div class="wizard-actions flex justify-end gap-2 mt-6">
          <el-button @click="handlePrev" :disabled="currentStep === 0">
            {{ i18n("commonPage.wizard.prev") }}
          </el-button>
          <el-button v-if="!isLastStep" type="primary" @click="handleNext">
            {{ i18n("commonPage.wizard.next") }}
          </el-button>
          <el-button
            v-else
            type="success"
            :loading="stepSubmitting"
            @click="handleSubmit"
          >
            {{ i18n("commonPage.wizard.submit") }}
          </el-button>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />
  </div>
</template>
<style lang="scss" scoped>
.wizard-body {
  min-height: 200px;
}
</style>
