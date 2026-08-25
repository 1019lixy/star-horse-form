/**
 * 动作节点（action）—— 业务自包含模块
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import ActionNode from "./ActionNode.vue";
import ActionEditDialog from "./ActionEditDialog.vue";
import ActionPanelSection from "./ActionPanel.vue";
import type {NodeTypeDef} from "../../nodeTypes";

const ActionEditor = defineComponent({
  name: "ActionEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
    itemIndex: {type: Number, default: -1},
    variables: {type: Array as PropType<any[]>, default: () => []},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () =>
      h(ActionEditDialog as any, {
        visible: true,
        action:
          props.itemIndex >= 0
            ? props.nodeData?.actions?.[props.itemIndex] ?? null
            : null,
        variables: props.variables as any,
        onSave: (a: any) => {
          const list = [...(props.nodeData?.actions || [])];
          if (props.itemIndex >= 0) list[props.itemIndex] = a;
          else list.push(a);
          emit("save", {actions: list});
        },
        onClose: () => emit("close"),
      });
  },
});

export const actionDef: NodeTypeDef = {
  type: "action",
  label: "rule.node.action",
  icon: "▶",
  category: "logic",
  nodeClass: "action",
  desc: "rule.desc.action",
  component: ActionNode as any,
  editor: ActionEditor as any,
  panelSection: ActionPanelSection as any,
  uiEvents: {
    editItemEvent: "editAction",
    deleteItemEvent: "deleteAction",
    listKey: "actions",
  },
  getSummary: (d) => `${d.actions?.length || 0}${i18n("rule.lbl.actionCount")}`,
  defaultData: () => ({actionType: "FORM_CONTROL", actions: []}),
  estimateSize: (data) => ({
    width: 300,
    height: 100 + (data?.actions?.length || 0) * 28,
  }),
  getEdgeLabel: ({data}) => ({
    label: (data?.actions || []).length
      ? `${data.actions.length}${i18n("rule.edge.actions")}`
      : i18n("rule.edge.execAction"),
    labelStyle: {fill: "#64748b", fontSize: 11, fontWeight: 500},
  }),
  collectItems: (data) => ({listKey: "actions", items: data?.actions || []}),
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
            {label: () => i18n("rule.opt.showField"), value: "SHOW_FIELD"},
            {label: () => i18n("rule.opt.hideField"), value: "HIDE_FIELD"},
            {label: () => i18n("rule.opt.setValue"), value: "SET_VALUE"},
            {label: () => i18n("rule.opt.clearValue"), value: "CLEAR_VALUE"},
            {label: () => i18n("rule.opt.setRequired"), value: "SET_REQUIRED"},
            {label: () => i18n("rule.opt.setOptions"), value: "SET_OPTIONS"},
            {label: () => i18n("rule.opt.showMessage"), value: "SHOW_MESSAGE"},
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
};