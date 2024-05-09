import {postRequest} from "@/api/star_horse";
import {createTree} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";

const deptAndUserTree: string = "/system-config/system/departmentEntity/deptAndUserTree";

/**
 * 获取部门用户
 */
export async function loadDeptUser(direct: boolean, params: any) {
    let menuDatas: Array<SelectOption> = [];
    await postRequest(deptAndUserTree, {
        fieldList: params
    }).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
            console.warn(redata.cnMessage);
        } else {
            if (direct) {
                menuDatas = redata.data;
            } else {
                //构建用户部门树
                menuDatas = createDeptUserTree(redata.data, "", "deptName", "idDepartment");
            }
        }
    }).catch(err => {
        console.error(err);
    });
    return menuDatas;
};

/**
 * 解析部门信息
 * @param roleId
 * @param menuIds
 */
export function createDeptUserTree(datas: any, valField: string, name: string, val: string) {
    let deptUserList: Array<SelectOption> = [];
    datas.forEach((item: any) => {
        let temp = {};
        temp["value"] = valField ? item[valField] : parseInt(item[val]);
        temp["name"] = item[name];
        temp["children"]=[];
        let userList = item["userList"];
        if (item.children && item.children.length > 0) {
            temp["children"] = createDeptUserTree(item.children, valField, name, val);
        }
        console.log(temp);
        userList.forEach(item => {
            temp["children"].push({
                name: item.userName + "(" + item.name + ")",
                value: item.idUsersinfo
            });
        });
        deptUserList.push(temp);
    });
    return deptUserList;
};

/**
 * 解析部门信息
 * @param roleId
 * @param menuIds
 */
export function analysisData(datas: any, valField: string, name: string, val: string) {
    let listNames: Array<String> = [], listValues: Array<Number> = [];
    datas.forEach((item: any) => {
        let temp = {};
        temp["value"] = valField ? item[valField] : parseInt(item[val]);
        temp["name"] = item[name];
        listNames.push(temp['name']);
        listValues.push(temp['value']);
        if (item.children && item.children.length > 0) {
            temp["children"] = analysisData(item.children, valField, name, val);
            listNames.push(...temp["children"]["listNames"]);
            listValues.push(...temp["children"]["listValues"]);
        }
    });
    return {
        listNames, listValues
    }
};