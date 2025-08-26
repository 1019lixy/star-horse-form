<script setup lang="ts" name="ResourcesSummary">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createDatetime,
  createTree,
  dialogPreps,
  dictData,
  loadData,
  PageFieldInfo,
  piniaInstance,
  PreValid,
  SearchFields,
  SearchParams,
  SelectOption,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadRolesInfo, loadSystemInfo } from "@/api/star_horse_utils";
import { Config } from "@/api/settings";
import { computed, onMounted, provide, reactive, ref } from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import { getUserInfo } from "@/utils/auth";
import { baseUserFields, userFormat } from "@/views/system/utils/UserFields";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance("system-config", "system/dataPermission");
let systemInfoList = ref<SelectOption[]>([]);
let appinfoList = ref<SelectOption[]>([]);
let permissionType = ref<SelectOption[]>([
  { name: "数据共享到个人", value: "sharePerson" },
  { name: "数据共享到用户组", value: "shareGroup" },
  { name: "临时赋权", value: "empowerment" },
]);
let rolesList = ref<SelectOption[]>([]);
let menusList = ref<SelectOption[]>([]);
let menusSelectList = ref<SelectOption[]>([]);
let authorityList = ref<SelectOption[]>([]);
let dataForm = ref<any>({});
let defaultCondition = ref<SearchParams[]>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.permission.type"),
      defaultVisible: true,
      fieldName: "permissionType",
      type: "select",
      preps: {
        values: permissionType,
      },
    },
    {
      label: i18n("system.authorized.user.group"),
      defaultVisible: true,
      fieldName: "userGroup",
      matchType: "lk",
    },
  ],
});
let groupVisible = ref<boolean>("false");
let userVisible = ref<boolean>("true");
const formFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: i18n("system.permission.type"),
        fieldName: "permissionType",
        type: "select",
        defaultValue: "sharePerson",
        helpMsg:
          "数据共享：被授权人如果能访问对应模块，则可看到被共享的数据；\n 临时赋权：被授权人可以访问被赋权的模块及数据。",
        actions: {
          change: (val: any) => {
            groupVisible.value = val["permissionType"] == "shareGroup";
            val["userGroup"] = "";
            userVisible.value =
              val["permissionType"] == "sharePerson" ||
              val["permissionType"] == "empowerment";
          },
        },
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: permissionType,
        },
      },
      {
        label: i18n("system.authorized.menu"),
        fieldName: "menuList",
        type: "tselect",
        required: true,
        formVisible: true,

        listVisible: true,
        preps: {
          multiple: true,
          data: menusList,
          props: {
            label: "menuName",
            value: "idMenusinfo",
          },
        },
      },
    ],
    {
      label: i18n("system.user.group"),
      fieldName: "userGroup",
      type: "tselect",
      required: true,
      formVisible: groupVisible,

      listVisible: true,
      preps: {
        multiple: true,
        data: rolesList,
      },
    },
    {
      label: i18n("system.authorized.account"),
      fieldName: "userGroupName",
      aliasName: "userGroup",
      type: "page-select",
      required: true,
      formVisible: userVisible,
      listVisible: true,
      preps: {
        multiple: false,
        primaryKey: "idUsersinfo",
        dataUrl: {
          pageListUrl: "/system-config/system/usersinfo/pageList",
        },
        searchFieldList: {
          fieldList: [
            {
              label: i18n("system.username"),
              defaultVisible: true,
              fieldName: "username",
              matchType: "lk",
            },
            {
              label: i18n("system.name"),
              defaultVisible: true,
              fieldName: "name",
              matchType: "lk",
            },
            {
              label: i18n("system.employee.number"),
              defaultVisible: true,
              fieldName: "employeeNo",
              matchType: "lk",
            },
          ],
        },
        dataFormat: (name: string, val: any, row: any) => {
          return userFormat(name, val, row);
        },
        needField: [
          { sourceField: "idUsersinfo", distField: "userGroup" },
          { sourceField: "name", distField: "userGroupName" },
        ],
        fieldList: baseUserFields,
      },
    },
    {
      label: i18n("system.permission"),
      fieldName: "permissionList",
      type: "select",
      required: true,
      formVisible: true,

      defaultValue: ["view"],
      listVisible: true,
      preps: {
        multiple: true,
        values: authorityList,
      },
    },
    {
      label: i18n("system.validity.period"),
      fieldName: "validTime",
      type: "daterange",
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
  cellEditable: false,
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("system.permission.type"),
      fieldName: "permissionType",

      listVisible: true,
    },
    {
      label: i18n("system.authorized.user.group.account"),
      fieldName: "userGroup",

      listVisible: true,
    },
    {
      label: i18n("system.validity.period"),
      fieldName: "validTime",

      listVisible: true,
    },
    {
      label: i18n("system.authorized.menu"),
      fieldName: "menuList",

      listVisible: true,
    },
    {
      label: i18n("system.permission"),
      fieldName: "permissionList",
      listVisible: true,
    },
  ],
  cellEditable: false,
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
//主键
const primaryKey = "idDataPermission";
const dataPermissionRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "validTime") {
    return (
      createDatetime(row["validTimeStart"]) +
      " 到 " +
      createDatetime(row["validTimeEnd"])
    );
  } else if (name == "menuList") {
    return cellValue.map((item) => item.menuName).toString();
  } else if (name == "permissionList") {
    return cellValue.map((item) => item.resName).join(";");
  } else if (name == "permissionType") {
    return (
      permissionType.value.find((item) => item.value == cellValue)?.name ||
      cellValue
    );
  }
  return cellValue;
};

