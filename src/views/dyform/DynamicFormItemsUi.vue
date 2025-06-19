<script setup lang="ts" name="DynamicFormItems">
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields, SelectOption} from "star-horse-lowcode";
import {onMounted, provide, reactive, ref} from "vue";
import {Config} from "@/api/settings";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicFormItems");
const categoryList = ref<SelectOption[]>([
  {
    name: "容器",
    value: "2"
  },
  {
    name: "标准组件",
    value: "1"
  },
  {
    name: "自定义组件",
    value: "3"
  }
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "名称", fieldName: "itemName", type: "input", matchType: "lk"},
    {label: "类别", fieldName: "itemType", type: "input", matchType: "lk"},
    {label: "分类", fieldName: "category", type: "select", optionList: categoryList}
  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idFormItems",
      type: "long",
      required: true
    },
    {
      label: "名称",
      fieldName: "itemName",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "类别",
      fieldName: "itemType",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "图标",
      fieldName: "itemIcon",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "分类",
      fieldName: "category",
      type: "select",
      optionList: categoryList,
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number"
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
      type: "input"
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date"
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
      type: "input"
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date"
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input"
    },
    {
      label: "状态吗",
      fieldName: "statusCode",
      type: "input"
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input"
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number"
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input"
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "元素排序",
      fieldName: "dataSort",
      type: "number",
      required: true,
      formVisible: true,
      listVisible: true
    }
  ]
});
//主键
const primaryKey = "idFormItems";
const dynamicFormItemsRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
};
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
  if (name == "category") {
    let redata = categoryList.value.find((item) => item.value == cellValue);
    return redata?.name || cellValue;
  }
  return cellValue;
};
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="dynamicFormItemsRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => dynamicFormItemsRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="dynamicFormItemsRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
