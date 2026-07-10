/**
 * 企业级规则引擎节点类型定义
 * 10大类40+种专业节点，每种节点带完整参数schema
 */

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
  { label: '表单数据', value: 'form' },
  { label: '流程变量', value: 'process' },
  { label: '接口返回', value: 'api' },
  { label: '历史快照', value: 'snapshot' },
]
const TYPE_OPTIONS = [
  { label: '字符串', value: 'STRING' },
  { label: '数字', value: 'NUMBER' },
  { label: '日期', value: 'DATE' },
  { label: '布尔', value: 'BOOLEAN' },
]
const ROUND_MODE_OPTIONS = [
  { label: '四舍五入', value: 'HALF_UP' },
  { label: '向下取整', value: 'FLOOR' },
  { label: '向上取整', value: 'CEIL' },
  { label: '抹零', value: 'TRUNCATE' },
]
const ALERT_LEVEL_OPTIONS = [
  { label: '提示', value: 'INFO' },
  { label: '警告', value: 'WARN' },
  { label: '错误', value: 'ERROR' },
  { label: '阻断', value: 'BLOCK' },
]

export const NODE_CATEGORIES: NodeCategory[] = [
  // ============ 基础：规则决策控制 ============
  {
    name: '规则决策控制', icon: '🎯', color: '#8b5cf6',
    nodes: [
      {
        type: 'start', label: '规则入口', icon: '▶', category: 'flow',
        desc: '规则评估起点，定义输入数据上下文',
        defaultData: () => ({}),
        paramSchema: []
      },
      {
        type: 'end', label: '规则出口', icon: '■', category: 'flow',
        desc: '规则执行结果出口，可多个表示不同决策结果',
        defaultData: () => ({ endType: 'success' }),
        paramSchema: [
          { name: 'endType', label: '结果类型', type: 'select', options: [
            { label: '通过', value: 'success' },
            { label: '拒绝', value: 'fail' },
            { label: '跳过', value: 'skip' },
          ], group: '基本配置' },
        ]
      },
      {
        type: 'exclusive-gateway', label: '条件路由(XOR)', icon: '✕', category: 'flow',
        desc: '互斥条件路由，根据条件评估结果选择唯一执行路径',
        defaultData: () => ({ name: '', branches: [] }),
        paramSchema: [
          { name: 'name', label: '路由名称', type: 'input', group: '基本配置' },
          { name: 'branches', label: '条件分支', type: 'table', group: '分支配置',
            columns: [
              { prop: 'label', label: '分支标签', type: 'input', width: '120px' },
              { prop: 'condition', label: '条件表达式', type: 'input', width: '200px' },
            ]
          },
        ]
      },
      {
        type: 'parallel-gateway', label: '并行规则(AND)', icon: '+', category: 'flow',
        desc: '同时执行多个独立规则，汇总所有规则结果',
        defaultData: () => ({ name: '' }),
        paramSchema: [
          { name: 'name', label: '规则组名称', type: 'input', group: '基本配置' },
        ]
      },
      {
        type: 'inclusive-gateway', label: '多条件路由(OR)', icon: 'O', category: 'flow',
        desc: '多条件路由，满足条件的路径都执行',
        defaultData: () => ({ name: '', branches: [] }),
        paramSchema: [
          { name: 'name', label: '路由名称', type: 'input', group: '基本配置' },
          { name: 'branches', label: '条件分支', type: 'table', group: '分支配置',
            columns: [
              { prop: 'label', label: '分支标签', type: 'input', width: '120px' },
              { prop: 'condition', label: '条件表达式', type: 'input', width: '200px' },
            ]
          },
        ]
      },
      {
        type: 'loop', label: '规则循环', icon: '🔄', category: 'flow',
        desc: '遍历集合数据，对每项执行相同规则',
        defaultData: () => ({ loopType: 'forEach', collectionVar: '', itemVar: 'item', indexVar: 'index' }),
        paramSchema: [
          { name: 'loopType', label: '循环类型', type: 'select', options: [
            { label: '遍历集合', value: 'forEach' },
            { label: '条件循环', value: 'while' },
            { label: '计数循环', value: 'count' },
          ], group: '基本配置' },
          { name: 'collectionVar', label: '集合变量', type: 'input', placeholder: '如: items', group: '基本配置' },
          { name: 'itemVar', label: '当前项变量', type: 'input', default: 'item', group: '基本配置' },
          { name: 'indexVar', label: '索引变量', type: 'input', default: 'index', group: '基本配置' },
        ]
      },
      {
        type: 'join', label: '规则聚合', icon: '⊕', category: 'flow',
        desc: '汇聚多个并行规则的执行结果，合并决策输出',
        defaultData: () => ({ joinType: 'AND', waitAll: 'Y' }),
        paramSchema: [
          { name: 'joinType', label: '聚合策略', type: 'select', options: [
            { label: '全部通过(AND)', value: 'AND' },
            { label: '任一通过(OR)', value: 'OR' },
            { label: '按数量(N)', value: 'COUNT' },
          ], group: '基本配置' },
          { name: 'waitAll', label: '等待所有规则', type: 'switch', default: 'Y', group: '基本配置' },
        ]
      },
    ]
  },

  // ============ 基础：业务逻辑 ============
  {
    name: '业务逻辑', icon: '⚙️', color: '#10b981',
    nodes: [
      {
        type: 'condition', label: '条件判断', icon: '❓', category: 'logic',
        desc: '支持嵌套 AND/OR 条件组',
        defaultData: () => ({ logic: 'AND', conditions: [] }),
        paramSchema: [
          { name: 'logic', label: '逻辑关系', type: 'select', options: [
            { label: '且(AND)', value: 'AND' },
            { label: '或(OR)', value: 'OR' },
          ], group: '基本配置' },
          { name: 'conditions', label: '条件列表', type: 'table', group: '条件配置',
            columns: [
              { prop: 'fieldName', label: '字段名', type: 'input', width: '120px' },
              { prop: 'operator', label: '操作符', type: 'select', width: '100px',
                options: [
                  { label: '等于', value: 'EQ' },
                  { label: '不等于', value: 'NEQ' },
                  { label: '大于', value: 'GT' },
                  { label: '小于', value: 'LT' },
                  { label: '包含', value: 'CONTAINS' },
                ]
              },
              { prop: 'value', label: '值', type: 'input', width: '120px' },
            ]
          },
        ]
      },
      {
        type: 'action', label: '动作执行', icon: '▶', category: 'logic',
        desc: '显示/隐藏/赋值/校验/调API/脚本',
        defaultData: () => ({ actions: [] }),
        paramSchema: [
          { name: 'actions', label: '动作列表', type: 'table', group: '动作配置',
            columns: [
              { prop: 'actionType', label: '动作类型', type: 'select', width: '120px',
                options: [
                  { label: '显示字段', value: 'SHOW_FIELD' },
                  { label: '隐藏字段', value: 'HIDE_FIELD' },
                  { label: '设置值', value: 'SET_VALUE' },
                  { label: '清空值', value: 'CLEAR_VALUE' },
                  { label: '设为必填', value: 'SET_REQUIRED' },
                  { label: '显示消息', value: 'SHOW_MESSAGE' },
                ]
              },
              { prop: 'targetField', label: '目标字段', type: 'input', width: '120px' },
              { prop: 'actionValue', label: '值', type: 'input', width: '120px' },
            ]
          },
        ]
      },
      {
        type: 'variable-assign', label: '变量赋值', icon: '=', category: 'logic',
        desc: '设置上下文变量',
        defaultData: () => ({ assignments: [] }),
        paramSchema: [
          { name: 'assignments', label: '赋值列表', type: 'table', group: '赋值配置',
            columns: [
              { prop: 'variableName', label: '变量名', type: 'input', width: '120px' },
              { prop: 'value', label: '值', type: 'input', width: '150px' },
              { prop: 'valueType', label: '值类型', type: 'select', width: '100px',
                options: [
                  { label: '常量', value: 'CONSTANT' },
                  { label: '变量', value: 'VARIABLE' },
                  { label: '表达式', value: 'EXPRESSION' },
                ]
              },
            ]
          },
        ]
      },
      {
        type: 'script', label: '脚本执行', icon: '📜', category: 'logic',
        desc: '执行自定义JS脚本',
        defaultData: () => ({ scriptContent: '', description: '' }),
        paramSchema: [
          { name: 'scriptContent', label: '脚本内容', type: 'textarea', rows: 8, placeholder: '// 可访问 context, formData, variables\ncontext.result = context.amount * 0.1;', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'http-call', label: 'HTTP调用', icon: '🌐', category: 'logic',
        desc: '调用外部接口',
        defaultData: () => ({ method: 'GET', url: '', headers: {}, body: '', responseVar: '', timeout: 5000, retryCount: 0 }),
        paramSchema: [
          { name: 'method', label: '请求方法', type: 'select', options: [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' },
            { label: 'PUT', value: 'PUT' },
            { label: 'DELETE', value: 'DELETE' },
          ], group: '基本配置' },
          { name: 'url', label: '接口地址', type: 'input', required: true, placeholder: 'https://api.example.com/data', group: '基本配置' },
          { name: 'body', label: '请求体', type: 'textarea', rows: 4, placeholder: 'JSON格式请求体', group: '基本配置' },
          { name: 'responseVar', label: '响应变量', type: 'input', placeholder: '存储响应的变量名', group: '基本配置' },
          { name: 'timeout', label: '超时(ms)', type: 'number', min: 1000, default: 5000, group: '高级配置' },
          { name: 'retryCount', label: '重试次数', type: 'number', min: 0, max: 5, default: 0, group: '高级配置' },
        ]
      },
      {
        type: 'rule-set-ref', label: '规则集引用', icon: '📚', category: 'logic',
        desc: '引用一组子规则',
        defaultData: () => ({ ruleSetCode: '', ruleSetName: '', inputMapping: {}, outputMapping: {} }),
        paramSchema: [
          { name: 'ruleSetCode', label: '规则集编码', type: 'input', required: true, placeholder: '如: ORDER_VALIDATION', group: '基本配置' },
          { name: 'ruleSetName', label: '规则集名称', type: 'input', placeholder: '可选描述', group: '基本配置' },
          { name: 'inputMapping', label: '入参映射', type: 'textarea', rows: 3, placeholder: 'JSON格式: {"子规则变量": "当前变量"}', group: '映射配置' },
          { name: 'outputMapping', label: '出参映射', type: 'textarea', rows: 3, placeholder: 'JSON格式: {"子规则结果": "当前变量"}', group: '映射配置' },
        ]
      },
      {
        type: 'decision-table', label: '决策表', icon: '📊', category: 'logic',
        desc: '多条件+多动作的表格化规则',
        defaultData: () => ({ tableName: '', conditions: [], actions: [], rules: [] }),
        paramSchema: [
          { name: 'tableName', label: '表名', type: 'input', required: true, placeholder: '如: 折扣决策表', group: '基本配置' },
          { name: 'conditions', label: '条件列', type: 'table', group: '条件配置',
            columns: [
              { prop: 'fieldName', label: '字段名', type: 'input', width: '120px' },
              { prop: 'fieldLabel', label: '字段标签', type: 'input', width: '120px' },
              { prop: 'operator', label: '操作符', type: 'select', width: '100px',
                options: [
                  { label: '等于', value: 'EQ' },
                  { label: '大于', value: 'GT' },
                  { label: '小于', value: 'LT' },
                  { label: '范围', value: 'BETWEEN' },
                ]
              },
            ]
          },
          { name: 'actions', label: '动作列', type: 'table', group: '动作配置',
            columns: [
              { prop: 'actionType', label: '动作类型', type: 'select', width: '120px',
                options: [
                  { label: '设置值', value: 'SET_VALUE' },
                  { label: '显示消息', value: 'SHOW_MESSAGE' },
                  { label: '跳转页面', value: 'REDIRECT' },
                ]
              },
              { prop: 'targetField', label: '目标字段', type: 'input', width: '120px' },
            ]
          },
          { name: 'rules', label: '规则行', type: 'table', group: '规则配置',
            columns: [
              { prop: 'priority', label: '优先级', type: 'input', width: '80px' },
              { prop: 'conditionValues', label: '条件值(JSON)', type: 'input', width: '200px' },
              { prop: 'actionValues', label: '动作值(JSON)', type: 'input', width: '200px' },
            ]
          },
        ]
      },
    ]
  },

  // ============ 一、数据入参&上下文 ============
  {
    name: '数据入参&上下文', icon: '📥', color: '#3b82f6',
    nodes: [
      {
        type: 'context-extract', label: '上下文变量提取', icon: '📎', category: 'data',
        desc: '从表单/流程/接口/历史快照抽取嵌套对象字段',
        defaultData: () => ({ source: 'form', fieldPath: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'source', label: '数据来源', type: 'select', required: true, options: SOURCE_OPTIONS, group: '基本配置' },
          { name: 'fieldPath', label: '字段路径', type: 'input', required: true, placeholder: '如: order.details[0].amount', group: '基本配置' },
          { name: 'targetVar', label: '目标变量', type: 'input', required: true, placeholder: '如: totalAmount', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, placeholder: '节点用途说明', group: '其他' },
        ]
      },
      {
        type: 'type-cast', label: '变量类型转换', icon: '🔄', category: 'data',
        desc: '日期/金额/编码/浮点精度统一转换',
        defaultData: () => ({ sourceVar: '', targetType: 'STRING', precision: 2, description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: '源变量', type: 'input', required: true, placeholder: '如: amount', group: '基本配置' },
          { name: 'targetType', label: '目标类型', type: 'select', required: true, options: TYPE_OPTIONS, group: '基本配置' },
          { name: 'precision', label: '精度位数', type: 'number', min: 0, max: 10, default: 2, group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'dataset-load', label: '批量数据集载入', icon: '📊', category: 'data',
        desc: '批量单据、明细列表一次性载入规则上下文',
        defaultData: () => ({ source: 'form', fieldPath: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'source', label: '数据来源', type: 'select', required: true, options: SOURCE_OPTIONS, group: '基本配置' },
          { name: 'fieldPath', label: '字段路径', type: 'input', required: true, placeholder: '如: order.details', group: '基本配置' },
          { name: 'targetVar', label: '目标变量', type: 'input', required: true, placeholder: '如: detailList', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'datasource-fetch', label: '外部数据源拉取', icon: '🔌', category: 'data',
        desc: '实时查询库存、客户等级、账期余额注入上下文',
        defaultData: () => ({ sourceType: 'API', apiUrl: '', method: 'GET', targetVar: '', cacheEnabled: 'Y', cacheTTL: 300, description: '' }),
        paramSchema: [
          { name: 'sourceType', label: '数据源类型', type: 'select', required: true, options: [{ label: 'REST API', value: 'API' }, { label: '数据库查询', value: 'DB' }, { label: 'Redis缓存', value: 'REDIS' }], group: '基本配置' },
          { name: 'method', label: '请求方法', type: 'select', options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }], group: '基本配置' },
          { name: 'apiUrl', label: '接口地址', type: 'input', required: true, placeholder: '/api/inventory/query', group: '基本配置' },
          { name: 'targetVar', label: '目标变量', type: 'input', required: true, placeholder: '如: stockData', group: '基本配置' },
          { name: 'cacheEnabled', label: '启用缓存', type: 'switch', default: 'Y', group: '缓存配置' },
          { name: 'cacheTTL', label: '缓存时长(秒)', type: 'number', min: 0, default: 300, group: '缓存配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 二、复合条件判断 ============
  {
    name: '复合条件判断', icon: '🔷', color: '#06b6d4',
    nodes: [
      {
        type: 'cond-multibranch', label: '多分支匹配', icon: '🌳', category: 'condition',
        desc: '枚举字典、区间分段匹配（阶梯定价、分级审批）',
        defaultData: () => ({ matchField: '', matchType: 'ENUM', branches: [], defaultBranch: '', description: '' }),
        paramSchema: [
          { name: 'matchField', label: '匹配字段', type: 'input', required: true, placeholder: '如: amount', group: '基本配置' },
          { name: 'matchType', label: '匹配类型', type: 'select', required: true, options: [{ label: '枚举匹配', value: 'ENUM' }, { label: '区间分段', value: 'RANGE' }], group: '基本配置' },
          { name: 'defaultBranch', label: '默认分支', type: 'input', placeholder: '未匹配时的分支标签', group: '基本配置' },
          { name: 'branches', label: '分支列表', type: 'table', group: '分支配置',
            columns: [
              { prop: 'label', label: '分支标签', type: 'input', width: '120px' },
              { prop: 'value', label: '匹配值/区间', type: 'input', width: '150px' },
              { prop: 'targetNode', label: '目标节点', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'cond-set-contains', label: '集合包含/交集', icon: '∩', category: 'condition',
        desc: '明细行商品集合、部门权限组校验',
        defaultData: () => ({ sourceSet: '', targetSet: '', checkType: 'CONTAINS_ANY', description: '' }),
        paramSchema: [
          { name: 'sourceSet', label: '源集合变量', type: 'input', required: true, placeholder: '如: userRoles', group: '基本配置' },
          { name: 'targetSet', label: '目标集合', type: 'input', required: true, placeholder: '如: requiredRoles', group: '基本配置' },
          { name: 'checkType', label: '检查类型', type: 'select', required: true, options: [
            { label: '包含任意 (交集非空)', value: 'CONTAINS_ANY' },
            { label: '包含全部 (子集)', value: 'CONTAINS_ALL' },
            { label: '完全相同', value: 'EQUALS' },
            { label: '无交集', value: 'NO_INTERSECT' },
          ], group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'cond-dirty-check', label: '空值/脏数据拦截', icon: '🚫', category: 'condition',
        desc: '空白、特殊字符、超限值直接终止规则',
        defaultData: () => ({ fields: [], checkRules: ['EMPTY', 'NULL'], blockOnFail: 'Y', description: '' }),
        paramSchema: [
          { name: 'fields', label: '检查字段', type: 'input', required: true, placeholder: '多个字段逗号分隔: name,idCard', group: '基本配置' },
          { name: 'checkRules', label: '检查规则', type: 'multiselect', required: true, options: [
            { label: '空值', value: 'EMPTY' },
            { label: 'NULL', value: 'NULL' },
            { label: '特殊字符', value: 'SPECIAL_CHAR' },
            { label: '超长', value: 'TOO_LONG' },
            { label: '负数', value: 'NEGATIVE' },
          ], group: '基本配置' },
          { name: 'blockOnFail', label: '失败时阻断', type: 'switch', default: 'Y', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'cond-time-window', label: '周期时间判断', icon: '📅', category: 'condition',
        desc: '工作日、账期、生效失效时间窗口校验',
        defaultData: () => ({ dateField: '', windowType: 'WORKDAY', startDate: '', endDate: '', description: '' }),
        paramSchema: [
          { name: 'dateField', label: '日期字段', type: 'input', required: true, placeholder: '如: orderDate', group: '基本配置' },
          { name: 'windowType', label: '时间窗口', type: 'select', required: true, options: [
            { label: '工作日', value: 'WORKDAY' },
            { label: '自然日', value: 'NATURAL' },
            { label: '账期', value: 'BILLING' },
            { label: '时间区间', value: 'RANGE' },
          ], group: '基本配置' },
          { name: 'startDate', label: '开始日期', type: 'date', placeholder: '生效日期', group: '基本配置' },
          { name: 'endDate', label: '结束日期', type: 'date', placeholder: '失效日期', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'cond-unique', label: '组合唯一校验', icon: '🔍', category: 'condition',
        desc: '多字段联合重复拦截（订单号+客户组合）',
        defaultData: () => ({ fields: [], scope: 'CURRENT_FORM', description: '' }),
        paramSchema: [
          { name: 'fields', label: '校验字段', type: 'input', required: true, placeholder: '逗号分隔: orderNo,customerCode', group: '基本配置' },
          { name: 'scope', label: '校验范围', type: 'select', required: true, options: [
            { label: '当前表单内', value: 'CURRENT_FORM' },
            { label: '跨表单', value: 'CROSS_FORM' },
            { label: '数据库查重', value: 'DATABASE' },
          ], group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'cond-threshold', label: '阈值超限预警', icon: '⚠️', category: 'condition',
        desc: '金额、数量、比例超出区间分等级拦截',
        defaultData: () => ({ field: '', thresholds: [], alertLevel: 'WARN', description: '' }),
        paramSchema: [
          { name: 'field', label: '检查字段', type: 'input', required: true, placeholder: '如: amount', group: '基本配置' },
          { name: 'alertLevel', label: '告警等级', type: 'select', required: true, options: ALERT_LEVEL_OPTIONS, group: '基本配置' },
          { name: 'thresholds', label: '阈值区间', type: 'table', group: '阈值配置',
            columns: [
              { prop: 'min', label: '最小值', type: 'input', width: '100px' },
              { prop: 'max', label: '最大值', type: 'input', width: '100px' },
              { prop: 'label', label: '区间标签', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 三、循环迭代 ============
  {
    name: '循环迭代', icon: '🔁', color: '#f59e0b',
    nodes: [
      {
        type: 'loop-iterate', label: '数据集逐行循环', icon: '📋', category: 'loop',
        desc: '遍历单据明细逐条执行规则',
        defaultData: () => ({ collectionVar: '', itemVar: 'item', indexVar: 'index', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: '集合变量', type: 'input', required: true, placeholder: '如: order.details', group: '基本配置' },
          { name: 'itemVar', label: '项变量名', type: 'input', default: 'item', group: '基本配置' },
          { name: 'indexVar', label: '索引变量名', type: 'input', default: 'index', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'loop-aggregate', label: '聚合统计循环', icon: 'Σ', category: 'loop',
        desc: '明细求和、最大最小值、平均、计数',
        defaultData: () => ({ collectionVar: '', aggField: '', aggType: 'SUM', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: '集合变量', type: 'input', required: true, placeholder: '如: order.details', group: '基本配置' },
          { name: 'aggType', label: '聚合方式', type: 'select', required: true, options: [
            { label: '求和 (SUM)', value: 'SUM' },
            { label: '最大值 (MAX)', value: 'MAX' },
            { label: '最小值 (MIN)', value: 'MIN' },
            { label: '平均值 (AVG)', value: 'AVG' },
            { label: '计数 (COUNT)', value: 'COUNT' },
          ], group: '基本配置' },
          { name: 'aggField', label: '聚合字段', type: 'input', required: true, placeholder: '如: amount', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: totalAmount', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'loop-filter', label: '条件过滤循环', icon: '⚡', category: 'loop',
        desc: '只对满足条件的明细行执行运算',
        defaultData: () => ({ collectionVar: '', filterCondition: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'collectionVar', label: '源集合变量', type: 'input', required: true, placeholder: '如: order.details', group: '基本配置' },
          { name: 'filterCondition', label: '过滤条件', type: 'textarea', rows: 2, required: true, placeholder: '如: item.status == "ACTIVE"', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: filteredDetails', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'loop-break', label: '循环中断/跳出', icon: '⏹️', category: 'loop',
        desc: '匹配目标数据终止遍历，提升引擎性能',
        defaultData: () => ({ breakCondition: '', description: '' }),
        paramSchema: [
          { name: 'breakCondition', label: '中断条件', type: 'textarea', rows: 2, required: true, placeholder: '如: item.id == targetId', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 四、运算&公式 ============
  {
    name: '运算&公式', icon: '🧮', color: '#8b5cf6',
    nodes: [
      {
        type: 'calc-money', label: '高精度金额运算', icon: '¥', category: 'calc',
        desc: '四舍五入、进位、抹零、税率自动计算',
        defaultData: () => ({ operands: '', operator: 'ADD', precision: 2, roundMode: 'HALF_UP', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operands', label: '操作数', type: 'input', required: true, placeholder: '逗号分隔: amount,tax,fee', group: '基本配置' },
          { name: 'operator', label: '运算符', type: 'select', required: true, options: [
            { label: '加法 (ADD)', value: 'ADD' },
            { label: '减法 (SUB)', value: 'SUB' },
            { label: '乘法 (MUL)', value: 'MUL' },
            { label: '除法 (DIV)', value: 'DIV' },
          ], group: '基本配置' },
          { name: 'precision', label: '精度位数', type: 'number', min: 0, max: 10, default: 2, group: '精度配置' },
          { name: 'roundMode', label: '舍入模式', type: 'select', required: true, options: ROUND_MODE_OPTIONS, group: '精度配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: totalAmount', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'calc-date', label: '日期偏移运算', icon: '📆', category: 'calc',
        desc: '账期推算、到期日、缓冲天数自动生成',
        defaultData: () => ({ baseDate: '', offset: 0, offsetUnit: 'DAY', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'baseDate', label: '基准日期', type: 'input', required: true, placeholder: '如: orderDate 或 now', group: '基本配置' },
          { name: 'offset', label: '偏移量', type: 'number', required: true, default: 0, group: '基本配置' },
          { name: 'offsetUnit', label: '偏移单位', type: 'select', required: true, options: [
            { label: '天', value: 'DAY' },
            { label: '小时', value: 'HOUR' },
            { label: '分钟', value: 'MINUTE' },
            { label: '月', value: 'MONTH' },
            { label: '年', value: 'YEAR' },
          ], group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: dueDate', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'calc-string', label: '字符串处理', icon: '📝', category: 'calc',
        desc: '编码拼接、截取、掩码脱敏、大小写统一',
        defaultData: () => ({ operation: 'CONCAT', operands: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operation', label: '操作类型', type: 'select', required: true, options: [
            { label: '拼接 (CONCAT)', value: 'CONCAT' },
            { label: '截取 (SUBSTRING)', value: 'SUBSTRING' },
            { label: '掩码脱敏 (MASK)', value: 'MASK' },
            { label: '转大写 (UPPER)', value: 'UPPER' },
            { label: '转小写 (LOWER)', value: 'LOWER' },
            { label: '去空格 (TRIM)', value: 'TRIM' },
          ], group: '基本配置' },
          { name: 'operands', label: '操作数', type: 'input', required: true, placeholder: '逗号分隔变量名', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: fullName', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'calc-dict-map', label: '字典映射转换', icon: '📖', category: 'calc',
        desc: '编码转中文、外部系统编码适配映射',
        defaultData: () => ({ sourceVar: '', dictCode: '', defaultValue: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: '源变量', type: 'input', required: true, placeholder: '如: statusCode', group: '基本配置' },
          { name: 'dictCode', label: '字典编码', type: 'input', required: true, placeholder: '如: order_status', group: '基本配置' },
          { name: 'defaultValue', label: '默认值', type: 'input', placeholder: '未匹配时返回的默认值', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: statusName', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'calc-ratio', label: '比例分摊运算', icon: '%', category: 'calc',
        desc: '费用分摊、折扣分摊、税额拆分',
        defaultData: () => ({ totalAmount: '', ratioSource: '', ratioField: '', roundMode: 'HALF_UP', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'totalAmount', label: '总金额变量', type: 'input', required: true, placeholder: '如: totalFee', group: '基本配置' },
          { name: 'ratioSource', label: '比例来源集合', type: 'input', required: true, placeholder: '如: details', group: '基本配置' },
          { name: 'ratioField', label: '比例字段', type: 'input', required: true, placeholder: '如: weight', group: '基本配置' },
          { name: 'roundMode', label: '舍入模式', type: 'select', required: true, options: ROUND_MODE_OPTIONS, group: '精度配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: allocatedAmount', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 五、分支事务动作 ============
  {
    name: '分支事务动作', icon: '⚡', color: '#22c55e',
    nodes: [
      {
        type: 'action-assign', label: '字段赋值', icon: '✏️', category: 'action',
        desc: '主表/明细行批量回填计算结果',
        defaultData: () => ({ assignments: [], description: '' }),
        paramSchema: [
          { name: 'assignments', label: '赋值列表', type: 'table', required: true, group: '赋值配置',
            columns: [
              { prop: 'targetField', label: '目标字段', type: 'input', width: '120px' },
              { prop: 'valueType', label: '值类型', type: 'select', options: [{ label: '常量', value: 'CONSTANT' }, { label: '变量', value: 'VARIABLE' }], width: '100px' },
              { prop: 'value', label: '值', type: 'input', width: '120px' },
            ]
          },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'action-mark', label: '数据标记', icon: '🏷️', category: 'action',
        desc: '单据标记作废、锁定、特殊管控标签',
        defaultData: () => ({ targetField: '', markType: 'VOID', markValue: '', description: '' }),
        paramSchema: [
          { name: 'targetField', label: '目标字段', type: 'input', required: true, placeholder: '如: documentStatus', group: '基本配置' },
          { name: 'markType', label: '标记类型', type: 'select', required: true, options: [
            { label: '作废', value: 'VOID' },
            { label: '锁定', value: 'LOCK' },
            { label: '解锁', value: 'UNLOCK' },
            { label: '特殊管控', value: 'SPECIAL' },
            { label: '加急', value: 'URGENT' },
          ], group: '基本配置' },
          { name: 'markValue', label: '标记值', type: 'input', placeholder: '标记的具体值', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'action-filter-output', label: '数据过滤输出', icon: '🔽', category: 'action',
        desc: '过滤不满足条件明细，生成新数据集',
        defaultData: () => ({ sourceVar: '', filterCondition: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'sourceVar', label: '源集合变量', type: 'input', required: true, placeholder: '如: details', group: '基本配置' },
          { name: 'filterCondition', label: '过滤条件', type: 'textarea', rows: 2, required: true, placeholder: '如: item.amount > 100', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: validDetails', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'action-split-merge', label: '拆分合并', icon: '🔀', category: 'action',
        desc: '明细按规格拆分、相同物料行合并汇总',
        defaultData: () => ({ operation: 'MERGE', sourceVar: '', groupFields: '', aggFields: '', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'operation', label: '操作类型', type: 'select', required: true, options: [
            { label: '合并 (MERGE)', value: 'MERGE' },
            { label: '拆分 (SPLIT)', value: 'SPLIT' },
          ], group: '基本配置' },
          { name: 'sourceVar', label: '源集合变量', type: 'input', required: true, placeholder: '如: details', group: '基本配置' },
          { name: 'groupFields', label: '分组字段', type: 'input', placeholder: '合并: 逗号分隔如 materialNo,spec', group: '基本配置' },
          { name: 'aggFields', label: '聚合字段', type: 'input', placeholder: '逗号分隔如 quantity,amount', group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: mergedDetails', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 六、消息与通知 ============
  {
    name: '消息与通知', icon: '📢', color: '#eab308',
    nodes: [
      {
        type: 'msg-push-todo', label: '内部流程推送', icon: '📨', category: 'message',
        desc: '触发待办、加签、转办规则',
        defaultData: () => ({ pushType: 'TODO', targetUsers: '', title: '', content: '', description: '' }),
        paramSchema: [
          { name: 'pushType', label: '推送类型', type: 'select', required: true, options: [
            { label: '待办', value: 'TODO' },
            { label: '加签', value: 'COUNTERSIGN' },
            { label: '转办', value: 'TRANSFER' },
            { label: '催办', value: 'REMIND' },
          ], group: '基本配置' },
          { name: 'targetUsers', label: '目标用户', type: 'input', placeholder: '用户ID逗号分隔，或变量名', group: '基本配置' },
          { name: 'title', label: '标题', type: 'input', required: true, placeholder: '推送标题', group: '基本配置' },
          { name: 'content', label: '内容', type: 'textarea', rows: 3, required: true, placeholder: '推送内容', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'msg-alert', label: '告警消息', icon: '🚨', category: 'message',
        desc: '短信、站内信、钉钉/企业微信预警推送',
        defaultData: () => ({ channels: [], alertLevel: 'WARN', title: '', content: '', recipients: '', description: '' }),
        paramSchema: [
          { name: 'channels', label: '通知渠道', type: 'multiselect', required: true, options: [
            { label: '站内信', value: 'IN_APP' },
            { label: '短信', value: 'SMS' },
            { label: '钉钉', value: 'DINGTALK' },
            { label: '企业微信', value: 'WECOM' },
            { label: '邮件', value: 'EMAIL' },
          ], group: '基本配置' },
          { name: 'alertLevel', label: '告警等级', type: 'select', required: true, options: ALERT_LEVEL_OPTIONS, group: '基本配置' },
          { name: 'title', label: '标题', type: 'input', required: true, group: '基本配置' },
          { name: 'content', label: '内容', type: 'textarea', rows: 3, required: true, group: '基本配置' },
          { name: 'recipients', label: '接收人', type: 'input', placeholder: '用户ID/手机号逗号分隔', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'msg-log', label: '日志写入', icon: '📜', category: 'message',
        desc: '规则执行明细、违规记录落地审计库',
        defaultData: () => ({ logType: 'AUDIT', logContent: '', fields: '', description: '' }),
        paramSchema: [
          { name: 'logType', label: '日志类型', type: 'select', required: true, options: [
            { label: '审计日志', value: 'AUDIT' },
            { label: '操作日志', value: 'OPERATION' },
            { label: '违规记录', value: 'VIOLATION' },
            { label: '执行明细', value: 'EXECUTION' },
          ], group: '基本配置' },
          { name: 'logContent', label: '日志内容', type: 'textarea', rows: 3, required: true, placeholder: '记录的内容', group: '基本配置' },
          { name: 'fields', label: '记录字段', type: 'input', placeholder: '逗号分隔字段名', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 七、外部集成调用 ============
  {
    name: '外部集成调用', icon: '🌐', color: '#ec4899',
    nodes: [
      {
        type: 'ext-http-call', label: 'HTTP接口调用', icon: '🔗', category: 'external',
        desc: '第三方风控、征信、物流接口',
        defaultData: () => ({ method: 'GET', url: '', timeout: 5000, retryCount: 0, responseVar: '', description: '' }),
        paramSchema: [
          { name: 'method', label: '请求方法', type: 'select', required: true, options: [{ label: 'GET', value: 'GET' }, { label: 'POST', value: 'POST' }, { label: 'PUT', value: 'PUT' }, { label: 'DELETE', value: 'DELETE' }], group: '基本配置' },
          { name: 'url', label: '接口地址', type: 'input', required: true, placeholder: '/api/risk/check', group: '基本配置' },
          { name: 'timeout', label: '超时(ms)', type: 'number', min: 1000, step: 1000, default: 5000, group: '基本配置' },
          { name: 'retryCount', label: '重试次数', type: 'number', min: 0, max: 5, default: 0, group: '基本配置' },
          { name: 'responseVar', label: '响应变量', type: 'input', required: true, placeholder: '如: riskResult', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ext-sp-call', label: '存储过程调用', icon: '🗄️', category: 'external',
        desc: '数据库复杂统计、历史台账查询',
        defaultData: () => ({ spName: '', params: '', resultVar: '', description: '' }),
        paramSchema: [
          { name: 'spName', label: '存储过程名', type: 'input', required: true, placeholder: 'SP_QUERY_HISTORY', group: '基本配置' },
          { name: 'params', label: '参数列表', type: 'textarea', rows: 2, placeholder: '逗号分隔参数值或变量名', group: '基本配置' },
          { name: 'resultVar', label: '结果变量', type: 'input', required: true, placeholder: '如: historyData', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ext-mq-send', label: 'MQ消息发送', icon: '📤', category: 'external',
        desc: '规则触发推送数据至下游MES/ERP',
        defaultData: () => ({ queueName: '', message: '', exchange: '', routingKey: '', description: '' }),
        paramSchema: [
          { name: 'queueName', label: '队列名称', type: 'input', required: true, placeholder: '如: order.created', group: '基本配置' },
          { name: 'exchange', label: '交换机', type: 'input', placeholder: '如: amq.direct', group: '基本配置' },
          { name: 'routingKey', label: '路由键', type: 'input', placeholder: '如: order.created', group: '基本配置' },
          { name: 'message', label: '消息内容', type: 'textarea', rows: 3, required: true, placeholder: 'JSON格式消息体', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ext-file-export', label: '文件导出', icon: '📄', category: 'external',
        desc: '规则校验后自动生成校验报表Excel',
        defaultData: () => ({ exportType: 'EXCEL', template: '', fields: '', fileName: '', description: '' }),
        paramSchema: [
          { name: 'exportType', label: '导出格式', type: 'select', required: true, options: [{ label: 'Excel', value: 'EXCEL' }, { label: 'CSV', value: 'CSV' }, { label: 'PDF', value: 'PDF' }], group: '基本配置' },
          { name: 'template', label: '模板名称', type: 'input', placeholder: '如: check_report_template', group: '基本配置' },
          { name: 'fields', label: '导出字段', type: 'input', placeholder: '逗号分隔字段名', group: '基本配置' },
          { name: 'fileName', label: '文件名', type: 'input', placeholder: '如: 校验报表_{date}', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 八、异常与流程控制 ============
  {
    name: '异常与流程控制', icon: '🛡️', color: '#ef4444',
    nodes: [
      {
        type: 'ctrl-degrade', label: '规则降级', icon: '🔽', category: 'control',
        desc: '接口超时自动走本地缓存兜底规则',
        defaultData: () => ({ degradeCondition: 'TIMEOUT', threshold: 3000, fallbackAction: '', description: '' }),
        paramSchema: [
          { name: 'degradeCondition', label: '降级条件', type: 'select', required: true, options: [
            { label: '超时', value: 'TIMEOUT' },
            { label: '异常', value: 'EXCEPTION' },
            { label: '不可用', value: 'UNAVAILABLE' },
            { label: '限流', value: 'RATE_LIMIT' },
          ], group: '基本配置' },
          { name: 'threshold', label: '阈值(ms)', type: 'number', min: 100, step: 100, default: 3000, group: '基本配置' },
          { name: 'fallbackAction', label: '兜底动作', type: 'textarea', rows: 2, placeholder: '降级后执行的动作描述', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ctrl-rollback', label: '事务回滚', icon: '↩️', category: 'control',
        desc: '校验失败清空本次表单临时计算数据',
        defaultData: () => ({ rollbackFields: '', rollbackScope: 'ALL', description: '' }),
        paramSchema: [
          { name: 'rollbackScope', label: '回滚范围', type: 'select', required: true, options: [
            { label: '全部临时数据', value: 'ALL' },
            { label: '指定字段', value: 'FIELDS' },
            { label: '当前事务', value: 'TRANSACTION' },
          ], group: '基本配置' },
          { name: 'rollbackFields', label: '回滚字段', type: 'input', placeholder: '范围=指定字段时填写，逗号分隔', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ctrl-catch', label: '多级异常捕获', icon: '🪤', category: 'control',
        desc: '区分参数错误、业务违规、外部接口故障',
        defaultData: () => ({ catchTypes: [], handlerAction: '', description: '' }),
        paramSchema: [
          { name: 'catchTypes', label: '捕获类型', type: 'multiselect', required: true, options: [
            { label: '参数错误', value: 'PARAM_ERROR' },
            { label: '业务违规', value: 'BIZ_VIOLATION' },
            { label: '外部接口故障', value: 'API_FAILURE' },
            { label: '数据库异常', value: 'DB_ERROR' },
            { label: '超时', value: 'TIMEOUT' },
          ], group: '基本配置' },
          { name: 'handlerAction', label: '处理动作', type: 'textarea', rows: 2, placeholder: '异常处理描述', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ctrl-terminate', label: '规则终止', icon: '⛔', category: 'control',
        desc: '校验不通过直接阻断单据保存/提交',
        defaultData: () => ({ terminateLevel: 'BLOCK', message: '', description: '' }),
        paramSchema: [
          { name: 'terminateLevel', label: '终止级别', type: 'select', required: true, options: [
            { label: '阻断 (BLOCK)', value: 'BLOCK' },
            { label: '警告 (WARN)', value: 'WARN' },
            { label: '提示 (INFO)', value: 'INFO' },
          ], group: '基本配置' },
          { name: 'message', label: '终止消息', type: 'textarea', rows: 2, required: true, placeholder: '给用户的提示消息', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'ctrl-delay', label: '延时执行', icon: '⏰', category: 'control',
        desc: '定时校验、滞后对账规则',
        defaultData: () => ({ delayType: 'INTERVAL', delayValue: 0, delayUnit: 'MINUTE', description: '' }),
        paramSchema: [
          { name: 'delayType', label: '延时类型', type: 'select', required: true, options: [
            { label: '固定间隔', value: 'INTERVAL' },
            { label: '定时执行', value: 'CRON' },
            { label: '条件触发', value: 'CONDITION' },
          ], group: '基本配置' },
          { name: 'delayValue', label: '延时值', type: 'number', min: 0, default: 0, group: '基本配置' },
          { name: 'delayUnit', label: '延时单位', type: 'select', required: true, options: [
            { label: '秒', value: 'SECOND' },
            { label: '分钟', value: 'MINUTE' },
            { label: '小时', value: 'HOUR' },
            { label: '天', value: 'DAY' },
          ], group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 九、权限&审计 ============
  {
    name: '权限&审计', icon: '🔐', color: '#64748b',
    nodes: [
      {
        type: 'sec-desensitize', label: '敏感数据脱敏', icon: '🙈', category: 'security',
        desc: '规则输出自动隐藏身份证、手机号',
        defaultData: () => ({ fields: '', desensitizeType: 'PHONE', description: '' }),
        paramSchema: [
          { name: 'fields', label: '脱敏字段', type: 'input', required: true, placeholder: '逗号分隔字段名', group: '基本配置' },
          { name: 'desensitizeType', label: '脱敏类型', type: 'select', required: true, options: [
            { label: '手机号', value: 'PHONE' },
            { label: '身份证', value: 'ID_CARD' },
            { label: '银行卡', value: 'BANK_CARD' },
            { label: '邮箱', value: 'EMAIL' },
            { label: '姓名', value: 'NAME' },
            { label: '地址', value: 'ADDRESS' },
            { label: '自定义', value: 'CUSTOM' },
          ], group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'sec-audit-trail', label: '操作留痕', icon: '✍️', category: 'security',
        desc: '记录规则触发人、前后字段值、执行时间',
        defaultData: () => ({ auditType: 'FIELD_CHANGE', fields: '', recordOperator: 'Y', description: '' }),
        paramSchema: [
          { name: 'auditType', label: '审计类型', type: 'select', required: true, options: [
            { label: '字段变更', value: 'FIELD_CHANGE' },
            { label: '规则执行', value: 'RULE_EXEC' },
            { label: '数据访问', value: 'DATA_ACCESS' },
            { label: '状态变更', value: 'STATUS_CHANGE' },
          ], group: '基本配置' },
          { name: 'fields', label: '审计字段', type: 'input', required: true, placeholder: '逗号分隔字段名', group: '基本配置' },
          { name: 'recordOperator', label: '记录操作人', type: 'switch', default: 'Y', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'sec-row-filter', label: '数据行权限过滤', icon: '👤', category: 'security',
        desc: '根据登录人部门自动过滤数据集',
        defaultData: () => ({ dataSource: '', filterBy: 'DEPARTMENT', targetVar: '', description: '' }),
        paramSchema: [
          { name: 'dataSource', label: '数据源变量', type: 'input', required: true, placeholder: '如: dataList', group: '基本配置' },
          { name: 'filterBy', label: '过滤维度', type: 'select', required: true, options: [
            { label: '部门', value: 'DEPARTMENT' },
            { label: '角色', value: 'ROLE' },
            { label: '用户', value: 'USER' },
            { label: '组织', value: 'ORG' },
          ], group: '基本配置' },
          { name: 'targetVar', label: '结果变量', type: 'input', required: true, placeholder: '如: filteredData', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
    ]
  },
  // ============ 十、子规则封装 ============
  {
    name: '子规则封装', icon: '📦', color: '#6366f1',
    nodes: [
      {
        type: 'subrule-call', label: '子规则调用', icon: '📞', category: 'subrule',
        desc: '复用通用规则（库存校验、金额校验）',
        defaultData: () => ({ subRuleCode: '', subRuleName: '', inputMapping: '', outputMapping: '', description: '' }),
        paramSchema: [
          { name: 'subRuleCode', label: '子规则编码', type: 'input', required: true, placeholder: '如: STOCK_CHECK', group: '基本配置' },
          { name: 'subRuleName', label: '子规则名称', type: 'input', placeholder: '如: 库存校验规则', group: '基本配置' },
          { name: 'inputMapping', label: '入参映射', type: 'textarea', rows: 2, placeholder: 'JSON: {"stockVar":"formData.stock"}', group: '参数映射' },
          { name: 'outputMapping', label: '出参映射', type: 'textarea', rows: 2, placeholder: 'JSON: {"result":"checkResult"}', group: '参数映射' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'subrule-version', label: '规则版本切换', icon: '🔄', category: 'subrule',
        desc: '测试/正式两套规则一键切换',
        defaultData: () => ({ ruleCode: '', versionType: 'AUTO', specifiedVersion: '', description: '' }),
        paramSchema: [
          { name: 'ruleCode', label: '规则编码', type: 'input', required: true, placeholder: '如: AMOUNT_CHECK', group: '基本配置' },
          { name: 'versionType', label: '版本类型', type: 'select', required: true, options: [
            { label: '自动 (最新)', value: 'AUTO' },
            { label: '测试版', value: 'TEST' },
            { label: '正式版', value: 'PROD' },
            { label: '指定版本', value: 'SPECIFIED' },
          ], group: '基本配置' },
          { name: 'specifiedVersion', label: '指定版本号', type: 'input', placeholder: '版本类型=指定版本时填写', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
        ]
      },
      {
        type: 'subrule-gray', label: '规则灰度', icon: '🌗', category: 'subrule',
        desc: '按客户/单据类型分流新旧两套规则',
        defaultData: () => ({ ruleCode: '', grayStrategy: 'BY_PERCENT', grayPercent: 10, grayField: '', description: '' }),
        paramSchema: [
          { name: 'ruleCode', label: '规则编码', type: 'input', required: true, placeholder: '如: ORDER_CHECK', group: '基本配置' },
          { name: 'grayStrategy', label: '灰度策略', type: 'select', required: true, options: [
            { label: '按百分比', value: 'BY_PERCENT' },
            { label: '按客户', value: 'BY_CUSTOMER' },
            { label: '按单据类型', value: 'BY_DOC_TYPE' },
            { label: '按租户', value: 'BY_TENANT' },
          ], group: '基本配置' },
          { name: 'grayPercent', label: '灰度比例(%)', type: 'number', min: 0, max: 100, default: 10, group: '基本配置' },
          { name: 'grayField', label: '灰度字段', type: 'input', placeholder: '策略=按客户/单据类型时填写', group: '基本配置' },
          { name: 'description', label: '节点说明', type: 'textarea', rows: 2, group: '其他' },
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
