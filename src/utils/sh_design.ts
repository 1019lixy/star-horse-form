import { Shape } from "@antv/x6";

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
    label: "放大(0.2)",
  },
  {
    icon: "zoom_out",
    defaultEdit: true,
    key: "zoomOut",
    label: "缩小(-0.2)",
  },
  {
    icon: "auto_fit",
    defaultEdit: true,
    key: "zoomToFit",
    label: "自适应",
  },
  {
    icon: "equal",
    defaultEdit: true,
    key: "zoomTo",
    label: "1:1大小",
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
    label: "向上对齐",
  },
  {
    icon: "align_bottom",
    key: "alignBottom",
    label: "向下对齐",
  },
  {
    icon: "align_left",
    key: "alignLeft",
    label: "向左对齐",
  },
  {
    icon: "align_right",
    key: "alignRight",
    label: "向右对齐",
  },
  {
    icon: "center",
    key: "centerContent",
    label: "居中",
  },
  {
    icon: "dustbin",
    key: "deleteItem",
    label: "删除元素",
  },
  {
    icon: "empty_setting",
    key: "empty",
    label: "清空画布",
  },
  {
    icon: "undo",
    key: "unDo",
    label: "后退一步",
  },
  {
    icon: "redo",
    key: "reDo",
    label: "前进一步",
  },
  {
    icon: "json_file",
    key: "json",
    label: "JSON数据",
  },
  {
    icon: "config",
    key: "config",
    label: "配置",
  },
  {
    icon: "valid",
    key: "valid",
    label: "校验",
  },
  {
    icon: "preview",
    key: "preview",
    label: "预览",
  },
  {
    icon: "save",
    key: "save",
    label: "保存",
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
/**
 * 画布配置参数
 * @type {{rotating: boolean, keyboard: boolean, grid: {args: [{color: string, thickness: number},{color: string, thickness: number, factor: number}], visible: boolean, type: string}, mousewheel: {zoomAtMousePosition: boolean, maxScale: number, minScale: number, modifiers: string, enabled: boolean}, snapline: boolean, highlighting: {magnetAdsorbed: {args: {attrs: {fill: string, stroke: string}}, name: string}}, connecting: {allowBlank: boolean, router: {args: {padding: number}, name: string}, connector: {args: {radius: number}, name: string}, anchor: string, connectionPoint: string, createEdge(): Edge<Properties>, snap: {radius: number}, validateConnection({targetMagnet: *}): *}, clipboard: boolean, selecting: {showNodeSelectionBox: boolean, rubberband: boolean, enabled: boolean}}}
 */
const commonConfig = {
  rotating: true,
  snapline: true,
  keyboard: true,
  clipboard: true,
  minimap: true,
  resizing: true,
  panning: {
    enabled: true,
    modifiers: ["alt"],
  },
  grid: {
    visible: true,
    type: "doubleMesh",
    args: [
      {
        color: "#eee", // 主网格线颜色
        thickness: 1, // 主网格线宽度
      },
      {
        color: "#ddd", // 次网格线颜色
        thickness: 1, // 次网格线宽度
        factor: 4, // 主次网格线间隔
      },
    ],
  },
  scroller: {
    enabled: true,
    pannable: true,
    pageVisible: true,
    pageBreak: false,
  },
  mousewheel: {
    enabled: true,
    zoomAtMousePosition: true,
    modifiers: "ctrl",
    maxScale: 4,
    minScale: 0.2,
  },
};
const configInfo: any = {
  ...commonConfig,
  selecting: {
    enabled: true,
    rubberband: true,
    showNodeSelectionBox: true,
  },
  highlighting: {
    // 当连接桩可以被链接时，在连接桩外围渲染一个 2px 宽的红色矩形框
    magnetAdsorbed: {
      name: "stroke",
      args: {
        attrs: {
          stroke: "#5F95FF",
        },
      },
    },
  },
  connecting: {
    router: {
      name: "er",
      args: {
        offset: 25,
        direction: "H",
      },
    },
    connector: {
      name: "rounded",
      args: {
        radius: 8,
      },
    },
    // anchor: 'center',
    // connectionPoint: 'anchor',
    allowBlank: false,
    highlight: true,
    snap: {
      //距离20px 自动吸附
      radius: 20,
    },
    createEdge: () => {
      return new Shape.Edge({
        // defaultLabel: "OK", //添加此属性再动态设置Label 报错
        tools: [
          {
            name: "edge-editor",
            args: {
              attrs: {
                backgroundColor: "var(--star-horse-front-color)",
              },
            },
          },
        ],
        attrs: {
          line: {
            stroke: "var(--star-horse-style)",
            strokeWidth: 2,
            targetMarker: {
              name: "block",
              width: 12,
              height: 8,
            },
          },
        },
        zIndex: 0,
      });
    },
  },
};
const tableConfigInfo = {
  ...commonConfig,
  connecting: {
    router: {
      name: "er",
      args: {
        offset: 25,
        direction: "H",
      },
    },
    allowBlank: false,
    highlight: true,
    createEdge: () => {
      return new Shape.Edge({
        attrs: {
          line: {
            stroke: "#A2B1C3",
            strokeWidth: 2,
          },
        },
        zIndex: 0,
      });
    },
  },
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
export { commands, ports, configInfo, helpMessage, tableConfigInfo };
