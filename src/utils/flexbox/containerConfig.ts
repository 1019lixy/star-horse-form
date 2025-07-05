import { PageFieldInfo } from "star-horse-lowcode";

export const flexBoxContainerConfig: PageFieldInfo = {
   fieldList: [
      {
         fieldName: "display",
         label: "显示模式",
         formVisible:true,
         helpMsg: "定义布局类型，例如 flex 或 block。",
         type: "select",
         defaultValue: "flex",
         preps: {
            icon: "",
            values: [{ name: "弹性布局", value: "flex" },
            { name: "块布局", value: "block" }]
         }
      },
      {
         fieldName: "flex-direction",
         label: "排列方向",
         formVisible:true,
         helpMsg: "指定项目布局的主轴方向。",
         type: "select",
         defaultValue: "row",
         preps: {
            icon: "",
            values: [{ name: "行排列", value: "row" },
            { name: "列排列", value: "column" },
            { name: "反向行", value: "row-reverse" },
            { name: "反向列", value: "column-reverse" }]
         }
      },
      {
         fieldName: "flex-wrap",
         label: "换行方式",
         formVisible:true,
         helpMsg: "决定项目是否换行或多行排列。",
         type: "select",
         defaultValue: "nowrap",
         preps: {
            icon: "",
            values: [{ name: "不换行", value: "nowrap" },
            { name: "自动换行", value: "wrap" },  // 修正原值错误：flex-wrap改为wrap
            { name: "反向换行", value: "wrap-reverse" }]
         }
      },
      {
         fieldName: "justify-content",
         label: "主轴对齐",
         formVisible:true,
         helpMsg: "沿主轴对齐项目，控制水平间距。",
         type: "select",
         defaultValue: "start",
         preps: {
            icon: "",
            values: [{ name: "起始对齐", value: "start" },
            { name: "弹性起始", value: "flex-start" },
            { name: "居中", value: "center" },
            { name: "弹性末尾", value: "flex-end" },
            { name: "末尾对齐", value: "end" },
            { name: "两端对齐", value: "space-between" },
            { name: "环绕间隔", value: "space-around" },
            { name: "均匀间隔", value: "space-evenly" }]
         }
      },
      {
         fieldName: "align-items",
         label: "交叉轴对齐",
         formVisible:true,
         helpMsg: "沿交叉轴对齐项目，影响垂直排列。",
         type: "select",
         defaultValue: "stretch",
         preps: {
            icon: "",
            values: [{ name: "拉伸", value: "stretch" },
            { name: "居中", value: "center" },
            { name: "末尾对齐", value: "end" },
            { name: "基线对齐", value: "baseline" },
            { name: "起始对齐", value: "start" }]
         }
      },
      {
         fieldName: "align-content",
         label: "多行对齐",
         formVisible:true,
         helpMsg: "定义换行时弹性线之间的间距。",
         type: "select",
         defaultValue: "stretch",
         preps: {
            icon: "",
            values: [{ name: "拉伸", value: "stretch" },
            { name: "起始对齐", value: "start" },
            { name: "居中", value: "center" },
            { name: "末尾对齐", value: "end" },
            { name: "两端对齐", value: "space-between" },
            { name: "环绕间隔", value: "space-around" }]
         }
      },
      {
         fieldName: "gap",
         label: "间距",
         formVisible:true,
         helpMsg: "指定容器内弹性项目之间的间距。",
         type: "input",
         defaultValue: "20px",
         preps: {
            icon: "",
            appendList: [{
               name: "像素",
               value: "px"
            }, {
               name: "百分比",
               value: "%"
            }]
         }
      },
   ]
};
