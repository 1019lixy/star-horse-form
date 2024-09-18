<script setup lang="ts" name="ResourcesSummary">
import {
  apiInstance,
  createCondition,
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

const dataUrl: ApiUrls = apiInstance("system-config", "system/resourcesSummaryEntity");
let systemInfoList = ref<SelectOption[]>([]);
let rolesList = ref<SelectOption[]>([]);
let menusList = ref<SelectOption[]>([]);
let authorityList = ref<SelectOption[]>([]);
let dataForm = ref<any>({});
const searchFormData = reactive<SearchFields>({
  fieldList: [
    /*
         {label: "所属系统", defaultShow: true, fieldName: "informationsSingleId", type: "select", optionList: systemInfoList},
    */
    {label: "角色名称", defaultShow: true, fieldName: "idRolesinfo", type: "select", optionList: rolesList},
    {label: "创建日期", fieldName: "createdDate", type: "date", matchType: "bt"},
  ]
});
const loadMenuBySystemId = async (systemId: any) => {
  let params = [{
    "propertyName": "informationsSingleId",
    "value": systemId
  }];
  menusList.value = await loadMenusInfo(false, params, false);
};
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键", fieldName: "idResourcesSummary", type: "long",
    },
    [{
      label: "所属系统", fieldName: "informationsSingleId", type: "select", optionList: systemInfoList,
      required: true, formShow: true, editDisabled: "Y", actionName: "change", actions: (val: any) => {
        let systemId = val["informationsSingleId"];
        if (systemId) {
          loadMenuBySystemId(systemId);
        }
      },
      tableShow: true
    },
      {
        label: "角色名称", fieldName: "rolesList", type: "select", optionList: rolesList,
        required: true, formShow: true, multiple: "Y",
        tableShow: true
      }],
    [{
      label: "菜单名称", fieldName: "menusList", type: "tselect", optionList: menusList,
      required: true, formShow: true, multiple: "Y",
      tableShow: true
    },
      {
        label: "权限", fieldName: "resourcesPos", type: "select", optionList: authorityList,
        required: true, formShow: true, multiple: "Y",
        tableShow: true
      }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      formShow: true,
      tableShow: true
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
      tableShow: true
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
      tableShow: true
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
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  cellEditable: false
});
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const primaryKey = "idResourcesSummary";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);


const dataFormat = (name: string, cellValue: any, row: any): any => {
  let names: any = [];
  if (name == "rolesList" && row["rolesList"]) {
    row.rolesList.forEach((item: any) => names.push(item.roleName));
    return names.join(";");
  }
  if (name == "menusList" && row["menusList"]) {
    row.menusList.forEach((item: any) => names.push(item.menuName));
    return names.join(";");
  }
  if (name == "informationsSingleId") {
    let fdata = systemInfoList.value?.find((item: any) => parseInt(item.value) == parseInt(cellValue));
    return fdata?.name || cellValue;
  }
  if (name == "resourcesPos" && row["resourcesPos"]) {
    row.resourcesPos.forEach((item: any) => names.push(item.resName));
    return names.join(";");
  }
  return cellValue;
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const query = ref('');
const menuBtnTableRef = ref();
let currentUserGroupId = ref<number>(0);

/**
 * 点击事件
 * @param data
 * @param checked
 */
const roleChange = async (data: TreeNodeData, checked: boolean) => {
  systemInfoList.value = [];
  currentUserGroupId.value = data.value;
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
  //同时加载当前角色下的所有菜单
  loadMenus(0);
};
const loadMenus = async (appId: number) => {
  let fieldList = [];

  fieldList.push(createCondition("b.idRolesinfo", currentUserGroupId.value));
  if (appId) {
    fieldList.push(createCondition("a.idInformations", appId));
  }
  let menusDatas = await loadData("/system-config/system/rolesPkMenusinfo/getAllByCondition", {
    fieldList: fieldList,
    orderBy: [{
      fieldName: "a.idRolesinfo",
      ascOrDesc: "asc"
    }, {
      fieldName: "a.idInformations",
      ascOrDesc: "asc"
    }, {
      fieldName: "d.dataIndex",
      ascOrDesc: "asc"
    }]
  });
  if (menusDatas.error) {
    warning(menusDatas.error);
    return;
  }
  menusList.value = menusDatas.data;
}
const systemChange = async (data: TreeNodeData, checked: boolean) => {
  await loadMenus(data.idInformations);
  //加载菜单
};
const menuChange = (data: TreeNodeData, checked: boolean) => {

};
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
                     :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-row gutter="5" style="height: 100%;overflow: hidden;">
      <el-col :span="4" style="height: inherit">
        <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="roleChange"
                         :compSize="compSize"/>
      </el-col>
      <el-col v-if="systemInfoList?.length>0" :span="4" style="height: inherit">
        <star-horse-tree v-model:tree-datas="systemInfoList" treeTitle="应用系统" :preps="{
                         label:'sysName',
                         value:'idInformations'
                       }" @selectData="systemChange" :compSize="compSize"/>
      </el-col>
      <el-col v-if="systemInfoList?.length>0" :span="4" style="height: inherit">
        <star-horse-tree v-model:tree-datas="menusList" treeTitle="系统菜单"
                         :preps="{
                         label:'menuName',
                         value:'idMenusinfo'
                       }"
                         @selectData="menuChange"
                         :compSize="compSize"/>
      </el-col>
      <el-col :span="systemInfoList?.length>0?12:20" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>menuBtnTableRef.createSearchParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list
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
