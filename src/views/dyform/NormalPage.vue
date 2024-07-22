<script setup lang="ts">
import {computed, nextTick, onMounted, provide, reactive, ref, watch} from "vue";
import {closeLoad, getMenuId, load, loadGetData, loadPagePermission} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {SearchProps} from "@/components/types/SearchProps";
import {Config} from "@/api/settings.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
let designForm = DesignForm(piniaInstance);
const normalPageRef = ref();
let relationTables = ref<any>({});
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
let searchFormData = ref<SearchProps[]>([]);
const tableFieldList = ref<any>({
      fieldList: [],
    })
;
/**
 * 表单数据直接取定义的数据preps,
 * 列表数据重新定义，方便排序和位置拖拽
 */
const primaryKey = ref<string>("");
const rules = ref<any>({});
const hasData = ref<boolean>(true);
const formInfo = ref<any>({});
const props = defineProps({
  param: {type: String, required: true},
});
const clear = () => {
  hasData.value = false;
};
const loadFormData = async (formId: string) => {
  let {data, error} = await loadGetData(`/userdb-manage/userdb/dynamicForm/dynamicPageInfo/${formId}`
  );
  if (error) {
    errorMsg.value = error;
    clear();
    closeLoad();
    return;
  }
  hasData.value = data && Object.keys(data).length > 0;
  dataUrl.value = data["dataUrl"] as ApiUrls;
  searchFormData.value = data["searchFormData"] as SearchProps[];
  primaryKey.value = data["primaryKey"];
  tableFieldList.value = data["tableFieldList"];
  rules.value = data["rules"];
  formInfo.value = data["formInfo"];
  relationTables.value = data["relationTables"];
  await nextTick();
  closeLoad();
  normalPageRef.value?.init();
};
watch(
    () => props.param,
    (val) => {
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
const dataFormat = (name: string, cellValue: Object, row: any): any => {
  // console.log(name, cellValue);
  return cellValue;
};
const loadPermission = async () => {
  permissions.value = await loadPagePermission(getMenuId());
};
const init = async () => {
  designForm.setIsEdit(false);
  await loadPermission();
  await loadFormData(props.param);
}
onMounted(async () => {
  await init();
});
watch(() => props.param,
    () => {
      loadPermission();
    }, {
      immediate: false
    })
</script>
<template>
  <template v-if="hasData">
    <star-horse-dialog
        :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible"
        :dialogProps="dialogProps"
    >
      <star-horse-form v-model:data-form="dataForm" @refresh="normalPageRef.loadByPage()" :compUrl="dataUrl"
                       :fieldList="tableFieldList"
                       :rules="rules" :globalCondition="relationTables" :dynamicForm="true"/>
    </star-horse-dialog>
    <star-horse-dialog
        :dialog-visible="dialogProps.viewVisible"
        :dialogProps="dialogProps"
        :title="'查看数据'"
        :is-view="true"
    >
      <star-horse-data-view
          :dataFormat="dataFormat"
          :field-list="tableFieldList"
          :globalCondition="relationTables"
          :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
        <star-horse-search-comp @searchData="(data:any)=>normalPageRef.createCreateParams(data)"
                                :formData="searchFormData"
                                :compUrl="dataUrl"/>
        <hr/>
        <star-horse-button-list :permissions="permissions" @tableCompFunc="(fun:any)=>normalPageRef.tableCompFunc(fun)"
                                :compUrl="dataUrl"
                                :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
      </div>
      <hr>
      <star-horse-table-comp :permissions="permissions"
                             ref="normalPageRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                             :compUrl="dataUrl" :showBatchField="true" :dataFormat="dataFormat"/>
    </el-card>
  </template>
  <el-empty :content="errorMsg" v-else></el-empty>
</template>
<style lang="scss" scoped></style>
