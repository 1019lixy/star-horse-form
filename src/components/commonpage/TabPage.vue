<script setup lang="ts">
import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
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
import { TabsPaneContext } from "element-plus";
import { i18n } from "@/lang";
import CommonSkeleton from './CommonSkeleton.vue';

let designForm = useDesignFormStore(piniaInstance);
const starHorseTableCompRef = ref();
let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const errorMsg = ref(i18n("commonPage.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tableFieldList = ref<any>({
  fieldList: [],
});
// 添加骨架屏加载状态
const isLoading = ref(true);
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
const fieldMappingList = ref<any>([]);
const dataSource = ref<any>({});
let dateFields = ref<Array<string>>([]);
const activeName = ref<string>("form");
let extBtns = ref<Array<UserFuncInfo>>([]);
const props = defineProps({
  param: { type: String, required: true },
});
const handleClick = (_tab: TabsPaneContext, _event: Event) => {};
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
      hasData.value = false;
      // closeLoad();
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
      starHorseTableCompRef,
      primaryKey.value,
      tableFieldList.value["userTableFuncs"],
    );
    delete tableFieldList.value["userTableFuncs"];
    await nextTick();
    // closeLoad();
    starHorseTableCompRef.value!.init();
  } catch (e) {
    errorMsg.value = i18n("commonPage.dataLoadError");
    hasData.value = false;
    console.error(e);
  } finally {
    isLoading.value = false; // 加载完成
  }
};
watch(
  () => props.param,
  (val) => {
    clear();
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

const init = async () => {
  designForm.setIsEdit(false);

  await loadFormData(props.param);
};
const dataFormat = (name: string, cellValue: object, row: any): any => {
  if (dateFields.value && dateFields.value.length > 0) {
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
onMounted(async () => {
  await init();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- 使用通用骨架屏组件 - 带标签页样式 -->
    <CommonSkeleton 
      v-if="isLoading" 
      :showSearch="false" 
      :showHeader="true" 
      :showTabs="true" 
      :showForm="true" 
      :showTable="false" 
      :formRowCount="6"
    />
    
    <template v-else-if="hasData">
      <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :source="3"
      >
        <star-horse-data-view
          :dataFormat="dataFormat"
          :primary-key="primaryKey"
          :dynamicForm="true"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
        />
      </star-horse-dialog>
      <el-card class="inner_content">
        <el-tabs
          v-model="activeName"
          type="border-card"
          @tab-click="handleClick"
        >
          <el-tab-pane :label="i18n('commonPage.tab.form')" name="form">
            <star-horse-form
              @refresh="starHorseTableCompRef?.loadByPage()"
              :dynamicForm="true"
              :compUrl="dataUrl"
              :formInfo="formInfo"
              :fieldList="tableFieldList"
              :rules="rules"
              :globalCondition="relationTables"
              :typeModel="'form'"
            />
          </el-tab-pane>
          <el-tab-pane :label="i18n('commonPage.tab.dataList')" name="table">
            <div
              class="search-content"
              v-if="searchFormData.fieldList?.length > 0"
            >
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) =>
                      starHorseTableCompRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="starHorseTableCompRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :globalConfig="relationTables"
              :isDynamic="true"
              :extendBtns="extBtns"
              :showBatchField="true"
              :dataFormat="dataFormat"
            />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </template>
    
    <!-- 错误或空状态 -->
    <el-empty :content="errorMsg" v-else></el-empty>
  </div>
</template>
<style scoped></style>
