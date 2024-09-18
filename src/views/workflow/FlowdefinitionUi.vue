<script setup lang="ts" name="EnvInfo">
import {apiInstance, dialogPreps, dictData} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps.d.ts";
import {Config} from "@/api/settings.ts";
import {flowFormFields, setFlowGroups} from "@/views/workflow/utils/FlowFormUtils.ts";
import {UserFuncInfo} from "@/components/types/PageFieldInfo";
import {BtnAuth} from "@/components/types/BtnAuth";
import {useRouter} from "vue-router";

const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowoperation");
let flowGroupList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "流程名称", fieldName: "flowName", type: "input", matchType: "lk", defaultShow: true},
    {label: "流程分类", fieldName: "flowGroup", type: "select", optionList: flowGroupList, matchType: "lk", defaultShow: true},
  ]
});
const router = useRouter();
const primaryKey = "idEnvInfo";
const flowDefinitionRef = ref();
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const extandBtns: UserFuncInfo[] = [{
  authority: "exec",
  funcName: (row: any) => {
    console.log(row)
  },
  btnName: "启动"
}, {
  authority: "edit",
  funcName: (row: any) => {
    console.log(row)
  },
  btnName: "发布"
}, {
  authority: "edit",
  funcName: (row: any) => {
    console.log(row)
  },
  btnName: "版本管理"
}];
const selectItemFun = (_item: any) => {

}
const addBtnFunc: BtnAuth[] = [
  {
    icon: "add",
    labelName: "新建",
    btnName: "add",
    exec: () => {
      router.push({path: "/workFlowEdit"})
    }
  }
];
const editBtnFunc: BtnAuth[] = [
  {
    icon: "edit",
    labelName: "编辑",
    btnName: "edit",
    exec: (row: any) => {
      router.push({path: "/workFlowEdit", query: {data: row}})
    }
  }
];
const dataFormat = (_name: string, cellValue: any): any => {
  return cellValue;
}
const init = async () => {
  let data = await dictData("flow_group");
  flowGroupList.value = data;
  setFlowGroups(data);
};
onMounted(async () => {
  await init();
})
</script>
<template>

  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>flowDefinitionRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list
          @tableCompFunc="(fun:any)=>flowDefinitionRef.tableCompFunc(fun)" :compUrl="dataUrl"
          :selfBtnFunc="addBtnFunc"
          :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <star-horse-table-comp ref="flowDefinitionRef" :fieldList="flowFormFields"
                           :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :selfBtnFunc="editBtnFunc"
                           :extandBtns="extandBtns"
                           :dataFormat="dataFormat" @selectItem="selectItemFun"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
