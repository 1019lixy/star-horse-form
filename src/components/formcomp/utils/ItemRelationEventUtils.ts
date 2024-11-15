import {error} from "@/utils/message.ts";
import {userFunction} from "@/api/user_func.ts";
import {createCondition} from "@/api/sh_api.ts";
import piniaInstance from "@/store";
import {useUserSelfOperation} from "@/store/SelfOperationStore.ts";

let userOperation = useUserSelfOperation(piniaInstance);
/**
 * Change 事件
 * @param context
 */
const change = (context: any) => {
    const field = context.attrs["field"] as any;
    let relation = field.preps.dataRelation;
    operationRelation(relation, "change", context.attrs["formData"], field.preps['name']);
};
/**
 * Input 事件
 * @param context
 */
const input = (context: any) => {
    const field = context.attrs["field"] as any;
    let relation = field.preps.dataRelation;
    operationRelation(relation, "input", context.attrs["formData"], field.preps['name']);
}
/**
 * Focus 事件
 * @param context
 */
const focus = (context: any) => {
    const field = context.attrs["field"] as any;
    let relation = field.preps.dataRelation;
    operationRelation(relation, "focus", context.attrs["formData"], field.preps['name']);
}
/**
 * Blur 事件
 * @param context
 */
const blur = (context: any) => {
    const field = context.attrs["field"] as any;
    let relation = field.preps.dataRelation;
    operationRelation(relation, "blur", context.attrs["formData"], field.preps['name']);
}
/**
 * Enter 事件
 * @param context
 */
const mouseEnter = (context: any) => {
    const field = context.attrs["field"] as any;
    let relation = field.preps.dataRelation;
    operationRelation(relation, "enter", context.attrs["formData"], field.preps['name']);
}


/**
 * 操作关联关系
 * @param relation
 * @param actionName
 * @param formData
 * @param currentName
 */
const operationRelation = (relation: any, actionName: string, formData: any, currentName: string) => {
    // console.log(relation, actionName, formData, currentName);
    if (!relation || actionName != relation.actionName) {
        return;
    }
    let relations: Array<any> = relation?.relationDetails;
    let currentVal = formData[currentName];
    if (!relations || relations.length == 0) {
        return
    }
    debugger;
    for (let index in relations) {
        let temp = relations[index];
        let conditon: string = temp.controlCondition;
        let fieldName: string = temp.relationFields;
        if (!conditon || !fieldName) {
            continue;
        }
        let field = userOperation.getFormItem(fieldName);
        console.log(userOperation.formFieldList, field, conditon, fieldName);
        let params: any = temp.params;
        let matchType: string = temp.matchType;
        if (conditon == "query") {
            //输入的值作为查询条件
            let cond = createCondition(params, currentVal, matchType);

            let queryParams = field.preps["queryParams"];
            if (queryParams) {
                queryParams = field.preps["queryParams"].filter((item:any) => item.name != params);
            }
            queryParams.push(cond);
            field.preps["queryParams"] = queryParams;
            //怎么触发执行
        } else if (conditon == "eqDisable" || conditon == "eqDisableOrEditable") {
            //输入的值等于指定值隐藏否则显示
            formData["_" + fieldName + "Editable"] = !(currentVal == params);
        } else if (conditon == "eqEditable" || conditon == "eqEditableOrDisable") {
            //输入的值等于指定值显示否则隐藏
            formData["_" + fieldName + "Editable"] = currentVal == params;
        } else if (conditon == "assignValue") {
            //输入的值等于指定值时赋予新值
            if (field.itemType == "select" || field.itemType == "tselect"
                || field.itemType == "autocomplete" || field.itemType == "cascade") {
                debugger;
                field.preps.values = JSON.parse(params);
            } else {
                formData[field.name] = params;
            }
        } else if (conditon == "changeType") {
            //输入的值等于指定值时改变字段类型
            field.itemType = params;
        }
    }


}
/**
 * 所有触发的事件
 * @param context
 * @param actionName
 * @param isInit
 */
const allAction = (context: any, actionName: string, isInit: boolean = false) => {
    //设计时的初始化不作处理
    if (context.attrs['isDesign'] && isInit) {
        return;
    }
    //处理连动
    switch (actionName) {
        case "change":
            change(context);
            break;
        case "input":
            input(context);
            break;
        case "focus":
            focus(context);
            break;
        case "blur":
            blur(context);
            break;
        case "enter":
            mouseEnter(context);
            break;
        default:
            console.log("不支持的事件：" + actionName);
            return;
    }
    const field = context.attrs["field"] as any;
    if (actionName == "input" && actionName != field.preps["actionName"]) {
        return;
    }
    //处理自定义响应事件
    if (actionName == field.preps["actionName"] && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
    }
    try {
        console.log(field.preps["actionName"], context.attrs['formData']);
        context.emit('selfFunc', actionName,context.attrs['formData']);
    } catch (e) {
        error("事件触发异常：" + e);
    }

}
/**
 * Button 组件的点击事件
 * @param context
 * @param code
 */
const buttonAction = (context: any, code: string) => {
    if (code) {
        userFunction(code, context);
    } else {
        const field = context.attrs["field"] as any;
        context.attrs['formData']["starHorseBtnName"] = field.preps['name'];
        if (field.preps["actions"]) {
            field.preps["actions"](context.attrs['formData']);
        }
        context.emit('selfFunc', context.attrs['formData']);
    }
}
export {
    allAction,
    buttonAction,
}
