<script setup lang="ts">
import {apiInstance, dialogPreps, dictData, loadRolesInfo, loadSystemInfo} from "@/api/sh_api.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings.ts";
import {warning} from "@/utils/message.ts";
import {SearchParams} from "@/components/types/Params";

let informationsList = ref<any>([]);
let appPermissionStatus = ref<SelectOption[]>([]);
const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkAppinfo");
const appinfoPermission = ref();
let rolesList = ref<SelectOption[]>();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const checkChange = (data: TreeNodeData, checked: boolean) => {
  currentUserGroupId.value = data.value;
  defaultCondition.value = [
    {
      propertyName: "b.idRolesinfo",
      value: data.value
    }
  ];
  appinfoPermission.value.createSearchParams(defaultCondition.value)
};
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: "系统名称",
      fieldName: "b.idInformations",
      defaultShow: true,
      type: "tselect",
      optionList: informationsList,
      matchType: "eq"
    },
    {
      label: "状态", fieldName: "b.statusCode", type: "select", optionList: appPermissionStatus, defaultShow: true
    },
  ]
});
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称", fieldName: "idRolesinfo", type: "select", optionList: rolesList,
      formShow: true, required: true, viewShow: false, disabled: "Y"
    },
    {
      label: "应用名称",
      fieldName: "appList",
      type: "tselect",
      optionList: informationsList,
      formShow: true,
      required: true,
      viewShow: false,
      multiple: "Y",
      helpMsg: "选择子节点时，一定要先选中父节点，否则在头部应用菜单栏无法显示",
      preps: {
        checkStrictly: "Y"
      }
    }, {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      tableShow: true,
      formShow: true,
      optionList: appPermissionStatus,
    },]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称", fieldName: "roleName", type: "input", tableShow: true
    },
    {
      label: "分组编码", fieldName: "roleCode", type: "input", tableShow: true
    },
    {
      label: "系统名称", fieldName: "sysName", type: "input", tableShow: true
    },
    {
      label: "系统编码", fieldName: "sysCode", type: "input", tableShow: true
    },
    {
      label: "状态",
      fieldName: "statusName",
      type: "input",
      tableShow: true,
    },

  ],
  orderBy: [{
    fieldName: "idRolesinfo",
    ascOrDesc: "asc"
  }]
});
const primaryKey = ["idInformations", "idRolesinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let preValid = ref<any>({
  "add": () => {
    if (!currentUserGroupId.value) {
      warning("请先选择用户分组");
      return false;
    }
    return true;
  }
});
const dataFormat = (name: string, cellValue: object): any => {
  if (name == "statusCode") {
    return appPermissionStatus.value.find(item => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};

const initData = async () => {
  informationsList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  appPermissionStatus.value = await dictData("app_permission_status");
};
onMounted(async () => {
  await initData();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :outerFormData="{
       idRolesinfo:currentUserGroupId
    }" @refresh="appinfoPermission.loadByPage()" :compUrl="dataUrl"
                     :fieldList="formFieldList"
    />
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange"
                       :compSize="compSize"/>
    </el-col>
    <el-col :span="19" class="h100">
      <el-card class="inner_content h100">
        <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="(data:any)=>appinfoPermission.createSearchParams(data)"
                                  :formData="searchFields"
                                  :defaultCondition="defaultCondition"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list :preValidFunc="preValid"
                                  @tableCompFunc="(fun:any)=>appinfoPermission.tableCompFunc(fun)"
                                  :compUrl="dataUrl"
                                  :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
        </div>
        <hr>
        <star-horse-table-comp ref="appinfoPermission" :fieldList="tableFieldList"
                               :primaryKey="primaryKey" :compUrl="dataUrl"
                               :orderBy="tableFieldList.orderBy"
                               :dataFormat="dataFormat"/>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

</style>
