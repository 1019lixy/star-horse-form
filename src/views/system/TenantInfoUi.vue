const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    [
      {
        label: i18n("system.tenant.name"),
        fieldName: "tenantName",

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: i18n("system.tenant.code"),
        fieldName: "tenantCode",
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
        label: i18n("system.contact.person"),
        fieldName: "linkMan",

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: i18n("system.contact.phone"),
        fieldName: "phone",

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
    ],
    [
      {
        label: i18n("system.email"),
        fieldName: "email",

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: i18n("system.telephone"),
        fieldName: "tel",

        required: false,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
    ],
    [
      {
        label: i18n("system.industry"),
        fieldName: "industry",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: { urlOrDictName: "industry_list", dataSource: "dict" },
      },
      {
        label: i18n("system.validity.period"),
        fieldName: "effectiveTime",
        type: "daterange",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: { needSplitName: "Y" },
      },
    ],
    [
      {
        label: i18n("system.expiration.policy"),
        fieldName: "expirePolicy",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: { urlOrDictName: "expire_policy", dataSource: "dict" },
      },
      {
        label: i18n("system.data.backup.policy"),
        fieldName: "dataBakePolicy",
        type: "cron",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
    ],
    [
      {
        label: i18n("system.business.notification"),
        fieldName: "businessNotice",
        type: "select",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          urlOrDictName: "message_tools",
          values: [
            { name: i18n("system.inner.message"), value: "innerMsg" },
            { name: i18n("system.sms.notification"), value: "shortMsg" },
            { name: i18n("system.email.notification"), value: "email" },
            { name: i18n("system.dingtalk.notification"), value: "dingding" },
            { name: i18n("system.enterprise.wechat"), value: "webchat" },
          ],
          dataSource: "dict",
        },
      },
      {
        label: i18n("system.subscribe.interface"),
        fieldName: "orderIntfaceFlag",
        type: "switch",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          activeValue: "Y",
          inactiveValue: "N",
        },
      },
    ],
    [
      {
        label: i18n("system.message.template"),
        fieldName: "messageTemplate",
        type: "textarea",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
      {
        label: i18n("system.contact.address"),
        fieldName: "address",
        type: "textarea",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
    ],
    [
      {
        label: i18n("system.business.description"),
        fieldName: "businessDesc",
        type: "textarea",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {},
      },
    ],
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",
      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    { 
      label: i18n("system.updated.by"), 
      fieldName: "updatedBy", 
      preps: {}, 
      commonFlag: "Y" 
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",
      type: "datetime",
      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",
      type: "datetime",
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      listVisible: true,
      preps: {},
      commonFlag: "Y",
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
      preps: {},
      commonFlag: "Y",
    },
    { 
      label: i18n("system.data.number"), 
      fieldName: "dataNo", 
      preps: {}, 
      commonFlag: "Y" 
    },
    {
      label: i18n("system.status"),
      fieldName: "statusCode",
      type: "select",

      preps: {
        urlOrDictName: "common",
        name: "statusCode",
        dataSource: "dict",
      },
      commonFlag: "Y",
    },
    { 
      label: i18n("system.status.name"), 
      fieldName: "statusName", 
      preps: {}, 
      commonFlag: "Y" 
    },
    { 
      label: i18n("system.international.code"), 
      fieldName: "local", 
      preps: {}, 
      commonFlag: "Y" 
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      preps: {},
      commonFlag: "Y",
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  dynamicFormas: [],
  orderBy: [],
  batchName: "batchDataList",
  tableCellEditabled: false,
  stopAutoLoad: false,
});