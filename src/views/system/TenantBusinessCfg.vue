<script setup lang="ts">
import {apiInstance, createCondition, dialogPreps, loadMenusInfo, loadSystemInfo} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {computed, nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {createDatetime} from "@/api/date_utils.ts";
import {loadDict} from "@/api/star_horse.ts";
import StarHorseTree from "@/components/comp/StarHorseTree.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

defineOptions({
  name: 'TenantInfo',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/tenantInfo");
const tenantAppDataUrl: ApiUrls = apiInstance("system-config", "system/tenantAppinfo");
const tenantAppMenuDataUrl: ApiUrls = apiInstance("system-config", "system/tenantAppMenusinfo");
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
//主键
const primaryKey = "idTenantInfo";
const tenantInfoRef = ref();
const tenantInfoFormRef = ref();
const tenantAppMenusinfoRef = ref();
let effectiveTimeList = ref<SelectOption[]>([]);
let dynamicFormList = ref<SelectOption[]>([]);
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  "fieldList": [
    {"label": "菜单名称", "fieldName": "menuName", matchType: "lk", defaultVisible: true},
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [
    {"label": "菜单名称", "fieldName": "menuName", "type": "input", "required": false, "formVisible": true, "listVisible": true, "preps": {}},
    {"label": "排序", "fieldName": "dataIndex", "type": "number", "required": false, "formVisible": true, "listVisible": true, "preps": {}},
    {"label": "创建人", "fieldName": "createdBy", "type": "input", "listVisible": true, "preps": {}, "commonFlag": "Y"},
    {"label": "创建时间", "fieldName": "createdTime", "type": "datetime", "listVisible": true, "preps": {}, "commonFlag": "Y"},
    {"label": "修改人", "fieldName": "updatedBy", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"},
    {"label": "修改时间", "fieldName": "updatedTime", "type": "datetime", "listVisible": false, "preps": {}, "commonFlag": "Y"},
  ],
  "batchFieldList": [],
  "userTableFuncs": [],
  "dynamicFormas": [],
  "orderBy": [],
  "batchName": "batchDataList",
  "tableCellEditabled": false,
  "stopAutoLoad": false
});

let informationsList = ref<any>([]);
let menusList = ref<any>([]);
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "应用名称",
      fieldName: "appList",
      type: "tselect",
      optionList: informationsList,
      formVisible: true,
      required: true,
      viewVisible: false,
      multiple: "Y",
      helpMsg: "选择子节点时，一定要先选中父节点，否则在头部应用菜单栏无法显示",
      preps: {
        checkStrictly: "Y"
      }
    }]
});
let menuRequired = ref<boolean>(false);
const menuformFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "系统名称", fieldName: "idInformations", type: "tselect", optionList: informationsList,
      formVisible: true, required: true, viewVisible: false, disabled: "Y"
    },
    {
      label: "分配所有菜单", fieldName: "allMenu", type: "switch", defaultValue: "Y",
      formVisible: true, required: false, viewVisible: false,
      actionName: "change",
      actions: (val: any) => {
        menuRequired.value = val['allMenu'] == "N";
      }
    },
    {
      label: "指定菜单", fieldName: "menuList", type: "tselect", optionList: menusList,
      formVisible: true, required: menuRequired, viewVisible: false, multiple: "Y",
      helpMsg: "选择子节点时，一定要先选中父节点，否则左侧菜单栏无法显示",
      actionName: "change",
      actions: (val: any) => {
        if (val['menuList']) {
          val['allMenu'] = "N";
        }
      },
      preps: {
        checkStrictly: "Y",
        props: {
          label: "menuName",
          value: "idMenusinfo"
        }
      }
    },]
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
  informationsList.value = await loadSystemInfo([]);
  effectiveTimeList.value = await loadDict("effective_time");
};
const activated = async () => {
  await nextTick(() => {
    tenantInfoRef.value.loadByPage()
  });
}
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理

}
const deactivated = () => {

}
const tenantAppTreeRef = ref();
let currentTenantData = ref<any>({});
const dataChange = (data: any) => {
  let params = [];
  currentTenantData.value = data;
  nextTick(() => {
    params.push(createCondition(primaryKey, data[primaryKey]));
    tenantAppTreeRef.value.createSearchParams(params);
    tenantAppMenusinfoRef.value.createSearchParams(params);
  });
}
let outerData: any = {};
const addData = (data: any) => {
  outerData[primaryKey] = data[primaryKey];
  dialogProps.editVisible = true;
}
const appDataChange = (data: any) => {
  outerData = data;
  menuAddedRefresh();
}
const addMenuData = (data: any) => {
  outerData = {};
  outerData[primaryKey] = data[primaryKey];
  outerData["idInformations"] = data["idInformations"];
  loadMenuBySystemId(data["idInformations"]);
  dialogProps.bakeVisible1 = true;
}
const loadMenuBySystemId = async (systemId: any) => {
  let params = [];
  params.push(createCondition("idInformations", systemId));
  menusList.value = await loadMenusInfo(true, params, false);
}
const menuAddedRefresh = () => {
  let params = [];
  params.push(createCondition("idInformations", outerData["idInformations"]));
  params.push(createCondition("idTenantInfo", outerData[primaryKey]));
  tenantAppMenusinfoRef.value.createSearchParams(params);
}
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "effectiveTime") {
    return createDatetime(row.effectiveTimeStart) + "-" + createDatetime(row.effectiveTimeEnd);
  }
  //转换显示信息
  return cellValue;
}
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <star-horse-dialog title="添加应用" boxWidth="40%" :dialog-visible="dialogProps.editVisible"
                     :dialogProps="dialogProps">
    <star-horse-form @refresh="dataChange(outerData)" :outerFormData="outerData" @dataLoaded="dataLoaded"
                     :compUrl="tenantAppDataUrl"
                     :fieldList="formFieldList"
                     ref="tenantInfoFormRef"
                     :primaryKey="'idTenantAppMenusinfo'"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog boxWidth="40%" :dialog-visible="dialogProps.bakeVisible1" :dialogProps="dialogProps"
                     :title="'添加菜单'"
  >
    <star-horse-form @refresh="menuAddedRefresh" :outerFormData="outerData" @dataLoaded="dataLoaded"
                     :compUrl="tenantAppMenuDataUrl"
                     :fieldList="menuformFieldList"
                     :primaryKey="'idTenantAppMenusinfo'"
                     ref="tenantMenuInfoFormRef"
                     :rules="rules"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-row :gutter="10" class="h100-overflow-hidden ">
      <el-col :span="5" class="h100">
        <star-horse-tree v-model:tree-datas="dynamicFormList" ref="starHorseTreeRef" :expand="true"
                         treeTitle="租户列表"
                         @selectData="dataChange"
                         @addData="addData"
                         btnTitle="添加应用"
                         :btnVisible="true"
                         :showDropdown="false"
                         :preps="{
                       label:'tenantName',
                       value:primaryKey
                       }"
                         :showPageBar="true"
                         :isDynamicData="true"
                         :autoLoad="true"
                         :compUrl="dataUrl"
                         :compSize="compSize"/>
      </el-col>
      <el-col :span="19" class="h100">
        <el-card class="inner_content h100">
          <el-row :gutter="10" class="h100-overflow-hidden ">
            <el-col :span="5" class="h100">
              <star-horse-tree
                  ref="tenantAppTreeRef" :expand="true"
                  treeTitle="应用列表"
                  @selectData="appDataChange"
                  @addData="addMenuData"
                  btnTitle="添加菜单"
                  :btnVisible="true"
                  :showDropdown="false"
                  :preps="{
                       label:'appName',
                       value:'idInformations'
                       }"
                  :showPageBar="true"
                  :isDynamicData="true"
                  :autoLoad="false"
                  :compUrl="tenantAppDataUrl"
                  :compSize="compSize"/>
            </el-col>
            <el-col :span="19" class="h100">
              <el-card class="inner_content">
                <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
                  <star-horse-search-comp @searchData="(data)=>tenantAppMenusinfoRef.createSearchParams(data)"
                                          :formData="searchFormData"
                                          :compUrl="dataUrl"/>
                </div>
                <hr/>
                <star-horse-table-comp ref="tenantAppMenusinfoRef" :fieldList="tableFieldList"  :primaryKey="'idTenantAppMenusinfo'"
                                       :compUrl="tenantAppMenuDataUrl"
                                       :dataFormat="dataFormat"/>
              </el-card>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
