import { computed, nextTick, reactive, ref, Ref, unref, watch } from "vue";
import {
  analysisCompDatas,
  ascOrDesc,
  compDynamicData,
  dataType,
  dictData,
  error,
  FieldInfo,
  httpMethod,
  loadData,
  loadGetData,
  PageFieldInfo,
  piniaInstance,
  searchMatchList,
  SelectOption,
  success,
  useDesignFormStore,
  validRulesList,
  warning,
} from "star-horse-lowcode";
import { validDataUrl } from "@/api/system.js";
import WebUrlComp from "./WebUrlComp.vue";

const designForm = useDesignFormStore(piniaInstance);

export const urlReturnDataHelpMsg = `
    接口返回的数据格式必须是：
        {
        "data": {
            "pageSize": 0,
            "currentPage": 0,
            "totalDatas": 34,
            "totalPages": 4,
            "dataList": [ {} ]
        },
        "code": 0, //0 表示数据正常 
        "message": "success",
        "cnMessage": "操作成功"
    }或者：
    {
        "data":  [ {} ],
        "code": 0, //0 表示数据正常 
        "message": "success",
        "cnMessage": "操作成功"
    }
    `;

/**
 * 验证接口
 * @param formProps
 * @param dataSourceRef
 * @param recall
 * @param validForm
 * @param formData
 */
export async function validInterface(
  formProps: any,
  dataSourceRef: any,
  recall: Function,
  validForm: boolean = true,
  formData?: any,
  onlyUrl: boolean = false,
) {
  let flag = false;
  let dataList: SelectOption[] = [];
  const refName = unref(dataSourceRef);
  if (!refName) {
    return false;
  }
  const temp = unref(formData) ?? unref(refName.getFormData());
  if (validForm) {
    await nextTick();
    await refName?.$refs.starHorseFormRef.validate((res: boolean) => {
      flag = res;
    });
    if (!flag) {
      return flag;
    }
    for (const key in temp) {
      unref(formProps)[key] = temp[key];
    }
  }
  const dataSource = temp["dataSource"];
  const urlOrDictName = temp["urlOrDictName"];
  const queryParams = temp["queryParams"];
  const customParams = temp["customParams"];
  let validErrorMsg: string = "";
  let validSuccessMsg: string = "";
  if (dataSource == "url" || onlyUrl) {
    const requestParams = [] as any;
    queryParams?.forEach((item: any) => {
      if (!item.name) {
        return;
      }
      requestParams.push({
        propertyName: item.name,
        value: item.value || "",
        operation: item.matchType,
      });
    });
    let url = temp["url"];
    let httpMethod = temp["httpMethod"];
    let validResult: any = {};
    if (temp["redirect"]) {
      const params = {
        url: temp["url"] ?? temp["interfaceUrl"],
        protocol: temp["protocol"],
        host: temp["host"],
        port: temp["port"],
        httpMethod: temp.httpMethod || "POST",
        dataType: temp.dataType || "JSON",
        env: temp["env"] || "",
        searchInfo: {
          fieldList: requestParams,
        },
      };
      const custom = customParams ? JSON.parse(customParams) : {};
      if (Object.keys(custom).length > 0) {
        params.searchInfo = {
          ...params.searchInfo,
          ...custom,
        };
      }
      url = "/system-config/redirect/execute";
      validResult = await loadData(url, params);
    } else {
      if (httpMethod && httpMethod.toUpperCase() === "POST") {
        validResult = await loadData(url, {
          fieldList: requestParams,
        });
      } else {
        validResult = await loadGetData(url);
      }
    }
    if (validResult.error) {
      flag = false;
      validErrorMsg = validResult.error;
    } else {
      validSuccessMsg = "验证成功";
      dataList = validResult.data;
    }
  } else if (dataSource == "dict") {
    const dicts = await dictData(urlOrDictName);
    if (Object.keys(dicts || {}).length == 0) {
      flag = false;
      validErrorMsg = "验证失败\n数据字典可能未配置";
    } else {
      dataList = dicts;
      validSuccessMsg = "验证成功";
    }
  } else {
    //静态数据
    const datas = temp["values"] as SelectOption[];
    if (Object.keys(datas || {}).length == 0) {
      flag = false;
      validErrorMsg = "验证失败\n请设置数据";
    } else {
      dataList = datas;
      validSuccessMsg = "验证成功";
    }
  }
  if (recall) {
    recall(dataList, validSuccessMsg, validErrorMsg);
  }
  return flag;
}

/**
 * 创建数据
 * @param dataSourceRef
 * @param dataList
 * @param needDynamicData
 */
