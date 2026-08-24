/**
 * 前端规则执行引擎
 * 解析流程图节点和边，模拟规则执行，返回执行路径
 */

import { i18n } from "@/lang";

export interface ExecutionNode {
  id: string;
  type: string;
  data: any;
}

export interface ExecutionEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  data?: any;
}

export interface ExecutionStep {
  nodeId: string;
  nodeType: string;
  nodeName: string;
  status: "SUCCESS" | "FAILED" | "SKIPPED" | "RUNNING";
  message: string;
  timestamp: number;
  duration?: number;
}

export interface ExecutionPath {
  visitedNodeIds: string[];
  visitedEdgeIds: string[];
  steps: ExecutionStep[];
  context: any;
  success: boolean;
  duration: number;
  conditionResults: { nodeId: string; passed: boolean; detail: string }[];
  actionResults: {
    nodeId: string;
    actionType: string;
    targetField: string;
    success: boolean;
    message: string;
  }[];
  snapshots: {
    nodeId: string;
    input: any;
    output: string;
    changes: string[];
  }[];
}

/**

 * 比较操作符
 */
const compareValues = (left: any, operator: string, right: any): boolean => {
  const toNum = (v: any) => {
    if (typeof v === "number") return v;
    if (typeof v === "string") {
      const n = parseFloat(v);
      return isNaN(n) ? 0 : n;
    }
    return 0;
  };

  switch (operator) {
    case "EQ":
    case "=":
    case "==":
      return String(left) === String(right);
    case "NE":
    case "!=":
    case "<>":
      return String(left) !== String(right);
    case "GT":
    case ">":
      return toNum(left) > toNum(right);
    case "GTE":
    case ">=":
      return toNum(left) >= toNum(right);
    case "LT":
    case "<":
      return toNum(left) < toNum(right);
    case "LTE":
    case "<=":
      return toNum(left) <= toNum(right);
    case "CONTAINS":
      if (typeof right === "string")
        return String(right).includes(String(left));
      if (Array.isArray(right))
        return right.some((r) => String(r) === String(left));
      return false;
    case "NOT_CONTAINS":
      if (typeof right === "string")
        return !String(right).includes(String(left));
      if (Array.isArray(right))
        return !right.some((r) => String(r) === String(left));
      return true;
    case "IN":
      if (Array.isArray(right))
        return right.some((r) => String(r) === String(left));
      if (typeof right === "string")
        return String(right)
          .split(",")
          .map((s) => s.trim())
          .includes(String(left));
      return false;
    case "NOT_IN":
      if (Array.isArray(right))
        return !right.some((r) => String(r) === String(left));
      if (typeof right === "string")
        return !String(right)
          .split(",")
          .map((s) => s.trim())
          .includes(String(left));
      return true;
    case "IS_NULL":
    case "NULL":
      return left === null || left === undefined || left === "";
    case "NOT_NULL":
      return left !== null && left !== undefined && left !== "";
    case "STARTS_WITH":
      return (
        typeof left === "string" &&
        typeof right === "string" &&
        left.startsWith(right)
      );
    case "ENDS_WITH":
      return (
        typeof left === "string" &&
        typeof right === "string" &&
        left.endsWith(right)
      );
    case "BETWEEN": {
      // right格式: "min-max" 或 "min,max"
      const parts = String(right).split(/[-,]/);
      if (parts.length >= 2) {
        const lo = toNum(parts[0]);
        const hi = toNum(parts[1]);
        return toNum(left) >= lo && toNum(left) <= hi;
      }
      return false;
    }
    default:
      return false;
  }
};

/**
 * 评估单个条件
 */
const evaluateCondition = (
  condition: any,
  context: any,
): { passed: boolean; detail: string } => {
  const fieldValue = context[condition.fieldName];
  const targetValue = condition.value;

  const passed = compareValues(fieldValue, condition.operator, targetValue);
  const detail = `${condition.fieldName}(${fieldValue ?? "null"}) ${condition.operator} ${targetValue} => ${passed ? "TRUE" : "FALSE"}`;

  return { passed, detail };
};

