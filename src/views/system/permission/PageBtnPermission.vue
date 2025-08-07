<script setup lang="ts" name="ResourcesSummary">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createTree,
  dialogPreps,
  dictData,
  loadData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SearchParams,
  SelectOption,
  useButtonPermissionStore,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadRolesInfo } from "@/api/star_horse_utils";
import { Config } from "@/api/settings";
import { computed, onMounted, provide, reactive, ref } from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";

const dataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/rolesPkBtnAuthority",
);
dataUrl.mergeUrl = "/system-config/system/resourcesSummary/merge";
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
    {
      label: "角色名称",
      defaultVisible: true,
      fieldName: "idRolesinfo",
      type: "select",
      preps: {
        values: rolesList,
      },
    },
    {
      label: "创建日期",
      fieldName: "createdTime",
      type: "date",
      matchType: "bt",
    },
  ],
});
const formFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "角色名称",
        fieldName: "idRolesinfo",
        type: "select",
        required: true,
        formVisible: true,
        disabled: true,
        listVisible: true,
        preps: {
          values: rolesList,
        },
      },
      {
        label: "所属系统",
        fieldName: "idInformations",
        type: "select",
        required: true,
        formVisible: true,
        disabled: true,
        listVisible: true,
        preps: {
          values: appinfoList,
        },
      },
    ],
    [
      {
        label: "菜单名称",
        fieldName: "menusList",
        type: "tselect",
        required: true,
        formVisible: true,

        listVisible: true,
        preps: {
          multiple: true,
          showHeader: true,
          data: menusSelectList,
        },
      },
      {
        label: "权限",
        fieldName: "resourcesPos",
        type: "select",
        required: true,
        formVisible: true,

        listVisible: true,
        preps: {
          multiple: true,
          values: authorityList,
        },
      },
    ],
  ],
  cellEditable: false,
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "角色名称",
      fieldName: "roleName",

      formVisible: true,
    },
    {
      label: "系统名称",
      fieldName: "sysName",

      listVisible: true,
    },
    {
      label: "系统编码",
      fieldName: "sysCode",

      listVisible: true,
    },
    {
      label: "菜单名称",
      fieldName: "menuName",

      listVisible: true,
    },
    {
      label: "权限",
      fieldName: "btnNames",
      listVisible: true,
    },
  ],
  cellEditable: false,
});
let configStore = useGlobalConfigStore(piniaInstance);
let pagePermission = useButtonPermissionStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
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
  add: () => {
    if (!currentUserGroupId.value) {
      warning("请先选择分组");
      return false;
    }
    if (!currentSystemId.value) {
      warning("请先选择应用");
      return false;
    }
    return true;
  },
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
  dataForm.value = { idRolesinfo: data.value };
  let roleSystemDatas = await loadData(
    "/system-config/system/rolesPkAppinfo/getAllByCondition",
    {
      fieldList: [
        {
          propertyName: "b.idRolesinfo",
          value: data.value,
        },
      ],
      orderBy: [
        {
          fieldName: "idInformations",
          ascOrDesc: "asc",
        },
      ],
    },
  );
  if (roleSystemDatas.error) {
    warning(roleSystemDatas.error);
    return;
  }
  systemInfoList.value = roleSystemDatas.data;
  appinfoList.value = createTree(
    roleSystemDatas.data,
    "idInformations",
    "sysName",
    "",
  );
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
  let menusDatas = await loadData(
    "/system-config/system/menusinfo/rolesAppMenus",
    {
      fieldList: fieldList,
      orderBy: [
        {
          fieldName: "a.idRolesinfo",
          ascOrDesc: "asc",
        },
        {
          fieldName: "a.idInformations",
          ascOrDesc: "asc",
        },
        {
          fieldName: "b.dataIndex",
          ascOrDesc: "asc",
        },
      ],
    },
  );
  if (menusDatas.error) {
    warning(menusDatas.error);
    return;
  }
  menusList.value = menusDatas.data;
  menusSelectList.value = createTree(
    menusDatas.data,
    "idMenusinfo",
    "menuName",
    "",
  );
};
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
};
const refreshData = (formData: any, resData: any) => {
  formData["menusList"]?.forEach((item: any) => {
    pagePermission.removePermission(item);
  });
  menuBtnTableRef.value.loadByPage();
};
const initData = async () => {
  // systemInfoList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  authorityList.value = await dictData("button_authority");
};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        :outerFormData="dataForm"
        @refresh="refreshData"
        :compUrl="dataUrl"
        :fieldList="formFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="rolesList"
            treeTitle="用户组"
            @selectData="roleChange"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel
          :size="systemInfoList?.length > 0 ? 200 : 0"
          min="0"
          max="300"
        >
          <star-horse-tree
            v-model:treeDatas="systemInfoList"
            treeTitle="应用系统"
            :preps="{
              label: 'sysName',
              value: 'idInformations',
            }"
            @selectData="systemChange"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel
          :size="menusList?.length > 0 ? 200 : 0"
          min="0"
          max="300"
        >
          <star-horse-tree
            v-model:treeDatas="menusList"
            treeTitle="系统菜单"
            :preps="{
              label: 'menuName',
              value: 'idMenusinfo',
              children: 'children',
            }"
            @selectData="menuChange"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <div class="search-content">
            <div class="search_btn">
              <star-horse-search-comp
                @searchData="
                  (data: any) => menuBtnTableRef?.createSearchParams(data)
                "
                :formData="searchFormData"
                :defaultCondition="defaultCondition"
                :compUrl="dataUrl"
              />
            </div>
          </div>
          <el-card class="inner_content">
            <star-horse-table-comp
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :dataFormat="dataFormat"
              ref="menuBtnTableRef"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
