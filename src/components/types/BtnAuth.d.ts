/**
 * 按钮自定义方法跳转
 */
export declare interface BtnAuth {
    /**
     * 按钮名字
     */
    btnName: string;
    /**
     * 图标
     */
    icon?: string;
    /**
     * 标签名字
     */
    labelName: string;
    /**
     * 自定义调用方法
     */
    exec?: Function;
    children?: BtnAuth[]
}