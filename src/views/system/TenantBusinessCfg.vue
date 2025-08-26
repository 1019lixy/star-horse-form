<script setup lang="ts">
import {
  computed,
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { Config } from "@/api/settings";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createDatetime,
  dialogPreps,
  operationConfirm,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SelectOption,
  success,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadDict } from "@/api/star_horse_apis";
import { loadMenusInfo, loadSystemInfo } from "@/api/star_horse_utils";
import { i18n } from "@/lang";

defineOptions({
  name: "TenantInfo",
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/tenantInfo");
const tenantAppDataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/tenantAppinfo",
);
const tenantAppMenuDataUrl: ApiUrls = apiInstance(
  "system-config",
  "system/tenantAppMenusinfo",
);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
//主键
const primaryKey = "idTenantInfo";
const tenantInfoRef = ref();
const tenantInfoFormRef = ref();
const tenantAppMenusinfoRef = ref();
let effectiveTimeList = ref<SelectOption[]>([]);
let dynamicFormList = ref<SelectOption[]>([]);
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.menu.name"),
      fieldName: "menuName",
      matchType: "lk",
      defaultVisible: true,
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("system.menu.name"),
      fieldName: "menuName",

      required: false,
      formVisible: true,
      listVisible: true,
      preps: {},
    },
    {
      label: i18n("system.sort"),
      fieldName: "dataIndex",
      type: "number",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {},
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",
      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "datetime",
      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",
      type: "datetime",
      preps: {},
      commonFlag: "Y",
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  dynamicFormas: [],
  orderBy: [],
  batchName: "batchDataList",
  tableCellEditabled: false,
  stopAutoLoad: false,
});

let informationsList = ref<any>([]);
let menusList = ref<any>([]);
const formFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.application.name"),
      fieldName: "appList",
      type: "tselect",
      formVisible: true,
      required: true,
      viewVisible: false,
      helpMsg: i18n("system.select.child.node.first"),
      preps: {
        multiple: true,
        data: informationsList,
        checkStrictly: true,
      },
    },
  ],
});
let menuRequired = ref<boolean>(false);
const menuformFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.system.name"),
      fieldName: "idInformations",
      type: "tselect",

      formVisible: true,
      required: true,
      viewVisible: false,
      disabled: true,
      preps: {
        data: informationsList,
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

      helpMsg: i18n("system.select.child.node.first"),
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
  ],
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
    tenantInfoRef.value.loadByPage();
  });
};
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
};
const deactivated = () => {};
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
};
let outerData: any = {};
const addData = (data: any) => {
  outerData[primaryKey] = data[primaryKey];
  dialogProps.editVisible = true;
};
const appDataChange = (data: any) => {
  outerData = data;
  menuAddedRefresh();
};
const addMenuData = (data: any) => {
  outerData = {};
  outerData[primaryKey] = data[primaryKey];
  outerData["idInformations"] = data["idInformations"];
  loadMenuBySystemId(data["idInformations"]);
  dialogProps.bakeVisible1 = true;
};
const removeAppData = (data: any) => {
  operationConfirm("确定要删除吗？").then(() => {
    let params = [];
    params.push(createCondition("idTenantInfo", data["idTenantInfo"]));
    params.push(createCondition("idInformations", data["idInformations"]));
    postRequest(tenantAppDataUrl.deleteByConditionUrl!, {
      fieldList: params,
    }).then((res) => {
      if (!res.data.code) {
        success("删除成功");
        dataChange(currentTenantData.value);
      } else {
        warning(res.data.cnMessage);
      }
    });
    // postRequest(tenantAppMenuDataUrl.deleteByConditionUrl!, {
    //   fieldList: params
    // }).then((res) => {
    //   if (index > 0) {
    //     dataChange(currentTenantData.value);
    //   }
    //   if (!res.data.code) {
    //     index++;
    //   }
    // });
  });
};
const loadMenuBySystemId = async (systemId: any) => {
  let params = [];
  params.push(createCondition("idInformations", systemId));
  menusList.value = await loadMenusInfo(true, params, false);
};
const menuAddedRefresh = () => {
  let params = [];
  params.push(createCondition("idInformations", outerData["idInformations"]));
  params.push(createCondition("idTenantInfo", outerData[primaryKey]));
  tenantAppMenusinfoRef.value.createSearchParams(params);
};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "effectiveTime") {
    return (
      createDatetime(row.effectiveTimeStart) +
      "-" +
      createDatetime(row.effectiveTimeEnd)
    );
  }
  //转换显示信息
  return cellValue;
};
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :title="i18n('system.add.application')"
      boxWidth="40%"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="dataChange(outerData)"
        :outerFormData="outerData"
        @dataLoaded="dataLoaded"
        :compUrl="tenantAppDataUrl"
        :fieldList="formFieldList"
        ref="tenantInfoFormRef"
        :primaryKey="'idTenantAppMenusinfo'"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      boxWidth="40%"
      :dialog-visible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
      :title="i18n('system.add.menu')"
    >
      <star-horse-form
        @refresh="menuAddedRefresh"
        :outerFormData="outerData"
        @dataLoaded="dataLoaded"
        :compUrl="tenantAppMenuDataUrl"
        :fieldList="menuformFieldList"
        :primaryKey="'idTenantAppMenusinfo'"
        ref="tenantMenuInfoFormRef"
        :rules="rules"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="dynamicFormList"
            ref="starHorseTreeRef"
            :expand="true"
            :treeTitle="i18n('system.tenant.list')"
            @selectData="dataChange"
            @addData="addData"
            :btnTitle="i18n('system.add.application')"
            :btnVisible="true"
            :showDropdown="false"
            :preps="{
              label: 'tenantName',
              value: primaryKey,
            }"
            :showPageBar="true"
            :isDynamicData="true"
            :autoLoad="true"
            :compUrl="dataUrl"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content h100">
            <el-splitter>
              <el-splitter-panel
                collapsible
                :size="Object.keys(currentTenantData).length == 0 ? 0 : 220"
                max="400"
              >
                <star-horse-tree
                  ref="tenantAppTreeRef"
                  :expand="true"
                  :treeTitle="i18n('system.application.list')"
                  @selectData="appDataChange"
                  @addData="addMenuData"
                  @removeData="removeAppData"
                  :btnTitle="i18n('system.add.menu')"
                  :btnVisible="true"
                  :rmvTitle="i18n('system.delete.application')"
                  :rmvVisible="true"
                  :showDropdown="false"
                  :preps="{
                    label: 'appName',
                    value: 'idInformations',
                  }"
                  :showPageBar="true"
                  :isDynamicData="true"
                  :autoLoad="false"
                  :compUrl="tenantAppDataUrl"
                  :compSize="compSize"
                />
              </el-splitter-panel>
              <el-splitter-panel>
                <el-card class="inner_content">
                  <div class="search-content">
                    <div class="search_btn">
                      <star-horse-search-comp
                        @searchData="
                          (data: any) =>
                            tenantAppMenusinfoRef?.createSearchParams(data)
                        "
                        :formData="searchFormData"
                        :compUrl="dataUrl"
                      />
                    </div>
                  </div>
                  <star-horse-table-comp
                    ref="tenantAppMenusinfoRef"
                    :fieldList="tableFieldList"
                    :primaryKey="'idTenantAppMenusinfo'"
                    :compUrl="tenantAppMenuDataUrl"
                    :dataFormat="dataFormat"
                    :hideButtonList="true"
                  />
                </el-card>
              </el-splitter-panel>
            </el-splitter>
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
