import {ApiUrls, CompType, SelectOption} from "star-horse-lowcode";
import {ToolBtnType} from "@/components/types/ToolBtnType";

/**
 * warning:返回Promise的函数，请勿更改为直接返回数据
 */
export interface FormConfig {
    /**
     * 表单设计器模式，默认 simple
     * simple 极简模式 只有简单功能,
     * default 默认模式 除需要与后台交互的功能都会正常展示
     * full 包含所有功能，某些功能需结合后台服务方能进行,在全量模式下,需要加载数据字典,应用名称，角色信息，权限信息等,
     *      下面的所有参数都需要配置,若不配配置，则某些功能没法用或者数据没法展示
     */
    model?: "simple" | "default" | "full";
    /**
     * 主键名称,指的api 接口中的数据对象对应的主键名，默认 "id"
     */
    primaryKey?: string;
    /**
     * 禁用系统自带的组件，默认 false
     */
    forbiddenSystemItems?: boolean;
    /**
     * 隐藏配置风格按钮
     */
    hideConfigBtn?: boolean;
    /**
     * 定义了表单需要与后端交互正常交互的接口
     */
    api?: ApiUrls;
    /**
     * 配置模板接口,没有配置接口，所有的配置数据只能缓存到浏览器中
     */
    configTemplateApi?: ApiUrls;
    /**
     * 数据库配置Api
     */
    dbInfoApi?: ApiUrls;
    /**
     * 快捷菜单的参数，默认从 primaryKey 推导 { label: "formName", value: primaryKey }
     */
    shotProps?: Record<string, any>;
    /**
     * 设计器顶部自定义按钮
     */
    extendButtons?: ToolBtnType[];
    /**
     * 是否支持在线协作,目前此功能还不成熟,
     */
    cooperationMode?: false;
    /**
     * 权限编码，默认只有查看权限，权限编码与设计器头部的按钮关联
     * {
     * add:"add",//表示有新增权限
     * edit:"edit",//表示有编辑权限
     * view:"view",//表示有查看权限
     * delete:"delete",//表示有删除权限
     * }
     */
    permissions?: Record<string, string>;
    /**
     * 组件大小，默认 default
     */
    compSize?: "small" | "default" | "large";
    /**
     * 用户容器组件(显示在容器区域),所有自定义的容器需在初始化时以xx-container的方式注册到上下文中
     */
    containerList?: () => Promise<CompType[]>;
    /**
     * 用户组件(显示在组件区域)，所有自定义的组件需在初始化时以xx-item的方式注册到上下文中
     */
    itemList?: () => Promise<CompType[]>;

    /**
     * 用户扩展组件(显示在扩展组件区域),所有自定义的组件需在初始化时以xx-item的方式注册到上下文中
     */
    extendItemList?: () => Promise<CompType[]>;
    /**
     * 是否批量创建页面
     */
    batchCreatePage?: boolean;
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
    loadTableColumns?: (
        dataSourceId: string,
        tableName: string,
    ) => Promise<SelectOption[]>;
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
