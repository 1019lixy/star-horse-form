import {i18n} from "@/lang";
import {appEndpoints} from "@/api/app_config";
import {ref} from "vue";
import {dataType, httpMethod, searchMatchList, SelectOption,} from "star-horse-lowcode";

/**
 * Response template options (shared)
 */
export const responseTemplateList: SelectOption[] = [
  { name: i18n("dyform.relation.template.string"), value: "string" },
  { name: i18n("dyform.relation.template.number"), value: "number" },
  { name: i18n("dyform.relation.template.result_data"), value: "result_data" },
  {
    name: i18n("dyform.relation.template.result_data_list"),
    value: "result_data_list",
  },
  {
    name: i18n("dyform.relation.template.result_data_map"),
    value: "result_data_map",
  },
  { name: i18n("dyform.relation.template.map"), value: "map" },
  { name: i18n("dyform.relation.template.list"), value: "list" },
];

/**
 * Auth type options (shared)
 */
export const authTypeList: SelectOption[] = [
  { name: i18n("dyform.relation.auth.none"), value: "none" },
  { name: i18n("dyform.relation.auth.login"), value: "login" },
  { name: i18n("dyform.relation.auth.basic"), value: "basic" },
  { name: i18n("dyform.relation.auth.bearer"), value: "bearer" },
  { name: i18n("dyform.relation.auth.custom"), value: "custom" },
];

/**
 * Value type options (static / dynamic)
 */
export const valueTypeList: SelectOption[] = [
  { name: i18n("dyform.apiSource.valueType.static"), value: "static" },
  { name: i18n("dyform.apiSource.valueType.dynamic"), value: "dynamic" },
  { name: i18n("dyform.apiSource.valueType.isolation"), value: "isolation" },
];

/**
 * Type convert options (for linkage field mapping)
 */
export const typeConvertList: SelectOption[] = [
  {
    name: i18n("dyform.relation.apiLinkage.typeConvert.string"),
    value: "string",
  },
  {
    name: i18n("dyform.relation.apiLinkage.typeConvert.number"),
    value: "number",
  },
  {
    name: i18n("dyform.relation.apiLinkage.typeConvert.boolean"),
    value: "boolean",
  },
  {
    name: i18n("dyform.relation.apiLinkage.typeConvert.array"),
    value: "array",
  },
];

/**
 * Create shared Request tab config
 * @param title
 * @param i18nPrefix - i18n key prefix: "dyform.apiSource" or "dyform.relation.apiLinkage"
 * @param subTableName - tab object name
 * @param defaultMethod - default HTTP method
 * @param dataRequired
 * @param interfaceUtils
 * @param formFields - available form fields for dynamic value selection
 */
