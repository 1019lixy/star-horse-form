import {ApiUrls, SelectOption} from "star-horse-lowcode";

export interface FormConfig {
    /**
     * 接口
     */
    api: ApiUrls;
    /**
     * 组件大小
     */
    compSize?: "small" | "default" | "large",
    /**
     * 是否批量创建页面
     */
    batchCreatePage: boolean;
    /**
     * 获取字典数据
     * @param dictName 字典名称
     */
    loadDicts?: (dictName: string) => Promise<SelectOption[]>;
    /**
     * 根据应用ID加载菜单
     * @param appId 应用Id
     */
    loadMenuList?: (appId: string) => Promise<SelectOption[]>;
    /**
     * 根据指定数据源和表名获取对应的表字段信息
     * @param dataSourceId 数据源Id
     * @param tableName 表名
     */
    loadTableColumns?: (dataSourceId: string, tableName: string) => Promise<SelectOption[]>;
    /**
     *获取应用列表
     */
    loadAppList?: () => Promise<SelectOption[]>;
    /**
     * 获取角色列表
     */
    loadRolesList?: () => Promise<SelectOption[]>;
    /**
     * 获取所有的数据源信息
     */
    loadDbList?: () => Promise<SelectOption[]>;

}
