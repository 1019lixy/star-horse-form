<script setup lang="ts">
import {
  analysisCompDatas,
  ApiUrls,
  convertCompToAppComps,
  createDatetime,
  dialogPreps,
  SearchFields,
  UserFuncInfo,
} from "star-horse-lowcode";
import {computed, nextTick, onMounted, provide, ref, watch} from "vue";
import {i18n} from "@/lang";
import CommonSkeleton from "./CommonSkeleton.vue";
import {useFormRuleRuntime} from "@/components/rule/useFormRuleRuntime";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview: {type: Boolean, default: false},
  compList: {
    type: Array,
    required: true,
  },
});
const normalPageRef = ref();
const normalFormRef = ref();
let relationTables = ref<any>({});
let dataUrl = ref<ApiUrls>();
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields | any>({fieldList: []});
const tableFieldList = ref<any>({
  fieldList: [],
  stopAutoLoad: true,
});
// 添加骨架屏加载状态
const isLoading = ref(true);
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");
const rules = ref<any>({});
const hasData = ref<boolean>(true);
const fieldMappingList = ref<any>([]);
const dataSource = ref<any>({});
let dateFields = ref<Array<string>>([]);
let extBtns = ref<Array<UserFuncInfo>>([]);

// ==================== 规则引擎集成 ====================
const ruleFormId = computed(() => {
  const list = props.compList as any[];
  if (!list || list.length === 0) return '';
  return list[0]?.formId || list[0]?.preps?.formId || '';
});

const ruleFormData = computed(() => {
  return normalFormRef.value?.getFormData()?.value ?? {};
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

// ON_LOAD: 对话框编辑表单加载数据后触发
const onFormDataLoaded = async () => {
  if (isEnabled.value && currentFormId.value) {
    await nextTick();
    await triggerOnLoad();
  }
};

// ON_SUBMIT: 对话框表单提交前校验
const handleBeforeSubmit = async ({type, formData: fd}: {type: string; formData: any}) => {
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
  normalPageRef.value?.loadByPage();
  isLoading.value = false; // 加载完成
};

const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (dateFields.value?.length > 0) {
    if (dateFields.value.includes(name)) {
      return createDatetime(cellValue);
    }
    console.log(name, cellValue, row);
    return cellValue;
  }
  const subFormat = (name: string, cellValue: any, row: any) => {
    if (dataSource.value && Object.keys(dataSource.value).length > 0) {
      let temp = dataSource.value[name];
      if (temp) {
        let stemp = temp.datas?.find(
            (item: any) => item[temp.valueField] == cellValue,
        );
        return stemp ? stemp[temp.labelField] : cellValue || "--";
      }
    }
    return "null" == cellValue ? "--" : cellValue || "--";
  };
  if (fieldMappingList.value && fieldMappingList.value?.length > 0) {
    let temp = fieldMappingList.value.find(
        (item: any) => item["fieldName"] == name,
    );
    if (temp) {
      return row[temp.mappingDisplayField] || subFormat(name, cellValue, row);
    }
  }
  return subFormat(name, cellValue, row);
};
const dataRecall = (formData: any, result: any) => {
  if (props.preview) {
    console.log(formData.dataMap);
    normalPageRef.value?.assignStaticData(formData.dataMap);
  } else {
    normalPageRef.value?.loadByPage();
  }
};
const init = async () => {
  await loadFormData();
};
onMounted(() => {
  init();
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
        :showSearch="true"
        :showHeader="true"
        :showTable="true"
        :tableRowCount="5"
    />

    <!-- 正常内容 -->
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
            :primary-key="primaryKey"
            :rules="rules"
            ref="normalFormRef"
            :globalCondition="relationTables"
            :dynamicForm="true"
        />
      </star-horse-dialog>
      <star-horse-dialog
          v-model="dialogProps.viewVisible"
          :source="3"
      >
        <star-horse-data-view
            :dataFormat="dataFormat"
            :field-list="tableFieldList"
            :preview="preview"
            :globalCondition="relationTables"
            :dynamicForm="true"
            :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <div class="search-content" v-if="searchFormData.searchItemList?.length > 0">
        <div class="search_btn">
          <star-horse-search-comp
              @searchData="(data: any) => normalPageRef?.createSearchParams(data)"
              :formData="{fieldList:tableFieldList.searchItemList}"
              :preview="preview"
              :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content">
        <star-horse-table-comp
            ref="normalPageRef"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :globalConfig="relationTables"
            :isDynamic="true"
            :preview="preview"
            :extendBtns="extBtns"
            :compUrl="dataUrl"
            :btnPermissions="{
            add: 'add',
            edit: 'edit',
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
<style lang="scss" scoped>
/* 原有样式保留 */
</style>
