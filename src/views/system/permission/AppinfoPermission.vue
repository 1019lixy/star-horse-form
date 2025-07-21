<script setup lang="ts">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SearchParams,
  SelectOption,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadRolesInfo, loadSystemInfo } from "@/api/star_horse_utils";
import { computed, onMounted, provide, reactive, ref } from "vue";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import { Config } from "@/api/settings";

let informationsList = ref<any>([]);
let appPermissionStatus = ref<SelectOption[]>([]);
const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkAppinfo");
const appinfoPermission = ref();
let rolesList = ref<SelectOption[]>();
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);
const checkChange = (data: TreeNodeData, checked: boolean) => {
  currentUserGroupId.value = data.value;
  defaultCondition.value = [
    {
      propertyName: "b.idRolesinfo",
      value: data.value,
    },
  ];
  appinfoPermission.value.createSearchParams(defaultCondition.value);
};
const searchFields = reactive<SearchFields>({
  fieldList: [
    {
      label: "系统名称",
      fieldName: "b.idInformations",
      defaultVisible: true,
      type: "tselect",
      matchType: "eq",
      preps: {
        data: informationsList,
      },
    },
    {
      label: "状态",
      fieldName: "b.statusCode",
      type: "select",
      defaultVisible: true,
      preps: {
        values: appPermissionStatus,
      },
    },
  ],
});
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称",
      fieldName: "idRolesinfo",
      type: "select",
      formVisible: true,
      required: true,
      viewVisible: false,
      disabled: true,
      preps: {
        values: rolesList,
      },
    },
    {
      label: "应用名称",
      fieldName: "appList",
      type: "tselect",
      formVisible: true,
      required: true,
      viewVisible: false,
      helpMsg: "选择子节点时，一定要先选中父节点，否则在头部应用菜单栏无法显示",
      preps: {
        multiple: true,
        data: informationsList,
        checkStrictly: true,
      },
    },
    {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      listVisible: true,
      formVisible: true,
      preps: {
        values: appPermissionStatus,
      },
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "分组名称",
      fieldName: "roleName",

      listVisible: true,
    },
    {
      label: "分组编码",
      fieldName: "roleCode",

      listVisible: true,
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
      label: "状态",
      fieldName: "statusName",

      listVisible: true,
    },
  ],
  orderBy: [
    {
      fieldName: "idRolesinfo",
      ascOrDesc: "asc",
    },
  ],
});
const primaryKey = ["idInformations", "idRolesinfo"];
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let preValid = ref<any>({
  add: () => {
    if (!currentUserGroupId.value) {
      warning("请先选择用户分组");
      return false;
    }
    return true;
  },
});
const dataFormat = (name: string, cellValue: any): any => {
  if (name == "statusCode") {
    return (
      appPermissionStatus.value.find((item: any) => item.value == cellValue)
        ?.name || cellValue
    );
  }
  return cellValue;
};

const initData = async () => {
  informationsList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  appPermissionStatus.value = await dictData("app_permission_status");
};
onMounted(async () => {
  await initData();
});
</script>

<template>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      :outerFormData="{
        idRolesinfo: currentUserGroupId,
      }"
      @refresh="appinfoPermission.loadByPage()"
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
          v-model:tree-datas="rolesList"
          treeTitle="用户组"
          @selectData="checkChange"
          :compSize="compSize"
        />
      </el-splitter-panel>
      <el-splitter-panel>
        <el-card class="inner_content">
          <div class="search-content">
            <div
              class="search_btn"
              :style="{
                'flex-direction':
                  Config.buttonStyle.value == 'line' ? 'column' : 'row',
              }"
            >
              <star-horse-search-comp
                @searchData="
                  (data: any) => appinfoPermission.createSearchParams(data)
                "
                :formData="searchFields"
                :defaultCondition="defaultCondition"
                :compUrl="dataUrl"
              />
            </div>
          </div>
          <star-horse-table-comp
            ref="appinfoPermission"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :compUrl="dataUrl"
            :orderBy="tableFieldList.orderBy"
            :dataFormat="dataFormat"
          />
        </el-card>
      </el-splitter-panel>
    </el-splitter>
  </el-card>
</template>

<style scoped lang="scss"></style>
