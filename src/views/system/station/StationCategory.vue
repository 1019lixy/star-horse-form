<script lang="ts" name="StationSequence" setup>
import {
  nextTick,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam } from "@/utils/auth";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SearchParams,
  UserFuncInfo,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/stationSequence");
//主键
const primaryKey = "idStationSequence";
const stationSequenceRef = ref();
//定义表单的所有属性
const formFields = reactive<any>({});
const outerForm = ref<any>({});
provide("formFields", formFields);
let stationSequenceList = ref<Array<any>>([]);
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: i18n("system.add.child.node"),
    authority: "add",
    icon: "add",
    priority: 1,
    funcName: async (row: any) => {
      console.log(row);
      outerForm.value["parentId"] = row[primaryKey];
      dialogProps.editVisible = true;
      await nextTick();
    },
  },
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.name"),
      fieldName: "seqName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.code"),
      fieldName: "seqCode",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idStationSequence",

      required: true,
    },
    [
      {
        label: i18n("system.name"),
        fieldName: "seqName",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("system.code"),
        fieldName: "seqCode",

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          editDisabled: true,
        },
      },
    ],
    [
      {
        label: i18n("system.parent.node"),
        fieldName: "parentId",
        type: "tselect",
        required: false,
        formVisible: true,

        preps: {
          checkStrictly: true,
          data: stationSequenceList,
          props: {
            label: "seqName",
            value: "idStationSequence",
          },
        },
      },
      {
        label: i18n("system.sort"),
        fieldName: "seqSort",
        type: "number",
        defaultValue: 100,
        required: false,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: i18n("system.sequence.description"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
      required: false,
      formVisible: !true,
      listVisible: !true,
      preps: {
        dataSource: "dict",
        urlOrDictName: "public",
      },
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
  let params: SearchParams[] = [];
  let cond = createCondition("a.parentId", null, "is");
  cond.orOperList = [createCondition("a.parentId", "")];
  let result = await loadData(dataUrl.listConditionUrl!, {
    fieldList: params,
    orderBy: [{ fieldName: "seqSort", ascOrDesc: "asc" }],
  });
  if (result.error) {
    console.log(result.error);
    return;
  }
  stationSequenceList.value = result.data;
};
const activated = () => {
  initData();
};
const deactivated = () => {};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
      :isShowBtnContinue="true"
    >
      <star-horse-form
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outerForm"
        @refresh="stationSequenceRef?.loadByPage()"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="
            (data: any) => stationSequenceRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="stationSequenceRef"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :fieldList="tableFieldList"
        :extendBtns="extendBtns"
        :primaryKey="primaryKey"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
