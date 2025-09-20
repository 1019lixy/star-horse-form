<script setup lang="ts" name="RolesMenusinfo">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { i18n } from "@/lang";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesMenusinfo");
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.system.name"),
      defaultVisible: true,
      fieldName: "idInformations",
      type: "select",
    },
    {
      label: i18n("system.menu.name"),
      defaultVisible: true,
      fieldName: "idMenusinfo",
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idRolesMenusinfo",
      type: "long",
      required: true,
    },
    {
      label: i18n("system.role.id"),
      fieldName: "idRolesinfo",
      type: "long",
      required: true,
    },
    {
      label: i18n("system.system.id"),
      fieldName: "idInformations",
      type: "long",
    },
    {
      label: i18n("system.menu.id"),
      fieldName: "idMenusinfo",
      type: "long",
      required: true,
    },
    {
      label: i18n("system.system.name"),
      fieldName: "sysName",

      listVisible: true,
    },
    {
      label: i18n("system.menu.name"),
      fieldName: "menuName",

      required: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      preps:{
        disabled: true,
      },
      fieldName: "createdBy",
    },
    {
      label: i18n("system.updated.by"),
      preps:{
        disabled: true,
      },
      fieldName: "updatedBy",
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("system.data.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("system.data.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",
    },
  ],
  cellEditable: false,
});
//主键
const primaryKey = "idRolesMenusinfo";
const rolesMenusinfoRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

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
  <div class="flex flex-col h-full overflow-hidden">
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
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => rolesMenusinfoRef?.createSearchParams(data)
          "
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
  </div>
</template>
<style lang="scss" scoped></style>
