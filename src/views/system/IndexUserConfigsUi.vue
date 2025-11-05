<script setup lang="ts">
import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { getCustomerParam } from "@/utils/auth";

defineOptions({
  name: "IndexUserConfigs",
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/indexUserConfigs",
);
//主键
const primaryKey = "idIndexUserConfig";
const indexUserConfigsRef = ref();
const indexUserConfigsFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "用户ID",
      fieldName: "idUsersinfo",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "模块ID",
      fieldName: "idIndexModule",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "行号",
      fieldName: "rowNum",
      defaultVisible: true,
      matchType: "eq",
      type: "number",
    },
    {
      label: "列号",
      fieldName: "colNum",
      defaultVisible: true,
      matchType: "eq",
      type: "number",
    },
    {
      label: "样式",
      fieldName: "styles",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "属性",
      fieldName: "preps",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: "用户ID",
        fieldName: "idUsersinfo",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "模块ID",
        fieldName: "idIndexModule",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "行号",
        fieldName: "rowNum",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "列号",
        fieldName: "colNum",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "样式",
        fieldName: "styles",
        type: "json",
        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "属性",
        fieldName: "preps",
        type: "json",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: "数据编号",
      fieldName: "dataNo",
    },
    {
      label: "备注",
      fieldName: "remark",
    },
    {
      label: "主键",
      fieldName: "idIndexUserConfig",
      required: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
    },
    {
      label: "创建人",
      fieldName: "createdBy",
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "datetime",
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "datetime",
    },
    {
      label: "状态",
      fieldName: "statusCode",
    },
    {
      label: "状态名称",
      fieldName: "statusName",
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
    },
    {
      label: "国际编码",
      fieldName: "local",
    },
    {
      label: "租户",
      fieldName: "tenantId",
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
const activated = async () => {
  await nextTick(() => {
    indexUserConfigsRef.value.loadByPage();
  });
};
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
  let temp: any = {};
  if (Object.keys(temp).length > 0) {
    indexUserConfigsFormRef.value.updateFormData(temp);
  }
};
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
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="indexUserConfigsRef?.loadByPage()"
        @dataLoaded="dataLoaded"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        ref="indexUserConfigsFormRef"
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
            (data: any) => indexUserConfigsRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="indexUserConfigsRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
