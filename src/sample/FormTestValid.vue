<script lang="ts" setup>
import {
  apiInstance, closeLoad,
  deleteByIds, error,
  getRequest,
  load,
  loadData,
  postRequest,
  SelectOption, success,
  warning
} from "star-horse-lowcode";
import StarHorseFormDesign from "@/components/system/StarHorseFormDesign.vue";
import {nextTick, ref} from "vue";
import {FormConfig} from "@/components/types";
import {useRoute} from "vue-router";
import {
  dbConfigList,
  getUserInfo,
  loadDict,
  loadRolesInfo,
  loadSystemInfo,
  permissionMenus
} from "@/sample/utils/formapi";
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
/**
 * 需要逐步的把StarHorseFormDesign 需要的参数给拎出来,
 */
const api = apiInstance("userdb-manage", "userdb/dynamicForm");
const optional = ref<FormConfig>({
  model: "full",
  api: api,
  primaryKey: "idDynamicForm",
  permissions: {
    "add":"add",
    "edit":"edit",
    "view":"view"
  },
  hideConfigBtn: false,
  batchCreatePage: true,
  loadDicts: loadDict,
  forbiddenSystemItems: false,
  shotProps: {
    label: "formName",
    value: "idDynamicForm",
  },
  loadMenuList: (appId: string) => {
    return new Promise((executor, reject) => {
      if (!appId) {
        return executor([]);
      }
      permissionMenus({}, appId)
          .then((res: any) => {
            executor(res.data.data);
          })
          .catch((e) => {
            reject(e);
          });
    });
  },
  loadAppList: () => {
    return new Promise((executor, reject) => {
      let params = [{propertyName: "statusCode", value: "1"}];
      loadSystemInfo(
          params,
          `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
      )
          .then((res: any) => {
            executor(res);
          })
          .catch((e) => {
            reject(e);
          });
    });
  },
  loadRolesList: () => {
    return new Promise((executor, reject) => {
      loadRolesInfo([])
          .then((res: any) => {
            executor(res);
          })
          .catch((e) => {
            reject(e);
          });
    });
  },
  loadTableColumns: (dataSourceId: string, tableName: string) => {
    return new Promise((executor, reject) => {
      if (!tableName || !dataSourceId) {
        return executor([]);
      }
      const tableColumnsList: SelectOption[] = [];
      getRequest(
          `/userdb-manage/dbsearch/dbinfo/tableColumns/${dataSourceId}/${tableName}`,
      )
          .then((res: any) => {
            if (res.data.code != 0) {
              return;
            }
            let resData = res.data.data;
            resData.forEach((item: any) => {
              tableColumnsList.push({
                name: item.comment,
                value: item.fieldName,
              });
            });
            executor(tableColumnsList);
          })
          .catch((e) => {
            reject(e);
          });
    });
  },
  loadDbList: () => {
    return new Promise((executor, reject) => {
      executor([
            {
              "name" : "192.168.20.107(star_horse_devops)",
              "value" : "2"
            },
            {
              "name" : "10.10.10.27(db_dynamic)",
              "value" : "3"
            },
            {
              "name" : "10.10.10.27(doov_system_config)",
              "value" : "4"
            },
            {
              "name" : "10.10.10.27(doov_lean_materials)",
              "value" : "7"
            },
            {
              "name" : "10.10.10.27(workflow)",
              "value" : "5"
            },
            {
              "name" : "192.168.20.107(script_manage)",
              "value" : "8"
            },
            {
              "name" : "10.10.10.25(ORCLPDB1)",
              "value" : "91"
            },
            {
              "name" : "10.10.10.10(doovpackdb)",
              "value" : "90"
            },
            {
              "name" : "192.168.20.29(GdzcDB)",
              "value" : "130"
            },
            {
              "name" : "10.10.10.32(DVMES)",
              "value" : "133"
            },
            {
              "name" : "10.10.10.99(DVMES)",
              "value" : "134"
            },
            {
              "name" : "192.168.20.165(device_manage)",
              "value" : "137"
            },
            {
              "name" : "192.168.20.107(device_manage)",
              "value" : "6"
            },
            {
              "name" : "192.168.20.107(glue_manage)",
              "value" : "331718530636448765"
            },
            {
              "name" : "192.168.20.107(star_horse_workflow)",
              "value" : "337537414606095357"
            },
            {
              "name" : "192.168.20.107(star_horse_continuous)",
              "value" : "136"
            },
            {
              "name" : "10.10.10.32(dvmes)",
              "value" : "368615530598237181"
            },
            {
              "name" : "10.10.10.99(dvmes)",
              "value" : "368615668037190653"
            },
            {
              "name" : "192.168.20.6(TIMS_DOOV)",
              "value" : "370194292930511869"
            },
            {
              "name" : "192.168.20.207(quantity_manage)",
              "value" : "381167130139165693"
            }
      ]);
    });
  },
  extendButtons: [],
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
  load("数据提交中，请等待");
  postRequest(`${api.basePrefix}/${isDraft ? "mergeDraft" : "merge"}`, data)
      .then((res: any) => {
        if (res.data.code != 0) {
          warning(res.data.cnMessage);
          return;
        }
        success(res.data.cnMessage);
      })
      .catch((err: any) => {
        error("操作异常:" + err);
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
