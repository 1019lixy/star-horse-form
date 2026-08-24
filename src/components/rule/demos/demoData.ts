/**
 * 规则引擎Demo数据 — 严格贴合低代码表单落地场景
 * 覆盖全部8种节点：start/end/condition/action/exclusive-gateway/http-call/variable-assign/script
 */
import type { Node, Edge } from "../compat";
import { i18n } from "@/lang";

export interface DemoData {
  ruleCode: string;
  ruleName: string;
  ruleDesc: string;
  nodes: Node[];
  edges: Edge[];
  variables?: any[];
}

const S = { stroke: "#7c3aed", strokeWidth: 2 };
const SG = { stroke: "#10b981", strokeWidth: 2 };
const SR = { stroke: "#ef4444", strokeWidth: 2 };
const SB = { stroke: "#6366f1", strokeWidth: 2 };
const SW = { stroke: "#f59e0b", strokeWidth: 2 };
const LS = { fill: "#10b981", fontSize: 11, fontWeight: 600 };
const LR = { fill: "#ef4444", fontSize: 11, fontWeight: 600 };
const LB = { fill: "#6366f1", fontSize: 11, fontWeight: 500 };
const LW = { fill: "#f59e0b", fontSize: 11, fontWeight: 600 };
const LBG = { fill: "#fff", fillOpacity: 0.9 };
const edge = (
  id: string,
  source: string,
  target: string,
  label?: string,
  style?: any,
  ls?: any,
) => ({
  id,
  source,
  target,
  animated: false,
  label,
  style: style || SB,
  labelStyle: ls || LB,
  labelShowBg: true,
  labelBgStyle: LBG,
});

// Demo 1: 表单字段显隐联动（condition + action SHOW_FIELD/HIDE_FIELD/CLEAR_VALUE）
// 场景：合同字段联动 — 选择"有合同"时显示合同金额和签订日期，否则隐藏并清空
export const demo1_FieldVisibility: DemoData = {
  ruleCode: "RULE_FIELD_VIS",
  ruleName: `Demo1: ${i18n("rule.demo.fieldVisibility")}`,
  ruleDesc: i18n("rule.demo.fieldVisibilityDesc"),
  variables: [
    {
      field: "hasContract",
      label: "是否有合同",
      type: "STRING",
      source: "INPUT",
    },
    {
      field: "contractAmount",
      label: "合同金额",
      type: "NUMBER",
      source: "INPUT",
    },
    { field: "contractDate", label: "签订日期", type: "DATE", source: "INPUT" },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "cond_1",
      type: "condition",
      position: { x: 330, y: 140 },
      data: {
        conditions: [{ fieldName: "hasContract", operator: "EQ", value: "Y" }],
        logic: "AND",
      },
    },
    {
      id: "action_show",
      type: "action",
      position: { x: 150, y: 290 },
      data: {
        actions: [
          { actionType: "SHOW_FIELD", targetField: "contractAmount" },
          { actionType: "SHOW_FIELD", targetField: "contractDate" },
          { actionType: "SET_REQUIRED", targetField: "contractAmount" },
        ],
      },
    },
    {
      id: "action_hide",
      type: "action",
      position: { x: 550, y: 290 },
      data: {
        actions: [
          { actionType: "HIDE_FIELD", targetField: "contractAmount" },
          { actionType: "HIDE_FIELD", targetField: "contractDate" },
          { actionType: "CLEAR_VALUE", targetField: "contractAmount" },
          { actionType: "CLEAR_VALUE", targetField: "contractDate" },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 400, y: 440 },
      data: { endType: "success" },
    },
  ],
  edges: [
    edge("e1", "start_1", "cond_1", undefined, S),
    edge("e2", "cond_1", "action_show", "满足 ✓", SG, LS),
    edge("e3", "cond_1", "action_hide", "不满足 ✗", SR, LR),
    edge("e4", "action_show", "end_1", "显示+必填", SB, LB),
    edge("e5", "action_hide", "end_1", "隐藏+清空", SB, LB),
  ],
};

