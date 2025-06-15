<script setup lang="ts" name="DynamicFormFields">
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";
import {onMounted, provide, reactive, ref} from "vue";
import {Config} from "@/api/settings";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicFormFields");
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "主键", fieldName: "idFormFields", type: "long"},
    {label: "归属元素", fieldName: "idFormItems", type: "long"},
    {label: "标签名称", fieldName: "label", type: "input"},
    {label: "属性名称", fieldName: "fieldName", type: "input"},
    {label: "属性类别", fieldName: "fieldType", type: "input"},
    {label: "是否必须 Y 是 N 否 默认 Y", fieldName: "required", type: "input"},
    {label: "备选值", fieldName: "selectValues", type: "input"},
    {label: "默认值", fieldName: "defaultValues", type: "input"},
    {label: "分类 1 普通属性 2 高级属性 默认 1", fieldName: "category", type: "number"},
    {label: "备注", fieldName: "remark", type: "input"},
    {label: "元素排序", fieldName: "dataSort", type: "number"}
  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idFormFields",
      type: "long",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "归属元素",
      fieldName: "idFormItems",
      type: "long",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "标签名称",
      fieldName: "label",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "属性名称",
      fieldName: "fieldName",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "属性类别",
      fieldName: "fieldType",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "是否必须 Y 是 N 否 默认 Y",
      fieldName: "required",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "备选值",
      fieldName: "selectValues",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "默认值",
      fieldName: "defaultValues",
      type: "input",
      required: true,
      formVisible: true,
      listVisible: true
    },
    {
      label: "分类 1 普通属性 2 高级属性 默认 1",
      fieldName: "category",
      type: "number",
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
const primaryKey = "idFormFields";
const dynamicFormFieldsRef = ref();
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
  return cellValue;
};
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="dynamicFormFieldsRef.loadByPage()"
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
          @searchData="(data: any) => dynamicFormFieldsRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="dynamicFormFieldsRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
