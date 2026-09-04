<script lang="ts" setup>
import {
  apiInstance,
  closeLoad,
  deleteByIds,
  error,
  FieldInfo,
  getRequest,
  load,
  loadData,
  loadGetData,
  postRequest,
  SelectOption,
  success,
  warning,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import DbListComp from "@/components/system/items/utils/DbListComp.vue";
import MyComponentsPanel from "@/components/system/items/form/panels/MyComponentsPanel.vue";
import TemplatePanel from "@/components/system/items/form/panels/TemplatePanel.vue";
import {nextTick, onMounted, ref} from "vue";
import {createBiParamDataAdapter, FormConfig} from "@/components/types";
import {useRoute} from "vue-router";
import {getUserInfo, loadDict, loadRolesInfo, loadSystemInfo, permissionMenus,} from "@/sample/utils/formapi";
import {ServiceEnums} from "@/components/enums/ServiceEnums";

const starHorseFormDesignRef = ref();


// 静态数据源列表
const dbListData: SelectOption[] = [
  {name: "127.0.0.1(star_horse_devops)", value: "2"},
  {name: "127.0.0.1(script_manage)", value: "8"},
  {name: "127.0.0.1(star_horse_workflow)", value: "337537414606095357"},
  {name: "127.0.0.1(star_horse_continuous)", value: "136"},
  {name: "127.0.0.1(quantity_manage)", value: "381167130139165693"},
];
const dbConfigList = async (): Promise<SelectOption[]> => {
  const {data, error} = await loadGetData(
      "/userdb-manage/dbsearch/dbinfo/getDbInfoByUser",
  );
  if (error) {
    warning(error);
    return dbListData;
  }
  return data?.map((item: any) => {
    return {
      name: item.name,
      value: item.configId + "",
    };
  });
}
/**
 * API 接口配置
 */
const api = apiInstance("userdb-manage", "userdb/dynamicForm");
api.customerUrl1 = "/userdb-manage/userdb/dynamicForm/excelAnalysis";
const configTemplateApi = apiInstance("userdb-manage", "userdb/configTemplate");
configTemplateApi.customerUrl1 =
    "/userdb-manage/userdb/configTemplate/listByCategory";
const dbInfoApi = apiInstance("userdb-manage", "dbsearch/dbinfo");
dbInfoApi.customerUrl1 = "/userdb-manage/dbsearch/dbinfo/openConn";
dbInfoApi.customerUrl2 = "/userdb-manage/dbsearch/dbinfo/getDbInfoByUser";
dbInfoApi.customerUrl3 = "/userdb-manage/dbsearch/dbinfo/tableList";
dbInfoApi.customerUrl4 = "/userdb-manage/dbsearch/dbinfo/tableColumns";

/**
 * 使用 createDataAdapter / createParamDataAdapter 简化配置
 *
 * 关键区分：
 *   - 如果请求函数已经返回 SelectOption[]（如 loadSystemInfo），直接用函数引用
 *   - 如果请求函数返回原始 axios 响应，且数据需要字段映射，用 createXxxAdapter
 *   - 如果组件通过 props.label/value 自行映射字段，直接透传原始数据即可
 */
// ==================== 接入方自定义基础配置字段（强业务字段由业务侧自行定义并注入） ====================
// lib 仅提供 formBasicProps 通道，字段定义、数据加载、联动均由接入方在此自行实现。
// 新项目如需不同字段，按同样方式定义后传入 optional.formBasicProps 即可。
const rolesList = ref<any>([]);
const menusInfoList = ref<any>([]);
const authorityList = ref<SelectOption[]>([]);
const informationsList = ref<any>([]);
const primaryKeyPolicyList = ref<SelectOption[]>([]);
const pageStyleList = ref<SelectOption[]>([]);
const dataLoadConditionList = ref<SelectOption[]>([]);
const cloneDatasList = ref<SelectOption[]>([
  {name: i18n("dyform.formProp.modelType.form"), value: "form"},
  {name: i18n("dyform.formProp.modelType.authority"), value: "authority"},
  {name: i18n("dyform.formProp.modelType.all"), value: "all"},
]);
const loadMenus = (sysId: string) => {
  if (!sysId) return;
  permissionMenus({}, sysId).then((res: any) => {
    menusInfoList.value = res.data?.data ?? [];
  });
};
onMounted(() => {
  loadRolesInfo([]).then((res: any) => {
    rolesList.value = res ?? [];
  });
  loadSystemInfo(
      [{propertyName: "statusCode", value: "1"}],
      `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
  ).then((res: any) => {
    informationsList.value = res ?? [];
  });
  loadDict("page_style").then((res: any) => (pageStyleList.value = res ?? []));
  loadDict("button_authority").then((res: any) => (authorityList.value = res ?? []));
  loadDict("DATA_LOAD_CONDITION").then((res: any) => (dataLoadConditionList.value = res ?? []));
  loadDict("PRIMARY_KEY_POLICY").then((res: any) => (primaryKeyPolicyList.value = res ?? []));
});
const formBasicProps: FieldInfo[] = [
  {
    label: i18n("dyform.formProp.appName"),
    fieldName: "sysId",
    type: "tselect",
    actions: {change: (val: any) => loadMenus(val["sysId"])},
    formVisible: true,
    required: true,
    preps: {checkStrictly: true, colspan: 8, data: informationsList},
  },
  {
    label: i18n("dyform.formProp.createTable"),
    fieldName: "createTable",
    type: "switch",
    defaultValue: "N",
    formVisible: true,
    preps: {colspan: 8, activeValue: "Y", inactiveValue: "N"},
  },
  {
    label: i18n("dyform.formProp.checkDuplicate"),
    fieldName: "checkDuplicate",
    type: "switch",
    defaultValue: "false",
    formVisible: true,
    preps: {colspan: 8},
  },
  {
    label: i18n("dyform.formProp.primaryKeyStrategy"),
    fieldName: "primaryKeyPolicy",
    type: "select",
    formVisible: true,
    preps: {editDisabled: true, values: primaryKeyPolicyList, colspan: 8},
  },
  {
    label: i18n("dyform.formProp.createMenu"),
    fieldName: "createMenu",
    type: "switch",
    defaultValue: "N",
    formVisible: true,
    preps: {
      colspan: 12,
      dataRelation: {
        actionName: "change",
        relationDetails: [
          {
            matchType: "eq",
            controlCondition: "eqVisible",
            relationFields: ["userGroupList", "parentMenuId", "buttonPermissionsList"],
            matchFieldValue: "Y",
          },
        ],
      },
      activeValue: "Y", inactiveValue: "N",
    },
  },
  {
    label: i18n("dyform.formProp.authGroup"),
    fieldName: "userGroupList",
    type: "select",
    formVisible: false,
    listVisible: true,
    preps: {colspan: 12, multiple: true, values: rolesList},
  },
  {
    label: i18n("dyform.formProp.parentMenu"),
    fieldName: "parentMenuId",
    type: "tselect",
    formVisible: false,
    preps: {checkStrictly: true, colspan: 12, data: menusInfoList, props: {label: "menuName", value: "dataNo"}},
  },
  {
    label: i18n("dyform.formProp.buttonAuth"),
    fieldName: "buttonPermissionsList",
    type: "select",
    required: false,
    formVisible: false,
    listVisible: true,
    preps: {multiple: true, colspan: 12, values: authorityList},
  },
  {
    label: i18n("dyform.formProp.saveAsTemplate"),
    fieldName: "templateFlag",
    type: "switch",
    defaultValue: 2,
    formVisible: true,
    preps: {activeValue: 1, inactiveValue: 2, colspan: 6},
  },
  {
    label: i18n("dyform.formProp.cascadeDelete"),
    helpMsg: i18n("dyform.formProp.cascadeDelete.helpMsg"),
    fieldName: "deleteCascade",
    type: "switch",
    defaultValue: "Y",
    formVisible: true,
    preps: {colspan: 6, activeValue: "Y", inactiveValue: "N"},
  },
  {
    label: i18n("dyform.formProp.cloneData"),
    helpMsg: i18n("dyform.formProp.cloneData.helpMsg"),
    fieldName: "cloneData",
    type: "select",
    formVisible: true,
    preps: {colspan: 12, values: cloneDatasList},
  },
  {
    label: i18n("dyform.formProp.pageStyle"),
    fieldName: "pageStyle",
    type: "select",
    formVisible: true,
    preps: {
      colspan: 8,
      dataRelation: {
        actionName: "change",
        relationDetails: [
          {matchType: "eq", controlCondition: "eqVisible", relationFields: ["dataLoadField"], matchFieldValue: "form"},
        ],
      },
      values: pageStyleList,
    },
  },
  {
    label: i18n("dyform.formProp.loadCondition"),
    fieldName: "dataLoadField",
    type: "select",
    formVisible: false,
    preps: {colspan: 8, values: dataLoadConditionList},
  },
];

const optional = ref<FormConfig>({
  model: "full",
  api: api,
  configTemplateApi: configTemplateApi,
  primaryKey: "idDynamicForm",
  permissions: {
    add: "add",
    edit: "edit",
    view: "view",
  },
  // 字典：loadDict 已返回 SelectOption[]，直接引用
  loadDicts: (dictName: string) => loadDict(dictName),
  // 表字段：getRequest 返回原始响应，需要适配器提取 data.data 并映射字段
  loadTableColumns: createBiParamDataAdapter(
      (dataSourceId, tableName) =>
          getRequest(
              `/userdb-manage/dbsearch/dbinfo/tableColumns/${dataSourceId}/${tableName}`,
          ),
      {name: "comment", value: "fieldName"},
  ),
  // 静态数据源列表
  // loadDbList: () => Promise.resolve(dbListData),
  loadDbList: () => {
    return new Promise((executor, reject) => {
      dbConfigList()
          .then((res: any) => {
            executor(res);
          })
          .catch((e) => {
            reject(e);
          });
    });
  },
  // 接入方自定义基础配置字段（见上方 formBasicProps 定义）
  formBasicProps: formBasicProps,
});
// ==================== 插槽组件专用配置（与设计器核心配置分离） ====================
const dbListCompProps = {
  dbInfoApi: dbInfoApi,
  loadDbList: () => Promise.resolve(dbListData),
  loadDicts: (dictName: string) => loadDict(dictName),
  batchCreatePage: true,
  api: api,
  compSize: "default" as const,
  loadAppList: () =>
      loadSystemInfo(
          [{propertyName: "statusCode", value: "1"}],
          `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
      ),
  loadRolesList: () => loadRolesInfo([]),
  loadMenuList: (appId: string) =>
      appId
          ? permissionMenus({}, appId).then((res: any) => res.data?.data ?? [])
          : Promise.resolve([]),
};
let route = useRoute();
const loadFormData = async (
    formId: any,
    isParent: boolean,
    isTemplate?: boolean,
) => {
  await nextTick();
  let resultData: any = await loadData(api.loadByIdUrl! + "/" + formId, {});
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  let dynamicFormData: any = resultData.data;
  if (isParent) {
    dynamicFormData["idDynamicForm"] = null;
    dynamicFormData["parentId"] = formId;
    //数据编号一定要清空，否则数据会跳过重复验证
    dynamicFormData["dataNo"] = null;
    dynamicFormData["formId"] = dynamicFormData["formId"] + "Sub";
    dynamicFormData["tbName"] = dynamicFormData["tbName"] + "Sub";
  }
  if (dynamicFormData["relations"]) {
    dynamicFormData["relations"] = JSON.parse(dynamicFormData["relations"]);
  }
  if (dynamicFormData["flowDefineIds"]) {
    dynamicFormData["flowConfigures"] = {
      mode: "reuse",
      flowDefineIds: dynamicFormData["flowDefineIds"].split(";")
    }
  }

  let details = dynamicFormData["details"];
  if (isTemplate) {
    let times = new Date().getTime();
    dynamicFormData["idDynamicForm"] = undefined;
    dynamicFormData["parentId"] = undefined;
    dynamicFormData["dataNo"] = undefined;
    dynamicFormData["formId"] = "Id" + times + "Temp";
    dynamicFormData["tbName"] = "Tb" + times + "Temp";
    dynamicFormData["formName"] = undefined;
    dynamicFormData["datasourceConfigId"] = undefined;
    dynamicFormData["createMenu"] = "N";
    dynamicFormData["createTable"] = "N";
    details["idDynamicForm"] = undefined;
    details["idDynamicFormDetails"] = undefined;
    details["dataNo"] = undefined;
    details["tenantId"] = undefined;
    dynamicFormData["createdBy"] = undefined;
    dynamicFormData["updatedBy"] = undefined;
    dynamicFormData["createdTime"] = undefined;
    dynamicFormData["updatedTime"] = undefined;

    dynamicFormData["templateFlag"] = undefined;
    details["createdBy"] = undefined;
    details["updatedBy"] = undefined;
    details["createdTime"] = undefined;
    details["updatedTime"] = undefined;
  } else {
    dynamicFormData["sysId"] =
        route?.query?.["sysId"] ?? dynamicFormData["sysId"] ?? undefined;
  }
  dynamicFormData["details"] = {};
  const compList = JSON.parse(details?.content || "[]");
  const formData = JSON.parse(details?.fieldNames || "{}");
  starHorseFormDesignRef.value?.setFormInfo(
      compList,
      dynamicFormData,
      formData,
      true,
  );
};
/**
 * 数据操作
 * @param type 类别
 * @param data 选中的数据
 */
const changeDataHandle = (type: string, data: any) => {
  let formId = data["idDynamicForm"];
  if (type == "subAdd") {
    loadFormData(formId, true);
  } else if (type == "remove") {
    deleteByIds(api.deleteUrl, formId);
  } else if (type == "edit") {
    loadFormData(formId, false);
  } else {
    console.log(type, data);
  }
};
const saveData = (isDraft: boolean, data: any) => {
  load(i18n("dyform.sample.submitting"));
  postRequest(`${api.basePrefix}/${isDraft ? "mergeDraft" : "merge"}`, data)
      .then((res: any) => {
        if (res.data.code != 200) {
          warning(res.data.cnMessage);
          return;
        }
        success(res.data.cnMessage);
      })
      .catch((err: any) => {
        error(i18n("dyform.sample.operationError") + err);
      })
      .finally(() => {
        closeLoad();
      });
};
</script>

<template>
  <StarHorseFormDesign
      ref="starHorseFormDesignRef"
      :optional="optional"
      :tabOrder="['component', 'mycomp', 'dbinfo', 'outline', 'template', 'help']"
      @saveData="saveData"
      @changeDataHandle="changeDataHandle"
  >
    <template #tab-mycomp>
      <MyComponentsPanel/>
    </template>
    <template #tab-dbinfo>
      <DbListComp v-bind="dbListCompProps"/>
    </template>
    <template #tab-template>
      <TemplatePanel
          :api="api"
          @loadData="(formId: any) => loadFormData(formId, false, true)"
          @applySystemTemplate="(tpl: any) => starHorseFormDesignRef?.applySystemTemplate(tpl)"
      />
    </template>
  </StarHorseFormDesign>
</template>

<style scoped lang="scss"></style>
