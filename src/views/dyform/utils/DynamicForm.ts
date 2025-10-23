import { i18n } from "@/lang";

const formActions: Array<any> = [
  /* {
        icon: "left_panel",
        defaultEdit: true,
        key: "leftPanel",
        auth: "none",
        label: i18n("dyform.action.leftPanel")
    },*/
  {
    icon: "return",
    defaultEdit: true,
    key: "goBack",
    auth: "none",
    label: i18n("dyform.action.goBack"),
  },
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
  },
  {
    icon: "undo",
    key: "undo",
    auth: "none",
    label: i18n("dyform.action.undo"),
  },
  {
    icon: "redo",
    key: "redo",
    auth: "none",
    label: i18n("dyform.action.redo"),
  },
  {
    icon: "valid",
    key: "valid",
    auth: "none",
    label: i18n("dyform.action.valid"),
  },
  {
    icon: "preview",
    key: "preview",
    auth: "none",
    label: i18n("dyform.action.preview"),
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
    auth: "add",
    label: i18n("dyform.action.save"),
  },
  /* {
        icon: "right_panel",
        defaultEdit: true,
        key: "rightPanel",
        auth: "none",
        label: i18n("dyform.action.rightPanel")
    }*/
];
const shortKeyHelpMessage = `
${i18n("dyform.help.shortcuts")}：
  1、Ctrl +Alt+ X ${i18n("dyform.help.shortcut.cut")}；
  2、Ctrl +Alt+ C ${i18n("dyform.help.shortcut.copy")}；
  3、Ctrl +Alt+ V ${i18n("dyform.help.shortcut.paste")}；
  4、Ctrl + Z ${i18n("dyform.help.shortcut.undo")}；
  5、Ctrl + Y ${i18n("dyform.help.shortcut.redo")}；
  6、Alt + V ${i18n("dyform.help.shortcut.validate")}；
  7、Ctrl + Alt + N ${i18n("dyform.help.shortcut.new")}；
  8、Ctrl + Alt + S ${i18n("dyform.help.shortcut.save")}；
  9、Ctrl + D ${i18n("dyform.help.shortcut.delete")}；
  10、Ctrl + A ${i18n("dyform.help.shortcut.selectAll")}（${i18n("dyform.help.notImplemented")}）；
  11、Ctrl + Alt + D ${i18n("dyform.help.shortcut.clear")}；
  12、Ctrl + F ${i18n("dyform.help.shortcut.find")}（${i18n("dyform.help.notImplemented")}）；
  13、Alt + 1 ${i18n("dyform.help.shortcut.toggleLeftPanel")}；
  14、Alt + 2 ${i18n("dyform.help.shortcut.toggleRightPanel")}；
  15、Ctrl + Alt + M ${i18n("dyform.help.shortcut.changeComponent")}；
  16、Alt + P ${i18n("dyform.help.shortcut.preview")}；
  17、Ctrl + R ${i18n("dyform.help.shortcut.goBack")}；
  18、PgUp ${i18n("dyform.help.shortcut.moveUp")}；
  19、PgDn ${i18n("dyform.help.shortcut.moveDown")}；
  ${i18n("dyform.help.moreShortcuts")}
`;
const dynamicFormHelpMessage = `
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
${shortKeyHelpMessage}
`;
export { formActions, dynamicFormHelpMessage };
