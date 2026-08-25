/**
 * 开始节点（start）—— 流程协议锚点
 * 可配置触发事件：表单加载 / 字段变更 / 提交前 / 校验时 / 按钮点击
 */
import StartNode from "./StartNode.vue";
import {i18n} from "@/lang";
import type {NodeTypeDef} from "../../nodeTypes";

/** 流程起点类型标识（引擎协议，非业务枚举） */
export const FLOW_START_TYPE = "start";

export const startDef: NodeTypeDef = {
  type: FLOW_START_TYPE,
  label: "rule.node.start",
  icon: "▶",
  category: "flow",
  nodeClass: "flow",
  desc: "rule.desc.start",
  component: StartNode as any,
  getSummary: (d) => {
    const evt = d?.triggerEvent?.type;
    if (!evt) return i18n("rule.opt.onLoad");
    const map: Record<string, string> = {
      ON_LOAD: i18n("rule.opt.onLoad"),
      ON_CHANGE: i18n("rule.opt.onChange"),
      ON_SUBMIT: i18n("rule.opt.onSubmit"),
      ON_VALIDATE: i18n("rule.opt.onValidate"),
      ON_BUTTON_CLICK: i18n("rule.opt.onButtonClick"),
    };
    return map[evt] || evt;
  },
  defaultData: () => ({
    triggerEvent: {type: "ON_LOAD"},
  }),
  estimateSize: () => ({width: 80, height: 80}),
  paramSchema: [
    {
      name: "triggerEvent.type",
      label: "rule.lbl.triggerEvent",
      type: "select",
      required: true,
      options: [
        {label: () => i18n("rule.opt.onLoad"), value: "ON_LOAD"},
        {label: () => i18n("rule.opt.onChange"), value: "ON_CHANGE"},
        {label: () => i18n("rule.opt.onSubmit"), value: "ON_SUBMIT"},
        {label: () => i18n("rule.opt.onValidate"), value: "ON_VALIDATE"},
        {label: () => i18n("rule.opt.onButtonClick"), value: "ON_BUTTON_CLICK"},
      ],
      group: "rule.group.trigger",
    },
    {
      name: "triggerEvent.field",
      label: "rule.lbl.triggerField",
      type: "input",
      fieldSelect: true,
      placeholder: "rule.lbl.triggerField",
      group: "rule.group.trigger",
    },
    {
      name: "triggerEvent.buttonId",
      label: "rule.lbl.triggerButton",
      type: "input",
      placeholder: "rule.lbl.triggerButton",
      group: "rule.group.trigger",
    },
  ],
};
