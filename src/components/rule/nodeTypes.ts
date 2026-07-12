/**
 * 企业级规则引擎节点类型定义
 * 10大类40+种专业节点，每种节点带完整参数schema
 */

import { i18n } from '@/lang'

export interface ParamField {
  name: string
  label: string
  type: 'input' | 'number' | 'select' | 'multiselect' | 'textarea' | 'date' | 'switch' | 'table'
  required?: boolean
  options?: { label: string; value: any }[]
  placeholder?: string
  default?: any
  group?: string
  min?: number
  max?: number
  step?: number
  rows?: number
  columns?: { prop: string; label: string; type?: 'input' | 'select'; options?: any[]; width?: string }[]
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
  { label: () => i18n('rule.opt.formData'), value: 'form' },
  { label: () => i18n('rule.opt.processVar'), value: 'process' },
  { label: () => i18n('rule.opt.apiReturn'), value: 'api' },
  { label: () => i18n('rule.opt.historySnapshot'), value: 'snapshot' },
]
const TYPE_OPTIONS = [
  { label: () => i18n('rule.opt.string'), value: 'STRING' },
  { label: () => i18n('rule.opt.number'), value: 'NUMBER' },
  { label: () => i18n('rule.opt.date'), value: 'DATE' },
  { label: () => i18n('rule.opt.boolean'), value: 'BOOLEAN' },
]
const ROUND_MODE_OPTIONS = [
  { label: () => i18n('rule.opt.halfUp'), value: 'HALF_UP' },
  { label: () => i18n('rule.opt.floor'), value: 'FLOOR' },
  { label: () => i18n('rule.opt.ceil'), value: 'CEIL' },
  { label: () => i18n('rule.opt.truncate'), value: 'TRUNCATE' },
]
const ALERT_LEVEL_OPTIONS = [
  { label: () => i18n('rule.opt.info'), value: 'INFO' },
  { label: () => i18n('rule.opt.warn'), value: 'WARN' },
  { label: () => i18n('rule.opt.error'), value: 'ERROR' },
  { label: () => i18n('rule.opt.block'), value: 'BLOCK' },
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
        defaultData: () => ({ endType: 'success' }),
        paramSchema: [
          { name: 'endType', label: 'rule.lbl.resultType', type: 'select', options: [
            { label: () => i18n('rule.opt.pass'), value: 'success' },
            { label: () => i18n('rule.opt.reject'), value: 'fail' },
            { label: () => i18n('rule.opt.skip'), value: 'skip' },
          ], group: 'rule.group.basic' },
        ]
      },
      {
        type: 'exclusive-gateway', label: 'rule.node.exclusiveGateway', icon: '✕', category: 'flow',
        desc: 'rule.desc.exclusiveGateway',
        defaultData: () => ({ name: '', branches: [] }),
        paramSchema: [
          { name: 'name', label: 'rule.lbl.routeName', type: 'input', group: 'rule.group.basic' },
          { name: 'branches', label: 'rule.lbl.conditionBranch', type: 'table', group: 'rule.group.branch',
            columns: [
              { prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px' },
              { prop: 'condition', label: 'rule.lbl.conditionExpr', type: 'input', width: '200px' },
            ]
          },
        ]
      },
      {
        type: 'parallel-gateway', label: 'rule.node.parallelGateway', icon: '+', category: 'flow',
        desc: 'rule.desc.parallelGateway',
        defaultData: () => ({ name: '' }),
        paramSchema: [
          { name: 'name', label: 'rule.lbl.ruleGroupName', type: 'input', group: 'rule.group.basic' },
        ]
      },
      {
        type: 'inclusive-gateway', label: 'rule.node.inclusiveGateway', icon: 'O', category: 'flow',
        desc: 'rule.desc.inclusiveGateway',
        defaultData: () => ({ name: '', branches: [] }),
        paramSchema: [
          { name: 'name', label: 'rule.lbl.routeName', type: 'input', group: 'rule.group.basic' },
          { name: 'branches', label: 'rule.lbl.conditionBranch', type: 'table', group: 'rule.group.branch',
            columns: [
              { prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px' },
              { prop: 'condition', label: 'rule.lbl.conditionExpr', type: 'input', width: '200px' },
            ]
          },
        ]
      },
      {
        type: 'loop', label: 'rule.node.loop', icon: '🔄', category: 'flow',
        desc: 'rule.desc.loop',
        defaultData: () => ({ loopType: 'forEach', collectionVar: '', itemVar: 'item', indexVar: 'index' }),
        paramSchema: [
          { name: 'loopType', label: 'rule.lbl.loopType', type: 'select', options: [
            { label: () => i18n('rule.opt.forEach'), value: 'forEach' },
            { label: () => i18n('rule.opt.while'), value: 'while' },
            { label: () => i18n('rule.opt.count'), value: 'count' },
          ], group: 'rule.group.basic' },
          { name: 'collectionVar', label: 'rule.lbl.collectionVar', type: 'input', placeholder: 'rule.ph.items', group: 'rule.group.basic' },
          { name: 'itemVar', label: 'rule.lbl.itemVar', type: 'input', default: 'item', group: 'rule.group.basic' },
          { name: 'indexVar', label: 'rule.lbl.indexVar', type: 'input', default: 'index', group: 'rule.group.basic' },
        ]
      },
      {
        type: 'join', label: 'rule.node.join', icon: '⊕', category: 'flow',
        desc: 'rule.desc.join',
        defaultData: () => ({ joinType: 'AND', waitAll: 'Y' }),
        paramSchema: [
          { name: 'joinType', label: 'rule.lbl.joinStrategy', type: 'select', options: [
            { label: () => i18n('rule.opt.allPass'), value: 'AND' },
            { label: () => i18n('rule.opt.anyPass'), value: 'OR' },
            { label: () => i18n('rule.opt.byCount'), value: 'COUNT' },
          ], group: 'rule.group.basic' },
          { name: 'waitAll', label: 'rule.lbl.waitAll', type: 'switch', default: 'Y', group: 'rule.group.basic' },
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
        defaultData: () => ({ logic: 'AND', conditions: [] }),
        paramSchema: [
          { name: 'logic', label: 'rule.lbl.logic', type: 'select', options: [
            { label: () => i18n('rule.opt.and'), value: 'AND' },
            { label: () => i18n('rule.opt.or'), value: 'OR' },
          ], group: 'rule.group.basic' },
          { name: 'conditions', label: 'rule.lbl.conditionList', type: 'table', group: 'rule.group.condition',
            columns: [
              { prop: 'fieldName', label: 'rule.lbl.fieldName', type: 'input', width: '120px' },
              { prop: 'operator', label: 'rule.lbl.operator', type: 'select', width: '100px',
                options: [
                  { label: () => i18n('rule.opt.eq'), value: 'EQ' },
                  { label: () => i18n('rule.opt.neq'), value: 'NEQ' },
                  { label: () => i18n('rule.opt.gt'), value: 'GT' },
                  { label: () => i18n('rule.opt.lt'), value: 'LT' },
                  { label: () => i18n('rule.opt.contains'), value: 'CONTAINS' },
                ]
              },
              { prop: 'value', label: 'rule.lbl.value', type: 'input', width: '120px' },
            ]
          },
        ]
      },
      {
        type: 'action', label: 'rule.node.action', icon: '▶', category: 'logic',
        desc: 'rule.desc.action',
        defaultData: () => ({ actions: [] }),
        paramSchema: [
          { name: 'actions', label: 'rule.lbl.actionList', type: 'table', group: 'rule.group.action',
            columns: [
              { prop: 'actionType', label: 'rule.lbl.actionType', type: 'select', width: '120px',
                options: [
                  { label: () => i18n('rule.opt.showField'), value: 'SHOW_FIELD' },
                  { label: () => i18n('rule.opt.hideField'), value: 'HIDE_FIELD' },
                  { label: () => i18n('rule.opt.setValue'), value: 'SET_VALUE' },
                  { label: () => i18n('rule.opt.clearValue'), value: 'CLEAR_VALUE' },
                  { label: () => i18n('rule.opt.setRequired'), value: 'SET_REQUIRED' },
                  { label: () => i18n('rule.opt.showMessage'), value: 'SHOW_MESSAGE' },
                ]
              },
              { prop: 'targetField', label: 'rule.lbl.targetField', type: 'input', width: '120px' },
              { prop: 'actionValue', label: 'rule.lbl.value', type: 'input', width: '120px' },
            ]
          },
        ]
      },
      {
        type: 'variable-assign', label: 'rule.node.variableAssign', icon: '=', category: 'logic',
        desc: 'rule.desc.variableAssign',
        defaultData: () => ({ assignments: [] }),
        paramSchema: [
          { name: 'assignments', label: 'rule.lbl.assignList', type: 'table', group: 'rule.group.assign',
            columns: [
              { prop: 'variableName', label: 'rule.lbl.varName', type: 'input', width: '120px' },
              { prop: 'value', label: 'rule.lbl.value', type: 'input', width: '150px' },
              { prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', width: '100px',
                options: [
                  { label: () => i18n('rule.opt.constant'), value: 'CONSTANT' },
                  { label: () => i18n('rule.opt.variable'), value: 'VARIABLE' },
                  { label: () => i18n('rule.opt.expression'), value: 'EXPRESSION' },
                ]
              },
            ]
          },
        ]
      },
      {
        type: 'script', label: 'rule.node.script', icon: '📜', category: 'logic',
        desc: 'rule.desc.script',
        defaultData: () => ({ scriptContent: '', description: '' }),
        paramSchema: [
          { name: 'scriptContent', label: 'rule.lbl.scriptContent', type: 'textarea', rows: 8, placeholder: 'rule.ph.script', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'http-call', label: 'rule.node.httpCall', icon: '🌐', category: 'logic',
        desc: 'rule.desc.httpCall',
        defaultData: () => ({ method: 'GET', url: '', headers: {}, body: '', responseVar: '', timeout: 5000, retryCount: 0 }),
        paramSchema: [
          { name: 'method', label: 'rule.lbl.httpMethod', type: 'select', options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ], group: 'rule.group.basic' },
          { name: 'url', label: 'rule.lbl.apiUrl', type: 'input', required: true, placeholder: 'https://api.example.com/data', group: 'rule.group.basic' },
          { name: 'body', label: 'rule.lbl.requestBody', type: 'textarea', rows: 4, placeholder: 'rule.ph.jsonBody', group: 'rule.group.basic' },
          { name: 'responseVar', label: 'rule.lbl.responseVar', type: 'input', placeholder: 'rule.ph.responseVar', group: 'rule.group.basic' },
          { name: 'timeout', label: 'rule.lbl.timeout', type: 'number', min: 1000, default: 5000, group: 'rule.group.advanced' },
          { name: 'retryCount', label: 'rule.lbl.retryCount', type: 'number', min: 0, max: 5, default: 0, group: 'rule.group.advanced' },
        ]
      },
      {
        type: 'rule-set-ref', label: 'rule.node.ruleSetRef', icon: '📚', category: 'logic',
        desc: 'rule.desc.ruleSetRef',
        defaultData: () => ({ ruleSetCode: '', ruleSetName: '', inputMapping: {}, outputMapping: {} }),
        paramSchema: [
          { name: 'ruleSetCode', label: 'rule.lbl.ruleSetCode', type: 'input', required: true, placeholder: 'rule.ph.orderValidation', group: 'rule.group.basic' },
          { name: 'ruleSetName', label: 'rule.lbl.ruleSetName', type: 'input', placeholder: 'rule.ph.optionalDesc', group: 'rule.group.basic' },
          { name: 'inputMapping', label: 'rule.lbl.inputMapping', type: 'textarea', rows: 3, placeholder: 'rule.ph.inputMapping', group: 'rule.group.mapping' },
          { name: 'outputMapping', label: 'rule.lbl.outputMapping', type: 'textarea', rows: 3, placeholder: 'rule.ph.outputMapping', group: 'rule.group.mapping' },
        ]
      },
      {
        type: 'decision-table', label: 'rule.node.decisionTable', icon: '📊', category: 'logic',
        desc: 'rule.desc.decisionTable',
        defaultData: () => ({ tableName: '', conditions: [], actions: [], rules: [] }),
        paramSchema: [
          { name: 'tableName', label: 'rule.lbl.tableName', type: 'input', required: true, placeholder: 'rule.ph.discountTable', group: 'rule.group.basic' },
          { name: 'conditions', label: 'rule.lbl.conditionColumns', type: 'table', group: 'rule.group.condition',
            columns: [
              { prop: 'fieldName', label: 'rule.lbl.fieldName', type: 'input', width: '120px' },
              { prop: 'fieldLabel', label: 'rule.lbl.fieldLabel', type: 'input', width: '120px' },
              { prop: 'operator', label: 'rule.lbl.operator', type: 'select', width: '100px',
                options: [
                  { label: () => i18n('rule.opt.eq'), value: 'EQ' },
                  { label: () => i18n('rule.opt.gt'), value: 'GT' },
                  { label: () => i18n('rule.opt.lt'), value: 'LT' },
                  { label: () => i18n('rule.opt.between'), value: 'BETWEEN' },
                ]
              },
            ]
          },
          { name: 'actions', label: 'rule.lbl.actionColumns', type: 'table', group: 'rule.group.action',
            columns: [
              { prop: 'actionType', label: 'rule.lbl.actionType', type: 'select', width: '120px',
                options: [
                  { label: () => i18n('rule.opt.setValue'), value: 'SET_VALUE' },
                  { label: () => i18n('rule.opt.showMessage'), value: 'SHOW_MESSAGE' },
                  { label: () => i18n('rule.opt.redirect'), value: 'REDIRECT' },
                ]
              },
              { prop: 'targetField', label: 'rule.lbl.targetField', type: 'input', width: '120px' },
            ]
          },
          { name: 'rules', label: 'rule.lbl.ruleRows', type: 'table', group: 'rule.group.rule',
            columns: [
              { prop: 'priority', label: 'rule.lbl.priority', type: 'input', width: '80px' },
              { prop: 'conditionValues', label: 'rule.lbl.conditionValues', type: 'input', width: '200px' },
              { prop: 'actionValues', label: 'rule.lbl.actionValues', type: 'input', width: '200px' },
            ]
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
        defaultData: () => ({ source: 'form', fieldPath: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'source', label: 'rule.lbl.dataSource', type: 'select', required: true, options: SOURCE_OPTIONS, group: 'rule.group.basic' },
          { name: 'fieldPath', label: 'rule.lbl.fieldPath', type: 'input', required: true, placeholder: 'rule.ph.orderAmount', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.targetVar', type: 'input', required: true, placeholder: 'rule.ph.totalAmount', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, placeholder: 'rule.ph.nodePurpose', group: 'rule.group.other' },
        ]
      },
      {
        type: 'type-cast', label: 'rule.node.typeCast', icon: '🔄', category: 'data',
        desc: 'rule.desc.typeCast',
        defaultData: () => ({ sourceVar: '', targetType: 'STRING', precision: 2, description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: 'rule.lbl.sourceVar', type: 'input', required: true, placeholder: 'rule.ph.amount', group: 'rule.group.basic' },
          { name: 'targetType', label: 'rule.lbl.targetType', type: 'select', required: true, options: TYPE_OPTIONS, group: 'rule.group.basic' },
          { name: 'precision', label: 'rule.lbl.precision', type: 'number', min: 0, max: 10, default: 2, group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'dataset-load', label: 'rule.node.datasetLoad', icon: '📊', category: 'data',
        desc: 'rule.desc.datasetLoad',
        defaultData: () => ({ source: 'form', fieldPath: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'source', label: 'rule.lbl.dataSource', type: 'select', required: true, options: SOURCE_OPTIONS, group: 'rule.group.basic' },
          { name: 'fieldPath', label: 'rule.lbl.fieldPath', type: 'input', required: true, placeholder: 'rule.ph.orderDetails', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.targetVar', type: 'input', required: true, placeholder: 'rule.ph.detailList', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'datasource-fetch', label: 'rule.node.datasourceFetch', icon: '🔌', category: 'data',
        desc: 'rule.desc.datasourceFetch',
        defaultData: () => ({ sourceType: 'API', apiUrl: '', method: 'GET', targetVar: '', cacheEnabled: 'Y', cacheTTL: 300, description: '' }),
        paramSchema: [
          { name: 'sourceType', label: 'rule.lbl.datasourceType', type: 'select', required: true, options: [{ label: 'REST API', value: 'API' }, { label: () => i18n('rule.opt.dbQuery'), value: 'DB' }, { label: () => i18n('rule.opt.redisCache'), value: 'REDIS' }], group: 'rule.group.basic' },
          { name: 'method', label: 'rule.lbl.httpMethod', type: 'select', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }], group: 'rule.group.basic' },
          { name: 'apiUrl', label: 'rule.lbl.apiUrl', type: 'input', required: true, placeholder: '/api/inventory/query', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.targetVar', type: 'input', required: true, placeholder: 'rule.ph.stockData', group: 'rule.group.basic' },
          { name: 'cacheEnabled', label: 'rule.lbl.enableCache', type: 'switch', default: 'Y', group: 'rule.group.cache' },
          { name: 'cacheTTL', label: 'rule.lbl.cacheTTL', type: 'number', min: 0, default: 300, group: 'rule.group.cache' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
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
        defaultData: () => ({ matchField: '', matchType: 'ENUM', branches: [], defaultBranch: '', description: '' }),
        paramSchema: [
          { name: 'matchField', label: 'rule.lbl.matchField', type: 'input', required: true, placeholder: 'rule.ph.matchField', group: 'rule.group.basic' },
          { name: 'matchType', label: 'rule.lbl.matchType', type: 'select', required: true, options: [{ label: () => i18n('rule.opt.enumMatch'), value: 'ENUM' }, { label: () => i18n('rule.opt.rangeSegment'), value: 'RANGE' }], group: 'rule.group.basic' },
          { name: 'defaultBranch', label: 'rule.lbl.defaultBranch', type: 'input', placeholder: 'rule.ph.defaultBranch', group: 'rule.group.basic' },
          { name: 'branches', label: 'rule.lbl.branchList', type: 'table', group: 'rule.group.branch',
            columns: [
              { prop: 'label', label: 'rule.lbl.branchLabel', type: 'input', width: '120px' },
              { prop: 'value', label: 'rule.lbl.matchValue', type: 'input', width: '150px' },
              { prop: 'targetNode', label: 'rule.lbl.targetNode', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'cond-set-contains', label: 'rule.node.setContains', icon: '∩', category: 'condition',
        desc: 'rule.desc.setContains',
        defaultData: () => ({ sourceSet: '', targetSet: '', checkType: 'CONTAINS_ANY', description: '' }),
        paramSchema: [
          { name: 'sourceSet', label: 'rule.lbl.sourceSet', type: 'input', required: true, placeholder: 'rule.ph.sourceSet', group: 'rule.group.basic' },
          { name: 'targetSet', label: 'rule.lbl.targetSet', type: 'input', required: true, placeholder: 'rule.ph.targetSet', group: 'rule.group.basic' },
          { name: 'checkType', label: 'rule.lbl.checkType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.containsAny'), value: 'CONTAINS_ANY' },
            { label: () => i18n('rule.opt.containsAll'), value: 'CONTAINS_ALL' },
            { label: () => i18n('rule.opt.equals'), value: 'EQUALS' },
            { label: () => i18n('rule.opt.noIntersect'), value: 'NO_INTERSECT' },
          ], group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'cond-dirty-check', label: 'rule.node.dirtyCheck', icon: '🚫', category: 'condition',
        desc: 'rule.desc.dirtyCheck',
        defaultData: () => ({ fields: [], checkRules: ['EMPTY', 'NULL'], blockOnFail: 'Y', description: '' }),
        paramSchema: [
          { name: 'fields', label: 'rule.lbl.checkFields', type: 'input', required: true, placeholder: 'rule.ph.checkFields', group: 'rule.group.basic' },
          { name: 'checkRules', label: 'rule.lbl.checkRules', type: 'multiselect', required: true, options: [
            { label: () => i18n('rule.opt.empty'), value: 'EMPTY' },
            { label: 'NULL', value: 'NULL' },
            { label: () => i18n('rule.opt.specialChar'), value: 'SPECIAL_CHAR' },
            { label: () => i18n('rule.opt.tooLong'), value: 'TOO_LONG' },
            { label: () => i18n('rule.opt.negative'), value: 'NEGATIVE' },
          ], group: 'rule.group.basic' },
          { name: 'blockOnFail', label: 'rule.lbl.blockOnFail', type: 'switch', default: 'Y', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'cond-time-window', label: 'rule.node.timeWindow', icon: '📅', category: 'condition',
        desc: 'rule.desc.timeWindow',
        defaultData: () => ({ dateField: '', windowType: 'WORKDAY', startDate: '', endDate: '', description: '' }),
        paramSchema: [
          { name: 'dateField', label: 'rule.lbl.dateField', type: 'input', required: true, placeholder: 'rule.ph.dateField', group: 'rule.group.basic' },
          { name: 'windowType', label: 'rule.lbl.windowType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.workday'), value: 'WORKDAY' },
            { label: () => i18n('rule.opt.natural'), value: 'NATURAL' },
            { label: () => i18n('rule.opt.billing'), value: 'BILLING' },
            { label: () => i18n('rule.opt.range'), value: 'RANGE' },
          ], group: 'rule.group.basic' },
          { name: 'startDate', label: 'rule.lbl.startDate', type: 'date', placeholder: 'rule.ph.startDate', group: 'rule.group.basic' },
          { name: 'endDate', label: 'rule.lbl.endDate', type: 'date', placeholder: 'rule.ph.endDate', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'cond-unique', label: 'rule.node.uniqueCheck', icon: '🔍', category: 'condition',
        desc: 'rule.desc.uniqueCheck',
        defaultData: () => ({ fields: [], scope: 'CURRENT_FORM', description: '' }),
        paramSchema: [
          { name: 'fields', label: 'rule.lbl.validateFields', type: 'input', required: true, placeholder: 'rule.ph.validateFields', group: 'rule.group.basic' },
          { name: 'scope', label: 'rule.lbl.validateScope', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.currentForm'), value: 'CURRENT_FORM' },
            { label: () => i18n('rule.opt.crossForm'), value: 'CROSS_FORM' },
            { label: () => i18n('rule.opt.database'), value: 'DATABASE' },
          ], group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'cond-threshold', label: 'rule.node.thresholdAlert', icon: '⚠️', category: 'condition',
        desc: 'rule.desc.thresholdAlert',
        defaultData: () => ({ field: '', thresholds: [], alertLevel: 'WARN', description: '' }),
        paramSchema: [
          { name: 'field', label: 'rule.lbl.checkField', type: 'input', required: true, placeholder: 'rule.ph.checkField', group: 'rule.group.basic' },
          { name: 'alertLevel', label: 'rule.lbl.alertLevel', type: 'select', required: true, options: ALERT_LEVEL_OPTIONS, group: 'rule.group.basic' },
          { name: 'thresholds', label: 'rule.lbl.thresholdRange', type: 'table', group: 'rule.group.threshold',
            columns: [
              { prop: 'min', label: 'rule.lbl.minValue', type: 'input', width: '100px' },
              { prop: 'max', label: 'rule.lbl.maxValue', type: 'input', width: '100px' },
              { prop: 'label', label: 'rule.lbl.rangeLabel', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
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
        defaultData: () => ({ collectionVar: '', itemVar: 'item', indexVar: 'index', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: 'rule.lbl.collectionVar', type: 'input', required: true, placeholder: 'rule.ph.collectionVar', group: 'rule.group.basic' },
          { name: 'itemVar', label: 'rule.lbl.itemVarName', type: 'input', default: 'item', group: 'rule.group.basic' },
          { name: 'indexVar', label: 'rule.lbl.indexVarName', type: 'input', default: 'index', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'loop-aggregate', label: 'rule.node.loopAggregate', icon: 'Σ', category: 'loop',
        desc: 'rule.desc.loopAggregate',
        defaultData: () => ({ collectionVar: '', aggField: '', aggType: 'SUM', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: 'rule.lbl.collectionVar', type: 'input', required: true, placeholder: 'rule.ph.collectionVar', group: 'rule.group.basic' },
          { name: 'aggType', label: 'rule.lbl.aggType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.sum'), value: 'SUM' },
            { label: () => i18n('rule.opt.max'), value: 'MAX' },
            { label: () => i18n('rule.opt.min'), value: 'MIN' },
            { label: () => i18n('rule.opt.avg'), value: 'AVG' },
            { label: () => i18n('rule.opt.count'), value: 'COUNT' },
          ], group: 'rule.group.basic' },
          { name: 'aggField', label: 'rule.lbl.aggField', type: 'input', required: true, placeholder: 'rule.ph.aggField', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'loop-filter', label: 'rule.node.loopFilter', icon: '⚡', category: 'loop',
        desc: 'rule.desc.loopFilter',
        defaultData: () => ({ collectionVar: '', filterCondition: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: 'rule.lbl.sourceSet', type: 'input', required: true, placeholder: 'rule.ph.sourceSet', group: 'rule.group.basic' },
          { name: 'filterCondition', label: 'rule.lbl.filterCondition', type: 'textarea', rows: 2, required: true, placeholder: 'rule.ph.filterCondition', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'loop-break', label: 'rule.node.loopBreak', icon: '⏹️', category: 'loop',
        desc: 'rule.desc.loopBreak',
        defaultData: () => ({ breakCondition: '', description: '' }),
        paramSchema: [
          { name: 'breakCondition', label: 'rule.lbl.breakCondition', type: 'textarea', rows: 2, required: true, placeholder: 'rule.ph.breakCondition', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
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
        defaultData: () => ({ operands: '', operator: 'ADD', precision: 2, roundMode: 'HALF_UP', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operands', label: 'rule.lbl.operands', type: 'input', required: true, placeholder: 'rule.ph.operands', group: 'rule.group.basic' },
          { name: 'operator', label: 'rule.lbl.operator', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.add'), value: 'ADD' },
            { label: () => i18n('rule.opt.sub'), value: 'SUB' },
            { label: () => i18n('rule.opt.mul'), value: 'MUL' },
            { label: () => i18n('rule.opt.div'), value: 'DIV' },
          ], group: 'rule.group.basic' },
          { name: 'precision', label: 'rule.lbl.precisionDigits', type: 'number', min: 0, max: 10, default: 2, group: 'rule.group.precision' },
          { name: 'roundMode', label: 'rule.lbl.roundMode', type: 'select', required: true, options: ROUND_MODE_OPTIONS, group: 'rule.group.precision' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'calc-date', label: 'rule.node.calcDate', icon: '📆', category: 'calc',
        desc: 'rule.desc.calcDate',
        defaultData: () => ({ baseDate: '', offset: 0, offsetUnit: 'DAY', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'baseDate', label: 'rule.lbl.baseDate', type: 'input', required: true, placeholder: 'rule.ph.baseDate', group: 'rule.group.basic' },
          { name: 'offset', label: 'rule.lbl.offset', type: 'number', required: true, default: 0, group: 'rule.group.basic' },
          { name: 'offsetUnit', label: 'rule.lbl.offsetUnit', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.day'), value: 'DAY' },
            { label: () => i18n('rule.opt.hour'), value: 'HOUR' },
            { label: () => i18n('rule.opt.minute'), value: 'MINUTE' },
            { label: () => i18n('rule.opt.month'), value: 'MONTH' },
            { label: () => i18n('rule.opt.year'), value: 'YEAR' },
          ], group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'calc-string', label: 'rule.node.calcString', icon: '📝', category: 'calc',
        desc: 'rule.desc.calcString',
        defaultData: () => ({ operation: 'CONCAT', operands: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operation', label: 'rule.lbl.operationType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.concat'), value: 'CONCAT' },
            { label: () => i18n('rule.opt.substring'), value: 'SUBSTRING' },
            { label: () => i18n('rule.opt.mask'), value: 'MASK' },
            { label: () => i18n('rule.opt.upper'), value: 'UPPER' },
            { label: () => i18n('rule.opt.lower'), value: 'LOWER' },
            { label: () => i18n('rule.opt.trim'), value: 'TRIM' },
          ], group: 'rule.group.basic' },
          { name: 'operands', label: 'rule.lbl.operands', type: 'input', required: true, placeholder: 'rule.ph.operandsVars', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'calc-dict-map', label: 'rule.node.dictMap', icon: '📖', category: 'calc',
        desc: 'rule.desc.dictMap',
        defaultData: () => ({ sourceVar: '', dictCode: '', defaultValue: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: 'rule.lbl.sourceVar', type: 'input', required: true, placeholder: 'rule.ph.sourceVar', group: 'rule.group.basic' },
          { name: 'dictCode', label: 'rule.lbl.dictCode', type: 'input', required: true, placeholder: 'rule.ph.dictCode', group: 'rule.group.basic' },
          { name: 'defaultValue', label: 'rule.lbl.defaultValue', type: 'input', placeholder: 'rule.ph.defaultValue', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'calc-ratio', label: 'rule.node.calcRatio', icon: '%', category: 'calc',
        desc: 'rule.desc.calcRatio',
        defaultData: () => ({ totalAmount: '', ratioSource: '', ratioField: '', roundMode: 'HALF_UP', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'totalAmount', label: 'rule.lbl.totalAmountVar', type: 'input', required: true, placeholder: 'rule.ph.totalAmountVar', group: 'rule.group.basic' },
          { name: 'ratioSource', label: 'rule.lbl.ratioSource', type: 'input', required: true, placeholder: 'rule.ph.ratioSource', group: 'rule.group.basic' },
          { name: 'ratioField', label: 'rule.lbl.ratioField', type: 'input', required: true, placeholder: 'rule.ph.ratioField', group: 'rule.group.basic' },
          { name: 'roundMode', label: 'rule.lbl.roundMode', type: 'select', required: true, options: ROUND_MODE_OPTIONS, group: 'rule.group.precision' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
  // ============ 五、分支事务动作 ============
  {
    name: 'rule.category.branchAction', icon: '⚡', color: '#22c55e',
    nodes: [
      {
        type: 'action-assign', label: 'rule.node.actionAssign', icon: '✏️', category: 'action',
        desc: 'rule.desc.actionAssign',
        defaultData: () => ({ assignments: [], description: '' }),
        paramSchema: [
          { name: 'assignments', label: 'rule.lbl.assignList', type: 'table', required: true, group: 'rule.group.assign',
            columns: [
              { prop: 'targetField', label: 'rule.lbl.targetField', type: 'input', width: '120px' },
              { prop: 'valueType', label: 'rule.lbl.valueType', type: 'select', options: [{ label: () => i18n('rule.opt.constant'), value: 'CONSTANT' }, { label: () => i18n('rule.opt.variable'), value: 'VARIABLE' }], width: '100px' },
              { prop: 'value', label: 'rule.lbl.value', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'action-mark', label: 'rule.node.actionMark', icon: '🏷️', category: 'action',
        desc: 'rule.desc.actionMark',
        defaultData: () => ({ targetField: '', markType: 'VOID', markValue: '', description: '' }),
        paramSchema: [
          { name: 'targetField', label: 'rule.lbl.targetField', type: 'input', required: true, placeholder: 'rule.ph.targetField', group: 'rule.group.basic' },
          { name: 'markType', label: 'rule.lbl.markType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.void'), value: 'VOID' },
            { label: () => i18n('rule.opt.lock'), value: 'LOCK' },
            { label: () => i18n('rule.opt.unlock'), value: 'UNLOCK' },
            { label: () => i18n('rule.opt.special'), value: 'SPECIAL' },
            { label: () => i18n('rule.opt.urgent'), value: 'URGENT' },
          ], group: 'rule.group.basic' },
          { name: 'markValue', label: 'rule.lbl.markValue', type: 'input', placeholder: 'rule.ph.markValue', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'action-filter-output', label: 'rule.node.filterOutput', icon: '🔽', category: 'action',
        desc: 'rule.desc.filterOutput',
        defaultData: () => ({ sourceVar: '', filterCondition: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: 'rule.lbl.sourceSet', type: 'input', required: true, placeholder: 'rule.ph.sourceSet', group: 'rule.group.basic' },
          { name: 'filterCondition', label: 'rule.lbl.filterCondition', type: 'textarea', rows: 2, required: true, placeholder: 'rule.ph.filterCondition', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'action-split-merge', label: 'rule.node.splitMerge', icon: '🔀', category: 'action',
        desc: 'rule.desc.splitMerge',
        defaultData: () => ({ operation: 'MERGE', sourceVar: '', groupFields: '', aggFields: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operation', label: 'rule.lbl.operationType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.merge'), value: 'MERGE' },
            { label: () => i18n('rule.opt.split'), value: 'SPLIT' },
          ], group: 'rule.group.basic' },
          { name: 'sourceVar', label: 'rule.lbl.sourceSet', type: 'input', required: true, placeholder: 'rule.ph.sourceSet', group: 'rule.group.basic' },
          { name: 'groupFields', label: 'rule.lbl.groupFields', type: 'input', placeholder: 'rule.ph.groupFields', group: 'rule.group.basic' },
          { name: 'aggFields', label: 'rule.lbl.aggFields', type: 'input', placeholder: 'rule.ph.aggFields', group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
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
        defaultData: () => ({ pushType: 'TODO', targetUsers: '', title: '', content: '', description: '' }),
        paramSchema: [
          { name: 'pushType', label: 'rule.lbl.pushType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.todo'), value: 'TODO' },
            { label: () => i18n('rule.opt.countersign'), value: 'COUNTERSIGN' },
            { label: () => i18n('rule.opt.transfer'), value: 'TRANSFER' },
            { label: () => i18n('rule.opt.remind'), value: 'REMIND' },
          ], group: 'rule.group.basic' },
          { name: 'targetUsers', label: 'rule.lbl.targetUsers', type: 'input', placeholder: 'rule.ph.targetUsers', group: 'rule.group.basic' },
          { name: 'title', label: 'rule.lbl.title', type: 'input', required: true, placeholder: 'rule.ph.pushTitle', group: 'rule.group.basic' },
          { name: 'content', label: 'rule.lbl.content', type: 'textarea', rows: 3, required: true, placeholder: 'rule.ph.pushContent', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'msg-alert', label: 'rule.node.msgAlert', icon: '🚨', category: 'message',
        desc: 'rule.desc.msgAlert',
        defaultData: () => ({ channels: [], alertLevel: 'WARN', title: '', content: '', recipients: '', description: '' }),
        paramSchema: [
          { name: 'channels', label: 'rule.lbl.notifyChannels', type: 'multiselect', required: true, options: [
            { label: () => i18n('rule.opt.inApp'), value: 'IN_APP' },
            { label: () => i18n('rule.opt.sms'), value: 'SMS' },
            { label: () => i18n('rule.opt.dingtalk'), value: 'DINGTALK' },
            { label: () => i18n('rule.opt.wecom'), value: 'WECOM' },
            { label: () => i18n('rule.opt.email'), value: 'EMAIL' },
          ], group: 'rule.group.basic' },
          { name: 'alertLevel', label: 'rule.lbl.alertLevel', type: 'select', required: true, options: ALERT_LEVEL_OPTIONS, group: 'rule.group.basic' },
          { name: 'title', label: 'rule.lbl.title', type: 'input', required: true, group: 'rule.group.basic' },
          { name: 'content', label: 'rule.lbl.content', type: 'textarea', rows: 3, required: true, group: 'rule.group.basic' },
          { name: 'recipients', label: 'rule.lbl.recipients', type: 'input', placeholder: 'rule.ph.recipients', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'msg-log', label: 'rule.node.msgLog', icon: '📜', category: 'message',
        desc: 'rule.desc.msgLog',
        defaultData: () => ({ logType: 'AUDIT', logContent: '', fields: '', description: '' }),
        paramSchema: [
          { name: 'logType', label: 'rule.lbl.logType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.auditLog'), value: 'AUDIT' },
            { label: () => i18n('rule.opt.operationLog'), value: 'OPERATION' },
            { label: () => i18n('rule.opt.violationLog'), value: 'VIOLATION' },
            { label: () => i18n('rule.opt.executionLog'), value: 'EXECUTION' },
          ], group: 'rule.group.basic' },
          { name: 'logContent', label: 'rule.lbl.logContent', type: 'textarea', rows: 3, required: true, placeholder: 'rule.ph.logContent', group: 'rule.group.basic' },
          { name: 'fields', label: 'rule.lbl.logFields', type: 'input', placeholder: 'rule.ph.logFields', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
  // ============ 七、外部集成调用 ============
  {
    name: 'rule.category.externalIntegrate', icon: '🌐', color: '#ec4899',
    nodes: [
      {
        type: 'ext-http-call', label: 'rule.node.extHttpCall', icon: '🔗', category: 'external',
        desc: 'rule.desc.extHttpCall',
        defaultData: () => ({ method: 'GET', url: '', timeout: 5000, retryCount: 0, responseVar: '', description: '' }),
        paramSchema: [
          { name: 'method', label: 'rule.lbl.httpMethod', type: 'select', required: true, options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }], group: 'rule.group.basic' },
          { name: 'url', label: 'rule.lbl.apiUrl', type: 'input', required: true, placeholder: 'rule.ph.apiUrl', group: 'rule.group.basic' },
          { name: 'timeout', label: 'rule.lbl.timeoutMs', type: 'number', min: 1000, step: 1000, default: 5000, group: 'rule.group.basic' },
          { name: 'retryCount', label: 'rule.lbl.retryCount', type: 'number', min: 0, max: 5, default: 0, group: 'rule.group.basic' },
          { name: 'responseVar', label: 'rule.lbl.responseVar', type: 'input', required: true, placeholder: 'rule.ph.responseVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ext-sp-call', label: 'rule.node.extSpCall', icon: '🗄️', category: 'external',
        desc: 'rule.desc.extSpCall',
        defaultData: () => ({ spName: '', params: '', resultVar: '', description: '' }),
        paramSchema: [
          { name: 'spName', label: 'rule.lbl.spName', type: 'input', required: true, placeholder: 'rule.ph.spName', group: 'rule.group.basic' },
          { name: 'params', label: 'rule.lbl.paramList', type: 'textarea', rows: 2, placeholder: 'rule.ph.paramList', group: 'rule.group.basic' },
          { name: 'resultVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ext-mq-send', label: 'rule.node.extMqSend', icon: '📤', category: 'external',
        desc: 'rule.desc.extMqSend',
        defaultData: () => ({ queueName: '', message: '', exchange: '', routingKey: '', description: '' }),
        paramSchema: [
          { name: 'queueName', label: 'rule.lbl.queueName', type: 'input', required: true, placeholder: 'rule.ph.queueName', group: 'rule.group.basic' },
          { name: 'exchange', label: 'rule.lbl.exchange', type: 'input', placeholder: 'rule.ph.exchange', group: 'rule.group.basic' },
          { name: 'routingKey', label: 'rule.lbl.routingKey', type: 'input', placeholder: 'rule.ph.routingKey', group: 'rule.group.basic' },
          { name: 'message', label: 'rule.lbl.msgContent', type: 'textarea', rows: 3, required: true, placeholder: 'rule.ph.msgContent', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ext-file-export', label: 'rule.node.extFileExport', icon: '📄', category: 'external',
        desc: 'rule.desc.extFileExport',
        defaultData: () => ({ exportType: 'EXCEL', template: '', fields: '', fileName: '', description: '' }),
        paramSchema: [
          { name: 'exportType', label: 'rule.lbl.exportFormat', type: 'select', required: true, options: [{ label: 'Excel', value: 'EXCEL' }, { label: 'CSV', value: 'CSV' }, { label: 'PDF', value: 'PDF' }], group: 'rule.group.basic' },
          { name: 'template', label: 'rule.lbl.templateName', type: 'input', placeholder: 'rule.ph.templateName', group: 'rule.group.basic' },
          { name: 'fields', label: 'rule.lbl.exportFields', type: 'input', placeholder: 'rule.ph.exportFields', group: 'rule.group.basic' },
          { name: 'fileName', label: 'rule.lbl.fileName', type: 'input', placeholder: 'rule.ph.fileName', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
  // ============ 八、异常与流程控制 ============
  {
    name: 'rule.category.exceptionControl', icon: '🛡️', color: '#ef4444',
    nodes: [
      {
        type: 'ctrl-degrade', label: 'rule.node.ctrlDegrade', icon: '🔽', category: 'control',
        desc: 'rule.desc.ctrlDegrade',
        defaultData: () => ({ degradeCondition: 'TIMEOUT', threshold: 3000, fallbackAction: '', description: '' }),
        paramSchema: [
          { name: 'degradeCondition', label: 'rule.lbl.degradeCondition', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.timeout'), value: 'TIMEOUT' },
            { label: () => i18n('rule.opt.exception'), value: 'EXCEPTION' },
            { label: () => i18n('rule.opt.unavailable'), value: 'UNAVAILABLE' },
            { label: () => i18n('rule.opt.rateLimit'), value: 'RATE_LIMIT' },
          ], group: 'rule.group.basic' },
          { name: 'threshold', label: 'rule.lbl.thresholdMs', type: 'number', min: 100, step: 100, default: 3000, group: 'rule.group.basic' },
          { name: 'fallbackAction', label: 'rule.lbl.fallbackAction', type: 'textarea', rows: 2, placeholder: 'rule.ph.fallbackAction', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ctrl-rollback', label: 'rule.node.ctrlRollback', icon: '↩️', category: 'control',
        desc: 'rule.desc.ctrlRollback',
        defaultData: () => ({ rollbackFields: '', rollbackScope: 'ALL', description: '' }),
        paramSchema: [
          { name: 'rollbackScope', label: 'rule.lbl.rollbackScope', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.allTempData'), value: 'ALL' },
            { label: () => i18n('rule.opt.specifiedFields'), value: 'FIELDS' },
            { label: () => i18n('rule.opt.currentTransaction'), value: 'TRANSACTION' },
          ], group: 'rule.group.basic' },
          { name: 'rollbackFields', label: 'rule.lbl.rollbackFields', type: 'input', placeholder: 'rule.ph.rollbackFields', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ctrl-catch', label: 'rule.node.ctrlCatch', icon: '🪤', category: 'control',
        desc: 'rule.desc.ctrlCatch',
        defaultData: () => ({ catchTypes: [], handlerAction: '', description: '' }),
        paramSchema: [
          { name: 'catchTypes', label: 'rule.lbl.catchTypes', type: 'multiselect', required: true, options: [
            { label: () => i18n('rule.opt.paramError'), value: 'PARAM_ERROR' },
            { label: () => i18n('rule.opt.bizViolation'), value: 'BIZ_VIOLATION' },
            { label: () => i18n('rule.opt.apiFailure'), value: 'API_FAILURE' },
            { label: () => i18n('rule.opt.dbError'), value: 'DB_ERROR' },
            { label: () => i18n('rule.opt.timeout'), value: 'TIMEOUT' },
          ], group: 'rule.group.basic' },
          { name: 'handlerAction', label: 'rule.lbl.handlerAction', type: 'textarea', rows: 2, placeholder: 'rule.ph.handlerAction', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ctrl-terminate', label: 'rule.node.ctrlTerminate', icon: '⛔', category: 'control',
        desc: 'rule.desc.ctrlTerminate',
        defaultData: () => ({ terminateLevel: 'BLOCK', message: '', description: '' }),
        paramSchema: [
          { name: 'terminateLevel', label: 'rule.lbl.terminateLevel', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.block'), value: 'BLOCK' },
            { label: () => i18n('rule.opt.warn'), value: 'WARN' },
            { label: () => i18n('rule.opt.info'), value: 'INFO' },
          ], group: 'rule.group.basic' },
          { name: 'message', label: 'rule.lbl.terminateMsg', type: 'textarea', rows: 2, required: true, placeholder: 'rule.ph.terminateMsg', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'ctrl-delay', label: 'rule.node.ctrlDelay', icon: '⏰', category: 'control',
        desc: 'rule.desc.ctrlDelay',
        defaultData: () => ({ delayType: 'INTERVAL', delayValue: 0, delayUnit: 'MINUTE', description: '' }),
        paramSchema: [
          { name: 'delayType', label: 'rule.lbl.delayType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.interval'), value: 'INTERVAL' },
            { label: () => i18n('rule.opt.cron'), value: 'CRON' },
            { label: () => i18n('rule.opt.condition'), value: 'CONDITION' },
          ], group: 'rule.group.basic' },
          { name: 'delayValue', label: 'rule.lbl.delayValue', type: 'number', min: 0, default: 0, group: 'rule.group.basic' },
          { name: 'delayUnit', label: 'rule.lbl.delayUnit', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.second'), value: 'SECOND' },
            { label: () => i18n('rule.opt.minute'), value: 'MINUTE' },
            { label: () => i18n('rule.opt.hour'), value: 'HOUR' },
            { label: () => i18n('rule.opt.day'), value: 'DAY' },
          ], group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
  // ============ 九、权限&审计 ============
  {
    name: 'rule.category.permissionAudit', icon: '🔐', color: '#64748b',
    nodes: [
      {
        type: 'sec-desensitize', label: 'rule.node.secDesensitize', icon: '🙈', category: 'security',
        desc: 'rule.desc.secDesensitize',
        defaultData: () => ({ fields: '', desensitizeType: 'PHONE', description: '' }),
        paramSchema: [
          { name: 'fields', label: 'rule.lbl.desensitizeFields', type: 'input', required: true, placeholder: 'rule.ph.desensitizeFields', group: 'rule.group.basic' },
          { name: 'desensitizeType', label: 'rule.lbl.desensitizeType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.phone'), value: 'PHONE' },
            { label: () => i18n('rule.opt.idCard'), value: 'ID_CARD' },
            { label: () => i18n('rule.opt.bankCard'), value: 'BANK_CARD' },
            { label: () => i18n('rule.opt.email'), value: 'EMAIL' },
            { label: () => i18n('rule.opt.name'), value: 'NAME' },
            { label: () => i18n('rule.opt.address'), value: 'ADDRESS' },
            { label: () => i18n('rule.opt.custom'), value: 'CUSTOM' },
          ], group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'sec-audit-trail', label: 'rule.node.secAuditTrail', icon: '✍️', category: 'security',
        desc: 'rule.desc.secAuditTrail',
        defaultData: () => ({ auditType: 'FIELD_CHANGE', fields: '', recordOperator: 'Y', description: '' }),
        paramSchema: [
          { name: 'auditType', label: 'rule.lbl.auditType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.fieldChange'), value: 'FIELD_CHANGE' },
            { label: () => i18n('rule.opt.ruleExec'), value: 'RULE_EXEC' },
            { label: () => i18n('rule.opt.dataAccess'), value: 'DATA_ACCESS' },
            { label: () => i18n('rule.opt.statusChange'), value: 'STATUS_CHANGE' },
          ], group: 'rule.group.basic' },
          { name: 'fields', label: 'rule.lbl.auditFields', type: 'input', required: true, placeholder: 'rule.ph.auditFields', group: 'rule.group.basic' },
          { name: 'recordOperator', label: 'rule.lbl.recordOperator', type: 'switch', default: 'Y', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'sec-row-filter', label: 'rule.node.secRowFilter', icon: '👤', category: 'security',
        desc: 'rule.desc.secRowFilter',
        defaultData: () => ({ dataSource: '', filterBy: 'DEPARTMENT', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'dataSource', label: 'rule.lbl.dataSourceVar', type: 'input', required: true, placeholder: 'rule.ph.dataSourceVar', group: 'rule.group.basic' },
          { name: 'filterBy', label: 'rule.lbl.filterDimension', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.department'), value: 'DEPARTMENT' },
            { label: () => i18n('rule.opt.role'), value: 'ROLE' },
            { label: () => i18n('rule.opt.user'), value: 'USER' },
            { label: () => i18n('rule.opt.org'), value: 'ORG' },
          ], group: 'rule.group.basic' },
          { name: 'targetVar', label: 'rule.lbl.resultVar', type: 'input', required: true, placeholder: 'rule.ph.resultVar', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
  // ============ 十、子规则封装 ============
  {
    name: 'rule.category.subRule', icon: '📦', color: '#6366f1',
    nodes: [
      {
        type: 'subrule-call', label: 'rule.node.subruleCall', icon: '📞', category: 'subrule',
        desc: 'rule.desc.subruleCall',
        defaultData: () => ({ subRuleCode: '', subRuleName: '', inputMapping: '', outputMapping: '', description: '' }),
        paramSchema: [
          { name: 'subRuleCode', label: 'rule.lbl.subRuleCode', type: 'input', required: true, placeholder: 'rule.ph.subRuleCode', group: 'rule.group.basic' },
          { name: 'subRuleName', label: 'rule.lbl.subRuleName', type: 'input', placeholder: 'rule.ph.subRuleName', group: 'rule.group.basic' },
          { name: 'inputMapping', label: 'rule.lbl.inputMapping', type: 'textarea', rows: 2, placeholder: 'rule.ph.inputMapping', group: 'rule.group.mapping' },
          { name: 'outputMapping', label: 'rule.lbl.outputMapping', type: 'textarea', rows: 2, placeholder: 'rule.ph.outputMapping', group: 'rule.group.mapping' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'subrule-version', label: 'rule.node.subruleVersion', icon: '🔄', category: 'subrule',
        desc: 'rule.desc.subruleVersion',
        defaultData: () => ({ ruleCode: '', versionType: 'AUTO', specifiedVersion: '', description: '' }),
        paramSchema: [
          { name: 'ruleCode', label: 'rule.lbl.ruleCode', type: 'input', required: true, placeholder: 'rule.ph.ruleCode', group: 'rule.group.basic' },
          { name: 'versionType', label: 'rule.lbl.versionType', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.autoLatest'), value: 'AUTO' },
            { label: () => i18n('rule.opt.testVersion'), value: 'TEST' },
            { label: () => i18n('rule.opt.prodVersion'), value: 'PROD' },
            { label: () => i18n('rule.opt.specifiedVersion'), value: 'SPECIFIED' },
          ], group: 'rule.group.basic' },
          { name: 'specifiedVersion', label: 'rule.lbl.specifiedVersion', type: 'input', placeholder: 'rule.ph.specifiedVersion', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
      {
        type: 'subrule-gray', label: 'rule.node.subruleGray', icon: '🌗', category: 'subrule',
        desc: 'rule.desc.subruleGray',
        defaultData: () => ({ ruleCode: '', grayStrategy: 'BY_PERCENT', grayPercent: 10, grayField: '', description: '' }),
        paramSchema: [
          { name: 'ruleCode', label: 'rule.lbl.ruleCode', type: 'input', required: true, placeholder: 'rule.ph.ruleCode', group: 'rule.group.basic' },
          { name: 'grayStrategy', label: 'rule.lbl.grayStrategy', type: 'select', required: true, options: [
            { label: () => i18n('rule.opt.byPercent'), value: 'BY_PERCENT' },
            { label: () => i18n('rule.opt.byCustomer'), value: 'BY_CUSTOMER' },
            { label: () => i18n('rule.opt.byDocType'), value: 'BY_DOC_TYPE' },
            { label: () => i18n('rule.opt.byTenant'), value: 'BY_TENANT' },
          ], group: 'rule.group.basic' },
          { name: 'grayPercent', label: 'rule.lbl.grayPercent', type: 'number', min: 0, max: 100, default: 10, group: 'rule.group.basic' },
          { name: 'grayField', label: 'rule.lbl.grayField', type: 'input', placeholder: 'rule.ph.grayField', group: 'rule.group.basic' },
          { name: 'description', label: 'rule.lbl.nodeDesc', type: 'textarea', rows: 2, group: 'rule.group.other' },
        ]
      },
    ]
  },
]

// 扁平化映射
export const NODE_TYPE_MAP: Record<string, NodeTypeDef> = NODE_CATEGORIES.reduce(
  (map, cat) => { cat.nodes.forEach(n => { map[n.type] = n }); return map },
  {} as Record<string, NodeTypeDef>
)

export const getCategoryColor = (type: string): string => {
  const cat = NODE_CATEGORIES.find(c => c.nodes.some(n => n.type === type))
  return cat?.color || '#64748b'
}

export const getNodeDef = (type: string): NodeTypeDef | undefined => NODE_TYPE_MAP[type]
export const getNodeDefaultData = (type: string): Record<string, any> => NODE_TYPE_MAP[type]?.defaultData() || {}
export const getNodeLabel = (type: string): string => NODE_TYPE_MAP[type]?.label || type
export const getParamSchema = (type: string): ParamField[] => NODE_TYPE_MAP[type]?.paramSchema || []
