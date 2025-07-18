<script setup lang="ts" name="DynamicFormConsumerConfig">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  dictData,
  PageFieldInfo,
  SearchFields,
  SelectOption,
  UserFuncInfo,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import { Config } from "@/api/settings";

const router = useRouter();
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  "userdb-manage",
  "userdb/dynamicFormConsumerConfig",
);
let viewTypeList = ref<SelectOption[]>([]);
let auditList = ref<SelectOption[]>([
  { name: "是", value: "Y" },
  { name: "否", value: "N" },
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "视图名称",
      fieldName: "viewName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: "视图类别",
      fieldName: "viewType",
      defaultVisible: true,
      type: "select",
      preps: {
        values: viewTypeList,
      },
    },
    {
      label: "消费权限",
      fieldName: "consumeAuthority",
      defaultVisible: true,
      type: "select",
    },
    {
      label: "是否需要认证",
      fieldName: "isAudit",
      defaultVisible: true,
      type: "select",
      preps: {
        values: auditList,
      },
    },
  ],
});
const currentRow = ref<any>({});
const preview = (row: any, _currentPage: number, _pageSize: number) => {
  currentRow.value = row;
  dialogProps.bakeVisible1 = true;
};
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idConsumerConfig",
      type: "long",
      required: true,
    },
    {
      label: "视图Token",
      fieldName: "dataNo",

      listVisible: true,
    },
    {
      label: "视图名称",
      fieldName: "viewName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "视图类别",
      fieldName: "viewType",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "消费权限",
      fieldName: "consumeAuthority",

      formVisible: true,
      listVisible: true,
    },
    {
      label: "是否需要认证 ",
      fieldName: "isAudit",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "单次请求数据限制",
      fieldName: "dataLimits",
      type: "long",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "long",
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",

      listVisible: true,
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "date",
      listVisible: true,
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",

      listVisible: true,
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: "状态吗",
      fieldName: "statusCode",
    },
    {
      label: "状态名称",
      fieldName: "statusName",
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "long",
    },
    {
      label: "国际码",
      fieldName: "local",
    },
    {
      label: "备注",
      fieldName: "remark",

      formVisible: true,
      listVisible: true,
    },
  ],
  userTableFuncs: [
    {
      btnName: "数据预览",
      authority: "view",
      icon: "preview",
      priority: 3,
      funcName: (row: any) => preview(row, 1, 20),
    },
  ],
});
//主键
const primaryKey = "idConsumerConfig";
const dynamicFormConsumerConfigRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const selfBtnFunc = ref<UserFuncInfo[]>([]);
const expandBtns = ref<UserFuncInfo[]>([]);
const closeAction = () => {
  dialogProps.bakeVisible1 = false;
  currentRow.value = {};
};
//初始化方法
const initData = async () => {
  viewTypeList.value = await dictData("consumer_type");
  selfBtnFunc.value?.push({
    btnName: "新增",
    icon: "add",
    authority: "add",
    funcName: () => {
      router.push("/dyform/DataConsumerConfig");
    },
  });
  expandBtns.value?.push({
    btnName: "编辑",
    icon: "edit",
    authority: "edit",
    priority: 1,
    funcName: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({
        path: "/dyform/DataConsumerConfig",
        query: { configId: params[primaryKey] },
      });
    },
  });
  expandBtns.value?.push({
    btnName: "查看详情",
    icon: "data-view",
    authority: "view",
    priority: 2,
    funcName: (params: any) => {
      router.push({
        path: "/dyform/DataConsumerConfig",
        query: { configId: params[primaryKey], isView: "Y" },
      });
    },
  });
};
onMounted(async () => {
  await initData();
});
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param _row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, _row: any): any => {
  //转换显示信息
  if (name == "viewType") {
    let redata = viewTypeList.value?.find(
      (item: SelectOption) => item.value == cellValue,
    );
    return redata?.name || cellValue;
  } else if (name == "isAudit") {
    let redata = auditList.value?.find(
      (item: SelectOption) => item.value == cellValue,
    );
    return redata?.name || cellValue;
  }
  return cellValue;
};
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog
    :dialogVisible="dialogProps.bakeVisible1"
    :title="'数据预览'"
    @closeAction="closeAction"
    :box-width="'70%'"
    :isBatch="false"
    :source="3"
  >
    <ViewPage :param="currentRow.dataNo" :isPreview="true" />
  </star-horse-dialog>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialogVisible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="dynamicFormConsumerConfigRef?.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :source="3"
  >
    <star-horse-data-view
      :dataFormat="dataFormat"
      :field-list="tableFieldList"
      :compUrl="dataUrl"
    />
  </star-horse-dialog>
  <div class="search-content">
    <div
      class="search_btn"
      :style="{
        'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row',
      }"
    >
      <star-horse-search-comp
        @searchData="
          (data: any) => dynamicFormConsumerConfigRef?.createSearchParams(data)
        "
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="dynamicFormConsumerConfigRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      :extendBtns="expandBtns"
    />
  </el-card>
</template>
