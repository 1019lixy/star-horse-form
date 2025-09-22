<script setup lang="ts">
import {
  apiInstance,
  ApiUrls,
  createDatetime,
  dialogPreps,
  loadData,
  piniaInstance,
  SearchFields,
  useDesignFormStore,
  userAction,
  UserFuncInfo,
} from "star-horse-lowcode";
import { nextTick, onMounted, provide, watch, reactive, ref } from "vue";
import { i18n } from "@/lang";
import CommonSkeleton from './CommonSkeleton.vue';

let designForm = useDesignFormStore(piniaInstance);
const normalPageRef = ref();
const normalFormRef = ref();
let relationTables = ref<any>({});
let dataUrl = ref<ApiUrls>();
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<any>({ fieldList: [] });
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
const props = defineProps({
  param: { type: String, required: true },
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  isLoading.value = true; // 开始加载
  try {
    let { data, error } = await loadData(
      `/userdb-manage/userdb/dynamicFormInfo/getDynamicForm/${formId}`,
      {},
    );
    if (error) {
      errorMsg.value = error;
      clear();
      return;
    }
    hasData.value = data && Object.keys(data).length > 0;
    dataUrl.value = apiInstance(
      data["dataUrl"]?.appName,
      data["dataUrl"]?.contextUrl,
    );
    searchFormData.value = data["searchFormData"] as SearchFields;
    primaryKey.value = data["primaryKey"];
    tableFieldList.value = data["tableFieldList"];
    rules.value = data["rules"];
    dateFields.value = data["dateFields"];
    fieldMappingList.value = data?.fieldMappingList;
    relationTables.value = data["relationTables"];
    dataSource.value = data["dataSource"];
    extBtns.value = userAction(
      normalPageRef,
      primaryKey.value,
      tableFieldList.value["userTableFuncs"],
    );
    delete tableFieldList.value["userTableFuncs"];
    await nextTick();
    normalPageRef.value?.loadByPage();
  } catch (e) {
    errorMsg.value = i18n("commonPage.dataLoadError");
    clear();
    console.error(e);
  } finally {
    isLoading.value = false; // 加载完成
  }
};
watch(
  () => props.param,
  (val) => {
    try {
      // load("数据加载中。。。");
      loadFormData(<string>val);
    } catch (e) {
      // closeLoad();
      console.log(i18n("commonPage.dataTypeMismatch"));
    }
  },
  { deep: true },
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (dateFields.value?.length > 0) {
    if (dateFields.value.includes(name)) {
      return createDatetime(cellValue);
    }
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
const init = async () => {
  await loadFormData(props.param);
};
onMounted(async () => {
  designForm.setIsEdit(false);
  init();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden" :key="param">
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
        :dialogVisible="dialogProps.editVisible"
        :dialogProps="dialogProps"
      >
        <star-horse-form
          @refresh="normalPageRef?.loadByPage()"
          :compUrl="dataUrl"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="normalFormRef"
          :globalCondition="relationTables"
          :dynamicForm="true"
        />
      </star-horse-dialog>
      <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :source="3"
      >
        <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :globalCondition="relationTables"
          :dynamicForm="true"
          :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <div class="search-content" v-if="searchFormData.fieldList?.length > 0">
        <div class="search_btn">
          <star-horse-search-comp
            @searchData="(data: any) => normalPageRef?.createSearchParams(data)"
            :formData="searchFormData"
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
          :extendBtns="extBtns"
          :compUrl="dataUrl"
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
