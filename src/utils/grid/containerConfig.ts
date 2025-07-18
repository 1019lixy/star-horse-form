import { PageFieldInfo } from "star-horse-lowcode";

export const gridContainerConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: "display",
      label: "显示模式",
      helpMsg: "定义容器的布局类型，例如 grid 或 block。",
      type: "select",
      formVisible: true,
      defaultValue: "grid",
      preps: {
        icon: "",
        values: [
          { name: "网格布局", value: "grid" },
          { name: "块布局", value: "block" },
        ],
      },
    },
    {
      fieldName: "gridTemplateColumns",
      label: "网格列定义",
      helpMsg: "指定网格的列结构，包含尺寸和单位",
      type: "input",
      formVisible: true,
      defaultValue: "1fr 1fr",
      preps: {
        icon: "",
        appendList: [
          { name: "FR", value: "fr" },
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "gridTemplateRows",
      label: "网格行定义",
      helpMsg: "指定网格的行结构，包含尺寸和单位",
      type: "input",
      formVisible: true,
      defaultValue: "1fr 1fr",
      preps: {
        icon: "",
        appendList: [
          { name: "FR", value: "fr" },
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "gap",
      label: "间距",
      helpMsg: "定义网格行与列之间的间距",
      type: "input",
      formVisible: true,
      defaultValue: "10px 10px",
      preps: {
        icon: "",
        appendList: [
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "rowGap",
      label: "行间距",
      type: "input",
      formVisible: true,
      preps: {
        icon: "",
        appendList: [
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "columnGap",
      label: "列间距",
      type: "input",
      formVisible: true,
      preps: {
        icon: "",
        appendList: [
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },

    {
      fieldName: "justifyItems",
      label: "单元格水平对齐",
      helpMsg: "控制网格单元格内项目的水平对齐方式",
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: "拉伸", value: "stretch" },
          { name: "起始对齐", value: "start" },
          { name: "居中", value: "center" },
          { name: "末尾对齐", value: "end" },
        ],
      },
    },
    {
      fieldName: "alignItems",
      label: "单元格垂直对齐",
      helpMsg: "控制网格单元格内项目的垂直对齐方式",
      type: "select",
      formVisible: true,
      defaultValue: "stretch",
      preps: {
        icon: "",
        values: [
          { name: "拉伸", value: "stretch" },
          { name: "起始对齐", value: "start" },
          { name: "居中", value: "center" },
          { name: "末尾对齐", value: "end" },
        ],
      },
    },
    {
      fieldName: "justifyContent",
      label: "主轴分布",
      helpMsg: "控制项目在容器内的水平分布方式",
      type: "select",
      formVisible: true,
      defaultValue: "start",
      preps: {
        icon: "",
        values: [
          { name: "起始对齐", value: "start" },
          { name: "居中", value: "center" },
          { name: "末尾对齐", value: "end" },
          { name: "环绕间隔", value: "space-around" },
          { name: "两端对齐", value: "space-between" },
          { name: "均匀间隔", value: "space-evenly" },
        ],
      },
    },
    {
      fieldName: "alignContent",
      label: "交叉轴分布",
      helpMsg: "控制项目在容器内的垂直分布方式",
      type: "select",
      formVisible: true,
      defaultValue: "start",
      preps: {
        icon: "",
        values: [
          { name: "起始对齐", value: "start" },
          { name: "居中", value: "center" },
          { name: "末尾对齐", value: "end" },
          { name: "环绕间隔", value: "space-around" },
          { name: "两端对齐", value: "space-between" },
          { name: "均匀间隔", value: "space-evenly" },
        ],
      },
    },
    {
      fieldName: "gridAutoColumns",
      label: "自动列宽",
      helpMsg: "定义网格自动生成列的默认宽度",
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          { name: "自动", value: "auto" },
          { name: "FR", value: "fr" },
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "gridAutoRows",
      label: "自动行高",
      helpMsg: "定义网格自动生成行的默认高度",
      type: "input",
      formVisible: true,
      defaultValue: "auto",
      preps: {
        icon: "",
        appendList: [
          { name: "自动", value: "auto" },
          { name: "FR", value: "fr" },
          { name: "像素", value: "px" },
          { name: "百分百", value: "%" },
        ],
      },
    },
    {
      fieldName: "gridAutoFlow",
      label: "自动排列",
      helpMsg: "控制项目在网格中的自动排列方式",
      type: "select",
      formVisible: true,
      defaultValue: "row",
      preps: {
        icon: "",
        values: [
          { name: "行优先", value: "row" },
          { name: "列优先", value: "column" },
          { name: "行紧凑", value: "row dense" },
          { name: "列紧凑", value: "column dense" },
        ],
      },
    },
  ],
};
