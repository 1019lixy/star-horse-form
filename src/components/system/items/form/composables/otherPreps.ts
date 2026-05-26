import {ItemType} from "star-horse-lowcode";
import {i18n} from "@/lang";

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
        label: i18n("dyform.otherPreps.394"),
        fieldName: "appListVisible",
        fieldType: "switch",
        category: 1,
        preps: {
            activeText: i18n("dyform.otherPreps.395"),
            inactiveText: i18n("dyform.otherPreps.396")
        }
    },
    {
        label: i18n("dyform.otherPreps.397"),
        fieldName: "appCompVisible",
        fieldType: "switch",
        category: 1,
        defaultValues: false,
        preps: {
            activeText: i18n("dyform.otherPreps.395"),
            inactiveText: i18n("dyform.otherPreps.396")
        }
    },
    {
        label: i18n("dyform.otherPreps.398"),
        fieldName: "appLabelVisible",
        fieldType: "switch",
        helpMsg: i18n("dyform.otherPreps.399"),
        defaultValues: false,
        category: 1,
        preps: {
            activeText: i18n("dyform.otherPreps.395"),
            inactiveText: i18n("dyform.otherPreps.396")
        }
    },
    {
        label: i18n("dyform.otherPreps.400"),
        fieldName: "labelFor",
        fieldType: "button",
        category: 1,
        helpMsg: i18n("dyform.otherPreps.401"),
        matchComp: ["text", "html"],
        actions: {
            click: (dialogStates: any, item: any) => {
                dialogStates.bindFieldVisible = true;
            }
        }
    }
];
