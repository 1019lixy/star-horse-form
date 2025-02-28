<script setup lang="ts" name="ContinusInstanceUi">
  import { apiInstance, dialogPreps } from "@/api/sh_api.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { onMounted, provide, reactive, ref } from "vue";
  import { SearchFields } from "@/components/types/SearchProps.d.ts";
  import { Config } from "@/api/settings.ts";

  const dataUrl: ApiUrls = apiInstance("devops-continus", "continus/continusInstance");
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "项目名称", fieldName: "projectName", type: "input", matchType: "lk", defaultVisible: true },
      { label: "项目类型", fieldName: "projectType", type: "input", matchType: "lk", defaultVisible: true },
      { label: "程序语言", fieldName: "language", type: "input", matchType: "lk", defaultVisible: true }
    ]
  });
  const tableFieldList = reactive({
    fieldList: [
      {
        label: "主键",
        fieldName: "idContinusInst",
        type: "long"
      },
      {
        label: "实例名称",
        fieldName: "instanceName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      [
        {
          label: "模板",
          fieldName: "template",
          type: "input",
          formVisible: true,
          listVisible: true
        },
        {
          label: "是否独占 1是 2否 默认2",
          fieldName: "isAlone",
          type: "number",
          formVisible: true,
          listVisible: true
        }
      ],
      [
        {
          label: "关联计划",
          fieldName: "linkDataPlan",
          type: "input",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "Cron定时触发执行",
          fieldName: "cron",
          type: "cron",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],
      [
        {
          label: "代码下载后存放目录",
          fieldName: "targetDir",
          type: "input",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "是否自动触发构建 1是 2否 默认2",
          fieldName: "autoBuild",
          type: "input",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],
      {
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true
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
  const primaryKey = "idContinusInst";
  const environmentInfoRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const selectItemFun = (data: any) => {};
  const dataFormat = (name: string, cellValue: object): any => {
    return cellValue;
  };
  const init = async () => {};
  onMounted(async () => {
    await init();
  });
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="environmentInfoRef.loadByPage()"
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
        @searchData="(data: any) => environmentInfoRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => environmentInfoRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
      ref="environmentInfoRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
