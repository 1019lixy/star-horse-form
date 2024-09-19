<script setup lang="ts">
import {
  apiInstance,
  createCondition,
  createTree,
  dialogPreps,
  dictData,
  loadData, loadMenusInfo,
  loadRolesInfo
} from "@/api/sh_api.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {warning} from "@/utils/message.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {Config} from "@/api/settings.ts";
import {ApiUrls} from "@/components/types/ApiUrls";

const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkMenusinfo");
const menuPermission = ref();
let rolesList = ref<SelectOption[]>([]);
let systemInfoList = ref<SelectOption[]>([]);
let appinfoList = ref<SelectOption[]>([]);
let menusList = ref<SelectOption[]>();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
let currentUserGroupId = ref<number>(0);
let currentSystemId = ref<number>(0);
const userGroupChange = async (data: TreeNodeData, checked: boolean) => {
  systemInfoList.value = [];
  currentUserGroupId.value = data.value;
  currentSystemId.value = 0;
  let roleSystemDatas = await loadData("/system-config/system/rolesPkAppinfo/getAllByCondition", {
    fieldList: [{
      propertyName: "b.idRolesinfo",
      value: data.value
    }]
  });
  if (roleSystemDatas.error) {
    warning(roleSystemDatas.error);
    return;
  }
  systemInfoList.value = roleSystemDatas.data;
  appinfoList.value = createTree(roleSystemDatas.data, "", "sysName", "idInformations");
  setQueryCondition();
};
const setQueryCondition = () => {
  let queryCond = [];
  queryCond.push(createCondition("b.idRolesinfo", currentUserGroupId.value));
  if (currentSystemId.value) {
    queryCond.push(createCondition("a.idInformations", currentSystemId.value));
  }
  menuPermission.value.createSearchParams(queryCond);
}
const systemChange = async (data: TreeNodeData, checked: boolean) => {
  currentSystemId.value = data.idInformations;
  setQueryCondition();
  menusList.value = await loadMenusInfo(false, [createCondition("informationsSingleId", data.idInformations)], false);
};
let menuPermissionStatus = ref<SelectOption[]>([]);
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: "菜单名称",
      fieldName: "b.idInformations",
      defaultShow: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "状态", fieldName: "b.statusCode", type: "select", optionList: menuPermissionStatus, defaultShow: true
    },
  ]
});
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "系统名称", fieldName: "idInformations", type: "tselect", optionList: appinfoList,
      formShow: true, required: true, viewShow: false, disabled: "Y"
    },
    {
      label: "菜单名称", fieldName: "idMenusinfo", type: "tselect", optionList: menusList,
      formShow: true, required: true, viewShow: false
    }, {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      tableShow: true,
      formShow: true,
      optionList: menuPermissionStatus,
    },]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "系统名称", fieldName: "sysName", type: "input", tableShow: true
    },
    {
      label: "系统编码", fieldName: "sysCode", type: "input", tableShow: true
    },
    {
      label: "菜单名称", fieldName: "menuName", type: "input", tableShow: true
    },
    {
      label: "状态",
      fieldName: "statusName",
      type: "input",
      tableShow: true,

    },

  ],
  orderBy: [{
    fieldName: "b.idRolesinfo",
    ascOrDesc: "asc"
  }]
});
const primaryKey = ["idInformations", "idRolesinfo", "idMenusinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let preValid = ref<any>({
  "add": () => {
    if (!currentUserGroupId.value) {
      warning("请先选择用户分组");
      return false;
    }
    if (!currentSystemId.value) {
      warning("请先选择应用");
      return false;
    }
    return true;
  }
});

const dataFormat = (name: string, cellValue: object): any => {
  if (name == "statusCode") {
    return menuPermissionStatus.value.find(item => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};

const initData = async () => {
  rolesList.value = await loadRolesInfo([]);
  menuPermissionStatus.value = await dictData("menu_permission_status");
};
onMounted(async () => {
  await initData();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :outerFormData="{
      idInformations:currentSystemId,
      idRolesinfo:currentUserGroupId
    }" @refresh="menuPermission.loadByPage()" :compUrl="dataUrl"
                     :fieldList="formFieldList"
    />
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" style="height: 100%;overflow: hidden">
    <el-col :span="4" style="height: inherit">
      <star-horse-tree v-model:treeDatas="rolesList" treeTitle="用户组" @selectData="userGroupChange"
                       :compSize="compSize"/>
    </el-col>
    <el-col v-if="systemInfoList.length>0" :span="4" style="height: inherit">
      <star-horse-tree v-model:treeDatas="systemInfoList" treeTitle="应用系统" @selectData="systemChange"
                       :compSize="compSize" :preps="{
                         label:'sysName',
                         value:'idInformations'
                       }"/>
    </el-col>
    <el-col :span="systemInfoList.length>0?16:20" style="height: 100%;overflow: hidden">
      <el-card class="inner_content" style="height: inherit">
        <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="(data:any)=>menuPermission.createSearchParams(data)"
                                  :formData="searchFields"
                                  :compUrl="dataUrl"/>
          <hr/>
          <star-horse-button-list :preValidFunc="preValid" @tableCompFunc="(fun:any)=>menuPermission.tableCompFunc(fun)"
                                  :compUrl="dataUrl"
                                  :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
        </div>
        <hr>
        <star-horse-table-comp ref="menuPermission" :fieldList="tableFieldList"
                               :primaryKey="primaryKey" :compUrl="dataUrl"
                               :orderBy="tableFieldList.orderBy"
                               :dataFormat="dataFormat"/>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

</style>
