<script setup lang="ts" name="MessageRecord">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
  SelectOption,
} from "star-horse-lowcode";
import { loadDict } from "@/api/star_horse_apis";
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam } from "@/utils/auth";
import { i18n } from "@/lang";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/messageRecord");
//主键
const primaryKey = "idMessageRecord";
const messageRecordRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let typeList = ref<SelectOption[]>([]);
let categoryList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.category"),
      fieldName: "category",
      defaultVisible: true,
      type: "select",
      preps: {
        values: categoryList,
      },
    },
    {
      label: i18n("system.type"),
      fieldName: "type",
      defaultVisible: true,
      type: "select",
      preps: {
        values: typeList,
      },
    },
    {
      label: i18n("system.title"),
      fieldName: "title",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
let personsVisible = ref<boolean>(false);
let statusList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: i18n("system.category"),
        fieldName: "category",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: categoryList,
        },
      },
      {
        label: i18n("system.type"),
        fieldName: "type",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: typeList,
        },
      },
    ],
    {
      label: i18n("system.title"),
      fieldName: "title",

      required: true,
      formVisible: true,
      listVisible: true,
    },

    [
      {
        label: i18n("system.is.broadcast.message"),
        fieldName: "commonFlag",
        type: "switch",
        defaultValue: "Y",
        actions: {
          change: (val: any) => {
            personsVisible.value = val["commonFlag"] == "N";
          },
        },
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
      {
        label: i18n("system.status"),
        fieldName: "statusCode",
        type: "select",
        required: false,
        formVisible: true,
        listVisible: !true,
        preps: {
          values: statusList,
        },
      },
    ],
    {
      label: i18n("system.recipient"),
      fieldName: "receivePersonsName",
      aliasName: "receivePersons",
      type: "user",
      required: true,
      formVisible: personsVisible,
      listVisible: true,
      preps: {
        multiple: true,
      },
    },
    {
      label: i18n("system.status"),
      fieldName: "statusName",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.redirect.url"),
      fieldName: "url",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.content"),
      fieldName: "content",
      type: "markdown",
      required: true,
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
      type: "datetime",
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
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.data.no"),
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
    },

    {
      label: i18n("system.is.del"),
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.local"),
      fieldName: "local",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",

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
  typeList.value = await loadDict("message_type");
  categoryList.value = await loadDict("message_category");
  statusList.value = await loadDict("message_status");
};
const activated = () => {};
const deactivated = () => {};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "type") {
    return (
      typeList.value.find((item) => item.value == cellValue)?.name || cellValue
    );
  }
  if (name == "category") {
    return (
      categoryList.value.find((item) => item.value == cellValue)?.name ||
      cellValue
    );
  }
  if (name == "statusCode") {
    return (
      statusList.value.find((item) => item.value == cellValue)?.name ||
      cellValue
    );
  }
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
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="messageRecordRef?.loadByPage()"
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
          @searchData="
            (data: any) => messageRecordRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="messageRecordRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
