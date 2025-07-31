<script setup lang="ts" name="EnvInfo">
import { onMounted, provide, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import {
  flowFormFields,
  setFlowGroups,
} from "@/views/workflow/utils/FlowFormUtils";
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  SearchFields,
  SelectOption,
  UserFuncInfo,
} from "star-horse-lowcode";

const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowoperation");
let flowGroupList = ref<SelectOption[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "流程名称",
      fieldName: "flowName",
      matchType: "lk",
      defaultVisible: true,
    },
    {
      label: "流程分类",
      fieldName: "flowGroup",
      type: "select",
      matchType: "lk",
      defaultVisible: true,
      preps: {
        values: flowGroupList,
      },
    },
  ],
});
const router = useRouter();
const primaryKey = "idEnvInfo";
const flowDefinitionRef = ref();
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const extendBtns: UserFuncInfo[] = [
  {
    icon: "edit",
    btnName: "编辑",
    authority: "edit",
    funcName: (row: any) => {
      router.push({ path: "/flowDesign", query: { data: row } });
    },
  },
  {
    authority: "exec",
    funcName: (row: any) => {
      console.log(row);
    },
    btnName: "启动",
  },
  {
    authority: "edit",
    funcName: (row: any) => {
      console.log(row);
    },
    btnName: "发布",
  },
  {
    authority: "edit",
    funcName: (row: any) => {
      console.log(row);
    },
    btnName: "版本管理",
  },
];
const selectItemFun = (_item: any) => {};
const addBtnFunc: UserFuncInfo[] = [
  {
    icon: "add",
    btnName: "新增",
    authority: "add",
    funcName: () => {
      router.push({ path: "/flowDesign" });
    },
  },
];

const dataFormat = (_name: string, cellValue: any): any => {
  return cellValue;
};
const init = async () => {
  let data = await dictData("flow_group");
  flowGroupList.value = data;
  setFlowGroups(data);
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :source="3"
  >
    <star-horse-data-view
      :dataFormat="dataFormat"
      :field-list="tableFieldList"
      :compUrl="dataUrl"
    />
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn">
      <star-horse-search-comp
        @searchData="(data: any) => flowDefinitionRef?.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="flowDefinitionRef"
      :fieldList="flowFormFields"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :extendBtns="extendBtns"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
