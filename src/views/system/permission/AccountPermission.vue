<script setup lang="ts">
import {apiInstance, createCondition, dialogPreps, dictData, loadRolesInfo} from "@/api/sh_api.ts";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {Config} from "@/api/settings.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ApiUrls} from "@/components/types/ApiUrls";
import {warning} from "@/utils/message.ts";
import {SearchParams} from "@/components/types/Params";

let rolesList = ref<SelectOption[]>([]);
let accountPermissionStatus = ref<SelectOption[]>();
let accountPermission = ref();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkUsers");
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const checkChange = (data: TreeNodeData, checked: boolean) => {
  let queryCond = [];
  currentUserGroupId.value = data.value;
  queryCond.push(createCondition("a.idRolesinfo", data.value));
  defaultCondition.value = queryCond;
  accountPermission.value.createSearchParams(queryCond);
};
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: "账号",
      fieldName: "c.username",
      defaultShow: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "姓名",
      fieldName: "c.name",
      defaultShow: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "状态", fieldName: "a.statusCode", type: "select", optionList: accountPermissionStatus, defaultShow: true
    },
  ]
});
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称", fieldName: "idRolesinfo", type: "select", optionList: rolesList,
      formShow: true, required: true, disabled: "Y"
    },
    {
      label: "账号信息", fieldName: "userNameList", aliasName: "userList", multiple: "Y", type: "page-select", params: {
        dataUrl: {
          loadByPageUrl: "/system-config/system/usersinfoEntity/pageList"
        },
        needField: [{sourceField: "username", distField: "userNameList"},
          {sourceField: "idUsersinfo", distField: "userList"}],
        fieldList: [{
          label: "用户名", fieldName: "username", type: "input", tableShow: true
        }, {
          label: "姓名", fieldName: "name", type: "input", tableShow: true
        }, {
          label: "联系电话", fieldName: "phone", type: "input", tableShow: true
        }, {
          label: "邮箱", fieldName: "email", type: "input", tableShow: true
        }]
      },
      formShow: true, required: true, viewShow: false
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
const primaryKey = ["idUsersinfo", "idRolesinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

let preValid = ref<any>({
  "add": () => {
    if (!currentUserGroupId.value) {
      warning("请先选择分组");
      return false;
    }
    return true;
  }
});
const dataFormat = (name: string, cellValue: object): any => {
  if (name == "statusCode") {
    return accountPermissionStatus.value.find(item => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const initData = async () => {
  rolesList.value = await loadRolesInfo([]);
  accountPermissionStatus.value = await dictData("account_permission_status");
};
onMounted(async () => {
  await initData();
})
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :outerFormData="{
      idRolesinfo:currentUserGroupId
    }" @refresh="accountPermission.loadByPage()" :compUrl="dataUrl"
                     :fieldList="formFieldList"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :is-view="true">
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-row :gutter="10" style="height: 100%;">
    <el-col :span="5" class="h100">
      <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange"
                       :compSize="compSize"/>
    </el-col>
    <el-col :span="19" style="height: 100%;overflow: hidden">
      <el-card class="inner_content h100">
        <el-card class="inner_content h100">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>accountPermission.createSearchParams(data)"
                                    :formData="searchFields"
                                    :defaultCondition="defaultCondition"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list :preValidFunc="preValid"
                                    @tableCompFunc="(fun:any)=>accountPermission.tableCompFunc(fun)"
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