// Demo 2: 表单字段计算赋值（variable-assign + action SET_VALUE）
// 场景：金额计算 — 单价 × 数量 × (1 - 折扣) = 总价，超过1万提示
export const demo2_FieldCalc: DemoData = {
  ruleCode: "RULE_FIELD_CALC",
  ruleName: `Demo2: ${i18n("rule.demo.fieldCalc")}`,
  ruleDesc: i18n("rule.demo.fieldCalcDesc"),
  variables: [
    { field: "unitPrice", label: "单价", type: "NUMBER", source: "INPUT" },
    { field: "quantity", label: "数量", type: "NUMBER", source: "INPUT" },
    { field: "discount", label: "折扣", type: "NUMBER", source: "INPUT" },
    { field: "totalAmount", label: "总价", type: "NUMBER", source: "CONTEXT" },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "var_1",
      type: "variable-assign",
      position: { x: 330, y: 140 },
      data: {
        assignments: [
          {
            variableName: "totalAmount",
            valueType: "EXPRESSION",
            value: "unitPrice * quantity * (1 - discount)",
          },
        ],
      },
    },
    {
      id: "action_1",
      type: "action",
      position: { x: 330, y: 290 },
      data: {
        actions: [
          {
            actionType: "SET_VALUE",
            targetField: "totalAmount",
            actionValue: "totalAmount",
          },
        ],
      },
    },
    {
      id: "cond_1",
      type: "condition",
      position: { x: 330, y: 420 },
      data: {
        conditions: [
          { fieldName: "totalAmount", operator: "GT", value: "10000" },
        ],
        logic: "AND",
      },
    },
    {
      id: "action_warn",
      type: "action",
      position: { x: 150, y: 560 },
      data: {
        actions: [
          {
            actionType: "SHOW_MESSAGE",
            actionValue: "总价超过1万元，需要主管审批",
          },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 150, y: 700 },
      data: { endType: "success" },
    },
    {
      id: "end_2",
      type: "end",
      position: { x: 550, y: 560 },
      data: { endType: "success" },
    },
  ],
  edges: [
    edge("e1", "start_1", "var_1", undefined, S),
    edge("e2", "var_1", "action_1", "计算总价", SB, LB),
    edge("e3", "action_1", "cond_1", "赋值", SB, LB),
    edge("e4", "cond_1", "action_warn", "满足 ✓", SG, LS),
    edge("e5", "cond_1", "end_2", "不满足 ✗", SR, LR),
    edge("e6", "action_warn", "end_1", "提示", SB, LB),
  ],
};

// Demo 3: 多分支表单路由（exclusive-gateway + action SHOW_FIELD/HIDE_FIELD）
// 场景：项目类型路由 — 不同项目类型显示不同字段组
export const demo3_MultiBranch: DemoData = {
  ruleCode: "RULE_MULTI_BRANCH",
  ruleName: `Demo3: ${i18n("rule.demo.multiBranch")}`,
  ruleDesc: i18n("rule.demo.multiBranchDesc"),
  variables: [
    {
      field: "projectType",
      label: "项目类型",
      type: "STRING",
      source: "INPUT",
    },
    {
      field: "constructionSite",
      label: "施工地点",
      type: "STRING",
      source: "INPUT",
    },
    {
      field: "procurementItem",
      label: "采购物品",
      type: "STRING",
      source: "INPUT",
    },
    {
      field: "serviceContent",
      label: "服务内容",
      type: "STRING",
      source: "INPUT",
    },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "gw_1",
      type: "exclusive-gateway",
      position: { x: 350, y: 150 },
      data: {
        name: "项目类型路由",
        gatewayType: "XOR",
        branches: [
          {
            id: "b1",
            label: "建设项目",
            condition: 'projectType == "construction"',
          },
          {
            id: "b2",
            label: "采购项目",
            condition: 'projectType == "procurement"',
          },
          { id: "b3", label: "服务项目", condition: "default" },
        ],
      },
    },
    {
      id: "action_construction",
      type: "action",
      position: { x: 80, y: 320 },
      data: {
        actions: [
          { actionType: "SHOW_FIELD", targetField: "constructionSite" },
          { actionType: "HIDE_FIELD", targetField: "procurementItem" },
          { actionType: "HIDE_FIELD", targetField: "serviceContent" },
        ],
      },
    },
    {
      id: "action_procurement",
      type: "action",
      position: { x: 380, y: 320 },
      data: {
        actions: [
          { actionType: "SHOW_FIELD", targetField: "procurementItem" },
          { actionType: "HIDE_FIELD", targetField: "constructionSite" },
          { actionType: "HIDE_FIELD", targetField: "serviceContent" },
        ],
      },
    },
    {
      id: "action_service",
      type: "action",
      position: { x: 680, y: 320 },
      data: {
        actions: [
          { actionType: "SHOW_FIELD", targetField: "serviceContent" },
          { actionType: "HIDE_FIELD", targetField: "constructionSite" },
          { actionType: "HIDE_FIELD", targetField: "procurementItem" },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 400, y: 480 },
      data: { endType: "success" },
    },
  ],
  edges: [
    edge("e1", "start_1", "gw_1", undefined, S),
    edge("e2", "gw_1", "action_construction", "建设项目", SW, LW),
    edge("e3", "gw_1", "action_procurement", "采购项目", SW, LW),
    edge("e4", "gw_1", "action_service", "服务项目", SW, LW),
    edge("e5", "action_construction", "end_1", "显隐字段", SB, LB),
    edge("e6", "action_procurement", "end_1", "显隐字段", SB, LB),
    edge("e7", "action_service", "end_1", "显隐字段", SB, LB),
  ],
};

