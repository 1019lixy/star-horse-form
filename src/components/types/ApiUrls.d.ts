/**
 * 组件用到的属性
 */
export  type ApiUrls = {
    /**
     * 分页接口
     */
    loadByPageUrl?: string,
    /**
     * merge接口
     */
    mergeUrl?: string,
    /**
     * merge暂存接口
     */
    mergeDraftUrl?: string,
    /**
     * 批量Merge接口
     */
    batchMergeUrl?: string,
    /**
     * 批量暂存接口
     */
    batchMergeDraftUrl?: string,
    /**
     * 根据Id获取数据接口
     */
    loadByIdUrl?: string,
    /**
     * 删除数据接口
     */
    deleteUrl?: string,
    /**
     * 导出数据接口
     */
    exportAllUrl?: string,
    /**
     * 下载模板接口
     */
    downloadTemplateUrl?: string,
    /**
     * 自定义查询接口
     */
    userConditionUrl?: string,
    /**
     * 上载接口
     */
    uploadUrl?: string,
    /**
     * 导入数据接口
     */
    importUrl?: string,
    /**
     * 权限隔离属性字段，如果提供则所有Post请求都会带上该字段
     * 接口过滤条件
     */
    condition?: Array<SearchParams>;
    /**
     * 是否接口转发
     */
    redirect?: boolean;
}