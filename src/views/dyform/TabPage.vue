<script setup lang="ts">
  import { nextTick, onMounted, provide, reactive, ref, watch } from "vue";
  import {apiInstance, closeLoad, dialogPreps, load, loadData, loadGetData} from "@/api/star_horse_utils.ts";
  import { PageFieldInfo, UserFuncInfo,SearchProps,ApiUrls,useDesignFormStore } from "star-horse-lowcode";
  import { TabsPaneContext } from "element-plus";
  import { Config } from "@/api/settings.ts";
  import {piniaInstance} from "star-horse-lowcode";
  import { userAction } from "@/api/user_func.ts";
  import {createDatetime} from "@/api/date_utils.ts";

  let designForm = useDesignFormStore(piniaInstance);
  const starHorseTableCompRef = ref();
  let dataUrl = ref<ApiUrls>(apiInstance("", ""));
  const errorMsg = ref("数据加载中");
  let searchFormData = ref<SearchProps[]>();
  const tableFieldList = ref<any>({
    fieldList: []
  });
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
    param: { type: String, required: true }
  });
  const handleClick = (_tab: TabsPaneContext, _event: Event) => {};
  const clear = () => {
    hasData.value = false;
  };
  const loadFormData = async (formId: string) => {
    let { data, error } = await loadData(`/userdb-manage/userdb/dynamicFormInfo/getDynamicForm/${formId}`,{});
    if (error) {
      errorMsg.value = error;
      hasData.value = false;
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
    extBtns.value = userAction(starHorseTableCompRef, primaryKey.value, tableFieldList.value["userTableFuncs"]);
    delete tableFieldList.value["userTableFuncs"];
    await nextTick();
    closeLoad();
    starHorseTableCompRef.value!.init();
  };
  watch(
    () => props.param,
    (val) => {
      clear();
      try {
        load("数据加载中。。。");
        loadFormData(<string>val);
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    { deep: true }
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
  onMounted(async () => {
    await init();
  });
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
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
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="表单" name="form">
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
        <el-tab-pane label="数据列表" name="table">
          <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
            <star-horse-search-comp
              @searchData="(data: any) => starHorseTableCompRef.createSearchParams(data)"
              :formData="searchFormData"
              :compUrl="dataUrl"
            />
            <hr />
            <star-horse-button-list
              @tableCompFunc="(fun: any) => starHorseTableCompRef.tableCompFunc(fun)"
              :compUrl="dataUrl"
              :dialogProps="dialogProps"
              :showType="Config.buttonStyle"
            />
          </div>
          <hr />
          <star-horse-table-comp
            ref="starHorseTableCompRef"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :compUrl="dataUrl"
            :globalConfig="relationTables"
            :isDynamic="true"
            :extandBtns="extBtns"
            :showBatchField="true"
            :dataFormat="dataFormat"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </template>
</template>
<style scoped></style>
