<script setup lang="ts" name="DynamicFormConsumerConfig">
import {apiInstance, dialogPreps} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {dictData} from "@/api/sh_api";
import {useRouter} from "vue-router";
import {BtnAuth} from "@/components/types/BtnAuth";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import ViewPage from "@/views/dyform/ViewPage.vue";
import {Config} from "@/api/settings.ts";

const router = useRouter();
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicFormConsumerConfig");
let viewTypeList = ref<SelectOption[]>([]);
let auditList = ref<SelectOption[]>([
  {name: "是", value: "Y"},
  {name: "否", value: "N"}
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "视图名称", fieldName: "viewName", defaultShow: true, type: "input", matchType: "lk"},
    {label: "视图类别", fieldName: "viewType", defaultShow: true, type: "select", optionList: viewTypeList},
    {label: "消费权限", fieldName: "consumeAuthority", defaultShow: true, type: "select"},
    {label: "是否需要认证", fieldName: "isAudit", defaultShow: true, type: "select", optionList: auditList},
  ]
});
const currentRow = ref<any>({});
const preview = (row: any, _currentPage: number, _pageSize: number) => {
  currentRow.value = row;
  dialogProps.bakeVisible1 = true;
};
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idConsumerConfig",
      type: "long",
      required: true,
    },
    {
      label: "视图Token",
      fieldName: "dataNo",
      type: "input",
      tableShow: true,
    },
    {
      label: "视图名称",
      fieldName: "viewName",
      type: "input",
      required: true,
      formShow: true,
      tableShow: true,
    },
    {
      label: "视图类别",
      fieldName: "viewType",
      type: "input",
      required: true,
      formShow: true,
      tableShow: true,
    },
    {
      label: "消费权限",
      fieldName: "consumeAuthority",
      type: "input",
      formShow: true,
      tableShow: true,
    },
    {
      label: "是否需要认证 ",
      fieldName: "isAudit",
      type: "input",
      required: true,
      formShow: true,
      tableShow: true,
    },
    {
      label: "单次请求数据限制",
      fieldName: "dataLimits",
      type: "long",
      required: true,
      formShow: true,
      tableShow: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "long",
    },
    {
      label: "创建人", disabled: "Y",
      fieldName: "createdBy",
      type: "input",
      tableShow: true,
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",
      tableShow: true,
    },
    {
      label: "修改人", disabled: "Y",
      fieldName: "updatedBy",
      type: "input",
      tableShow: true,
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: "状态吗",
      fieldName: "statusCode",
      type: "input",
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "long",
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input",
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      formShow: true,
      tableShow: true,
    },
  ],
  userTableFuncs: [{btnName: "数据预览", authority: "view", funcName: (row: any) => preview(row, 1, 20)}],
});
//主键
const primaryKey = "idConsumerConfig";
const dynamicFormConsumerConfigRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const selfBtnFunc = ref<BtnAuth[]>([]);
const closeAction = () => {
  dialogProps.bakeVisible1 = false;
  currentRow.value = {};
}
//初始化方法
const initData = async () => {
  viewTypeList.value = await dictData("consumer_type");
  selfBtnFunc.value?.push({
    labelName: "新增",
    btnName: "add", exec: () => {
      router.push("/dyform/DataConsumerConfig");
    }
  });
  selfBtnFunc.value?.push({
    labelName: "编辑",
    btnName: "edit", exec: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({path: "/dyform/DataConsumerConfig", query: {configId: params[primaryKey]}});
    }
  });
  selfBtnFunc.value?.push({
    labelName: "查看详情",
    btnName: "view", exec: (params: any) => {
      router.push({path: "/dyform/DataConsumerConfig", query: {configId: params[primaryKey], isView: "Y"}});
    }
  });
};
onMounted(async () => {
  await initData();
});
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param _row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, _row: any): any => {
  //转换显示信息
  if (name == "viewType") {
    let redata = viewTypeList.value?.find((item: SelectOption) => item.value == cellValue);
    return redata?.name || cellValue;
  } else if (name == "isAudit") {
    let redata = auditList.value?.find((item: SelectOption) => item.value == cellValue);
    return redata?.name || cellValue;
  }
  return cellValue;
}
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :dialogVisible="dialogProps.bakeVisible1" :title="'数据预览'"
                     @closeAction="closeAction"
                     :box-width="'70%'"
                     :isBatch="false" :isView="true">
    <ViewPage :param="currentRow.dataNo" :isPreview="true"/>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="dynamicFormConsumerConfigRef.loadByPage()"
                     :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dynamicFormConsumerConfigRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list
          @tableCompFunc="(fun:any)=>dynamicFormConsumerConfigRef.tableCompFunc(fun)"
          :selfBtnFunc="selfBtnFunc" :compUrl="dataUrl"
          :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="dynamicFormConsumerConfigRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat" :selfBtnFunc="selfBtnFunc"/>
  </el-card>
</template>
