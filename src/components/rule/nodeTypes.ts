/**
 * 规则引擎节点类型定义
 * 2大类8种节点，精简实用，覆盖表单规则全部场景
 */

import { i18n } from "@/lang";

export interface ParamField {
  name: string;
  label: string | Function;
  type:
    | "input"
    | "number"
    | "select"
    | "multiselect"
    | "textarea"
    | "date"
    | "switch"
    | "table";
  required?: boolean;
  options?: { label: string | Function; value: any }[];
  placeholder?: string;
  default?: any;
  group?: string;
  min?: number;
  max?: number;
  step?: number;
  rows?: number;
  fieldSelect?: boolean;
  columns?: {
    prop: string;
    label: string;
    type?: "input" | "select";
    options?: any[];
    width?: string;
    fieldSelect?: boolean;
    hideOnActionTypes?: string[];
    showOnActionTypes?: string[];
  }[];
}

export interface NodeTypeDef {
  type: string;
  label: string;
  icon: string;
  category: string;
  desc: string;
  defaultData: () => Record<string, any>;
  paramSchema: ParamField[];
}

export interface NodeCategory {
  name: string;
  icon: string;
  color: string;
  nodes: NodeTypeDef[];
}

export const NODE_CATEGORIES: NodeCategory[] = [
  // ============ 基础节点 ============
  {
    name: "rule.category.basic",
    icon: "🎯",
    color: "#8b5cf6",
    nodes: [
      {
        type: "start",
        label: "rule.node.start",
        icon: "▶",
        category: "flow",
        desc: "rule.desc.start",
        defaultData: () => ({}),
        paramSchema: [],
      },
      {
        type: "end",
        label: "rule.node.end",
        icon: "■",
        category: "flow",
        desc: "rule.desc.end",
        defaultData: () => ({ endType: "success" }),
        paramSchema: [
          {
            name: "endType",
            label: "rule.lbl.resultType",
            type: "select",
            options: [
              { label: () => i18n("rule.opt.pass"), value: "success" },
              { label: () => i18n("rule.opt.reject"), value: "fail" },
              { label: () => i18n("rule.opt.skip"), value: "skip" },
            ],
            group: "rule.group.basic",
          },
        ],
      },
      {
        type: "condition",
        label: "rule.node.condition",
        icon: "❓",
        category: "logic",
        desc: "rule.desc.condition",
        defaultData: () => ({ logic: "AND", conditions: [] }),
        paramSchema: [
          {
            name: "logic",
            label: "rule.lbl.logic",
            type: "select",
            options: [
              { label: () => i18n("rule.opt.and"), value: "AND" },
              { label: () => i18n("rule.opt.or"), value: "OR" },
            ],
            group: "rule.group.basic",
          },
          {
            name: "conditions",
            label: "rule.lbl.conditionList",
            type: "table",
            group: "rule.group.condition",
            columns: [
              {
                prop: "fieldName",
                label: "rule.lbl.fieldName",
                type: "input",
                width: "120px",
                fieldSelect: true,
              },
              {
                prop: "operator",
                label: "rule.lbl.operator",
                type: "select",
                width: "110px",
                options: [
                  { label: () => i18n("rule.opt.eq"), value: "EQ" },
                  { label: () => i18n("rule.opt.neq"), value: "NEQ" },
                  { label: () => i18n("rule.opt.gt"), value: "GT" },
                  { label: () => i18n("rule.opt.lt"), value: "LT" },
                  { label: () => i18n("rule.opt.gte"), value: "GTE" },
                  { label: () => i18n("rule.opt.lte"), value: "LTE" },
                  { label: () => i18n("rule.opt.contains"), value: "CONTAINS" },
                  {
                    label: () => i18n("rule.opt.notContains"),
                    value: "NOT_CONTAINS",
                  },
                  { label: () => i18n("rule.opt.isEmpty"), value: "IS_EMPTY" },
                  {
                    label: () => i18n("rule.opt.isNotEmpty"),
                    value: "IS_NOT_EMPTY",
                  },
                  { label: () => i18n("rule.opt.in"), value: "IN" },
                  { label: () => i18n("rule.opt.notIn"), value: "NOT_IN" },
                  { label: () => i18n("rule.opt.between"), value: "BETWEEN" },
                  { label: () => i18n("rule.opt.regex"), value: "REGEX" },
                  {
                    label: () => i18n("rule.opt.startsWith"),
                    value: "STARTS_WITH",
                  },
                  {
                    label: () => i18n("rule.opt.endsWith"),
                    value: "ENDS_WITH",
                  },
                ],
              },
              {
                prop: "value",
                label: "rule.lbl.value",
                type: "input",
                width: "120px",
              },
            ],
          },
        ],
      },
      {
        type: "action",
        label: "rule.node.action",
        icon: "▶",
        category: "logic",
        desc: "rule.desc.action",
        defaultData: () => ({ actions: [] }),
        paramSchema: [
          {
            name: "actions",
            label: "rule.lbl.actionList",
            type: "table",
            group: "rule.group.action",
            columns: [
              {
                prop: "actionType",
                label: "rule.lbl.actionType",
                type: "select",
                width: "120px",
                options: [
                  {
                    label: () => i18n("rule.opt.showField"),
                    value: "SHOW_FIELD",
                  },
                  {
                    label: () => i18n("rule.opt.hideField"),
                    value: "HIDE_FIELD",
                  },
                  {
                    label: () => i18n("rule.opt.setValue"),
                    value: "SET_VALUE",
                  },
                  {
                    label: () => i18n("rule.opt.clearValue"),
                    value: "CLEAR_VALUE",
                  },
                  {
                    label: () => i18n("rule.opt.setRequired"),
                    value: "SET_REQUIRED",
                  },
                  {
                    label: () => i18n("rule.opt.setOptions"),
                    value: "SET_OPTIONS",
                  },
                  {
                    label: () => i18n("rule.opt.showMessage"),
                    value: "SHOW_MESSAGE",
                  },
                ],
              },
              {
                prop: "targetField",
                label: "rule.lbl.targetField",
                type: "input",
                width: "120px",
                fieldSelect: true,
                hideOnActionTypes: ["SHOW_MESSAGE"],
              },
              {
                prop: "actionValue",
                label: "rule.lbl.value",
                type: "input",
                width: "120px",
              },
            ],
          },
        ],
      },
      {
        type: "exclusive-gateway",
        label: "rule.node.exclusiveGateway",
        icon: "✕",
        category: "flow",
        desc: "rule.desc.exclusiveGateway",
        defaultData: () => ({ name: "", branches: [] }),
        paramSchema: [
          {
            name: "name",
            label: "rule.lbl.routeName",
            type: "input",
            group: "rule.group.basic",
          },
          {
            name: "branches",
            label: "rule.lbl.conditionBranch",
            type: "table",
            group: "rule.group.branch",
            columns: [
              {
                prop: "label",
                label: "rule.lbl.branchLabel",
                type: "input",
                width: "120px",
              },
              {
                prop: "condition",
                label: "rule.lbl.conditionExpr",
                type: "input",
                width: "200px",
              },
            ],
          },
        ],
      },
    ],
  },
  // ============ 高级节点 ============
  {
    name: "rule.category.advanced",
    icon: "⚙️",
    color: "#10b981",
    nodes: [
      {
        type: "http-call",
        label: "rule.node.httpCall",
        icon: "🌐",
        category: "logic",
        desc: "rule.desc.httpCall",
        defaultData: () => ({
          apiMode: "custom",
          apiType: "thirdApi",
          url: "",
          httpMethod: "GET",
          protocol: "https",
          timeout: 5000,
          requestDataType: "json",
          headers: [],
          requestParams: [],
          body: "",
          successCode: "200",
          codePath: "code",
          messagePath: "message",
          dataPath: "data",
          fieldMappings: [],
          authEnabled: false,
          authInfo: null,
          proxyEnabled: true,
          proxyUrl: "/system-config/redirect/apiLinkage",
          retryCount: 0,
          description: "",
        }),
        paramSchema: [
          {
            name: "httpMethod",
            label: "rule.lbl.httpMethod",
            type: "select",
            required: true,
            group: "rule.group.request",
            options: [
              { label: "GET", value: "GET" },
              { label: "POST", value: "POST" },
              { label: "PUT", value: "PUT" },
              { label: "DELETE", value: "DELETE" },
            ],
          },
          {
            name: "url",
            label: "rule.lbl.apiUrl",
            type: "input",
            required: true,
            group: "rule.group.request",
            placeholder: "https://api.example.com/data",
          },
          {
            name: "fieldMappings",
            label: "rule.lbl.fieldMappings",
            type: "table",
            group: "rule.group.mapping",
            columns: [
              {
                prop: "sourceField",
                label: "rule.lbl.sourceField",
                type: "input",
                width: "45%",
              },
              {
                prop: "distField",
                label: "rule.lbl.distField",
                type: "input",
                fieldSelect: true,
                width: "45%",
              },
            ],
          },
          {
            name: "requestParams",
            label: "rule.lbl.requestParams",
            type: "table",
            group: "rule.group.request",
            columns: [
              {
                prop: "paramName",
                label: "rule.lbl.paramName",
                type: "input",
                width: "30%",
              },
              {
                prop: "valueType",
                label: "rule.lbl.valueType",
                type: "select",
                width: "20%",
                options: [
                  { label: () => i18n("rule.opt.static"), value: "static" },
                  { label: () => i18n("rule.opt.dynamic"), value: "dynamic" },
                ],
              },
              {
                prop: "paramValue",
                label: "rule.lbl.paramValue",
                type: "input",
                fieldSelect: true,
                width: "40%",
              },
            ],
          },
          {
            name: "body",
            label: "rule.lbl.requestBody",
            type: "textarea",
            rows: 4,
            group: "rule.group.request",
            placeholder: "rule.ph.jsonBody",
          },
          {
            name: "successCode",
            label: "rule.lbl.successCode",
            type: "input",
            default: "200",
            group: "rule.group.response",
            placeholder: "200",
          },
          {
            name: "dataPath",
            label: "rule.lbl.dataPath",
            type: "input",
            default: "data",
            group: "rule.group.response",
            placeholder: "data.list",
          },
          {
            name: "headers",
            label: "rule.lbl.headers",
            type: "table",
            group: "rule.group.advanced",
            columns: [
              {
                prop: "paramName",
                label: "rule.lbl.paramName",
                type: "input",
                width: "30%",
              },
              {
                prop: "valueType",
                label: "rule.lbl.valueType",
                type: "select",
                width: "20%",
                options: [
                  { label: () => i18n("rule.opt.static"), value: "static" },
                  { label: () => i18n("rule.opt.dynamic"), value: "dynamic" },
                ],
              },
              {
                prop: "paramValue",
                label: "rule.lbl.paramValue",
                type: "input",
                fieldSelect: true,
                width: "40%",
              },
            ],
          },
          {
            name: "timeout",
            label: "rule.lbl.timeout",
            type: "number",
            min: 1000,
            step: 1000,
            default: 5000,
            group: "rule.group.advanced",
          },
          {
            name: "retryCount",
            label: "rule.lbl.retryCount",
            type: "number",
            min: 0,
            max: 5,
            default: 0,
            group: "rule.group.advanced",
          },
        ],
      },
      {
        type: "variable-assign",
        label: "rule.node.variableAssign",
        icon: "=",
        category: "logic",
        desc: "rule.desc.variableAssign",
        defaultData: () => ({ assignments: [] }),
        paramSchema: [
          {
            name: "assignments",
            label: "rule.lbl.assignList",
            type: "table",
            group: "rule.group.assign",
            columns: [
              {
                prop: "variableName",
                label: "rule.lbl.varName",
                type: "input",
                width: "120px",
              },
              {
                prop: "valueType",
                label: "rule.lbl.valueType",
                type: "select",
                width: "100px",
                options: [
                  { label: () => i18n("rule.opt.constant"), value: "CONSTANT" },
                  { label: () => i18n("rule.opt.variable"), value: "VARIABLE" },
                  {
                    label: () => i18n("rule.opt.expression"),
                    value: "EXPRESSION",
                  },
                ],
              },
              {
                prop: "value",
                label: "rule.lbl.value",
                type: "input",
                width: "150px",
              },
            ],
          },
        ],
      },
      {
        type: "script",
        label: "rule.node.script",
        icon: "📜",
        category: "logic",
        desc: "rule.desc.script",
        defaultData: () => ({ scriptContent: "", description: "" }),
        paramSchema: [
          {
            name: "scriptContent",
            label: "rule.lbl.scriptContent",
            type: "textarea",
            rows: 8,
            placeholder: "rule.ph.script",
            group: "rule.group.basic",
          },
          {
            name: "description",
            label: "rule.lbl.nodeDesc",
            type: "textarea",
            rows: 2,
            group: "rule.group.other",
          },
        ],
      },
    ],
  },
];

// 扁平化映射
export const NODE_TYPE_MAP: Record<string, NodeTypeDef> =
  NODE_CATEGORIES.reduce(
    (map, cat) => {
      cat.nodes.forEach((n) => {
        map[n.type] = n;
      });
      return map;
    },
    {} as Record<string, NodeTypeDef>,
  );

export const getCategoryColor = (type: string): string => {
  const cat = NODE_CATEGORIES.find((c) => c.nodes.some((n) => n.type === type));
  return cat?.color || "#64748b";
};

export const getNodeDef = (type: string): NodeTypeDef | undefined =>
  NODE_TYPE_MAP[type];
export const getNodeDefaultData = (type: string): Record<string, any> =>
  NODE_TYPE_MAP[type]?.defaultData() || {};
export const getNodeLabel = (type: string): string => {
  const raw = NODE_TYPE_MAP[type]?.label || type;
  return typeof raw === "string" && raw.startsWith("rule.") ? i18n(raw) : raw;
};
export const getParamSchema = (type: string): ParamField[] =>
  NODE_TYPE_MAP[type]?.paramSchema || [];
