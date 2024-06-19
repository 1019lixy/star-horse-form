<script lang="ts" setup>
import icon from "@/assets/icon";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {loadCustomInfo, loadElementPlusIcon, loadSystemInfo} from "@/api/sh_api";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getRequest} from "@/api/star_horse";

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
const initData = async () => {
  let params = [{propertyName: "statusCode", value: "1"}]
  const datas = await loadSystemInfo(params);
  const customs = await loadCustomInfo(params);
  informationsList.value = datas;
  customerList.value = customs;
  systemIconList.value = loadElementPlusIcon();
}
onMounted(() => {
  initData();
});
const searchFormData = reactive<SearchProps[]>([
  {label: "归属主体", fieldName: "idCustomer", type: "select", optionList: customerList},
  {label: "系统名称", defaultShow: true, fieldName: "sysName", type: "input", matchType: "lk"},
  {label: "添加时间", fieldName: "createdDate", type: "daterange", matchType: "bt"}
]);
const testFun = (formData) => {
  console.log(formData['parentId']);
  getRequest(dataUrl.loadByIdUrl + "/" + formData['parentId']).then(res => {
    let redata = res.data.data;
    formData['idCustomer'] = redata['idCustomer'];
  });
};
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idInformations", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "上级系统", fieldName: "parentId", type: "select", optionList: informationsList,
      required: false, formShow: !false,
      tableShow: false, minWidth: 180,
      actionName: "change",
      actions: testFun
    },
    [{
      label: "系统名称", fieldName: "sysName", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    },
      {
        label: "归属主体", fieldName: "idCustomer", type: "select", optionList: customerList,
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    /* {
       label: "归属主体", fieldName: "customer['customerName']", type: "select",
       required: true, formShow: false,
       tableShow: !false, minWidth: 180
     },*/
    {
      label: "系统编码", fieldName: "sysCode", type: "input",
      required: true, formShow: false, disabled: 1,
      tableShow: !false, minWidth: 180
    },
    [{
      label: "系统Logo", fieldName: "sysLogo", type: "icon", optionList: systemIconList,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    }, {
      label: "数据排序", fieldName: "dataSort", type: "number",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },],


    {
      label: "系统描述", fieldName: "sysDesc", type: "textarea",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180, actionName: "input", actions: testFun
    },

    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
      required: false, formShow: !true, tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
      required: false, formShow: !true,tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
      required: false, formShow: !true, tableShow: !true, minWidth: 180
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
      required: false, formShow: !true,tableShow: !true, minWidth: 180
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },

  ],
  batchFieldList: [],
  userTableFuncs: [],

});
const primaryKey = "idInformations";
const informationsRef = ref();
const iconList = icon;
const rules = {

};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);

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
const dataFormat = (name: string, cellValue: Object): any => {
  if (name == "parentId") {
    let fdata: SelectOption = informationsList.value.find((item: SelectOption) => item.value == cellValue);
    return fdata ? fdata.name : cellValue;
  } else if (name == "idCustomer") {
    let fdata: SelectOption = customerList.value.find((item: SelectOption) => item.value == cellValue);
    return fdata ? fdata.name : cellValue;
  }
  return cellValue;
};
</script>
<style>

</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="informationsRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>informationsRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>informationsRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="informationsRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
