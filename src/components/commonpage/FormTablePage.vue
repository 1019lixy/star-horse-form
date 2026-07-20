<script setup lang="ts">
import { computed, nextTick, onMounted, provide, reactive, ref, watch } from "vue";
import {
  analysisAppComps,
  analysisCompDatas,
  apiInstance,
  ApiUrls, convertCompToAppComps,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { i18n } from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";
import {useFormRuleRuntime, validateRule} from "@/components/rule/useFormRuleRuntime";

const props = defineProps({
  currentPageClass: {type:String, default:""},
  preview:{type:Boolean, default:false},
  compList: {
    type: Array,
    required: true,
  },
});
const starHorseTableCompRef = ref();
const ftFormRef = ref();
const dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields | any>({});
const tableFieldList = ref<PageFieldInfo>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
/** 验证错误信息：字段名 -> 错误消息 */
const validationErrors = ref<Record<string, string>>({})
const hasData = ref(false);

// ==================== 规则引擎集成 ====================
const ruleFormId = computed(() => {
  const list = props.compList as any[];
  if (!list || list.length === 0) return '';
  return list[0]?.formId || list[0]?.preps?.formId || '';
});

const ruleFormData = computed(() => {
  return ftFormRef.value?.getFormData()?.value ?? {};
});

const {
  triggerOnLoad,
  triggerOnSubmit,
  loading: ruleLoading,
  currentFormId,
  isEnabled,
} = useFormRuleRuntime({
  formId: ruleFormId,
  formFields: tableFieldList,
  formData: ruleFormData,
  enabled: computed(() => !!ruleFormId.value),
});

const onFormDataLoaded = async () => {
  if (isEnabled.value && currentFormId.value) {
    await nextTick();
    await triggerOnLoad();
  }
};

/**
 * 验证表单 - 执行 ON_VALIDATE 规则
 * @returns 是否验证通过
 */
const validateForm = (): boolean => {
  // 清除之前的验证错误
  validationErrors.value = {}
  
  // 如果没有规则，直接通过
  if (!rules.value || Object.keys(rules.value).length === 0) {
    return true
  }
  
  // 执行验证规则
  const results = validateRule(
    Array.isArray(rules.value) ? rules.value : [],
    ruleFormData.value
  )
  
  // 收集验证错误
  let isValid = true
  for (const result of results) {
    if (!result.valid) {
      isValid = false
      // 尝试从消息中提取字段名
      const match = result.message?.match(/^(\w+)/)
      if (match) {
        validationErrors.value[match[1]] = result.message || '验证失败'
      }
    }
  }
  
  return isValid
}

/**
 * 获取字段验证错误
 * @param fieldName 字段名
 * @returns 错误消息或空字符串
 */
const getFieldError = (fieldName: string): string => {
  return validationErrors.value[fieldName] || ''
}

const handleBeforeSubmit = async ({type, formData: fd}: {type: string; formData: any}) => {
  // 执行表单验证
  if (!validateForm()) {
    return false
  }
  if (isEnabled.value && currentFormId.value) {
    const ok = await triggerOnSubmit();
    if (!ok) return false;
  }
};
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


//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataRecall = (formData: any, result: any) => {
  if (props.preview) {
    starHorseTableCompRef.value?.assignStaticData(formData);
  } else {
    starHorseTableCompRef.value?.loadByPage()
  }
};
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
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
    { deep: true },
);
watch(
    () => props.currentPageClass,
    (val) => {
      loadFormData();
    },
    {deep: true},
);
defineExpose({
  validateForm,
  validationErrors,
  getFieldError
})
</script>
<style scoped>
.validation-error {
  color: #f56c6c;
  font-size: 12px;
  line-height: 1;
  padding-top: 4px;
}
.validation-errors {
  padding: 4px 0;
}
</style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 -->
    <CommonSkeleton
      v-if="isLoading"
      :showSearch="true"
      :showHeader="true"
      :showTable="true"
      :tableRowCount="5"
    />

    <template v-else-if="hasData">
      <star-horse-dialog
        :isShowBtnContinue="true"
        v-model="dialogProps.editVisible"
      >
        <star-horse-form
          @refresh="dataRecall"
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :compUrl="dataUrl"
          :preview="preview"
          :fieldList="tableFieldList"
          :rules="rules"
          ref="ftFormRef"
        />
        <!-- 验证错误提示 -->
        <div v-if="Object.keys(validationErrors).length > 0" class="validation-errors">
          <div v-for="(msg, field) in validationErrors" :key="field" class="validation-error">
            {{ msg }}
          </div>
        </div>
      </star-horse-dialog>
      <star-horse-dialog
       v-model="dialogProps.viewVisible"
        :source="3"
      >
        <star-horse-data-view
          :dataFormat="dataFormat"
          :preview="preview"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <div class="search_content" v-if="searchFormData.fieldList?.length > 0">
        <div class="search_btn">
          <star-horse-search-comp
            @searchData="
              (data: any) => starHorseTableCompRef?.createSearchParams(data)
            "
            :formData="searchFormData"
            :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content">
        <star-horse-table-comp
          ref="starHorseTableCompRef"
          :fieldList="tableFieldList"
          :primaryKey="primaryKey"
          :compUrl="dataUrl"
          :preview="preview"
          :btnPermissions="{
            add: 'add',
            edit: 'eidt',
            view: 'view',
          }"
          :showBatchField="true"
          :dataFormat="dataFormat"
        />
      </el-card>
    </template>
    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
