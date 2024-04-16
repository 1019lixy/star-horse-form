import {postRequest} from "@/api/star_horse";
import {error} from "@/utils/message";
import {closeLoad, load} from "@/api/sh_api";
import {Params} from "@/components/types/Params";

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
                if (stemp.primaryFlag == "yes") {
                    continue;
                }
                formDatas.push({
                    label: stemp.comment,
                    fieldName: key + "&" + stemp.name,
                    type: stemp.type,
                    matchType: "lk"
                })
            }
        }
    });
    return {formDatas, columns}
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
            let param: Params = {
                propertyName: key,
                operation: temp?.matchType || 'eq',
                value: val
            }
            searchFields.push(param)
        }
    }
    return searchFields;
};