<script setup lang="ts" name="ResourcesSummary">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {provide, reactive, ref, watch} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {dictData, loadMenusInfo, loadRolesInfo, loadSystemInfo} from "@/api/sh_api";
import {ElTreeV2} from "element-plus";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {treeCheckChange} from "@/api/system";

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
const initData = async () => {
  systemInfoList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  authorityList.value = await dictData("button_authority");
};
initData();
const searchFormData = reactive<SearchProps[]>([
  /* {label: "所属系统", fieldName: "informationsSingleId", type: "select", optionList: systemInfoList},*/
  {label: "角色名称", defaultShow: true, fieldName: "idRolesinfo", type: "select", optionList: rolesList},
  {label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date", matchType: "bt"},
]);

const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键", fieldName: "idResourcesSummary", type: "long",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    [{
      label: "所属系统", fieldName: "informationsSingleId", type: "select", optionList: systemInfoList,
      required: true, formShow: !false, disabled: 1,
      tableShow: !false, minWidth: 180
    },
      {
        label: "角色名称", fieldName: "rolesList", type: "select", optionList: rolesList,
        required: true, formShow: !false, multiple: true,
        tableShow: !false, minWidth: 180
      }],
    [{
      label: "菜单名称", fieldName: "menusList", type: "tselect", optionList: menusList,
      required: true, formShow: !false, multiple: true,
      tableShow: !false, minWidth: 180
    },
      {
        label: "权限", fieldName: "resourcesPos", type: "select", optionList: authorityList,
        required: true, formShow: !false, multiple: true,
        tableShow: !false, minWidth: 180
      }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  cellEditable: false
});
const primaryKey = "idResourcesSummary";
const rules = {

};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
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
watch(() => dataForm.value["informationsSingleId"],
    (val) => {
      if (val) {
        loadMenuBySystemId();
      }
    }, {
      deep: true,
      immediate: true
    }
);
const loadMenuBySystemId = async () => {
  let params = [{
    "propertyName": "informationsSingleId",
    "value": dataForm.value["informationsSingleId"]
  }];
  let menuList = await loadMenusInfo(false, params, false);
  menusList.value = menuList;
};
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
const onQueryChanged = (query: string) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
  treeRef.value!.filter(query)
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name!.toLowerCase().includes(query?.toLowerCase())
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  treeCheckChange(treeRef.value, menuBtnTableRef.value, dataForm.value, data, checked);
};
</script>
<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="menuBtnTableRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>

  <el-card class="inner_content">
    <el-row style="height: 100%;">
      <el-col :span="3" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <el-input
              v-model="query"
              size="small"
              clearable
              placeholder="请输入关键字"
              @input="onQueryChanged"
          >
            <template #suffix>
              <star-horse-icon icon-class="search"/>
            </template>
          </el-input>
          <el-tree-v2 :data="systemInfoList" :filter-method="filterMethod" style="height:100%"
                      check-on-click-node="true"
                      :height="700"
                      @check-change="checkChange"
                      @node-click="checkChange"
                      show-checkbox
                      ref="treeRef" :props="{
            'label':'name',
            'value':'value'
          }"/>
        </el-card>
      </el-col>
      <el-col :span="21" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data)=>menuBtnTableRef.createCreateParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list @tableCompFunc="(fun)=>menuBtnTableRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                                 :dataFormat="dataFormat" ref="menuBtnTableRef"/>
        </el-card>
      </el-col>
    </el-row>

  </el-card>


</template>
