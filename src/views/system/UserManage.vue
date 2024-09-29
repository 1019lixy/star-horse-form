<script setup lang="ts" name="UserManage">
import {apiInstance, createCondition, createTree, dialogPreps, loadData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref, onActivated, onDeactivated, computed, watch} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {warning} from "@/utils/message.ts";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchParams} from "@/components/types/Params";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/employeeInfo");
const props = defineProps({
  showButton: {type: Boolean, default: true},
  cellEditable: {type: Boolean, default: true},
  dialogInput: {type: Boolean, default: false},
  multipleSelect: {type: Boolean, default: false},
});
//主键
const primaryKey = "idEmployeeInfo";
const employeeInfoRef = ref();
const editable = computed(() => props.cellEditable);
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let companyDataList = ref<SelectOption[]>([]);
let departDataList = ref<SelectOption[]>([]);
let rankList = ref<any>([]);
let stationList = ref<any>([]);
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
      optionList: rankList,
      type: "tselect"
    },
    {
      label: "岗位",
      fieldName: "station",
      defaultShow: false,
      optionList: stationList,
      type: "tselect"
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
      dytableList: [
        [{
          label: "姓名",
          fieldName: "name",
          type: "input",
          required: true,
          formShow: !false,
          tableShow: !false,
        },
          {
            label: "工号",
            fieldName: "employeeNo",
            type: "input",
            required: true,
            formShow: !false,
            tableShow: !false,
          },
          {
            label: "头像",
            fieldName: "photo",
            type: "upload",
            required: false,
            formShow: !false,
            tableShow: !false,
            preps: {
              autoUpload: "N",
              action: "xx",
              wordBreak: true,
              rowspan: 2,
            }
          },],
        [{
          label: "职级",
          fieldName: "rank",
          type: "tselect",
          optionList: rankList,
          required: false,
          formShow: !false,
          tableShow: !false,
        },
          {
            label: "岗位",
            fieldName: "station",
            type: "tselect",
            optionList: stationList,
            required: false,
            formShow: !false,
            tableShow: !false,
          },],
        [{
          label: "所属公司",
          fieldName: "idCompanyDefine",
          type: "tselect",
          optionList: companyDataList,
          required: true,
          formShow: !false,
          tableShow: !false,
          actionName: "change",
          actions: (val: any) => {
            loadDepartByCompId(val);
          },
          preps: {
            checkStrictly: "Y"
          }
        },
          {
            label: "所属部门",
            fieldName: "idDepartmentInfo",
            type: "tselect",
            optionList: departDataList,
            required: true,
            formShow: !false,
            tableShow: !false,
            preps: {
              checkStrictly: "Y"
            }
          },]
        ,
        [{
          label: "联系电话",
          fieldName: "phone",
          type: "input",
          required: false,
          formShow: !false,
          tableShow: !false,
          preps: {
            colspan: 3
          }
        }],
      ]
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
  let compOrDeptId = data.value;
  let params: SearchParams[] = [];
  let cond = createCondition("a.idCompanyDefine", compOrDeptId);
  cond.orOperList = [createCondition("a.idDepartmentInfo", compOrDeptId)]
  params.push(cond);
  employeeInfoRef.value.createSearchParams(params);
}
const loadDepartByCompId = async (val: any) => {
  let params: SearchParams[] = [];
  let compId = val["idCompanyDefine"];
  departDataList.value = [];
  if (!compId) {
    return;
  }
  params.push(createCondition("a.idCompanyDefine", compId));
  let result = await loadData("/system-config/system/departmentEntity/getAllByCondition", {
    fieldList: params
  });
  if (result.error) {
    console.log(result.error);
  } else {
    departDataList.value = createTree(result.data, "idDepartment", "deptName", "");
  }
}
//初始化方法
const initData = async () => {
  let result = await loadData("/system-config/system/companyDefine/compDeptTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    companyList.value = result.data;
  }

  result = await loadData("/system-config/system/companyDefine/getAllByCondition", {});
  if (result.error) {
    warning(result.error);
  } else {
    companyDataList.value = createTree(result.data, "idCompanyDefine", "name", "");
  }
  //加载职级
  result = await loadData("/system-config/system/rankDefine/rankTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    rankList.value = result.data;
  }
  //加载岗位
  result = await loadData("/system-config/system/stationDefine/stationTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    stationList.value = result.data;
  }
};
const activated = () => {
  //initData();
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
  if (name == "idCompanyDefine") {
    return row["companyName"] || cellValue;
  }
  if (name == "idDepartmentInfo") {
    return row["deptName"] || cellValue;
  }
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

let test = ref("");
const testChange = (val: any) => {
  console.log(val);
}
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps?.editVisible" :dialogProps="dialogProps">
    <div class="dialog-body">
      <star-horse-form @refresh="employeeInfoRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                       :rules="rules"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps?.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree v-model:tree-datas="companyList" :expand="true" treeTitle="组织机构" @selectData="companyChange"
      />
    </el-col>
    <el-col :span="19" class="h100">
      <el-card class="inner_content h100">
        <div class="search_btn" :style="{'flex-direction':Config?.buttonStyle=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="(data)=>employeeInfoRef.createSearchParams(data)"
                                  :formData="searchFormData"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list @tableCompFunc="(fun)=>employeeInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                  :dialogProps="dialogProps" :showType="Config?.buttonStyle" v-if="showButton"/>
        </div>
        <hr/>
        <star-horse-table-comp ref="employeeInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                               :compUrl="dataUrl"
                               :dialogInput="dialogInput"
                               :multipleSelect="multipleSelect"
                               :disableAction="!showButton"
                               :dataFormat="dataFormat"/>
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>

</style>
