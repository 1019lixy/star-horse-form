import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchInfo, SearchParams} from "@/components/types/Params";
import {createCondition, loadData} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import {useDark, useToggle} from "@vueuse/core";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {v4 as uuidv4} from "uuid";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {DyCompField} from "@/components/types/DyCompField";
import {createApp} from "vue";

const validUrl: string = "/userdb-manage/redirect/valid";
const redirectUrl: string = "/userdb-manage/redirect/valid";
const configStore = GlobalConfig(piniaInstance);

/**
 * UUID
 */
export function uuid() {
    return uuidv4();
}

/**
 * 点击事件
 * @param treeComp 树组件对象
 * @param tableComp 表格组件对象
 * @param dataForm form表单数据
 * @param data 树节点
 * @param checked
 */
export function treeCheckChange(tableComp: any, data: TreeNodeData) {
    // const checkedNodes = treeComp.getCheckedNodes();
    // if (checkedNodes?.length > 0) {
    //     checkedNodes.forEach((item: any) => {
    //         treeComp.setChecked(item.value, false);
    //     });
    // }
    // dataForm["idInformations"] = data.value;
    // treeComp.setChecked(data.value, (checked instanceof Boolean) ? checked : true);
    // if (!checked) {
    //     return;
    // }
    const conditions: Array<SearchParams> = [];
    // if (checked) {
    conditions.push(createCondition("idInformations", data.value));
    // }
    tableComp.setDataInfo(conditions, null);
    searchData(tableComp, conditions);
}

/**
 * 调用Table组件查询数据
 * @param tableComp
 * @param data
 */
export function searchData(tableComp: any, data: SearchParams[]) {
    tableComp.createSearchParams(data);
};

/**
 * 解析属性
 * @param dataList
 * @param name
 */
export function parseFormData(dataList: any, name: string) {
    const filterRecursive = (node: any) => {
        // 如果节点是数组，则对每个元素应用过滤逻辑
        if (Array.isArray(node)) {
            const result: Array<any> = node.map(child => filterRecursive(child)).filter((item) => item !== null);
            return result;
        }
        const containsData = node.preps.name == name;
        return containsData ? node : null;
    }
    const filterDatas = filterRecursive(dataList);
    return filterDatas.length > 0 ? filterDatas[0] : {};
}

/**
 * 获取打印机列表
 */
export async function printerList(): Promise<Array<SelectOption>> {
    const getData = {
        type: "getPrinter"
    };
    const options: Array<SelectOption> = [];
    //创建一个实例
    const ws = new WebSocket("ws://127.0.0.1:55333");
    //用于指定连接成功后的回调函数
    ws.onopen = (_evt) => {
        console.log("Connection open ...");
        ws.send(JSON.stringify(getData));
    };
    //用于指定连接关闭后的回调函数
    ws.onclose = (_event) => {
        // let _code: number = event.code;
        // let _reason: string = event.reason;
        // let _wasClean: boolean = event.wasClean;
    };
    //
    return await new Promise((resolve, reject) => {
        //用于指定收到服务器数据后的回调函数
        ws.onmessage = (event) => {
            const data = event.data;
            const printers = JSON.parse(data)["data"];
            if (printers) {
                printers.forEach((item: any) => {
                    options.push({name: item, value: item});
                });
                resolve(options);
            } else {
                reject("获取打印机失败");
            }
        };
    });
}

/**
 * 升序或者降序
 */
export function ascOrDesc(): SelectOption[] {
    const options: SelectOption[] = [];
    options.push({name: "Asc", value: "asc"});
    options.push({name: "Desc", value: "desc"});
    return options;
}

/**
 * 请求方式
 */
export function httpMethod(): SelectOption[] {
    const options: SelectOption[] = [];
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
    const options: SelectOption[] = [];
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
    const checkParams: any = {
        url,
        httpMethod: requestType.toUpperCase(),
        dataType,
        params: params
    };
    const data = await loadData(validUrl, checkParams);
    return {...data};
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
    const checkParams: any = {
        url,
        httpMethod: requestType.toUpperCase(),
        dataType,
        params: params,
        searchInfo
    };
    const data = await loadData(redirectUrl, checkParams);
    return data;
}

