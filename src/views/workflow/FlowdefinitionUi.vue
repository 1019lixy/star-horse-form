<script setup lang="ts" name="EnvInfo">
import { onMounted, provide, reactive, ref } from "vue";
import { Config } from "@/api/settings.ts";
import { useRouter } from "vue-router";
import { flowFormFields, setFlowGroups } from "@/views/workflow/utils/FlowFormUtils.ts";
import { apiInstance, dialogPreps, dictData,ApiUrls,SearchFields, SelectOption ,UserFuncInfo } from "star-horse-lowcode";

  const dataUrl: ApiUrls = apiInstance("flow-engine", "workflow/flowoperation");
  let flowGroupList = ref<SelectOption[]>([]);
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "流程名称", fieldName: "flowName", type: "input", matchType: "lk", defaultVisible: true },
      {
        label: "流程分类",
        fieldName: "flowGroup",
        type: "select",
        optionList: flowGroupList,
        matchType: "lk",
        defaultVisible: true
      }
    ]
  });
  const router = useRouter();
  const primaryKey = "idEnvInfo";
  const flowDefinitionRef = ref();
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);
  const extandBtns: UserFuncInfo[] = [
    {
      icon: "edit",
      btnName: "编辑",
      authority: "edit",
      funcName: (row: any) => {
        router.push({ path: "/flowDesign", query: { data: row } });
      }
    },
    {
      authority: "exec",
      funcName: (row: any) => {
        console.log(row);
      },
      btnName: "启动"
    },
    {
      authority: "edit",
      funcName: (row: any) => {
        console.log(row);
      },
      btnName: "发布"
    },
    {
      authority: "edit",
      funcName: (row: any) => {
        console.log(row);
      },
      btnName: "版本管理"
    }
  ];
  const selectItemFun = (_item: any) => {};
  const addBtnFunc: UserFuncInfo[] = [
    {
      icon: "add",
      btnName: "新增",
      authority: "add",
      funcName: () => {
        router.push({ path: "/flowDesign" });
      }
    }
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
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => flowDefinitionRef.createSearchParams(data)"
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
      :extandBtns="extandBtns"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
