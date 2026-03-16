<script lang="ts" setup>
import {apiInstance, getRequest, postRequest, SelectOption,loadData,warning} from "star-horse-lowcode";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import { ref,nextTick } from "vue";
import {FormConfig} from "@/components/types";
import {useRoute} from "vue-router";
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
/**
 * 需要逐步的把StarHorseFormDesign 需要的参数给拎出来,
 */
const api = apiInstance("userdb-manage", "userdb/dynamicForm");
const optional:FormConfig={
  model:"full",
  primaryKey:"idDynamicForm",
  api:api,
  shotProps:{
    value:"idDynamicForm",
    label:"formName",
  }
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
</script>

<template>
  <StarHorseFormDesign
    ref="starHorseFormDesignRef"
    :optional="optional"
    @loadMenu="loadMenu"
    @changeDataHandle="changeDataHandle"
    @loadTableColumns="loadTableColumns"
  />
</template>

<style scoped lang="scss"></style>
