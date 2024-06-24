import {DialogInput} from "@/components/types/PageFieldInfo";
export type SelectOption = {
    name?: string,
    value?: string | number,
    children?: SelectOption[]
}
/**
 * 查询组件的属性
 */
export type SearchProps = {
    label?: string,
    fieldName?: string,
    type?: string,
    matchType?: string,
    disabled?: boolean | string,
    defaultValue?: object,
    defaultShow?: boolean,
    helpMsg?: string,
    /**
     * 弹窗数据配置
     */
    params?: DialogInput,
    optionList?: SelectOption[]
}
