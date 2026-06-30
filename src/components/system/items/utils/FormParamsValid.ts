import { SearchParams, success } from "star-horse-lowcode";
import {i18n} from "@/lang";

/**
 * 解析查询字段类型
 * @param searchForm
 * @param searchFormData
 */
export function analysisSearchData(searchForm: any, searchFormData: any) {
  const searchFields = [];
  for (const key in searchForm) {
    let val = searchForm[key];
    const temp = searchFormData.find((item: any) => item.fieldName == key);
    if (val) {
      if (temp?.type == "datarange") {
        val = [val[0] + " 00:00:00", val[1] + " 23:59:59"];
      } else if (temp?.type == "date") {
        val = [val + " 00:00:00", val + " 23:59:59"];
      }
      const param: SearchParams = {
        propertyName: key,
        operation: temp?.matchType || "eq",
        value: val,
      };
      //处理is查询
      if (temp?.matchType == "is") {
        if (val == "null") {
          param.orOperList = [
            {
              propertyName: key,
              operation: "eq",
              value: "",
            },
          ];
        } else if (val == "not null") {
          searchFields.push({
            propertyName: key,
            operation: "neq",
            value: "",
          });
        }
      }
      searchFields.push(param);
    }
  }
  return searchFields;
}

/**
 * 获取数组重复数据
 * @param arr
 */
export function arrayDuplicateDatas(arr: Array<any>) {
  return [...new Set(arr)].filter(
    (item) => arr.indexOf(item) !== arr.lastIndexOf(item),
  );
}

/**
 * 需要数据源的组件列表
 */
export const needDataSourceCompList: string[] = [
  "select",
  "tselect",
  "transfer",
  "autocomplete",
  "cascade",
  "radio",
  "checkbox",
  "icon",
];

/**
 * 校验表单组件参数
 * @param compList
 */
export function validDynamicFormCompParams(
  compList: Array<any>,
  isSubmit: boolean = false,
) {
  let errorMsg = "";
  // console.log("校验表单组件参数完整性", compList);
  const { fieldList, tabNames, objectNames, batchNames } =
    analysisFields(compList);
  const dupTabNames = arrayDuplicateDatas(tabNames);
  const dupObjectNames = arrayDuplicateDatas(objectNames);
  const dupBatchNames = arrayDuplicateDatas(batchNames);
  if (dupTabNames.length > 0) {
    errorMsg = i18n("dyform.valid.dupTabName", {names: dupTabNames.join(";")});
  }
  if (dupObjectNames.length > 0) {
    errorMsg += "\n" + i18n("dyform.valid.dupObjectName", {names: dupObjectNames.join(";")});
  }
  if (dupBatchNames.length > 0) {
    errorMsg += "\n" + i18n("dyform.valid.dupBatchName", {names: dupBatchNames.join(";")});
  }
  /**
   * 主要校验 参数是否重名，必须的参数是否赋值，参数数据合法性，此举旨在保证数据提交后可以正常运行，
   */
  // console.log(fieldList);
  // let fieldNames: Array<String> = [];
  for (const index in fieldList) {
    const temp = fieldList[index];
    const preps = temp.preps;
    const name = preps.label;
    let msg = "";
    const itemType = temp.itemType;
    if (itemType == "dialog-input" || itemType == "page-select") {
      const temp =
        "\n【" + name + i18n("dyform.utils.612");
      if (!preps.dataUrl?.host) {
        msg += i18n("dyform.utils.613");
      }
      if (!preps.dataUrl?.pageListUrl) {
        msg += i18n("dyform.utils.614");
      }

      if (!preps.fieldLists || preps.fieldLists?.length == 0) {
        msg += i18n("dyform.utils.615");
      }
      if (!preps.needField || preps.needField?.length < 1) {
        msg += i18n("dyform.utils.616");
      }
      if (msg.length > 0) {
        msg = temp + msg;
      }
    } else if (needDataSourceCompList.includes(itemType)) {
      if (
        (!preps.values || preps.values?.length <= 0) &&
        !preps.interfaceUrl &&
        !preps.urlOrDictName &&
        !preps.apiDataSource
      ) {
        msg =
          "\n【" +
          name +
          i18n("dyform.utils.617");
      }
    }
    if (msg.length > 0) {
      errorMsg += msg;
    }
  }
  if (!errorMsg && !isSubmit) {
    success(i18n("dyform.utils.618"));
  }
  return errorMsg;
}

/**
 * 解析组件
 * @param compList
 */
export function analysisFields(compList: Array<any>) {
  const fieldList: Array<any> = [];
  const tabNames: Array<string> = [];
  const objectNames: Array<string> = [];
  const batchNames: Array<string> = [];
  let priority = 1;
  const loopAnalysis = (boxList: Array<any>) => {
    for (const index in boxList) {
      const columns = boxList[index].columns;
      for (const sindex in columns) {
        const items = columns[sindex].items;
        normalAnalysis(items);
      }
    }
  };
  const tabListAnalysis = (tabList: Array<any>) => {
    for (const index in tabList) {
      const temp = tabList[index];
      tabNames.push(temp.tabName);
      objectNames.push(temp.objectName);
      normalAnalysis(temp.items);
    }
  };
  const tableListAnalysis = (tableObject?: any) => {
    if (tableObject && Object.keys(tableObject).length > 0) {
      batchNames.push(tableObject.batchFieldName);
      const tableList = tableObject.elements;
      for (const index in tableList) {
        const temp = tableList[index];
        normalAnalysis(temp.items);
      }
    }
  };
  const normalAnalysis = (dataList: any) => {
    if (dataList?.length > 0) {
      for (const index in dataList) {
        const temp = dataList[index];
        const itempType = temp.itemType;
        if (itempType == "box" || itempType == "dytable") {
          loopAnalysis(temp.preps.elements);
        } else if (
          itempType == "tab" ||
          itempType == "card" ||
          itempType == "collapse" ||
          itempType == "splitter"
        ) {
          tabListAnalysis(temp.preps.elements);
        } else if (itempType == "table") {
          tableListAnalysis(temp.preps);
        } else {
          if (Object.keys(temp).length > 0) {
            if (Array.isArray(temp)) {
              temp.forEach((item) => {
                item.priority = priority++;
                fieldList.push(item);
              });
            } else if (temp.batchFieldList) {
              temp.batchFieldList.forEach((item: any) => {
                item.fieldList.forEach((sitem: any) => {
                  sitem.priority = priority++;
                  fieldList.push(sitem);
                });
              });
            } else {
              temp.priority = priority++;
              fieldList.push(temp);
            }
          }
        }
      }
    }
  };
  normalAnalysis(compList);
  return { fieldList, tabNames, objectNames, batchNames };
}
