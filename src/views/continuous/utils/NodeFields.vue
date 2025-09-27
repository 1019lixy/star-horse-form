<script setup lang="ts">
import {computed, ModelRef, nextTick, onMounted, PropType, provide, ref, unref, watch} from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  FieldInfo,
  formFieldMapping,
  loadGetData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  TabFieldInfo,
  warning
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {useContinusConfigStore} from "@/store/ContinusConfig";
import {advancedFormFields} from "@/views/continuous/utils/ToolsParams.js";

let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const props = defineProps({
  formNo: {type: String},
  nodeInfo: {type: Object as PropType<any>, required: true},
  staticFieldData: {type: Object as PropType<PageFieldInfo>},
  compSize: {type: String, default: "default"},
});
const continuousStore = useContinusConfigStore(piniaInstance);
const errorMsg = ref(i18n("continuous.dataLoading"));
let searchFormData = ref<SearchFields | any>({});
const tabList = ref<TabFieldInfo[] | any>([]);

const nodeFormRef = ref();
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
let formFields = ref<Array<FieldInfo>>([]);
provide("formFields", formFields);
let outerFormData: ModelRef<any> = defineModel("dataForm");
const subNodeDialog = ref<boolean>(false);
const currentTabName = ref<string>("");
const tableFieldList = computed(() => {
  const temp = unref(tabList);
  return {
    fieldList: [{
      addable: props.nodeInfo.nodeCode != "PipelineCfg",
      closable: true,
      fieldName: currentTabName,
      tabList: temp,
      actions: {
        tabAdd: (data: any) => {
          subNodeDialog.value = true;
        },
        tabChange:(data: any) => {
          // changeFieldVisible();
        },
        close: (data: any) => {
          outerFormData.value["subNodeList"] = outerFormData.value["subNodeList"].filter(item => item.id != data.id);
          currentTabName.value = outerFormData.value["subNodeList"][0].nodeCode;
        }
      }
    }]
  };
});
const changeToDefault = (tempFormList: any) => {
  formFields.value = formFieldMapping({
    fieldList: [tempFormList],
  })?.formFields;
  changeFieldVisible();
};
const changeFieldVisible = () => {
  formFields.value?.forEach(item => {
    if (!["successReport", "errorReport"].includes(item.fieldName)) {
      item.formVisible = false;
    }
  });
}
const advancedFormFieldsList = async (advancedFormNo: string) => {
  let tempFormList: any = {};
  if (!advancedFormNo) {
    tempFormList = advancedFormFields([]);
  } else {
    let cacheData = continuousStore.getNodeFields(advancedFormNo);
    if (cacheData) {
      tempFormList = advancedFormFields(cacheData["tableFieldList"].fieldList);
    } else {
      let newVar = await loadFormFields(advancedFormNo);
      continuousStore.addNodeFields(advancedFormNo, newVar);
      tempFormList = advancedFormFields(newVar.data["tableFieldList"].fieldList);
    }
  }
  changeToDefault(tempFormList);
  return tempFormList;
};
/**
 * 数据赋值
 * @param data
 * @param nodeInfo
 * @param subNodeFlag
 */
