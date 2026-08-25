/**
 * 条件节点（condition）
 * 定义、渲染、编辑器、出边标签、尺寸估算、测试字段收集
 * 全部聚合在本模块内；设计器不感知本节点的任何细节。
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import ConditionNode from "./ConditionNode.vue";
import ConditionEditDialog from "./ConditionEditDialog.vue";
import ConditionPanelSection from "./ConditionPanel.vue";
import type {NodeTypeDef} from "../../nodeTypes";

/** 统一协议编辑器：save 返回 merge 进 node.data 的补丁
 * itemIndex 支持两种格式：
 * - number: 根级 conditions[index] 的操作
 * - string "g1.i0": conditions[1].conditions[0] (组内条件)
 */
const ConditionEditor = defineComponent({
  name: "ConditionEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
    itemIndex: {type: [Number, String] as PropType<number | string>, default: -1},
    variables: {type: Array as PropType<any[]>, default: () => []},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () => {
      let condition: any = null;
      if (typeof props.itemIndex === "string") {
        const parts = props.itemIndex
          .split(".")
          .map((p) => parseInt(p, 10));
        if (parts.length === 2) {
          const [gIdx, cIdx] = parts;
          condition =
            props.nodeData?.conditions?.[gIdx]?.conditions?.[cIdx] ?? null;
        }
      } else if (props.itemIndex >= 0) {
        condition =
          props.nodeData?.conditions?.[props.itemIndex] ?? null;
      }
      return h(ConditionEditDialog as any, {
        visible: true,
        condition,
        variables: props.variables as any,
        onSave: (c: any) => {
          const list = [...(props.nodeData?.conditions || [])];
          if (typeof props.itemIndex === "string") {
            const parts = props.itemIndex
              .split(".")
              .map((p) => parseInt(p, 10));
            if (parts.length === 2) {
              const [gIdx, cIdx] = parts;
              const group = list[gIdx];
              if (group?.type === "group") {
                const gc = [...(group.conditions || [])];
                if (cIdx >= 0) gc[cIdx] = c;
                else gc.push(c);
                list[gIdx] = {...group, conditions: gc};
              }
            }
          } else {
            if (props.itemIndex >= 0) list[props.itemIndex] = c;
            else list.push(c);
          }
          emit("save", {conditions: list});
        },
        onClose: () => emit("close"),
      });
    };
  },
});

export const conditionDef: NodeTypeDef = {
  type: "condition",
  label: "rule.node.condition",
  icon: "❓",
  category: "logic",
  nodeClass: "condition",
  desc: "rule.desc.condition",
  component: ConditionNode as any,
  editor: ConditionEditor as any,
  panelSection: ConditionPanelSection as any,
  uiEvents: {
    editItemEvent: "editCondition",
    deleteItemEvent: "deleteCondition",
    listKey: "conditions",
  },
  getSummary: (d) => {
    const countLeaf = (items: any[]): number => {
      let n = 0;
      (items || []).forEach((c: any) => {
        if (c.type === "group") n += countLeaf(c.conditions || []);
        else n++;
      });
      return n;
    };
    const n = countLeaf(d.conditions || []);
    const groups = (d.conditions || []).filter((c: any) => c.type === "group").length;
    return `${n}${i18n("rule.lbl.conditionCount")}${groups > 0 ? ` (${groups}组)` : ""} (${d.logic})`;
  },
  defaultData: () => ({logic: "AND", conditions: []}),
  estimateSize: (data) => {
    const countLeaf = (items: any[]): number => {
      let n = 0;
      (items || []).forEach((c: any) => {
        if (c.type === "group") n += countLeaf(c.conditions || []) + 1;
        else n++;
      });
      return n;
    };
    const n = countLeaf(data?.conditions || []);
    return {
      width: 320,
      height: 120 + n * 28,
    };
  },
  getEdgeLabel: ({outIndex}) =>
    outIndex === 0
      ? {
          label: i18n("rule.edge.satisfied"),
          labelStyle: {fill: "#10b981", fontSize: 11, fontWeight: 600},
        }
      : {
          label: i18n("rule.edge.notSatisfied"),
          labelStyle: {fill: "#ef4444", fontSize: 11, fontWeight: 600},
        },
  collectTestFields: (data, fields, seen) => {
    const walk = (items: any[]) => {
      (items || []).forEach((c: any) => {
        if (c.type === "group") {
          walk(c.conditions || []);
        } else if (c.fieldName && !seen.has(c.fieldName)) {
          seen.add(c.fieldName);
          fields.push({name: c.fieldName, type: c.fieldType || "STRING"});
        }
      });
    };
    walk(data?.conditions || []);
  },
  collectItems: (data) => {
    const walk = (
      items: any[],
      parentLogic: string,
    ): any[] => {
      return (items || []).map((c: any) => {
        if (c.type === "group") {
          return {
            type: "group",
            logic: c.logic,
            conditions: walk(c.conditions || [], c.logic || "AND"),
          };
        }
        return {...c, logic: parentLogic};
      });
    };
    return {
      listKey: "conditions",
      items: walk(data?.conditions || [], data?.logic || "AND"),
    };
  },
  paramSchema: [
    {
      name: "logic",
      label: "rule.lbl.logic",
      type: "select",
      options: [
        {label: () => i18n("rule.opt.and"), value: "AND"},
        {label: () => i18n("rule.opt.or"), value: "OR"},
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
            {label: () => i18n("rule.opt.eq"), value: "EQ"},
            {label: () => i18n("rule.opt.neq"), value: "NEQ"},
            {label: () => i18n("rule.opt.gt"), value: "GT"},
            {label: () => i18n("rule.opt.lt"), value: "LT"},
            {label: () => i18n("rule.opt.gte"), value: "GTE"},
            {label: () => i18n("rule.opt.lte"), value: "LTE"},
            {label: () => i18n("rule.opt.contains"), value: "CONTAINS"},
            {label: () => i18n("rule.opt.notContains"), value: "NOT_CONTAINS"},
            {label: () => i18n("rule.opt.isEmpty"), value: "IS_EMPTY"},
            {label: () => i18n("rule.opt.isNotEmpty"), value: "IS_NOT_EMPTY"},
            {label: () => i18n("rule.opt.in"), value: "IN"},
            {label: () => i18n("rule.opt.notIn"), value: "NOT_IN"},
            {label: () => i18n("rule.opt.between"), value: "BETWEEN"},
            {label: () => i18n("rule.opt.regex"), value: "REGEX"},
            {label: () => i18n("rule.opt.startsWith"), value: "STARTS_WITH"},
            {label: () => i18n("rule.opt.endsWith"), value: "ENDS_WITH"},
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
};