// Demo 4: API选项联动（http-call + action SET_OPTIONS）
// 场景：省市级联 — 选择省份后调用API获取城市列表，设置城市字段选项
export const demo4_ApiLinkage: DemoData = {
  ruleCode: "RULE_API_LINKAGE",
  ruleName: `Demo4: ${i18n("rule.demo.apiLinkage")}`,
  ruleDesc: i18n("rule.demo.apiLinkageDesc"),
  variables: [
    { field: "province", label: "省份", type: "STRING", source: "INPUT" },
    { field: "city", label: "城市", type: "STRING", source: "INPUT" },
    {
      field: "cityOptions",
      label: "城市选项",
      type: "ARRAY",
      source: "CONTEXT",
    },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "cond_1",
      type: "condition",
      position: { x: 330, y: 140 },
      data: {
        conditions: [{ fieldName: "province", operator: "IS_NOT_EMPTY" }],
        logic: "AND",
      },
    },
    {
      id: "http_1",
      type: "http-call",
      position: { x: 330, y: 290 },
      data: {
        httpMethod: "GET",
        url: "/api/region/cities?province=${province}",
        fieldMappings: [{ sourceField: "data", distField: "cityOptions" }],
        successCode: "200",
        dataPath: "data",
        timeout: 5000,
      },
    },
    {
      id: "action_1",
      type: "action",
      position: { x: 330, y: 440 },
      data: {
        actions: [
          {
            actionType: "SET_OPTIONS",
            targetField: "city",
            actionValue: "cityOptions",
          },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 330, y: 590 },
      data: { endType: "success" },
    },
    {
      id: "end_2",
      type: "end",
      position: { x: 600, y: 290 },
      data: { endType: "skip" },
    },
  ],
  edges: [
    edge("e1", "start_1", "cond_1", undefined, S),
    edge("e2", "cond_1", "http_1", "满足 ✓", SG, LS),
    edge("e3", "cond_1", "end_2", "不满足 ✗", SR, LR),
    edge("e4", "http_1", "action_1", "GET /api/region/cities", SB, LB),
    edge("e5", "action_1", "end_1", "设置城市选项", SB, LB),
  ],
};

