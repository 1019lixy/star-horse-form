/**
 * 规则引擎Demo数据
 * 从RuleDesigner.vue中提取，独立维护
 */
import type { Node, Edge } from '@vue-flow/core'

export interface DemoData {
  ruleCode: string
  ruleName: string
  ruleDesc: string
  nodes: Node[]
  edges: Edge[]
}

// Demo 1: 商品定价决策（多条件路由+动作执行）
export const demo1_ProductPricing: DemoData = {
  ruleCode: 'RULE_PRICING',
  ruleName: 'Demo1: 商品定价决策',
  ruleDesc: '根据商品类目、库存、季节计算最终售价',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 130 }, data: { conditions: [{ fieldName: 'category', fieldType: 'STRING', operator: 'EQ', value: 'electronics' }, { fieldName: 'stock', fieldType: 'NUMBER', operator: 'LT', value: '50' }], logic: 'AND' } },
    { id: 'gw_1', type: 'exclusive-gateway', position: { x: 380, y: 280 }, data: { name: '价格策略路由', gatewayType: 'XOR', branches: [{ id: 'b1', label: '稀缺电子产品', condition: 'category == "electronics" && stock < 50' }, { id: 'b2', label: '普通商品', condition: 'default' }] } },
    { id: 'var_1', type: 'variable-assign', position: { x: 100, y: 420 }, data: { assignments: [{ variableName: 'priceMultiplier', valueType: 'CONSTANT', value: '1.2' }, { variableName: 'discount', valueType: 'CONSTANT', value: '0' }] } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 560 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalPrice', actionValue: 'basePrice * priceMultiplier', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '稀缺商品溢价20%', messageType: 'WARNING' }] } },
    { id: 'var_2', type: 'variable-assign', position: { x: 620, y: 420 }, data: { assignments: [{ variableName: 'priceMultiplier', valueType: 'CONSTANT', value: '1.0' }, { variableName: 'discount', valueType: 'CONSTANT', value: '0.1' }] } },
    { id: 'action_2', type: 'action', position: { x: 620, y: 560 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalPrice', actionValue: 'basePrice * (1 - discount)', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '普通商品9折优惠', messageType: 'SUCCESS' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 700 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e_s_c', source: 'start_1', target: 'cond_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e_c_g', source: 'cond_1', target: 'gw_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_g_v1', source: 'gw_1', target: 'var_1', animated: false, label: '稀缺电子产品', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_g_v2', source: 'gw_1', target: 'var_2', animated: false, label: '普通商品', style: { stroke: '#22c55e', strokeWidth: 2 }, labelStyle: { fill: '#22c55e', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_v1_a1', source: 'var_1', target: 'action_1', animated: false, label: '设置 priceMultiplier, discount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_v2_a2', source: 'var_2', target: 'action_2', animated: false, label: '设置 priceMultiplier, discount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_a1_e', source: 'action_1', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e_a2_e', source: 'action_2', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 2: 风控评分卡（多条件嵌套+阈值判定）
export const demo2_RiskScoring: DemoData = {
  ruleCode: 'RULE_RISK_SCORE',
  ruleName: 'Demo2: 风控评分卡',
  ruleDesc: '多条件嵌套评估用户风险等级',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'riskScore', valueType: 'CONSTANT', value: '0' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'age', fieldType: 'NUMBER', operator: 'LT', value: '25' }, { fieldName: 'income', fieldType: 'NUMBER', operator: 'LT', value: '5000' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskScore', actionValue: 'riskScore + 30', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '年轻低收入群体风险+30', messageType: 'WARNING' }] } },
    { id: 'cond_2', type: 'condition', position: { x: 560, y: 400 }, data: { conditions: [{ fieldName: 'creditHistory', fieldType: 'STRING', operator: 'EQ', value: 'bad' }, { fieldName: 'debtRatio', fieldType: 'NUMBER', operator: 'GT', value: '0.5' }], logic: 'AND' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskScore', actionValue: 'riskScore + 50', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '信用不良且负债率高风险+50', messageType: 'ERROR' }] } },
    { id: 'cond_3', type: 'condition', position: { x: 330, y: 680 }, data: { conditions: [{ fieldName: 'riskScore', fieldType: 'NUMBER', operator: 'GTE', value: '80' }], logic: 'AND' } },
    { id: 'action_3', type: 'action', position: { x: 100, y: 820 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskLevel', actionValue: 'HIGH', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '高风险用户，拒绝交易', messageType: 'ERROR' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 960 }, data: { endType: 'fail' } },
    { id: 'action_4', type: 'action', position: { x: 560, y: 820 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'riskLevel', actionValue: 'LOW', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '低风险用户，允许交易', messageType: 'SUCCESS' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 960 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: false, label: '设置 riskScore', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'action_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'cond_2', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'action_1', target: 'cond_3', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_2', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'cond_3', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'cond_3', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'cond_3', target: 'action_3', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e10', source: 'cond_3', target: 'action_4', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e11', source: 'action_3', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e12', source: 'action_4', target: 'end_2', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 3: 会员等级判定（决策表+变量赋值）
export const demo3_MemberLevel: DemoData = {
  ruleCode: 'RULE_MEMBER_LEVEL',
  ruleName: 'Demo3: 会员等级判定',
  ruleDesc: '根据消费金额和频次判定会员等级，计算权益',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'totalSpend', valueType: 'VARIABLE', value: 'annualSpend' }, { variableName: 'orderCount', valueType: 'VARIABLE', value: 'annualOrders' }] } },
    { id: 'gw_1', type: 'exclusive-gateway', position: { x: 380, y: 270 }, data: { name: '会员等级路由', gatewayType: 'XOR', branches: [{ id: 'b1', label: '钻石会员', condition: 'totalSpend >= 50000 && orderCount >= 100' }, { id: 'b2', label: '金卡会员', condition: 'totalSpend >= 20000' }, { id: 'b3', label: '银卡会员', condition: 'totalSpend >= 5000' }, { id: 'b4', label: '普通会员', condition: 'default' }] } },
    { id: 'action_1', type: 'action', position: { x: 20, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'DIAMOND', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.7', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'freeShipping', actionValue: 'true', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '钻石会员：7折+免运费', messageType: 'SUCCESS' }] } },
    { id: 'action_2', type: 'action', position: { x: 260, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'GOLD', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.85', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '金卡会员：8.5折', messageType: 'SUCCESS' }] } },
    { id: 'action_3', type: 'action', position: { x: 500, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'SILVER', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '0.95', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '银卡会员：9.5折', messageType: 'INFO' }] } },
    { id: 'action_4', type: 'action', position: { x: 740, y: 420 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'memberLevel', actionValue: 'NORMAL', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'discountRate', actionValue: '1.0', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '普通会员：无折扣', messageType: 'INFO' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 580 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'gw_1', animated: false, label: '设置 totalSpend, orderCount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'gw_1', target: 'action_1', animated: false, label: '钻石会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'gw_1', target: 'action_2', animated: false, label: '金卡会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'gw_1', target: 'action_3', animated: false, label: '银卡会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'gw_1', target: 'action_4', animated: false, label: '普通会员', style: { stroke: '#f59e0b', strokeWidth: 2 }, labelStyle: { fill: '#f59e0b', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'action_1', target: 'end_1', animated: false, label: '4个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'end_1', animated: false, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_3', target: 'end_1', animated: false, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e10', source: 'action_4', target: 'end_1', animated: false, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 4: 优惠券权益计算（规则集+条件组合）
export const demo4_CouponBenefit: DemoData = {
  ruleCode: 'RULE_COUPON',
  ruleName: 'Demo4: 优惠券权益计算',
  ruleDesc: '根据优惠券类型和使用条件计算权益',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'couponType', valueType: 'VARIABLE', value: 'type' }, { variableName: 'orderAmount', valueType: 'VARIABLE', value: 'amount' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'couponType', fieldType: 'STRING', operator: 'EQ', value: 'FULL_REDUCTION' }, { fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: '200' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: '50', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '满200减50优惠券', messageType: 'SUCCESS' }] } },
    { id: 'cond_2', type: 'condition', position: { x: 560, y: 400 }, data: { conditions: [{ fieldName: 'couponType', fieldType: 'STRING', operator: 'EQ', value: 'PERCENTAGE' }, { fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: '100' }], logic: 'AND' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: 'orderAmount * 0.2', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '8折优惠券', messageType: 'SUCCESS' }] } },
    { id: 'action_3', type: 'action', position: { x: 330, y: 680 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'couponValue', actionValue: '0', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '优惠券不满足使用条件', messageType: 'WARNING' }] } },
    { id: 'end_1', type: 'end', position: { x: 400, y: 820 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: false, label: '设置 couponType, orderAmount', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'action_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'cond_2', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'action_1', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_2', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'action_3', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_2', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_3', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 5: 异常交易识别（复合条件+HTTP调用验证）
export const demo5_AbnormalTransaction: DemoData = {
  ruleCode: 'RULE_ABNORMAL_TXN',
  ruleName: 'Demo5: 异常交易识别',
  ruleDesc: '多条件组合识别异常交易，调用外部接口验证',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'txnAmount', valueType: 'VARIABLE', value: 'amount' }, { variableName: 'txnTime', valueType: 'VARIABLE', value: 'timestamp' }, { variableName: 'userLocation', valueType: 'VARIABLE', value: 'location' }] } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 260 }, data: { conditions: [{ fieldName: 'txnAmount', fieldType: 'NUMBER', operator: 'GT', value: '10000' }, { fieldName: 'txnTime', fieldType: 'DATE', operator: 'BETWEEN', value: '00:00-06:00' }], logic: 'AND' } },
    { id: 'http_1', type: 'http-call', position: { x: 100, y: 400 }, data: { method: 'POST', url: '/api/risk/check-location', body: '{"userId": "${userId}", "location": "${userLocation}"}', responseVar: 'locationRisk', timeout: 3000 } },
    { id: 'cond_2', type: 'condition', position: { x: 100, y: 540 }, data: { conditions: [{ fieldName: 'locationRisk', fieldType: 'STRING', operator: 'EQ', value: 'HIGH_RISK' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 680 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'txnStatus', actionValue: 'BLOCKED', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '异常交易：深夜大额+高风险地点', messageType: 'ERROR' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 820 }, data: { endType: 'fail' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 400 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'txnStatus', actionValue: 'PASSED', actionValueType: 'CONSTANT' }, { actionType: 'SHOW_MESSAGE', message: '交易正常', messageType: 'SUCCESS' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 540 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'cond_1', animated: false, label: '设置 txnAmount, txnTime, userLocation', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'cond_1', target: 'http_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'action_2', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'http_1', target: 'cond_2', animated: false, label: 'POST /api/risk/check-location', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'cond_2', target: 'action_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'cond_2', target: 'action_2', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e8', source: 'action_1', target: 'end_1', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e9', source: 'action_2', target: 'end_2', animated: false, label: '2个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo 6: 订单满减规则（循环遍历+条件匹配）
export const demo6_OrderDiscount: DemoData = {
  ruleCode: 'RULE_ORDER_DISCOUNT',
  ruleName: 'Demo6: 订单满减规则',
  ruleDesc: '遍历订单商品，根据金额区间计算满减优惠',
  nodes: [
    { id: 'start_1', type: 'start', position: { x: 400, y: 30 }, data: {} },
    { id: 'var_1', type: 'variable-assign', position: { x: 330, y: 130 }, data: { assignments: [{ variableName: 'orderAmount', valueType: 'VARIABLE', value: 'totalAmount' }, { variableName: 'discountRules', valueType: 'CONSTANT', value: '[{threshold:100,discount:10},{threshold:200,discount:30},{threshold:500,discount:80}]' }] } },
    { id: 'loop_1', type: 'loop', position: { x: 330, y: 260 }, data: { loopType: 'forEach', collectionVar: 'discountRules', itemVar: 'rule', indexVar: 'ruleIndex' } },
    { id: 'cond_1', type: 'condition', position: { x: 330, y: 400 }, data: { conditions: [{ fieldName: 'orderAmount', fieldType: 'NUMBER', operator: 'GTE', value: 'rule.threshold' }], logic: 'AND' } },
    { id: 'action_1', type: 'action', position: { x: 100, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalDiscount', actionValue: 'rule.discount', actionValueType: 'EXPRESSION' }, { actionType: 'SET_VALUE', targetField: 'finalAmount', actionValue: 'orderAmount - rule.discount', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '满${rule.threshold}减${rule.discount}，最终价格：${finalAmount}', messageType: 'SUCCESS' }] } },
    { id: 'end_1', type: 'end', position: { x: 100, y: 680 }, data: { endType: 'success' } },
    { id: 'action_2', type: 'action', position: { x: 560, y: 540 }, data: { actions: [{ actionType: 'SET_VALUE', targetField: 'finalDiscount', actionValue: '0', actionValueType: 'CONSTANT' }, { actionType: 'SET_VALUE', targetField: 'finalAmount', actionValue: 'orderAmount', actionValueType: 'EXPRESSION' }, { actionType: 'SHOW_MESSAGE', message: '未满足任何满减条件，原价：${orderAmount}', messageType: 'INFO' }] } },
    { id: 'end_2', type: 'end', position: { x: 560, y: 680 }, data: { endType: 'success' } }
  ],
  edges: [
    { id: 'e1', source: 'start_1', target: 'var_1', animated: false, style: { stroke: '#7c3aed', strokeWidth: 2 } },
    { id: 'e2', source: 'var_1', target: 'loop_1', animated: false, label: '设置 orderAmount, discountRules', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e3', source: 'loop_1', target: 'cond_1', animated: false, label: '遍历 discountRules', style: { stroke: '#ec4899', strokeWidth: 2 }, labelStyle: { fill: '#ec4899', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e4', source: 'cond_1', target: 'action_1', animated: false, label: '满足 ✓', style: { stroke: '#10b981', strokeWidth: 2 }, labelStyle: { fill: '#10b981', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e5', source: 'cond_1', target: 'action_2', animated: false, label: '不满足 ✗', style: { stroke: '#ef4444', strokeWidth: 2 }, labelStyle: { fill: '#ef4444', fontSize: 11, fontWeight: 600 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e6', source: 'action_1', target: 'end_1', animated: false, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } },
    { id: 'e7', source: 'action_2', target: 'end_2', animated: false, label: '3个动作', style: { stroke: '#6366f1', strokeWidth: 2 }, labelStyle: { fill: '#6366f1', fontSize: 11, fontWeight: 500 }, labelShowBg: true, labelBgStyle: { fill: '#fff', fillOpacity: 0.9 } }
  ]
}

// Demo列表（用于选择）
export const DEMO_LIST: { id: string; name: string; desc: string; data: DemoData }[] = [
  { id: '1', name: '商品定价决策', desc: '多条件路由+动作执行', data: demo1_ProductPricing },
  { id: '2', name: '风控评分卡', desc: '多条件嵌套+阈值判定', data: demo2_RiskScoring },
  { id: '3', name: '会员等级判定', desc: '决策表+变量赋值', data: demo3_MemberLevel },
  { id: '4', name: '优惠券权益计算', desc: '规则集+条件组合', data: demo4_CouponBenefit },
  { id: '5', name: '异常交易识别', desc: '复合条件+HTTP调用验证', data: demo5_AbnormalTransaction },
  { id: '6', name: '订单满减规则', desc: '循环遍历+条件匹配', data: demo6_OrderDiscount },
]
