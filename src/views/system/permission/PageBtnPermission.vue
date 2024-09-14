<script setup lang="ts" name="ResourcesSummary">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings.ts";
import {DialogProps} from "@/components/types/DialogProps"
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {dictData, loadMenusInfo, loadRolesInfo, loadSystemInfo} from "@/api/sh_api.ts";
import {ElTreeV2} from "element-plus";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {treeCheckChange} from "@/api/system.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import StarHorseTree from "@/components/comp/StarHorseTree.vue";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/resourcesSummaryEntity/pageList",
  mergeUrl: "/system-config/system/resourcesSummaryEntity/merge",
  mergeDraftUrl: "/system-config/system/resourcesSummaryEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/resourcesSummaryEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/resourcesSummaryEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/resourcesSummaryEntity/getById",
  deleteUrl: "/system-config/system/resourcesSummaryEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/resourcesSummaryEntity/exportData",
  downloadTemplateUrl: "/system-config/system/resourcesSummaryEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/resourcesSummaryEntity/getAllByCondition",
  importUrl: "/system-config/system/resourcesSummaryEntity/importData",
  uploadUrl: "",
  condition: []
};
let systemInfoList = ref<SelectOption[]>();
let rolesList = ref<SelectOption[]>();
let menusList = ref<SelectOption[]>();
let authorityList = ref<SelectOption[]>();
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

/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  treeCheckChange( menuBtnTableRef.value,  data, checked);
};
const initData = async () => {
  systemInfoList.value = await loadSystemInfo([]);
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
    <el-row gutter="5" style="height: 100%;">
      <el-col :span="4" style="height: inherit">
        <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange" :compSize="compSize"/>
      </el-col>
      <el-col :span="4" style="height: inherit">
        <star-horse-tree v-model:tree-datas="systemInfoList" treeTitle="应用系统" @selectData="checkChange" :compSize="compSize"/>
      </el-col>
      <el-col :span="16" style="height: inherit">
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
