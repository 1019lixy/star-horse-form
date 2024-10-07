import {error, warning} from "@/utils/message.ts";
import {userFunction} from "@/api/user_func.ts";

/**
 * Change 事件
 * @param context
 */
const change = (context: any) => {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
};
/**
 * Input 事件
 * @param context
 */
const input = (context: any) => {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
}
/**
 * Focus 事件
 * @param context
 */
const focus = (context: any) => {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
}
/**
 * Blur 事件
 * @param context
 */
const blur = (context: any) => {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
}
/**
 * Enter 事件
 * @param context
 */
const mouseEnter = (context: any) => {
    const parentField = context.attrs["parentField"];
    const field = context.attrs["field"] as any;
}
/**
 * 所有触发的事件
 * @param context
 * @param actionName
 */
const allAction = (context: any, actionName: string) => {
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
    }

    const field = context.attrs["field"] as any;
    //处理自定义响应事件
    if (actionName == field.preps["actionName"] && field.preps["actionRelation"]) {
        field.preps["actionRelation"](context.attrs['formData'][field.preps['name']], context.attrs['formData']["xh"]);
    }
    try {
        context.emit('selfFunc', actionName);
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
