<script setup lang="ts" name="UsersAudit">
import { onMounted, provide, reactive, ref } from 'vue';
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  SearchFields,
} from 'star-horse-lowcode';

const dataUrl: ApiUrls = apiInstance('system-config', 'system/usersAudit');
const searchFormData = reactive<SearchFields>({
  fieldList: [
    { label: '主键', fieldName: 'idUsersAudit', type: 'long' },
    { label: '主键', fieldName: 'idUserinfo', type: 'long' },
    { label: '密码', fieldName: 'password' },
    { label: '生效日期', fieldName: 'effectiveDate', type: 'date' },
    { label: '失效日期', fieldName: 'expiredDate', type: 'date' },
    { label: '备注', fieldName: 'remark' },
    { label: '数据类型', fieldName: 'dataType', type: 'number' },
  ],
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: '主键',
      fieldName: 'idUsersAudit',
      type: 'long',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '主键',
      fieldName: 'idUserinfo',
      type: 'long',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '密码',
      fieldName: 'password',

      formVisible: true,
      listVisible: true,
    },
    {
      label: '生效日期',
      fieldName: 'effectiveDate',
      type: 'date',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '失效日期',
      fieldName: 'expiredDate',
      type: 'date',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '备注',
      fieldName: 'remark',

      formVisible: true,
      listVisible: true,
    },
    {
      label: '数据类型',
      fieldName: 'dataType',
      type: 'number',
      formVisible: true,
      listVisible: true,
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
const primaryKey = 'idUsersAudit';
const usersAuditRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="usersAuditRef?.loadByPage()"
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
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="(data: any) => usersAuditRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="usersAuditRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
