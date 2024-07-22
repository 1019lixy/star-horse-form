import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchInfo, SearchParams} from "@/components/types/Params";
import {createCondition,loadData} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
const validUrl: string = "/userdb-manage/redirect/valid";
const redirectUrl: string = "/userdb-manage/redirect/valid";

/**
 * 点击事件
 * @param treeComp 树组件对象
 * @param tableComp 表格组件对象
 * @param dataForm form表单数据
 * @param data 树节点
 * @param checked
 */
export function treeCheckChange(treeComp: any, tableComp: any, dataForm: any, data: TreeNodeData, checked: any) {
    let checkedNodes = treeComp.getCheckedNodes();
    if (checkedNodes?.length > 0) {
        checkedNodes.forEach((item: any) => {
            treeComp.setChecked(item.value, false);
        });
    }
    dataForm.value["informationsSingleId"] = data.value;
    treeComp.setChecked(data.value, (checked instanceof Boolean) ? checked : true);
    if (!checked) {
        return;
    }
    let conditions: Array<SearchParams> = [];
    if (checked) {
        conditions.push(createCondition("informationsSingleId", data.value));
    }
    tableComp.setDataInfo(conditions, null);
    searchData(tableComp, conditions);
};

/**
 * 调用Table组件查询数据
 * @param tableComp
 * @param data
 */
export function searchData(tableComp: any, data: SearchParams[]) {
    tableComp.createCreateParams(data);
};

/**
 * 解析属性
 * @param dataList
 * @param name
 */
export function parseFormData(dataList: any, name:string) {
    const filterRecursive = (node:any) => {
        // 如果节点是数组，则对每个元素应用过滤逻辑
        if (Array.isArray(node)) {
            const result: Array<any> = node.map(child => filterRecursive(child)).filter((item) => item !== null);
            return result;
        }
        const containsData = node.preps.name == name;
        return containsData ? node : null;
    }
    let filterDatas = filterRecursive(dataList);
    return filterDatas.length > 0 ? filterDatas[0] : {};
}

/**
 * 获取打印机列表
 */
export async function printerList(): Promise<Array<SelectOption>> {
    let getData = {
        type: "getPrinter"
    };
    let options: Array<SelectOption> = [];
    //创建一个实例
    let ws = new WebSocket("ws://127.0.0.1:55333");
    //用于指定连接成功后的回调函数
    ws.onopen = (evt) => {
        console.log("Connection open ...");
        ws.send(JSON.stringify(getData));
    };
    //用于指定连接关闭后的回调函数
    ws.onclose = (event) => {
        let code = event.code;
        let reason = event.reason;
        let wasClean = event.wasClean;
    };
    //
    return await new Promise((resolve, reject) => {
        //用于指定收到服务器数据后的回调函数
        ws.onmessage = (event) => {
            let data = event.data;
            let printers = JSON.parse(data)["data"];
            if (printers) {
                printers.forEach((item: any) => {
                    options.push({name: item, value: item});
                });
                resolve(options);
            } else {
                inject("获取打印机失败");
            }
        };
    });
}

/**
 * 升序或者降序
 */
export function ascOrDesc(): SelectOption[] {
    let options: SelectOption[] = [];
    options.push({name: "Asc", value: "asc"});
    options.push({name: "Desc", value: "desc"});
    return options;
}

/**
 * 请求方式
 */
export function httpMethod(): SelectOption[] {
    let options: SelectOption[] = [];
    options.push({name: "GET", value: "GET"});
    options.push({name: "HEAD", value: "HEAD"});
    options.push({name: "POST", value: "POST"});
    options.push({name: "PUT", value: "PUT"});
    options.push({name: "PATCH", value: "PATCH"});
    options.push({name: "DELETE", value: "DELETE"});
    options.push({name: "OPTIONS", value: "OPTIONS"});
    options.push({name: "TRACE", value: "TRACE"});
    return options;
}

/**
 * 数据格式
 */
export function dataType(): SelectOption[] {
    let options: SelectOption[] = [];
    options.push({name: "FORM", value: "FORM"});
    options.push({name: "JSON", value: "JSON"});
    options.push({name: "BINARY", value: "BINARY"});
    return options;
}

/**
 * 验证接口，并取回数据
 * @param url
 * @param params 参数
 * @param dataType 数据类型 FORM,JSON 默认JSON
 * @param requestType 接口请求方式 POST,GET,PUT,DELETE
 */
export async function validDataUrl(url: string, params?: any, dataType: string = "JSON", requestType: string = "POST") {
    let checkParams: any = {
        url,
        httpMethod: requestType.toUpperCase(),
        dataType,
        params: params
    };
    let data = await loadData(validUrl, checkParams);
    return data;
}

/**
 * 通过系统重定向接口
 * @param url 接口地址
 * @param params 参数
 * @param searchInfo 查询信息
 * @param dataType 请求数据类型
 * @param requestType 请求类型
 */
export async function redirectUrlOperation(url: string, searchInfo?: SearchInfo, params?: any,
                                           dataType: string = "JSON", requestType: string = "POST") {
    let checkParams: any = {
        url,
        httpMethod: requestType.toUpperCase(),
        dataType,
        params: params,
        searchInfo
    };
    let data = await loadData(redirectUrl, checkParams);
    return data;
}
