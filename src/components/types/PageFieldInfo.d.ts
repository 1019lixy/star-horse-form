import {SelectOption} from "@/components/types/SearchProps";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchParams} from "@/components/types/Params";

/**
 * Tab 表单数据
 */
export declare interface TabFieldInfo {
    /**
     * 标题
     */
    title: string,
    /**
     * TabName
     */
    tabName: string,
    /**
     * 是否默认禁用
     */
    disabled: string,
    /**
     * fieldList 是否是子表单
     */
    subFormFlag: boolean,
    /**
     * 子集合Key 名称
     */
    objectName: string,
    /**
     * 主键
     */
    primaryKey: string,
    /**
     * 属性名
     */
    fieldList: Array<FieldInfo>,
    /**
     * 批量表单属性
     */
    batchFieldList?: Array<BatchFieldInfo>;
}

/**
 * Card 容器信息
 */
export declare interface CardFieldInfo extends TabFieldInfo {
    /**
     * 头部右侧组件信息
     */
    headerFieldList?: FieldInfo[]
}

/**
 * 事件联动
 */
export declare interface ActionRelation {
    /**
     * 事件名
     */
    eventName: String;
    /**
     * 事件方法
     */
    actionMethod: Function;
}

export declare interface FieldInfo {
    /**
     * 标签名称
     */
    label?: string;
    /**
     * 属性名称
     */
    fieldName: string;
    /**
     * 隐藏属性名称
     */
    hideFieldName?: string;
    /**
     * 属性别名
     */
    aliasName?: string;
    /**
     * 帮助信息
     */
    helpMsg?: string;
    /**
     * 类型名称,支持
     * date 日期,
     * daterange 日期范围,
     * icon 图标,
     * select 下拉菜单（一级），
     * number 数字，
     * textrarea 文本域,
     * password 密码,
     * 非以上类型全部按照input 处理
     */
    type?: string;
    /**
     * 是否必须项
     */
    required?: boolean;
    /**
     * 表单是否显示该属性
     */
    formShow?: boolean;
    /**
     * 列表是否显示该属性
     */
    tableShow?: boolean;
    /**
     * 查看页面是否显示该属性
     */
    viewShow?: boolean;
    /**
     * 列表所在列最小宽度
     */
    minWidth?: Number;
    /**
     * 备选数据列表，目前仅支持下拉
     */
    optionList?: SelectOption[];
    /**
     * 是否禁用,Y 禁用 N 非禁用
     */
    disabled?: string;
    /**
     * 是否允许多选,在类型为select时有效 Y 多选
     */
    multiple?: string;
    /**
     * Tab标签
     */
    tabList?: TabFieldInfo[];
    /**
     * Card 标签
     */
    cardList?: CardFieldInfo[];
    /**
     * 批量属性
     */
    batchFieldList?: BatchFieldInfo[];
    /**
     * 默认值，在重置表单时，自动填充默认值，自定义重置表单时失效
     */
    defaultValue?: any;
    /**
     * 事件名称
     */
    actionName?: string;
    /**
     * 事件内容
     */
    actions?: Function;
    /**
     * 小数点精度
     */
    precision?: Number;
    /**
     * 弹窗数据配置
     */
    params?: DialogInput;
    /**
     * 事件联动
     */
    actionRelation?: ActionRelation;
    /**
     * 参数
     */
    params?: Object;
    /**
     * 组件个性化属性
     */
    preps?: Object;
    /**
     * 查询表前缀
     */
    prefix?: string;
    /**
     * 相邻的兄弟节点
     */
    brotherNode?: FieldInfo[];
}

/**
 * 属性映射
 *
 */
export declare interface FieldMapping {
    /**
     * 列表属性
     */
    sourceField: String,
    /**
     * 需要赋值的属性
     */
    distField: String
}

/**
 * 弹窗文本框属性
 */
export declare interface DialogInput {
    /**
     * 选中数据时需要的字段
     */
    needField: Array<FieldMapping>,
    /**
     * 回调函数
     */
    recall?: Function,
    /**
     * 主键名称
     */
    primaryKey: String;
    /**
     * 接口地址
     */
    dataUrl: ApiUrls;
    /**
     * 字段信息
     */
    fieldList: Array<FieldInfo>;
    /**
     * 接口过滤条件
     */
    condition?: Array<SearchParams>;
    /**
     * 列表数据排序
     */
    orderBy?: Array<OrderByInfo>
    /**
     * 格式化方法
     */
    dataFormat?: Function;
    /**
     * 是否只读
     */
    readonly?: String;
}

