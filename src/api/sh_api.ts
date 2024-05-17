import {SearchParams} from "@/components/types/Params";
import {reactive, ShallowRef} from "vue";
import {ElLoading} from "element-plus";
import {useRoute} from "vue-router";
import {getRequest, permissionResources, postRequest} from "@/api/star_horse";
import {confirm, error, success, warning} from "@/utils/message";
import {SelectOption} from "@/components/types/SearchProps";
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import {MenusInfo} from "@/components/types/MenusInfo";
import {getCustomerParam} from "@/utils/auth";
import mitter from "@/api/eventbus";
import {FieldInfo, PageFieldInfo, TabFieldInfo} from "@/components/types/PageFieldInfo";

let loading: any = null;
/**
 * 系统接口
 */
const systemUrl: string = "/system-config/system/informationsEntity/systemTree";
/**
 * 部门接口
 */
const departUrl: string = "/system-config/system/departmentEntity/getAllByCondition";
/**
 * 字典接口
 */
const dictUrl: string = "/system-config/system/dictinfoEntity/getAllByCondition";
/**
 * MES系统数据字段
 */
const mesDictUrl: string = "/base-manage/base/dictVal/getAllByCondition";
/**
 * 获取所有菜单
 */
const menuUrl: string = "/system-config/system/menusinfoEntity/getAllTreeDataByCondition";
/**
 * 归属主体
 */
const customerUrl: string = "/system-config/system/customer/getAllByCondition";

/**
 * 加载Post 数据
 * @param url 接口地址
 * @param params 参数
 */
export async function loadData(url: string, params: SearchParams[] | any) {
    let data = reactive([]);
    let error = "";
    let cond = params;

    if (params instanceof Array) {
        cond = {
            fieldList: params
        }
    }
    await postRequest(url, cond).then((res: any) => {
        let redata = res.data;
        if (redata.code != 0) {
            error = redata.cnMessage;
        } else {
            data = redata.data || redata.dataList;
        }
    }).catch(err => {
        error = err;
    });
    return {
        data, error
    }
}


/**
 * 加载Get 数据
 * @param url 接口地址
 * @param params 参数
 */
export async function loadGetData(url: string) {
    let data = reactive<any>([]);
    let error: string = "";
    await getRequest(url).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            error = redata.cnMessage;
        } else {
            data = redata.data;
        }
    }).catch(err => {
        error = err;
    });
    return {
        data, error
    }
}

/**
 * 加载所有系统信息
 * @param params 查询参数
 */
export async function loadSystemInfo(params: any) {
    let systemList: SelectOption[] = [];
    await postRequest(systemUrl, {
        fieldList: params
    }).then(res => {
        let redata = res.data;
        if (redata.code == 0) {
            let data = redata.data;
            if (redata.data) {
                systemList = createTree(data, "", "sysName", "idInformations")
            }
        }
    }).catch(err => {
        console.error(err);
    });
    return systemList;
}

/**
 * 加载所有主体信息
 * @param params 查询参数
 */
export async function loadCustomInfo(params: any) {
    let customerList: SelectOption[] = [];
    await postRequest(customerUrl, {
        fieldList: params
    }).then(res => {
        let redata = res.data;
        if (redata.code == 0) {
            let data = redata.data;
            if (redata.data) {
                data.forEach((item: any) => {
                    let temp: SelectOption = {name: item.customerName, value: item.idCustomer};
                    customerList.push(temp);
                });
            }
        }
    }).catch(err => {
        console.error(err);
    });
    return customerList;
}

/**
 * 加载部门信息
 * @param param 查询参数
 */
export async function loadDepartmentInfo(param: any) {
    let deptData: SelectOption[] = [];
    await postRequest("/system-config/system/departmentEntity/deptTree", {
        fieldList: param
    }).then(res => {
        if (res.data.code != 0) {
            console.warn(res.data.cnMessage);
        } else {
            let redata = res.data.data;
            deptData = createTree(redata, "", "deptName", "idDepartment");
        }
    }).catch(err => console.error(err));
    return deptData;
}

/**
 * 获取角色信息
 * @param param
 */