/**
 * 评估条件组
 */
const evaluateConditions = (
  conditions: any[],
  logic: string,
  context: any,
): { passed: boolean; details: string[] } => {
  if (!conditions || conditions.length === 0) {
    return { passed: true, details: [i18n("rule.exec.noConditionDefault")] };
  }

  const details: string[] = [];
  const results = conditions.map((cond) => {
    const result = evaluateCondition(cond, context);
    details.push(result.detail);
    return result.passed;
  });

  const passed =
    logic === "OR" ? results.some((r) => r) : results.every((r) => r);
  return { passed, details };
};

/**
 * 表达式求值（设计器模拟用）
 * 支持 ${var} 占位符插值，以及算术/逻辑表达式（基于上下文变量）
 */
const evaluateExpression = (expr: string, context: any): any => {
  if (!expr) return "";
  // 1. 替换 ${var} 占位符
  let resolved = expr.replace(/\$\{([^}]+)\}/g, (_, k) => {
    const v = resolveContextPath(context, k.trim());
    return v === undefined || v === null ? "" : String(v);
  });
  // 2. 仅当表达式只含安全字符时尝试求值
  if (/^[\w\s+\-*/%().,:'"<>=!&|?]+$/.test(resolved)) {
    try {
      const keys = Object.keys(context).filter((k) =>
        /^[$A-Z_a-z][$\w]*$/.test(k),
      );
      const vals = keys.map((k) => context[k]);
      // 注入内置函数
      const fnScope = {
        SUM: (...a: number[]) => a.reduce((s, x) => s + Number(x || 0), 0),
        AVG: (...a: number[]) =>
          a.length ? a.reduce((s, x) => s + Number(x || 0), 0) / a.length : 0,
        MIN: (...a: number[]) => Math.min(...a.map((x) => Number(x))),
        MAX: (...a: number[]) => Math.max(...a.map((x) => Number(x))),
        ROUND: (x: number, n = 0) => Number(Number(x).toFixed(n)),
        ABS: (x: number) => Math.abs(Number(x)),
        LEN: (s: string) => String(s ?? "").length,
        CONCAT: (...a: any[]) => a.map((x) => String(x ?? "")).join(""),
        UPPER: (s: string) => String(s ?? "").toUpperCase(),
        LOWER: (s: string) => String(s ?? "").toLowerCase(),
        NOW: () => new Date().toISOString(),
        IF: (c: any, a: any, b: any) => (c ? a : b),
        IS_EMPTY: (x: any) => x === undefined || x === null || x === "",
      };
      const scopeKeys = Object.keys(fnScope);
      const scopeVals = scopeKeys.map((k) => (fnScope as any)[k]);
      const allKeys = [...scopeKeys, ...keys];
      const allVals = [...scopeVals, ...vals];
      const fn = new Function(
        ...allKeys,
        `"use strict"; return (${resolved});`,
      );
      return fn(...allVals);
    } catch {
      // 求值失败，回退为插值后的字符串
    }
  }
  return resolved;
};

/**
 * 解析上下文路径（支持 a.b.c 取值）
 */
const resolveContextPath = (context: any, path: string): any => {
  const segs = path.split(".");
  let cur = context;
  for (const s of segs) {
    if (cur == null) return undefined;
    cur = cur[s];
  }
  return cur;
};

/**
 * 执行动作（模拟）
 */