/**
 * 用户自定义方法信息
 */
export declare interface UserFuncInfo {
    /**
     * 权限编码
     */
    authority?: string;
    /**
     * 方法名称
     */
    funcName?: string | Function;
    /**
     * 按钮显示文字名称
     */
    btnName?: string;
}

/**
 * 列表排序
 */
export declare interface OrderByInfo {
    /**
     * 排序属性名称，如果关联表，请带上表别名前置
     */
    fieldName: String;
    /**
     * 升降序 asc 升序 desc 降序
     */
    ascOrDesc: String;
}

/**
 * 批量添加时的导入信息
 */
export declare interface ImportInfo {
    /**
     * 下载模板地址，在新增时下载对应的模板
     */
    downloadTemplateUrl?: String;
    /**
     * 导入数据地址，新增或者编辑时将数据导入
     */
    importDataUrl?: String;
    /**
     * 默认查询条件
     */
    conditions?: Array<SearchParams>;
}

/**
 * 子表单信息
 */
export declare interface SubFieldInfo {
    /**
     * 对应后端dto 里的Object/Map属性名称
     */
    objectName: String;
    /**
     * 主键名称，对应后端dto Object/Map泛型对象的主键名称
     */
    primaryKey?: String;
    /**
     * 字段属性
     */
    fieldList: Array<FieldInfo> | any;
    /**
     * fieldName和fieldList 是否同一个表，组件会根据这个字段校验数据是一对多关系
     * 还是单表的批量处理
     */
    sameParentTable?: boolean;
}

/**
 * 批量表单
 */
export declare interface BatchFieldInfo {
    /**
     * 对应后端dto 里的List属性名称
     */
    batchName: string;
    /**
     * 是否禁用
     */
    disabled: string;
    /**
     * 禁止显示
     */
    disVisible?: boolean;
    /**
     * 列表标题
     */
    title?: String;
    /**
     * 帮助提示
     */
    helpMsg?: String;
    /**
     * 默认初始化行数
     */
    initRows?: Number;
    /**
     * 主键名称，对应后端dto List泛型对象的主键名称
     */
    primaryKey?: String;
    /**
     * 新增行时默认添加的属性
     */
    batchDefaultData?: any;
    /**
     * 字段属性
     */
    fieldList: Array<FieldInfo> | any;
    /**
     * 当前组件接口
     */
    compUrl?: ApiUrls;
    /**
     * 导入数据
     */
    importInfo?: ImportInfo;
    /**
     * batchFieldList 和fieldList 是否同一个表，组件会根据这个字段校验数据是一对多关系
     * 还是单表的批量处理
     */
    sameParentTable?: boolean;
}

/**
 * 页面属性信息
 */
export declare interface PageFieldInfo {
    /**
     * 表单属性
     */
    fieldList?: Array<FieldInfo> | any;
    /**
     * 批量表单属性
     * 对象格式的数据{} 数据格式为{
     * tb1:{title:"xx",primaryKey:"xx",fieldList:[]},
     * tb2:{title:"xx2",primaryKey:"xx2",fieldList:[]}
     * }
     * tb1 对应后端dto 里的List属性名称
     * primaryKey 对应后端dto List泛型对象的主键名称
     * fieldList 对应后端dto List泛型对象的属性
     * 后面将废弃这种用法,此种用户没法保证动态表单设置的数据位置
     */
    batchFieldList?: Array<BatchFieldInfo>;
    /**
     * 表格自定义方法
     */
    userTableFuncs?: Array<UserFuncInfo>;
    /**
     * 是否阻止自动加载列表数据
     */
    stopAutoLoad?: boolean;
    /**
     * 是否允许列表单元格可以编辑
     */
    cellEditable?: boolean;
    /**
     * 列表数据排序
     */
    orderBy?: Array<OrderByInfo>;
    /**
     * 默认查询条件
     */
    conditions?: Array<SearchParams>;
    /**
     * 表单有列表数据时,在提交后端是批量数据的Key名称
     */
    batchName?: String;
    /**
     * batchFieldList 和fieldList 是否同一个表，组件会根据这个字段校验数据是一对多关系
     * 还是单表的批量处理
     */
    sameTable?: boolean;
}
