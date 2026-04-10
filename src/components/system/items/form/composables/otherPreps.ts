import {ItemType} from "star-horse-lowcode";

export interface OtherPreps extends ItemType {
    /**
     * 匹配到指定组件类型才显示该属性
     */
    matchComp?: Array<string>;
    actions?: Record<string, Function>;
    preps?: Record<string, any>;
}

export const otherPreps: OtherPreps[] = [
    {
        label: "App隐藏组件",
        fieldName: "appCompVisible",
        fieldType: "switch",
        category: 1,
        preps: {
            activeText: "是",
            inactiveText: "否"
        }
    },
    {
        label: "App隐藏标签",
        fieldName: "appLabelVisible",
        fieldType: "switch",
        helpMsg: "App隐藏组件设置为隐藏后,此设置无效",
        category: 1,
        preps: {
            activeText: "是",
            inactiveText: "否"
        }
    },
    {
        label: "文本绑定到标签",
        fieldName: "labelFor",
        fieldType: "button",
        category: 1,
        matchComp: ["text", "html"],
        actions:{
            click: (dialogStates:any,item:any) => {
                dialogStates.bindFieldVisible=true;
            }
        }
    }
];