export function createRequestTab(
  title: string,
  i18nPrefix: string,
  subTableName: string,
  defaultMethod: string = "GET",
  dataRequired: boolean = true,
  interfaceUtils?: any,
  formFields?: SelectOption[],
) {
  const { methodList, interfaceList, loadInterface, loadMethods } =
    interfaceUtils ?? {
      methodList: [],
      interfaceList: [],
      loadInterface: () => {},
      loadMethods: () => {},
    };
  const tabHide = ref<boolean>(false);
  return {
    title: title,
    subTablePrimaryKey: subTableName,
    subTableName,
    subFormFlag: "Y",
    fieldList: [
      [
        {
          label: i18n("dyform.apiConfig.apiType"),
          fieldName: "apiType",
          type: "radio",
          defaultValue: "systemApi",
          formVisible: true,
          required: dataRequired,
          helpMsg: i18n("dyform.apiConfig.helpMsg.apiType"),
          preps: {
            values: [
              {
                name: i18n("dyform.apiConfig.apiType.systemApi"),
                value: "systemApi",
              },
              {
                name: i18n("dyform.apiConfig.apiType.thirdApi"),
                value: "thirdApi",
              },
            ],
            dataRelation: {
              actionName: "change",
              relationDetails: [
                {
                  matchType: "eq",
                  controlCondition: "eqVisible",
                  relationFields: [
                    "serviceName",
                    "interfaceName",
                    "method",
                    "redirect",
                  ],
                  matchFieldValue: "systemApi",
                },
              ],
            },
          },
        },
      ],
      {
        fieldName: "a",
        preps: {
          hideTabs: tabHide,
        },
        containerType: "tab",
        containerFields: [
          {
            title: i18n("dyform.apiConfig.section.apiInfo"),
            subTablePrimaryKey: "a",
            subTableName: "a",
            fieldList: [
              [
                {
                  label: i18n("dyform.utils.453"),
                  fieldName: "serviceName",
                  type: "select",
                  helpMsg: i18n("dyform.apiConfig.helpMsg.serviceName"),
                  formVisible: false,
                  listVisible: true,
                  actions: {
                    change: (val: any) => {
                      loadInterface(val["serviceName"]);
                    },
                  },
                  preps: {
                    dataSource: "url",
                    redirect: false,
                    httpMethod: "GET",
                    url: appEndpoints.serviceListUrl,
                  },
                },
                {
                  label: i18n("dyform.utils.454"),
                  fieldName: "interfaceName",
                  type: "select",
                  helpMsg: i18n("dyform.apiConfig.helpMsg.interfaceName"),
                  formVisible: false,
                  listVisible: true,
                  actions: {
                    change: (val: any) => {
                      loadMethods(val["interfaceName"]);
                    },
                  },
                  preps: {
                    values: interfaceList,
                  },
                },
              ],
              [
                {
                  label: i18n("dyform.utils.455"),
                  fieldName: "method",
                  type: "select",
                  helpMsg: i18n("dyform.apiConfig.helpMsg.method"),
                  formVisible: false,
                  listVisible: true,
                  actions: {
                    change: (val: any) => {
                      let temp = val["method"];
                      let result: any = methodList.value?.find(
                        (item: any) => item.methodName == temp,
                      );
                      if (result) {
                        val["httpMethod"] = result.method;
                        val["url"] = result.serviceUrl;
                      }
                    },
                  },
                  preps: {
                    values: methodList,
                    props: {
                      label: "summary",
                      value: "methodName",
                    },
                  },
                },
                {
                  label: i18n("dyform.utils.456"),
                  fieldName: "redirect",
                  type: "switch",
                  helpMsg: i18n("dyform.apiConfig.helpMsg.redirect"),
                  defaultValue: true,
                  formVisible: false,
                  listVisible: true,
                },
              ],
              [
                {
                  label: i18n(`${i18nPrefix}.httpMethod`),
                  fieldName: "httpMethod",
                  type: "select",
                  defaultValue: defaultMethod,
                  required: dataRequired,
                  helpMsg: i18n("dyform.apiConfig.helpMsg.httpMethod"),
                  formVisible: true,
                  listVisible: true,
                  preps: { values: httpMethod(), colspan: 12 },
                },
                {
                  label: i18n("dyform.utils.458"),
                  fieldName: "protocol",
                  type: "select",
                  required: dataRequired,
                  helpMsg: i18n("dyform.apiConfig.helpMsg.protocol"),
                  defaultValue: "http",
                  formVisible: true,
                  listVisible: true,
                  preps: {
                    allowCreate: true,
                    values: [
                      { name: "HTTP", value: "http" },
                      { name: "HTTPS", value: "https" },
                    ],
                  },
                },
              ],
              {
                label: i18n(`${i18nPrefix}.url`),
                fieldName: "url",
                required: dataRequired,
                helpMsg: i18n(`${i18nPrefix}.url.helpMsg`),
                formVisible: true,
                listVisible: true,
                preps: { colspan: 24 },
              },
            ],
          },
          {
            title: i18n("dyform.apiConfig.section.inputConfig"),
            subTablePrimaryKey: "b",
            subTableName: "b",
            fieldList: [
              {
                label: i18n(`${i18nPrefix}.dataType`),
                fieldName: "dataType",
                type: "select",
                defaultValue: "JSON",
                required: dataRequired,
                helpMsg: i18n("dyform.apiConfig.helpMsg.dataType"),
                formVisible: true,
                listVisible: true,
                preps: {
                  allowCreate: true,
                  values: dataType(),
                  colspan: 12,
                },
              },
              {
                containerType: "table",
                containerFields: [
                  {
                    title: i18n(`${i18nPrefix}.headers`),
                    subTableName: "headers",
                    helpMsg: i18n(`${i18nPrefix}.headers.helpMsg`),
                    initRows: 0,
                    subFormFlag: "Y",
                    fieldList: [
                      {
                        label: i18n(`${i18nPrefix}.headerName`),
                        fieldName: "paramName",
                        required: dataRequired,
                        helpMsg: i18n("dyform.apiConfig.helpMsg.headerName"),
                        formVisible: true,
                        listVisible: true,
                        preps: { colspan: 8 },
                      },
                      {
                        label: i18n(`${i18nPrefix}.headerValue`),
                        fieldName: "paramValue",
                        helpMsg: i18n("dyform.apiConfig.helpMsg.headerValue"),
                        formVisible: true,
                        listVisible: true,
                        preps: { colspan: 10 },
                      },
                      {
                        label: i18n(`${i18nPrefix}.valueType`),
                        fieldName: "valueType",
                        type: "select",
                        defaultValue: "static",
                        helpMsg: i18n("dyform.apiConfig.helpMsg.valueType"),
                        formVisible: true,
                        listVisible: true,
                        preps: { values: valueTypeList, colspan: 6 },
                      },
                    ],
                  },
                ],
              },
              {
                containerType: "table",
                containerFields: [
                  {
                    title: i18n(`${i18nPrefix}.requestParams`),
                    subTableName: "requestParams",
                    helpMsg: i18n(`${i18nPrefix}.requestParams.helpMsg`),
                    initRows: 0,
                    fieldList: [
                      {
                        label: i18n(`${i18nPrefix}.paramName`),
                        fieldName: "paramName",
                        required: true,
                        helpMsg: i18n("dyform.apiConfig.helpMsg.paramName"),
                        formVisible: true,
                        listVisible: true,
                        preps: { colspan: 8 },
                      },
                      {
                        label: i18n(`${i18nPrefix}.paramValue`),
                        fieldName: "paramValue",
                        helpMsg: i18n("dyform.apiConfig.helpMsg.paramValue"),
                        formVisible: true,
                        listVisible: true,
                        preps: { colspan: 10 },
                      },
                      {
                        label: i18n("dyform.apiConfig.paramValueField"),
                        fieldName: "paramValueField",
                        type: "select",
                        helpMsg: i18n(
                          "dyform.apiConfig.helpMsg.paramValueField",
                        ),
                        formVisible: false,
                        listVisible: false,
                        actions: {
                          change: (val: any) => {
                            if (val["paramValueField"]) {
                              val["paramValue"] =
                                "${" + val["paramValueField"] + "}";
                            }
                          },
                        },
                        preps: {
                          values: formFields ?? [],
                          filterable: true,
                          allowCreate: true,
                          colspan: 10,
                        },
                      },
                      {
                        label: i18n("dyform.utils.468"),
                        fieldName: "matchType",
                        type: "select",
                        defaultValue: "eq",
                        helpMsg: i18n("dyform.apiConfig.helpMsg.matchType"),
                        formVisible: true,
                        listVisible: true,
                        preps: { values: searchMatchList(), colspan: 6 },
                      },
                      {
                        label: i18n(`${i18nPrefix}.valueType`),
                        fieldName: "valueType",
                        type: "select",
                        defaultValue: "static",
                        helpMsg: i18n("dyform.apiConfig.helpMsg.valueType"),
                        formVisible: true,
                        listVisible: true,
                        actions: {
                          change: (val: any) => {
                            if (val["valueType"] === "dynamic") {
                              const pv = val["paramValue"];
                              if (pv && typeof pv === "string") {
                                const match = pv.match(/^\$\{(\w+)\}$/);
                                if (match) {
                                  val["paramValueField"] = match[1];
                                }
                              }
                            }
                          },
                        },
                        preps: {
                          values: valueTypeList,
                          colspan: 6,
                          dataRelation: {
                            actionName: "change",
                            relationDetails: [
                              {
                                matchType: "eq",
                                controlCondition: "eqVisible",
                                relationFields: ["paramValue"],
                                matchFieldValue: ["static", "isolation"],
                              },
                              {
                                matchType: "eq",
                                controlCondition: "eqVisible",
                                relationFields: ["paramValueField"],
                                matchFieldValue: "dynamic",
                              },
                            ],
                          },
                        },
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            title: i18n("dyform.apiConfig.section.outputConfig"),
            subTablePrimaryKey: "c",
            subTableName: "c",
            fieldList: [
              {
                label: i18n("dyform.apiSource.responseTemplate"),
                fieldName: "responseTemplate",
                type: "select",
                defaultValue: "result_data_list",
                required: dataRequired,
                helpMsg: i18n("dyform.apiSource.responseTemplate.helpMsg"),
                formVisible: true,
                listVisible: true,
                preps: { values: responseTemplateList, colspan: 24 },
              },
              [
                {
                  label: i18n("dyform.apiSource.successCode"),
                  fieldName: "successCode",
                  helpMsg: i18n("dyform.apiSource.successCode.helpMsg"),
                  formVisible: true,
                  listVisible: true,
                  preps: { colspan: 8 },
                },
                {
                  label: i18n("dyform.apiSource.codePath"),
                  fieldName: "codePath",
                  defaultValue: "code",
                  helpMsg: i18n("dyform.apiSource.codePath.helpMsg"),
                  formVisible: true,
                  listVisible: true,
                  preps: { colspan: 8 },
                },
                {
                  label: i18n("dyform.apiSource.dataPath"),
                  fieldName: "dataPath",
                  defaultValue: "data",
                  helpMsg: i18n("dyform.apiSource.dataPath.helpMsg"),
                  formVisible: true,
                  listVisible: true,
                  preps: { colspan: 8 },
                },
              ],
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Create Response tab for Data Source mode (labelField + valueField)
 */
export function createDataSourceResponseTab() {
  return {
    title: i18n("dyform.apiSource.tab.response"),
    subTablePrimaryKey: "optionField",
    subTableName: "optionField",
    subFormFlag: "Y",
    fieldList: [
      [
        {
          label: i18n("dyform.apiSource.labelField"),
          fieldName: "labelField",
          required: true,
          helpMsg: i18n("dyform.apiSource.labelField.helpMsg"),
          formVisible: true,
          listVisible: true,
          preps: { colspan: 12 },
        },
        {
          label: i18n("dyform.apiSource.valueField"),
          fieldName: "valueField",
          required: true,
          helpMsg: i18n("dyform.apiSource.valueField.helpMsg"),
          formVisible: true,
          listVisible: true,
          preps: { colspan: 12 },
        },
      ],
    ],
  };
}

/**
 * Create Response tab for Linkage mode (fieldMappings)
 * @param formFields - form field options for target field dropdown
 */
export function createLinkageResponseTab(formFields: SelectOption[]) {
  return {
    title: i18n("dyform.relation.apiLinkage.tab.response"),
    subTablePrimaryKey: "response",
    subTableName: "response",
    fieldList: [
      {
        containerType: "table",
        containerFields: [
          {
            subTableName: "fieldMappings",
            title: i18n("dyform.relation.apiLinkage.fieldMapping"),
            initRows: 0,
            fieldList: [
              {
                label: i18n("dyform.relation.apiLinkage.sourceField"),
                fieldName: "sourceField",
                required: true,
                helpMsg: i18n("dyform.relation.apiLinkage.sourceField.helpMsg"),
                formVisible: true,
                listVisible: true,
                preps: { colspan: 6 },
              },
              {
                label: i18n("dyform.relation.apiLinkage.targetField"),
                fieldName: "distField",
                type: "select",
                required: true,
                helpMsg: i18n("dyform.relation.apiLinkage.targetField.helpMsg"),
                formVisible: true,
                listVisible: true,
                preps: {
                  values: formFields,
                  allowCreate: true,
                  filterable: true,
                  colspan: 6,
                },
              },
              {
                label: i18n("dyform.relation.apiLinkage.typeConvert"),
                fieldName: "typeConvert",
                type: "select",
                helpMsg: i18n("dyform.relation.apiLinkage.typeConvert.helpMsg"),
                formVisible: true,
                listVisible: true,
                preps: {
                  values: typeConvertList,
                  allowCreate: true,
                  colspan: 6,
                },
              },
              {
                label: i18n("dyform.relation.apiLinkage.transform"),
                fieldName: "transform",
                helpMsg: i18n("dyform.relation.apiLinkage.transform.helpMsg"),
                formVisible: true,
                listVisible: true,
                preps: { colspan: 6 },
              },
            ],
          },
        ],
      },
    ],
  };
}

export function createAreaIsolation() {
  return {
    title: i18n("dyform.apiConfig.section.isolationConfig"),
    subTablePrimaryKey: "isolationConfig",
    subTableName: "isolationConfig",
    subFormFlag: "Y",
    fieldList: [
      {
        label: i18n("dyform.apiConfig.isolationType"),
        fieldName: "isolationType",
        type: "select",
        formVisible: true,
        helpMsg: i18n("dyform.apiConfig.helpMsg.isolationType"),
        preps: {
          values: [
            { name: "IP", value: "ip" },
            {
              name: i18n("dyform.apiConfig.isolationType.role"),
              value: "role",
            },
          ],
        },
      },
      {
        containerType: "table",
        containerFields: [
          {
            subTableName: "isolationDetails",
            title: i18n("dyform.apiConfig.section.isolationDetails"),
            initRows: 0,
            fieldList: [
              {
                label: i18n("dyform.apiConfig.isolationName"),
                fieldName: "isolationName",
                required: true,
                helpMsg: i18n("dyform.apiConfig.helpMsg.isolationName"),
                formVisible: true,
              },
              {
                label: i18n("dyform.apiConfig.isolationParamName"),
                fieldName: "paramName",
                required: true,
                helpMsg: i18n("dyform.apiConfig.helpMsg.isolationParamName"),
                formVisible: true,
              },
              {
                label: i18n("dyform.apiConfig.isolationCode"),
                fieldName: "isolationCode",
                required: true,
                helpMsg: i18n("dyform.apiConfig.helpMsg.isolationCode"),
                formVisible: true,
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Build complete API config with mode-specific response tab
 * @param mode - "dataSource" or "linkage"
 * @param formFields - form field options (only used in linkage mode)
 * @param currentField
 * @param interfaceUtils
 */
export function createApiConfig(
  mode: "dataSource" | "linkage",
  formFields?: SelectOption[],
  currentField?: string,
  interfaceUtils?: any,
) {
  const i18nPrefix =
    mode === "dataSource" ? "dyform.apiSource" : "dyform.relation.apiLinkage";
  const defaultMethod = mode === "dataSource" ? "GET" : "POST";

  const responseTab =
    mode === "dataSource"
      ? createDataSourceResponseTab()
      : createLinkageResponseTab(formFields || []);

  return {
    fieldList: [
      {
        label: i18n("dyform.apiSource.proxyUrl"),
        fieldName: "proxyUrl",
        helpMsg:
          i18n("dyform.apiSource.proxyUrl.helpMsg") +
          "\n\n" +
          i18n("dyform.apiConfig.helpMsg.configGuide"),
        defaultValue: appEndpoints.apiLinkageProxyUrl,
        formVisible: true,
        required: true,
      },
      {
        label: i18n("dyform.apiConfig.conditionFields"),
        fieldName: "conditionFields",
        type: "select",
        helpMsg: i18n("dyform.apiConfig.helpMsg.conditionFields"),
        defaultValue: currentField ? [currentField] : [],
        formVisible: true,
        required: true,
        preps: {
          multiple: true,
          values: formFields,
        },
      },
      {
        fieldName: "apiInfo",
        formVisible: true,
        preps: {
          type: "border-card",
        },
        containerType: "tab",
        containerFields: [
          createRequestTab(
            i18n("dyform.apiConfig.tab.apiConfig"),
            i18nPrefix,
            "apiInfo",
            defaultMethod,
            true,
            interfaceUtils,
            formFields,
          ),
          responseTab,
          createRequestTab(
            i18n("dyform.apiConfig.tab.authConfig"),
            i18nPrefix,
            "authInfo",
            defaultMethod,
            false,
            interfaceUtils,
            formFields,
          ),
          createAreaIsolation(),
        ],
      },
    ],
  };
}