export function createData(
  dataSourceRef: any,
  dataList: any,
  needDynamicData: boolean = false,
) {
  const refName = dataSourceRef.value || dataSourceRef;
  const temp = refName.getFormData().value;
  let reDataList: SelectOption[] = [];
  const dataSource = temp["dataSource"];
  let errorMsg = "";
  if (dataSource == "data") {
    reDataList = dataList;
  } else {
    if (dataSource == "url" && needDynamicData && dataList.length > 0) {
      const element = dataList[0];
      const keys = Object.keys(element);
      if (!keys.find((item) => item == temp["selectLabel"])) {
        errorMsg = "验证失败\n【标签名字段】错误：" + JSON.stringify(keys);
      } else if (!keys.find((item) => item == temp["selectValue"])) {
        errorMsg = "验证失败\n【标签值字段】错误：" + JSON.stringify(keys);
      } else {
        dataList.forEach((item: any) => {
          reDataList.push({
            name: item[temp["selectLabel"]],
            value: item[temp["selectValue"]],
          });
        });
      }
    } else {
      reDataList = dataList;
    }
    if (!needDynamicData) {
      reDataList = [];
    }
  }
  return {
    reDataList,
    errorMsg,
  };
}

/**
 * 获取URL配置字段列表
 * @param interfaceUtils 接口工具对象，包含interfaceDatas, methodList, interfaceList, fieldList, disableUrl等
 * @param options 配置选项
 * @returns URL配置字段列表
 */
export function getUrlFieldConfig(interfaceUtils: any, options: any = {}) {
  const {
    methodList,
    interfaceList,
    fieldList,
    disableUrl,
    loadInterface,
    loadMethods,
  } = interfaceUtils;

  const {
    showValidateButton = true,
    showPrimaryKey = false,
    validateButtonText = "验证",
    validateCallback,
    urlColspan = undefined,
    showLabelFields = false,
  } = options;

  //很奇怪，此数组 没有加一个隐藏的数据，后面第一个host 会变成radio
  const urlFields: FieldInfo[] | any = [
    {},
    [
      {
        label: "应用名称",
        fieldName: "host",
        type: "select",
        formVisible: true,
        listVisible: true,
        actions: {
          change: (val: any) => {
            loadInterface(val["host"]);
          },
        },
        preps: {
          dataSource: "url",
          redirect: false,
          httpMethod: "GET",
          url: "/userdb-manage/redirect/api/service/list",
        },
      },
      {
        label: "接口",
        fieldName: "interfaceName",
        type: "select",
        formVisible: true,
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
        label: "方法/函数",
        fieldName: "method",
        type: "select",
        formVisible: true,
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
        label: "接口代理",
        fieldName: "redirect",
        type: "switch",
        defaultValue: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: "请求方式",
        fieldName: "httpMethod",
        type: "select",
        required: true,
        defaultValue: "POST",
        formVisible: true,
        listVisible: true,
        preps: {
          values: httpMethod(),
        },
      },
      {
        label: "协议",
        fieldName: "protocol",
        type: "select",
        required: true,
        defaultValue: "http",
        formVisible: true,
        listVisible: true,
        preps: {
          values: [
            { name: "HTTP", value: "http" },
            { name: "HTTPS", value: "https" },
          ],
        },
      },
    ],
    {
      label: "接口地址",
      fieldName: "url",
      required: true,
      helpMsg: urlReturnDataHelpMsg,
      formVisible: true,
      ...(urlColspan && { colspan: urlColspan }),
    },
  ];

  // 添加验证按钮和主键选择
  if (showValidateButton) {
    const validateRow: any = [];

    validateRow.push({
      label: validateButtonText,
      fieldName: "valid",
      type: "button",
      formVisible: true,
      actions: validateCallback || {
        click: async (val: any) => {
          unref(val)["dataSource"] = "url";
          await validOperation(
            val,
            interfaceUtils.paramsConfigRef || null,
            fieldList,
            disableUrl,
          );
        },
      },
      preps: {
        icon: "valid",
        colspan: showPrimaryKey ? 8 : 24,
      },
    });

    if (showPrimaryKey) {
      validateRow.push({
        label: "主键",
        fieldName: "primaryKey",
        type: "select",
        required: false,
        formVisible: true,
        preps: {
          values: fieldList,
          colspan: 16,
        },
      });
    }

    urlFields.push(validateRow);
  }

  // 添加标签名字段和标签值字段
  if (showLabelFields) {
    urlFields.push([
      {
        label: "标签名字段",
        fieldName: "selectLabel",
        type: "select",
        formVisible: true,
        listVisible: true,
        preps: {
          values: fieldList,
        },
      },
      {
        label: "标签值字段",
        fieldName: "selectValue",
        type: "select",
        preps: {
          values: fieldList,
        },
        formVisible: true,
        listVisible: true,
      },
    ]);
  }

  return urlFields;
}

