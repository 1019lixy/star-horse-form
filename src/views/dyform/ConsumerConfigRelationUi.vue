<script setup lang="ts" name="ConsumerConfigRelation">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { Config } from "@/api/settings";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  "userdb-manage",
  "userdb/consumerConfigRelation",
);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    { label: "主键", fieldName: "idConsumerConfigRelation", type: "long" },
    { label: "消费配置ID", fieldName: "idConsumerConfig", type: "long" },
    { label: "关联主表名", fieldName: "fromTable" },
    { label: "关联主表Key", fieldName: "fromKey" },
    { label: "关联主表字段名", fieldName: "fromField" },
    { label: "被关联表名", fieldName: "toTable" },
    { label: "被关联表Key", fieldName: "toKey" },
    { label: "被关联表字段", fieldName: "toField" },
    { label: "关联映射关系 默认 eq", fieldName: "mapper" },
    { label: "备注", fieldName: "remark" },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idConsumerConfigRelation",
      type: "long",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "消费配置ID",
      fieldName: "idConsumerConfig",
      type: "long",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "关联主表名",
      fieldName: "fromTable",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "关联主表Key",
      fieldName: "fromKey",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "关联主表字段名",
      fieldName: "fromField",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "被关联表名",
      fieldName: "toTable",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "被关联表Key",
      fieldName: "toKey",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "被关联表字段",
      fieldName: "toField",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "关联映射关系 默认 eq",
      fieldName: "mapper",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "long",
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
    },
    {
      label: "状态吗",
      fieldName: "statusCode",
    },
    {
      label: "状态名称",
      fieldName: "statusName",
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "long",
    },
    {
      label: "国际码",
      fieldName: "local",
    },
    {
      label: "备注",
      fieldName: "remark",

      formVisible: true,
      listVisible: true,
    },
  ],
});
//主键
const primaryKey = "idConsumerConfigRelation";
const consumerConfigRelationRef = ref();
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
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="consumerConfigRelationRef?.loadByPage()"
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
      :style="{
        'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row',
      }"
    >
      <star-horse-search-comp
        @searchData="
          (data: any) => consumerConfigRelationRef?.createSearchParams(data)
        "
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="consumerConfigRelationRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
