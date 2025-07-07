import { PageFieldInfo } from "star-horse-lowcode";
export const gridItemsConfig: PageFieldInfo = {
   fieldList: [
      {
         fieldName: "gridColumn",
         label: "网格列",
         helpMsg: "定义元素在网格中的起始和结束列",
         type: "number-range",
         formVisible:true,
         defaultValue: "0 / 0",
         preps: {
            icon: "",
            maxName: "gridColumnEnd",
            minName: "gridColumnStart",
            splitName: "/"
         }
      },
      {
         fieldName: "gridRow",
         label: "网格行",
         helpMsg: "定义元素在网格中的起始和结束行",
         type: "number-range",
         formVisible:true,
         defaultValue: "0 / 0",
         preps: {
            icon: "",
            maxName: "gridRowEnd",
            minName: "gridRowStart",
            splitName: "/"
         }
      },
      {
         fieldName: "justifySelf",
         label: "水平自对齐",
         helpMsg: "控制元素在网格容器内的水平对齐方式",
         type: "select",
         formVisible:true,
         defaultValue: "stretch",
         preps: {
            icon: "",
            values: [{ name: "拉伸", value: "stretch" },
            { name: "起始对齐", value: "start" },
            { name: "居中", value: "center" },
            { name: "末尾对齐", value: "end" }]
         }
      },
      {
         fieldName: "alignSelf",
         label: "垂直自对齐",
         helpMsg: "控制元素在网格容器内的垂直对齐方式",
         type: "select",
         formVisible:true,
         defaultValue: "stretch",
         preps: {
            icon: "",
            values: [{ name: "拉伸", value: "stretch" },
            { name: "起始对齐", value: "start" },
            { name: "居中", value: "center" },
            { name: "末尾对齐", value: "end" }]
         }
      },
      {
         fieldName: "width",
         label: "宽度",
         helpMsg: "指定元素宽度，包含单位选项",
         type: "input",
         formVisible:true,
         defaultValue: "auto",
         preps: {
            icon: "",
            appendList: [{
               name: "px",
               value: "px"
            }, {
               name: "%",
               value: "%"
            }, { name: "auto", value: "auto" }]
         }
      },
      {
         fieldName: "height",
         label: "高度",
         helpMsg: "指定元素高度，包含单位选项",
         type: "input",
         formVisible:true,
         defaultValue: "auto",
         preps: {
            icon: "",
            appendList: [{
               name: "px",
               value: "px"
            }, {
               name: "%",
               value: "%"
            }, { name: "auto", value: "auto" }]
         }
      },
   ]
};