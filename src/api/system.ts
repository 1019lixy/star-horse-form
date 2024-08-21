import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchInfo, SearchParams} from "@/components/types/Params";
import {createCondition, loadData} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import {useDark, useToggle} from "@vueuse/core";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {v4 as uuidv4} from "uuid";

const validUrl: string = "/userdb-manage/redirect/valid";
const redirectUrl: string = "/userdb-manage/redirect/valid";
let configStore = GlobalConfig(piniaInstance);

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
    dataForm["informationsSingleId"] = data.value;
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
            let data = event.data;
            let printers = JSON.parse(data)["data"];
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

export const isDark = useDark();
isDark.value = false;
export const toggle = useToggle(isDark);
export const toggleDark = (val: string) => {
    // event.stopPropagation();
    // event.preventDefault();
    //
    if (val == "dark") {
        configStore.clearAll("Y");
        let dark = "#141414";
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

/**
 * 定义td 数据
 */
export const colDataInfo = () => {
    return {id: "dytable" + uuidv4(), colspan: 1, rowspan: 1, items: []}
}
/**
 * 左方插入列
 */
const insertLeftCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let position = props.isFirstCol ? 0 : props.colIndex - 1;
    for (let index = 0; index < rows.length; index++) {
        let cols = rows[index].columns;
        cols.splice(position, 0, colDataInfo())
    }

};
const insertRightCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let position = props.isLastCol ? props.colIndex : props.colIndex + 1;
    for (let index = 0; index < rows.length; index++) {
        let cols = rows[index].columns;
        cols.splice(position, 0, colDataInfo());
    }
};
const insertAboveRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let len = 1;
    let cols: Array<any> = [];
    for (let index = 0; index < rows.length; index++) {
        let colLen = rows[index].columns.length;
        if (colLen > len) {
            len = colLen;
        }
    }
    for (let i = 0; i < len; i++) {
        cols.push(colDataInfo());
    }
    let position = props.isFirstRow ? 0 : props.rowIndex - 1;
    rows.splice(position, 0, cols);

};
const insertBelowRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let len = 1;
    let cols: Array<any> = [];
    for (let index = 0; index < rows.length; index++) {
        let colLen = rows[index].columns.length;
        if (colLen > len) {
            len = colLen;
        }
    }
    for (let i = 0; i < len; i++) {
        cols.push(colDataInfo());
    }
    let position = props.isLastRow ? props.rowIndex : props.rowIndex + 1;
    rows.splice(position, 0, cols);
};
const mergeLeftCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    col.colspan = col.colspan + 1;
    row.columns.splice(props.colIndex - 1, 1);
};
const mergeRightCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    col.colspan = col.colspan + 1;
    row.columns.splice(props.colIndex + 1, 1);
};
const mergeWholeCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let currentCol: any = {};
    for (let index in rows) {
        let row = rows[index];
        let cols = row.columns;
        for (let cIndex in cols) {
            let col = cols[cIndex];
            if (cIndex == props.colIndex) {
                if (index == props.rowIndex) {
                    currentCol = col;
                } else {
                    cols.splice(cIndex, 1);
                }
            }
        }
    }
    currentCol.rowspan = rows.length;
};
const mergeAboveRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    let aboveRow = rows[props.rowIndex - 1];
    col.rowspan = col.rowspan + 1;
    for (let index in aboveRow.columns) {
        if (index == props.colIndex) {
            aboveRow.columns.splice(index, 1, col);
            break;
        }
    }
    for (let index in row.columns) {
        if (index == props.colIndex) {
            row.columns.splice(index, 1);
            break;
        }
    }

};
const mergeBelowRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    col.rowspan = col.rowspan + 1;
    let belowRow = rows[props.rowIndex + 1];
    for (let index in belowRow.columns) {
        if (index == props.colIndex) {
            belowRow.columns.splice(index, 1);
            break;
        }
    }
};
const mergeWholeRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    let totalCols: number = 0;
    for (let index in row.columns) {
        let col = row.columns[index];
        totalCols += col.colspan;
    }
    col.colspan = totalCols;
    row.columns = [col];
};
/**
 * 需要判断需要还原的周边数据
 * @param props
 */
const undoMergeRow = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    if (row.columns.length == 1) {
        //说明是合并了整行
        col.colspan = col.colspan - 1;
        row.columns.splice(props.colIndex, 0, colDataInfo());
    } else {
        col.rowspan = col.rowspan - 1;
        row.columns.splice(props.colIndex, 1, colDataInfo());
        rows[props.rowIndex + 1].columns.splice(props.colIndex, 0, col);
    }
};
/**
 * 需要判断要还原的周边数据
 * @param props
 */
const undoMergeCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    let row = rows[props.rowIndex];
    let col = row.columns[props.colIndex];
    //如果 列的行合并和整个表格的行相同，则表示已合并的整列
    if (col.rowspan == rows.length) {
        col.rowspan = col.rowspan - 1;
        //在当前位置插入新的单元格
        row.columns.splice(props.colIndex, 1, colDataInfo());
        //将数据移入下一行
        rows[props.rowIndex + 1].columns.push(col);
    } else {
        //在同一行合并了单元格
        col.colspan = col.colspan - 1;
        row.columns.splice(props.colIndex, 0, colDataInfo());
    }
};
/**
 * 删除整列，在删除列的同时需要，考虑合并的情况，否则有可能导致整行被删除
 * @param props
 */
const deleteWholeCol = (props: any) => {
    let rows = props.parentComp.preps.elements;
    for (let index in rows) {
        let cols = rows[index].columns;
        for (let sIndex in cols) {
            if (props.colIndex == sIndex) {
                cols.splice(sIndex, 1);
            }
        }
    }
};
const deleteWholeRow = (props: any) => {
    props.parentComp.preps.elements.splice(props.rowIndex, 1);
};

/**
 * 单元格操作方法
 * @param command
 * @param props
 */
export const tableCellOperation = (command: string, props: any) => {
    switch (command) {
        case "insertLeftCol":
            insertLeftCol(props);
            break;
        case "insertRightCol":
            insertRightCol(props);
            break;
        case "insertAboveRow":
            insertAboveRow(props);
            break;
        case "insertBelowRow":
            insertBelowRow(props);
            break;
        case "mergeLeftCol":
            mergeLeftCol(props);
            break;
        case "mergeRightCol":
            mergeRightCol(props);
            break;
        case "mergeWholeCol":
            mergeWholeCol(props);
            break;
        case "mergeAboveRow":
            mergeAboveRow(props);
            break;
        case "mergeBelowRow":
            mergeBelowRow(props);
            break;
        case "mergeWholeRow":
            mergeWholeRow(props);
            break;
        case "undoMergeRow":
            undoMergeRow(props);
            break;
        case "undoMergeCol":
            undoMergeCol(props);
            break;
        case "deleteWholeCol":
            deleteWholeCol(props);
            break;
        case "deleteWholeRow":
            deleteWholeRow(props);
            break;
    }
}
const mergeLeftColAction = (props: any) => {
    let rows = props.parentComp.preps.elements;
    //当前行
    let row: any = rows[props.rowIndex];
    //当前列
    let col = row.columns[props.colIndex];
    //上一行
    // let aboveRow: any = !props.isFirstRow ? rows[props.rowIndex - 1] : null;
    // if (aboveRow && !props.isFirstCol) {
    let leftLeftCol = row.columns[props.colIndex - 1];
    console.log(leftLeftCol,col);
    return col.rowspan>1? leftLeftCol.rowspan == col.rowspan : props.isFirstCol;
    // }
    //下一行
    // let belowRow: any = !props.isLastRow ? rows[props.rowIndex - 1] : null;
    // //当前列
    // let col = row.columns[props.colIndex];
    // let leftCol = !props.isFirstCol ? row.columns[props.colIndex - 1] : null;
    // let rightCol = !props.isLastCol ? row.columns[props.colIndex + 1] : null;
    // return props.isFirstCol;
}
const mergeRightColAction = (props: any) => {
    let rows = props.parentComp.preps.elements;
    //当前行
    let row: any = rows[props.rowIndex];
    //上一行
    let aboveRow: any = !props.isFirstRow ? rows[props.rowIndex - 1] : null;
    if (aboveRow && !props.isLastCol) {
        let aboveLeftCol = aboveRow.columns[props.colIndex + 1];
        return aboveLeftCol.rowspan > 1;
    }
    return props.isLastCol;
}
const mergeWholeColAction = (props: any) => {
    return true;
}
const mergeAboveRowAction = (props: any) => {
    return props.isFirstRow;
}
const mergeBelowRowAction = (props: any) => {
    return props.isLastRow;
}
const mergeWholeRowAction = (props: any) => {
    return true;
}
/**
 * 单元格按钮是否可点击控制
 * @param command
 * @param props
 */
export const tableAction = (command: string, props: any): boolean => {
    switch (command) {
        case "mergeLeftCol":
            return mergeLeftColAction(props);
        case "mergeRightCol":
            return mergeRightColAction(props);
        case "mergeWholeCol":
            return mergeWholeColAction(props);
        case "mergeAboveRow":
            return mergeAboveRowAction(props);
        case "mergeBelowRow":
            return mergeBelowRowAction(props);
        case "mergeWholeRow":
            return mergeWholeRowAction(props);
        case "undoMergeRow":
            return props.field.rowspan == 1;
        case "undoMergeCol":
            return props.field.colspan == 1;
        default:
            return false;
    }
}
