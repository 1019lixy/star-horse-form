<script lang="ts" name="RankDefine" setup>
import {apiInstance, createCondition, dialogPreps, loadData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {SearchFields} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchParams} from "@/components/types/Params";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/rankDefine");
//主键
const primaryKey = "idRankDefine";
const rankDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let rankTypeList = ref<any>({});
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "职级名称",
      fieldName: "rankName",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "职级编码",
      fieldName: "rankCode",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },

  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: "职级名称",
        fieldName: "rankName",
        type: "input",
        required: false,
        formVisible: !false,
        listVisible: !false,
      },
      {
        label: "职级编码",
        fieldName: "rankCode",
        type: "input",
        editDisabled: "Y",
        required: false,
        formVisible: !false,
        listVisible: !false,
      }],
    [{
      label: "所属分类",
      fieldName: "idRankType",
      type: "tselect",
      optionList: rankTypeList,
      required: false,
      formVisible: !false,
      listVisible: !false,
      preps: {
        checkStrictly: "Y",
        props: {
          label: "rankTypeName",
          value: "idRankType"
        }
      }
    },
      {
        label: "职级排序",
        fieldName: "rankSort",
        type: "number",
        required: false,
        formVisible: !false,
        listVisible: !false,
      }],
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
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
let currentRankTypeId = ref<string>("");
let outForm = ref<any>({});

const rankTypeChange = (data: TreeNodeData, _checked: boolean) => {
  currentRankTypeId.value = data["idRankType"];
  outForm.value["idRankType"] = currentRankTypeId.value;
  let params: SearchParams[] = [createCondition("a.idRankType", currentRankTypeId.value)];
  rankDefineRef.value.createSearchParams(params);
};
//初始化方法
const initData = async () => {
  let result = await loadData("/system-config/system/rankType/getAllByCondition", {
    orderBy: [{fieldName: "rankTypeSort", ascOrDesc: "asc"}]
  });
  if (result.error) {
    console.log(result.error);
    return;
  }
  rankTypeList.value = result.data;
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
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps" :isShowBtnContinue="true">
      <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"
                       :outerFormData="outForm"
                       @refresh="rankDefineRef.loadByPage()"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :isView="true"
                     :title="'查看数据'">
      <star-horse-data-view :compUrl="dataUrl" :dataFormat="dataFormat" :field-list="tableFieldList"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden ">
    <el-col :span="4" class="h100">
      <star-horse-tree v-model:tree-datas="rankTypeList" :expand="true" :showCode="true" treeTitle="职级分类"
                       @selectData="rankTypeChange"
                       :preps="{
                       label:'rankTypeName',
                       value:'idRankType',
                       code:'rankTypeCode'
                       }"
      />
    </el-col>
    <el-col :span="20" class="h100">
      <el-card class="inner_content h100">
        <div :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}" class="search_btn">
          <star-horse-search-comp :compUrl="dataUrl" :formData="searchFormData"
                                  @searchData="(data)=>rankDefineRef.createSearchParams(data)"/>
          <hr/>
          <star-horse-button-list :compUrl="dataUrl" :dialogProps="dialogProps"
                                  :showType="Config.buttonStyle"
                                  @tableCompFunc="(fun)=>rankDefineRef.tableCompFunc(fun)"/>
        </div>
        <hr/>
        <star-horse-table-comp ref="rankDefineRef" :compUrl="dataUrl" :dataFormat="dataFormat"
                               :fieldList="tableFieldList"
                               :primaryKey="primaryKey"/>
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
//todo
</style>
