<script setup lang="ts" name="CalendarManage">
import {
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
  PageFieldInfo,
  SearchFields,
  SelectOption,
  dialogPreps,
} from "star-horse-lowcode";
import { loadDict } from "@/api/star_horse_apis";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/calendarManage");
//主键
const primaryKey = "idCalendarManage";
const calendarManageRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
const commonSelectList = ref<SelectOption[]>([
  { name: "是", value: "Y" },
  { name: "否", value: "N" },
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.schedule.title"),
      fieldName: "title",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.start.date"),
      fieldName: "startStr",
      defaultVisible: false,
      type: "date",
      preps: {
        valueFormat: "YYYY-MM-dd",
      },
    },
    {
      label: i18n("system.end.date"),
      fieldName: "endStr",
      defaultVisible: false,
      type: "date",
      preps: {
        valueFormat: "YYYY-MM-dd",
      },
    },
    {
      label: i18n("system.is.public"),
      fieldName: "publicFlag",
      defaultVisible: false,
      type: "select",
      preps: {
        values: commonSelectList,
      },
    },
    {
      label: i18n("system.allow.subscription"),
      fieldName: "subscribeFlag",
      defaultVisible: false,
      type: "select",
      preps: {
        values: commonSelectList,
      },
    },
    {
      label: i18n("system.message.reminder"),
      fieldName: "messageFlag",
      defaultVisible: false,
      type: "select",
      preps: {
        values: commonSelectList,
      },
    },
  ],
});
let messageTypeList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: i18n("system.schedule.title"),
      fieldName: "title",

      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.start.date"),
      fieldName: "startStr",
      type: "date",
      required: false,
      formVisible: true,
      listVisible: true,
      brotherNodes: [
        {
          label: i18n("system.start.time"),
          fieldName: "sTime",
          type: "time",
          required: false,
          formVisible: true,
          listVisible: true,
        },
      ],
    },

    {
      label: i18n("system.end.date"),
      fieldName: "endStr",
      type: "date",
      required: false,
      formVisible: true,
      listVisible: true,
      brotherNodes: [
        {
          label: i18n("system.end.time"),
          fieldName: "eTime",
          type: "time",
          required: false,
          formVisible: true,
          listVisible: true,
        },
      ],
    },
    {
      label: i18n("system.is.public"),
      fieldName: "publicFlag",
      type: "switch",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
    {
      label: i18n("system.allow.subscription"),
      fieldName: "subscribeFlag",
      type: "switch",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
    {
      label: i18n("system.invite"),
      fieldName: "invitePersons",
      type: "user",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.cc"),
      fieldName: "cc",
      type: "user",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.schedule.content"),
      fieldName: "content",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.message.reminder"),
      fieldName: "messageFlag",
      type: "switch",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
    {
      label: i18n("system.message.reminder.method"),
      fieldName: "messageType",
      type: "select",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        values: messageTypeList,
      },
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
      listVisible: !true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: !true,
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
  messageTypeList.value = await loadDict("message_type");
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
        @refresh="calendarManageRef?.loadByPage()"
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
            (data: any) => calendarManageRef?.createSearchParams(data)
          "
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp
        ref="calendarManageRef"
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
