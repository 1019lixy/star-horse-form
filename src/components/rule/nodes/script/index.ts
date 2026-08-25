/**
 * 脚本节点（script）—— 业务自包含模块
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import ScriptNode from "./ScriptNode.vue";
import ScriptEditDialog from "./ScriptEditDialog.vue";
import type {NodeTypeDef} from "../../nodeTypes";

const ScriptEditor = defineComponent({
  name: "ScriptEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () =>
      h(ScriptEditDialog as any, {
        visible: true,
        script: {
          scriptLang: props.nodeData?.scriptLang || "javascript",
          scriptContent: props.nodeData?.scriptContent || "",
        },
        onSave: (s: any) => emit("save", s),
        onClose: () => emit("close"),
      });
  },
});

export const scriptDef: NodeTypeDef = {
  type: "script",
  label: "rule.node.script",
  icon: "📜",
  category: "logic",
  nodeClass: "action",
  desc: "rule.desc.script",
  component: ScriptNode as any,
  editor: ScriptEditor as any,
  getSummary: (d) => (d.script ? String(d.script).substring(0, 30) : ""),
  defaultData: () => ({
    actionType: "SCRIPT",
    scriptContent: "",
    scriptLang: "javascript",
    description: "",
  }),
  estimateSize: () => ({width: 300, height: 140}),
  getEdgeLabel: () => ({
    label: i18n("rule.edge.execScript"),
    labelStyle: {fill: "#64748b", fontSize: 11, fontWeight: 500},
  }),
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
};