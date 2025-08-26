<script setup lang="ts" name="Customer">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SelectOption,
  useButtonPermissionStore,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { loadElementPlusIcon, loadSvgIcons } from "@/api/star_horse_utils.js";
import { i18n } from "@/lang";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/customer");
// const buttonPermission = useButtonPermissionStore(piniaInstance);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.customer.name"),
      defaultVisible: true,
      fieldName: "customerName",

      matchType: "lk",
    },
    {
      label: i18n("system.customer.code"),
      fieldName: "customerCode",

      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
let systemIconList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idCustomer",
      type: "long",
      required: true,
    },
    {
      label: i18n("system.customer.name"),
      fieldName: "customerName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.customer.code"),
      fieldName: "customerCode",

      disabled: true,
      listVisible: true,
    },
    {
      label: i18n("system.logo"),
      fieldName: "customerLogo",
      type: "icon",
      formVisible: true,
      listVisible: true,
      preps: {
        listPrototypeDisplay: false,
        values: loadSvgIcons(),
        iconType: "user",
        listView: false,
      },
    },
    {
      label: i18n("system.description"),
      fieldName: "customerDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.created.by"),
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: i18n("system.updated.by"),
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",
    },
  ],
  cellEditable: true,
});
//主键
const primaryKey = "idCustomer";
const customerRef = ref();
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

//初始化方法
const initData = async () => {
  systemIconList.value = loadElementPlusIcon();
};
onMounted(async () => {
  await initData();
});
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (_name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
};
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="customerRef?.loadByPage()"
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
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="(data: any) => customerRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="customerRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