export async function loadRolesInfo(param: any) {
    let roleData: SelectOption[] = [];
    await postRequest("/system-config/system/rolesinfoEntity/queryUserAllRoles", {
        fieldList: param
    }).then(res => {
        if (res.data.code != 0) {
            console.warn(res.data.cnMessage);
        } else {
            let redata = res.data.data;
            redata.forEach((item: any) => {
                roleData.push({name: item.roleName, value: item.idRolesinfo});
            });
        }
    }).catch(err => console.error(err))
    return roleData;
}

/**
 * 加载菜单数据
 * @param direct
 * @param params
 */
export async function loadMenusInfo(direct: boolean, params: any, needSystem: boolean) {
    let menuDatas: any = [];
    await postRequest(`${menuUrl}/${needSystem}`, {
        fieldList: params,
        orderBy: [{fieldName: "informationsSingleId"}]
    }).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            console.warn(redata.cnMessage);
        } else {
            if (direct) {
                menuDatas = redata.data;
            } else {
                //构建菜单树
                menuDatas = createTree(redata.data, "", "menuName", "idMenusinfo");
            }
        }
    }).catch(err => {
        console.error(err);
    });
    return menuDatas;
}


/**
 * 构建菜单树
 * @param data
 */
export function createTree(data: any, valField: string, name: string, val: string) {
    let list: SelectOption[] = [];
    data.forEach((item: any) => {
        let temp = {};
        temp["value"] = valField ? item[valField] : parseInt(item[val]);
        temp["name"] = item[name];
        if (item.children && item.children.length > 0) {
            temp["children"] = createTree(item.children, valField, name, val);
        }
        list.push(temp);
    });
    return list;
}


/**
 * 加载框
 */
export function load(msg: string) {
    closeLoad();
    loading = ElLoading.service({
        lock: true,
        target: "#app",
        text: msg || 'Loading...',
        background: 'rgba(0, 0, 0, 0.7)',
    });
}

/**
 * 关闭加载框
 */
export function closeLoad() {
    if (loading) {
        loading.close();
        loading = null;
    }
}

/**
 * 加载权限
 */
export async function loadPagePermission() {
    let permission = {};
    let meta = useRoute().meta;
    let menuId = meta?.menuId as string;
    if (!menuId) {
        return {permission};
    }

    menuId = menuId.split("_")[1];
    let data = {"menuId": menuId};
    await permissionResources(data).then(res => {
        let redata = res.data.data;
        redata.forEach((item: any) => {
            permission[item.resCode] = item.resCode;
        });
    });
    return {permission}
};

export function commonDataFormat(row: any, column: any, cellValue: any, index: number) {
    return commonParseCodeToName(column.property, cellValue);
};

/**
 * 下划线转驼峰
 * @param str
 */
export function convertToCamelCase(str: string) {
    if (!str) {
        return undefined;
    }
    return str.replace(/_([a-z])/g, function (match, p1) {
        return p1.toUpperCase();
    });
};

/**
 * 数据格式化
 * @param name
 * @param cellValue
 */
export function commonParseCodeToName(name: string, cellValue: any) {
    if (!cellValue && cellValue != 0) {
        return "-";
    }
    if (name == "isDel") {
        return cellValue == 1 ? "是" : "否";
    }
    if (name == "state") {
        return cellValue == 1 ? "正常" : "异常";
    }
    let preps: Array<String> = ["createdTime", "updatedTime", "createdDate", "updatedDate", "createTime", "editTime"];
    let result = preps.find(item => convertToCamelCase(name)?.toLowerCase() === item.toLowerCase());
    if (result) {
        return createDatetime(cellValue);
    } else {
        return cellValue;
    }
};

/**
 * 创建日期
 * @param val
 * @returns {string}
 */
export function createDate(val: any) {
    if (!val) {
        return "--";
    }
    let date = new Date(val);
    return date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate();
};


/**
 * 创建年月日时分秒
 * @param val
 */
export function createDatetime(val: any) {
    if (!val || val == "undefined" || val == "-") {
        return "--";
    }
    let date = new Date(val);
    let m = (date.getMonth() + 1);
    let m1 = m < 10 ? "0" + m : m;
    let day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    let hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
    let minute = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
    return date.getFullYear() + "-" + m1 + "-" + day + " " + hour + ":" + minute;
};

/**
 * 加载Id数据
 * @param url
 * @param id
 */
