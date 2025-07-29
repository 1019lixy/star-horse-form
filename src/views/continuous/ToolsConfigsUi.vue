<script setup lang="ts" name="ToolsConfigs">
import { onMounted, provide, reactive, ref } from 'vue';
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from 'star-horse-lowcode';
import { Config } from '@/api/settings';

const dataUrl: ApiUrls = apiInstance(
  'continuous-manage',
  'continuous/toolsConfigs',
);

const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '节点',
      fieldName: 'idNodeProperty',
      matchType: 'lk',
      defaultVisible: true,
    },
    {
      label: '测试报告类型',
      fieldName: 'projectType',
      type: 'reportType',
      matchType: 'lk',
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: '主键',
      fieldName: 'idToolConfig',
    },
    {
      label: '工具ID',
      fieldName: 'idToolCategory',
      type: 'select',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    [
      {
        label: '部署地址',
        fieldName: 'deployHost',

        formVisible: true,
        listVisible: true,
      },
      {
        label: '端口',
        fieldName: 'deployPort',
        type: 'number',
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: '管理员账号',
        fieldName: 'adminAccount',

        formVisible: true,
        listVisible: true,
      },
      {
        label: '管理员密码',
        fieldName: 'adminSecurity',
        type: 'password',
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: '备注',
      fieldName: 'remark',
      type: 'textarea',
      formVisible: true,
    },
    {
      label: '创建人',
      disabled: true,
      fieldName: 'createdBy',
    },
    {
      label: '修改人',
      disabled: true,
      fieldName: 'updatedBy',
    },
    {
      label: '创建日期',
      disabled: true,
      fieldName: 'createdTime',
      type: 'date',
    },
    {
      label: '修改日期',
      disabled: true,
      fieldName: 'updatedTime',
      type: 'date',
    },
    {
      label: '数据版本号',
      fieldName: 'version',
      type: 'number',
    },
    {
      label: '是否已逻辑',
      fieldName: 'isDel',
      type: 'number',
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',
    },
    {
      label: '状态码',
      fieldName: 'statusCode',
    },
    {
      label: '状态码名称',
      fieldName: 'statusName',
    },
    {
      label: '国际码',
      fieldName: 'local',
    },
  ],
  batchFieldList: [],
});
const primaryKey = 'idToolCategory';
const toolsCategoriesRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);

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
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="toolsCategoriesRef?.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
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
      :compUrl="dataUrl"
    />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn">
      <star-horse-search-comp
        @searchData="
          (data: any) => toolsCategoriesRef?.createSearchParams(data)
        "
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => toolsCategoriesRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
      ref="toolsCategoriesRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
