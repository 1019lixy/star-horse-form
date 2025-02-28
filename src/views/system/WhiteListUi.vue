<script setup lang="ts" name="WhiteList">
  import { apiInstance, dialogPreps } from "@/api/sh_api.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { Config } from "@/api/settings.ts";
  import { onMounted, provide, reactive, ref } from "vue";
  import { SearchFields } from "@/components/types/SearchProps";
  import { PageFieldInfo } from "@/components/types/PageFieldInfo";
  import { dictData } from "@/api/sh_api";

  const dataUrl: ApiUrls = apiInstance("system-config", "system/whiteList");
  let typeList = ref({});
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "过滤类型", fieldName: "whiteType", defaultVisible: true, type: "select", optionList: typeList },
      { label: "过滤内容", fieldName: "whiteName", defaultVisible: true, type: "input", matchType: "lk" }
    ]
  });
  const tableFieldList = reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "主键",
        fieldName: "idWhiteList",
        type: "long"
      },
      {
        label: "过滤类型",
        fieldName: "whiteType",
        type: "select",
        optionList: typeList,
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "过滤内容",
        fieldName: "whiteName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "创建人",
        disabled: "Y",
        fieldName: "createdBy",
        type: "input",
        listVisible: true
      },
      {
        label: "创建日期",
        disabled: "Y",
        fieldName: "createdDate",
        type: "date",
        listVisible: true
      },
      {
        label: "修改人",
        disabled: "Y",
        fieldName: "updatedBy",
        type: "input",
        listVisible: true
      },
      {
        label: "修改日期",
        disabled: "Y",
        fieldName: "updatedDate",
        type: "date",
        listVisible: true
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
      },
      {
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true,
        listVisible: true
      }
    ],
    batchFieldList: []
  });
  const primaryKey = "idWhiteList";
  const whiteListRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const dataFormat = (name: string, cellValue: object): any => {
    return cellValue;
  };
  const initData = async () => {
    typeList.value = await dictData("white_name_filter_type");
  };
  onMounted(async () => {
    await initData();
  });
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="whiteListRef.loadByPage()"
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
        @searchData="(data: any) => whiteListRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => whiteListRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <hr />
    <star-horse-table-comp
      ref="whiteListRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
