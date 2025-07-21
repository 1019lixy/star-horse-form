<script setup lang="ts" name="RolesMenusinfo">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from 'star-horse-lowcode';
import { Config } from '@/api/settings';
import { onMounted, provide, reactive, ref } from 'vue';
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/rolesMenusinfo');
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '系统名称',
      defaultVisible: true,
      fieldName: 'idInformations',
      type: 'select',
    },
    {
      label: '菜单名称',
      defaultVisible: true,
      fieldName: 'idMenusinfo',
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: '主键',
      fieldName: 'idRolesMenusinfo',
      type: 'long',
      required: true,
    },
    {
      label: '角色Id',
      fieldName: 'idRolesinfo',
      type: 'long',
      required: true,
    },
    {
      label: '系统Id',
      fieldName: 'idInformations',
      type: 'long',
    },
    {
      label: '菜单Id',
      fieldName: 'idMenusinfo',
      type: 'long',
      required: true,
    },
    {
      label: '系统名称',
      fieldName: 'sysName',

      listVisible: true,
    },
    {
      label: '菜单名称',
      fieldName: 'menuName',

      required: true,
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
      label: '创建时间',
      fieldName: 'createdTime',
      type: 'date',
    },
    {
      label: '修改时间',
      fieldName: 'updatedTime',
      type: 'date',
    },
    {
      label: '版本号',
      fieldName: 'version',
      type: 'number',
    },
    {
      label: '是否逻辑删除',
      fieldName: 'isDel',
      type: 'number',
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',
    },
    {
      label: '数据状态码',
      fieldName: 'statusCode',
    },
    {
      label: '数据状态名称',
      fieldName: 'statusName',
    },
    {
      label: '国际码',
      fieldName: 'local',
    },
  ],
  cellEditable: false,
});
//主键
const primaryKey = 'idRolesMenusinfo';
const rolesMenusinfoRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);

//初始化方法
const initData = async () => {};
onMounted(async () => {
  await initData();
});
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
};
</script>
<template>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="rolesMenusinfoRef?.loadByPage()"
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
    <div
      class="search_btn"

    >
      <star-horse-search-comp
        @searchData="(data: any) => rolesMenusinfoRef?.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="rolesMenusinfoRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
