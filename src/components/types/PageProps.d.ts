/**
 * 页面数据信息
 */
declare export interface PageProps {
    totalData?: number,
    pageSize?: number,
    currentPage?: number,
    totalPage?: number,
    dataList?: Array | null
}