let currentUserGroupId = ref<number>(0);
let currentSystemId = ref<number>(0);
let currentMenuId = ref<number>(0);
let preValid = ref<Array<PreValid>>([
  {
    authority: "add",
    valid: () => {
      if (!currentSystemId.value) {
        warning(i18n("system.please.select.application"));
        return false;
      }
      return true;
    },
  },
]);

const loadMenus = async () => {
  let fieldList = [];
  let roleList = getUserInfo()?.rolesList?.map((item: any) => item.idRolesinfo);
  fieldList.push(createCondition("a.idRolesinfo", roleList, "in"));
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
const systemChange = async (data: TreeNodeData, _checked: boolean) => {
  currentSystemId.value = data.value;
  currentMenuId.value = 0;
  dataForm.value["idInformations"] = data.value;
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
  //  let roleList = getUserInfo()?.rolesList?.map(item => item.idRolesinfo);
  if (currentSystemId.value) {
    params.push(createCondition("c.idInformations", currentSystemId.value));
  }
  defaultCondition.value = JSON.parse(JSON.stringify(params));
  if (currentMenuId.value) {
    params.push(createCondition("b.idMenusinfo", currentMenuId.value));
  }
  dataPermissionRef.value.createSearchParams(params);
};
const initData = async () => {
  systemInfoList.value = await loadSystemInfo([]);
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
        @refresh="dataPermissionRef?.loadByPage()"
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
            v-model:tree-datas="systemInfoList"
            :treeTitle="i18n('system.application.system')"
            @selectData="systemChange"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel
          :size="menusList?.length > 0 ? 220 : 0"
          min="0"
          max="300"
        >
          <star-horse-tree
            v-model:tree-datas="menusList"
            :treeTitle="i18n('system.system.menu')"
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
                  (data: any) => dataPermissionRef?.createSearchParams(data)
                "
                :formData="searchFormData"
                :defaultCondition="defaultCondition"
                :compUrl="dataUrl"
              />
            </div>
          </div>
          <el-card class="inner_content h100">
            <star-horse-table-comp
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :preValidFunc="preValid"
              :dataFormat="dataFormat"
              ref="dataPermissionRef"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
