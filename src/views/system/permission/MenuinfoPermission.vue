<script setup lang="ts">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createTree,
  dialogPreps,
  dictData,
  loadData,
  PageFieldInfo,
  piniaInstance, PreValid,
  SearchFields,
  SearchParams,
  SelectOption,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadMenusInfo, loadRolesInfo } from "@/api/star_horse_utils";
import { computed, onMounted, provide, reactive, ref } from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import { Config } from "@/api/settings";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/rolesPkMenusinfo",
);
const menuPermission = ref();
let rolesList = ref<SelectOption[]>([]);
let systemInfoList = ref<SelectOption[]>([]);
let appinfoList = ref<SelectOption[]>([]);
let menusList = ref<Array<any>>();
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
let currentUserGroupId = ref<number>(0);
let currentSystemId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const userGroupChange = async (data: TreeNodeData, checked: boolean) => {
  systemInfoList.value = [];
  currentUserGroupId.value = data.value;
  currentSystemId.value = 0;
  let roleSystemDatas = await loadData(
    "/system-config/system/rolesPkAppinfo/getAllByCondition",
    {
      fieldList: [
        {
          propertyName: "b.idRolesinfo",
          value: data.value,
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
  setQueryCondition();
};
const setQueryCondition = () => {
  let queryCond = [];
  queryCond.push(createCondition("b.idRolesinfo", currentUserGroupId.value));
  if (currentSystemId.value) {
    queryCond.push(createCondition("a.idInformations", currentSystemId.value));
  }
  defaultCondition.value = queryCond;
  menuPermission.value.createSearchParams(queryCond);
};
const systemChange = async (data: TreeNodeData, checked: boolean) => {
  currentSystemId.value = data.idInformations;
  let condition: SearchParams = createCondition(
    "idInformations",
    data.idInformations,
  );
  setQueryCondition();
  menusList.value = await loadMenusInfo(true, [condition], false);
};
let menuPermissionStatus = ref<SelectOption[]>([]);
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.menu.name"),
      fieldName: "d.menuName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.status"),
      fieldName: "b.statusCode",
      type: "select",
      defaultVisible: true,
      preps: {
        values: menuPermissionStatus,
      },
    },
  ],
});
const menuRequired = ref<boolean>(false);
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.system.name"),
      fieldName: "idInformations",
      type: "tselect",
      formVisible: true,
      required: true,
      viewVisible: false,
      preps: {
        disabled: true,
        data: appinfoList,
      },
    },
    {
      label: i18n("system.assign.all.menus"),
      fieldName: "allMenu",
      type: "switch",
      defaultValue: "Y",
      formVisible: true,
      required: false,
      viewVisible: false,
      actions: {
        change: (val: any) => {
          menuRequired.value = val["allMenu"] == "N";
        },
      },
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
    {
      label: i18n("system.specified.menu"),
      fieldName: "menuList",
      type: "tselect",
      formVisible: true,
      required: menuRequired,
      viewVisible: false,
      helpMsg: "选择子节点时，一定要先选中父节点，否则左侧菜单栏无法显示",
      actions: {
        change: (val: any) => {
          if (val["menuList"]) {
            val["allMenu"] = "N";
          }
        },
      },
      preps: {
        multiple: true,
        data: menusList,
        checkStrictly: true,
        props: {
          label: "menuName",
          value: "idMenusinfo",
        },
      },
    },
    {
      label: i18n("system.status"),
      fieldName: "statusCode",
      type: "select",
      defaultValue: "1",
      listVisible: true,
      formVisible: true,
      preps: {
        values: menuPermissionStatus,
      },
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.system.name"),
      fieldName: "sysName",

      listVisible: true,
    },
    {
      label: i18n("system.system.code"),
      fieldName: "sysCode",

      listVisible: true,
    },
    {
      label: i18n("system.menu.name"),
      fieldName: "menuName",

      listVisible: true,
    },
    {
      label: i18n("system.status"),
      fieldName: "statusName",

      listVisible: true,
    },
  ],
  orderBy: [
    {
      fieldName: "b.idRolesinfo",
      ascOrDesc: "asc",
    },
  ],
});
const primaryKey = ["idInformations", "idRolesinfo", "idMenusinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let preValid = ref<Array<PreValid>>([{
  authority:"add",
  valid: () => {
    if (!currentUserGroupId.value) {
      warning(i18n("system.please.select.user.group"));
      return false;
    }
    if (!currentSystemId.value) {
      warning(i18n("system.please.select.application"));
      return false;
    }
    return true;
  },
}]);

const dataFormat = (name: string, cellValue: object): any => {
  if (name == "statusCode") {
    return (
      menuPermissionStatus.value.find(
        (item: SelectOption) => item.value == cellValue,
      )?.name || cellValue
    );
  }
  return cellValue;
};

const initData = async () => {
  rolesList.value = await loadRolesInfo([]);
  menuPermissionStatus.value = await dictData("menu_permission_status");
};
onMounted(async () => {
  await initData();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        :outerFormData="{
          idInformations: currentSystemId,
          idRolesinfo: currentUserGroupId,
        }"
        @refresh="menuPermission.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="formFieldList"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :data-format="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:treeDatas="rolesList"
            :treeTitle="i18n('system.user.group')"
            @selectData="userGroupChange"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel
          collapsible
          :size="systemInfoList.length > 0 ? 220 : 0"
          min="0"
          max="250"
        >
          <star-horse-tree
            v-model:treeDatas="systemInfoList"
            :treeTitle="i18n('system.application.system')"
            @selectData="systemChange"
            :compSize="compSize"
            :preps="{
              label: 'sysName',
              value: 'idInformations',
            }"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => menuPermission.createSearchParams(data)
                  "
                  :formData="searchFields"
                  :defaultCondition="defaultCondition"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="menuPermission"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :preValidFunc="preValid"
              :orderBy="tableFieldList.orderBy"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>

<style scoped lang="scss"></style>
