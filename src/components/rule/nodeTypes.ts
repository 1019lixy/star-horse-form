/**
 * 企业级规则引擎节点类型定义
 * 10大类40+种专业节点，每种节点带完整参数schema
 */

import {i18n} from '@/lang'

export interface ParamField {
    name: string
    label: string | Function
    type: 'input' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'switch' | 'table'
    required?: boolean
    options?: { label: string | Function; value: any }[]
    placeholder?: string
    default?: any
    group?: string
    min?: number
    max?: number
    step?: number
    rows?: number
    /**
     * 标记该参数为表单字段选择器
     * - 当 formFields 上下文可用时，PropertyPanel 会渲染 FieldSelector 替代 el-input
     * - 支持单字段（input）与多字段（multiselect 模式由 type 决定）
     */
    fieldSelect?: boolean
    columns?: {
        prop: string
        label: string
        type?: 'input' | 'select'
        options?: any[]
        width?: string
        /** 表格列也支持字段选择器（如 conditions.fieldName / actions.targetField） */
        fieldSelect?: boolean
        /**
         * 当前行数据中 actionType 命中此列表时，隐藏该列
         * 用于：SHOW_MESSAGE 等动作不需要 targetField 列
         */
        hideOnActionTypes?: string[]
        /** 当 actionType 命中此列表时，才显示该列（白名单模式，与 hideOnActionTypes 互斥） */
        showOnActionTypes?: string[]
    }[]
}

export interface NodeTypeDef {
    type: string
    label: string
    icon: string
    category: string
    desc: string
    defaultData: () => Record<string, any>
    paramSchema: ParamField[]
}

export interface NodeCategory {
    name: string
    icon: string
    color: string
    nodes: NodeTypeDef[]
}

// ============= 通用选项常量 =============
const SOURCE_OPTIONS = [
    {label: () => i18n('rule.opt.formData'), value: 'form'},
    {label: () => i18n('rule.opt.processVar'), value: 'process'},
    {label: () => i18n('rule.opt.apiReturn'), value: 'api'},
    {label: () => i18n('rule.opt.historySnapshot'), value: 'snapshot'},
]
const TYPE_OPTIONS = [
    {label: () => i18n('rule.opt.string'), value: 'STRING'},
    {label: () => i18n('rule.opt.number'), value: 'NUMBER'},
    {label: () => i18n('rule.opt.date'), value: 'DATE'},
    {label: () => i18n('rule.opt.boolean'), value: 'BOOLEAN'},
]
const ROUND_MODE_OPTIONS = [
    {label: () => i18n('rule.opt.halfUp'), value: 'HALF_UP'},
    {label: () => i18n('rule.opt.floor'), value: 'FLOOR'},
    {label: () => i18n('rule.opt.ceil'), value: 'CEIL'},
    {label: () => i18n('rule.opt.truncate'), value: 'TRUNCATE'},
]
const ALERT_LEVEL_OPTIONS = [
    {label: () => i18n('rule.opt.info'), value: 'INFO'},
    {label: () => i18n('rule.opt.warn'), value: 'WARN'},
    {label: () => i18n('rule.opt.error'), value: 'ERROR'},
    {label: () => i18n('rule.opt.block'), value: 'BLOCK'},
]

