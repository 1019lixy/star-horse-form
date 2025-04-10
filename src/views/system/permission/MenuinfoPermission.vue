<script setup lang="ts">
  import {
    apiInstance,
    createCondition,
    createTree,
    dialogPreps,
    dictData,
    loadData,
    loadMenusInfo,
    loadRolesInfo
  } from "star-horse-lowcode";
  import { computed, onMounted, provide, reactive, ref } from "vue";
  import { SearchFields, SelectOption, useGlobalConfigStore,PageFieldInfo,ApiUrls,SearchParams } from "star-horse-lowcode";
  import {piniaInstance} from "star-horse-lowcode";
  import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
  import { warning } from "star-horse-lowcode";
  import { Config } from "@/api/settings.ts";

  const dataUrl: ApiUrls = apiInstance("system-config", "system/rolesPkMenusinfo");
  const menuPermission = ref();
  let rolesList = ref<SelectOption[]>([]);
  let systemInfoList = ref<SelectOption[]>([]);
  let appinfoList = ref<SelectOption[]>([]);
  let menusList = ref<Array<any>>();
  let configStore = useGlobalConfigStore(piniaInstance);
  let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
  let currentUserGroupId = ref<number>(0);
  let currentSystemId = ref<number>(0);
  let defaultCondition = ref<SearchParams[]>([]);
  const userGroupChange = async (data: TreeNodeData, checked: boolean) => {
    systemInfoList.value = [];
    currentUserGroupId.value = data.value;
    currentSystemId.value = 0;
    let roleSystemDatas = await loadData("/system-config/system/rolesPkAppinfo/getAllByCondition", {
      fieldList: [
        {
          propertyName: "b.idRolesinfo",
          value: data.value
        }
      ]
    });
    if (roleSystemDatas.error) {
      warning(roleSystemDatas.error);
      return;
    }
    systemInfoList.value = roleSystemDatas.data;
    appinfoList.value = createTree(roleSystemDatas.data, "idInformations", "sysName", "");
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
    let condition: SearchParams = createCondition("idInformations", data.idInformations);
    setQueryCondition();
    menusList.value = await loadMenusInfo(true, [condition], false);
  };
  let menuPermissionStatus = ref<SelectOption[]>([]);
  const searchFields = reactive<SearchFields>({
    fieldList: [
      {
        label: "菜单名称",
        fieldName: "d.menuName",
        defaultVisible: true,
        type: "input",
        matchType: "lk"
      },
      {
        label: "状态",
        fieldName: "b.statusCode",
        type: "select",
        optionList: menuPermissionStatus,
        defaultVisible: true
      }
    ]
  });
  const formFieldList = reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "系统名称",
        fieldName: "idInformations",
        type: "tselect",
        optionList: appinfoList,
        formVisible: true,
        required: true,
        viewVisible: false,
        disabled: "Y"
      },
      {
        label: "菜单名称",
        fieldName: "menuList",
        type: "tselect",
        optionList: menusList,
        formVisible: true,
        required: true,
        viewVisible: false,
        multiple: "Y",
        helpMsg: "选择子节点时，一定要先选中父节点，否则左侧菜单栏无法显示",
        preps: {
          checkStrictly: "Y",
          props: {
            label: "menuName",
            value: "idMenusinfo"
          }
        }
      },
      {
        label: "状态",
        fieldName: "statusCode",
        type: "select",
        defaultValue: "1",
        listVisible: true,
        formVisible: true,
        optionList: menuPermissionStatus
      }
    ]
  });
  const tableFieldList = reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "系统名称",
        fieldName: "sysName",
        type: "input",
        listVisible: true
      },
      {
        label: "系统编码",
        fieldName: "sysCode",
        type: "input",
        listVisible: true
      },
      {
        label: "菜单名称",
        fieldName: "menuName",
        type: "input",
        listVisible: true
      },
      {
        label: "状态",
        fieldName: "statusName",
        type: "input",
        listVisible: true
      }
    ],
    orderBy: [
      {
        fieldName: "b.idRolesinfo",
        ascOrDesc: "asc"
      }
    ]
  });
  const primaryKey = ["idInformations", "idRolesinfo", "idMenusinfo"];
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);
  let preValid = ref<any>({
    add: () => {
      if (!currentUserGroupId.value) {
        warning("请先选择用户分组");
        return false;
      }
      if (!currentSystemId.value) {
        warning("请先选择应用");
        return false;
      }
      return true;
    }
  });

  const dataFormat = (name: string, cellValue: object): any => {
    if (name == "statusCode") {
      return menuPermissionStatus.value.find((item) => item.value == cellValue)?.name || cellValue;
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
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      :outerFormData="{
        idInformations: currentSystemId,
        idRolesinfo: currentUserGroupId
      }"
      @refresh="menuPermission.loadByPage()"
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
    <star-horse-data-view :data-format="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-row :gutter="10" style="height: 100%; overflow: hidden">
    <el-col :span="4" class="h100">
      <star-horse-tree
        v-model:treeDatas="rolesList"
        treeTitle="用户组"
        @selectData="userGroupChange"
        :compSize="compSize"
      />
    </el-col>
    <el-col v-if="systemInfoList.length > 0" :span="4" class="h100">
      <star-horse-tree
        v-model:treeDatas="systemInfoList"
        treeTitle="应用系统"
        @selectData="systemChange"
        :compSize="compSize"
        :preps="{
          label: 'sysName',
          value: 'idInformations'
        }"
      />
    </el-col>
    <el-col :span="systemInfoList.length > 0 ? 16 : 20" class="h100" style="height: 100%; overflow: hidden">
      <div class="search-content">
        <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
          <star-horse-search-comp
              @searchData="(data: any) => menuPermission.createSearchParams(data)"
              :formData="searchFields"
              :defaultCondition="defaultCondition"
              :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content h100">
        <star-horse-table-comp
          ref="menuPermission"
          :fieldList="tableFieldList"
          :primaryKey="primaryKey"
          :compUrl="dataUrl"
          :orderBy="tableFieldList.orderBy"
          :dataFormat="dataFormat"
        />
      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss"></style>
