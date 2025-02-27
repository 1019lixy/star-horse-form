<script setup lang="ts" name="UsersAudit">
import {apiInstance, dialogPreps} from '@/api/sh_api.ts';
import {ApiUrls} from '@/components/types/ApiUrls';
import {Config} from '@/api/settings.ts';
import {onMounted, provide, reactive, ref} from 'vue';
import {SearchFields} from '@/components/types/SearchProps';

const dataUrl: ApiUrls = apiInstance('system-config', 'system/usersAudit');
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: '主键', fieldName: 'idUsersAudit', type: 'long'},
    {label: '主键', fieldName: 'idUserinfo', type: 'long'},
    {label: '密码', fieldName: 'password', type: 'input'},
    {label: '生效日期', fieldName: 'effectiveDate', type: 'date'},
    {label: '失效日期', fieldName: 'expiredDate', type: 'date'},
    {label: '备注', fieldName: 'remark', type: 'input'},
    {label: '数据类型', fieldName: 'dataType', type: 'number'},
  ]
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: '主键', fieldName: 'idUsersAudit', type: 'long',
      formVisible: true,
      listVisible: true
    },
    {
      label: '主键', fieldName: 'idUserinfo', type: 'long',
      formVisible: true,
      listVisible: true
    },
    {
      label: '密码', fieldName: 'password', type: 'input',
      formVisible: true,
      listVisible: true
    },
    {
      label: '生效日期', fieldName: 'effectiveDate', type: 'date',
      formVisible: true,
      listVisible: true
    },
    {
      label: '失效日期', fieldName: 'expiredDate', type: 'date',
      formVisible: true,
      listVisible: true
    },
    {
      label: '备注', fieldName: 'remark', type: 'input',
      formVisible: true,
      listVisible: true
    },
    {
      label: '数据类型', fieldName: 'dataType', type: 'number',
      formVisible: true,
      listVisible: true
    },
    {
      label: '创建人', disabled: 'Y', fieldName: 'createdBy', type: 'input',
    },
    {
      label: '修改人', disabled: 'Y', fieldName: 'updatedBy', type: 'input',
    },
    {
      label: '创建日期', disabled: 'Y', fieldName: 'createdDate', type: 'date',
    },
    {
      label: '修改日期', disabled: 'Y', fieldName: 'updatedDate', type: 'date',
    },
    {
      label: '数据版本号', fieldName: 'version', type: 'number',
    },
    {
      label: '是否已逻辑', fieldName: 'isDel', type: 'number',
    },
    {
      label: '数据编号', fieldName: 'dataNo', type: 'input',
    },
    {
      label: '状态码', fieldName: 'statusCode', type: 'input',
    },
    {
      label: '状态码名称', fieldName: 'statusName', type: 'input',
    },
    {
      label: '国际码', fieldName: 'local', type: 'input',
    },
  ],
  batchFieldList: []
});
const primaryKey = 'idUsersAudit';
const usersAuditRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const initData = async () => {

};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="usersAuditRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>usersAuditRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>usersAuditRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="usersAuditRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