export const validOperation = async (
  val: any,
  dataSourceRef: Ref<any>,
  fieldList: Ref<any>,
  disableUrl: Ref<any>,
  validForm: boolean = true,
  formData?: any,
  onlyUrl: boolean = false,
) => {
  await validInterface(
    val,
    dataSourceRef,
    (dataList: any, successMsg: string, errorMsg: string) => {
      if (dataList && !disableUrl.value) {
        const temp = dataList[0];
        const keys = Object.keys(temp || {});
        fieldList.value = [];
        for (const ind in keys) {
          fieldList.value.push({ name: keys[ind], value: keys[ind] });
        }
      }
      if (successMsg) {
        success(successMsg);
      }
      if (errorMsg) {
        error(errorMsg);
      }
    },
    validForm,
    formData,
    onlyUrl,
  );
};

/**
 * 数据源属性配置
 */
export function dataSourceFields(
  dataSourceRef: Ref<any>,
  envList: Array<SelectOption>,
  _recall: Function,
) {}

const urlBaseInfo: FieldInfo[] = [
  {
    fieldName: "preinterfaceUrl",

    defaultValue: "http://",
    preps: {
      colspan: -1,
    },
  },
  {
    label: "接口地址",
    fieldName: "interfaceUrl",

    required: true,
    helpMsg: urlReturnDataHelpMsg,
    formVisible: true,
    preps: {
      colspan: 24,
      prependList: [
        { name: "HTTP://", value: "http://" },
        { name: "HTTPS://", value: "https://" },
      ],
    },
  },
];

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function urlFields() {
  const fields: Array<any> = [];
  const fieldList = ref<SelectOption[]>([]);

  const dataUrls: FieldInfo[] = [
    {
      label: "请求方式",
      fieldName: "httpMethod",
      type: "select",
      defaultValue: "POST",
      required: true,
      formVisible: true,
      preps: {
        values: httpMethod(),
        colspan: 10,
      },
    },
    {
      label: "请求数据格式",
      fieldName: "dataType",
      type: "select",
      defaultValue: "JSON",
      formVisible: true,
      required: true,
      preps: {
        values: dataType(),
        colspan: 10,
      },
    },
    {
      label: "验证",
      fieldName: "urlValid",
      type: "button",
      preps: {
        icon: "valid",
        actionTitle: "验证",
        colspan: 4,
      },
      actions: async (val: any) => {
        if (!val["interfaceUrl"]) {
          return;
        }
        const url = val["preinterfaceUrl"] + val["interfaceUrl"];
        const result = await validDataUrl(url, {});
        const datas: any = result.data;
        const error = result.error;
        if (error) {
          warning(error);
          return;
        }
        const data = datas[0];
        const keys = Object.keys(data);
        fieldList.value = [];
        for (const ind in keys) {
          fieldList.value.push({ name: keys[ind], value: keys[ind] });
        }
      },
      required: true,
      formVisible: true,
    },
  ];
  const orderBys: FieldInfo[] = [
    {
      label: "列名",
      fieldName: "fieldName",
      type: "select",
      formVisible: true,
      preps: {
        values: fieldList,
      },
    },
    {
      label: "排序",
      fieldName: "ascOrDesc",
      type: "select",
      formVisible: true,
      preps: {
        values: ascOrDesc(),
      },
    },
  ];

  const needFields: FieldInfo[] = [
    {
      label: "原属性名",
      fieldName: "sourceField",
      type: "select",
      formVisible: true,
      preps: {
        values: fieldList,
      },
    },
    {
      label: "目标属性名",
      fieldName: "distField",
      formVisible: true,
    },
  ];
  //需考虑或查询
  const paramFields: FieldInfo[] | any = [
    {
      batchFieldList: [
        {
          batchName: "queryParams",
          fieldList: [
            {
              label: "动态参数",
              helpMsg: "设置为动态参数后，参数值将从当前表单数据中获取",
              fieldName: "isDynamicParam",
              type: "switch",
              defaultValue: "N",
              formVisible: true,
              preps: {
                activeValue: "Y",
                inactiveValue: "N",
              },
            },
            {
              label: "参数名",
              fieldName: "paramName",
              required: true,
              formVisible: true,
            },
            {
              label: "匹配方式",
              fieldName: "matchType",
              type: "select",
              defaultValue: "eq",
              formVisible: true,
              preps: {
                values: searchMatchList(),
              },
            },
            {
              label: "参数值",
              fieldName: "paramValue",
              type: "textarea",
              formVisible: true,
            },
          ],
        },
      ],
    },
  ];

  fields.push(urlBaseInfo);
  fields.push(dataUrls);

  const tabInfo = {
    fieldName: "params",
    tabList: [
      {
        title: "接口参数",
        tabName: "params",
        objectName: "params",
        fieldList: paramFields,
      },
      {
        title: "返回字段映射",
        tabName: "needField",
        objectName: "needField",
        fieldList: needFields,
      },
      {
        title: "返回数据排序",
        tabName: "orderBy",
        objectName: "orderBy",
        fieldList: orderBys,
      },
    ],
  };
  fields.push(tabInfo);
  return fields;
}

