import {reactive, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps";
import {FieldInfo, PageFieldInfo, TabFieldInfo} from "@/components/types/PageFieldInfo";
import {httpMethod} from "@/api/system.ts";

const processEventTypeList = ref<SelectOption[]>([
    {name: "ENGINE_CREATED", value: "ENGINE_CREATED"},
    {name: "ENGINE_CLOSED", value: "ENGINE_CLOSED"},
    {name: "ENTITY_CREATED", value: "ENTITY_CREATED"},
    {name: "ENTITY_INITIALIZED", value: "ENTITY_INITIALIZED"},
    {name: "ENTITY_UPDATED", value: "ENTITY_UPDATED"},
    {name: "ENTITY_DELETED", value: "ENTITY_DELETED"},
    {name: "ENTITY_SUSPENDED", value: "ENTITY_SUSPENDED"},
    {name: "ENTITY_ACTIVATED", value: "ENTITY_ACTIVATED"},
    {name: "JOB_EXECUTION_SUCCESS", value: "JOB_EXECUTION_SUCCESS"},
    {name: "JOB_EXECUTION_FAILURE", value: "JOB_EXECUTION_FAILURE"},
    {name: "JOB_RETRIES_DECREMENTED", value: "JOB_RETRIES_DECREMENTED"},
    {name: "JOB_CANCELED", value: "JOB_CANCELED"},
    {name: "TIMER_SCHEDULED", value: "TIMER_SCHEDULED"},
    {name: "TIMER_FIRED", value: "TIMER_FIRED"},
    {name: "ACTIVITY_STARTED", value: "ACTIVITY_STARTED"},
    {name: "ACTIVITY_COMPLETED", value: "ACTIVITY_COMPLETED"},
    {name: "ACTIVITY_CANCELLED", value: "ACTIVITY_CANCELLED"},
    {name: "ACTIVITY_SIGNALED", value: "ACTIVITY_SIGNALED"},
    {name: "ACTIVITY_MESSAGE_RECEIVED", value: "ACTIVITY_MESSAGE_RECEIVED"},
    {name: "ACTIVITY_MESSAGE_WAITING", value: "ACTIVITY_MESSAGE_WAITING"},
    {name: "ACTIVITY_MESSAGE_CANCELLED", value: "ACTIVITY_MESSAGE_CANCELLED"},
    {name: "ACTIVITY_ERROR_RECEIVED", value: "ACTIVITY_ERROR_RECEIVED"},
    {name: "UNCAUGHT_BPMN_ERROR", value: "UNCAUGHT_BPMN_ERROR"},
    {name: "ACTIVITY_COMPENSATE", value: "ACTIVITY_COMPENSATE"},
    {name: "MULTI_INSTANCE_ACTIVITY_STARTED", value: "MULTI_INSTANCE_ACTIVITY_STARTED"},
    {name: "MULTI_INSTANCE_ACTIVITY_COMPLETED", value: "MULTI_INSTANCE_ACTIVITY_COMPLETED"},
    {name: "MULTI_INSTANCE_ACTIVITY_CANCELLED", value: "MULTI_INSTANCE_ACTIVITY_CANCELLED"},
    {name: "VARIABLE_CREATED", value: "VARIABLE_CREATED"},
    {name: "VARIABLE_UPDATED", value: "VARIABLE_UPDATED"},
    {name: "VARIABLE_DELETED", value: "VARIABLE_DELETED"},
    {name: "TASK_ASSIGNED", value: "TASK_ASSIGNED"},
    {name: "TASK_CREATED", value: "TASK_CREATED"},
    {name: "TASK_COMPLETED", value: "TASK_COMPLETED"},
    {name: "PROCESS_CREATED", value: "PROCESS_CREATED"},
    {name: "PROCESS_STARTED", value: "PROCESS_STARTED"},
    {name: "PROCESS_COMPLETED", value: "PROCESS_COMPLETED"},
    {name: "PROCESS_COMPLETED_WITH_TERMINATE_END_EVE", value: "PROCESS_COMPLETED_WITH_TERMINATE_END_EVE"},
    {name: "PROCESS_CANCELLED", value: "PROCESS_CANCELLED"},
    {name: "MEMBERSHIP_CREATED", value: "MEMBERSHIP_CREATED"},
    {name: "MEMBERSHIP_DELETED", value: "MEMBERSHIP_DELETED"},
    {name: "MEMBERSHIPS_DELETED", value: "MEMBERSHIPS_DELETED"}
]);
const entityTypeList = ref<SelectOption[]>([
    {name: "附件", value: "attachment"},
    {name: "备注", value: "comment"},
    {name: "执行", value: "execution"},
    {name: "身份关联", value: "identity-link"},
    {name: "作业", value: "job"},
    {name: "流程实例", value: "process-instance"},
    {name: "流程定义", value: "process-definition"},
    {name: "任务", value: "task"},
]);
let dataTypeList = ref<SelectOption[]>([
    {name: "字符串", value: "str"},
    {name: "布尔值", value: "bool"},
    {name: "时间", value: "time"},
    {name: "小数", value: "decimal"},
    {name: "整数", value: "int"},
    {name: "长整数", value: "long"},
]);
const eventTypeList = ref<SelectOption[]>([
    {name: "开始", value: "start"}, {name: "启用", value: "enable"}, {name: "结束", value: "end"}
]);
const taskTypeList = ref<SelectOption[]>([
    {name: "创建", value: "create"}, {name: "指派", value: "assign"}, {name: "完成", value: "finish"},
    {name: "删除", value: "delete"}
]);
const listenerTypeFields = {
    label: "监听器类型",
    fieldName: "listenerType",
    type: "radio",
    optionList: [{name: "Java类", value: "java"}, {name: "表达式", value: "exp"}, {
        name: "代理表达式",
        value: "proxyExp"
    }],
    formShow: true,
    tableShow: true,
    preps: {
        radioType: "button"
    }
};
const injectColumnsFields = {
    batchFieldList: [{
        title: "注入字段",
        batchName: "injectNames",
        staticData: "Y",
        fieldList: [{
            label: "字段名称",
            fieldName: "name",
            type: "input",
            formShow: true,
            tableShow: true,
        }, {
            label: "字段类型",
            fieldName: "type",
            type: "radio",
            optionList: [{name: "字符串", value: "str"}, {name: "表达式", value: "exp"}],
            formShow: true,
            tableShow: true,
            preps: {
                radioType: "button"
            }
        }, {
            label: "字段值",
            fieldName: "value",
            type: "input",
            formShow: true,
            tableShow: true,
        }]
    }]
}
const execListener = (type: string, title: string, tabName: string, batchName: string) => {
    return {
        title: title,
        tabName: tabName,
        batchFieldList: [{
            batchName: batchName,
            staticData: "Y",
            fieldList: [{
                label: "事件类型",
                fieldName: "eventType",
                type: "radio",
                optionList: type == "task" ? taskTypeList : eventTypeList,
                formShow: true,
                tableShow: true,
                preps: {
                    radioType: "button"
                }
            }, listenerTypeFields, {
                label: "事务类型",
                fieldName: "transnationalType",
                type: "radio",
                optionList: [{name: "提交前", value: "beforeSubmit"}, {
                    name: "提交后",
                    value: "afterSubmit"
                }, {name: "回滚", value: "rollBack"}],
                formShow: true,
                tableShow: true,
                preps: {
                    radioType: "button"
                }
            }, {
                label: "监听器",
                fieldName: "listenerName",
                type: "dialog-input",
                params: {},
                formShow: true,
                tableShow: true,
            },
                injectColumnsFields]
        }]
    }
};
const extendPrep = {
    title: "扩展属性",
    tabName: "extendPrep",
    batchFieldList: [{
        batchName: "extendPreps",
        staticData: "Y",
        fieldList: [
            {
                label: "属性名",
                fieldName: "name",
                type: "input",
                formShow: true,
                tableShow: true,
            },
            {
                label: "数据类型",
                fieldName: "dataType",
                type: "select",
                optionList: dataTypeList,
                formShow: true,
                tableShow: true,
            },
            {
                label: "属性值",
                fieldName: "vaLue",
                type: "input",
                formShow: true,
                tableShow: true,
            },
        ]
    }]
};
let serviceTaskTypeList = ref<SelectOption[]>([
    {name: "任务", value: "task"},
    {name: "Rest任务", value: "rest"},
    {name: "Http任务", value: "http"},
    {name: "MQ任务", value: "mq"},
    {name: "邮件任务", value: "email"},
    {name: "Shell任务", value: "shell"},
]);
let restTaskField = reactive<TabFieldInfo | any>({
    title: "Rest任务",
    tabName: "rest",
    fieldList: [{
        label: "请求地址",
        fieldName: "url",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        label: "请求地址",
        fieldName: "requestType",
        type: "select",
        optionList: httpMethod(),
        formShow: true,
        tableShow: true,
    }, {
        label: "请求头",
        fieldName: "header",
        type: "json",
        formShow: true,
        tableShow: true,
    }, {
        label: "请求内容",
        fieldName: "body",
        type: "json",
        formShow: true,
        tableShow: true,
    }]
});
let httpTaskField = reactive<TabFieldInfo | any>({
    title: "Http任务",
    tabName: "http",
    fieldList: [{
        label: "请求地址",
        fieldName: "url",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        label: "请求地址",
        fieldName: "requestType",
        type: "select",
        optionList: httpMethod(),
        formShow: true,
        tableShow: true,
    }, {
        label: "请求头",
        fieldName: "header",
        type: "json",
        formShow: true,
        tableShow: true,
    }, {
        label: "请求内容",
        fieldName: "body",
        type: "json",
        formShow: true,
        tableShow: true,
    }, {
        label: "返回变量",
        fieldName: "responseParam",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        label: "忽略异常",
        fieldName: "ignoreError",
        type: "switch",
        formShow: true,
        tableShow: true,
    }, {
        label: "允许重定向",
        fieldName: "allowRedirect",
        type: "switch",
        formShow: true,
        tableShow: true,
    }, {
        label: "临时变量",
        fieldName: "tempVariable",
        type: "switch",
        formShow: true,
        tableShow: true,
    }, {
        label: "结果格式化JSON",
        fieldName: "resultFormatToJson",
        type: "switch",
        formShow: true,
        tableShow: true,
    }]
});
let mqTaskField = reactive<TabFieldInfo | any>({
    title: "MQ任务",
    tabName: "mq",
    fieldList: [{
        label: "队列名称",
        fieldName: "queueName",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        label: "参数内容",
        fieldName: "body",
        type: "textarea",
        formShow: true,
        tableShow: true,
    }]
});
let emailTaskField = reactive<TabFieldInfo | any>({
    title: "邮件任务",
    tabName: "email",
    fieldList: [{
        label: "收件人",
        fieldName: "receives",
        type: "dialog-input",
        params: {},
        formShow: true,
        tableShow: true,
    }, {
        label: "主题",
        fieldName: "subject",
        type: "input",
        formShow: true,
        tableShow: true,

    }, {
        label: "正文",
        fieldName: "body",
        type: "htmleditor",
        formShow: true,
        tableShow: true,
    }]
});
let shellTaskField = reactive<TabFieldInfo | any>({
    title: "Shell任务",
    tabName: "shell",
    fieldList: [{
        label: "命令",
        fieldName: "command",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        batchFieldList: [{
            batchName: "inputParams",
            fieldList: [{
                label: "参数名",
                fieldName: "paramName",
                type: "input",
                formShow: true,
                tableShow: true,
            }]
        }]
    }, {
        label: "输出变量",
        fieldName: "outputParam",
        type: "input",
        formShow: true,
        tableShow: true,
    }, {
        label: "是否等待",
        fieldName: "waitFlag",
        type: "switch",
        formShow: true,
        tableShow: true,
    }]
});

let sendTaskField = reactive<TabFieldInfo | any>({
    title: "抄送任务",
    tabName: "sendTask",
    fieldList: [{
        label: "抄送人",
        fieldName: "cc",
        type: "dialog-input",
        params: {},
        formShow: true,
        tableShow: true,
    }, {
        label: "抄送内容",
        fieldName: "body",
        type: "textarea",
        formShow: true,
        tableShow: true,
    }]
});
let serviceTask = ref<any>({});
let serviceTaskField = reactive<any>({
    title: "服务任务",
    tabName: "service",
    fieldList: [listenerTypeFields, injectColumnsFields]
});

let businessRuleTaskField = reactive<TabFieldInfo | any>({
    title: "决策任务",
    tabName: "businessRule",
    fieldList: [{
        label: "决策",
        type: "dialog-input",
        fieldName: "policy",
        params: {},
        formShow: true,
        tableShow: true,
    }, {
        label: "未找到策略,报错",
        type: "switch",
        fieldName: "noMatchedReportError",
        formShow: true,
        tableShow: true,
    }, {
        label: "回退到租户",
        type: "switch",
        fieldName: "returnTent",
        formShow: true,
        tableShow: true,
    }]
});
let callActivityField = reactive<TabFieldInfo | any>({
    title: "调用活动",
    tabName: "activity",
    fieldList: [{
        label: "实例名称",
        type: "input",
        fieldName: "instanceName",
        formShow: true,
        tableShow: true,
    }, {
        label: "被调用实例",
        type: "dialog-input",
        fieldName: "calledInstanceName",
        formShow: true,
        tableShow: true,
    }, {
        label: "变量继承",
        type: "switch",
        fieldName: "variableExtend",
        formShow: true,
        tableShow: true,
    }, {
        fieldName: "input",
        batchFieldList: [{
            title: "输入参数",
            tabName: "input",
            batchName: "inputParams",
            fieldList: [{
                label: "源",
                type: "input",
                fieldName: "source",
                formShow: true,
                tableShow: true,
            }, {
                label: "目标",
                type: "input",
                fieldName: "dist",
                formShow: true,
                tableShow: true,
            }]
        }, {
            title: "输出参数",
            tabName: "output",
            batchName: "outputParams",
            fieldList: [{
                label: "源",
                type: "input",
                fieldName: "source",
                formShow: true,
                tableShow: true,
            }, {
                label: "目标",
                type: "input",
                fieldName: "dist",
                formShow: true,
                tableShow: true,
            }]
        }]
    }]
});
const scriptTaskField = reactive<TabFieldInfo | any>({
    title: "脚本任务",
    tabName: "script",
    fieldList: [{
        label: "脚本格式",
        fieldName: "scriptType",
        type: "radio",
        optionList: [{name: "groovy", value: "groovy"}, {name: "JavaScript", value: "js"}],
        formShow: true,
        tableShow: true,
    }, {
        label: "脚本内容",
        fieldName: "scriptContent",
        type: "textarea",
        formShow: true,
        tableShow: true,
    }]
});
const generalItem = (node: any) => {
    let fieldList = reactive<any>([
        {
            label: "Id",
            fieldName: "id",
            type: "input",
            disabled: "Y",
            formShow: true,
            tableShow: true,
        },
        {
            label: "名称",
            fieldName: "name",
            type: "input",
            required: true,
            formShow: true,
            tableShow: true,
        },
        {
            label: "异步",
            fieldName: "async",
            type: "switch",
            defaultValue: "N",
            formShow: true,
            tableShow: true,
        }
    ]);
    if (node.type == "bpmn:Task") {
        fieldList.push({
            label: "服务类别",
            fieldName: "serviceType",
            type: "select",
            defaultValue: "task",
            optionList: serviceTaskTypeList,
            actionName: "change",
            actions: (val: any) => {
                console.log(val["serviceType"]);
                let type = val["serviceType"];
                if (type == "rest") {
                    serviceTask.value = restTaskField;
                } else if (type == "http") {
                    serviceTask.value = httpTaskField;
                } else if (type == "mq") {
                    serviceTask.value = mqTaskField;
                } else if (type == "email") {
                    serviceTask.value = emailTaskField;
                } else if (type == "shell") {
                    serviceTask.value = shellTaskField;
                }
            },
            formShow: true,
            tableShow: true,
        })
    }
    return reactive<any>({
        title: "常规",
        tabName: "general",
        fieldList: fieldList
    });
}
const multiInstanceItem = {
    title: "多实例",
    tabName: "multiInstance",
    fieldList: [{
        label: "多实例类型",
        type: "radio",
        fieldName: "multiInstanceType",
        optionList: [{name: "无", value: "none"}, {name: "串行", value: "serial"}, {name: "并行", value: "parallel"}],
        formShow: true,
        tableShow: true,
    }]
};
const assignee: FieldInfo = {
    label: "分配人员",
    fieldName: "assignee",
    type: "dialog-input",
    params: {},
    formShow: true,
    tableShow: true,
};
const candidateUsers: FieldInfo = {
    label: "候选人员",
    fieldName: "candidateUsers",
    type: "dialog-input",
    params: {},
    formShow: true,
    tableShow: true,
};
const candidateRoles: FieldInfo = {
    label: "候选角色",
    fieldName: "candidateRoles",
    type: "dialog-input",
    params: {},
    formShow: true,
    tableShow: true,
};


let storeFields = reactive<Array<FieldInfo>>([assignee, candidateUsers, candidateRoles]);

const userTaskNodeField = reactive<PageFieldInfo | any>({
    fieldList: [{
        fieldName: "normal",
        collapseList: [{
            title: "常规",
            tabName: "normal",
            fieldList: [{
                label: "ID",
                fieldName: "id",
                type: "input",
                disabled: "Y",
                formShow: true,
                tableShow: true,
                brotherNodes: [{
                    label: "设为提交人",
                    fieldName: "id",
                    type: "button",
                    formShow: true,
                }]
            }, {
                label: "异步",
                fieldName: "async",
                type: "switch",
                formShow: true,
                tableShow: true,
            }, {
                label: "跳过表达式",
                fieldName: "jumpExp",
                type: "input",
                formShow: true,
                tableShow: true,
            }, {
                label: "备注",
                fieldName: "remark",
                type: "textarea",
                formShow: true,
                tableShow: true,
            },]
        }, {
            title: "用户任务",
            tabName: "userTask",
            fieldList: [{
                fieldName: "fixed",
                tabList: [{
                    title: "固定值",
                    tabName: "fixed",
                    fieldList: [assignee, candidateUsers, candidateRoles]
                }, {
                    title: "身份存储",
                    tabName: "idStore",
                    fieldList: [{
                        label: "指定分配",
                        fieldName: "assign",
                        type: "radio",
                        optionList: [{name: "指定人", value: "assignUser"}, {name: "发起人", value: "submit"}],
                        formShow: true,
                        tableShow: true,
                        actionName: "change",
                        actions: (val: any) => {
                            storeFields.splice(0, storeFields.length);
                            if (val["assign"] == "assignUser") {
                                storeFields.push(assignee);
                            }
                            storeFields.push(candidateUsers);
                            storeFields.push(candidateRoles);
                        },
                        preps: {
                            radioType: "button"
                        }
                    }, ...storeFields]
                }]
            }, {
                label: "到期时间",
                fieldName: "timeout",
                type: "input",
                formShow: true,
                tableShow: true,
            }, {
                label: "优先级",
                type: "number",
                fieldName: "priority",
                formShow: true,
                tableShow: true,
            },]
        }, {
            title: "审批配置",
            tabName: "auditConfig",
            fieldName: "a",
            displayStyle: "list",
            batchFieldList: [
                {
                    title: "下一审批人",
                    batchName: "nextAuditors",
                    tabName: "a",
                    staticData: "Y",
                    fieldList: [{
                        label: "名称",
                        type: "input",
                        fieldName: "name",
                        formShow: true,
                        tableShow: true,
                    }, {
                        label: "编码",
                        type: "input",
                        fieldName: "code",
                        formShow: true,
                        tableShow: true,
                    }, {
                        label: "是否多选",
                        type: "switch",
                        fieldName: "multipleFlag",
                        formShow: true,
                        tableShow: true,
                    }]
                }, {
                    title: "下一流转配置",
                    batchName: "nextTransfer",
                    tabName: "b",
                    staticData: "Y",
                    fieldList: [{
                        label: "名称",
                        type: "input",
                        fieldName: "name",
                        formShow: true,
                        tableShow: true,
                    }, {
                        label: "编码",
                        type: "input",
                        fieldName: "code",
                        formShow: true,
                        tableShow: true,
                    }]
                }]
        },
            {
                title: "表单",
                tabName: "form"
            },
            execListener("task", "任务监听", "taskListener", "taskListeners"),
            execListener("exec", "执行监听", "execListener", "execListeners"),
            multiInstanceItem, extendPrep]
    }]
});
const serviceTaskNodeField = (node: any) => {
    console.log("sss", node);
    if (node.type == "bpmn:ServiceTask") {
        serviceTask.value = serviceTaskField;
    } else if (node.type == "bpmn:SendTask") {
        serviceTask.value = sendTaskField;
    } else if (node.type == "bpmn.ScriptTask") {
        serviceTask.value = scriptTaskField;
    } else if (node.type == "bpmn:CallActivity") {
        serviceTask.value = callActivityField;
    } else if (node.type == "bpmn:BusinessRuleTask") {
        serviceTask.value = businessRuleTaskField;
    } else if (node.type != "bpmn:Task") {
        serviceTask.value = {};
    }
    return reactive<PageFieldInfo | any>({
        fieldList: [{
            fieldName: "general",
            collapseList: [
                generalItem(node),
                serviceTask.value,
                execListener("exec", "执行监听", "execListener", "execListeners"),
                multiInstanceItem, extendPrep]
        }]
    });
}

export {
    processEventTypeList,
    entityTypeList,
    eventTypeList,
    dataTypeList,
    execListener,
    generalItem,
    extendPrep,
    assignee,
    multiInstanceItem,
    candidateUsers,
    candidateRoles,
    userTaskNodeField,
    serviceTaskNodeField
}
