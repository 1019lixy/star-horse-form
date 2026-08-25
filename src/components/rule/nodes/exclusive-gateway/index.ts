/**
 * 排他网关节点（exclusive-gateway）—— 业务自包含模块
 */
import {defineComponent, h, type PropType} from "vue";
import {i18n} from "@/lang";
import ExclusiveGatewayNode from "./ExclusiveGatewayNode.vue";
import GatewayConfigDialog from "./GatewayConfigDialog.vue";
import GatewayPanelSection from "./GatewayPanel.vue";
import type {NodeTypeDef} from "../../nodeTypes";

const GatewayEditor = defineComponent({
  name: "GatewayEditor",
  props: {
    nodeData: {type: Object as PropType<Record<string, any>>, required: true},
  },
  emits: ["save", "close"],
  setup(props, {emit}) {
    return () =>
      h(GatewayConfigDialog as any, {
        visible: true,
        gateway: {
          name: props.nodeData?.name || i18n("rule.node.gateway"),
          gatewayType: props.nodeData?.gatewayType || "XOR",
          branches: props.nodeData?.branches
            ? JSON.parse(JSON.stringify(props.nodeData.branches))
            : [],
        },
        onSave: (g: any) => emit("save", g),
        onClose: () => emit("close"),
      });
  },
});

export const exclusiveGatewayDef: NodeTypeDef = {
  type: "exclusive-gateway",
  label: "rule.node.exclusiveGateway",
  icon: "✕",
  category: "flow",
  nodeClass: "condition",
  desc: "rule.desc.exclusiveGateway",
  component: ExclusiveGatewayNode as any,
  editor: GatewayEditor as any,
  panelSection: GatewayPanelSection as any,
  getSummary: (d) => `${d.branches?.length || 0} ${i18n("rule.panel.branchUnit")}`,
  defaultData: () => ({
    name: i18n("rule.node.exclusiveGateway"),
    gatewayType: "XOR",
    branches: [],
  }),
  estimateSize: () => ({width: 80, height: 80}),
  getEdgeLabel: ({data, outIndex}) => {
    const branches = data?.branches || [];
    const label =
      outIndex < branches.length
        ? branches[outIndex].condition ||
          branches[outIndex].label ||
          `${i18n("rule.edge.branch")}${outIndex + 1}`
        : i18n("rule.edge.defaultBranch");
    return {
      label,
      labelStyle: {fill: "#f59e0b", fontSize: 11, fontWeight: 600},
    };
  },
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
};