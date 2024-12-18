<script setup lang="ts" name="Statusinfo">
import {apiInstance, dialogPreps} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {computed, onMounted, provide, reactive, ref, watch} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo, UserFuncInfo} from "@/components/types/PageFieldInfo";
import {loadDict} from "@/api/star_horse";
import {createCondition} from "@/api/sh_api";

const tabListRef = ref();
const dictSearchRef = ref();
const dataUrl: ApiUrls = apiInstance("system-config", "system/dictinfoEntity");
const commonDictList = ref<SelectOption[]>([]);
const props = defineProps({
  dictType: {type: String, required: true}
});
let dictType = computed(() => props.dictType);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "字典类型", fieldName: "dictType", type: "input", defaultValue: dictType, disabled: "Y"},
    {label: "字典名称", defaultShow: true, fieldName: "dictName", type: "input", matchType: "lk"}
  ]
});
const editFormField = reactive<PageFieldInfo>({
  fieldList: [{
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
      label: "状态", fieldName: "statusName", type: "input",
      required: true,
      tableShow: true
    },
    {
      label: "状态", fieldName: "statusCode", type: "select", optionList: commonDictList,
      required: true,
      formShow: true,
      defaultValue: "1",
      tableShow: false
    },
    {
      label: "字典描述", fieldName: "dictDesc", type: "textarea",
      formShow: true,
      tableShow: true
    },
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键", fieldName: "idDictinfo", type: "long",
    },
    {
      label: "字典类型", fieldName: "dictType", type: "input",
      required: true, formShow: true, defaultValue: dictType,
      tableShow: true, disabled: "Y"
    },
    {
      batchFieldList: [{
        title: "字典信息",
        batchName: "dictList",
        sameParentTable: true,
        fieldList: editFormField.fieldList
      }]
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
watch(
    () => props.dictType,
    (val) => {
      dictSearchRef.value?.setData({dictType: val});
      let condition = [createCondition("dictType", val)];
      tabListRef.value!.setDataInfo(condition, null);
      tabListRef.value!.createSearchParams(condition);
    }, {
      immediate: false,
      deep: true
    }
);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: "编辑",
    authority: "edit",
    icon: "edit",
    priority: 1,
    funcName: (data: any) => {
      dialogProps.ids = data[primaryKey];
      dialogProps.bakeVisible1 = true;
    }
  }
]);
const dataFormat = (name: string, cellValue: any): any => {
  if (name == "statusCode"||name == "statusName") {
    return cellValue === "1" ? "启用" : cellValue == "0" ? "禁用" : cellValue;
  }
  return cellValue;
}
const initData = async () => {
  commonDictList.value = await loadDict("");
};
onMounted(async () => {
  await initData();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <div class="dialog-body">
    <star-horse-form @refresh="tabListRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="dialogProps.bakeVisible1" :dialogProps="dialogProps">
    <div class="dialog-body">
      <star-horse-form @refresh="tabListRef.loadByPage()" :compUrl="dataUrl" :fieldList="editFormField" :rules="rules"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="editFormField" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp ref="dictSearchRef" @searchData="(data:any)=>tabListRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun:any)=>tabListRef.tableCompFunc(fun)"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp ref="tabListRef" :fieldList="tableFieldList"
                           :primaryKey="primaryKey"
                           :extand-btns="extendBtns"
                           :compUrl="dataUrl" :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