export async function loadById(url: string, id: any, isView: boolean) {
    if (!url || !id) {
        warning("请提供正确的数据");
        return;
    }
    let objData: any = {};
    await getRequest(url + (isView ? "ForView" : "") + "/" + id).then(res => {
        let redata = res.data.data;
        if (!redata) {
            warning("未找到对应数据");
        } else {
            objData = redata;
        }
    });
    return objData;
};


/**
 * 根据Id删除数据
 * @param url
 * @param id
 */
export async function deleteByIds(url: string, ids: any) {
    if (!url) {
        warning("请提供正确的数据");
        return;
    }
    if (!ids || ids.length == 0) {
        warning("请选择要删除的数据");
        return;
    }
    let objData: boolean = false;
    let confirmFlag: boolean = false;
    await confirm("确认需要删除选择的数据吗？").then((res: boolean) => {
        confirmFlag = res;
    });
    if (!confirmFlag) {
        return;
    }
    await postRequest(url, ids).then(res => {
        if (res.data.code == 0) {
            success(res.data.cnMessage);
        } else {
            warning(res.data.cnMessage);
        }
        closeLoad();
        objData = true;
    }).catch(err => {
        error("接口不存在或网络异常:" + err);
        objData = false;
    }).finally(() => {
        closeLoad();
    });
    return objData;
};

/**
 * 根据字典类别获取字典数据
 * @param dictType 字典类别
 * @param nameValueSame 名字和值取相同的
 */
export async function mesDictData(dictType: string, nameValueSame: boolean = true) {
    let query = [];
    query.push({
        "propertyName": "dictCode",
        "value": dictType
    });
    let dicts: SelectOption[] = [];
    await postRequest(mesDictUrl, {
        fieldList: query,
        orderBy: [{fieldName: "dispIndx", ascOrDesc: "asc"}]
    }).then(res => {
        let redata = res.data;
        if (redata.code == 0) {
            redata.data.forEach((item: any) => {
                dicts.push({name: item.value, value: nameValueSame ? item.value : item.code});
            });
        }

    }).catch(err => {
        console.log("接口不存在或网络异常", err);
    });
    return dicts;
};

/**
 * 根据字典类别获取字典数据
 * @param dictType 字典类别
 */
export async function dictData(dictType: string) {
    let query = [];
    query.push({
        "propertyName": "dictType",
        "value": dictType
    });
    let dicts: SelectOption[] = [];
    await postRequest(dictUrl, {fieldList: query}).then(res => {
        let redata = res.data;
        if (redata.code == 0) {
            redata.data.forEach((item: any) => {
                dicts.push({name: item.dictName, value: item.dictCode});
            });
        }

    }).catch(err => {
        console.log("接口不存在或网络异常", err);
    });
    return dicts;
};

/**
 * 加载ElementPlus 提供的官方矢量图标
 */
export function loadElementPlusIcon() {
    let menuIconList = [];
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        menuIconList.push({name: key, value: component.name});
    }
    return menuIconList;
}

/**
 * 数据匹配方式
 */
export function searchMatchList(): SelectOption[] {
    let data: SelectOption[] = [];
    data.push({name: "等于", value: "eq"});
    data.push({name: "模糊", value: "lk"});
    data.push({name: "左模糊", value: "llk"});
    data.push({name: "右模糊", value: "rlk"});
    data.push({name: "小于", value: "lt"});
    data.push({name: "小于且等于", value: "lte"});
    data.push({name: "大于", value: "gt"});
    data.push({name: "大于且等于", value: "gte"});
    data.push({name: "范围", value: "bt"});
    return data;
}

/**
 * 复制数据
 * @param msg
 */
export function copy(msg: string) {
    console.log(msg);
    navigator.clipboard.writeText(msg).then(() => {
        success("已复制");
    }).catch(() => {
        error("复制失败");
    });
}

/**
 * 表格序号
 * @param row
 * @param rowIndex
 */
export function rowClassName({row, rowIndex}: any) {
    row.xh = rowIndex + 1
};

/**
 * 创建条件
 */
export function createCondition(name: string, val: any, matchType: string | null): SearchParams {
    let params: SearchParams = {propertyName: name, value: val, operation: matchType || "eq"};
    return params;
}

