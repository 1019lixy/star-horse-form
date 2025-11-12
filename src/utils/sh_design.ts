import { i18n } from "@/lang";
import { SelectOption } from "star-horse-lowcode";

const unitList: SelectOption[] = [
  {
    name: "px",
    value: "px",
  },
  {
    name: "fr",
    value: "fr",
  },
  {
    name: "%",
    value: "%",
  },
  {
    name: "vw",
    value: "vw",
  },
  {
    name: "vh",
    value: "vh",
  },
  {
    name: "em",
    value: "em",
  },
  {
    name: "rem",
    value: "rem",
  },
  {
    name: "pt",
    value: "pt",
  },
  {
    name: "cm",
    value: "cm",
  },
  {
    name: "auto",
    value: "auto",
  },
];
const commands: any = [
  /* {
          icon: "left_panel",
          defaultEdit: true,
          key: "leftPanel",
          label: "左侧工具栏"
      },*/
  {
    icon: "zoom_in",
    defaultEdit: true,
    key: "zoomIn",
    label: i18n("system.flex.starHorseDesign.command.zoomIn"),
  },
  {
    icon: "zoom_out",
    defaultEdit: true,
    key: "zoomOut",
    label: i18n("system.flex.starHorseDesign.command.zoomOut"),
  },
  {
    icon: "auto_fit",
    defaultEdit: true,
    key: "zoomToFit",
    label: i18n("system.flex.starHorseDesign.command.zoomToFit"),
  },
  {
    icon: "equal",
    defaultEdit: true,
    key: "zoomTo",
    label: i18n("system.flex.starHorseDesign.command.zoomTo"),
  },
  /*  {
              icon: "line_arrow",
              key: 'lineMode',
              label: '直线连接模式',
          },
          {
              icon: "vertical_arrow",
              key: 'verticalMode',
              label: '直角连接模式',
          },*/
  {
    icon: "align_top",
    key: "alignTop",
    label: i18n("system.flex.starHorseDesign.command.alignTop"),
  },
  {
    icon: "align_bottom",
    key: "alignBottom",
    label: i18n("system.flex.starHorseDesign.command.alignBottom"),
  },
  {
    icon: "align_left",
    key: "alignLeft",
    label: i18n("system.flex.starHorseDesign.command.alignLeft"),
  },
  {
    icon: "align_right",
    key: "alignRight",
    label: i18n("system.flex.starHorseDesign.command.alignRight"),
  },
  {
    icon: "center",
    key: "centerContent",
    label: i18n("system.flex.starHorseDesign.command.centerContent"),
  },
  {
    icon: "dustbin",
    key: "deleteItem",
    label: i18n("system.flex.starHorseDesign.command.deleteItem"),
  },
  {
    icon: "empty_setting",
    key: "empty",
    label: i18n("system.flex.starHorseDesign.command.empty"),
  },
  {
    icon: "undo",
    key: "unDo",
    label: i18n("system.flex.starHorseDesign.command.unDo"),
  },
  {
    icon: "redo",
    key: "reDo",
    label: i18n("system.flex.starHorseDesign.command.reDo"),
  },
  {
    icon: "json_file",
    key: "json",
    label: i18n("system.flex.starHorseDesign.command.json"),
  },
  {
    icon: "config",
    key: "config",
    label: i18n("system.flex.starHorseDesign.command.config"),
  },
  {
    icon: "valid",
    key: "valid",
    label: i18n("system.flex.starHorseDesign.command.valid"),
  },
  {
    icon: "preview",
    key: "preview",
    label: i18n("system.flex.starHorseDesign.command.preview"),
  },
  {
    icon: "save",
    key: "save",
    label: i18n("system.flex.starHorseDesign.command.save"),
  },
  /*{
            icon: "right_panel",
            defaultEdit: true,
            key: 'rightPanel',
            label: '右侧属性栏',
        },*/
];
/**
 * 打桩参数
 * @type {{groups: {top: {position: string, attrs: {circle: {strokeWidth: number, r: number, style: {visibility: string}, fill: string, magnet: boolean, stroke: string}}}, left: {position: string, attrs: {circle: {strokeWidth: number, r: number, style: {visibility: string}, fill: string, magnet: boolean, stroke: string}}}, bottom: {position: string, attrs: {circle: {strokeWidth: number, r: number, style: {visibility: string}, fill: string, magnet: boolean, stroke: string}}}, right: {position: string, attrs: {circle: {strokeWidth: number, r: number, style: {visibility: string}, fill: string, magnet: boolean, stroke: string}}}}, items: [{group: string},{group: string},{group: string},{group: string}]}}
 */
const ports = {
  groups: {
    top: {
      position: "top",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "var(--star-horse-style)",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    right: {
      position: "right",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "var(--star-horse-style)",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    bottom: {
      position: "bottom",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "var(--star-horse-style)",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
    left: {
      position: "left",
      attrs: {
        circle: {
          r: 4,
          magnet: true,
          stroke: "var(--star-horse-style)",
          strokeWidth: 1,
          fill: "#fff",
          style: {
            visibility: "hidden",
          },
        },
      },
    },
  },
  items: [
    {
      group: "top",
    },
    {
      group: "right",
    },
    {
      group: "bottom",
    },
    {
      group: "left",
    },
  ],
};

const helpMessage = `
一、操作步骤:
1、编辑其打开后可将左边的组件拖到中间网格画布区域；
2、鼠标移动组件上会出现四个圆圈，移动到圆圈上鼠标会
  变成实心的十字，按下鼠标左键拖动会出现连线，连线可
  链接到其他组件的圆圈上；
3、单击组件或者连线选中该都组件或者连线；
4、在空白区域按下鼠标左键并拖动可框选组件；
5、双击组件或者连线可编辑属性。
二、快捷键:
Alt+鼠标左键：拖动画布；
Ctrl+C:复制；
Ctrl+X:剪切；
Ctrl+V:粘贴；
Ctrl+Z:后退一步；
Ctrl+Shift+Z:向前一步；
Ctrl+A:全选；
Ctrl+1:放大；
Ctrl+2:缩小；
Backspace/Delete:删除组件或者连线。
`;

const getTranslatedHelpMessage = () => `
一、${i18n("system.flex.shDesign.help.title.steps")}:
1、${i18n("system.flex.shDesign.help.step1")}
2、${i18n("system.flex.shDesign.help.step2")}
3、${i18n("system.flex.shDesign.help.step3")}
4、${i18n("system.flex.shDesign.help.step4")}
5、${i18n("system.flex.shDesign.help.step5")}
二、${i18n("system.flex.shDesign.help.title.shortcuts")}:
Alt+鼠标左键：${i18n("system.flex.shDesign.help.shortcut.dragCanvas")}
Ctrl+C:${i18n("system.flex.shDesign.help.shortcut.copy")}
Ctrl+X:${i18n("system.flex.shDesign.help.shortcut.cut")}
Ctrl+V:${i18n("system.flex.shDesign.help.shortcut.paste")}
Ctrl+Z:${i18n("system.flex.shDesign.help.shortcut.undo")}
Ctrl+Shift+Z:${i18n("system.flex.shDesign.help.shortcut.redo")}
Ctrl+A:${i18n("system.flex.shDesign.help.shortcut.selectAll")}
Ctrl+1:${i18n("system.flex.shDesign.help.shortcut.zoomIn")}
Ctrl+2:${i18n("system.flex.shDesign.help.shortcut.zoomOut")}
Backspace/Delete:${i18n("system.flex.shDesign.help.shortcut.delete")}
`;
export { commands, ports, helpMessage, unitList, getTranslatedHelpMessage };
