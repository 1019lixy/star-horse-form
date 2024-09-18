<script setup lang="ts">
import {dictData, loadRolesInfo, loadSystemInfo} from "@/api/sh_api.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {apiInstance} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {DialogProps} from "@/components/types/DialogProps";
import {Config} from "@/api/settings.ts";

let informationsList = ref<any>([]);
let appPermissionStatus = ref<SelectOption[]>([]);
const dataUrl: ApiUrls =apiInstance("system-config","system/rolesPkAppinfo");
const appinfoPermission = ref();
let rolesList = ref<SelectOption[]>();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const checkChange = (data: TreeNodeData, checked: boolean) => {
  appinfoPermission.value.createSearchParams([
    {
      propertyName: "b.idRolesinfo",
      value: data.value
    }
  ])
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
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称", fieldName: "idRolesinfo", type: "select", optionList: rolesList,
      formShow: true, required: true, viewShow: false
    },
    {
      label: "系统名称", fieldName: "idInformations", type: "tselect", optionList: informationsList,
      formShow: true, required: true, viewShow: false,
      preps: {
        checkStrictly: "Y"
      }
    },

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
      fieldName: "statusCode",
      type: "select",
      tableShow: true,
      formShow: true,
      optionList: appPermissionStatus,
    },

  ],
  orderBy: [{
    fieldName: "idRolesinfo",
    ascOrDesc: "asc"
  }]
});
const primaryKey = "idInformations";
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
    <star-horse-form @refresh="appinfoPermission.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
    />
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" style="height: 100%;overflow: hidden;">
    <el-col :span="5" style="height: inherit">
      <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange"
                       :compSize="compSize"/>
    </el-col>
    <el-col :span="19" style="height: inherit">
      <el-card class="inner_content" style="height: inherit">
        <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="(data:any)=>appinfoPermission.createSearchParams(data)"
                                  :formData="searchFields"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list @tableCompFunc="(fun:any)=>appinfoPermission.tableCompFunc(fun)"
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
