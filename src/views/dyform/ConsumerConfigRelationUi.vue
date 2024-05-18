<script setup lang="ts" name="ConsumerConfigRelation">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings";
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/consumerConfigRelation/pageList",
  mergeUrl: "/userdb-manage/userdb/consumerConfigRelation/merge",
  mergeDraftUrl: "/userdb-manage/userdb/consumerConfigRelation/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/consumerConfigRelation/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/consumerConfigRelation/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/consumerConfigRelation/getById",
  deleteUrl: "/userdb-manage/userdb/consumerConfigRelation/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/consumerConfigRelation/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/consumerConfigRelation/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/consumerConfigRelation/getAllByCondition",
  uploadUrl: "/userdb-manage/userdb/consumerConfigRelation/importData",
  importUrl: ""
};
//查询属性
const searchFormData = reactive<SearchProps[]>([
  {label: "主键", fieldName: "idConsumerConfigRelation", type: "long"},
  {label: "消费配置ID", fieldName: "idConsumerConfig", type: "long"},
  {label: "关联主表名", fieldName: "fromTable", type: "input"},
  {label: "关联主表Key", fieldName: "fromKey", type: "input"},
  {label: "关联主表字段名", fieldName: "fromField", type: "input"},
  {label: "被关联表名", fieldName: "toTable", type: "input"},
  {label: "被关联表Key", fieldName: "toKey", type: "input"},
  {label: "被关联表字段", fieldName: "toField", type: "input"},
  {label: "关联映射关系 默认 eq", fieldName: "mapper", type: "input"},
  {label: "备注", fieldName: "remark", type: "input"},
]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idConsumerConfigRelation",
      type: "long",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "消费配置ID",
      fieldName: "idConsumerConfig",
      type: "long",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "关联主表名",
      fieldName: "fromTable",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "关联主表Key",
      fieldName: "fromKey",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "关联主表字段名",
      fieldName: "fromField",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "被关联表名",
      fieldName: "toTable",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "被关联表Key",
      fieldName: "toKey",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "被关联表字段",
      fieldName: "toField",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "关联映射关系 默认 eq",
      fieldName: "mapper",
      type: "input",
      required: true,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "long",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "创建人", disabled: true,
      fieldName: "createdBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改人", disabled: true,
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "状态吗",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "long",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
      minWidth: 180
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
      minWidth: 180
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  stopAutoLoad: false
});
//主键
const primaryKey = "idConsumerConfigRelation";
const consumerConfigRelationRef = ref();
//校验
const rules = {

};
const searchForm = ref({});
//全局查询对象
provide("searchForm", searchForm);
const dataForm = ref({});
//全局数据对象
provide("dataForm", dataForm);
//控制弹窗相关设置
const dialogProps = reactive<DialogProps>({
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false,
  dialogPwdVisible: false,
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false
});
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
};
onMounted(() => {
  initData();
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
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="consumerConfigRelationRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>consumerConfigRelationRef.createCreateParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>consumerConfigRelationRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="consumerConfigRelationRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
