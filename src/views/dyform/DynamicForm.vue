<script lang="ts" setup name="DynamicForm">
import {nextTick, onMounted, ref, watch,} from "vue";

import {
  apiInstance,
  closeLoad,
  error,
  load,
  loadData,
  piniaInstance,
  postRequest,
  success,
  useButtonPermissionStore,
  warning,
} from "star-horse-lowcode";
import {useRoute, useRouter} from "vue-router";
import {i18n} from "@/lang/index";
import {ToolBtnType} from "@/components/types/ToolBtnType";

const api = apiInstance("userdb-manage", "userdb/dynamicForm");
let route = useRoute();
let router = useRouter();
let pagePermission = useButtonPermissionStore(piniaInstance);
let permissions = ref<any>({});
const starHorseFormDesignRef = ref();

const goBack = () => {
  let sdata = {
    path: "/dyform/DynamicFormUi",
    componentName: "DynamicFormUi",
  };
  router.push(sdata);
};
const extendBtns = ref<ToolBtnType[]>([
  {
    icon: "return",
    defaultEdit: true,
    key: "goBack",
    auth: "none",
    label: i18n("dyform.action.goBack"),
    action: goBack
  },
]);
const init = async () => {
  //初始化数据
  starHorseFormDesignRef.value?.initStoreData();
  //加载权限
  permissions.value = await pagePermission.addRoute(route);
};

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
    dynamicFormData["sysId"] = undefined;
    dynamicFormData["templateFlag"] = undefined;
    details["createdBy"] = undefined;
    details["updatedBy"] = undefined;
    details["createdTime"] = undefined;
    details["updatedTime"] = undefined;
  }
  dynamicFormData["details"] = {};
  const compList = JSON.parse(details?.content || "[]");
  const formData = JSON.parse(details?.fieldNames || "{}");
  starHorseFormDesignRef.value?.setFormInfo(compList, dynamicFormData, formData, true);
};

const analysisParentParam = () => {
  let parentId = route.query["parentId"];
  if (parentId && "0" != parentId) {
    loadFormData(parentId, true);
  }
};

const analysisQueryParams = () => {
  let formId = route.query["formId"];
  if (formId) {
    loadFormData(formId, false);
    return;
  }
  analysisParentParam();
};

const loadTemplateData = (formId: string) => {
  loadFormData(formId, false, true);
};
const closeAction = () => {
  starHorseFormDesignRef.value?.closeAction();
};

const saveData = (isDraft: boolean, data: any) => {
  load("数据提交中，请等待");
  postRequest(
      `${api.basePrefix}/${isDraft ? "mergeDraft" : "merge"}`,
      data,
  )
      .then((res: any) => {
        if (res.data.code != 0) {
          warning(res.data.cnMessage);
          return;
        }
        closeAction();

        success(res.data.cnMessage);
      })
      .catch((err: any) => {
        closeAction();
        error("操作异常:" + err);
      })
      .finally(() => {
        closeLoad();
      });
};
watch(
    () => route.query,
    (val) => {
      if (val) {
        analysisQueryParams();
      }
    },
    {immediate: true, deep: true},
);

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
  } else if (type == "edit") {
    loadFormData(formId, false);
  } else {
    console.log(type, data);
  }
};

onMounted(async () => {
  await init();
});


defineExpose({
  loadFormData,
  loadTemplateData
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <el-card class="inner_content my-0 mx-[5px]">
      <StarHorseFormDesign ref="starHorseFormDesignRef" @saveData="saveData"
                           :extendBtns="extendBtns"
                           :api="api"
                           @changeDataHandle="changeDataHandle"
                           :permissions="permissions"/>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>

</style>
