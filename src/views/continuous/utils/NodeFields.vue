<script setup lang="ts">
import {computed, ModelRef, nextTick, onMounted, PropType, provide, reactive, ref, unref, watch} from "vue";
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  dialogPreps,
  loadGetData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  TabFieldInfo,
  warning
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {useContinusConfigStore} from "@/store/ContinusConfig";

let dataUrl = ref<ApiUrls>(apiInstance("", ""));
const props = defineProps({
  formNo: {type: String},
  nodeInfo: {type: Object as PropType<any>, required: true},
  staticFieldData: {type: Object as PropType<PageFieldInfo>},
  compSize: {type: String, default: "default"},
});
const continuousStore = useContinusConfigStore(piniaInstance);
const errorMsg = ref(i18n("continuous.dataLoading"));
let searchFormData = ref<SearchFields>({});
const tabList = ref<TabFieldInfo[]>([]);

const nodeFormRef = ref();
const rules = ref({});
const hasData = ref(false);
let relationTables = ref<any>({});
const formInfo = ref<any>({});
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
        close: (data: any) => {
          outerFormData.value["subNodeList"] = outerFormData.value["subNodeList"].filter(item => item.id != data.id);
          currentTabName.value = outerFormData.value["subNodeList"][0].nodeCode;
        }
      }
    }]
  };
});
/**
 * 数据赋值
 * @param data
 * @param nodeInfo
 * @param subNodeFlag
 */
const assignField = (data: any, nodeInfo?: any, subNodeFlag?: boolean) => {
  dataUrl.value = apiInstance(
      data["dataUrl"].appName,
      data["dataUrl"].contextUrl,
  );
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
      fieldList: data["tableFieldList"].fieldList,
    });
    currentTabName.value = nodeInfo?.nodeCode;
  } else {
    tabList.value.push({
      title:  outerFormData.value?.nodeName||props.nodeInfo.nodeName,
      objectName: props.nodeInfo.nodeCode,
      tabName: props.nodeInfo.nodeCode,
      primaryKey: data["primaryKey"],
      disabled: false,
      closable: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: props.nodeInfo?.id,
      fieldList: data["tableFieldList"].fieldList,
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
    assignField(cacheData, nodeInfo, subNodeFlag);
    return;
  }
  let {data, error} = await loadGetData(
      `/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formNo}`,
  );
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
watch(
    () => props.nodeInfo.id,
    () => {
      // 当节点ID变化时，先重置表单再初始化
      resetForm();
      init();
    },
    {deep: true},
);

// 监听formNo变化，如果变为空则重置表单
watch(
    () => props.formNo,
    (newFormNo, oldFormNo) => {
      if (!newFormNo && oldFormNo) {
        resetForm();
      }
    }
);


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
    tabList.value.push({
      title: outerFormData.value?.nodeName||props.nodeInfo?.nodeName,
      objectName: props.nodeInfo.nodeCode,
      tabName: props.nodeInfo.nodeCode,
      primaryKey: props.staticFieldData!.primaryKey,
      disabled: false,
      closable: false,
      subFormFlag: "Y",
      tableFlag: "N",
      id: props.nodeInfo?.id,
      fieldList: props.staticFieldData!.fieldList,
    });
    currentTabName.value = props.nodeInfo?.nodeCode;
  } else {
    await loadFormData(props.formNo!);
  }
  outerFormData.value["subNodeList"]?.forEach(node => {
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
