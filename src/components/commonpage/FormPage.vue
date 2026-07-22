<script setup lang="ts">
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {
  analysisCompDatas,
  apiInstance,
  ApiUrls,
  convertCompToAppComps,
  dialogPreps,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";
import {useFormRuleRuntime} from "@/components/rule/useFormRuleRuntime";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview:{type:Boolean, default:false},
  compList: {
    type: Array,
    required: true,
  },
});
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
const formPageRef = ref();
const tableFieldList = ref<any>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
let outerFormData = ref<any>({});

// ==================== 规则引擎集成 ====================
// 从 compList 中提取 formId（取第一个组件的 formId 或当前表单ID）
const ruleFormId = computed(() => {
  const list = props.compList as any[];
  if (!list || list.length === 0) return '';
  // 从 compList 或 tableFieldList 中获取 formId
  return list[0]?.formId || list[0]?.preps?.formId || '';
});

// 响应式 formData（从 StarHorseForm 获取）
const ruleFormData = computed(() => {
  return formPageRef.value?.getFormData()?.value ?? {};
});

const {
  triggerOnLoad,
  triggerOnSubmit,
  triggerOnChange,
  currentFormId,
  isEnabled,
} = useFormRuleRuntime({
  formId: ruleFormId,
  formFields: tableFieldList,
  formData: ruleFormData,
  enabled: computed(() => !!ruleFormId.value),
});

// ON_LOAD: 表单数据加载完成后触发规则引擎
const onFormDataLoaded = async () => {
  if (isEnabled.value && currentFormId.value) {
    await nextTick();
    await triggerOnLoad();
  }
};

// ON_SUBMIT: 提交前进行规则引擎校验
const handleBeforeSubmit = async ({type, formData: fd}: {type: string; formData: any}) => {
  if (isEnabled.value && currentFormId.value) {
    const ok = await triggerOnSubmit();
    if (!ok) return false;
  }
};

// ON_CHANGE: 表单字段变更时触发规则引擎（300ms 防抖）
// 设计说明：
//   - 规则引擎是表单级服务，在表单级监听 formData 变更，不是字段级逐个配置
//   - 与 shplugin 的 dataRelation（字段级轻量联动，同步）并行运行，互不干扰
//   - 执行时序：字段变更 → dataRelation 同步执行 → 300ms 后规则引擎异步执行
//   - 规则引擎结果覆盖 dataRelation 结果（业务规则优先级高于字段联动）
let changeTimer: ReturnType<typeof setTimeout> | null = null;
watch(
    () => ruleFormData.value,
    () => {
      if (!isEnabled.value || !currentFormId.value) return;
      if (changeTimer) clearTimeout(changeTimer);
      changeTimer = setTimeout(() => triggerOnChange(), 300);
    },
    {deep: true},
);

const loadFormData = async () => {
  isLoading.value = true; // 开始加载
  primaryKey.value = "id";
  tableFieldList.value = analysisCompDatas(props.compList);
  if (props.currentPageClass == "main-design-phone") {
    tableFieldList.value = convertCompToAppComps(tableFieldList.value);
  }

  await nextTick();
  hasData.value = true;
  isLoading.value = false; // 加载完成
};



const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const init = async () => {
  await loadFormData();
};
onMounted(async () => {
  await init();
});
watch(
    () => props.compList,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
watch(
    () => props.currentPageClass,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 -->
    <CommonSkeleton
        v-if="isLoading"
        :showSearch="false"
        :showHeader="true"
        :showForm="true"
        :formRowCount="6"
    />

    <template v-else-if="hasData">
      <el-card class="inner_content">
        <star-horse-form
            :compUrl="dataUrl"
            :dynamicForm="true"
            ref="formPageRef"
            :preview="preview"
            :label-position="currentPageClass=='main-design-phone'?'top':'left'"
            :globalCondition="relationTables"
            :outerFormData="outerFormData"
            :fieldList="tableFieldList"
            :rules="rules"
            :typeModel="'form'"
            @dataLoaded="onFormDataLoaded"
            @beforeSubmit="handleBeforeSubmit"
        />
      </el-card>
    </template>

    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
<style scoped></style>
