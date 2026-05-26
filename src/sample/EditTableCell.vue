<script setup lang="ts" name="SystemParams">
import {onActivated, onDeactivated, onMounted, provide, reactive, ref,} from "vue";
import {i18n} from "@/lang";

import {apiInstance, ApiUrls, dialogPreps,  PageFieldInfo, SearchFields} from "star-horse-lowcode";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/systemParams");
//主键
const primaryKey = "idSystemParams";
const systemParamsRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("dyform.sample.paramName"),
      fieldName: "paramName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("dyform.sample.paramValue"),
      fieldName: "paramValue",
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
      label: i18n("dyform.sample.paramName"),
      fieldName: "paramName",

      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        editDisabled: true,
      },
    },
    {
      label: i18n("dyform.sample.paramValue"),
      fieldName: "paramValue",
      type: "textarea",
      required: true,
      formVisible: true,
      listVisible: true,
    },

    {
      label: i18n("dyform.sample.remark"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
  ],
  //默认查询条件
  condition: [],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
};
const activated = () => {
};
const deactivated = () => {
};
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
        :isShowBtnContinue="true"
        :dialog-visible="dialogProps.editVisible"
        :dialogProps="dialogProps"
    >
      <star-horse-form
          @refresh="systemParamsRef?.loadByPage()"
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
            @searchData="(data: any) => systemParamsRef?.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
          ref="systemParamsRef"
          :fieldList="tableFieldList"
          :primaryKey="primaryKey"
          :compUrl="dataUrl"
          :help-msg="i18n('dyform.sample.systemParamHelp')"
          :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
