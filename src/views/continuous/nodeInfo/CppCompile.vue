<script setup lang="ts" name="JavaCompile">
import {onMounted, reactive, ref, PropType, nextTick} from "vue";
import {SelectOption} from "@/components/types/SearchProps";
import {loadData} from "@/api/star_horse_utils.ts";
import {FieldInfo, PageFieldInfo} from "@/components/types/PageFieldInfo";
import ToolInfo from "@/views/continuous/ToolInfo.vue";
import {warning} from "@/utils/message.ts";

const props = defineProps({
  //节点信息
  nodeInfo: {type: Object as PropType<any>, required: true}
})
const javaCompileRef = ref();
const toolInfoRef = ref();
let repoList = ref<SelectOption[]>([]);
const nodeDialog = ref<boolean>(false);
let currentTabName = ref<string>("tab1");
let subNodeFieldList = ref<FieldInfo[]>([]);
//页面属性
const fieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      addable: "Y",
      addActions: () => {
        addSubNode();
      },
      closable: "Y",
      fieldName: currentTabName,
      tabList: subNodeFieldList
    }

  ]
});
const getFormData = () => {
  return javaCompileRef.value?.getFormData();
};
const setFormData = (data: any) => {
  nextTick(() => {
    javaCompileRef.value?.setFormData(data);
  })

};
const addSubNode = () => {
  nodeDialog.value = true;
};
const closeAction = () => {
  nodeDialog.value = false;
};
const dataSubmit = () => {
  let node = toolInfoRef.value.getNode();
  if (!node) {
    warning("请先选择要配置的节点");
    return;
  }
  let len = subNodeFieldList.value.length + 1;
  subNodeFieldList.value.push({
    title: "节点" + len,
    tabName: "tab" + len,
    subFormFlag: "N",
    objectName: "sub" + len,
    fieldList: [
      {
        label: "",
        type: "usercomp",
        formVisible: true,
        fieldName: "SubNodeInfo",
        params: {
          totalTab: len
        }
      }
    ]
  });
  currentTabName.value = "tab" + len;
  closeAction();
};
const init = async () => {
  subNodeFieldList.value.push({
    title: "节点一",
    tabName: "tab1",
    subFormFlag: "N",
    objectName: "sub",
    fieldList: [
      {
        label: "",
        type: "usercomp",
        formVisible: true,
        fieldName: "SubNodeInfo",
        params: {
          totalTab: 1
        }
      }
    ]
  });
  let redata = await loadData("/continuous-manage/continuous/baseInfo/repoTypes", {});
  repoList.value = redata?.data;
  setFormData(props.nodeInfo);
};
const valid = async () => {
  console.log("valid");
  try {
    return await javaCompileRef.value?.$refs.starHorseFormRef.validate();
  } catch (e) {
    console.log(e);
    return false;
  }

};
onMounted(async () => {
  await init();
});
defineExpose({
  getFormData,
  setFormData,
  valid
});
</script>

<template>
  <star-horse-dialog
      :title="'节点列表'"
      :dialogVisible="nodeDialog"
      :self-func="true"
      @closeAction="closeAction"
      @merge="dataSubmit"
      :is-batch="false"
      :is-show-btn-continue="false"
  >
    <ToolInfo ref="toolInfoRef"/>
  </star-horse-dialog>
  <star-horse-form ref="javaCompileRef" class="build-cfg" :fieldList="fieldList"/>
</template>

<style scoped lang="scss">
.build-cfg {
  height: 100%;
}
</style>
