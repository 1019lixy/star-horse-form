<script setup lang="ts" name="CommonFiles">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  download,
  PageFieldInfo,
  SearchFields,
  UserFuncInfo,
} from "star-horse-lowcode";
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam, getToken } from "@/utils/auth";
import { i18n } from "@/lang";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/commonFiles");
//主键
const primaryKey = "idCommonFiles";
const commonFilesRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.unique.identifier"),
      fieldName: "keyName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.file.name"),
      fieldName: "fileName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.file.type"),
      fieldName: "fileType",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: i18n("system.unique.identifier"),
      fieldName: "keyName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.file.name"),
      fieldName: "fileRealName",

      required: false,

      listVisible: true,
    },
    {
      label: i18n("system.file.size"),
      fieldName: "size",
      type: "number",
      required: false,

      listVisible: true,
    },
    {
      label: i18n("system.file.type"),
      fieldName: "fileType",

      required: false,

      listVisible: true,
    },
    {
      label: i18n("system.file.path"),
      fieldName: "file",
      type: "upload",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        drag: "Y",
        autoUpload: "Y",
        action: "/system-config/annex/upload/commonFiles",
        showFileList: "Y",
        listType: "text",
        headers: {
          token: getToken(),
        },
      },
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",

      required: false,
      formVisible: !true,
      listVisible: !true,
      preps: {
        dataSource:"dict",
        urlOrDictName:"public"
      },
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {};
const activated = () => {};
const deactivated = () => {};
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
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
const extendBtns: UserFuncInfo[] = [
  {
    icon: "download",
    btnName: i18n("system.download"),
    priority: 1,
    authority: "download",
    funcName: (row: any) => {
      download(
        `/system-config/system/commonFiles/downloadFile/${row[primaryKey]}`,
        {},
      );
    },
  },
];
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="commonFilesRef?.loadByPage()"
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
          @searchData="(data: any) => commonFilesRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="commonFilesRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :extendBtns="extendBtns"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