export const NODE_CATEGORIES: NodeCategory[] = [
    // ============ 基础：规则决策控制 ============
    {
        name: 'rule.category.decisionControl', icon: '🎯', color: '#8b5cf6',
        nodes: [
            {
                type: 'start', label: 'rule.node.start', icon: '▶', category: 'flow',
                desc: 'rule.desc.start',
                defaultData: () => ({}),
                paramSchema: []
            },
            {
                type: 'end', label: 'rule.node.end', icon: '■', category: 'flow',
                desc: 'rule.desc.end',
                defaultData: () => ({endType: 'success'}),
                paramSchema: [
                    {
                        name: 'endType', label: 'rule.lbl.resultType', type: 'select', options: [
                            {label: () => i18n('rule.opt.pass'), value: 'success'},
                            {label: () => i18n('rule.opt.reject'), value: 'fail'},
                            {label: () => i18n('rule.opt.skip'), value: 'skip'},
                        ], group: 'rule.group.basic'
                    },
                ]
            },
            {
                type: 'exclusive-gateway', label: 'rule.node.exclusiveGateway', icon: '✕', category: 'flow',
                desc: 'rule.desc.exclusiveGateway',
                defaultData: () => ({name: '', branches: []}),
                paramSchema: [
                    {name: 'name', label: 'rule.lbl.routeName', type: 'input', group: 'rule.group.basic'},
                    {
                        name: 'branches', label: 'rule.lbl.conditionBranch', type: 'table', group: 'rule.group.branch',
                        columns: [
                            {prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px'},
                            {prop: 'condition', label: 'rule.lbl.conditionExpr', type: 'input', width: '200px'},
                        ]
                    },
                ]
            },
            {
                type: 'parallel-gateway', label: 'rule.node.parallelGateway', icon: '+', category: 'flow',
                desc: 'rule.desc.parallelGateway',
                defaultData: () => ({name: ''}),
                paramSchema: [
                    {name: 'name', label: 'rule.lbl.ruleGroupName', type: 'input', group: 'rule.group.basic'},
                ]
            },
            {
                type: 'inclusive-gateway', label: 'rule.node.inclusiveGateway', icon: 'O', category: 'flow',
                desc: 'rule.desc.inclusiveGateway',
                defaultData: () => ({name: '', branches: []}),
                paramSchema: [
                    {name: 'name', label: 'rule.lbl.routeName', type: 'input', group: 'rule.group.basic'},
                    {
                        name: 'branches', label: 'rule.lbl.conditionBranch', type: 'table', group: 'rule.group.branch',
                        columns: [
                            {prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px'},
                            {prop: 'condition', label: 'rule.lbl.conditionExpr', type: 'input', width: '200px'},
                        ]
                    },
                ]
            },
            {
                type: 'join', label: 'rule.node.join', icon: '⊕', category: 'flow',
                desc: 'rule.desc.join',
                defaultData: () => ({joinType: 'AND', waitAll: 'Y'}),
                paramSchema: [
                    {
                        name: 'joinType', label: 'rule.lbl.joinStrategy', type: 'select', options: [
                            {label: () => i18n('rule.opt.allPass'), value: 'AND'},
                            {label: () => i18n('rule.opt.anyPass'), value: 'OR'},
                            {label: () => i18n('rule.opt.byCount'), value: 'COUNT'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'waitAll',
                        label: 'rule.lbl.waitAll',
                        type: 'switch',
                        default: 'Y',
                        group: 'rule.group.basic'
                    },
                ]
            },
        ]
    },

    // ============ 基础：业务逻辑 ============
    {
        name: 'rule.category.businessLogic', icon: '⚙️', color: '#10b981',
        nodes: [
            {
                type: 'condition', label: 'rule.node.condition', icon: '❓', category: 'logic',
                desc: 'rule.desc.condition',
                defaultData: () => ({logic: 'AND', conditions: []}),
                paramSchema: [
                    {
                        name: 'logic', label: 'rule.lbl.logic', type: 'select', options: [
                            {label: () => i18n('rule.opt.and'), value: 'AND'},
                            {label: () => i18n('rule.opt.or'), value: 'OR'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'conditions',
                        label: 'rule.lbl.conditionList',
                        type: 'table',
                        group: 'rule.group.condition',
                        columns: [
                            {prop: 'fieldName', label: 'rule.lbl.fieldName', type: 'input', width: '120px', fieldSelect: true},
                            {
                                prop: 'operator', label: 'rule.lbl.operator', type: 'select', width: '100px',
                                options: [
                                    {label: () => i18n('rule.opt.eq'), value: 'EQ'},
                                    {label: () => i18n('rule.opt.neq'), value: 'NEQ'},
                                    {label: () => i18n('rule.opt.gt'), value: 'GT'},
                                    {label: () => i18n('rule.opt.lt'), value: 'LT'},
                                    {label: () => i18n('rule.opt.contains'), value: 'CONTAINS'},
                                ]
                            },
                            {prop: 'value', label: 'rule.lbl.value', type: 'input', width: '120px'},
                        ]
                    },
                ]
            },
            {
                type: 'action', label: 'rule.node.action', icon: '▶', category: 'logic',
                desc: 'rule.desc.action',
                defaultData: () => ({actions: []}),
                paramSchema: [
                    {
                        name: 'actions', label: 'rule.lbl.actionList', type: 'table', group: 'rule.group.action',
                        columns: [
                            {
                                prop: 'actionType', label: 'rule.lbl.actionType', type: 'select', width: '120px',
                                options: [
                                    {label: () => i18n('rule.opt.showField'), value: 'SHOW_FIELD'},
                                    {label: () => i18n('rule.opt.hideField'), value: 'HIDE_FIELD'},
                                    {label: () => i18n('rule.opt.setValue'), value: 'SET_VALUE'},
                                    {label: () => i18n('rule.opt.clearValue'), value: 'CLEAR_VALUE'},
                                    {label: () => i18n('rule.opt.setRequired'), value: 'SET_REQUIRED'},
                                    {label: () => i18n('rule.opt.setOptions'), value: 'SET_OPTIONS'},
                                    {label: () => i18n('rule.opt.showMessage'), value: 'SHOW_MESSAGE'},
                                ]
                            },
                            // SHOW_MESSAGE 只是显示消息，无需目标字段
                            {prop: 'targetField', label: 'rule.lbl.targetField', type: 'input', width: '120px', fieldSelect: true, hideOnActionTypes: ['SHOW_MESSAGE']},
                            {prop: 'actionValue', label: 'rule.lbl.value', type: 'input', width: '120px'},
                        ]
                    },
                ]
            },
            {
                type: 'variable-assign', label: 'rule.node.variableAssign', icon: '=', category: 'logic',
                desc: 'rule.desc.variableAssign',
                defaultData: () => ({assignments: []}),
                paramSchema: [
                    {
                        name: 'assignments', label: 'rule.lbl.assignList', type: 'table', group: 'rule.group.assign',
                        columns: [
                            {prop: 'variableName', label: 'rule.lbl.varName', type: 'input', width: '120px'},
                            {prop: 'value', label: 'rule.lbl.value', type: 'input', width: '150px'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '100px',
                                options: [
                                    {label: () => i18n('rule.opt.constant'), value: 'CONSTANT'},
                                    {label: () => i18n('rule.opt.variable'), value: 'VARIABLE'},
                                    {label: () => i18n('rule.opt.expression'), value: 'EXPRESSION'},
                                ]
                            },
                        ]
                    },
                ]
            },
            {
                type: 'script', label: 'rule.node.script', icon: '📜', category: 'logic',
                desc: 'rule.desc.script',
                defaultData: () => ({scriptContent: '', description: ''}),
                paramSchema: [
                    {
                        name: 'scriptContent',
                        label: 'rule.lbl.scriptContent',
                        type: 'textarea',
                        rows: 8,
                        placeholder: 'rule.ph.script',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'http-call', label: 'rule.node.httpCall', icon: '🌐', category: 'logic',
                desc: 'rule.desc.httpCall',
                defaultData: () => ({
                    // —— 接口来源（对齐 shplugin ApiLinkageDetail.apiMode）——
                    apiMode: 'custom',                    // 'system' 系统接口 | 'custom' 自定义接口
                    apiType: 'thirdApi',                  // 'systemApi' | 'thirdApi'
                    // —— 业务接口配置（对齐 ApiInfo）——
                    url: '',
                    httpMethod: 'GET',
                    protocol: 'https',
                    timeout: 5000,
                    requestDataType: 'json',             // 'form' | 'json' | 'binary'
                    headers: [],                          // ApiParam[]: [{ valueType, paramName, paramValue }]
                    requestParams: [],                    // ApiParam[]
                    body: '',
                    // —— 响应解析（对齐 ApiInfo 响应字段）——
                    successCode: '200',
                    codePath: 'code',
                    messagePath: 'message',
                    dataPath: 'data',
                    // —— 字段映射（对齐 FieldMapping[]）——
                    fieldMappings: [],                    // [{ sourceField, distField }]
                    // —— 认证接口（对齐 authInfo: ApiInfo）——
                    authEnabled: false,
                    authInfo: null,
                    // —— 代理与重试 ——
                    proxyEnabled: true,
                    proxyUrl: '/system-config/redirect/apiLinkage',
                    retryCount: 0,
                    description: ''
                }),
                paramSchema: [
                    // ===== 接口来源 =====
                    {
                        name: 'apiMode', label: 'rule.lbl.apiMode', type: 'select', required: true, group: 'rule.group.apiSource',
                        options: [
                            {label: () => i18n('rule.opt.systemApi'), value: 'system'},
                            {label: () => i18n('rule.opt.customApi'), value: 'custom'},
                        ]
                    },
                    {
                        name: 'apiType', label: 'rule.lbl.apiType', type: 'select', group: 'rule.group.apiSource',
                        options: [
                            {label: () => i18n('rule.opt.thirdApi'), value: 'thirdApi'},
                            {label: () => i18n('rule.opt.systemApiType'), value: 'systemApi'},
                        ]
                    },
                    {
                        name: 'serviceName', label: 'rule.lbl.serviceName', type: 'input', group: 'rule.group.apiSource',
                        placeholder: 'rule.ph.serviceName',
                    },
                    {
                        name: 'interfaceName', label: 'rule.lbl.interfaceName', type: 'input', group: 'rule.group.apiSource',
                        placeholder: 'rule.ph.interfaceName',
                    },
                    // ===== 请求配置 =====
                    {
                        name: 'httpMethod', label: 'rule.lbl.httpMethod', type: 'select', required: true, group: 'rule.group.request',
                        options: [
                            {label: 'GET', value: 'GET'},
                            {label: 'POST', value: 'POST'},
                            {label: 'PUT', value: 'PUT'},
                            {label: 'DELETE', value: 'DELETE'},
                        ]
                    },
                    {
                        name: 'url', label: 'rule.lbl.apiUrl', type: 'input', required: true, group: 'rule.group.request',
                        placeholder: 'https://api.example.com/data'
                    },
                    {
                        name: 'protocol', label: 'rule.lbl.protocol', type: 'select', group: 'rule.group.request',
                        options: [
                            {label: 'https', value: 'https'},
                            {label: 'http', value: 'http'},
                        ]
                    },
                    {
                        name: 'requestDataType', label: 'rule.lbl.requestDataType', type: 'select', group: 'rule.group.request',
                        options: [
                            {label: 'JSON', value: 'json'},
                            {label: 'Form', value: 'form'},
                            {label: 'Binary', value: 'binary'},
                        ]
                    },
                    {
                        name: 'timeout', label: 'rule.lbl.timeout', type: 'number', min: 1000, step: 1000, default: 5000, group: 'rule.group.request'
                    },
                    // 请求头（对齐 ApiParam[]）
                    {
                        name: 'headers', label: 'rule.lbl.headers', type: 'table', group: 'rule.group.request',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    // 请求参数（对齐 ApiParam[]）
                    {
                        name: 'requestParams', label: 'rule.lbl.requestParams', type: 'table', group: 'rule.group.request',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    // 请求体（POST/PUT/PATCH 使用）
                    {
                        name: 'body', label: 'rule.lbl.requestBody', type: 'textarea', rows: 4, group: 'rule.group.request',
                        placeholder: 'rule.ph.jsonBody'
                    },
                    // ===== 响应解析（对齐 ApiInfo 响应字段）=====
                    {
                        name: 'successCode', label: 'rule.lbl.successCode', type: 'input', default: '200', group: 'rule.group.response',
                        placeholder: '200'
                    },
                    {
                        name: 'codePath', label: 'rule.lbl.codePath', type: 'input', default: 'code', group: 'rule.group.response',
                        placeholder: 'data.code'
                    },
                    {
                        name: 'messagePath', label: 'rule.lbl.messagePath', type: 'input', default: 'message', group: 'rule.group.response',
                        placeholder: 'data.message'
                    },
                    {
                        name: 'dataPath', label: 'rule.lbl.dataPath', type: 'input', default: 'data', group: 'rule.group.response',
                        placeholder: 'data.list'
                    },
                    // ===== 字段映射（对齐 FieldMapping[]）=====
                    {
                        name: 'fieldMappings', label: 'rule.lbl.fieldMappings', type: 'table', group: 'rule.group.mapping',
                        columns: [
                            {prop: 'sourceField', label: 'rule.lbl.sourceField', type: 'input', width: '45%'},
                            {prop: 'distField', label: 'rule.lbl.distField', type: 'input', fieldSelect: true, width: '45%'},
                        ]
                    },
                    // ===== 认证接口（对齐 authInfo: ApiInfo）=====
                    {
                        name: 'authEnabled', label: 'rule.lbl.authEnabled', type: 'switch', default: false, group: 'rule.group.auth'
                    },
                    {
                        name: 'authInfo', label: 'rule.lbl.authConfig', type: 'textarea', rows: 3, group: 'rule.group.auth',
                        placeholder: 'rule.ph.authConfig'
                    },
                    // ===== 高级 =====
                    {
                        name: 'proxyEnabled', label: 'rule.lbl.proxyEnabled', type: 'switch', default: true, group: 'rule.group.advanced'
                    },
                    {
                        name: 'proxyUrl', label: 'rule.lbl.proxyUrl', type: 'input', group: 'rule.group.advanced',
                        placeholder: '/system-config/redirect/apiLinkage'
                    },
                    {
                        name: 'retryCount', label: 'rule.lbl.retryCount', type: 'number', min: 0, max: 5, default: 0, group: 'rule.group.advanced'
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
        ]
    },

    // ============ 一、数据入参&上下文 ============
    {
        name: 'rule.category.dataContext', icon: '📥', color: '#3b82f6',
        nodes: [
            {
                type: 'context-extract', label: 'rule.node.contextExtract', icon: '📎', category: 'data',
                desc: 'rule.desc.contextExtract',
                defaultData: () => ({source: 'form', fieldPath: '', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'source',
                        label: 'rule.lbl.dataSource',
                        type: 'select',
                        required: true,
                        options: SOURCE_OPTIONS,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'fieldPath',
                        label: 'rule.lbl.fieldPath',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.orderAmount',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.targetVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.totalAmount',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        placeholder: 'rule.ph.nodePurpose',
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'type-cast', label: 'rule.node.typeCast', icon: '🔄', category: 'data',
                desc: 'rule.desc.typeCast',
                defaultData: () => ({sourceVar: '', targetType: 'STRING', precision: 2, description: ''}),
                paramSchema: [
                    {
                        name: 'sourceVar',
                        label: 'rule.lbl.sourceVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.amount',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'targetType',
                        label: 'rule.lbl.targetType',
                        type: 'select',
                        required: true,
                        options: TYPE_OPTIONS,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'precision',
                        label: 'rule.lbl.precision',
                        type: 'number',
                        min: 0,
                        max: 10,
                        default: 2,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'dataset-load', label: 'rule.node.datasetLoad', icon: '📊', category: 'data',
                desc: 'rule.desc.datasetLoad',
                defaultData: () => ({source: 'form', fieldPath: '', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'source',
                        label: 'rule.lbl.dataSource',
                        type: 'select',
                        required: true,
                        options: SOURCE_OPTIONS,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'fieldPath',
                        label: 'rule.lbl.fieldPath',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.orderDetails',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.targetVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.detailList',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'datasource-fetch', label: 'rule.node.datasourceFetch', icon: '🔌', category: 'data',
                desc: 'rule.desc.datasourceFetch',
                defaultData: () => ({
                    // —— 接口来源（对齐 ApiLinkageDetail.apiMode）——
                    apiMode: 'custom',
                    apiType: 'thirdApi',
                    // —— 业务接口配置（对齐 ApiInfo）——
                    url: '',
                    httpMethod: 'GET',
                    protocol: 'https',
                    timeout: 5000,
                    requestDataType: 'json',
                    headers: [],
                    requestParams: [],
                    body: '',
                    // —— 响应解析 ——
                    successCode: '200',
                    codePath: 'code',
                    messagePath: 'message',
                    dataPath: 'data',
                    // —— 字段映射（对齐 FieldMapping[]）——
                    fieldMappings: [],
                    // —— 数据源字段属性（对齐 OptionField）——
                    displayField: '',
                    valueField: '',
                    childrenField: '',
                    leafField: '',
                    disabledField: '',
                    // —— 缓存 ——
                    cacheEnabled: false,
                    cacheTTL: 300,
                    // —— 高级 ——
                    proxyEnabled: true,
                    proxyUrl: '/system-config/redirect/apiLinkage',
                    retryCount: 0,
                    description: ''
                }),
                paramSchema: [
                    // ===== 接口来源 =====
                    {
                        name: 'apiMode', label: 'rule.lbl.apiMode', type: 'select', required: true, group: 'rule.group.apiSource',
                        options: [
                            {label: () => i18n('rule.opt.systemApi'), value: 'system'},
                            {label: () => i18n('rule.opt.customApi'), value: 'custom'},
                        ]
                    },
                    {
                        name: 'apiType', label: 'rule.lbl.apiType', type: 'select', group: 'rule.group.apiSource',
                        options: [
                            {label: () => i18n('rule.opt.thirdApi'), value: 'thirdApi'},
                            {label: () => i18n('rule.opt.systemApiType'), value: 'systemApi'},
                        ]
                    },
                    {
                        name: 'serviceName', label: 'rule.lbl.serviceName', type: 'input', group: 'rule.group.apiSource',
                        placeholder: 'rule.ph.serviceName',
                    },
                    {
                        name: 'interfaceName', label: 'rule.lbl.interfaceName', type: 'input', group: 'rule.group.apiSource',
                        placeholder: 'rule.ph.interfaceName',
                    },
                    // ===== 请求配置 =====
                    {
                        name: 'httpMethod', label: 'rule.lbl.httpMethod', type: 'select', required: true, group: 'rule.group.request',
                        options: [
                            {label: 'GET', value: 'GET'},
                            {label: 'POST', value: 'POST'},
                        ]
                    },
                    {
                        name: 'url', label: 'rule.lbl.apiUrl', type: 'input', required: true, group: 'rule.group.request',
                        placeholder: '/api/inventory/query'
                    },
                    {
                        name: 'protocol', label: 'rule.lbl.protocol', type: 'select', group: 'rule.group.request',
                        options: [
                            {label: 'https', value: 'https'},
                            {label: 'http', value: 'http'},
                        ]
                    },
                    {
                        name: 'requestDataType', label: 'rule.lbl.requestDataType', type: 'select', group: 'rule.group.request',
                        options: [
                            {label: 'JSON', value: 'json'},
                            {label: 'Form', value: 'form'},
                        ]
                    },
                    {
                        name: 'timeout', label: 'rule.lbl.timeout', type: 'number', min: 1000, step: 1000, default: 5000, group: 'rule.group.request'
                    },
                    {
                        name: 'headers', label: 'rule.lbl.headers', type: 'table', group: 'rule.group.request',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    {
                        name: 'requestParams', label: 'rule.lbl.requestParams', type: 'table', group: 'rule.group.request',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    {
                        name: 'body', label: 'rule.lbl.requestBody', type: 'textarea', rows: 4, group: 'rule.group.request',
                        placeholder: 'rule.ph.jsonBody'
                    },
                    // ===== 响应解析 =====
                    {
                        name: 'successCode', label: 'rule.lbl.successCode', type: 'input', default: '200', group: 'rule.group.response',
                        placeholder: '200'
                    },
                    {
                        name: 'codePath', label: 'rule.lbl.codePath', type: 'input', default: 'code', group: 'rule.group.response',
                        placeholder: 'data.code'
                    },
                    {
                        name: 'messagePath', label: 'rule.lbl.messagePath', type: 'input', default: 'message', group: 'rule.group.response',
                        placeholder: 'data.message'
                    },
                    {
                        name: 'dataPath', label: 'rule.lbl.dataPath', type: 'input', default: 'data', group: 'rule.group.response',
                        placeholder: 'data.list'
                    },
                    // ===== 字段映射 =====
                    {
                        name: 'fieldMappings', label: 'rule.lbl.fieldMappings', type: 'table', group: 'rule.group.mapping',
                        columns: [
                            {prop: 'sourceField', label: 'rule.lbl.sourceField', type: 'input', width: '45%'},
                            {prop: 'distField', label: 'rule.lbl.distField', type: 'input', fieldSelect: true, width: '45%'},
                        ]
                    },
                    // ===== 数据源字段属性（对齐 OptionField）=====
                    {
                        name: 'displayField', label: 'rule.lbl.displayField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'name'
                    },
                    {
                        name: 'valueField', label: 'rule.lbl.valueField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'code'
                    },
                    {
                        name: 'childrenField', label: 'rule.lbl.childrenField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'children'
                    },
                    {
                        name: 'leafField', label: 'rule.lbl.leafField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'leaf'
                    },
                    {
                        name: 'disabledField', label: 'rule.lbl.disabledField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'disabled'
                    },
                    // ===== 缓存 =====
                    {
                        name: 'cacheEnabled', label: 'rule.lbl.enableCache', type: 'switch', default: false, group: 'rule.group.cache'
                    },
                    {
                        name: 'cacheTTL', label: 'rule.lbl.cacheTTL', type: 'number', min: 0, default: 300, group: 'rule.group.cache'
                    },
                    // ===== 高级 =====
                    {
                        name: 'proxyEnabled', label: 'rule.lbl.proxyEnabled', type: 'switch', default: true, group: 'rule.group.advanced'
                    },
                    {
                        name: 'proxyUrl', label: 'rule.lbl.proxyUrl', type: 'input', group: 'rule.group.advanced',
                        placeholder: '/system-config/redirect/apiLinkage'
                    },
                    {
                        name: 'retryCount', label: 'rule.lbl.retryCount', type: 'number', min: 0, max: 5, default: 0, group: 'rule.group.advanced'
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 二、复合条件判断 ============
    {
        name: 'rule.category.complexCondition', icon: '🔷', color: '#06b6d4',
        nodes: [
            {
                type: 'cond-multibranch', label: 'rule.node.multiBranch', icon: '🌳', category: 'condition',
                desc: 'rule.desc.multiBranch',
                defaultData: () => ({
                    matchField: '',
                    matchType: 'ENUM',                 // ENUM 枚举匹配 | RANGE 区间分段
                    // —— 分支列表（targetNode 期望为画布节点 ID）——
                    branches: [],                       // [{ label, value, targetNode }]
                    defaultBranch: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'matchField', label: 'rule.lbl.matchField', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.matchField', fieldSelect: true
                    },
                    {
                        name: 'matchType', label: 'rule.lbl.matchType', type: 'select', required: true, group: 'rule.group.basic',
                        options: [
                            {label: () => i18n('rule.opt.enumMatch'), value: 'ENUM'},
                            {label: () => i18n('rule.opt.rangeSegment'), value: 'RANGE'},
                            {label: () => i18n('rule.opt.regexMatch'), value: 'REGEX'},
                        ]
                    },
                    // 默认分支（下拉选择画布节点）
                    {
                        name: 'defaultBranch', label: 'rule.lbl.defaultBranch', type: 'select', group: 'rule.group.basic',
                        placeholder: 'rule.ph.defaultBranch',
                        options: []  // 运行时由 PropertyPanel 注入画布节点列表
                    },
                    {
                        name: 'branches', label: 'rule.lbl.branchList', type: 'table', group: 'rule.group.branch',
                        columns: [
                            {prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px'},
                            {prop: 'value', label: 'rule.lbl.matchValue', type: 'input', fieldSelect: true, width: '150px'},
                            {prop: 'targetNode', label: 'rule.lbl.targetNode', type: 'select', width: '120px',
                                options: []  // 运行时由 PropertyPanel 注入画布节点列表
                            },
                        ]
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'cond-set-contains', label: 'rule.node.setContains', icon: '∩', category: 'condition',
                desc: 'rule.desc.setContains',
                defaultData: () => ({sourceSet: '', targetSet: '', checkType: 'CONTAINS_ANY', description: ''}),
                paramSchema: [
                    {
                        name: 'sourceSet',
                        label: 'rule.lbl.sourceSet',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.sourceSet',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'targetSet',
                        label: 'rule.lbl.targetSet',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.targetSet',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'checkType', label: 'rule.lbl.checkType', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.containsAny'), value: 'CONTAINS_ANY'},
                            {label: () => i18n('rule.opt.containsAll'), value: 'CONTAINS_ALL'},
                            {label: () => i18n('rule.opt.equals'), value: 'EQUALS'},
                            {label: () => i18n('rule.opt.noIntersect'), value: 'NO_INTERSECT'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'cond-dirty-check', label: 'rule.node.dirtyCheck', icon: '🚫', category: 'condition',
                desc: 'rule.desc.dirtyCheck',
                defaultData: () => ({fields: [], checkRules: ['EMPTY', 'NULL'], blockOnFail: 'Y', description: ''}),
                paramSchema: [
                    {
                        name: 'fields',
                        label: 'rule.lbl.checkFields',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.checkFields',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'checkRules',
                        label: 'rule.lbl.checkRules',
                        type: 'multiselect',
                        required: true,
                        options: [
                            {label: () => i18n('rule.opt.empty'), value: 'EMPTY'},
                            {label: 'NULL', value: 'NULL'},
                            {label: () => i18n('rule.opt.specialChar'), value: 'SPECIAL_CHAR'},
                            {label: () => i18n('rule.opt.tooLong'), value: 'TOO_LONG'},
                            {label: () => i18n('rule.opt.negative'), value: 'NEGATIVE'},
                        ],
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'blockOnFail',
                        label: 'rule.lbl.blockOnFail',
                        type: 'switch',
                        default: 'Y',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'cond-time-window', label: 'rule.node.timeWindow', icon: '📅', category: 'condition',
                desc: 'rule.desc.timeWindow',
                defaultData: () => ({
                    dateField: '',
                    windowType: 'WORKDAY',
                    startDate: '',
                    endDate: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'dateField',
                        label: 'rule.lbl.dateField',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.dateField',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'windowType', label: 'rule.lbl.windowType', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.workday'), value: 'WORKDAY'},
                            {label: () => i18n('rule.opt.natural'), value: 'NATURAL'},
                            {label: () => i18n('rule.opt.billing'), value: 'BILLING'},
                            {label: () => i18n('rule.opt.range'), value: 'RANGE'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'startDate',
                        label: 'rule.lbl.startDate',
                        type: 'date',
                        placeholder: 'rule.ph.startDate',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'endDate',
                        label: 'rule.lbl.endDate',
                        type: 'date',
                        placeholder: 'rule.ph.endDate',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'cond-unique', label: 'rule.node.uniqueCheck', icon: '🔍', category: 'condition',
                desc: 'rule.desc.uniqueCheck',
                defaultData: () => ({fields: [], scope: 'CURRENT_FORM', description: ''}),
                paramSchema: [
                    {
                        name: 'fields',
                        label: 'rule.lbl.validateFields',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.validateFields',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'scope', label: 'rule.lbl.validateScope', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.currentForm'), value: 'CURRENT_FORM'},
                            {label: () => i18n('rule.opt.crossForm'), value: 'CROSS_FORM'},
                            {label: () => i18n('rule.opt.database'), value: 'DATABASE'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'cond-threshold', label: 'rule.node.thresholdAlert', icon: '⚠️', category: 'condition',
                desc: 'rule.desc.thresholdAlert',
                defaultData: () => ({field: '', thresholds: [], alertLevel: 'WARN', description: ''}),
                paramSchema: [
                    {
                        name: 'field',
                        label: 'rule.lbl.checkField',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.checkField',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'alertLevel',
                        label: 'rule.lbl.alertLevel',
                        type: 'select',
                        required: true,
                        options: ALERT_LEVEL_OPTIONS,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'thresholds',
                        label: 'rule.lbl.thresholdRange',
                        type: 'table',
                        group: 'rule.group.threshold',
                        columns: [
                            {prop: 'min', label: 'rule.lbl.minValue', type: 'input', width: '100px'},
                            {prop: 'max', label: 'rule.lbl.maxValue', type: 'input', width: '100px'},
                            {prop: 'label', label: 'rule.lbl.rangeLabel', type: 'input', width: '120px'},
                        ]
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 三、循环迭代 ============
    {
        name: 'rule.category.loopIterate', icon: '🔁', color: '#f59e0b',
        nodes: [
            {
                type: 'loop-iterate', label: 'rule.node.loopIterate', icon: '📋', category: 'loop',
                desc: 'rule.desc.loopIterate',
                defaultData: () => ({collectionVar: '', itemVar: 'item', indexVar: 'index', description: ''}),
                paramSchema: [
                    {
                        name: 'collectionVar',
                        label: 'rule.lbl.collectionVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.collectionVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'itemVar',
                        label: 'rule.lbl.itemVarName',
                        type: 'input',
                        default: 'item',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'indexVar',
                        label: 'rule.lbl.indexVarName',
                        type: 'input',
                        default: 'index',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'loop-aggregate', label: 'rule.node.loopAggregate', icon: 'Σ', category: 'loop',
                desc: 'rule.desc.loopAggregate',
                defaultData: () => ({collectionVar: '', aggField: '', aggType: 'SUM', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'collectionVar',
                        label: 'rule.lbl.collectionVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.collectionVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'aggType', label: 'rule.lbl.aggType', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.sum'), value: 'SUM'},
                            {label: () => i18n('rule.opt.max'), value: 'MAX'},
                            {label: () => i18n('rule.opt.min'), value: 'MIN'},
                            {label: () => i18n('rule.opt.avg'), value: 'AVG'},
                            {label: () => i18n('rule.opt.count'), value: 'COUNT'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'aggField',
                        label: 'rule.lbl.aggField',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.aggField',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'loop-filter', label: 'rule.node.loopFilter', icon: '⚡', category: 'loop',
                desc: 'rule.desc.loopFilter',
                defaultData: () => ({collectionVar: '', filterCondition: '', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'collectionVar',
                        label: 'rule.lbl.sourceSet',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.sourceSet',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'filterCondition',
                        label: 'rule.lbl.filterCondition',
                        type: 'textarea',
                        rows: 2,
                        required: true,
                        placeholder: 'rule.ph.filterCondition',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'loop-break', label: 'rule.node.loopBreak', icon: '⏹️', category: 'loop',
                desc: 'rule.desc.loopBreak',
                defaultData: () => ({breakCondition: '', description: ''}),
                paramSchema: [
                    {
                        name: 'breakCondition',
                        label: 'rule.lbl.breakCondition',
                        type: 'textarea',
                        rows: 2,
                        required: true,
                        placeholder: 'rule.ph.breakCondition',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 四、运算&公式 ============
    {
        name: 'rule.category.calcFormula', icon: '🧮', color: '#8b5cf6',
        nodes: [
            {
                type: 'calc-money', label: 'rule.node.calcMoney', icon: '¥', category: 'calc',
                desc: 'rule.desc.calcMoney',
                defaultData: () => ({
                    operands: '',
                    operator: 'ADD',
                    precision: 2,
                    roundMode: 'HALF_UP',
                    targetVar: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'operands',
                        label: 'rule.lbl.operands',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.operands',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'operator', label: 'rule.lbl.operator', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.add'), value: 'ADD'},
                            {label: () => i18n('rule.opt.sub'), value: 'SUB'},
                            {label: () => i18n('rule.opt.mul'), value: 'MUL'},
                            {label: () => i18n('rule.opt.div'), value: 'DIV'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'precision',
                        label: 'rule.lbl.precisionDigits',
                        type: 'number',
                        min: 0,
                        max: 10,
                        default: 2,
                        group: 'rule.group.precision'
                    },
                    {
                        name: 'roundMode',
                        label: 'rule.lbl.roundMode',
                        type: 'select',
                        required: true,
                        options: ROUND_MODE_OPTIONS,
                        group: 'rule.group.precision'
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'calc-date', label: 'rule.node.calcDate', icon: '📆', category: 'calc',
                desc: 'rule.desc.calcDate',
                defaultData: () => ({baseDate: '', offset: 0, offsetUnit: 'DAY', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'baseDate',
                        label: 'rule.lbl.baseDate',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.baseDate',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'offset',
                        label: 'rule.lbl.offset',
                        type: 'number',
                        required: true,
                        default: 0,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'offsetUnit', label: 'rule.lbl.offsetUnit', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.day'), value: 'DAY'},
                            {label: () => i18n('rule.opt.hour'), value: 'HOUR'},
                            {label: () => i18n('rule.opt.minute'), value: 'MINUTE'},
                            {label: () => i18n('rule.opt.month'), value: 'MONTH'},
                            {label: () => i18n('rule.opt.year'), value: 'YEAR'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'calc-string', label: 'rule.node.calcString', icon: '📝', category: 'calc',
                desc: 'rule.desc.calcString',
                defaultData: () => ({operation: 'CONCAT', operands: '', targetVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'operation', label: 'rule.lbl.operationType', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.concat'), value: 'CONCAT'},
                            {label: () => i18n('rule.opt.substring'), value: 'SUBSTRING'},
                            {label: () => i18n('rule.opt.mask'), value: 'MASK'},
                            {label: () => i18n('rule.opt.upper'), value: 'UPPER'},
                            {label: () => i18n('rule.opt.lower'), value: 'LOWER'},
                            {label: () => i18n('rule.opt.trim'), value: 'TRIM'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'operands',
                        label: 'rule.lbl.operands',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.operandsVars',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'calc-dict-map', label: 'rule.node.dictMap', icon: '📖', category: 'calc',
                desc: 'rule.desc.dictMap',
                defaultData: () => ({
                    sourceVar: '',
                    dictCode: '',
                    matchField: '',                  // 按哪个属性匹配：code/name
                    defaultValue: '',
                    targetVar: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'sourceVar', label: 'rule.lbl.sourceVar', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.sourceVar', fieldSelect: true
                    },
                    {
                        name: 'dictCode', label: 'rule.lbl.dictCode', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.dictCode'
                    },
                    {
                        name: 'matchField', label: 'rule.lbl.matchField', type: 'select', group: 'rule.group.basic',
                        options: [
                            {label: 'code', value: 'code'},
                            {label: 'name', value: 'name'},
                        ],
                        default: 'code'
                    },
                    {
                        name: 'defaultValue', label: 'rule.lbl.defaultValue', type: 'input', group: 'rule.group.basic',
                        placeholder: 'rule.ph.defaultValue'
                    },
                    {
                        name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.resultVar'
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'calc-ratio', label: 'rule.node.calcRatio', icon: '%', category: 'calc',
                desc: 'rule.desc.calcRatio',
                defaultData: () => ({
                    totalAmount: '',
                    ratioSource: '',
                    ratioField: '',
                    roundMode: 'HALF_UP',
                    targetVar: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'totalAmount',
                        label: 'rule.lbl.totalAmountVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.totalAmountVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'ratioSource',
                        label: 'rule.lbl.ratioSource',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.ratioSource',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'ratioField',
                        label: 'rule.lbl.ratioField',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.ratioField',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'roundMode',
                        label: 'rule.lbl.roundMode',
                        type: 'select',
                        required: true,
                        options: ROUND_MODE_OPTIONS,
                        group: 'rule.group.precision'
                    },
                    {
                        name: 'targetVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 五、分支事务动作 ============
    {
        name: 'rule.category.branchAction', icon: '⚡', color: '#22c55e',
        nodes: [
            {
                type: 'action-set-options', label: 'rule.node.setOptions', icon: '📋', category: 'action',
                desc: 'rule.desc.setOptions',
                defaultData: () => ({
                    targetField: '',
                    // —— 数据源类型（对齐 shplugin OptionField 配置场景）——
                    optionsSource: 'STATIC',       // STATIC 静态 | DICT 字典 | API 接口 | VAR 变量
                    // —— 静态选项（STATIC 模式）——
                    staticOptions: [],              // [{ label, value }]
                    // —— 字典配置（DICT 模式）——
                    dictCode: '',
                    dictFilters: [],                // 字典过滤条件
                    // —— 接口配置（API 模式，复用 ApiLinkageDetail 结构）——
                    apiMode: 'custom',
                    apiType: 'thirdApi',
                    url: '',
                    httpMethod: 'GET',
                    protocol: 'https',
                    timeout: 5000,
                    requestDataType: 'json',
                    headers: [],
                    requestParams: [],
                    body: '',
                    successCode: '200',
                    codePath: 'code',
                    messagePath: 'message',
                    dataPath: 'data',
                    proxyEnabled: true,
                    proxyUrl: '/system-config/redirect/apiLinkage',
                    // —— 变量（VAR 模式）——
                    optionsVar: '',
                    // —— 数据源字段属性（对齐 OptionField）——
                    displayField: '',
                    valueField: '',
                    childrenField: '',
                    leafField: '',
                    disabledField: '',
                    description: ''
                }),
                paramSchema: [
                    // ===== 目标字段 =====
                    {
                        name: 'targetField', label: 'rule.lbl.targetField', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.targetField', fieldSelect: true
                    },
                    // ===== 数据源类型 =====
                    {
                        name: 'optionsSource', label: 'rule.lbl.optionsSource', type: 'select', required: true, group: 'rule.group.basic',
                        options: [
                            {label: () => i18n('rule.opt.staticOptions'), value: 'STATIC'},
                            {label: () => i18n('rule.opt.dictOptions'), value: 'DICT'},
                            {label: () => i18n('rule.opt.apiOptions'), value: 'API'},
                            {label: () => i18n('rule.opt.varOptions'), value: 'VAR'},
                        ]
                    },
                    // ===== 静态选项（STATIC 模式）=====
                    {
                        name: 'staticOptions', label: 'rule.lbl.staticOptions', type: 'table', group: 'rule.group.staticOptions',
                        columns: [
                            {prop: 'label', label: 'rule.lbl.optionLabel', type: 'input', width: '50%'},
                            {prop: 'value', label: 'rule.lbl.optionValue', type: 'input', width: '50%'},
                        ]
                    },
                    // ===== 字典配置（DICT 模式）=====
                    {
                        name: 'dictCode', label: 'rule.lbl.dictCode', type: 'input', required: true, group: 'rule.group.dictConfig',
                        placeholder: 'rule.ph.dictCode'
                    },
                    {
                        name: 'dictFilters', label: 'rule.lbl.dictFilters', type: 'table', group: 'rule.group.dictConfig',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    // ===== 接口配置（API 模式）=====
                    {
                        name: 'apiMode', label: 'rule.lbl.apiMode', type: 'select', group: 'rule.group.apiConfig',
                        options: [
                            {label: () => i18n('rule.opt.systemApi'), value: 'system'},
                            {label: () => i18n('rule.opt.customApi'), value: 'custom'},
                        ]
                    },
                    {
                        name: 'httpMethod', label: 'rule.lbl.httpMethod', type: 'select', group: 'rule.group.apiConfig',
                        options: [
                            {label: 'GET', value: 'GET'},
                            {label: 'POST', value: 'POST'},
                        ]
                    },
                    {
                        name: 'url', label: 'rule.lbl.apiUrl', type: 'input', group: 'rule.group.apiConfig',
                        placeholder: '/api/options/list'
                    },
                    {
                        name: 'protocol', label: 'rule.lbl.protocol', type: 'select', group: 'rule.group.apiConfig',
                        options: [
                            {label: 'https', value: 'https'},
                            {label: 'http', value: 'http'},
                        ]
                    },
                    {
                        name: 'requestDataType', label: 'rule.lbl.requestDataType', type: 'select', group: 'rule.group.apiConfig',
                        options: [
                            {label: 'JSON', value: 'json'},
                            {label: 'Form', value: 'form'},
                        ]
                    },
                    {
                        name: 'timeout', label: 'rule.lbl.timeout', type: 'number', min: 1000, step: 1000, default: 5000, group: 'rule.group.apiConfig'
                    },
                    {
                        name: 'headers', label: 'rule.lbl.headers', type: 'table', group: 'rule.group.apiConfig',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    {
                        name: 'requestParams', label: 'rule.lbl.requestParams', type: 'table', group: 'rule.group.apiConfig',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    {
                        name: 'body', label: 'rule.lbl.requestBody', type: 'textarea', rows: 4, group: 'rule.group.apiConfig',
                        placeholder: 'rule.ph.jsonBody'
                    },
                    // ===== 响应解析 =====
                    {
                        name: 'successCode', label: 'rule.lbl.successCode', type: 'input', default: '200', group: 'rule.group.apiResponse',
                        placeholder: '200'
                    },
                    {
                        name: 'codePath', label: 'rule.lbl.codePath', type: 'input', default: 'code', group: 'rule.group.apiResponse',
                        placeholder: 'data.code'
                    },
                    {
                        name: 'messagePath', label: 'rule.lbl.messagePath', type: 'input', default: 'message', group: 'rule.group.apiResponse',
                        placeholder: 'data.message'
                    },
                    {
                        name: 'dataPath', label: 'rule.lbl.dataPath', type: 'input', default: 'data', group: 'rule.group.apiResponse',
                        placeholder: 'data.list'
                    },
                    // ===== 变量（VAR 模式）=====
                    {
                        name: 'optionsVar', label: 'rule.lbl.optionsVar', type: 'input', group: 'rule.group.varConfig',
                        placeholder: 'rule.ph.optionsVar'
                    },
                    // ===== 数据源字段属性（对齐 OptionField）=====
                    {
                        name: 'displayField', label: 'rule.lbl.displayField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'name'
                    },
                    {
                        name: 'valueField', label: 'rule.lbl.valueField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'code'
                    },
                    {
                        name: 'childrenField', label: 'rule.lbl.childrenField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'children'
                    },
                    {
                        name: 'leafField', label: 'rule.lbl.leafField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'leaf'
                    },
                    {
                        name: 'disabledField', label: 'rule.lbl.disabledField', type: 'input', group: 'rule.group.optionField',
                        placeholder: 'disabled'
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 六、消息与通知 ============
    {
        name: 'rule.category.messageNotify', icon: '📢', color: '#eab308',
        nodes: [
            {
                type: 'msg-push-todo', label: 'rule.node.msgPushTodo', icon: '📨', category: 'message',
                desc: 'rule.desc.msgPushTodo',
                defaultData: () => ({
                    pushType: 'TODO',                  // TODO 待办 | COUNTERSIGN 会签 | TRANSFER 转办 | REMIND 提醒
                    // —— 目标用户（支持字段选择 + 多用户）——
                    targetUsers: [],                    // [{ valueType, paramName, paramValue }]
                    title: '',
                    content: '',
                    // —— 业务字段（对齐钉钉/宜搭待办模型）——
                    priority: 'NORMAL',                // NORMAL 普通 | URGENT 紧急 | CRITICAL 特急
                    deadline: '',                       // 截止时间（datetime）
                    jumpUrl: '',                        // 跳转链接（支持 ${formId} 变量）
                    bizType: '',                        // 业务类型（用于待办分类）
                    bizId: '',                          // 业务ID（关联业务记录）
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'pushType', label: 'rule.lbl.pushType', type: 'select', required: true, group: 'rule.group.basic',
                        options: [
                            {label: () => i18n('rule.opt.todo'), value: 'TODO'},
                            {label: () => i18n('rule.opt.countersign'), value: 'COUNTERSIGN'},
                            {label: () => i18n('rule.opt.transfer'), value: 'TRANSFER'},
                            {label: () => i18n('rule.opt.remind'), value: 'REMIND'},
                        ]
                    },
                    // 目标用户（结构化，支持字段选择 + 静态/动态值）
                    {
                        name: 'targetUsers', label: 'rule.lbl.targetUsers', type: 'table', required: true, group: 'rule.group.basic',
                        columns: [
                            {prop: 'paramName', label: 'rule.lbl.paramName', type: 'input', width: '30%'},
                            {
                                prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '20%',
                                options: [
                                    {label: () => i18n('rule.opt.static'), value: 'static'},
                                    {label: () => i18n('rule.opt.dynamic'), value: 'dynamic'},
                                ]
                            },
                            {prop: 'paramValue', label: 'rule.lbl.paramValue', type: 'input', fieldSelect: true, width: '40%'},
                        ]
                    },
                    {
                        name: 'title', label: 'rule.lbl.title', type: 'input', required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.pushTitle'
                    },
                    {
                        name: 'content', label: 'rule.lbl.content', type: 'textarea', rows: 3, required: true, group: 'rule.group.basic',
                        placeholder: 'rule.ph.pushContent'
                    },
                    // —— 业务字段 ——
                    {
                        name: 'priority', label: 'rule.lbl.priority', type: 'select', default: 'NORMAL', group: 'rule.group.business',
                        options: [
                            {label: () => i18n('rule.opt.priorityNormal'), value: 'NORMAL'},
                            {label: () => i18n('rule.opt.priorityUrgent'), value: 'URGENT'},
                            {label: () => i18n('rule.opt.priorityCritical'), value: 'CRITICAL'},
                        ]
                    },
                    {
                        name: 'deadline', label: 'rule.lbl.deadline', type: 'date', group: 'rule.group.business'
                    },
                    {
                        name: 'jumpUrl', label: 'rule.lbl.jumpUrl', type: 'input', group: 'rule.group.business',
                        placeholder: '/form/detail?id=${formId}'
                    },
                    {
                        name: 'bizType', label: 'rule.lbl.bizType', type: 'input', group: 'rule.group.business',
                        placeholder: 'rule.ph.bizType'
                    },
                    {
                        name: 'bizId', label: 'rule.lbl.bizId', type: 'input', fieldSelect: true, group: 'rule.group.business',
                        placeholder: 'rule.ph.bizId'
                    },
                    {
                        name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'msg-alert', label: 'rule.node.msgAlert', icon: '🚨', category: 'message',
                desc: 'rule.desc.msgAlert',
                defaultData: () => ({
                    channels: [],
                    alertLevel: 'WARN',
                    title: '',
                    content: '',
                    recipients: '',
                    description: ''
                }),
                paramSchema: [
                    {
                        name: 'channels',
                        label: 'rule.lbl.notifyChannels',
                        type: 'multiselect',
                        required: true,
                        options: [
                            {label: () => i18n('rule.opt.inApp'), value: 'IN_APP'},
                            {label: () => i18n('rule.opt.sms'), value: 'SMS'},
                            {label: () => i18n('rule.opt.dingtalk'), value: 'DINGTALK'},
                            {label: () => i18n('rule.opt.wecom'), value: 'WECOM'},
                            {label: () => i18n('rule.opt.email'), value: 'EMAIL'},
                        ],
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'alertLevel',
                        label: 'rule.lbl.alertLevel',
                        type: 'select',
                        required: true,
                        options: ALERT_LEVEL_OPTIONS,
                        group: 'rule.group.basic'
                    },
                    {name: 'title', label: 'rule.lbl.title', type: 'input', required: true, group: 'rule.group.basic'},
                    {
                        name: 'content',
                        label: 'rule.lbl.content',
                        type: 'textarea',
                        rows: 3,
                        required: true,
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'recipients',
                        label: 'rule.lbl.recipients',
                        type: 'input',
                        placeholder: 'rule.ph.recipients',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'msg-log', label: 'rule.node.msgLog', icon: '📜', category: 'message',
                desc: 'rule.desc.msgLog',
                defaultData: () => ({logType: 'AUDIT', logContent: '', fields: '', description: ''}),
                paramSchema: [
                    {
                        name: 'logType', label: 'rule.lbl.logType', type: 'select', required: true, options: [
                            {label: () => i18n('rule.opt.auditLog'), value: 'AUDIT'},
                            {label: () => i18n('rule.opt.operationLog'), value: 'OPERATION'},
                            {label: () => i18n('rule.opt.violationLog'), value: 'VIOLATION'},
                            {label: () => i18n('rule.opt.executionLog'), value: 'EXECUTION'},
                        ], group: 'rule.group.basic'
                    },
                    {
                        name: 'logContent',
                        label: 'rule.lbl.logContent',
                        type: 'textarea',
                        rows: 3,
                        required: true,
                        placeholder: 'rule.ph.logContent',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'fields',
                        label: 'rule.lbl.logFields',
                        type: 'input',
                        placeholder: 'rule.ph.logFields',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
    // ============ 七、外部集成调用 ============
    {
        name: 'rule.category.externalIntegrate', icon: '🌐', color: '#ec4899',
        nodes: [
            {
                type: 'ext-sp-call', label: 'rule.node.extSpCall', icon: '🗄️', category: 'external',
                desc: 'rule.desc.extSpCall',
                defaultData: () => ({spName: '', params: '', resultVar: '', description: ''}),
                paramSchema: [
                    {
                        name: 'spName',
                        label: 'rule.lbl.spName',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.spName',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'params',
                        label: 'rule.lbl.paramList',
                        type: 'textarea',
                        rows: 2,
                        placeholder: 'rule.ph.paramList',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'resultVar',
                        label: 'rule.lbl.resultVar',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.resultVar',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'ext-mq-send', label: 'rule.node.extMqSend', icon: '📤', category: 'external',
                desc: 'rule.desc.extMqSend',
                defaultData: () => ({queueName: '', message: '', exchange: '', routingKey: '', description: ''}),
                paramSchema: [
                    {
                        name: 'queueName',
                        label: 'rule.lbl.queueName',
                        type: 'input',
                        required: true,
                        placeholder: 'rule.ph.queueName',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'exchange',
                        label: 'rule.lbl.exchange',
                        type: 'input',
                        placeholder: 'rule.ph.exchange',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'routingKey',
                        label: 'rule.lbl.routingKey',
                        type: 'input',
                        placeholder: 'rule.ph.routingKey',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'message',
                        label: 'rule.lbl.msgContent',
                        type: 'textarea',
                        rows: 3,
                        required: true,
                        placeholder: 'rule.ph.msgContent',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
            {
                type: 'ext-file-export', label: 'rule.node.extFileExport', icon: '📄', category: 'external',
                desc: 'rule.desc.extFileExport',
                defaultData: () => ({exportType: 'EXCEL', template: '', fields: '', fileName: '', description: ''}),
                paramSchema: [
                    {
                        name: 'exportType',
                        label: 'rule.lbl.exportFormat',
                        type: 'select',
                        required: true,
                        options: [{label: 'Excel', value: 'EXCEL'}, {label: 'CSV', value: 'CSV'}, {
                            label: 'PDF',
                            value: 'PDF'
                        }],
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'template',
                        label: 'rule.lbl.templateName',
                        type: 'input',
                        placeholder: 'rule.ph.templateName',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'fields',
                        label: 'rule.lbl.exportFields',
                        type: 'input',
                        placeholder: 'rule.ph.exportFields',
                        group: 'rule.group.basic',
                        fieldSelect: true
                    },
                    {
                        name: 'fileName',
                        label: 'rule.lbl.fileName',
                        type: 'input',
                        placeholder: 'rule.ph.fileName',
                        group: 'rule.group.basic'
                    },
                    {
                        name: 'description',
                        label: 'rule.lbl.nodeDesc',
                        type: 'textarea',
                        rows: 2,
                        group: 'rule.group.other'
                    },
                ]
            },
        ]
    },
]

// 扁平化映射
export const NODE_TYPE_MAP: Record<string, NodeTypeDef> = NODE_CATEGORIES.reduce(
    (map, cat) => {
        cat.nodes.forEach(n => {
            map[n.type] = n
        });
        return map
    },
    {} as Record<string, NodeTypeDef>
)

export const getCategoryColor = (type: string): string => {
    const cat = NODE_CATEGORIES.find(c => c.nodes.some(n => n.type === type))
    return cat?.color || '#64748b'
}

export const getNodeDef = (type: string): NodeTypeDef | undefined => NODE_TYPE_MAP[type]
export const getNodeDefaultData = (type: string): Record<string, any> => NODE_TYPE_MAP[type]?.defaultData() || {}
export const getNodeLabel = (type: string): string => {
    const raw = NODE_TYPE_MAP[type]?.label || type
    // label 存的是 i18n key（如 'rule.node.condition'），需翻译后返回
    return typeof raw === 'string' && raw.startsWith('rule.') ? i18n(raw) : raw
}
export const getParamSchema = (type: string): ParamField[] => NODE_TYPE_MAP[type]?.paramSchema || []
