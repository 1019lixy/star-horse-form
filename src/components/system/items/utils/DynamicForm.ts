import { i18n } from "@/lang/index.js";
import { ToolBtnType } from "@/components/types/ToolBtnType.js";

const formActions = (): Array<ToolBtnType> => [
  // 文件组（下拉）：新建 / 导入 / 导出 / 生成代码
  {
    icon: "folder",
    defaultEdit: true,
    key: "file",
    auth: "none",
    label: i18n("dyform.toolbar.file"),
    children: [
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
        shortcut: "Ctrl+I",
      },
      {
        icon: "export",
        key: "export",
        auth: "none",
        label: i18n("dyform.action.export"),
        shortcut: "Ctrl+Shift+E",
      },
      {
        icon: "code",
        key: "code",
        auth: "none",
        label: i18n("dyform.action.code"),
        shortcut: "Ctrl+Shift+C",
      },
    ],
  },
  // 编辑组（下拉）：修改属性 / 清空元素
  {
    icon: "edit",
    defaultEdit: true,
    key: "editGroup",
    auth: "none",
    label: i18n("dyform.toolbar.editGroup"),
    children: [
      {
        icon: "edit",
        key: "eprep",
        auth: "none",
        label: i18n("dyform.action.edit"),
        shortcut: "Ctrl+E",
      },
      {
        icon: "empty_setting",
        key: "empty",
        auth: "none",
        label: i18n("dyform.action.empty"),
        shortcut: "Ctrl+Shift+D",
      },
    ],
  },
  // 历史组（平铺）：撤销 / 重做 —— 高频操作，不收进下拉
  {
    icon: "",
    key: "history",
    auth: "none",
    label: i18n("dyform.toolbar.history"),
    flat: true,
    children: [
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
    ],
  },
  // 风格组（下拉）：PC / Pad / Phone
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
        shortcut: "Alt+1",
      },
      {
        icon: "pad",
        defaultEdit: true,
        key: "pad",
        auth: "none",
        label: i18n("dyform.action.pad"),
        shortcut: "Alt+2",
      },
      {
        icon: "phone",
        defaultEdit: true,
        key: "phone",
        auth: "none",
        label: i18n("dyform.action.phone"),
        shortcut: "Alt+3",
      },
    ],
  },
  // 校验（平铺）
  {
    icon: "valid",
    key: "valid",
    auth: "none",
    label: i18n("dyform.action.valid"),
    shortcut: "Ctrl+Shift+V",
  },
  // 预览（平铺）
  {
    icon: "preview",
    key: "preview",
    auth: "none",
    label: i18n("dyform.action.preview"),
    shortcut: "Ctrl+P",
  },
  // 保存（平铺）
  {
    icon: "save",
    key: "save",
    auth: "none",
    label: i18n("dyform.action.save"),
    shortcut: "Ctrl+S",
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
  Ctrl + E       ${i18n("dyform.action.edit")}

【${i18n("dyform.help.category.file")}】
  Ctrl + N       ${i18n("dyform.help.shortcut.new")}
  Ctrl + S       ${i18n("dyform.help.shortcut.save")}
  Ctrl + O       ${i18n("dyform.help.shortcut.open")}
  Ctrl + I       ${i18n("dyform.action.import")}
  Ctrl + Shift + E   ${i18n("dyform.action.export")}
  Ctrl + Shift + C   ${i18n("dyform.action.code")}

【${i18n("dyform.help.category.view")}】
  Ctrl + B       ${i18n("dyform.help.shortcut.toggleLeftPanel")}
  Ctrl + J       ${i18n("dyform.help.shortcut.toggleRightPanel")}
  Ctrl + P       ${i18n("dyform.help.shortcut.preview")}
  Ctrl + Shift + V   ${i18n("dyform.help.shortcut.validate")}
  Ctrl + F       ${i18n("dyform.help.shortcut.find")}
  Alt + ←        ${i18n("dyform.help.shortcut.goBack")}
  Alt + 1        ${i18n("dyform.action.pc")}
  Alt + 2        ${i18n("dyform.action.pad")}
  Alt + 3        ${i18n("dyform.action.phone")}

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
