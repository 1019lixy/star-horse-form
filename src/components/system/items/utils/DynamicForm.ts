import { i18n } from "@/lang/index.js";
import { ToolBtnType } from "@/components/types/ToolBtnType.js";

const formActions = (): Array<ToolBtnType> => [
  {
    icon: "style",
    defaultEdit: true,
    key: "style",
    auth: "none",
    label: i18n("dyform.action.style"),
    children: [
      {
        icon: "pc",
        defaultEdit: true,
        key: "pc",
        auth: "none",
        label: i18n("dyform.action.pc"),
      },
      {
        icon: "pad",
        defaultEdit: true,
        key: "pad",
        auth: "none",
        label: i18n("dyform.action.pad"),
      },
      {
        icon: "phone",
        defaultEdit: true,
        key: "phone",
        auth: "none",
        label: i18n("dyform.action.phone"),
      },
    ],
  },
  {
    icon: "add",
    defaultEdit: true,
    key: "new",
    auth: "none",
    label: i18n("dyform.action.new"),
    shortcut: "Ctrl+N",
  },
  {
    icon: "upload",
    defaultEdit: true,
    key: "upload",
    auth: "none",
    label: i18n("dyform.action.import"),
  },
  {
    icon: "edit",
    key: "eprep",
    auth: "none",
    label: i18n("dyform.action.edit"),
  },
  {
    icon: "dept",
    key: "layer",
    auth: "none",
    label: i18n("dyform.action.layer"),
  },
  {
    icon: "empty_setting",
    key: "empty",
    auth: "none",
    label: i18n("dyform.action.empty"),
    shortcut: "Ctrl+Shift+D",
  },
  {
    icon: "undo",
    key: "undo",
    auth: "none",
    label: i18n("dyform.action.undo"),
    shortcut: "Ctrl+Z",
  },
  {
    icon: "redo",
    key: "redo",
    auth: "none",
    label: i18n("dyform.action.redo"),
    shortcut: "Ctrl+Y",
  },
  {
    icon: "valid",
    key: "valid",
    auth: "none",
    label: i18n("dyform.action.valid"),
    shortcut: "Ctrl+Shift+V",
  },
  {
    icon: "preview",
    key: "preview",
    auth: "none",
    label: i18n("dyform.action.preview"),
    shortcut: "Ctrl+P",
  },
  {
    icon: "code",
    key: "code",
    auth: "none",
    label: i18n("dyform.action.code"),
  },
  {
    icon: "save",
    key: "save",
    auth: "none",
    label: i18n("dyform.action.save"),
    shortcut: "Ctrl+S",
  },
  {
    icon: "export",
    key: "export",
    auth: "none",
    label: i18n("dyform.action.export"),
  },
];
const shortKeyHelpMessage = (): string => `
${i18n("dyform.help.shortcuts")}：

【${i18n("dyform.help.category.edit")}】
  Ctrl + X       ${i18n("dyform.help.shortcut.cut")}
  Ctrl + C       ${i18n("dyform.help.shortcut.copy")}
  Ctrl + V       ${i18n("dyform.help.shortcut.paste")}
  Ctrl + Z       ${i18n("dyform.help.shortcut.undo")}
  Ctrl + Y / Ctrl + Shift + Z   ${i18n("dyform.help.shortcut.redo")}
  Delete         ${i18n("dyform.help.shortcut.delete")}
  Ctrl + A       ${i18n("dyform.help.shortcut.selectAll")}
  Ctrl + Shift + D   ${i18n("dyform.help.shortcut.clear")}

【${i18n("dyform.help.category.file")}】
  Ctrl + N       ${i18n("dyform.help.shortcut.new")}
  Ctrl + S       ${i18n("dyform.help.shortcut.save")}
  Ctrl + O       ${i18n("dyform.help.shortcut.open")}

【${i18n("dyform.help.category.view")}】
  Ctrl + B       ${i18n("dyform.help.shortcut.toggleLeftPanel")}
  Ctrl + J       ${i18n("dyform.help.shortcut.toggleRightPanel")}
  Ctrl + P       ${i18n("dyform.help.shortcut.preview")}
  Ctrl + Shift + V   ${i18n("dyform.help.shortcut.validate")}
  Ctrl + F       ${i18n("dyform.help.shortcut.find")}
  Alt + ←        ${i18n("dyform.help.shortcut.goBack")}

【${i18n("dyform.help.category.component")}】
  Ctrl + M       ${i18n("dyform.help.shortcut.changeComponent")}
  Ctrl + G       ${i18n("dyform.help.shortcut.group")}
  Ctrl + Shift + G   ${i18n("dyform.help.shortcut.unGroup")}
  Alt + ↑        ${i18n("dyform.help.shortcut.moveUp")}
  Alt + ↓        ${i18n("dyform.help.shortcut.moveDown")}
`;
const dynamicFormHelpMessage = (): string => `
${i18n("dyform.help.description")}：StarHorse ${i18n("dyform.help.designerDescription")}
${i18n("dyform.help.rules")}：
${i18n("dyform.help.rule1")}
${i18n("dyform.help.rule2")}
${i18n("dyform.help.steps")}：
${i18n("dyform.help.step1")}
${i18n("dyform.help.step2")}
${i18n("dyform.help.step3")}
${i18n("dyform.help.step4")}
${i18n("dyform.help.step5")}
${i18n("dyform.help.step6")}
${i18n("dyform.help.step7")}
${i18n("dyform.help.blindSpots")}：
${i18n("dyform.help.blindSpot1")}
${i18n("dyform.help.blindSpot2")}
${shortKeyHelpMessage()}
`;
export { formActions, dynamicFormHelpMessage };
