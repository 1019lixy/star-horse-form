import {ItemType} from "star-horse-lowcode";

export interface OtherPreps extends ItemType {
    /**
     * 匹配到指定组件类型才显示该属性
     */
    matchComp?: Array<string>;
    actions?: Record<string, Function>;
    preps?: Record<string, any>;
}

/**
 * 其它属性配置参数
 */
export const otherPreps: OtherPreps[] = [
    {
        label: "Card列表显示",
        fieldName: "appListVisible",
        fieldType: "switch",
        category: 1,
        preps: {
            activeText: "是",
            inactiveText: "否"
        }
    },
    {
        label: "App隐藏组件",
        fieldName: "appCompVisible",
        fieldType: "switch",
        category: 1,
        defaultValues: false,
        preps: {
            activeText: "是",
            inactiveText: "否"
        }
    },
    {
        label: "App隐藏标签",
        fieldName: "appLabelVisible",
        fieldType: "switch",
        helpMsg: "上面组件设置为隐藏后,此设置无效",
        defaultValues: false,
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
        helpMsg: "在App模式中将将该组件配置为指定组件的标签",
        matchComp: ["text", "html"],
        actions: {
            click: (dialogStates: any, item: any) => {
                dialogStates.bindFieldVisible = true;
            }
        }
    }
];
