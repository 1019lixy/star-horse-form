import { reactive } from "vue";
import { getCustomerParam } from "@/utils/auth";
import { dictData, PageFieldInfo } from "star-horse-lowcode";

/**
 * 日历表单参数
 * @param type
 */
export function defineType(type: string) {
  return [
    {
      label: "日历分类",
      fieldName: "category",

      defaultValue: type,
      required: true,

      listVisible: true,
    },
    {
      label: "日历名称",
      fieldName: "calendarName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "共享成员",
      fieldName: "sharePerson",
      aliasName: "sharePersonNo",
      type: "user",
      required: false,
      formVisible: true,
      listVisible: true,
      preps: {
        multiple: true,
      },
    },
  ];
}

/**
 * 日程表单参数
 */
const remindTime = await dictData("remind_time");
const repeatRemindType = await dictData("repeat_policy");

export function calendarManage(calendarList: Array<any>) {
  return reactive<PageFieldInfo | any>({
    //属性列表
    fieldList: [
      {
        label: "日程/会议名称",
        fieldName: "title",

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "参与人",
        fieldName: "invitePersonsName",
        aliasName: "invitePersons",
        type: "user",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          multiple: true,
        },
      },
      {
        label: "开始日期",
        fieldName: "startStr",
        type: "date",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          valueFormat: "YYYY-MM-DD",
          format: "YYYY-MM-DD",
        },
        brotherNodes: [
          {
            label: "开始时间",
            fieldName: "sTime",
            type: "time",
            required: false,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "全天",
            fieldName: "allDay",
            type: "checkbox",
            required: false,
            formVisible: true,
            listVisible: true,
            preps: {
              values: [{ name: "全天", value: "all" }],
            },
          },
        ],
      },
      {
        label: "结束日期",
        fieldName: "endStr",
        type: "date",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          valueFormat: "YYYY-MM-DD",
          format: "YYYY-MM-DD",
        },
        brotherNodes: [
          {
            label: "结束时间",
            fieldName: "eTime",
            type: "time",
            required: false,
            formVisible: true,
            listVisible: true,
          },
        ],
      },
      {
        label: "地点",
        fieldName: "address",

        required: false,
        formVisible: true,
        listVisible: true,
      },
      {
        label: "附件",
        fieldName: "file",
        type: "upload",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          listType: "text",
          action: "/system-config/annex/upload/common",
        },
      },
      {
        label: "描述",
        fieldName: "content",
        type: "markdown",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          leftToolbar: "clear | bold ul ol",
          rightToolbar: "preview fullscreen",
        },
      },
      {
        label: "日历",
        fieldName: "idCalendarDefine",
        type: "select",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          values: calendarList,
          props: {
            label: "calendarName",
            value: "idCalendarDefine",
          },
        },
      },
      {
        label: "提醒",
        fieldName: "remindTime",
        type: "select",
        required: false,
        defaultValue: "2",
        formVisible: true,
        listVisible: true,
        preps: {
          values: remindTime,
        },
      },
      {
        label: "重复",
        fieldName: "repeatRemind",
        type: "select",
        defaultValue: "A",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          values: repeatRemindType,
        },
      },
      {
        label: "设置",
        fieldName: "messageFlagList",
        type: "checkbox",
        defaultValue: ["1"],
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          values: [
            { name: "允许成员主动加入", value: "1" },
            { name: "同时邮件通知参与人", value: "2" },
          ],
        },
      },
      {
        label: "是否允许订阅",
        fieldName: "subscribeFlag",
        type: "switch",
        required: false,
        listVisible: true,
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
      {
        label: "版本号",
        fieldName: "version",
        type: "number",
        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "创建人",
        fieldName: "createdBy",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "创建时间",
        fieldName: "createdTime",
        type: "datetime",
        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "修改人",
        fieldName: "updatedBy",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "修改时间",
        fieldName: "updatedTime",
        type: "datetime",
        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "数据编号",
        fieldName: "dataNo",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "状态码",
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
        label: "状态名称",
        fieldName: "statusName",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "是否删除",
        fieldName: "isDel",
        type: "number",
        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "国际编码",
        fieldName: "local",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
      {
        label: "备注",
        fieldName: "remark",

        required: false,
        formVisible: !true,
        listVisible: !true,
      },
    ],
    //默认查询条件
    condition: [getCustomerParam()],
  });
}
