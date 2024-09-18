<script setup lang="ts">
import {createCondition, dictData, loadRolesInfo} from "@/api/sh_api.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {Config} from "@/api/settings.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {DialogProps} from "@/components/types/DialogProps";
import {apiInstance} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";

let rolesList = ref<SelectOption[]>([]);
let accountPermissionStatus = ref<SelectOption[]>();
let accountPermission = ref();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const dataUrl: ApiUrls =apiInstance("system-config","system/rolesPkUsers");
const checkChange = (data: TreeNodeData, checked: boolean) => {
  let queryCond = [];
  queryCond.push(createCondition("a.idRolesinfo", data.value));
  accountPermission.value.createSearchParams(queryCond);
};
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: "账号",
      fieldName: "b.username",
      defaultShow: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "姓名",
      fieldName: "b.name",
      defaultShow: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "状态", fieldName: "b.statusCode", type: "select", optionList: accountPermissionStatus, defaultShow: true
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
      label: "账号信息", fieldName: "idInformations", type: "tselect", optionList: [],
      formShow: true, required: true, viewShow: false
    },

    {
      label: "分组名称", fieldName: "roleName", type: "input", tableShow: true
    },
    {
      label: "分组编码", fieldName: "roleCode", type: "input", tableShow: true
    },
    {
      label: "用户名", fieldName: "username", type: "input", tableShow: true
    },
    {
      label: "姓名", fieldName: "name", type: "input", tableShow: true
    },
    {
      label: "联系电话", fieldName: "phone", type: "input", tableShow: true
    },
    {
      label: "邮箱地址", fieldName: "email", type: "input", tableShow: true
    },
    {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      tableShow: true,
      formShow: true,
      optionList: accountPermissionStatus,
    },
  ],
  orderBy: [{
    fieldName: "a.idRolesinfo",
    ascOrDesc: "asc"
  }, {
    fieldName: "a.idUsersinfo",
    ascOrDesc: "asc"
  }]
});
const primaryKey = "idUsersinfo";
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
    return accountPermissionStatus.value.find(item => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const initData = async () => {
  // systemInfoList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  accountPermissionStatus.value = await dictData("account_permission_status");
};
onMounted(async () => {
  await initData();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="accountPermission.loadByPage()" :compUrl="dataUrl"
                     :fieldList="tableFieldList" />
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'" :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" style="height: 100%;">
    <el-col :span="5" style="height: inherit">
      <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange"
                       :compSize="compSize"/>
    </el-col>
    <el-col :span="19" style="height: 100%;overflow: hidden">
      <el-card class="inner_content" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>accountPermission.createSearchParams(data)"
                                    :formData="searchFields"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list @tableCompFunc="(fun:any)=>accountPermission.tableCompFunc(fun)"
                                    :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp ref="accountPermission" :fieldList="tableFieldList"
                                 :primaryKey="primaryKey" :compUrl="dataUrl"
                                 :orderBy="tableFieldList.orderBy"
                                 :dataFormat="dataFormat"/>
        </el-card>
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

</style>
