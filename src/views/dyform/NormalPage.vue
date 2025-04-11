<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, closeLoad, dialogPreps, load, loadData, loadGetData} from "star-horse-lowcode";
import {ApiUrls,SearchProps,UserFuncInfo,useDesignFormStore} from "star-horse-lowcode";
import {Config} from "@/api/settings.ts";
import {piniaInstance} from "star-horse-lowcode";
import {createDatetime} from "star-horse-lowcode";
import {userAction} from "star-horse-lowcode";

let designForm = useDesignFormStore(piniaInstance);
const normalPageRef = ref();
const normalFormRef = ref();
let relationTables = ref<any>({});
let dataUrl = ref<ApiUrls>();
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>([]);
const tableFieldList = ref<any>({fieldList: []});
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
  param: {type: String, required: true}
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let {data, error} = await loadData(`/userdb-manage/userdb/dynamicFormInfo/getDynamicForm/${formId}`, {});
  if (error) {
    errorMsg.value = error;
    clear();
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  dataUrl.value = apiInstance(data["dataUrl"]?.appName, data["dataUrl"]?.contextUrl);
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"];
  rules.value = data["rules"];
  dateFields.value = data["dateFields"];
  fieldMappingList.value = data?.fieldMappingList;
  relationTables.value = data["relationTables"];
  dataSource.value = data["dataSource"];
  extBtns.value = userAction(normalPageRef, primaryKey.value, tableFieldList.value["userTableFuncs"]);
  delete tableFieldList.value["userTableFuncs"];
  await nextTick();
  closeLoad();
  normalPageRef.value?.init();
};
watch(
    () => props.param,
    (val) => {
      try {
        load("数据加载中。。。");
        loadFormData(<string>val);
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    {deep: true}
);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (dateFields.value && dateFields.value.length > 0) {
    if (dateFields.value.includes(name)) {
      return createDatetime(cellValue);
    }
  }
  const subFormat = (name: string, cellValue: any, row: any) => {
    if (dataSource.value && Object.keys(dataSource.value).length > 0) {
      let temp = dataSource.value[name];
      if (temp) {
        let stemp = temp.datas?.find((item: any) => item[temp.valueField] == cellValue);
        return stemp ? stemp[temp.labelField] : cellValue || "--";
      }
    }
    return "null" == cellValue ? "--" : cellValue || "--";
  };
  if (fieldMappingList.value && fieldMappingList.value?.length > 0) {
    let temp = fieldMappingList.value.find((item: any) => item["fieldName"] == name);
    if (temp) {
      return row[temp.mappingDisplayField] || subFormat(name, cellValue, row);
    }
  }
  return subFormat(name, cellValue, row);
};
const loadPermission = async () => {
};
const init = async () => {
  designForm.setIsEdit(false);
  await loadPermission();
  await loadFormData(props.param);
};
onMounted(async () => {
  await init();
});
watch(
    () => props.param,
    () => {
      loadPermission();
    },
    {
      immediate: false
    }
);
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form
          @refresh="normalPageRef.loadByPage()"
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
        :title="'查看数据'"
        :is-view="true"
    >
      <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :globalCondition="relationTables"
          :dynamicForm="true"
          :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
        <star-horse-search-comp
            @searchData="(data: any) => normalPageRef.createSearchParams(data)"
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
  <el-empty :content="errorMsg" v-else></el-empty>
</template>
<style lang="scss" scoped></style>
