<script setup lang="ts" name="ResourcesSummary">
import {
  apiInstance,
  createCondition,
  createTree,
  dialogPreps,
  dictData,
  loadData,
  loadMenusInfo,
  loadRolesInfo
} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ElTreeV2} from "element-plus";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import StarHorseTree from "@/components/comp/StarHorseTree.vue";
import {warning} from "@/utils/message.ts";
import {SearchParams} from "@/components/types/Params";

const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkBtnAuthority");
dataUrl.mergeUrl = "/system-config/system/resourcesSummaryEntity/merge";
let systemInfoList = ref<SelectOption[]>([]);
let appinfoList = ref<SelectOption[]>([]);
let rolesList = ref<SelectOption[]>([]);
let menusList = ref<SelectOption[]>([]);
let menusSelectList = ref<SelectOption[]>([]);
let authorityList = ref<SelectOption[]>([]);
let dataForm = ref<any>({});
let defaultCondition = ref<SearchParams[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "角色名称", defaultVisible: true, fieldName: "idRolesinfo", type: "select", optionList: rolesList},
    {label: "创建日期", fieldName: "createdDate", type: "date", matchType: "bt"},
  ]
});
const formFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "角色名称", fieldName: "idRolesinfo", type: "select", optionList: rolesList,
        required: true, formVisible: true, disabled: "Y",
        listVisible: true
      }, {
      label: "所属系统", fieldName: "idInformations", type: "select", optionList: appinfoList,
      required: true, formVisible: true, disabled: "Y",
      listVisible: true
    }],
    [{
      label: "菜单名称", fieldName: "menusList", type: "tselect", optionList: menusSelectList,
      required: true, formVisible: true, multiple: "Y",
      listVisible: true
    },
      {
        label: "权限", fieldName: "resourcesPos", type: "select", optionList: authorityList,
        required: true, formVisible: true, multiple: "Y",
        listVisible: true
      }],

  ],
  cellEditable: false
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "角色名称", fieldName: "roleName", type: "input", formVisible: true
    },
    {
      label: "系统名称", fieldName: "sysName", type: "input", listVisible: true
    },
    {
      label: "系统编码", fieldName: "sysCode", type: "input", listVisible: true
    },
    {
      label: "菜单名称", fieldName: "menuName", type: "input", listVisible: true
    },
    {
      label: "权限", fieldName: "btnNames", listVisible: true
    },
  ],
  cellEditable: false
});
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
const primaryKey = ["idMenusinfo", "idRolesinfo", "idInformations"];
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: any, row: any): any => {
  return cellValue;
};

const menuBtnTableRef = ref();
let currentUserGroupId = ref<number>(0);
let currentSystemId = ref<number>(0);
let currentMenuId = ref<number>(0);
let preValid = ref<any>({
  "add": () => {
    if (!currentUserGroupId.value) {
      warning("请先选择分组");
      return false;
    }
    if (!currentSystemId.value) {
      warning("请先选择应用");
      return false;
    }
    return true;
  }
});
/**
 * 点击事件
 * @param data
 * @param checked
 */
