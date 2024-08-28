import {CompParams} from "@/components/types/PageFieldInfo";

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
    defaultValue?: any | null,
    defaultShow?: boolean,
    helpMsg?: string,
    /**
     * 弹窗数据配置
     */
    params?: CompParams,
    optionList?: SelectOption[]
}
/**
 * 查询属性
 */
export type SearchFields = {
    fieldList: SearchProps[]
}