const executeAction = (
  action: any,
  context: any,
): { success: boolean; message: string } => {
  switch (action.actionType) {
    case "SHOW_FIELD":
      context[`__visible_${action.targetField}`] = true;
      return {
        success: true,
        message: `${i18n("rule.exec.showField")}: ${action.targetField}`,
      };
    case "HIDE_FIELD":
      context[`__visible_${action.targetField}`] = false;
      return {
        success: true,
        message: `${i18n("rule.exec.hideField")}: ${action.targetField}`,
      };
    case "SET_VALUE": {
      let value = action.actionValue || action.value;
      if (action.actionValueType === "EXPRESSION") {
        value = evaluateExpression(String(action.actionValue || ""), context);
      } else if (action.actionValueType === "VARIABLE") {
        value = resolveContextPath(context, String(action.actionValue || ""));
      }
      context[action.targetField] = value;
      return {
        success: true,
        message: `${i18n("rule.exec.setValue")} ${action.targetField} = ${value}`,
      };
    }
    case "CLEAR_VALUE":
      context[action.targetField] = "";
      return {
        success: true,
        message: `${i18n("rule.exec.clearField")}: ${action.targetField}`,
      };
    case "SET_REQUIRED":
      context[`__required_${action.targetField}`] = true;
      return {
        success: true,
        message: `${i18n("rule.exec.setRequired")}: ${action.targetField}`,
      };
    case "SET_OPTIONAL":
      context[`__required_${action.targetField}`] = false;
      return {
        success: true,
        message: `${i18n("rule.exec.setOptional")}: ${action.targetField}`,
      };
    case "SET_READONLY":
      context[`__readonly_${action.targetField}`] = true;
      return {
        success: true,
        message: `${i18n("rule.exec.setReadonly")}: ${action.targetField}`,
      };
    case "SET_EDITABLE":
      context[`__readonly_${action.targetField}`] = false;
      return {
        success: true,
        message: `${i18n("rule.exec.setEditable")}: ${action.targetField}`,
      };
    case "SET_DISABLED":
      context[`__disabled_${action.targetField}`] = true;
      return {
        success: true,
        message: `${i18n("rule.exec.setDisabled")}: ${action.targetField}`,
      };
    case "SET_ENABLED":
      context[`__disabled_${action.targetField}`] = false;
      return {
        success: true,
        message: `${i18n("rule.exec.setEnabled")}: ${action.targetField}`,
      };
    case "SHOW_MESSAGE":
      return {
        success: true,
        message: `[${action.messageType || "INFO"}] ${action.message || action.actionValue || ""}`,
      };
    case "REDIRECT":
      return {
        success: true,
        message: `${i18n("rule.exec.redirect")}: ${action.actionValue || action.value || ""}`,
      };
    default:
      return {
        success: true,
        message: `${i18n("rule.exec.executeAction")}: ${action.actionType}`,
      };
  }
};

/**
 * 执行变量赋值
 */
const executeVariableAssign = (
  assignments: any[],
  context: any,
): { success: boolean; messages: string[] } => {
  const messages: string[] = [];
  for (const assign of assignments) {
    let value = assign.value;
    if (assign.valueType === "VARIABLE") {
      value = resolveContextPath(context, String(assign.value));
    } else if (assign.valueType === "EXPRESSION") {
      value = evaluateExpression(String(assign.value), context);
    } else if (assign.valueType === "CONSTANT") {
      // 尝试解析为JSON（支持数组/对象常量）
      if (typeof value === "string") {
        const trimmed = value.trim();
        if (
          (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
          (trimmed.startsWith("{") && trimmed.endsWith("}"))
        ) {
          try {
            value = JSON.parse(trimmed);
          } catch {
            // JSON解析失败，保持原始字符串
          }
        }
        // 尝试解析为数字
        else if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
          value = Number(trimmed);
        }
        // 布尔值
        else if (trimmed === "true") value = true;
        else if (trimmed === "false") value = false;
      }
    }
    context[assign.variableName] = value;
    messages.push(
      `${assign.variableName} = ${typeof value === "object" ? JSON.stringify(value) : value}`,
    );
  }
  return { success: true, messages };
};

/**
 * 执行脚本（模拟，安全沙箱）
 */
const executeScript = (
  scriptContent: string,
  context: any,
): { success: boolean; message: string } => {
  try {
    // 创建安全的执行上下文
    const fn = new Function("context", "formData", "variables", scriptContent);
    const result = fn(context, context, context);
    return {
      success: true,
      message: `${i18n("rule.exec.scriptComplete")}${result ? ": " + JSON.stringify(result) : ""}`,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `${i18n("rule.exec.scriptError")}: ${error.message}`,
    };
  }
};

