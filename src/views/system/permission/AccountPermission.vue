<script setup lang="ts">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  dictData,
  loadRolesInfo,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SearchParams,
  SelectOption,
  useGlobalConfigStore,
  warning
} from "star-horse-lowcode";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {Config} from "@/api/settings.ts";

let rolesList = ref<SelectOption[]>([]);
let accountPermissionStatus = ref<SelectOption[]>();
let accountPermission = ref();
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
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
      defaultVisible: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "姓名",
      fieldName: "c.name",
      defaultVisible: true,
      type: "input",
      matchType: "lk"
    },
    {
      label: "状态",
      fieldName: "a.statusCode",
      type: "select",
      optionList: accountPermissionStatus,
      defaultVisible: true
    }
  ]
});
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称",
      fieldName: "idRolesinfo",
      type: "select",
      optionList: rolesList,
      formVisible: true,
      required: true,
      disabled: "Y"
    },
    {
      label: "账号信息",
      fieldName: "userNameList",
      aliasName: "userList",
      multiple: "Y",
      type: "page-select",
      params: {
        dataUrl: {
          pageListUrl: "/system-config/system/usersinfoEntity/pageList"
        },
        needField: [
          {sourceField: "username", distField: "userNameList"},
          {sourceField: "idUsersinfo", distField: "userList"}
        ],
        fieldList: [
          {
            label: "用户名",
            fieldName: "username",
            type: "input",
            listVisible: true
          },
          {
            label: "姓名",
            fieldName: "name",
            type: "input",
            listVisible: true
          },
          {
            label: "联系电话",
            fieldName: "phone",
            type: "input",
            listVisible: true
          },
          {
            label: "邮箱",
            fieldName: "email",
            type: "input",
            listVisible: true
          }
        ]
      },
      formVisible: true,
      required: true,
      viewVisible: false
    },
    {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      listVisible: true,
      formVisible: true,
      optionList: accountPermissionStatus
    }
  ]
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称",
      fieldName: "roleName",
      type: "input",
      listVisible: true
    },
    {
      label: "分组编码",
      fieldName: "roleCode",
      type: "input",
      listVisible: true
    },
    {
      label: "用户名",
      fieldName: "username",
      type: "input",
      listVisible: true
    },
    {
      label: "姓名",
      fieldName: "name",
      type: "input",
      listVisible: true
    },
    {
      label: "联系电话",
      fieldName: "phone",
      type: "input",
      listVisible: true
    },
    {
      label: "邮箱地址",
      fieldName: "email",
      type: "input",
      listVisible: true
    },
    {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      listVisible: true,
      formVisible: true,
      optionList: accountPermissionStatus
    }
  ],
  orderBy: [
    {
      fieldName: "a.idRolesinfo",
      ascOrDesc: "asc"
    },
    {
      fieldName: "a.idUsersinfo",
      ascOrDesc: "asc"
    }
  ]
});
const primaryKey = ["idUsersinfo", "idRolesinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

let preValid = ref<any>({
  add: () => {
    if (!currentUserGroupId.value) {
      warning("请先选择分组");
      return false;
    }
    return true;
  }
});
const dataFormat = (name: string, cellValue: object): any => {
  if (name == "statusCode") {
    return accountPermissionStatus.value.find((item) => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const initData = async () => {
  rolesList.value = await loadRolesInfo([]);
  accountPermissionStatus.value = await dictData("account_permission_status");
};
onMounted(async () => {
  await initData();
});
</script>

<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        :outerFormData="{
        idRolesinfo: currentUserGroupId
      }"
        @refresh="accountPermission.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="formFieldList"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content h100">
    <el-row :gutter="10" style="height: 100%">
      <el-col :span="5" class="h100">
        <star-horse-tree
            v-model:tree-datas="rolesList"
            treeTitle="用户组"
            @selectData="checkChange"
            :compSize="compSize"
        />
      </el-col>
      <el-col :span="19" class="h100" style="height: 100%; overflow: hidden">
        <div class="search-content">
          <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
            <star-horse-search-comp
                @searchData="(data: any) => accountPermission.createSearchParams(data)"
                :formData="searchFields"
                :defaultCondition="defaultCondition"
                :compUrl="dataUrl"
            />
          </div>
        </div>
        <el-card class="inner_content h100">
          <star-horse-table-comp
              ref="accountPermission"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :orderBy="tableFieldList.orderBy"
              :dataFormat="dataFormat"
          />
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<style scoped lang="scss"></style>
