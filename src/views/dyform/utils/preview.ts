import {postRequest} from "@/api/star_horse";
import {error} from "@/utils/message";
import {closeLoad, load} from "@/api/sh_api";
import {SearchParams} from "@/components/types/Params";
import {success} from "@/utils/message.ts";

/**
 * 获取视图属性
 * @param param 视图Token
 */
export async function viewColumns(param: string) {
    let formDatas: any = [], columns: any = [];
    await postRequest(`/userdb-manage/consumer/api/viewColumns/${param}`, []).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            error(redata.cnMessage);
            return;
        }
        columns = redata.data;
        for (let key in columns) {
            let temp = columns[key];
            for (let j in temp) {
                let stemp = temp[j];
                if (stemp.primaryKey == "Y") {
                    continue;
                }
                formDatas.push({
                    label: stemp.comment,
                    fieldName: key + "&" + stemp.fieldName,
                    type: convertType(stemp.type),
                    defaultShow: stemp.tableShow,
                    matchType: "lk"
                })
            }
        }
    });
    return {formDatas, columns}
};
const convertType = (type: string) => {
    if (type.includes("int") || type.includes("num")) {
        return "number";
    } else if (type.includes("date") || type.includes("time")) {
        return "datetime";
    } else {
        return "input";
    }
};

/**
 * 获取视图列表
 * @param viewToken
 * @param currentPage
 * @param pageSize
 * @param conditions
 */
export async function viewDataList(viewToken: string, currentPage: number, pageSize: number, conditions: any) {
    let dataPo = {
        fieldList: conditions,
        pageSize: pageSize || 20,
        currentPage: currentPage || 1
    };
    let viewDatas: any = [], error;
    load("数据加载中");
    await postRequest(`/userdb-manage/consumer/api/viewPageList/${viewToken}`, dataPo).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            error = redata.cnMessage;
        } else {
            viewDatas = redata.data;
        }
    }).finally(() => {
        closeLoad();
    });
    return {viewDatas, error};
};

/**
 * 解析查询字段类型
 * @param searchForm
 * @param searchFormData
 */
export function analysisSearchData(searchForm: any, searchFormData: any) {
    let searchFields = []
    for (let key in searchForm) {
        let val = searchForm[key]
        let temp = searchFormData.find((item: any) => item.fieldName == key)
        if (!!val) {
            if (temp?.type == 'datarange') {
                val = [val[0] + ' 00:00:00', val[1] + ' 23:59:59']
            } else if (temp?.type == 'date') {
                val = [val + ' 00:00:00', val + ' 23:59:59']
            }
            let param: SearchParams = {
                propertyName: key,
                operation: temp?.matchType || 'eq',
                value: val
            }
            searchFields.push(param)
        }
    }
    return searchFields;
}

/**
 * 获取数组重复数据
 * @param arr
 */
export function arrayDuplicateDatas(arr: Array<any>) {
    return [...new Set(arr)].filter(item => arr.indexOf(item) !== arr.lastIndexOf(item));
}

/**
 * 校验表单组件参数
 * @param compList
 */
export function validDynamicFormCompParams(compList: Array<any>, isSubmit: boolean = false) {
    let errorMsg = "";
    // console.log("校验表单组件参数完整性", compList);
    let {fieldList, tabNames, objectNames, batchNames} = analysisFields(compList);
    let dupTabNames = arrayDuplicateDatas(tabNames)
    let dupObjectNames = arrayDuplicateDatas(objectNames);
    let dupBatchNames = arrayDuplicateDatas(batchNames);
    if (dupTabNames.length > 0) {
        errorMsg = `Tab组件中tabName 名${dupTabNames.join(";")}重复，请在容器对应属性面板【基础属性->编辑容器属性】中检查所有Tab组件`;
    }
    if (dupObjectNames.length > 0) {
        errorMsg += `\nTab组件中objectName 名${dupObjectNames.join(";")}重复，请在容器对应属性面板【基础属性->编辑容器属性】中检查所有Tab组件`;
    }
    if (dupBatchNames.length > 0) {
        errorMsg += `\nTable组件中集合名称${dupBatchNames.join(";")}重复，请在容器对应属性面板【基础属性->集合名称】中检查所有Table组件`;
    }
    /**
     * 主要校验 参数是否重名，必须的参数是否赋值，参数数据合法性，此举旨在保证数据提交后可以正常运行，
     */
    // console.log(fieldList);
    // let fieldNames: Array<String> = [];
    for (let index in fieldList) {
        let temp = fieldList[index];
        let preps = temp.preps;
        let name = preps.label;
        let msg = "";
        let itemType = temp.itemType;
        if (itemType == "dialog-input" || itemType == "page-select") {
            let temp = "\n" + name + "组件必须在【属性面板->基础属性->参数配置】中";
            if (!preps.dataUrl || !preps.dataUrl?.condition) {
                msg += `,配置Url地址`;
            }
            if (!preps.fieldLists || preps.fieldLists?.length == 0) {
                msg += `,配置显示属性`;
            }
            if (!preps.needField || preps.needField?.length <= 1) {
                msg += `,配置回调字段`;
            }
            if (msg.length > 0) {
                msg = temp + msg;
            }
        } else if (itemType == "select" || itemType == "transfer" || itemType == "autocomplete" || itemType == "cascade") {
            console.log(preps);
            if ((!preps.values || preps.values?.length <= 0) && !preps.urlOrDictName) {
                msg = "\n" + name + "组件必须在【属性面板->基础属性->数据源】中配置数据源";
            }
        } else if (itemType == "checkbox" || itemType == "radio") {
            if (!preps.values || preps.values?.length <= 0) {
                msg = "\n" + name + "组件必须在【属性面板->基础属性】中配置候选项";
            }
        }
        if (msg.length > 0) {
            errorMsg += msg;
        }
    }
    if (!errorMsg && !isSubmit) {
        success("校验通过");
    }
    return errorMsg;
}

/**
 * 解析组件
 * @param compList
 */
export function analysisFields(compList: Array<any>) {
    let fieldList: Array<any> = [];
    let tabNames: Array<String> = [];
    let objectNames: Array<String> = [];
    let batchNames: Array<String> = [];
    let loopAnalysis = (boxList: Array<any>) => {
        for (let index in boxList) {
            let columns = boxList[index].columns;
            for (let sindex in columns) {
                let items = columns[sindex].items;
                normalAnalysis(items)
            }
        }
    };

    let tabListAnalysis = (tabList: Array<any>) => {
        for (let index in tabList) {
            let temp = tabList[index];
            tabNames.push(temp.tabName);
            objectNames.push(temp.objectName);
            normalAnalysis(temp.items);
        }
    };
    let tableListAnalysis = (tableObject?: any) => {
        if (tableObject && Object.keys(tableObject).length > 0) {
            batchNames.push(tableObject.batchFieldName);
            let tableList = tableObject.elements;
            for (let index in tableList) {
                let temp = tableList[index];
                normalAnalysis(temp.items);
            }
        }
    };
    let normalAnalysis = (dataList: any) => {
        if (dataList?.length > 0) {
            for (let index in dataList) {
                let temp = dataList[index];
                let itempType = temp.itemType;
                if (itempType == "box") {
                    loopAnalysis(temp.preps.elements);
                } else if (itempType == "tab") {
                    tabListAnalysis(temp.preps.elements);
                } else if (itempType == "table") {
                    tableListAnalysis(temp.preps);
                } else {
                    if (Object.keys(temp).length > 0) {
                        fieldList.push(temp);
                    }
                }
            }
        }
    };
    normalAnalysis(compList);
    return {fieldList, tabNames, objectNames, batchNames};
}
