<script setup lang="ts">
import {computed, ModelRef, nextTick, onMounted, PropType, provide, ref, shallowRef, unref, watch} from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  FieldInfo,
  formFieldMapping,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  TabFieldInfo,
  uuid,
  warning
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {useContinusConfigStore} from "@/store/ContinusConfig";
import {advancedFormFields} from "@/views/continuous/utils/ToolsParams";
import {loadFormFields} from "@/views/continuous/utils/PipelinetCfg";

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
let formFields = shallowRef<Array<FieldInfo>>([]);
provide("formFields", formFields);
let outerFormData: ModelRef<any> = defineModel("dataForm");
const subNodeDialog = ref<boolean>(false);
const currentTabName = ref<string>("");
const tableFieldList = computed(() => {
  const temp = unref(tabList);
  if (Object.keys(temp).length > 0) {
    changeToDefault(temp[0].fieldList[temp[0].fieldList.length - 1]);
  }
  return {
    fieldList: [{
      addable: props.nodeInfo.nodeCode != "PipelineCfg",
      closable: true,
      fieldName: currentTabName,
      groupData: true,
      tabList: temp,
      actions: {
        tabAdd: (data: any) => {
          subNodeDialog.value = true;
        },
        tabChange: (data: any) => {
          let fieldList = temp.find((item: any) => item.tabName == data)?.fieldList;
          changeToDefault(fieldList[fieldList.length - 1]);
        },
        close: (data: any) => {
          props.nodeInfo["subNodeInfoList"] = props.nodeInfo["subNodeInfoList"].filter((item: any) => item.idNodeInfo != data.idNodeInfo);
          currentTabName.value = props.nodeInfo["subNodeInfoList"].length > 0 ? props.nodeInfo["subNodeInfoList"][0].nodeCode : props.nodeInfo.nodeCode;
        }
      }
    }]
  };
});
const changeToDefault = (tempFormList: any) => {
  formFields.value = formFieldMapping({
    fieldList: Array.isArray(tempFormList) ? tempFormList : [tempFormList],
  })?.formFields;
};

const advancedFormFieldsList = async (advancedDynamicFormNo: string) => {
  let tempFormList: any = {};
  if (!advancedDynamicFormNo) {
    tempFormList = advancedFormFields([]);
  } else {
    let cacheData = continuousStore.getNodeFields(advancedDynamicFormNo);
    if (cacheData) {
      tempFormList = advancedFormFields(cacheData["tableFieldList"].fieldList);
    } else {
      let newVar = await loadFormFields(advancedDynamicFormNo);
      continuousStore.addNodeFields(advancedDynamicFormNo, newVar);
      tempFormList = advancedFormFields(newVar.data["tableFieldList"].fieldList);
    }
  }
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
  if (!fieldList.find((item: any) => item.collapseFlag?.includes("advancedSetting"))) {
    const tempFormList = await advancedFormFieldsList(nodeInfo?.advancedDynamicFormNo);
    fieldList.push(tempFormList);
  }
  //节点的执行触发条件
  if (!fieldList.find((item: any) => item.fieldName == "nodeTriggerCondition")) {
    fieldList.splice(0, 0, {
      fieldName: "nodeTriggerCondition",
      fieldType: "select",
      label: "执行条件",
      required: true,
      formVisible: true,
      defaultValue: nodeInfo?.nodeTriggerCondition || "auto",
      preps: {
        dataSource: "dict",
        urlOrDictName: "nodeTriggerCondition"
      }
    });
  }
  if (subNodeFlag) {
    tabList.value.push({
      title: nodeInfo?.nodeName,
      objectName: "nodeParams",
      tabName: nodeInfo?.nodeCode,
      primaryKey: data["primaryKey"],
      disabled: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: nodeInfo?.idNodeInfo,
      fieldList: fieldList,
    });
  } else {
    tabList.value.push({
      title: outerFormData.value?.nodeName || props.nodeInfo.nodeName,
      objectName: "nodeParams",
      tabName: props.nodeInfo.nodeCode,
      primaryKey: data["primaryKey"],
      disabled: false,
      closable: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: props.nodeInfo?.idNodeInfo,
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

const loadFormData = async (formNo: string, nodeInfo?: any, subNodeFlag?: boolean) => {
  if (!formNo) {
    resetField();
    return;
  }
  let cacheData = continuousStore.getNodeFields(formNo);
  if (cacheData) {
    await assignField(cacheData, nodeInfo, subNodeFlag);
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
  await assignField(data, nodeInfo, subNodeFlag);
  continuousStore.addNodeFields(formNo, data);
  await nextTick();
  closeLoad();
};


const resetForm = () => {
  formFields.value = [];
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
    if (!tempFieldList.find((item: any) => item.collapseFlag?.includes("advancedSetting"))) {
      const tempFormData = await advancedFormFieldsList(props.nodeInfo?.advancedDynamicFormNo);
      tempFieldList.push(tempFormData);
    }
    tabList.value.push({
      title: outerFormData.value?.nodeName || props.nodeInfo?.nodeName,
      objectName: props.nodeInfo.nodeCode,
      tabName: props.nodeInfo.nodeCode,
      primaryKey: props.staticFieldData!.primaryKey,
      disabled: false,
      closable: false,
      subFormFlag: "N",
      tableFlag: "N",
      id: props.nodeInfo?.idNodeInfo,
      fieldList: tempFieldList,
    });
    currentTabName.value = props.nodeInfo?.nodeCode;
  } else {
    await loadFormData(props.formNo!, props.nodeInfo, false);
  }
  props.nodeInfo["subNodeInfoList"]?.forEach((node: any) => {
    loadFormData(node.dynamicFormNo, node, true);
  });
};
const dataSubmit = async (pnode: any) => {
  let node = JSON.parse(JSON.stringify(pnode));
  node["idNodeInfo"] = uuid();
  const formNo = node.dynamicFormNo;
  if (!formNo) {
    warning("该节点没有配置表单信息");
    return;
  }
  await loadFormData(formNo, node, true);
  if (!props.nodeInfo["subNodeInfoList"]) {
    props.nodeInfo["subNodeInfoList"] = [];
  }
  props.nodeInfo["subNodeInfoList"].push(node);
  closeAction();
};
const closeAction = () => {
  subNodeDialog.value = false;
};
onMounted(async () => {
  await init();

});
watch(
    () => props.nodeInfo.idNodeInfo,
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
      :key="nodeInfo.idNodeInfo"
      :compSize="compSize"
      :globalCondition="relationTables"
      :dataForm="outerFormData"
      :fieldList="tableFieldList"
      :rules="rules"
  />
</template>
<style scoped></style>
