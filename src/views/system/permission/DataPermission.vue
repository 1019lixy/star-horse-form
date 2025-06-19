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
  SearchFields,
  SearchParams,
  SelectOption,
  useGlobalConfigStore,
  warning
} from "star-horse-lowcode";
import {loadRolesInfo, loadSystemInfo} from "@/api/star_horse_utils";
import {Config} from "@/api/settings";
import {computed, onMounted, provide, reactive, ref} from "vue";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {getUserInfo} from "@/utils/auth";
import {baseUserFields, userFormat} from "@/views/system/utils/UserFields";

const dataUrl: ApiUrls = apiInstance("system-config", "system/dataPermission");
let systemInfoList = ref<SelectOption[]>([]);
let appinfoList = ref<SelectOption[]>([]);
let permissionType = ref<SelectOption[]>([
  {name: "数据共享到个人", value: "sharePerson"},
  {name: "数据共享到用户组", value: "shareGroup"},
  {name: "临时赋权", value: "empowerment"}
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
      label: "权限类型",
      defaultVisible: true,
      fieldName: "permissionType",
      type: "select",
      optionList: permissionType
    },
    {label: "被授权用户组/人", defaultVisible: true, fieldName: "userGroup", type: "input", matchType: "lk"}
  ]
});
let groupVisible = ref<boolean>("false");
let userVisible = ref<boolean>("true");
const formFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: "权限类型",
        fieldName: "permissionType",
        type: "select",
        optionList: permissionType,
        defaultValue: "sharePerson",
        actionName: "change",
        helpMsg:
            "数据共享：被授权人如果能访问对应模块，则可看到被共享的数据；\n 临时赋权：被授权人可以访问被赋权的模块及数据。",
        actions: (val: any) => {
          groupVisible.value = val["permissionType"] == "shareGroup";
          val["userGroup"] = "";
          userVisible.value = val["permissionType"] == "sharePerson" || val["permissionType"] == "empowerment";
        },
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "授权菜单",
        fieldName: "menuList",
        type: "tselect",
        required: true,
        formVisible: true,
        multiple: true,
        listVisible: true,
        preps: {
          data:menusList,
          props: {
            label: "menuName",
            value: "idMenusinfo"
          }
        }
      }
    ],
    {
      label: "用户组",
      fieldName: "userGroup",
      type: "tselect",
      required: true,
      formVisible: groupVisible,
      multiple: true,
      listVisible: true,
      preps:{
        data:rolesList
      }
    },
    {
      label: "被授权账号",
      fieldName: "userGroupName",
      aliasName: "userGroup",
      type: "page-select",
      required: true,
      formVisible: userVisible,
      multiple: "N",
      listVisible: true,
      params: {
        primaryKey: "idUsersinfo",
        dataUrl: {
          pageListUrl: "/system-config/system/usersinfoEntity/pageList"
        },
        searchFieldList: {
          fieldList: [
            {label: "用户名", defaultVisible: true, fieldName: "username", type: "input", matchType: "lk"},
            {label: "姓名", defaultVisible: true, fieldName: "name", type: "input", matchType: "lk"},
            {label: "工号", defaultVisible: true, fieldName: "employeeNo", type: "input", matchType: "lk"}
          ]
        },
        dataFormat: (name: string, val: any, row: any) => {
          return userFormat(name, val, row);
        },
        needField: [
          {sourceField: "idUsersinfo", distField: "userGroup"},
          {sourceField: "name", distField: "userGroupName"}
        ],
        fieldList: baseUserFields
      }
    },
    {
      label: "权限",
      fieldName: "permissionList",
      type: "select",
      optionList: authorityList,
      required: true,
      formVisible: true,
      multiple: true,
      defaultValue: ["view"],
      listVisible: true
    },
    {
      label: "有效期",
      fieldName: "validTime",
      type: "daterange",
      required: true,
      formVisible: true,
      listVisible: true
    }
  ],
  cellEditable: false
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "权限类型",
      fieldName: "permissionType",
      type: "input",
      listVisible: true
    },
    {
      label: "被授权用户组/账号",
      fieldName: "userGroup",
      type: "input",
      listVisible: true
    },
    {
      label: "有效期",
      fieldName: "validTime",
      type: "input",
      listVisible: true
    },
    {
      label: "授权菜单",
      fieldName: "menuList",
      type: "input",
      listVisible: true
    },
    {
      label: "权限",
      fieldName: "permissionList",
      listVisible: true
    }
  ],
  cellEditable: false
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
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
    return createDatetime(row["validTimeStart"]) + " 到 " + createDatetime(row["validTimeEnd"]);
  } else if (name == "menuList") {
    return cellValue.map((item) => item.menuName).toString();
  } else if (name == "permissionList") {
    return cellValue.map((item) => item.resName).join(";");
  } else if (name == "permissionType") {
    return permissionType.value.find((item) => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};

let currentUserGroupId = ref<number>(0);
let currentSystemId = ref<number>(0);
let currentMenuId = ref<number>(0);
let preValid = ref<any>({
  add: () => {
    if (!currentSystemId.value) {
      warning("请先选择应用");
      return false;
    }
    return true;
  }
});

const loadMenus = async () => {
  let fieldList = [];
  let roleList = getUserInfo()?.rolesList?.map((item) => item.idRolesinfo);
  fieldList.push(createCondition("a.idRolesinfo", roleList, "in"));
  if (currentSystemId.value) {
    fieldList.push(createCondition("a.idInformations", currentSystemId.value));
  }
  menusList.value = [];
  let menusDatas = await loadData("/system-config/system/menusinfoEntity/rolesAppMenus", {
    fieldList: fieldList,
    orderBy: [
      {
        fieldName: "a.idRolesinfo",
        ascOrDesc: "asc"
      },
      {
        fieldName: "a.idInformations",
        ascOrDesc: "asc"
      },
      {
        fieldName: "b.dataIndex",
        ascOrDesc: "asc"
      }
    ]
  });
  if (menusDatas.error) {
    warning(menusDatas.error);
    return;
  }
  menusList.value = menusDatas.data;
  menusSelectList.value = createTree(menusDatas.data, "idMenusinfo", "menuName", "");
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
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
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
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-splitter>
      <el-splitter-panel collapsible size="240" min="100" max="500">
        <star-horse-tree
            v-model:tree-datas="systemInfoList"
            treeTitle="应用系统"
            @selectData="systemChange"
            :compSize="compSize"
        />
      </el-splitter-panel>
      <el-splitter-panel v-if="menusList?.length>0" size="220" min="100" max="300">
        <star-horse-tree
            v-model:tree-datas="menusList"
            treeTitle="系统菜单"
            :preps="{
            label: 'menuName',
            value: 'idMenusinfo',
            children: 'children'
          }"
            @selectData="menuChange"
            :compSize="compSize"
        />
      </el-splitter-panel>
      <el-splitter-panel>
        <div class="search-content">
          <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
            <star-horse-search-comp
                @searchData="(data: any) => dataPermissionRef?.createSearchParams(data)"
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
              :dataFormat="dataFormat"
              ref="dataPermissionRef"
          />
        </el-card>
      </el-splitter-panel>
    </el-splitter>
  </el-card>
</template>
