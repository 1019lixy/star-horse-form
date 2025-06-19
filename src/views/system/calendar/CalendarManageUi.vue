<script setup lang="ts" name="CalendarManage">
import {Config} from "@/api/settings";
import {onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {getCustomerParam} from "@/utils/auth";
import {apiInstance, ApiUrls,  PageFieldInfo, SearchFields, SelectOption} from "star-horse-lowcode";
import {loadDict} from "@/api/star_horse_apis";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/calendarManage");
//主键
const primaryKey = "idCalendarManage";
const calendarManageRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
const commonSelectList = ref<SelectOption[]>([
  {name: "是", value: "Y"},
  {name: "否", value: "N"}
]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "日程标题",
      fieldName: "title",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "开始日期",
      fieldName: "startStr",
      defaultVisible: false,
      type: "date",
      preps: {
        valueFormat: "YYYY-MM-dd"
      }
    },
    {
      label: "结束日期",
      fieldName: "endStr",
      defaultVisible: false,
      type: "date",
      preps: {
        valueFormat: "YYYY-MM-dd"
      }
    },
    {
      label: "是否公开",
      fieldName: "publicFlag",
      defaultVisible: false,
      type: "select",
      optionList: commonSelectList
    },
    {
      label: "是否允许订阅",
      fieldName: "subscribeFlag",
      defaultVisible: false,
      type: "select",
      optionList: commonSelectList
    },
    {
      label: "是否消息提醒",
      fieldName: "messageFlag",
      defaultVisible: false,
      type: "select",
      optionList: commonSelectList
    }
  ]
});
let messageTypeList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: "日程标题",
      fieldName: "title",
      type: "input",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "开始日期",
      fieldName: "startStr",
      type: "date",
      required: false,
      formVisible: !false,
      listVisible: !false,
      brotherNodes: [
        {
          label: "开始时间",
          fieldName: "sTime",
          type: "time",
          required: false,
          formVisible: !false,
          listVisible: !false
        }
      ]
    },

    {
      label: "结束日期",
      fieldName: "endStr",
      type: "date",
      required: false,
      formVisible: !false,
      listVisible: !false,
      brotherNodes: [
        {
          label: "结束时间",
          fieldName: "eTime",
          type: "time",
          required: false,
          formVisible: !false,
          listVisible: !false
        }
      ]
    },
    {
      label: "是否公开",
      fieldName: "publicFlag",
      type: "switch",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "是否允许订阅",
      fieldName: "subscribeFlag",
      type: "switch",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "邀请",
      fieldName: "invitePersons",
      type: "user",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "抄送",
      fieldName: "cc",
      type: "user",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "日程内容",
      fieldName: "content",
      type: "textarea",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "是否消息提醒",
      fieldName: "messageFlag",
      type: "switch",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "消息提醒方式",
      fieldName: "messageType",
      type: "select",
      optionList: messageTypeList,
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "datetime",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()]
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
const activated = () => {
};
const deactivated = () => {
};
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
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
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
      :title="'查看数据'"
      :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => calendarManageRef?.createSearchParams(data)"
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
</template>
<style lang="scss" scoped>
//todo
</style>
