/**
 * 变量赋值节点（variable-assign）—— 业务自包含模块
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import VariableAssignNode from "./VariableAssignNode.vue";
import VariableAssignDialog from "./VariableAssignDialog.vue";
import VariableAssignPanelSection from "./VariableAssignPanel.vue";
import type {NodeTypeDef} from "../../nodeTypes";

const VariableAssignEditor = defineComponent({
  name: "VariableAssignEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
    variables: {type: Array as PropType<any[]>, default: () => []},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () =>
      h(VariableAssignDialog as any, {
        visible: true,
        assignments: props.nodeData?.assignments
          ? JSON.parse(JSON.stringify(props.nodeData.assignments))
          : [],
        variables: props.variables as any,
        onSave: (list: any[]) => emit("save", {assignments: list}),
        onClose: () => emit("close"),
      });
  },
});

export const variableAssignDef: NodeTypeDef = {
  type: "variable-assign",
  label: "rule.node.variableAssign",
  icon: "=",
  category: "logic",
  nodeClass: "action",
  desc: "rule.desc.variableAssign",
  component: VariableAssignNode as any,
  editor: VariableAssignEditor as any,
  panelSection: VariableAssignPanelSection as any,
  uiEvents: {
    editItemEvent: "editAssignment",
    deleteItemEvent: "deleteAssignment",
    listKey: "assignments",
  },
  getSummary: (d) => `${d.assignments?.length || 0}${i18n("rule.lbl.itemAssignCount")}`,
  defaultData: () => ({actionType: "VARIABLE_ASSIGN", assignments: []}),
  estimateSize: (data) => ({
    width: 300,
    height: 100 + (data?.assignments?.length || 0) * 28,
  }),
  getEdgeLabel: ({data}) => ({
    label: (data?.assignments || []).length
      ? `${i18n("rule.edge.set")} ${data.assignments
          .map((a: any) => a.variableName)
          .join(", ")}`
      : i18n("rule.edge.varAssign"),
    labelStyle: {fill: "#6366f1", fontSize: 11, fontWeight: 500},
  }),
  collectTestFields: (data, fields, seen) => {
    (data?.assignments || []).forEach((a: any) => {
      if (a.variableName && !seen.has(a.variableName)) {
        seen.add(a.variableName);
        fields.push({name: a.variableName, type: "STRING"});
      }
    });
  },
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
            {label: () => i18n("rule.opt.constant"), value: "CONSTANT"},
            {label: () => i18n("rule.opt.variable"), value: "VARIABLE"},
            {label: () => i18n("rule.opt.expression"), value: "EXPRESSION"},
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
};