/**
 * 获取接口相关的工具函数和响应式数据
 */
export function getInterfaceUtils() {
  const interfaceDatas = ref<any>({});
  const methodList = ref<SelectOption[]>([]);
  const interfaceList = ref<SelectOption[]>([]);
  const fieldList = ref<SelectOption[]>([]);
  const disableUrl = ref<boolean>(false);

  const loadInterface = (serviceName: string) => {
    loadGetData(`/userdb-manage/redirect/api/webApis2/${serviceName}`).then(
      (res: any) => {
        interfaceDatas.value = [];
        interfaceList.value = [];
        if (res.error) {
          warning(res.error);
          return;
        }
        interfaceDatas.value = res.data?.apiList;
        interfaceList.value = res.data?.options;
      },
    );
  };

  const loadMethods = (interName: string) => {
    if (!interfaceDatas.value[interName]) {
      const dataWatch = watch(
        () => interfaceDatas.value[interName],
        (newVal) => {
          if (newVal) {
            methodList.value = newVal;
            dataWatch();
          }
        },
      );
    } else {
      methodList.value = interfaceDatas.value[interName];
    }
  };

  return {
    interfaceDatas,
    methodList,
    interfaceList,
    fieldList,
    disableUrl,
    loadInterface,
    loadMethods,
  };
}

/**
 * 组件参数属性配置
 * @param fieldName
 * @param item
 */
export function paramsFields(
  paramsConfigRef: Ref<any>,
  fieldName: string,
  item: any,
  returnField: boolean = false,
) {
  let datas: any = [];
  if (Object.entries(item).length > 0) {
    datas = [...item["advancedFields"], ...item["fields"]];
  }

  let currentData: Array<any> = [];
  datas?.forEach((item: any) => {
    if (item.fieldName == fieldName) {
      currentData = item.configParams;
      return false;
    }
  });

  const fields: Array<any> = [];
  const interfaceUtils = getInterfaceUtils();
  const { fieldList, disableUrl } = interfaceUtils;

  // 使用getUrlFieldConfig函数生成URL配置字段列表
  const dataUrls: FieldInfo[] | any = getUrlFieldConfig(
    {
      ...interfaceUtils,
      paramsConfigRef,
    },
    {
      showPrimaryKey: true,
      validateCallback: async (val: any) => {
        unref(val)["dataSource"] = "url";
        await validOperation(val, paramsConfigRef, fieldList, disableUrl);
      },
    },
  );
  const orderBys: FieldInfo[] = [
    {
      label: "列名",
      fieldName: "fieldName",
      type: "select",
      formVisible: true,
      preps: {
        values: fieldList,
      },
    },
    {
      label: "排序",
      fieldName: "ascOrDesc",
      type: "select",
      formVisible: true,
      preps: {
        values: ascOrDesc(),
      },
    },
  ];
  const fieldLists: FieldInfo[] | any = [
    {
      label: "列名",
      fieldName: "label",

      formVisible: true,
    },
    {
      label: "属性名称",
      fieldName: "fieldName",
      type: "select",
      allowCreate: true,
      formVisible: true,
      preps: {
        values: fieldList,
      },
    },
    {
      label: "搜索显示",
      fieldName: "searchFlag",
      type: "switch",
      defaultValue: "Y",
      formVisible: true,
      preps: {
        activeValue: "Y",
        inactiveValue: "N",
      },
    },
  ];
  const needFields: FieldInfo[] = [
    {
      label: "原属性名",
      fieldName: "sourceField",
      type: "select",
      formVisible: true,
      preps: {
        values: fieldList,
      },
    },
    {
      label: "目标属性名",
      fieldName: "distField",
      formVisible: true,
    },
  ];
  const otherField: FieldInfo[] = [];
  const fieldInfos: string[] = ["dataUrl", "orderby", "fieldList", "needField"];
  for (const index in currentData) {
    const temp = currentData[index];
    if (!fieldInfos.includes(temp.fieldName)) {
      otherField.push({
        label: temp.label,
        fieldName: temp.fieldName,
        listVisible: true,
      });
    }
  }
  // fields.push(urlBaseInfo);
  fields.push(...dataUrls);
  if (otherField) {
    fields.push(...otherField);
  }
  const tabInfo: any = {
    fieldName: "fieldLists",
    fieldList: [
      {
        label: "数据源",
        fieldName: "dataSource",
        required: true,
        defaultValue: "data",
        formVisible: true,
        listVisible: true,
      },
    ],
    batchFieldList: [
      {
        title: "显示属性",
        tabName: "fieldLists",
        batchName: "fieldLists",
        fieldList: fieldLists,
      },
      {
        title: "回调字段",
        tabName: "needField",
        batchName: "needField",
        fieldList: needFields,
      },
      {
        title: "数据排序",
        tabName: "orderBy",
        batchName: "orderBy",
        fieldList: orderBys,
      },
      {
        title: "接口参数",
        tabName: "params",
        batchName: "params",
        formFlag: "Y",
        fieldList: [
          {
            label: "接口参数",
            fieldName: "params",
            type: "json-array",
            formVisible: true,
            preps: {
              devType: "Y",
            },
          },
        ],
      },
    ],
  };
  fields.push(tabInfo);
  if (returnField) {
    return fields;
  } else {
    return reactive<PageFieldInfo | any>({
      fieldList: fields,
    });
  }
}

