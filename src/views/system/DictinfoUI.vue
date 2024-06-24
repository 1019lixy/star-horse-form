<script setup lang="ts" name="Statusinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {computed, onMounted, provide, reactive, Ref, ref, watch} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {useRoute} from "vue-router";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ElTable} from "element-plus";
import {loadDict} from "@/api/star_horse";
import {createCondition, getMenuId, loadPagePermission} from "@/api/sh_api";
const route = useRoute();
const tabListRef = ref<InstanceType<typeof ElTable>>();
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/dictinfoEntity/pageList",
  mergeUrl: "/system-config/system/dictinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/dictinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/dictinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/dictinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/dictinfoEntity/getById",
  deleteUrl: "/system-config/system/dictinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/dictinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/dictinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/dictinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/dictinfoEntity/importData",
  uploadUrl: "",
  condition: []
};
const commonDictList = ref<SelectOption[]>([]);
const props = defineProps({
  dictType: {type: String, required: true}
});
let dictType = computed(() => props.dictType);
const searchFormData = reactive<SearchProps[]>([
  {label: "字典类型", fieldName: "dictType", type: "input", defaultValue: dictType, disabled: "Y"},
  {label: "字典名称", defaultShow: true, fieldName: "dictName", type: "input", matchType: "lk"}
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfo", type: "long",
    },
    {
      label: "字典类型", fieldName: "dictType", type: "input",
      required: true, formShow: !false, defaultValue: dictType,
      tableShow: !false, disabled: "Y"
    },
    {
      label: "字典名称", fieldName: "dictName", type: "input",
      required: true, formShow: true,
      tableShow: true
    },
    {
      label: "字典编码", fieldName: "dictCode", type: "input",
      required: true, formShow: true,
      tableShow: true
    },
    {
      label: "状态名称", fieldName: "statusName", type: "input",
      required: true,
    },
    {
      label: "状态", fieldName: "statusCode", type: "select", optionList: commonDictList,
      required: true,
      tableShow: true
    },
    {
      label: "字典描述", fieldName: "dictDesc", type: "input",
      formShow: !false,
      tableShow: !false
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
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  //阻止初始化时自动加载列表数据
  stopAutoLoad: true,
});
const primaryKey = "idDictinfo";
const rules = {};
const searchForm = ref({}) as Ref;
const dataForm = ref({}) as Ref;
provide("dataForm", dataForm);
watch(
    () => props.dictType,
    (val) => {
      searchForm.value["dictType"] = val;
      let condition = [createCondition("dictType", val)];
      tabListRef.value!.setDataInfo(condition, null);
      tabListRef.value!.createCreateParams(condition);
    }, {
      immediate: false,
      deep: true
    }
);
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
let permissions = ref<any>({});
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
}
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
  commonDictList.value = await loadDict("");
};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" @refresh="tabListRef.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>tabListRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>tabListRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions" ref="tabListRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl" :dataFormat="dataFormat"/>
  </el-card>
</template>
