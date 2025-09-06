// Component configuration file
// This file defines the properties for each component in the pageitems directory

export interface ComponentProperty {
  name: string;
  label: string;
  type:
    | "input"
    | "number"
    | "select"
    | "switch"
    | "textarea"
    | "color"
    | "slider"
    | "radio"
    | "checkbox"
    | "date"
    | "time"
    | "json"
    | "code"
    | "apiConfig";
  defaultValue?: any;
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: string | number }>;
  min?: number;
  max?: number;
  step?: number;
  description?: string;
  // For complex properties like chart options
  isComplex?: boolean;
  complexType?: "object" | "array";
  // For chart-specific properties
  chartType?: string;
}

export interface ComponentConfig {
  name: string;
  label: string;
  category: string;
  properties: ComponentProperty[];
}

// Default chart options for different chart types
export const defaultChartOptions: Record<string, any> = {
  line: {
    title: {
      text: "折线图示例",
    },
    tooltip: {
      trigger: "axis",
    },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: "line",
        smooth: true,
      },
    ],
  },
  bar: {
    title: {
      text: "柱状图示例",
    },
    tooltip: {},
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "value",
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: "bar",
      },
    ],
  },
  pie: {
    title: {
      text: "饼图示例",
    },
    tooltip: {
      trigger: "item",
    },
    legend: {
      orient: "vertical",
      left: "left",
    },
    series: [
      {
        name: "访问来源",
        type: "pie",
        radius: "50%",
        data: [
          { value: 1048, name: "搜索引擎" },
          { value: 735, name: "直接访问" },
          { value: 580, name: "邮件营销" },
          { value: 484, name: "联盟广告" },
          { value: 300, name: "视频广告" },
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  },
  radar: {
    title: {
      text: "雷达图示例",
    },
    radar: {
      indicator: [
        { name: "销售", max: 6500 },
        { name: "管理", max: 16000 },
        { name: "信息技术", max: 30000 },
        { name: "客服", max: 38000 },
        { name: "研发", max: 52000 },
        { name: "市场", max: 25000 },
      ],
    },
    series: [
      {
        name: "预算 vs 开销",
        type: "radar",
        data: [
          {
            value: [4200, 3000, 20000, 35000, 50000, 18000],
            name: "预算分配",
          },
          {
            value: [5000, 14000, 28000, 26000, 42000, 21000],
            name: "实际开销",
          },
        ],
      },
    ],
  },
  scatter: {
    title: {
      text: "散点图示例",
    },
    xAxis: {},
    yAxis: {},
    series: [
      {
        symbolSize: 20,
        data: [
          [10.0, 8.04],
          [8.0, 6.95],
          [13.0, 7.58],
          [9.0, 8.81],
          [11.0, 8.33],
          [14.0, 9.96],
          [6.0, 7.24],
          [4.0, 4.26],
          [12.0, 10.84],
          [7.0, 4.82],
          [5.0, 5.68],
        ],
        type: "scatter",
      },
    ],
  },
  funnel: {
    title: {
      text: "漏斗图示例",
    },
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b} : {c}%",
    },
    series: [
      {
        name: "漏斗图",
        type: "funnel",
        left: "10%",
        top: 60,
        bottom: 60,
        width: "80%",
        min: 0,
        max: 100,
        minSize: "0%",
        maxSize: "100%",
        sort: "descending",
        gap: 2,
        label: {
          show: true,
          position: "inside",
        },
        labelLine: {
          length: 10,
          lineStyle: {
            width: 1,
            type: "solid",
          },
        },
        itemStyle: {
          borderColor: "#fff",
          borderWidth: 1,
        },
        emphasis: {
          label: {
            fontSize: 20,
          },
        },
        data: [
          { value: 60, name: "访问" },
          { value: 40, name: "咨询" },
          { value: 20, name: "订单" },
          { value: 80, name: "点击" },
          { value: 100, name: "展现" },
        ],
      },
    ],
  },
  gauge: {
    title: {
      text: "仪表盘示例",
    },
    series: [
      {
        name: "业务指标",
        type: "gauge",
        detail: { formatter: "{value}%" },
        data: [{ value: 50, name: "完成率" }],
      },
    ],
  },
  map: {
    title: {
      text: "热力图示例",
    },
    xAxis: {
      type: "category",
      data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
    },
    yAxis: {
      type: "category",
      data: ["a", "b", "c", "d"],
    },
    visualMap: {
      min: 0,
      max: 10,
      calculable: true,
      orient: "horizontal",
      left: "center",
    },
    series: [
      {
        name: "热度",
        type: "heatmap",
        data: [
          [0, 0, 5],
          [0, 1, 7],
          [0, 2, 3],
          [0, 3, 5],
          [1, 0, 1],
          [1, 1, 2],
          [1, 2, 4],
          [1, 3, 8],
          [2, 0, 2],
          [2, 1, 3],
          [2, 2, 8],
          [2, 3, 6],
          [3, 0, 7],
          [3, 1, 5],
          [3, 2, 3],
          [3, 3, 9],
          [4, 0, 9],
          [4, 1, 2],
          [4, 2, 6],
          [4, 3, 1],
          [5, 0, 4],
          [5, 1, 6],
          [5, 2, 5],
          [5, 3, 3],
          [6, 0, 8],
          [6, 1, 7],
          [6, 2, 4],
          [6, 3, 2],
        ],
        label: {
          show: true,
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  },
};

// Configuration for all page components
export const componentConfigs: Record<string, ComponentConfig> = {
  // Banner Component
  "pbanner-item": {
    name: "pbanner-item",
    label: "轮播图",
    category: "展示组件",
    properties: [
      {
        name: "apiConfig",
        label: "数据API",
        type: "apiConfig",
        defaultValue: {},
        description: "配置轮播图数据的API调用参数",
      },
      {
        name: "banners",
        label: "轮播项",
        type: "json",
        defaultValue: [],
        isComplex: true,
        complexType: "array",
        description: "轮播项配置",
      },
      {
        name: "height",
        label: "高度",
        type: "input",
        defaultValue: "200px",
        placeholder: "例如: 200px",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Calendar Component
  "pcalendar-item": {
    name: "pcalendar-item",
    label: "日历",
    category: "展示组件",
    properties: [
      {
        name: "width",
        label: "宽度",
        type: "input",
        defaultValue: "200px",
        placeholder: "例如: 200px",
      },
      {
        name: "height",
        label: "高度",
        type: "input",
        defaultValue: "200px",
        placeholder: "例如: 200px",
      },
      {
        name: "modelValue",
        label: "当前日期",
        type: "date",
        defaultValue: "",
        description: "绑定值，当前显示的日期",
      },
      {
        name: "range",
        label: "日期范围",
        type: "json",
        defaultValue: [],
        isComplex: true,
        complexType: "array",
        description: "时间范围，包括开始时间和结束时间",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Card Component
  "pcard-item": {
    name: "pcard-item",
    label: "卡片",
    category: "展示组件",
    properties: [
      {
        name: "title",
        label: "标题",
        type: "input",
        defaultValue: "卡片标题",
        placeholder: "请输入卡片标题",
      },
      {
        name: "content",
        label: "内容",
        type: "textarea",
        defaultValue: "卡片内容",
        placeholder: "请输入卡片内容",
      },
      // Card style properties
      {
        name: "bodyStyle",
        label: "内容区域样式",
        type: "json",
        defaultValue: {},
        isComplex: true,
        complexType: "object",
        description: "卡片内容区域的样式对象",
      },
      {
        name: "headerClass",
        label: "头部类名",
        type: "input",
        defaultValue: "",
        placeholder: "自定义头部类名",
      },
      {
        name: "bodyClass",
        label: "内容区域类名",
        type: "input",
        defaultValue: "",
        placeholder: "自定义内容区域类名",
      },
      {
        name: "footerClass",
        label: "底部类名",
        type: "input",
        defaultValue: "",
        placeholder: "自定义底部类名",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Carousel Component
  "pcarousel-item": {
    name: "pcarousel-item",
    label: "走马灯",
    category: "展示组件",
    properties: [
      {
        name: "height",
        label: "高度",
        type: "input",
        defaultValue: "200px",
        placeholder: "例如: 200px",
      },
      {
        name: "autoplay",
        label: "自动播放",
        type: "switch",
        defaultValue: true,
      },
      {
        name: "interval",
        label: "播放间隔(ms)",
        type: "number",
        defaultValue: 3000,
        placeholder: "自动切换的时间间隔",
      },
      {
        name: "indicatorPosition",
        label: "指示器位置",
        type: "select",
        options: [
          { label: "外部", value: "outside" },
          { label: "内部", value: "inside" },
          { label: "隐藏", value: "none" },
        ],
        defaultValue: "outside",
      },
      {
        name: "arrow",
        label: "切换箭头",
        type: "select",
        options: [
          { label: "悬停时显示", value: "hover" },
          { label: "一直显示", value: "always" },
          { label: "隐藏", value: "never" },
        ],
        defaultValue: "hover",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Chart Component
  "pchart-item": {
    name: "pchart-item",
    label: "图表",
    category: "展示组件",
    properties: [
      {
        name: "type",
        label: "图表类型",
        type: "select",
        options: [
          { label: "折线图", value: "line" },
          { label: "柱状图", value: "bar" },
          { label: "饼图", value: "pie" },
          { label: "雷达图", value: "radar" },
          { label: "散点图", value: "scatter" },
          { label: "漏斗图", value: "funnel" },
          { label: "仪表盘", value: "gauge" },
          { label: "热力图", value: "map" },
        ],
        defaultValue: "line",
      },
      {
        name: "option",
        label: "图表配置",
        type: "json",
        defaultValue: defaultChartOptions.line,
        isComplex: true,
        complexType: "object",
        description: "ECharts 图表配置选项",
      },
      {
        name: "apiConfig",
        label: "数据API",
        type: "apiConfig",
        defaultValue: {},
        description: "配置图表数据的API调用参数",
      },
      {
        name: "height",
        label: "高度",
        type: "input",
        defaultValue: "400px",
        placeholder: "例如: 400px",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Content Component
  "pcontent-item": {
    name: "pcontent-item",
    label: "内容",
    category: "展示组件",
    properties: [
      {
        name: "content",
        label: "内容",
        type: "textarea",
        defaultValue: "请输入内容",
        placeholder: "请输入HTML内容",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Copyright Component
  "pcopyright-item": {
    name: "pcopyright-item",
    label: "版权信息",
    category: "展示组件",
    properties: [
      {
        name: "companyName",
        label: "公司名称",
        type: "input",
        defaultValue: "公司名称",
        placeholder: "请输入公司名称",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Image Component
  "pimage-item": {
    name: "pimage-item",
    label: "图片",
    category: "展示组件",
    properties: [
      {
        name: "imageUrl",
        label: "图片地址",
        type: "input",
        defaultValue: "",
        placeholder: "请输入图片URL",
      },
      {
        name: "alt",
        label: "替代文本",
        type: "input",
        defaultValue: "",
        placeholder: "图片加载失败时显示的文本",
      },
      {
        name: "fit",
        label: "适应方式",
        type: "select",
        options: [
          { label: "填充", value: "fill" },
          { label: "包含", value: "contain" },
          { label: "覆盖", value: "cover" },
          { label: "无缩放", value: "none" },
          { label: "缩放", value: "scale-down" },
        ],
        defaultValue: "cover",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Logo Component
  "plogo-item": {
    name: "plogo-item",
    label: "Logo",
    category: "展示组件",
    properties: [
      {
        name: "imageUrl",
        label: "Logo地址",
        type: "input",
        defaultValue: "",
        placeholder: "请输入Logo图片URL",
      },
      {
        name: "companyName",
        label: "公司名称",
        type: "input",
        defaultValue: "公司名称",
        placeholder: "请输入公司名称",
      },
      {
        name: "link",
        label: "链接地址",
        type: "input",
        defaultValue: "",
        placeholder: "点击Logo跳转的链接",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Page Header Component
  "ppageheader-item": {
    name: "ppageheader-item",
    label: "页面头部",
    category: "展示组件",
    properties: [
      {
        name: "content",
        label: "内容",
        type: "textarea",
        defaultValue: "页面头部内容",
        placeholder: "请输入页面头部内容",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Splitter Component
  "psplitter-item": {
    name: "psplitter-item",
    label: "分割面板",
    category: "布局组件",
    properties: [
      {
        name: "direction",
        label: "分割方向",
        type: "select",
        options: [
          { label: "水平", value: "horizontal" },
          { label: "垂直", value: "vertical" },
        ],
        defaultValue: "horizontal",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Statistic Component
  "pstatistic-item": {
    name: "pstatistic-item",
    label: "统计数值",
    category: "展示组件",
    properties: [
      {
        name: "value",
        label: "数值",
        type: "number",
        defaultValue: 0,
      },
      {
        name: "title",
        label: "标题",
        type: "input",
        defaultValue: "标题",
        placeholder: "统计数值的标题",
      },
      {
        name: "zIndex",
        label: "层级",
        type: "number",
        defaultValue: 1,
        placeholder: "组件层级 (z-index)",
        description: "控制组件的堆叠顺序，数值越大越靠前",
      },
    ],
  },

  // Steps Component
  "psteps-item": {
    name: "psteps-item",
    label: "步骤条",
    category: "导航组件",
    properties: [
      {
        name: "steps",
        label: "步骤配置",
        type: "json",
        defaultValue: [
          { title: "步骤1", description: "步骤1描述" },
          { title: "步骤2", description: "步骤2描述" },
          { title: "步骤3", description: "步骤3描述" },
        ],
        isComplex: true,
        complexType: "array",
        description: "步骤配置",
      },
      {
        name: "active",
        label: "当前步骤",
        type: "number",
        defaultValue: 0,
        min: 0,
      },
      {
        name: "alignCenter",
        label: "居中对齐",
        type: "switch",
        defaultValue: true,
      },
      {
        name: "simple",
        label: "简洁模式",
        type: "switch",
        defaultValue: false,
      },
      {
        name: "direction",
        label: "方向",
        type: "select",
        defaultValue: "horizontal",
        options: [
          { label: "水平", value: "horizontal" },
          { label: "垂直", value: "vertical" },
        ],
      },
      {
        name: "space",
        label: "步骤间距",
        type: "input",
        defaultValue: "",
        placeholder: "例如: 100px 或 20%",
        description: "每个步骤的间距，如果不设置则为自适应",
      },
      {
        name: "processStatus",
        label: "处理中状态",
        type: "select",
        defaultValue: "process",
        options: [
          { label: "处理中", value: "process" },
          { label: "成功", value: "success" },
          { label: "错误", value: "error" },
          { label: "警告", value: "warning" },
          { label: "等待", value: "wait" },
        ],
        description: "当前步骤的状态",
      },
      {
        name: "finishStatus",
        label: "完成状态",
        type: "select",
        defaultValue: "finish",
        options: [
          { label: "处理中", value: "process" },
          { label: "成功", value: "success" },
          { label: "错误", value: "error" },
          { label: "警告", value: "warning" },
          { label: "等待", value: "wait" },
        ],
        description: "已完成步骤的状态",
      },
    ],
  },

  // Table Component
  "ptable-item": {
    name: "ptable-item",
    label: "表格",
    category: "数据组件",
    properties: [
      {
        name: "apiConfig",
        label: "数据API",
        type: "apiConfig",
        defaultValue: {},
        description: "配置表格数据的API调用参数",
      },
      {
        name: "columns",
        label: "列配置",
        type: "json",
        defaultValue: [
          { prop: "date", label: "日期", width: "180" },
          { prop: "name", label: "姓名", width: "180" },
          { prop: "address", label: "地址" },
        ],
        isComplex: true,
        complexType: "array",
        description: "表格列配置",
      },
      {
        name: "data",
        label: "数据",
        type: "json",
        defaultValue: [],
        isComplex: true,
        complexType: "array",
        description: "表格数据",
      },
      {
        name: "height",
        label: "高度",
        type: "input",
        defaultValue: "",
        placeholder: "例如: 400px",
      },
      {
        name: "stripe",
        label: "斑马纹",
        type: "switch",
        defaultValue: false,
      },
      {
        name: "border",
        label: "边框",
        type: "switch",
        defaultValue: true,
      },
    ],
  },

  // Timeline Component
  "ptimeline-item": {
    name: "ptimeline-item",
    label: "时间线",
    category: "展示组件",
    properties: [
      {
        name: "apiConfig",
        label: "数据API",
        type: "apiConfig",
        defaultValue: {},
        description: "配置时间线项数据的API调用参数",
      },
      {
        name: "items",
        label: "时间线项",
        type: "json",
        defaultValue: [
          {
            content: "事件开始",
            timestamp: "2018-04-15",
          },
          {
            content: "已批准",
            timestamp: "2018-04-13",
          },
          {
            content: "成功",
            timestamp: "2018-04-11",
          },
        ],
        isComplex: true,
        complexType: "array",
        description: "时间线项配置",
      },
      {
        name: "reverse",
        label: "倒序",
        type: "switch",
        defaultValue: false,
      },
      {
        name: "mode",
        label: "模式",
        type: "select",
        defaultValue: "left",
        options: [
          { label: "左侧", value: "left" },
          { label: "右侧", value: "right" },
          { label: "交替", value: "alternate" },
        ],
      },
    ],
  },
  // Chart Component
  "chart-item": {
    name: "chart-item",
    label: "图表",
    category: "图表组件",
    properties: [
      {
        name: "apiConfig",
        label: "数据API",
        type: "apiConfig",
        defaultValue: {},
        description: "配置图表数据的API调用参数",
      },
      {
        name: "type",
        label: "图表类型",
        type: "select",
        defaultValue: "line",
        options: [
          { label: "折线图", value: "line" },
          { label: "柱状图", value: "bar" },
          { label: "饼图", value: "pie" },
          { label: "雷达图", value: "radar" },
          { label: "散点图", value: "scatter" },
          { label: "漏斗图", value: "funnel" },
          { label: "仪表盘", value: "gauge" },
          { label: "热力图", value: "map" },
        ],
      },
      {
        name: "option",
        label: "图表配置",
        type: "json",
        defaultValue: defaultChartOptions.line,
        isComplex: true,
        complexType: "object",
        description: "ECharts 图表配置选项",
      },
    ],
  },
};
