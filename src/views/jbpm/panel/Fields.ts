import { reactive, ref, unref } from "vue";
import {
  FieldInfo,
  PageFieldInfo,
  SelectOption,
  TabFieldInfo,
} from "star-horse-lowcode";
import { httpMethod } from "@/api/system";

const processEventTypeList = ref<SelectOption[]>([
  { name: "ENGINE_CREATED", value: "ENGINE_CREATED" },
  { name: "ENGINE_CLOSED", value: "ENGINE_CLOSED" },
  { name: "ENTITY_CREATED", value: "ENTITY_CREATED" },
  { name: "ENTITY_INITIALIZED", value: "ENTITY_INITIALIZED" },
  { name: "ENTITY_UPDATED", value: "ENTITY_UPDATED" },
  { name: "ENTITY_DELETED", value: "ENTITY_DELETED" },
  { name: "ENTITY_SUSPENDED", value: "ENTITY_SUSPENDED" },
  { name: "ENTITY_ACTIVATED", value: "ENTITY_ACTIVATED" },
  { name: "JOB_EXECUTION_SUCCESS", value: "JOB_EXECUTION_SUCCESS" },
  { name: "JOB_EXECUTION_FAILURE", value: "JOB_EXECUTION_FAILURE" },
  { name: "JOB_RETRIES_DECREMENTED", value: "JOB_RETRIES_DECREMENTED" },
  { name: "JOB_CANCELED", value: "JOB_CANCELED" },
  { name: "TIMER_SCHEDULED", value: "TIMER_SCHEDULED" },
  { name: "TIMER_FIRED", value: "TIMER_FIRED" },
  { name: "ACTIVITY_STARTED", value: "ACTIVITY_STARTED" },
  { name: "ACTIVITY_COMPLETED", value: "ACTIVITY_COMPLETED" },
  { name: "ACTIVITY_CANCELLED", value: "ACTIVITY_CANCELLED" },
  { name: "ACTIVITY_SIGNALED", value: "ACTIVITY_SIGNALED" },
  { name: "ACTIVITY_MESSAGE_RECEIVED", value: "ACTIVITY_MESSAGE_RECEIVED" },
  { name: "ACTIVITY_MESSAGE_WAITING", value: "ACTIVITY_MESSAGE_WAITING" },
  { name: "ACTIVITY_MESSAGE_CANCELLED", value: "ACTIVITY_MESSAGE_CANCELLED" },
  { name: "ACTIVITY_ERROR_RECEIVED", value: "ACTIVITY_ERROR_RECEIVED" },
  { name: "UNCAUGHT_BPMN_ERROR", value: "UNCAUGHT_BPMN_ERROR" },
  { name: "ACTIVITY_COMPENSATE", value: "ACTIVITY_COMPENSATE" },
  {
    name: "MULTI_INSTANCE_ACTIVITY_STARTED",
    value: "MULTI_INSTANCE_ACTIVITY_STARTED",
  },
  {
    name: "MULTI_INSTANCE_ACTIVITY_COMPLETED",
    value: "MULTI_INSTANCE_ACTIVITY_COMPLETED",
  },
  {
    name: "MULTI_INSTANCE_ACTIVITY_CANCELLED",
    value: "MULTI_INSTANCE_ACTIVITY_CANCELLED",
  },
  { name: "VARIABLE_CREATED", value: "VARIABLE_CREATED" },
  { name: "VARIABLE_UPDATED", value: "VARIABLE_UPDATED" },
  { name: "VARIABLE_DELETED", value: "VARIABLE_DELETED" },
  { name: "TASK_ASSIGNED", value: "TASK_ASSIGNED" },
  { name: "TASK_CREATED", value: "TASK_CREATED" },
  { name: "TASK_COMPLETED", value: "TASK_COMPLETED" },
  { name: "PROCESS_CREATED", value: "PROCESS_CREATED" },
  { name: "PROCESS_STARTED", value: "PROCESS_STARTED" },
  { name: "PROCESS_COMPLETED", value: "PROCESS_COMPLETED" },
  {
    name: "PROCESS_COMPLETED_WITH_TERMINATE_END_EVE",
    value: "PROCESS_COMPLETED_WITH_TERMINATE_END_EVE",
  },
  { name: "PROCESS_CANCELLED", value: "PROCESS_CANCELLED" },
  { name: "MEMBERSHIP_CREATED", value: "MEMBERSHIP_CREATED" },
  { name: "MEMBERSHIP_DELETED", value: "MEMBERSHIP_DELETED" },
  { name: "MEMBERSHIPS_DELETED", value: "MEMBERSHIPS_DELETED" },
]);
const entityTypeList = ref<SelectOption[]>([
  { name: "附件", value: "attachment" },
  { name: "备注", value: "comment" },
  { name: "执行", value: "execution" },
  { name: "身份关联", value: "identity-link" },
  { name: "作业", value: "job" },
  { name: "流程实例", value: "process-instance" },
  { name: "流程定义", value: "process-definition" },
  { name: "任务", value: "task" },
]);
const dataTypeList = ref<SelectOption[]>([
  { name: "字符串", value: "str" },
  { name: "布尔值", value: "bool" },
  { name: "时间", value: "time" },
  { name: "小数", value: "decimal" },
  { name: "整数", value: "int" },
  { name: "长整数", value: "long" },
]);
const eventList = ref<SelectOption[]>([
  { name: "开始", value: "start" },
  { name: "启用", value: "enable" },
  { name: "结束", value: "end" },
  { name: "迁移", value: "migrate" },
]);
const eventTypeList = ref<SelectOption[]>([
  { name: "Java类", value: "java" },
  { name: "表达式", value: "exp" },
  { name: "代理表达式", value: "proxyExp" },
  { name: "脚本", value: "script" },
  { name: "实例", value: "instance" },
]);
const taskTypeList = ref<SelectOption[]>([
  { name: "创建", value: "create" },
  { name: "指派", value: "assign" },
  { name: "完成", value: "finish" },
  { name: "删除", value: "delete" },
]);
const eventField = {
  label: "事件",
  fieldName: "eventName",
  type: "radio",
  required: true,
  formVisible: true,
  listVisible: true,
  preps: {
    values: eventList.value,
    radioType: "button",
  },
};
const listenerTypeFields = {
  label: "监听器类型",
  fieldName: "listenerType",
  type: "radio",
  required: true,
  formVisible: true,
  listVisible: true,
  helpMsg:
    "实现 ExecutionListener 接口 \n 委托表达式：${myExecutionListener}\n 表达式: ${myExecutionListener.notify(execution)} \n java类：${com.example.listener.MyExecutionListener}",
  preps: {
    values: eventTypeList.value,
    radioType: "button",
  },
};
const injectColumnsFields = {
  batchFieldList: [
    {
      title: "注入字段",
      batchName: "injectNames",
      staticData: "Y",
      fieldList: [
        {
          label: "字段名称",
          fieldName: "name",

          formVisible: true,
          listVisible: true,
        },
        {
          label: "字段类型",
          fieldName: "type",
          type: "radio",
          formVisible: true,
          listVisible: true,
          preps: {
            values: [
              { name: "字符串", value: "str" },
              { name: "表达式", value: "exp" },
            ],
            radioType: "button",
          },
        },
        {
          label: "字段值",
          fieldName: "value",

          formVisible: true,
          listVisible: true,
        },
      ],
    },
  ],
};
const execListener = (
  type: string,
  title: string,
  tabName: string,
  batchName: string,
) => {
  return {
    title: title,
    tabName: tabName,
    batchFieldList: [
      {
        batchName: batchName,
        staticData: "Y",
        fieldList: [
          {
            label: "事件类型",
            fieldName: "eventType",
            type: "radio",

            formVisible: true,
            listVisible: true,
            preps: {
              values: type == "task" ? taskTypeList : eventList,
              radioType: "button",
            },
          },
          listenerTypeFields,
          {
            label: "事务类型",
            fieldName: "transnationalType",
            type: "radio",
            formVisible: true,
            listVisible: true,
            preps: {
              values: [
                { name: "提交前", value: "beforeSubmit" },
                {
                  name: "提交后",
                  value: "afterSubmit",
                },
                { name: "回滚", value: "rollBack" },
              ],
              radioType: "button",
            },
          },
          {
            label: "监听器",
            fieldName: "listenerName",
            type: "dialog-input",
            preps: {},
            formVisible: true,
            listVisible: true,
          },
          injectColumnsFields,
        ],
      },
    ],
  };
};
const extendPrep = {
  title: "扩展属性",
  tabName: "extendPrep",
  batchFieldList: [
    {
      batchName: "extendPreps",
      staticData: "Y",
      fieldList: [
        {
          label: "属性名",
          fieldName: "name",

          formVisible: true,
          listVisible: true,
        },
        {
          label: "数据类型",
          fieldName: "dataType",
          type: "select",
          formVisible: true,
          listVisible: true,
          preps: {
            values: dataTypeList,
          },
        },
        {
          label: "属性值",
          fieldName: "vaLue",

          formVisible: true,
          listVisible: true,
        },
      ],
    },
  ],
};
const serviceTaskTypeList = ref<SelectOption[]>([
  { name: "任务", value: "task" },
  { name: "Rest任务", value: "rest" },
  { name: "Http任务", value: "http" },
  { name: "MQ任务", value: "mq" },
  { name: "邮件任务", value: "email" },
  { name: "Shell任务", value: "shell" },
]);
const restTaskField = reactive<TabFieldInfo | any>({
  title: "Rest任务",
  tabName: "rest",
  fieldList: [
    {
      label: "请求地址",
      fieldName: "url",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "请求方式",
      fieldName: "httpMethod",
      type: "select",
      defaultValue: "POST",
      formVisible: true,
      listVisible: true,
      preps: {
        values: httpMethod(),
      },
    },
    {
      label: "请求头",
      fieldName: "header",
      type: "json",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "请求内容",
      fieldName: "body",
      type: "json",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const httpTaskField = reactive<TabFieldInfo | any>({
  title: "Http任务",
  tabName: "http",
  fieldList: [
    {
      label: "请求地址",
      fieldName: "url",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "请求方式",
      fieldName: "httpMethod",
      type: "select",
      defaultValue: "POST",
      formVisible: true,
      listVisible: true,
      preps: {
        values: httpMethod(),
      },
    },
    {
      label: "请求头",
      fieldName: "header",
      type: "json",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "请求内容",
      fieldName: "body",
      type: "json",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "返回变量",
      fieldName: "responseParam",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "忽略异常",
      fieldName: "ignoreError",
      type: "switch",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "允许重定向",
      fieldName: "allowRedirect",
      type: "switch",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "临时变量",
      fieldName: "tempVariable",
      type: "switch",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "结果格式化JSON",
      fieldName: "resultFormatToJson",
      type: "switch",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const mqTaskField = reactive<TabFieldInfo | any>({
  title: "MQ任务",
  tabName: "mq",
  fieldList: [
    {
      label: "队列名称",
      fieldName: "queueName",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "参数内容",
      fieldName: "body",
      type: "textarea",
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const emailTaskField = reactive<TabFieldInfo | any>({
  title: "邮件任务",
  tabName: "email",
  fieldList: [
    {
      label: "收件人",
      fieldName: "receives",
      type: "dialog-input",
      preps: {},
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "主题",
      fieldName: "subject",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "正文",
      fieldName: "body",
      type: "htmleditor",
      required: true,
      formVisible: true,
      listVisible: true,
    },
  ],
});
const shellTaskField = reactive<TabFieldInfo | any>({
  title: "Shell任务",
  tabName: "shell",
  fieldList: [
    {
      label: "命令",
      fieldName: "command",
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      batchFieldList: [
        {
          batchName: "inputParams",
          fieldList: [
            {
              label: "参数名",
              fieldName: "paramName",
              required: true,
              formVisible: true,
              listVisible: true,
            },
          ],
        },
      ],
    },
    {
      label: "输出变量",
      fieldName: "outputParam",

      formVisible: true,
      listVisible: true,
    },
    {
      label: "是否等待",
      fieldName: "waitFlag",
      type: "switch",
      formVisible: true,
      listVisible: true,
    },
  ],
});

const sendTaskField = reactive<TabFieldInfo | any>({
  title: "抄送任务",
  tabName: "sendTask",
  fieldList: [
    {
      label: "抄送人",
      fieldName: "cc",
      type: "dialog-input",
      preps: {},
      formVisible: true,
      listVisible: true,
    },
    {
      label: "抄送内容",
      fieldName: "body",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const serviceTask = ref<any>({});
const serviceTaskField = reactive<any>({
  title: "服务任务",
  tabName: "service",
  fieldList: [
    eventField,
    listenerTypeFields,
    {
      label: "内容",
      fieldName: "listenerContent",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
    injectColumnsFields,
  ],
});

const businessRuleTaskField = reactive<TabFieldInfo | any>({
  title: "决策任务",
  tabName: "businessRule",
  fieldList: [
    {
      label: "决策",
      type: "dialog-input",
      fieldName: "policy",
      preps: {},
      formVisible: true,
      listVisible: true,
    },
    {
      label: "未找到策略,报错",
      type: "switch",
      fieldName: "noMatchedReportError",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "回退到租户",
      type: "switch",
      fieldName: "returnTent",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const callActivityField = reactive<TabFieldInfo | any>({
  title: "调用活动",
  tabName: "activity",
  fieldList: [
    {
      label: "实例名称",

      fieldName: "instanceName",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "被调用实例",
      type: "dialog-input",
      fieldName: "calledInstanceName",
      formVisible: true,
      listVisible: true,
      preps: {},
    },
    {
      label: "变量继承",
      type: "switch",
      fieldName: "variableExtend",
      formVisible: true,
      listVisible: true,
    },
    {
      fieldName: "input",
      batchFieldList: [
        {
          title: "输入参数",
          tabName: "input",
          batchName: "inputParams",
          fieldList: [
            {
              label: "源",

              fieldName: "source",
              formVisible: true,
              listVisible: true,
            },
            {
              label: "目标",

              fieldName: "dist",
              formVisible: true,
              listVisible: true,
            },
          ],
        },
        {
          title: "输出参数",
          tabName: "output",
          batchName: "outputParams",
          fieldList: [
            {
              label: "源",

              fieldName: "source",
              formVisible: true,
              listVisible: true,
            },
            {
              label: "目标",

              fieldName: "dist",
              formVisible: true,
              listVisible: true,
            },
          ],
        },
      ],
    },
  ],
});
const scriptTaskField = reactive<TabFieldInfo | any>({
  title: "脚本任务",
  tabName: "script",
  fieldList: [
    {
      label: "脚本格式",
      fieldName: "scriptType",
      type: "radio",
      formVisible: true,
      listVisible: true,
      preps: {
        values: [
          { name: "groovy", value: "groovy" },
          { name: "JavaScript", value: "js" },
        ],
      },
    },
    {
      label: "脚本内容",
      fieldName: "scriptContent",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const generalItem = (node: any) => {
  const fieldList = reactive<any>([
    {
      label: "Id",
      fieldName: "id",

      disabled: "Y",
      formVisible: true,
      listVisible: true,
    },
    {
      label: "名称",
      fieldName: "name",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "异步",
      fieldName: "async",
      type: "switch",
      defaultValue: "N",
      formVisible: true,
      listVisible: true,
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
  ]);
  if (node.type == "bpmn:Task") {
    fieldList.push({
      label: "服务类别",
      fieldName: "serviceType",
      type: "select",
      defaultValue: "task",
      actions: {
        change: (val: any) => {
          console.log(val["serviceType"]);
          const type = val["serviceType"];
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
      },
      formVisible: true,
      listVisible: true,
      preps: {
        values: serviceTaskTypeList,
      },
    });
  }
  return reactive<any>({
    title: "常规",
    tabName: "general",
    fieldList: fieldList,
  });
};
const multiInstanceItem = {
  title: "多实例",
  tabName: "multiInstance",
  fieldList: [
    {
      label: "多实例类型",
      type: "radio",
      fieldName: "multiInstanceType",
      formVisible: true,
      listVisible: true,
      preps: {
        values: [
          { name: "无", value: "none" },
          { name: "串行", value: "serial" },
          { name: "并行", value: "parallel" },
        ],
      },
    },
  ],
};
const assignee: FieldInfo = {
  label: "分配人员",
  fieldName: "assignee",
  type: "dialog-input",
  preps: {},
  formVisible: true,
  listVisible: true,
};
const candidateUsers: FieldInfo = {
  label: "候选人员",
  fieldName: "candidateUsers",
  type: "dialog-input",
  preps: {},
  formVisible: true,
  listVisible: true,
};
const candidateRoles: FieldInfo = {
  label: "候选角色",
  fieldName: "candidateRoles",
  type: "dialog-input",
  preps: {},
  formVisible: true,
  listVisible: true,
};

const storeFields = reactive<Array<FieldInfo>>([
  assignee,
  candidateUsers,
  candidateRoles,
]);

const userTaskNodeField = reactive<PageFieldInfo | any>({
  fieldList: [
    {
      fieldName: "normal",
      collapseList: [
        {
          title: "常规",
          tabName: "normal",
          fieldList: [
            {
              label: "ID",
              fieldName: "id",

              disabled: "Y",
              formVisible: true,
              listVisible: true,
              brotherNodes: [
                {
                  label: "设为提交人",
                  fieldName: "id",
                  type: "button",
                  formVisible: true,
                },
              ],
            },
            {
              label: "异步",
              fieldName: "async",
              type: "switch",
              formVisible: true,
              listVisible: true,
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
            {
              label: "跳过表达式",
              fieldName: "jumpExp",

              formVisible: true,
              listVisible: true,
            },
            {
              label: "备注",
              fieldName: "remark",
              type: "textarea",
              formVisible: true,
              listVisible: true,
            },
          ],
        },
        {
          title: "用户任务",
          tabName: "userTask",
          fieldList: [
            {
              fieldName: "fixed",
              tabList: [
                {
                  title: "固定值",
                  tabName: "fixed",
                  fieldList: [assignee, candidateUsers, candidateRoles],
                },
                {
                  title: "身份存储",
                  tabName: "idStore",
                  fieldList: [
                    {
                      label: "指定分配",
                      fieldName: "assign",
                      type: "radio",
                      formVisible: true,
                      listVisible: true,
                      actions: {
                        change: (val: any) => {
                          storeFields.splice(0, storeFields.length);
                          if (val["assign"] == "assignUser") {
                            storeFields.push(assignee);
                          }
                          storeFields.push(candidateUsers);
                          storeFields.push(candidateRoles);
                        },
                      },
                      preps: {
                        values: [
                          { name: "指定人", value: "assignUser" },
                          { name: "发起人", value: "submit" },
                        ],
                        radioType: "button",
                      },
                    },
                    ...storeFields,
                  ],
                },
              ],
            },
            {
              label: "到期时间",
              fieldName: "timeout",

              formVisible: true,
              listVisible: true,
            },
            {
              label: "优先级",
              type: "number",
              fieldName: "priority",
              formVisible: true,
              listVisible: true,
            },
          ],
        },
        {
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
              fieldList: [
                {
                  label: "名称",

                  fieldName: "name",
                  formVisible: true,
                  listVisible: true,
                },
                {
                  label: "编码",

                  fieldName: "code",
                  formVisible: true,
                  listVisible: true,
                },
                {
                  label: "是否多选",
                  type: "switch",
                  fieldName: "multipleFlag",
                  formVisible: true,
                  listVisible: true,
                },
              ],
            },
            {
              title: "下一流转配置",
              batchName: "nextTransfer",
              tabName: "b",
              staticData: "Y",
              fieldList: [
                {
                  label: "名称",

                  fieldName: "name",
                  formVisible: true,
                  listVisible: true,
                },
                {
                  label: "编码",

                  fieldName: "code",
                  formVisible: true,
                  listVisible: true,
                },
              ],
            },
          ],
        },
        {
          title: "表单",
          tabName: "form",
        },
        execListener("task", "任务监听", "taskListener", "taskListeners"),
        execListener("exec", "执行监听", "execListener", "execListeners"),
        multiInstanceItem,
        extendPrep,
      ],
    },
  ],
});
const serviceTaskNodeField = (node: any) => {
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
    fieldList: [
      {
        fieldName: "general",
        collapseList: [
          generalItem(node),
          serviceTask.value,
          execListener("exec", "执行监听", "execListener", "execListeners"),
          multiInstanceItem,
          extendPrep,
        ],
      },
    ],
  });
};
/**
 * 服务任务节点字段
 * @param type
 * @returns
 */
const serviceFieldsInfo = (type: string) => {
  let temp: any = {};
  if (type == "task") {
    temp = unref(serviceTaskField);
  } else if (type == "rest") {
    temp = unref(restTaskField);
  } else if (type == "http") {
    temp = unref(httpTaskField);
  } else if (type == "mq") {
    temp = unref(mqTaskField);
  } else if (type == "email") {
    temp = unref(emailTaskField);
  } else if (type == "shell") {
    temp = unref(shellTaskField);
  }
  return {
    fieldList: temp.fieldList,
  };
};
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
  serviceTaskNodeField,
  serviceTaskTypeList,
  serviceFieldsInfo,
};
