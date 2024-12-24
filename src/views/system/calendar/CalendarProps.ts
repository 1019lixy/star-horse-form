import {reactive} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth.ts";
import {dictData} from "@/api/sh_api.ts";

/**
 * 日历表单参数
 * @param type
 */
export function defineType(type: string) {
    return [{
        label: "日历分类",
        fieldName: "category",
        type: "input",
        defaultValue: type,
        required: true,
        formVisible: false,
        listVisible: !false,
    },
        {
            label: "日历名称",
            fieldName: "calendarName",
            type: "input",
            required: true,
            formVisible: !false,
            listVisible: !false,
        },
        {
            label: "共享成员",
            fieldName: "sharePerson",
            aliasName: "sharePersonNo",
            type: "user",
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
                multiple: "Y"
            }
        },];
}

/**
 * 日程表单参数
 */
let remindTime = await dictData("remind_time");
let repeatRemindType = await dictData("repeat_policy");

export function calendarManage(calendarList: Array<any>) {

    return reactive<PageFieldInfo | any>({
        //属性列表
        fieldList: [
            {
                label: "日程/会议名称",
                fieldName: "title",
                type: "input",
                required: true,
                formVisible: !false,
                listVisible: !false,
            },
            {
                label: "参与人",
                fieldName: "invitePersonsName",
                aliasName: "invitePersons",
                type: "user",
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    multiple: "Y"
                }
            },
            {
                label: "开始日期",
                fieldName: "startStr",
                type: "date",
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    valueFormat: "YYYY-MM-DD",
                    format: "YYYY-MM-DD"
                },
                brotherNodes: [{
                    label: "开始时间",
                    fieldName: "sTime",
                    type: "time",
                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                }, {
                    label: "全天",
                    fieldName: "allDay",
                    type: "checkbox",
                    optionList: [{name: "全天", value: "all"}],
                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                }]
            },
            {
                label: "结束日期",
                fieldName: "endStr",
                type: "date",
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    valueFormat: "YYYY-MM-DD",
                    format: "YYYY-MM-DD"
                },
                brotherNodes: [{
                    label: "结束时间",
                    fieldName: "eTime",
                    type: "time",
                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                },]
            },
            {
                label: "地点",
                fieldName: "address",
                type: "input",
                required: false,
                formVisible: !false,
                listVisible: !false,
            },
            {
                label: "附件",
                fieldName: "file",
                type: "upload",
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    listType: "text",
                    action: "/system-config/annex/upload/common"
                }
            },
            {
                label: "描述",
                fieldName: "content",
                type: "markdown",
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    leftToolbar: "clear | bold ul ol",
                    rightToolbar: "preview fullscreen"
                }
            },
            {
                label: "日历",
                fieldName: "idCalendarDefine",
                type: "select",
                optionList: calendarList,
                required: false,
                formVisible: !false,
                listVisible: !false,
                preps: {
                    props: {
                        label: "calendarName",
                        value: "idCalendarDefine"
                    }
                }
            },
            {
                label: "提醒",
                fieldName: "remindTime",
                type: "select",
                required: false,
                defaultValue: "2",
                optionList: remindTime,
                formVisible: !false,
                listVisible: !false,
            },
            {
                label: "重复",
                fieldName: "repeatRemind",
                type: "select",
                defaultValue: "A",
                optionList: repeatRemindType,
                required: false,
                formVisible: !false,
                listVisible: !false,
            },
            {
                label: "设置",
                fieldName: "messageFlagList",
                type: "checkbox",
                defaultValue: ["1"],
                optionList: [{name: "允许成员主动加入", value: "1"}, {name: "同时邮件通知参与人", value: "2"}],
                required: false,
                formVisible: !false,
                listVisible: !false,
            },
            {
                label: "是否允许订阅",
                fieldName: "subscribeFlag",
                type: "switch",
                required: false,
                formVisible: false,
                listVisible: !false,
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
                type: "input",
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
                type: "input",
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
                type: "input",
                required: false,
                formVisible: !true,
                listVisible: !true,
            },
            {
                label: "状态码",
                fieldName: "statusCode",
                type: "input",
                required: false,
                formVisible: !true,
                listVisible: !true,
            },
            {
                label: "状态名称",
                fieldName: "statusName",
                type: "input",
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
                type: "input",
                required: false,
                formVisible: !true,
                listVisible: !true,
            },
            {
                label: "备注",
                fieldName: "remark",
                type: "input",
                required: false,
                formVisible: !true,
                listVisible: !true,
            },
        ],
        //默认查询条件
        condition: [getCustomerParam()],
    });
}
