<script setup lang="ts" name="UserManage">
import {apiInstance, dialogPreps, loadData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref, onActivated, onDeactivated, computed} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {warning} from "@/utils/message.ts";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/employeeInfo");
const props = defineProps({
  showButton: {type: Boolean, default: true},
  cellEditable: {type: Boolean, default: true},
  dialogInput: {type: Boolean, default: false},
});
//主键
const primaryKey = "idEmployeeInfo";
const employeeInfoRef = ref();
const editable = computed(() => props.cellEditable);
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "姓名",
      fieldName: "name",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "工号",
      fieldName: "employeeNo",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "职级",
      fieldName: "rank",
      defaultShow: false,
      matchType: "lk",
      type: "input"
    },
    {
      label: "岗位",
      fieldName: "station",
      defaultShow: false,
      matchType: "lk",
      type: "input"
    },
    {
      label: "所属公司",
      fieldName: "idCompanyInfo",
      defaultShow: false,
      matchType: "lk",
      type: "input"
    },
    {
      label: "所属部门",
      fieldName: "idDepartmentInfo",
      defaultShow: false,
      matchType: "lk",
      type: "input"
    },

  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: editable,
  //属性列表
  fieldList: [
    {
      label: "主键",
      fieldName: "idEmployeeInfo",
      type: "input",
      required: true,
      formShow: false,
      tableShow: false,
    },
    {
      label: "姓名",
      fieldName: "name",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "工号",
      fieldName: "employeeNo",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "头像",
      fieldName: "photo",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "职级",
      fieldName: "rank",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "岗位",
      fieldName: "station",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "所属公司",
      fieldName: "idCompanyInfo",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "所属部门",
      fieldName: "idDepartmentInfo",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "联系电话",
      fieldName: "phone",
      type: "input",
      required: false,
      formShow: !false,
      tableShow: !false,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formShow: !true,
      tableShow: !true,
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
let companyList = ref<Array<any>>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {

}
//初始化方法
const initData = async () => {
  let result = await loadData("/system-config/system/companyDefine/compDeptTree", {});
  if (result.error) {
    warning(result.error);
    return;
  }
  companyList.value = result.data;
};
const activated = () => {

}
const deactivated = () => {

}
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
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="employeeInfoRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree v-model:tree-datas="companyList" :expand="true" treeTitle="组织机构" @selectData="companyChange"
                       :preps="{
                       label:'name',
                       value:'idCompanyDefine'
                       }"
      />
    </el-col>
    <el-col :span="19" class="h100">
      <el-card class="inner_content h100">
        <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="(data)=>employeeInfoRef.createSearchParams(data)"
                                  :formData="searchFormData"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list @tableCompFunc="(fun)=>employeeInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                  :dialogProps="dialogProps" :showType="Config.buttonStyle" v-if="showButton"/>
        </div>
        <hr/>
        <star-horse-table-comp ref="employeeInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                               :compUrl="dataUrl"
                               :dialogInput="dialogInput"
                               :disableAction="!showButton"
                               :dataFormat="dataFormat"/>
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>

</style>