const roleChange = async (data: TreeNodeData, checked: boolean) => {
  systemInfoList.value = [];
  currentUserGroupId.value = data.value;
  currentSystemId.value = 0;
  currentMenuId.value = 0;
  dataForm.value = {idRolesinfo: data.value};
  let roleSystemDatas = await loadData("/system-config/system/rolesPkAppinfo/getAllByCondition", {
    fieldList: [{
      propertyName: "b.idRolesinfo",
      value: data.value
    }],
    orderBy: [{
      fieldName: "idInformations",
      ascOrDesc: "asc"
    }]
  });
  if (roleSystemDatas.error) {
    warning(roleSystemDatas.error);
    return;
  }
  systemInfoList.value = roleSystemDatas.data;
  appinfoList.value = createTree(roleSystemDatas.data, "", "sysName", "idInformations")
  //同时加载当前角色下的所有菜单
  loadMenus();
  doQuery();
};
const loadMenus = async () => {
  let fieldList = [];
  fieldList.push(createCondition("a.idRolesinfo", currentUserGroupId.value));
  if (currentSystemId.value) {
    fieldList.push(createCondition("a.idInformations", currentSystemId.value));
  }
  menusList.value = [];
  let menusDatas = await loadData("/system-config/system/menusinfoEntity/rolesAppMenus", {
    fieldList: fieldList,
    orderBy: [{
      fieldName: "a.idRolesinfo",
      ascOrDesc: "asc"
    }, {
      fieldName: "a.idInformations",
      ascOrDesc: "asc"
    }, {
      fieldName: "b.dataIndex",
      ascOrDesc: "asc"
    }]
  });
  if (menusDatas.error) {
    warning(menusDatas.error);
    return;
  }
  menusList.value = menusDatas.data;
  menusSelectList.value = createTree(menusDatas.data, "", "menuName", "idMenusinfo");
}
const systemChange = async (data: TreeNodeData, checked: boolean) => {
  currentSystemId.value = data.idInformations;
  currentMenuId.value = 0;
  dataForm.value["idInformations"] = data.idInformations;
  delete dataForm.value["menusList"];
  await loadMenus();
  doQuery();
  //加载菜单
};


const menuChange = (data: TreeNodeData, checked: boolean) => {
  currentMenuId.value = data.idMenusinfo;
  dataForm.value["menusList"] = [data.idMenusinfo];
  doQuery();
};
const doQuery = () => {
  let params: SearchParams[] = [];
  if (currentUserGroupId.value) {
    params.push(createCondition("a.idRolesinfo", currentUserGroupId.value));
  }
  if (currentSystemId.value) {
    params.push(createCondition("a.idInformations", currentSystemId.value));
  }
  defaultCondition.value = JSON.parse(JSON.stringify(params));
  if (currentMenuId.value) {
    params.push(createCondition("a.idMenusinfo", currentMenuId.value));
  }
  menuBtnTableRef.value.createSearchParams(params);
}
const initData = async () => {
  // systemInfoList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  authorityList.value = await dictData("button_authority");
};
onMounted(async () => {
  await initData();
})
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form :outerFormData="dataForm" @refresh="menuBtnTableRef.loadByPage()" :compUrl="dataUrl"
                       :fieldList="formFieldList"
                       :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-row gutter="5" class="h100-overflow-hidden ">
      <el-col :span="4" class="h100">
        <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="roleChange"
                         :compSize="compSize"/>
      </el-col>
      <el-col v-if="systemInfoList?.length>0" :span="4" class="h100">
        <star-horse-tree v-model:tree-datas="systemInfoList" treeTitle="应用系统" :preps="{
                         label:'sysName',
                         value:'idInformations'
                       }" @selectData="systemChange" :compSize="compSize"/>
      </el-col>
      <el-col v-if="systemInfoList?.length>0" :span="4" class="h100">
        <star-horse-tree v-model:tree-datas="menusList" treeTitle="系统菜单"
                         :preps="{
                         label:'menuName',
                         value:'idMenusinfo',
                         children:'children'
                       }"
                         @selectData="menuChange"
                         :compSize="compSize"/>
      </el-col>
      <el-col :span="systemInfoList?.length>0?12:20" class="h100">
        <el-card class="inner_content h100">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>menuBtnTableRef.createSearchParams(data)"
                                    :formData="searchFormData"
                                    :defaultCondition="defaultCondition"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list :preValidFunc="preValid"
                                    @tableCompFunc="(fun:any)=>menuBtnTableRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp :fieldList="tableFieldList" :primaryKey="primaryKey"
                                 :compUrl="dataUrl"
                                 :dataFormat="dataFormat" ref="menuBtnTableRef"/>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
