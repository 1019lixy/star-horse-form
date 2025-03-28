<script setup lang="ts" name="DynamicFormDetails">
  import { apiInstance, dialogPreps } from "@/api/star_horse_utils.ts";
  import { onMounted, provide, reactive, ref } from "vue";
  import { ApiUrls,SearchFields } from "star-horse-lowcode";
  import { Config } from "@/api/settings.ts";

  const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicFormDetails");
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "主键", fieldName: "idDynamicFormDetails", type: "long" },
      { label: "主键", fieldName: "idDynamicForm", type: "long" },
      { label: "表单内容", fieldName: "content", type: "input" },
      { label: "表单属性", fieldName: "fieldNames", type: "input" }
    ]
  });
  const tableFieldList = reactive({
    fieldList: [
      {
        label: "主键",
        fieldName: "idDynamicFormDetails",
        type: "long",
        formVisible: true,
        listVisible: true
      },
      {
        label: "主键",
        fieldName: "idDynamicForm",
        type: "long",
        formVisible: true,
        listVisible: true
      },
      {
        label: "表单内容",
        fieldName: "content",
        type: "input",
        formVisible: true,
        listVisible: true
      },
      {
        label: "表单属性",
        fieldName: "fieldNames",
        type: "input",
        formVisible: true,
        listVisible: true
      },
      {
        label: "创建人",
        disabled: "Y",
        fieldName: "createdBy",
        type: "input"
      },
      {
        label: "修改人",
        disabled: "Y",
        fieldName: "updatedBy",
        type: "input"
      },
      {
        label: "创建日期",
        disabled: "Y",
        fieldName: "createdDate",
        type: "date"
      },
      {
        label: "修改日期",
        disabled: "Y",
        fieldName: "updatedDate",
        type: "date"
      },
      {
        label: "数据版本号",
        fieldName: "version",
        type: "number"
      },
      {
        label: "是否已逻辑",
        fieldName: "isDel",
        type: "number"
      },
      {
        label: "数据编号",
        fieldName: "dataNo",
        type: "input"
      },
      {
        label: "状态码",
        fieldName: "statusCode",
        type: "input"
      },
      {
        label: "状态码名称",
        fieldName: "statusName",
        type: "input"
      },
      {
        label: "国际码",
        fieldName: "local",
        type: "input"
      }
    ],
    batchFieldList: []
  });
  const primaryKey = "idDynamicFormDetails";
  const dynamicFormDetailsRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const dataFormat = (name: string, cellValue: object): any => {
    return cellValue;
  };
  const initData = async () => {};
  onMounted(async () => {
    await initData();
  });
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="dynamicFormDetailsRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => dynamicFormDetailsRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => dynamicFormDetailsRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
      ref="dynamicFormDetailsRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