export const isDark = useDark();
isDark.value = false;
export const toggle = useToggle(isDark);
export const toggleDark = (val: string) => {
    // event.stopPropagation();
    // event.preventDefault();
    //
    if (val == "dark") {
        configStore.clearAll("Y");
        const dark = "#141414";
        document.documentElement.style.setProperty('--star-horse-style', dark)
        document.documentElement.style.setProperty('--el-color-primary', dark)
        document.documentElement.style.setProperty('--el-select-input-color', dark)
        document.documentElement.style.setProperty('--star-horse-shadow', dark)
        document.documentElement.style.setProperty('--star-horse-background', dark)
        document.documentElement.style.setProperty('--el-pagination-button-color', dark)
        document.documentElement.style.setProperty('--el-tree-expand-icon-color', dark)

    } else {
        document.documentElement.style.setProperty('--star-horse-background', "#fff");
        document.documentElement.style.setProperty('--star-horse-shadow', "#f7f7f9");
        configStore.clearAll();
    }
    console.log(event, isDark);
    toggle();

}


const complexFields = (items: Array<any>) => {
    for (const index in items) {
        const item = items[index];
        if (item.compType == "container") {
            const sitems = item.preps.elements;
            for (const sindex in sitems) {
                complexFields(sitems[sindex].items);
            }
        } else {
            item.id = item.id + "Copy";
        }
    }
}

/**
 * 批量修改公共属性
 * @param items
 * @param val
 * @param fieldName
 */
export const batchModifyAction = (items: Array<any>, val: any, fieldName: string) => {
    for (const index in items) {
        const item = items[index];
        if (item.compType == "container") {
            const sitems = item.preps.elements;
            for (const sindex in sitems) {
                const col = sitems[sindex];
                if (col.columns) {
                    col.columns.forEach((temp: any) => {
                        batchModifyAction(temp.items, val, fieldName);
                    })
                } else {
                    batchModifyAction(col.items, val, fieldName);
                }

            }
        } else {
            item.preps[fieldName] = val;
        }
    }
}
/**
 * 拷贝容器
 * @param parentComp
 * @param containerType
 * @param currentContainer
 */
export const copyContainer = (parentComp: Array<any>, currentContainer: any) => {
    if (!currentContainer) {
        return;
    }
    const containerType = currentContainer.itemType;
    const container = JSON.parse(JSON.stringify(currentContainer));
    //box和dytable 有列属性
    if (containerType == "box" || containerType == "dytable") {
        const rows = container.preps.elements;
        for (const index in rows) {
            const row = rows[index];
            for (const cIndex in row.columns) {
                const col = row.columns[cIndex];
                col._uuid = uuid();
                complexFields(col.items);
            }
        }
    } else {
        const rows = container.preps.elements;
        for (const index in rows) {
            complexFields(rows[index].items);
        }
    }
    parentComp.push(container);
}

/**
 * 公共字段
 */
export function commonField() {
    let fields: FieldInfo[] = [];
    fields.push({
        label: "创建人", fieldName: "createdBy", type: "input",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "创建日期", fieldName: "createdDate", type: "date",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "修改人", fieldName: "updatedBy", type: "input",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "修改日期", fieldName: "updatedDate", type: "date",
        formShow: false,
        tableShow: false
    });

    fields.push({
        label: "数据编号", fieldName: "dataNo", type: "input",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "数据版本号", fieldName: "version", type: "number",
        formShow: false,
        tableShow: false
    });

    fields.push({
        label: "状态", fieldName: "statusName", type: "input",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "状态码", fieldName: "statusCode", type: "input",
        formShow: false,
        tableShow: false
    });

    fields.push({
        label: "国际码", fieldName: "local", type: "input",
        formShow: false,
        tableShow: false
    });
    fields.push({
        label: "是否已逻辑", fieldName: "isDel", type: "number",
        formShow: false,
        tableShow: false
    });

    return fields;
}

/**
 * 动态创建组件
 * @param compInfo 组件信息
 */
export function createComponent(compInfo: DyCompField) {
    const app = createApp({});
    app.component(compInfo.name, {
        template: compInfo.template,
        data: () => compInfo.data || {},
        props: compInfo.props || {},
        methods: compInfo.methods,
        onMounted: compInfo.onMounted,
        emits: compInfo.emits,
    });
    return app.component(compInfo.name);
}

/**
 * 删除查询条件中出现的空值和空对象
 * @param condition
 */
export function removeEmptyCondition(condition: SearchParams[]): SearchParams {
    if (!condition || condition.length == 0) {
        return [];
    }
    let params: SearchParams[] = [];
    for (let a in condition) {
        let temp = condition[a];
        if (temp && Object.keys(temp).length > 0) {
            params.push(temp);
        }
    }
    return params;
}
