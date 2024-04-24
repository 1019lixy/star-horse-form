/**
 * 组件信息
 */
interface CompInfo {
    //ID
    id?: string;
    //属性名称
    name: string;
    //标签名称
    label: string;
    //是否允许拖拽，默认允许
    disableDrag: boolean;
    //子元素
    items?: Array<any>;
}

/**
 * 定义折叠面板数据格式
 */
export interface CustomerItem {
    //折叠面板名称
    name: string;
    //折叠面板标题
    title: string;
    //面板内的数据元素
    compItems?: Array<CompInfo>;
}

