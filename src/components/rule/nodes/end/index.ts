/**
 * 结束节点（end）—— 流程协议锚点
 */
import EndNode from "./EndNode.vue";
import {i18n} from "@/lang";
import type {NodeTypeDef} from "../../nodeTypes";

export const endDef: NodeTypeDef = {
  type: "end",
  label: "rule.node.end",
  icon: "■",
  category: "flow",
  nodeClass: "flow",
  desc: "rule.desc.end",
  component: EndNode as any,
  getSummary: () => i18n("rule.exec.flowEnd"),
  defaultData: () => ({endType: "success"}),
  estimateSize: () => ({width: 80, height: 80}),
  paramSchema: [
    {
      name: "endType",
      label: "rule.lbl.resultType",
      type: "select",
      options: [
        {label: () => i18n("rule.opt.pass"), value: "success"},
        {label: () => i18n("rule.opt.reject"), value: "fail"},
        {label: () => i18n("rule.opt.skip"), value: "skip"},
      ],
      group: "rule.group.basic",
    },
  ],
};