// Demo 5: 表单必填校验（condition 多操作符 + action SET_REQUIRED）
// 场景：表单提交校验 — 邮箱正则、手机号非空、年龄范围
export const demo5_FormValidation: DemoData = {
  ruleCode: "RULE_FORM_VALIDATION",
  ruleName: `Demo5: ${i18n("rule.demo.formValidation")}`,
  ruleDesc: i18n("rule.demo.formValidationDesc"),
  variables: [
    { field: "email", label: "邮箱", type: "STRING", source: "INPUT" },
    { field: "phone", label: "手机号", type: "STRING", source: "INPUT" },
    { field: "age", label: "年龄", type: "NUMBER", source: "INPUT" },
    { field: "idCard", label: "身份证号", type: "STRING", source: "INPUT" },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "cond_email",
      type: "condition",
      position: { x: 330, y: 140 },
      data: {
        conditions: [
          {
            fieldName: "email",
            operator: "REGEX",
            value: "^[\\w.-]+@[\\w.-]+\\.\\w+$",
          },
        ],
        logic: "AND",
      },
    },
    {
      id: "cond_phone",
      type: "condition",
      position: { x: 330, y: 290 },
      data: {
        conditions: [
          { fieldName: "phone", operator: "IS_NOT_EMPTY" },
          { fieldName: "phone", operator: "REGEX", value: "^1[3-9]\\d{9}$" },
        ],
        logic: "AND",
      },
    },
    {
      id: "cond_age",
      type: "condition",
      position: { x: 330, y: 440 },
      data: {
        conditions: [{ fieldName: "age", operator: "BETWEEN", value: "18,65" }],
        logic: "AND",
      },
    },
    {
      id: "cond_idcard",
      type: "condition",
      position: { x: 330, y: 590 },
      data: {
        conditions: [
          { fieldName: "idCard", operator: "REGEX", value: "^\\d{17}[\\dXx]$" },
        ],
        logic: "AND",
      },
    },
    {
      id: "action_pass",
      type: "action",
      position: { x: 150, y: 740 },
      data: {
        actions: [{ actionType: "SHOW_MESSAGE", actionValue: "表单校验通过" }],
      },
    },
    {
      id: "action_fail",
      type: "action",
      position: { x: 550, y: 740 },
      data: {
        actions: [
          {
            actionType: "SHOW_MESSAGE",
            actionValue: "表单校验失败，请检查输入",
          },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 150, y: 880 },
      data: { endType: "success" },
    },
    {
      id: "end_2",
      type: "end",
      position: { x: 550, y: 880 },
      data: { endType: "fail" },
    },
  ],
  edges: [
    edge("e1", "start_1", "cond_email", undefined, S),
    edge("e2", "cond_email", "cond_phone", "满足 ✓", SG, LS),
    edge("e3", "cond_email", "action_fail", "不满足 ✗", SR, LR),
    edge("e4", "cond_phone", "cond_age", "满足 ✓", SG, LS),
    edge("e5", "cond_phone", "action_fail", "不满足 ✗", SR, LR),
    edge("e6", "cond_age", "cond_idcard", "满足 ✓", SG, LS),
    edge("e7", "cond_age", "action_fail", "不满足 ✗", SR, LR),
    edge("e8", "cond_idcard", "action_pass", "满足 ✓", SG, LS),
    edge("e9", "cond_idcard", "action_fail", "不满足 ✗", SR, LR),
    edge("e10", "action_pass", "end_1", "校验通过", SB, LB),
    edge("e11", "action_fail", "end_2", "校验失败", SB, LB),
  ],
};

