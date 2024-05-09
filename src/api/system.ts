import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchParams} from "@/components/types/Params";
import {createCondition} from "@/api/sh_api";
import {Ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps";
import {warning} from "@/utils/message";

/**
 * 点击事件
 * @param treeComp 树组件对象
 * @param tableComp 表格组件对象
 * @param dataForm form表单数据
 * @param data 树节点
 * @param checked
 */
export function treeCheckChange(treeComp: any, tableComp: any, dataForm: any, data: TreeNodeData, checked: boolean) {
    let checkedNodes = treeComp.getCheckedNodes();
    if (checkedNodes?.length > 0) {
        checkedNodes.forEach(item => {
            treeComp.setChecked(item.value, false);
        });
    }
    dataForm["informationsSingleId"] = parseInt(data.value);
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
export function parseFormData(dataList: any, name) {
    const filterRecursive = (node) => {
        // 如果节点是数组，则对每个元素应用过滤逻辑
        if (Array.isArray(node)) {
            const result: Array = node.map(child => filterRecursive(child)).filter((item) => item !== null);
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