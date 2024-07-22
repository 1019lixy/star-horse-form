<script setup lang="ts">
import {nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {closeLoad, getMenuId, load, loadGetData, loadPagePermission} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {useRouter} from "vue-router";
import {DialogProps} from "@/components/types/DialogProps";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {TabsPaneContext} from "element-plus";
import {Config} from "@/api/settings.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
let designForm = DesignForm(piniaInstance);
const starHorseTableCompRef = ref();
const dataUrl = ref<ApiUrls>({
  uploadUrl: "",
  batchMergeDraftUrl: "",
  batchMergeUrl: "",
  deleteUrl: "",
  downloadTemplateUrl: "",
  exportAllUrl: "",
  loadByIdUrl: "",
  loadByPageUrl: "",
  mergeDraftUrl: "",
  mergeUrl: "",
  importUrl: "",
  userConditionUrl: ""
});
const errorMsg = ref("数据加载中");
let searchFormData = ref<SearchProps[]>();
const tableFieldList = ref<PageFieldInfo>({
      fieldList: [],
    })
;
const primaryKey = ref("");
const rules = ref({});
const hasData = ref(false);
const formInfo = ref<any>({});
const activeName = ref<string>("form");
const props = defineProps({
  param: {type: String, required: true},
});
const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
}
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`
  );
  if (error) {
    errorMsg.value = error;
    hasData.value = false;
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  console.log(hasData);
  dataUrl.value = data["dataUrl"] as ApiUrls;
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"] as PageFieldInfo;
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
  await nextTick();
  closeLoad();
  starHorseTableCompRef.value!.init();
};
watch(
    () => props.param,
    (val) => {
      clear();
      try {
        load("数据加载中。。。");
        loadFormData(<string>val);
      } catch (e) {
        closeLoad();
        console.log("数据类型不匹配");
      }
    },
    {deep: true}
);
const dataForm = ref({});
provide("dataForm", dataForm);
//记录表单的属性
const formFields = reactive<Array<any>>([]);
provide("formFields", formFields);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false,
  bakeVisible2: false,
  bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);
let permissions = ref<any>({});
const init = async () => {
  designForm.setIsEdit(false);
  permissions.value = await loadPagePermission(getMenuId())
  await loadFormData(props.param);
}
const dataFormat = (name: string, cellValue: Object): any => {
  return cellValue;
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :title="'查看数据'"
        :is-view="true"
    >
      <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-tabs v-model="activeName" type="border-card" @tab-click="handleClick">
        <el-tab-pane label="表单" name="form">
          <sh-dynamic-form @refresh="starHorseTableCompRef?.loadByPage()" :compUrl="dataUrl" :formInfo="formInfo"
                           :fieldList="tableFieldList['dynamicFormas']" :rules="rules" :typeModel="'tab'"/>
        </el-tab-pane>
        <el-tab-pane label="数据列表" name="table">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data:any)=>starHorseTableCompRef.createCreateParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list :permissions="permissions"
                                    @tableCompFunc="(fun:any)=>starHorseTableCompRef.tableCompFunc(fun)"
                                    :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp :permissions="permissions"
                                 ref="starHorseTableCompRef"
                                 :fieldList="tableFieldList"
                                 :primaryKey="primaryKey"
                                 :compUrl="dataUrl"
                                 :showBatchField="true"
                                 :dataFormat="dataFormat"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </template>
</template>
<style scoped></style>
