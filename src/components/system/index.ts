export { default as StarHorseFormDesign } from "./StarHorseFormDesign.vue";
export { default as PreviewDialog } from "./items/form/dialogs/PreviewDialog.vue";
export { default as DbListComp } from "./items/utils/DbListComp.vue";
export { default as FormPreview } from "./items/form/components/FormPreview.vue";
export { default as MyComponentsPanel } from "./items/form/panels/MyComponentsPanel.vue";
export { default as TemplatePanel } from "./items/form/panels/TemplatePanel.vue";
export {default as RuleDesigner} from "../rule/RuleDesigner.vue";
// ==================== 设计器业务扩展组件（自包含，按需放入 #toolbar-extra 插槽） ====================
export {default as ExtToolbarButton} from "./items/form/extensions/ExtToolbarButton.vue";
export {default as AiChatButton} from "./items/form/extensions/AiChatButton.vue";
export {default as RuleConfigButton} from "./items/form/extensions/RuleConfigButton.vue";
export {default as FlowDesignButton} from "./items/form/extensions/FlowDesignButton.vue";
export {default as SaveAsCompButton} from "./items/form/extensions/SaveAsCompButton.vue";
// ==================== 流程绑定扩展（composable + 组件，通过 advancedProps + #property-panel-extra 引入） ====================
export {default as FlowBindingTab, useFlowBinding} from "./items/form/extensions/FlowBindingTab.vue";