// Demo 6: 脚本复杂计算（script + variable-assign + action SET_VALUE）
// 场景：累进税率计算 — 根据收入区间计算个税，脚本实现分段计税逻辑
export const demo6_ScriptCalc: DemoData = {
  ruleCode: "RULE_SCRIPT_CALC",
  ruleName: `Demo6: ${i18n("rule.demo.scriptCalc")}`,
  ruleDesc: i18n("rule.demo.scriptCalcDesc"),
  variables: [
    { field: "income", label: "月收入", type: "NUMBER", source: "INPUT" },
    { field: "tax", label: "个税", type: "NUMBER", source: "CONTEXT" },
    {
      field: "netIncome",
      label: "税后收入",
      type: "NUMBER",
      source: "CONTEXT",
    },
  ],
  nodes: [
    { id: "start_1", type: "start", position: { x: 400, y: 30 }, data: {} },
    {
      id: "script_1",
      type: "script",
      position: { x: 330, y: 140 },
      data: {
        scriptContent: `// 累进税率计算
const brackets = [
  { min: 0, max: 3000, rate: 0.03 },
  { min: 3000, max: 12000, rate: 0.10 },
  { min: 12000, max: 25000, rate: 0.20 },
  { min: 25000, max: 35000, rate: 0.25 },
  { min: 35000, max: 55000, rate: 0.30 },
  { min: 55000, max: 80000, rate: 0.35 },
  { min: 80000, max: Infinity, rate: 0.45 },
];
const taxable = Math.max(0, income - 5000);
let tax = 0;
for (const b of brackets) {
  if (taxable > b.min) {
    tax += (Math.min(taxable, b.max) - b.min) * b.rate;
  } else break;
}
return { tax: Math.round(tax * 100) / 100 };`,
        description: "累进税率分段计算",
      },
    },
    {
      id: "var_1",
      type: "variable-assign",
      position: { x: 330, y: 300 },
      data: {
        assignments: [
          {
            variableName: "tax",
            valueType: "VARIABLE",
            value: "scriptResult.tax",
          },
          {
            variableName: "netIncome",
            valueType: "EXPRESSION",
            value: "income - tax",
          },
        ],
      },
    },
    {
      id: "action_1",
      type: "action",
      position: { x: 330, y: 450 },
      data: {
        actions: [
          { actionType: "SET_VALUE", targetField: "tax", actionValue: "tax" },
          {
            actionType: "SET_VALUE",
            targetField: "netIncome",
            actionValue: "netIncome",
          },
        ],
      },
    },
    {
      id: "cond_1",
      type: "condition",
      position: { x: 330, y: 590 },
      data: {
        conditions: [{ fieldName: "tax", operator: "GT", value: "0" }],
        logic: "AND",
      },
    },
    {
      id: "action_msg",
      type: "action",
      position: { x: 150, y: 730 },
      data: {
        actions: [
          {
            actionType: "SHOW_MESSAGE",
            actionValue: "个税：${tax}元，税后收入：${netIncome}元",
          },
        ],
      },
    },
    {
      id: "end_1",
      type: "end",
      position: { x: 150, y: 870 },
      data: { endType: "success" },
    },
    {
      id: "end_2",
      type: "end",
      position: { x: 550, y: 730 },
      data: { endType: "success" },
    },
  ],
  edges: [
    edge("e1", "start_1", "script_1", undefined, S),
    edge("e2", "script_1", "var_1", "计算个税", SB, LB),
    edge("e3", "var_1", "action_1", "赋值", SB, LB),
    edge("e4", "action_1", "cond_1", "设置字段", SB, LB),
    edge("e5", "cond_1", "action_msg", "满足 ✓", SG, LS),
    edge("e6", "cond_1", "end_2", "不满足 ✗", SR, LR),
    edge("e7", "action_msg", "end_1", "提示", SB, LB),
  ],
};

// Demo列表
export const DEMO_LIST: {
  id: string;
  nameKey: string;
  descKey: string;
  data: DemoData;
}[] = [
  {
    id: "1",
    nameKey: "rule.demo.fieldVisibility",
    descKey: "rule.demo.fieldVisibilityDesc",
    data: demo1_FieldVisibility,
  },
  {
    id: "2",
    nameKey: "rule.demo.fieldCalc",
    descKey: "rule.demo.fieldCalcDesc",
    data: demo2_FieldCalc,
  },
  {
    id: "3",
    nameKey: "rule.demo.multiBranch",
    descKey: "rule.demo.multiBranchDesc",
    data: demo3_MultiBranch,
  },
  {
    id: "4",
    nameKey: "rule.demo.apiLinkage",
    descKey: "rule.demo.apiLinkageDesc",
    data: demo4_ApiLinkage,
  },
  {
    id: "5",
    nameKey: "rule.demo.formValidation",
    descKey: "rule.demo.formValidationDesc",
    data: demo5_FormValidation,
  },
  {
    id: "6",
    nameKey: "rule.demo.scriptCalc",
    descKey: "rule.demo.scriptCalcDesc",
    data: demo6_ScriptCalc,
  },
];