const assignField = async (data: any, nodeInfo?: any, subNodeFlag?: boolean) => {
  dataUrl.value = apiInstance(
      data["dataUrl"].appName,
      data["dataUrl"].contextUrl,
  );
  const fieldList = data["tableFieldList"].fieldList;
  if (!fieldList.find(item => item.collapseFlag?.includes("advancedSetting"))) {
    const tempFormList = await advancedFormFieldsList(nodeInfo?.advancedFormNo);
    fieldList.push(tempFormList);
  } else {
    changeToDefault(fieldList[fieldList.length - 1]);
  }

  if (subNodeFlag) {
    tabList.value.push({
      title: nodeInfo?.nodeName,
      objectName: nodeInfo?.nodeCode,
      tabName: nodeInfo?.nodeCode,
      primaryKey: data["primaryKey"],
      disabled: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: nodeInfo?.id,
      fieldList: fieldList,
    });
    currentTabName.value = nodeInfo?.nodeCode;
  } else {
    tabList.value.push({
      title: outerFormData.value?.nodeName || props.nodeInfo.nodeName,
      objectName: props.nodeInfo.nodeCode,
      tabName: props.nodeInfo.nodeCode,
      primaryKey: data["primaryKey"],
      disabled: false,
      closable: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: props.nodeInfo?.id,
      fieldList: fieldList,
    });
    currentTabName.value = props.nodeInfo?.nodeCode;
  }
};
const resetField = () => {
  dataUrl.value = apiInstance("", "");
  searchFormData.value = {
    fieldList: [],
  };
  relationTables.value = {};
  rules.value = {};
  formInfo.value = {};

};
const loadFormFields = async (formNo: string) => {
  return await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formNo}`,);
};
const loadFormData = async (formNo: string, nodeInfo?: any, subNodeFlag?: boolean) => {
  if (!formNo) {
    resetField();
    return;
  }
  let cacheData = continuousStore.getNodeFields(formNo);
  if (cacheData) {
    assignField(cacheData, nodeInfo, subNodeFlag);
    return;
  }
  let {data, error} = await loadFormFields(formNo);
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    resetField();
    closeLoad();
    return;
  }
  assignField(data, nodeInfo, subNodeFlag);
  continuousStore.addNodeFields(formNo, data);
  await nextTick();
  closeLoad();
};


const resetForm = () => {
  tabList.value = [];
  // 清除表单数据，避免显示被删除节点的信息
  // 重置其他相关数据
  resetField();
};
const init = async () => {
  if (!props.formNo && !props.staticFieldData) {
    warning("NodeFields组件缺少参数");
    return;
  }
  if (props.staticFieldData?.fieldList?.length > 0) {
    let tempFieldList = props.staticFieldData!.fieldList;
    if (!tempFieldList.find(item => item.collapseFlag?.includes("advancedSetting"))) {
      const tempFormData = await advancedFormFieldsList(props.nodeInfo?.advancedFormNo);
      tempFieldList.push(tempFormData);
      console.log("init staticFieldData", tempFieldList);
    }
    tabList.value.push({
      title: outerFormData.value?.nodeName || props.nodeInfo?.nodeName,
      objectName: props.nodeInfo.nodeCode,
      tabName: props.nodeInfo.nodeCode,
      primaryKey: props.staticFieldData!.primaryKey,
      disabled: false,
      closable: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: props.nodeInfo?.id,
      fieldList: tempFieldList,
    });
    currentTabName.value = props.nodeInfo?.nodeCode;
  } else {
    await loadFormData(props.formNo!);
  }
  outerFormData.value["subNodeList"]?.forEach((node: any) => {
    loadFormData(node.dynamicFormNo, node, true);
  });
};
const dataSubmit = async (node: any) => {
  const formNo = node.dynamicFormNo;
  if (!formNo) {
    warning("该节点没有配置表单信息");
    return;
  }
  await loadFormData(formNo, node, true);
  if (!outerFormData.value["subNodeList"]) {
    outerFormData.value["subNodeList"] = [];
  }
  outerFormData.value["subNodeList"].push(node);
  closeAction();
};
const closeAction = () => {
  subNodeDialog.value = false;
};
onMounted(async () => {
  await init();

});
watch(
    () => props.nodeInfo.id,
    () => {
      resetForm();
      init();
    },
    {deep: true},
);
defineExpose({
  resetForm,
});
</script>
<template>
  <NodeDialog :visible="subNodeDialog" @save="dataSubmit" @close="closeAction"/>
  <star-horse-form-item
      :compUrl="dataUrl"
      :dynamicForm="true"
      ref="nodeFormRef"
      :compSize="compSize"
      :globalCondition="relationTables"
      v-model:dataForm="outerFormData"
      :fieldList="tableFieldList"
      :rules="rules"
  />
</template>
<style scoped></style>
