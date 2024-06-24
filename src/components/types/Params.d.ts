/**
 * 查询条件组装数据对象
 */
declare export interface SearchParams {
    /**
     * 属性名称
     */
    propertyName?: string,
    /**
     * 匹配方式 eq,lk,gt,gte,lt,lte,llk,rlk,in ,nin,exits
     */
    operation?: string | null,
    /**
     * 查询值
     */
    value?: any
}
