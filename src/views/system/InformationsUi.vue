<script lang="ts" setup>
import icon from "@/assets/icon";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {loadCustomInfo, loadElementPlusIcon, loadSystemInfo} from "@/api/sh_api";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {postRequest} from "@/api/star_horse";

let informationsList = ref<any>([]);
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/informationsEntity/pageList",
  mergeUrl: "/system-config/system/informationsEntity/merge",
  mergeDraftUrl: "/system-config/system/informationsEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/informationsEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/informationsEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/informationsEntity/getById",
  deleteUrl: "/system-config/system/informationsEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/informationsEntity/exportData",
  downloadTemplateUrl: "/system-config/system/informationsEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/informationsEntity/getAllByCondition",
  importUrl: "/system-config/system/informationsEntity/importData",
  uploadUrl: "",
  condition: []
};
let systemIconList = ref<SelectOption[]>([]);
let customerList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "归属主体", fieldName: "idCustomer", type: "select", optionList: customerList},
    {label: "系统名称", defaultShow: true, fieldName: "sysName", type: "input", matchType: "lk"},
    {label: "添加时间", fieldName: "createdDate", type: "daterange", matchType: "bt"}
  ]
});
const testFun = (formData: any) => {
  if (!formData['parentId']) {
    return;
  }
  postRequest(dataUrl.loadByIdUrl + "/" + formData['parentId'], {}).then(res => {
    let redata = res.data.data;
    formData['idCustomer'] = redata['idCustomer'];
  });
};
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idInformations", type: "long",
    },
    {
      label: "上级系统", fieldName: "parentId", type: "select", optionList: informationsList,
      formShow: true,
      actionName: "change",
      actions: testFun
    },
    [{
      label: "系统名称", fieldName: "sysName", type: "input",
      required: true, formShow: true,
      tableShow: true
    },
      {
        label: "归属主体", fieldName: "idCustomer", type: "select", optionList: customerList,
        required: true, formShow: true,
        tableShow: true
      }],
    /* {
       label: "归属主体", fieldName: "customer['customerName']", type: "select",
       required: true,
       tableShow: true
     },*/
    {
      label: "系统编码", fieldName: "sysCode", type: "input",
      required: true, disabled: "Y",
      tableShow: true
    },
    [{
      label: "系统Logo", fieldName: "sysLogo", type: "icon", optionList: systemIconList,
      formShow: true,
      tableShow: true
    }, {
      label: "数据排序", fieldName: "dataSort", type: "number",
      formShow: true,
      tableShow: true
    },],
    {
      label: "系统描述", fieldName: "sysDesc", type: "textarea",
      formShow: true,
      tableShow: true, actionName: "input", actions: testFun
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
});
const primaryKey = "idInformations";
const informationsRef = ref();
const rules = {};
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  if (name == "parentId") {
    return informationsList.value.find((item: SelectOption) => item.value == cellValue)?.name || cellValue;
  } else if (name == "idCustomer") {
    console.log("xxxxxxxxxxxx",name);
    return customerList.value.find((item: SelectOption) => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const initData = async () => {
  let params = [{propertyName: "statusCode", value: "1"}]
  const datas = await loadSystemInfo(params);
  const customs = await loadCustomInfo(params);
  informationsList.value = datas;
  customerList.value = customs;

  systemIconList.value = loadElementPlusIcon();
}
onMounted(async () => {
  await initData();
});
</script>
<style>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="informationsRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>informationsRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>informationsRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="informationsRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
