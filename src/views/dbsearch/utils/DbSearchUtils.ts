import {loadGetData} from "@/api/sh_api.ts";
import {warning} from "@/utils/message.ts";
import {SelectOption} from "@/components/types/SearchProps";

/**
 * 初始化当前用户权限的数据库配置信息
 */
export async function initDbList(): Array<SelectOption> {
    let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbinfoEntity/getDbInfoByUser");
    if (error) {
        warning(error);
        return
    }
    let redata: Array<SelectOption> = [];
    data.forEach(item => {
        redata.push({
            name: item.name,
            value: item.configId + ""
        })
    })
    return redata;
}

/**
 * 获取所有数据库表信息
 * @param configId
 */
export async function tableList(configId: number): Array<SelectOption> {
    let {data, error} = await loadGetData(`/dbsearch-manage/dbsearch/dbinfoEntity/tableList/${configId}`);
    if (error) {
        warning(error);
        return
    }
    let redata: Array<SelectOption> = [];
    data.forEach(item => {
        if (!item.tableName.includes("BIN$")) {
            redata.push({
                name: (item.comment || '') + `(${item.tableName})`,
                value: item.tableName
            })
        }

    })
    return redata;
}
