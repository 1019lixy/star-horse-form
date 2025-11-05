<script lang="ts" name="RankType" setup>
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam } from "@/utils/auth";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/rankType");
//主键
const primaryKey = "idRankType";
const rankTypeRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.category.name"),
      fieldName: "rankTypeName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.code"),
      fieldName: "rankTypeCode",
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
      label: i18n("system.category.name"),
      fieldName: "rankTypeName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.code"),
      fieldName: "rankTypeCode",

      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        editDisabled: true,
      },
    },
    {
      label: i18n("system.sort"),
      fieldName: "rankTypeSort",
      type: "number",
      defaultValue: 1,
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.function.description"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
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
        dataSource: "dict",
        urlOrDictName: "public",
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
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialog-visible="dialogProps.editVisible"
      :boxWidth="'40%'"
      :dialogProps="dialogProps"
      :isShowBtnContinue="true"
    >
      <star-horse-form
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        @refresh="rankTypeRef?.loadByPage()"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="(data: any) => rankTypeRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="rankTypeRef"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
