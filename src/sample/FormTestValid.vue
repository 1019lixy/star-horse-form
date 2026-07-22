<script lang="ts" setup>
import {
  apiInstance,
  closeLoad,
  deleteByIds,
  error,
  getRequest,
  load,
  loadData,
  postRequest,
  SelectOption,
  success,
  warning
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import {nextTick, ref} from "vue";
import {createBiParamDataAdapter, FormConfig} from "@/components/types";
import {useRoute} from "vue-router";
import {getUserInfo, loadDict, loadRolesInfo, loadSystemInfo, permissionMenus} from "@/sample/utils/formapi";
import {ServiceEnums} from "@/components/enums/ServiceEnums";

const starHorseFormDesignRef = ref();
const loadMenu = (type: string, sysId: string) => {
  const userId = "";
  postRequest(
      `system-config/system/menusinfo/permissionMenus/${userId}/${sysId}`,
      {},
  );
};
const loadTableColumns = (
    type: string,
    dataSourceId: string,
    tbName: string,
) => {
  getRequest(
      `/userdb-manage/dbsearch/dbinfo/tableColumns/${dataSourceId}/${tbName}`,
  ).then((res: any) => {
    if (res.data.code != 0) {
      return;
    }
    let resData = res.data.data;
    let tableColumnsList: SelectOption[] = [];
    resData.forEach((item: any) => {
      tableColumnsList.push({
        name: item.comment,
        value: item.fieldName,
      });
    });
    starHorseFormDesignRef.value.setTableColumns(type, tableColumnsList);
  });
};

// 静态数据源列表
const dbListData: SelectOption[] = [
  {name: "127.0.0.1(star_horse_devops)", value: "2"},
  {name: "127.0.0.1(script_manage)", value: "8"},
  {name: "127.0.0.1(star_horse_workflow)", value: "337537414606095357"},
  {name: "127.0.0.1(star_horse_continuous)", value: "136"},
];

/**
 * API 接口配置
 */
const api = apiInstance("userdb-manage", "userdb/dynamicForm");
api.customerUrl1 = "/userdb-manage/userdb/dynamicForm/excelAnalysis";
const configTemplateApi = apiInstance("userdb-manage", "userdb/configTemplate");
configTemplateApi.customerUrl1 = "/userdb-manage/userdb/configTemplate/listByCategory";
const dbInfoApi = apiInstance("userdb-manage", "dbsearch/dbinfo");
dbInfoApi.customerUrl1 = "/userdb-manage/dbsearch/dbinfo/openConn";
dbInfoApi.customerUrl2 = "/userdb-manage/dbsearch/dbinfo/getDbInfoByUser";
dbInfoApi.customerUrl3 = "/userdb-manage/dbsearch/dbinfo/tableList";
dbInfoApi.customerUrl4 = "/userdb-manage/dbsearch/dbinfo/tableColumns";

/**
 * 使用 createDataAdapter / createParamDataAdapter 简化配置
 *
 * 关键区分：
 *   - 如果请求函数已经返回 SelectOption[]（如 loadSystemInfo、loadRolesInfo），直接用函数引用
 *   - 如果请求函数返回原始 axios 响应，且数据需要字段映射，用 createXxxAdapter
 *   - 如果组件通过 props.label/value 自行映射字段，直接透传原始数据即可
 */
const optional = ref<FormConfig>({
  model: "full",
  api: api,
  configTemplateApi: configTemplateApi,
  dbInfoApi:dbInfoApi,
  primaryKey: "idDynamicForm",
  permissions: {
    "add": "add",
    "edit": "edit",
    "view": "view",
  },
  batchCreatePage: true,
  // 字典：loadDict 已返回 SelectOption[]，直接引用
  loadDicts: (dictName: string) => loadDict(dictName),
  // 菜单：permissionMenus 返回原始响应，组件通过 props.label/value 自行映射字段，直接透传 data.data
  loadMenuList: (appId: string) => {
    if (!appId) return Promise.resolve([]);
    return permissionMenus({}, appId).then((res: any) => res.data?.data ?? []);
  },
  // 应用列表：loadSystemInfo 已返回 SelectOption[]，直接引用
  loadAppList: () => loadSystemInfo(
      [{propertyName: "statusCode", value: "1"}],
      `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
  ),
  // 角色列表：loadRolesInfo 已返回 SelectOption[]，直接引用
  loadRolesList: () => loadRolesInfo([]),
  // 表字段：getRequest 返回原始响应，需要适配器提取 data.data 并映射字段
  loadTableColumns: createBiParamDataAdapter(
      (dataSourceId, tableName) => getRequest(`/userdb-manage/dbsearch/dbinfo/tableColumns/${dataSourceId}/${tableName}`),
      {name: "comment", value: "fieldName"},
  ),
  // 静态数据源列表
  loadDbList: () => Promise.resolve(dbListData),
});
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
        if (res.data.code != 0) {
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
      @loadMenu="loadMenu"
      @saveData="saveData"
      @changeDataHandle="changeDataHandle"
      @loadTableColumns="loadTableColumns"
  />
</template>

<style scoped lang="scss"></style>