/**
 * 模拟HTTP调用
 */
const executeHttpCall = (
  config: any,
  context: any,
): { success: boolean; message: string } => {
  const method = config.method || "GET";
  const url = config.url || "";
  // 模拟响应
  const mockResponse = {
    code: 200,
    data: { success: true, message: "mock response" },
  };
  if (config.responseVar) {
    context[config.responseVar] = mockResponse;
  }
  return {
    success: true,
    message: `${method} ${url} => 200 (${i18n("rule.exec.mock")})`,
  };
};

/**
 * 主执行函数：遍历流程图
 */
export const executeRuleFlow = (
  nodes: ExecutionNode[],
  edges: ExecutionEdge[],
  inputData: any,
): ExecutionPath => {
  const startTime = Date.now();
  const context = { ...inputData };
  const steps: ExecutionStep[] = [];
  const conditionResults: ExecutionPath["conditionResults"] = [];
  const actionResults: ExecutionPath["actionResults"] = [];
  const visitedNodeIds: string[] = [];
  const visitedEdgeIds: string[] = [];
  const snapshots: ExecutionPath["snapshots"] = [];

  // 找到开始节点
  const startNode = nodes.find((n) => n.type === "start");
  if (!startNode) {
    steps.push({
      nodeId: "",
      nodeType: "error",
      nodeName: i18n("rule.exec.error"),
      status: "FAILED",
      message: i18n("rule.exec.startNodeNotFound"),
      timestamp: Date.now(),
    });
    return {
      visitedNodeIds,
      visitedEdgeIds,
      steps,
      context,
      success: false,
      duration: Date.now() - startTime,
      conditionResults,
      actionResults,
      snapshots,
    };
  }

  // BFS遍历
  let currentNodeId: string | null = startNode.id;
  let safetyCounter = 0;
  const maxIterations = 100;

  while (currentNodeId && safetyCounter < maxIterations) {
    safetyCounter++;
    const node = nodes.find((n) => n.id === currentNodeId);
    if (!node) break;

    visitedNodeIds.push(node.id);
    const nodeStartTime = Date.now();
    const nodeName = getNodeName(node);
    // 记录节点执行前的上下文快照（排除内部状态键）
    const contextBefore: Record<string, any> = {};
    for (const k of Object.keys(context)) {
      if (!k.startsWith("__")) contextBefore[k] = context[k];
    }

    steps.push({
      nodeId: node.id,
      nodeType: node.type,
      nodeName,
      status: "RUNNING",
      message: `${i18n("rule.exec.enterNode")}: ${nodeName}`,
      timestamp: Date.now(),
    });

    let nextEdgeId: string | null = null;
    let nextNodeId: string | null = null;

    switch (node.type) {
      case "start": {
        steps[steps.length - 1].message = i18n("rule.exec.flowStart");
        steps[steps.length - 1].status = "SUCCESS";
        // 开始节点自动找下一条边
        const startOutEdge = edges.find((e) => e.source === node.id);
        if (startOutEdge) {
          nextEdgeId = startOutEdge.id;
          nextNodeId = startOutEdge.target;
        }
        break;
      }

      case "end":
        steps[steps.length - 1].message = i18n("rule.exec.flowEnd");
        steps[steps.length - 1].status = "SUCCESS";
        currentNodeId = null;
        continue;

      case "condition": {
        const conditions = node.data.conditions || [];
        const logic = node.data.logic || "AND";
        const { passed, details } = evaluateConditions(
          conditions,
          logic,
          context,
        );
        conditionResults.push({
          nodeId: node.id,
          passed,
          detail: details.join("\n"),
        });
        steps[steps.length - 1].message =
          `${passed ? i18n("rule.exec.conditionMet") : i18n("rule.exec.conditionNotMet")}: ${details.join("; ")}`;
        steps[steps.length - 1].status = passed ? "SUCCESS" : "SKIPPED";

        // 条件满足走"是"边，不满足走"否"边
        // 匹配策略：满足=包含"是"/"满足"/"true"/"✓"的标签；不满足=包含"否"/"不满足"/"false"/"✗"的标签
        const outEdges = edges.filter((e) => e.source === node.id);
        const isTrueLabel = (label?: string) => {
          if (!label) return true; // 无标签默认为"是"边
          const l = label.toLowerCase();
          return (
            l === "是" ||
            l === "true" ||
            l.includes("满足") ||
            l.includes("✓") ||
            l.includes("yes")
          );
        };
        const isFalseLabel = (label?: string) => {
          if (!label) return false;
          const l = label.toLowerCase();
          return (
            l === "否" ||
            l === "false" ||
            l.includes("不满足") ||
            l.includes("✗") ||
            l.includes("no")
          );
        };
        if (passed) {
          const trueEdge =
            outEdges.find((e) => isTrueLabel(e.label)) || outEdges[0];
          if (trueEdge) {
            nextEdgeId = trueEdge.id;
            nextNodeId = trueEdge.target;
          }
        } else {
          const falseEdge = outEdges.find((e) => isFalseLabel(e.label));
          if (falseEdge) {
            nextEdgeId = falseEdge.id;
            nextNodeId = falseEdge.target;
          } else {
            // 没有明确的"否"边时，走第二条边（第一条通常是"是"边）
            const secondEdge = outEdges.length > 1 ? outEdges[1] : outEdges[0];
            if (secondEdge) {
              nextEdgeId = secondEdge.id;
              nextNodeId = secondEdge.target;
            }
          }
        }
        break;
      }

      case "action": {
        const actions = node.data.actions || [];
        for (const action of actions) {
          const result = executeAction(action, context);
          actionResults.push({
            nodeId: node.id,
            actionType: action.actionType,
            targetField: action.targetField || "",
            success: result.success,
            message: result.message,
          });
        }
        steps[steps.length - 1].message =
          `${i18n("rule.exec.executedActions")} ${actions.length}`;
        steps[steps.length - 1].status = "SUCCESS";

        const outEdge = edges.find((e) => e.source === node.id);
        if (outEdge) {
          nextEdgeId = outEdge.id;
          nextNodeId = outEdge.target;
        }
        break;
      }

      case "exclusive-gateway": {
        // 排他网关：找第一个满足条件的分支
        const branches = node.data.branches || [];
        const outEdges = edges.filter((e) => e.source === node.id);
        let found = false;
        let defaultEdge: ExecutionEdge | null = null;
        for (const edge of outEdges) {
          // 通过edge.label匹配branch
          const branch = branches.find((b: any) => b.label === edge.label);
          if (branch) {
            // 1) branch有conditions数组 → 用evaluateConditions
            if (branch.conditions && branch.conditions.length > 0) {
              const { passed } = evaluateConditions(
                branch.conditions,
                branch.logic || "AND",
                context,
              );
              if (passed) {
                nextEdgeId = edge.id;
                nextNodeId = edge.target;
                found = true;
                break;
              }
            }
            // 2) branch有condition字符串 → 用evaluateExpression求值
            else if (branch.condition && typeof branch.condition === "string") {
              const condStr = String(branch.condition);
              if (
                condStr === "default" ||
                condStr.toLowerCase() === "default"
              ) {
                defaultEdge = edge;
                continue; // 默认分支最后处理
              }
              try {
                const result = evaluateExpression(condStr, context);
                if (result === true || result === "true") {
                  nextEdgeId = edge.id;
                  nextNodeId = edge.target;
                  found = true;
                  break;
                }
              } catch {
                // 条件求值失败，跳过此分支
              }
            }
          } else if (!found) {
            // 无匹配branch的边，视为默认分支
            if (!defaultEdge) defaultEdge = edge;
          }
        }
        // 没有条件满足时走默认分支
        if (!found && defaultEdge) {
          nextEdgeId = defaultEdge.id;
          nextNodeId = defaultEdge.target;
          found = true;
        }
        if (!found && outEdges.length > 0) {
          nextEdgeId = outEdges[outEdges.length - 1].id;
          nextNodeId = outEdges[outEdges.length - 1].target;
        }
        steps[steps.length - 1].message = found
          ? `${i18n("rule.exec.selectBranch")}: ${edges.find((e) => e.id === nextEdgeId)?.label || i18n("rule.exec.default")}`
          : i18n("rule.exec.noMatchedBranch");
        steps[steps.length - 1].status = "SUCCESS";
        break;
      }

      case "variable-assign": {
        const assignments = node.data.assignments || [];
        const result = executeVariableAssign(assignments, context);
        steps[steps.length - 1].message = result.messages.join("; ");
        steps[steps.length - 1].status = "SUCCESS";
        const outEdge = edges.find((e) => e.source === node.id);
        if (outEdge) {
          nextEdgeId = outEdge.id;
          nextNodeId = outEdge.target;
        }
        break;
      }

      case "script": {
        const result = executeScript(node.data.scriptContent || "", context);
        steps[steps.length - 1].message = result.message;
        steps[steps.length - 1].status = result.success ? "SUCCESS" : "FAILED";
        const outEdge = edges.find((e) => e.source === node.id);
        if (outEdge) {
          nextEdgeId = outEdge.id;
          nextNodeId = outEdge.target;
        }
        break;
      }

      case "http-call": {
        const result = executeHttpCall(node.data, context);
        steps[steps.length - 1].message = result.message;
        steps[steps.length - 1].status = "SUCCESS";
        const outEdge = edges.find((e) => e.source === node.id);
        if (outEdge) {
          nextEdgeId = outEdge.id;
          nextNodeId = outEdge.target;
        }
        break;
      }

      default:
        steps[steps.length - 1].message =
          `${i18n("rule.exec.unknownNodeType")}: ${node.type}`;
        steps[steps.length - 1].status = "SKIPPED";
        const outEdge = edges.find((e) => e.source === node.id);
        if (outEdge) {
          nextEdgeId = outEdge.id;
          nextNodeId = outEdge.target;
        }
    }

    if (nextEdgeId) visitedEdgeIds.push(nextEdgeId);
    currentNodeId = nextNodeId;

    if (steps.length > 0) {
      steps[steps.length - 1].duration = Date.now() - nodeStartTime;
    }

    // 捕获节点执行快照：输出 + 上下文变更
    const changes: string[] = [];
    const allKeys = new Set([
      ...Object.keys(contextBefore),
      ...Object.keys(context).filter((k) => !k.startsWith("__")),
    ]);
    for (const k of allKeys) {
      if (!(k in contextBefore)) {
        changes.push(`${k} = ${JSON.stringify(context[k])}`);
      } else if (
        JSON.stringify(contextBefore[k]) !== JSON.stringify(context[k])
      ) {
        changes.push(
          `${k}: ${JSON.stringify(contextBefore[k])} → ${JSON.stringify(context[k])}`,
        );
      }
    }
    const stepMsg = steps.length ? steps[steps.length - 1].message : "";
    snapshots.push({
      nodeId: node.id,
      input: contextBefore,
      output: stepMsg,
      changes,
    });
  }

  return {
    visitedNodeIds,
    visitedEdgeIds,
    steps,
    context,
    success: true,
    duration: Date.now() - startTime,
    conditionResults,
    actionResults,
    snapshots,
  };
};

/**
 * 获取节点显示名称
 */
const getNodeName = (node: ExecutionNode): string => {
  switch (node.type) {
    case "start":
      return i18n("rule.node.start");
    case "end":
      return i18n("rule.node.end");
    case "condition":
      return i18n("rule.node.condition");
    case "action":
      return i18n("rule.node.action");
    case "exclusive-gateway":
      return node.data.name || i18n("rule.node.exclusiveGateway");
    case "variable-assign":
      return i18n("rule.node.variableAssign");
    case "script":
      return i18n("rule.node.script");
    case "http-call":
      return i18n("rule.node.httpCall");
    default:
      return node.type;
  }
};
