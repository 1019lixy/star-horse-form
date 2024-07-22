<script setup lang="ts" name="DynamicForm">
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps"
import {computed, nextTick, onMounted, provide, reactive, ref} from "vue";
import {SearchProps} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {BtnAuth} from "@/components/types/BtnAuth";
import {useRouter} from "vue-router";
import {getMenuId, loadData, loadPagePermission} from "@/api/sh_api";
import {Config} from "@/api/settings.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
const router = useRouter();
const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/dynamicForm/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicForm/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicForm/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicForm/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicForm/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicForm/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicForm/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicForm/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicForm/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicForm/getAllByCondition",
  importUrl: "/userdb-manage/userdb/dynamicForm/importData",
  uploadUrl: ""
};
let designForm = DesignForm(piniaInstance);
let selfBtnFunc = ref<BtnAuth[]>([]);
let isPreview = ref<boolean>(false);
const closeAction = () => {
  isPreview.value = false;
  designForm.setIsEdit(true);
};
let formFieldList = ref<any>({});
let list = computed(() => designForm.compList);
const loadFormData = async (formId: any) => {
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + formId, {});
  await nextTick();
  isPreview.value = true;
  designForm.clearAll(false);
  designForm.setCompList(JSON.parse(data["details"].content));
  designForm.setFormFieldList(JSON.parse(data["details"].fieldNames));
  designForm.setIsEdit(false);
  data["details"] = {};
  designForm.setFormInfo(data);
}
const searchFormData = reactive<SearchProps[]>([
  {label: "表单名称", fieldName: "formName", defaultShow: true, type: "input", matchType: "lk"},
  {label: "创建时间", fieldName: "createDate", defaultShow: true, type: "date", matchType: "bt"},
]);
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键", fieldName: "idDynamicForm", type: "long",
    },
    {
      label: "表单名称", fieldName: "formName", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "标签长度", fieldName: "labelWidth", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "标签位置", fieldName: "labelPosition", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "表单域标签的后缀", fieldName: "labelSuffix", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "表单验证规则名称", fieldName: "rules", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "行内表单模式", fieldName: "inline", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否禁用该表单内的所有组件", fieldName: "disabled", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否隐藏必填字段标签旁边的红色星号", fieldName: "hideRequiredAsterisk", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "当校验失败时，滚动到第一个错误表单项", fieldName: "scrolToError", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "星号的位置", fieldName: "requireAsteriskPosition", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否在输入框中显示校验结果反馈图标", fieldName: "statusIcon", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否显示校验错误信息", fieldName: "showMessage", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否以行内形式展示校验信息", fieldName: "inlineMessage", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "是否在 rules 属性改变后立即触发一次验证", fieldName: "validateOnRuleChange", type: "input",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",
    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",
    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",
    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",
    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",
    },
    {
      label: "国际码", fieldName: "local", type: "input",
    },
  ],
  userTableFuncs: [{
    authority: "add", funcName: "addSubForm", btnName: "添加子表", funcName: (row) => {
      addSubForm(row);
    }
  }],
});
const primaryKey = "idDynamicForm";
const dynamicFormRef = ref();
const rules = {};
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  bakeVisible1: false,
  bakeVisible2: false,
  bakeVisible3: false,
  viewVisible: false
});
provide("dialogProps", dialogProps);let permissions = ref<any>({});
const addSubForm = (params: any) => {
  console.log(params);
  router.push({path: "/dyform/DynamicForm", query: {parentId: params.idDynamicForm}});
}
const dataFormat = (name: string, cellValue: any, row: any): any => {
  return cellValue == "Y" ? "是" : cellValue == "N" ? "否" : cellValue;
}
const initData = async () => {
  permissions.value = await loadPagePermission(getMenuId())
  selfBtnFunc.value?.push({
    labelName: "新增",
    btnName: "add", exec: () => {
      router.push("/dyform/DynamicForm");
    }
  });
  selfBtnFunc.value?.push({
    labelName: "编辑",
    btnName: "edit", exec: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({
        path: "/dyform/DynamicForm",
        query: {formId: params[primaryKey], parentId: params["parentId"] || 0}
      });
    }
  });
  selfBtnFunc.value?.push({
    labelName: "查看详情",
    btnName: "view", exec: (params: any) => {
      loadFormData(params[primaryKey]);
    }
  });
};
onMounted(async () => {
  await  initData();
})
</script>
<style lang="scss" scoped>
</style>
<template>
  <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :title="'表单预览'"
      :is-view="true"
  >
    <template v-for="data in list">
      <component
          :field="data"
          :formFieldList="formFieldList"
          :is="data?.itemType+'-container'"
          v-if="data?.compType==='container'"
      >
      </component>
      <component
          :field="data"
          :formFieldList="formFieldList"
          :is="data?.itemType + '-item'"
          v-else-if="data?.compType=='formItem'"
      />
    </template>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form v-model:data-form="dataForm" :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data:any)=>dynamicFormRef.createCreateParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list :permissions="permissions"  @tableCompFunc="(fun:any)=>dynamicFormRef.tableCompFunc(fun)" :selfBtnFunc="selfBtnFunc"
                              :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr>
    <star-horse-table-comp :permissions="permissions"   ref="dynamicFormRef" :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl=
        "dataUrl" :dataFormat="dataFormat" :selfBtnFunc="selfBtnFunc"/>
  </el-card>
</template>
