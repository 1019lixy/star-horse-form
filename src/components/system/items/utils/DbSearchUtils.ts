import {
  apiInstance,
  closeLoad,
  error,
  load,
  getRequest,
  loadGetData,
  piniaInstance,
  SelectOption,
  useConsumerViewStore,
  warning,
} from "star-horse-lowcode";

const dbInfoUrl = apiInstance("userdb-manage", "dbsearch/dbinfo");
const consumerView = useConsumerViewStore(piniaInstance);

/**
 * 打开数据库，并返回所以表信息
 * @param configId
 */
export function openDatabase(configId: any): Promise<any> | null {
  if (!configId) {
    return null;
  }
  load("数据加载中");
  return new Promise<any>((resolve, reject) => {
    getRequest(`${dbInfoUrl.basePrefix}/openConn/${configId}`)
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
  const { data, error } = await loadGetData(
    `${dbInfoUrl.basePrefix}/getDbInfoByUser`,
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
  const { data, error } = await loadGetData(
    `${dbInfoUrl.basePrefix}/tableList/${configId}`,
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
    `${dbInfoUrl.basePrefix}/tableColumns/${configId}/${tableName}`,
  )
    .then((res: any) => {
      if (res.data.code != 0) {
        warning(res.data.cnMessage);
        return;
      }
      redata = res.data.data;
      consumerView.addTableInfo(tableName, redata);
    })
    .catch((err: any) => {
      console.error("Error fetching table columns:", err);
    })
    .finally(() => {
      closeLoad();
    });
  return redata;
}