/**
 * 动态过滤数据
 * @param search
 * @param menusList
 */
export function filterTree(search: any, menusList: MenusInfo[]): MenusInfo[] {
    // let tempData = permissionMenuList.value;
    const filterRecursive = (node, parentInclude) => {
        // 如果节点是数组，则对每个元素应用过滤逻辑
        if (Array.isArray(node)) {
            const result: Array = node.map(child => filterRecursive(child, parentInclude)).filter((item) => item !== null);
            return result;
        }
        const containsData = !search || node.meta?.title.toLowerCase().includes(search?.toLowerCase());
        const includeNode = parentInclude || containsData;
        const filteredChildren = node.children && node.children.length > 0 ? filterRecursive(node.children) : [];
        return includeNode || filteredChildren.length > 0 ? {...node, children: filteredChildren} : null;
    }
    const filteredTree = filterRecursive(menusList, false);
    const cleanFilteredTree = JSON.parse(JSON.stringify(filteredTree))
    return cleanFilteredTree;
}

/**
 * 设置css 全局变量
 * @param name 变量名称
 * @param val 变量值
 * @param dom
 */
export function setCssVar(name: string, val: any, dom = document.documentElement) {
    dom.style.setProperty(name, val);
}

/**
 * 获取关联属性逻辑
 * @param formFields 表单属性
 * @param fieldName 属性名称
 * @param batchName 关联Key 如果有
 * @param xh 列序号
 */
export function relationFieldOperation(formFields: any, fieldName: string, batchName: string | null, xh: number | null): any {
    if (batchName) {

        let tempList = formFields[batchName];
        for (let index in tempList) {
            const tmpIndex = +index;
            let item = tempList[index] as Array<ShallowRef>;
            //数组
            if (tmpIndex + 1 === xh) {
                for (let ind in item) {
                    let temp = item[ind].value;
                    if (temp.preps.name == fieldName) {
                        return temp;
                    }
                }
            }
        }
    } else {
        return formFields[fieldName].value;
    }

}

/**
 * 解析表单字段映射
 * @param fieldList
 */
export function formFieldMapping(fieldList: PageFieldInfo) {
    let defaultDatas = {};
    //解析出字段之间的映射关系
    let mappingFields: Array<any> = [];
    let tempList = fieldList.fieldList;
    let batchDefaultValues = {};
    const fieldsOperation = (dataList: any) => {
        for (let key in dataList) {
            let temp = dataList[key];
            if (temp instanceof Array) {
                temp.forEach((item: FieldInfo) => {
                    if (item.defaultValue) {
                        defaultDatas[item.fieldName] = item.defaultValue;
                    }
                    if (item.aliasName) {
                        mappingFields.push({name: item.fieldName, alias: item.aliasName});
                    }
                })
            } else if (temp['tabList']) {
                //如果是tabList
                let tabList = temp["tabList"] as TabFieldInfo;
                fieldsOperation(tabList.fieldList);
            } else {
                if (temp.defaultValue) {
                    defaultDatas[temp.fieldName] = temp.defaultValue;
                }
                if (temp.aliasName) {
                    mappingFields.push({name: temp.fieldName, alias: temp.aliasName});
                }
            }
        }
    };
    fieldsOperation(tempList);
    let batchTempList = fieldList.batchFieldList;
    for (let key in batchTempList) {
        let temp = batchTempList[key];
        let fieldList = temp.fieldList as Array<FieldInfo>;
        fieldList?.forEach(item => {
            if (item.defaultValue) {
                batchDefaultValues[temp.batchName][item.fieldName] = item.defaultValue;
            }
            if (item.aliasName) {
                mappingFields.push({name: item.fieldName, alias: item.aliasName});
            }
        });
    }
    return {defaultDatas, mappingFields, batchDefaultValues};
}

/**
 * 批量列表数据默认值
 * @param datas
 */
export function batchFieldDefaultValues(datas: Array<FieldInfo>) {
    let defaultValues = {};
    let fieldList = datas['fieldList'];
    for (let inde in fieldList) {
        let temp = fieldList[inde];
        if (temp.defaultValue) {
            defaultValues[temp.fieldName] = temp.defaultValue;
        }
    }
    return defaultValues;
}