/**
 * 容器属性
 */
export function containerField(fieldName: string) {
  const tabFields = {
    title: "Tab属性",
    tabName: "tab",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "Tab名字",
            fieldName: "label",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "主键",
            fieldName: "tabName",
            helpMsg: `默认作为tab组件的名称，
                当设置对应关系时,系统作为表的主键`,

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "对象名字",
            fieldName: "objectName",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "是否子表",
            fieldName: "subFormFlag",
            type: "switch",
            defaultValue: "Y",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              activeValue: "Y",
              inactiveValue: "N",
            },
          },
        ],
      },
    ],
  };
  const collapseFields = {
    title: "Collapse属性",
    tabName: "collapse",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "Collapse名字",
            fieldName: "label",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "主键",
            fieldName: "tabName",
            helpMsg: `默认作为Collapse组件的名称，
                当设置对应关系时,系统作为表的主键`,

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "对象名字",
            fieldName: "objectName",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "是否子表",
            fieldName: "subFormFlag",
            type: "switch",
            defaultValue: "Y",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              activeValue: "Y",
              inactiveValue: "N",
            },
          },
        ],
      },
    ],
  };
  const splitterFields = {
    title: "Splitter属性",
    tabName: "splitter",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "Splitter名字",
            fieldName: "label",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "主键",
            fieldName: "tabName",
            helpMsg: `默认作为Splitter组件的名称，
                当设置对应关系时,系统作为表的主键`,

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "对象名字",
            fieldName: "objectName",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "是否子表",
            fieldName: "subFormFlag",
            type: "switch",
            defaultValue: "Y",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              activeValue: "Y",
              inactiveValue: "N",
            },
          },
          {
            label: "容器Item属性",
            fieldName: "preps",
            type: "json",
            formVisible: true,
            listVisible: true,
          },
        ],
      },
    ],
  };
  const cardFields = {
    title: "Card属性",
    tabName: "card",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "Card名字",
            fieldName: "title",
            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "主键",
            fieldName: "tabName",
            helpMsg: `默认作为Card组件的名称，
                当设置对应关系时,系统作为表的主键`,

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "对象名字",
            fieldName: "objectName",

            required: true,
            formVisible: true,
            listVisible: true,
          },
          {
            label: "是否子表",
            fieldName: "subFormFlag",
            type: "switch",
            defaultValue: "Y",
            required: true,
            formVisible: true,
            listVisible: true,
            preps: {
              activeValue: "Y",
              inactiveValue: "N",
            },
          },
        ],
      },
    ],
  };

  const boxFields = {
    title: "栅格属性",
    tabName: "box",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "列",
            fieldName: "colIndex",

            required: true,
            formVisible: true,
            listVisible: true,
            batchFieldList: [
              {
                batchName: "columns",
                batchDefaultData: { items: [] },
                fieldList: [
                  {
                    label: "列宽",
                    fieldName: "colspan",
                    type: "number",
                    defaultValue: 24,
                    required: true,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      min: 1,
                      max: 24,
                      step: 4,
                    },
                    actions: {
                      change: (val: any, type: string) => {
                        const obj = val.value || val;
                        const cols = obj.columns;
                        if (type == "oper") {
                          const len = 24 / cols.length;
                          cols.forEach((item: any) => {
                            item.colspan = len;
                          });
                        }
                      },
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const dyTableFields = {
    title: "动态表格属性",
    tabName: "dytable",
    batchFieldList: [
      {
        batchName: "elements",
        fieldList: [
          {
            label: "列",
            fieldName: "colIndex",

            required: true,
            formVisible: true,
            listVisible: true,
            batchFieldList: [
              {
                batchName: "columns",
                batchDefaultData: { items: [] },
                fieldList: [
                  {
                    label: "列宽",
                    fieldName: "colWidth",
                    type: "number",
                    defaultValue: 100,
                    required: true,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      min: 10,
                      max: 100,
                      step: 2,
                    },
                    actions: {
                      change: (val: any, type: string) => {
                        const obj = val.value || val;
                        const cols = obj.columns;
                        if (type == "oper") {
                          const len = 100 / cols.length;
                          cols.forEach((item: any) => {
                            item.colWidth = len;
                          });
                        }
                      },
                    },
                  },
                  {
                    label: "行高",
                    fieldName: "colHeight",
                    type: "number",
                    defaultValue: 30,
                    required: true,
                    formVisible: true,
                    listVisible: true,
                    preps: {
                      min: 30,
                      max: 100,
                      step: 1,
                    },
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
  const fields: any = {
    tab: tabFields,
    collapse: collapseFields,
    splitter: splitterFields,
    card: cardFields,
    box: boxFields,
    dytable: dyTableFields,
  };
  return reactive<PageFieldInfo | any>({
    fieldList: [
      {
        fieldName: fieldName,
        tabList: [fields[fieldName]],
      },
    ],
  });
}

const fieldMap: any = reactive({
  form: {
    title: "动态表单",
    tabName: "form",
    fieldList: [
      {
        label: "表单名称",
        fieldName: "formName",
        aliasName: "idDynamicForm",
        type: "dialog-input",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          primaryKey: "idDynamicForm",
          dataUrl: {
            pageListUrl: "userdb-manage/userdb/dynamicForm/pageList",
          },
          needField: [
            { sourceField: "formName", distField: "formName" },
            { sourceField: "dataNo", distField: "idDynamicForm" },
          ],

          fieldList: [
            {
              label: "表单名称",
              fieldName: "formName",
              searchVisible: true,
              formVisible: true,
              listVisible: true,
            },
            {
              label: "表名",
              fieldName: "tbName",
              searchVisible: true,
              formVisible: true,
              listVisible: true,
            },
            {
              label: "主键",
              fieldName: "formId",
              formVisible: true,
              listVisible: true,
            },
            {
              label: "数据源",
              fieldName: "datasourceConfigId",
              type: "select",
              formVisible: true,
              listVisible: true,
            },
          ],
        },
      },
    ],
  },
  comp: {
    title: "组件",
    tabName: "comp",
    fieldList: [
      {
        label: "组件名称",
        fieldName: "componentName",

        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
  },
  inter: {
    title: "接口信息",
    tabName: "interface",
    fieldList: urlFields(),
  },
  method: {
    title: "函数",
    tabName: "method",
    fieldList: [
      {
        label: "函数名称",
        fieldName: "method",

        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
  },
  code: {
    title: "代码块",
    tabName: "code",
    fieldList: [
      {
        label: "函数名称",
        fieldName: "StarHorseEditor",
        type: "usercomp",
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
  },
});
let currentField = ref<FieldInfo[]>([fieldMap["form"]]);

export function buttonClickDataField() {
  const eventList: SelectOption[] = [
    { name: "动态表单", value: "form" },
    { name: "调用组件", value: "comp" },
    { name: "调用接口", value: "inter" },
    { name: "执行函数", value: "method" },
    { name: "执行代码块", value: "code" },
  ];
  return reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "响应内容",
        fieldName: "viewType",
        type: "radio",
        required: true,
        defaultValue: "form",
        formVisible: true,
        listVisible: true,
        actions: {
          change: (val: any) => {
            const viewType = val.viewType;
            if (viewType) {
              currentField.value = [fieldMap[viewType]];
            }
          },
        },
        preps: {
          values: eventList,
        },
      },
      {
        cardList: currentField,
      },
    ],
  });
}

const formFields = computed(() => analysisCompDatas(designForm.compList).selectList);

/**
 * 关联
 * @param preps 当前组件参数

 * @param model 模式
 */
export function relationDataField(preps: any, model: string) {
  const currentFieldValues = ref<SelectOption[]>([]);
  compDynamicData({ preps: preps }).then((res) => {
    currentFieldValues.value = res;
  });

  const eventList: SelectOption[] = [
    { name: "Change", value: "change" },
    { name: "Input", value: "input" },
  ];
  const controlConditionList: SelectOption[] = [
    { name: "等于指定值时禁用被关联字段", value: "eqDisable" },
    { name: "等于指定值时可编辑被关联字段", value: "eqEditable" },
    { name: "等于指定值时隐藏被关联字段", value: "eqHide" },
    { name: "等于指定值时显示被关联字段", value: "eqVisible" },
    { name: "等于指定值时被关联字段必填", value: "eqRequired" },
    { name: "等于指定值时被关联字段赋予新值", value: "assignValue" },
  ];
  if (model == "full") {
    controlConditionList.splice(
      0,
      0,
      { name: "满足条件触发数据联动", value: "eqConditionDataLinkage" },
      { name: "数据作为参数触发数据联动", value: "asParamDataLinkage" },
    );
    controlConditionList.push({
      name: "数据等于指定值时被关联字段改变字段类型",
      value: "changeType",
    });
  }

  return reactive<PageFieldInfo | any>({
    fieldList: [
      {
        label: "触发事件",
        fieldName: "actionName",
        type: "select",
        defaultValue: "change",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          values: eventList,
        },
      },
      {
        batchFieldList: [
          {
            staticData: "Y",
            subFormFlag: "Y",
            batchName: "relationDetails",
            fieldList: [
              [
                {
                  label: "控制条件",
                  fieldName: "controlCondition",
                  type: "select",
                  required: true,
                  formVisible: true,
                  listVisible: true,

                  preps: {
                    values: controlConditionList,
                    dataRelation: {
                      actionName: "change",
                      relationDetails: [
                        {
                          matchType: "eq",
                          controlCondition: "eqVisible",
                          relationFields: ["params", "dataSourceDivider"],
                          matchFieldValue: [
                            "eqConditionDataLinkage",
                            "asParamDataLinkage",
                          ],
                        },
                        {
                          matchType: "eq",
                          controlCondition: "eqVisible",
                          relationFields: ["newValue"],
                          matchFieldValue: "assignValue",
                        },
                        {
                          matchType: "eq",
                          controlCondition: "eqVisible",
                          relationFields: ["newType"],
                          matchFieldValue: "changeType",
                        },
                        {
                          matchType: "eq",
                          controlCondition: "eqVisible",
                          relationFields: ["matchFieldName"],
                          matchFieldValue: "asParamDataLinkage",
                        },
                        {
                          matchType: "eq",
                          controlCondition: "eqRequired",
                          relationFields: ["matchFieldValue"],
                          matchFieldValue: [
                            "eqDisable",
                            "eqVisible",
                            "eqEditable",
                            "eqRequired",
                            "eqHide",
                            "eqConditionDataLinkage",
                          ],
                        },
                        {
                          matchType: "eq",
                          controlCondition: "eqRequired",
                          relationFields: ["matchFieldName"],
                          matchFieldValue: ["asParamDataLinkage"],
                        },
                      ],
                    },
                  },
                },
              ],
              [
                {
                  label: "被控制属性",
                  fieldName: "relationFields",
                  type: "tselect",
                  required: true,
                  formVisible: true,
                  listVisible: true,
                  helpMsg:
                    "相同的属性不能配置到多个相同的控制条件中，\n否则后面的条件会覆盖前面的条件,导致数据联动失效",
                  preps: {
                    data: formFields.value,

                    multiple: true,
                    checkStrictly: true,
                  },
                },

                {
                  label: "匹配条件",
                  fieldName: "matchType",
                  type: "select",
                  defaultValue: "eq",
                  required: false,
                  formVisible: true,
                  listVisible: true,
                  preps: {
                    disabled: true,
                    values: searchMatchList(),
                  },
                },
              ],
              [
                {
                  label: "参数名",
                  fieldName: "matchFieldName",
                  required: false,
                  defaultValue: preps.name,
                  helpMsg: "作为查询条件时的参数名",
                  formVisible: false,
                  listVisible: true,
                },
                {
                  label: "参数/匹配值",
                  fieldName: "matchFieldValue",
                  type: "select",
                  required: false,
                  helpMsg:
                    "作为触发事件的匹配值；\n控制条件为数据作为参数触发数据联动时，没有选中则所有数据都作为联动参数，\n否则只有选中的才会作为联动参数",

                  formVisible: true,
                  listVisible: true,
                  preps: {
                    values: currentFieldValues,
                    multiple: true,
                    allowCreate: true,
                  },
                },
              ],
              {
                type: "divider",
                formVisible: false,
                fieldName: "dataSourceDivider",
                preps: {
                  bareFlag: "Y",
                  content: "数据源",
                },
              },
              {
                label: "赋新值",
                type: "input",
                fieldName: "newValue",
                formVisible: false,
                preps: {},
              },
              {
                label: "修改字段类型",
                type: "select",
                fieldName: "newType",
                helpMsg: "字段:field_type",
                formVisible: false,
                preps: {
                  dataSource: "dict",
                  urlOrDictName: "field_type",
                },
              },
              {
                label: "联动数据源",
                type: "usercomp",
                fieldName: "params",
                formVisible: false,
                preps: {
                  batchName: "params",
                  bareFlag: "Y",
                  subFormFlag: true,
                  compName: WebUrlComp,
                },
              },
            ],
          },
        ],
      },
    ],
  });
}

const inputType = [
  "input",
  "textarea",
  "password",
  "number",
  "view-markdown",
  "json",
  "json-array",
];
const selectType = [
  "select",
  "tselect",
  "cascader",
  "autocomplete",
  "area",
  "cron",
  "transfer",
  "dialog-input",
  "page-select",
];

/**
 * 给组件添加placeholder属性
 * @param item
 * @param itemType
 */
export function fieldPlaceholder(item: any, compInfo?: any) {
  let preps: any = compInfo ?? unref(designForm.currentComp);
  if (!preps) {
    return "";
  }
  let itemType: string = preps?.itemType;
  preps["fieldName"] = item.name;
  if (item["noPlaceholder"]) {
    delete item["placeholder"];
    delete item["startPlaceholder"];
    delete item["endPlaceholder"];
    delete item["minPlaceholder"];
    delete item["maxPlaceholder"];
    return;
  }
  if (inputType.includes(itemType)) {
    item["placeholder"] = "请输入" + item.label;
  } else if (selectType.includes(itemType)) {
    item["placeholder"] = "请选择" + item.label;
  }
  if (itemType == "datetime") {
    if (preps?.preps?.type?.includes("range")) {
      item["startPlaceholder"] = "请选择开始日期";
      item["endPlaceholder"] = "请选择结束日期";
    } else {
      item["placeholder"] = "请选择" + item.label;
    }
  } else if (itemType == "number-range") {
    item["minPlaceholder"] = "请输入最小值";
    item["maxPlaceholder"] = "请输入最大值";
  }
}

const listPrototypeVisible = ref<boolean>(false);

/**
 * 定义所有组件的公共属性
 */
export function compCommonFields(
  customerValid: Function,
  isNumber: boolean,
): FieldInfo[] {
  return [
    {
      label: "标签名称",
      fieldName: "label",
      required: true,
      formVisible: true,
      actions: {
        blur: (val: any) => {
          fieldPlaceholder(val);
        },
      },
    },
    {
      label: "属性名称",
      fieldName: "name",
      required: true,
      formVisible: true,
      actions: {
        blur: (val: any) => {
          fieldPlaceholder(val);
        },
      },
    },

    {
      label: "数据长度",
      fieldName: "maxLength",
      required: true,
      defaultValue: isNumber ? 10 : 255,
      type: "number",
      formVisible: true,
    },
    {
      label: "校验规则",
      fieldName: "rules",
      defaultValue: [],
      type: "select",
      formVisible: true,
      actions: {
        change: (val: any) => {
          if (val?.rules?.includes("custom")) {
            customerValid(val);
          }
        },
      },
      preps: {
        values: validRulesList,
        multiple: true,
      },
    },
    {
      label: "表单显示",
      fieldName: "formVisible",
      type: "switch",
      defaultValue: true,
      formVisible: true,
    },
    {
      label: "查询显示",
      fieldName: "searchVisible",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "列表显示",
      fieldName: "listVisible",
      type: "switch",
      defaultValue: true,
      formVisible: true,
    },
    {
      label: "查看显示",
      fieldName: "viewVisible",
      type: "switch",
      defaultValue: true,
      formVisible: true,
    },
    {
      label: "隐藏标签",
      fieldName: "hideLabel",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "是否必须",
      fieldName: "required",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "全局禁用",
      fieldName: "disabled",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "修改禁用",
      fieldName: "editDisabled",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "可清除",
      fieldName: "clearable",
      type: "switch",
      defaultValue: true,
      formVisible: true,
    },
    {
      label: "只读",
      fieldName: "readonly",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "查询区域显示类别",
      fieldName: "defaultVisible",
      helpMsg:
        "如果开启此功能，查询区域的此组件默认展示，\n否则需要点击高级查询时才会展示",
      type: "switch",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "组件原样显示",
      helpMsg: "在列表上原样显示组件,\n此属性开启可能会导致列表数据加载缓慢",
      fieldName: "prototypeDisplay",
      type: "switch",
      defaultValue: false,
      actions: {
        change: (val: any) => {
          if (val.prototypeDisplay) {
            val["listPrototypeDisplay"] = true;
            listPrototypeVisible.value = true;
          } else {
            listPrototypeVisible.value = false;
            val["listPrototypeDisplay"] = false;
          }
        },
      },
      formVisible: true,
    },
    {
      label: "组件值",
      helpMsg: "可指定显示为什么组件",
      fieldName: "listPrototypeDisplay",

      defaultValue: false,
      formVisible: listPrototypeVisible,
    },
    {
      label: "唯一性校验",
      fieldName: "uniqueValid",
      type: "switch",
      helpMsg: "如果开启此功能，\n在新增数据时系统对数据进行唯一性校验。",
      defaultValue: false,
      formVisible: true,
    },
    {
      label: "提示信息",
      fieldName: "helpMsg",
      type: "textarea",
      formVisible: true,
    },
  ];
}
