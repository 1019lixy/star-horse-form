<script setup lang="ts" name="Statusinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {onMounted, provide, reactive, ref, Ref, watch} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {useRoute} from "vue-router";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ElTable} from "element-plus";
import {loadDict} from "@/api/star_horse";
import {createCondition} from "@/api/sh_api";

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
const commonDictList = ref<SelectOption>([]);
const props = defineProps({
  dictType: {type: String, required: true}
});
const initData = async () => {
  commonDictList.value = await loadDict();
};

const searchFormData = reactive<SearchProps[]>([
  {label: "字典类型", fieldName: "dictType", type: "input", disabled: 1},
  {label: "字典名称", defaultShow: true, fieldName: "dictName", type: "input", matchType: "lk"}
]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfo", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "字典类型", fieldName: "dictType", type: "input",
      required: true, formShow: !false, defaultValue: route.query.typeCode,
      tableShow: !false, minWidth: 180, disabled: 1
    },
    {
      label: "字典名称", fieldName: "dictName", type: "input",
      required: true, formShow: true,
      tableShow: true, minWidth: 180
    },
    {
      label: "字典编码", fieldName: "dictCode", type: "input",
      required: true, formShow: true,
      tableShow: true, minWidth: 180
    },
    {
      label: "状态名称", fieldName: "statusName", type: "input",
      required: true, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态", fieldName: "statusCode", type: "select", optionList: commonDictList,
      required: true, formShow: !true,
      tableShow: true, minWidth: 180
    },

    {
      label: "字典描述", fieldName: "dictDesc", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
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
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
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
  //阻止初始化时自动加载列表数据
  stopAutoLoad: true,
});
const primaryKey = "idDictinfo";
const rules = {

};
const searchForm = ref({}) as Ref;
provide("searchForm", searchForm);
const dataForm = ref({}) as Ref;
provide("dataForm", dataForm);

watch(
    () => props.dictType,
    (val) => {
      let condition = [createCondition("dictType", val)];
      tabListRef.value!.setDataInfo(condition, null);
      tabListRef.value!.createCreateParams(condition);
    }, {
      immediate: false,
      deep: true
    }
);

onMounted(() => {
  initData();

});
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
  return cellValue;
}
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="tabListRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>tabListRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>tabListRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="tabListRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl" :dataFormat="dataFormat"/>
  </el-card>
</template>
