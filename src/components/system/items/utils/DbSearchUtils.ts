import {
    ApiUrls,
    closeLoad,
    error,
    getConsumerViewStore,
    getRequest,
    load,
    loadGetData,
    SelectOption,
    warning,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {ref} from "vue";

const dbInfoApi = ref<ApiUrls>();

export function initApi(api: ApiUrls) {
    dbInfoApi.value = api;
}

/**
 * 打开数据库，并返回所以表信息
 * @param configId
 */
export function openDatabase(configId: any): Promise<any> | null {
    if (!configId) {
        return null;
    }
    load(i18n("dyform.utils.585"));
    return new Promise<any>((resolve, reject) => {
        getRequest(`${dbInfoApi.value.customerUrl1}/${configId}`)
            .then((res: any) => {
                if (res.data.code != 0) {
                    error(res.data.cnMessage);
                    return;
                }
                resolve(res.data.data);
            })
            .catch((err: any) => {
                reject(err);
            })
            .finally(() => {
                closeLoad();
            });
    });
}

/**
 * 初始化当前用户权限的数据库配置信息
 */
export async function initDbList(): Promise<Array<SelectOption>> {
    const {data, error} = await loadGetData(
        `${dbInfoApi.value.customerUrl2}`,
    );
    if (error) {
        warning(error);
        return [];
    }
    const redata: Array<SelectOption> = [];
    data.forEach((item: any) => {
        redata.push({
            name: item.name,
            value: item.configId + "",
        });
    });
    return redata;
}

/**
 * 获取数据库所有表信息
 * @param configId
 */
export async function tableList(
    configId: number,
): Promise<Array<SelectOption>> {
    const {data, error} = await loadGetData(
        `${dbInfoApi.value.customerUrl3}/${configId}`,
    );
    if (error) {
        warning(error);
        return [];
    }
    const redata: Array<SelectOption> = [];
    data.forEach((item: any) => {
        if (!item.tableName.includes("BIN$")) {
            redata.push({
                name: (item.comment || "") + `(${item.tableName})`,
                value: item.tableName,
            });
        }
    });
    return redata;
}

/**
 * 获取指定表的所有字段信息
 * @param configId 数据库配置Id
 * @param tableName 表名
 */
export async function tableColumns(
    configId: any,
    tableName: string,
): Promise<Array<any>> {
    let redata: Array<any> = [];
    if (!tableName) {
        return redata;
    }
    // load("数据加载中");
    await getRequest(
        `${dbInfoApi.value.customerUrl4}/${configId}/${tableName}`,
    )
        .then((res: any) => {
            if (res.data.code != 0) {
                warning(res.data.cnMessage);
                return;
            }
            redata = res.data.data;
            getConsumerViewStore().addTableInfo(tableName, redata);
        })
        .catch((err: any) => {
            console.error("Error fetching table columns:", err);
        })
        .finally(() => {
            closeLoad();
        });
    return redata;
}
