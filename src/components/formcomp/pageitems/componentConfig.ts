// Component configuration file
// This file defines the properties for each component in the pageitems directory

export interface ComponentProperty {
  name: string;
  label: string;
  type: 'input' | 'number' | 'select' | 'switch' | 'textarea' | 'color' | 'slider' | 'radio' | 'checkbox' | 'date' | 'time' | 'json' | 'code' | 'apiConfig';
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
  complexType?: 'object' | 'array';
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
      text: '折线图示例'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'line',
      smooth: true
    }]
  },
  bar: {
    title: {
      text: '柱状图示例'
    },
    tooltip: {},
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: [120, 200, 150, 80, 70, 110, 130],
      type: 'bar'
    }]
  },
  pie: {
    title: {
      text: '饼图示例'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '访问来源',
      type: 'pie',
      radius: '50%',
      data: [
        { value: 1048, name: '搜索引擎' },
        { value: 735, name: '直接访问' },
        { value: 580, name: '邮件营销' },
        { value: 484, name: '联盟广告' },
        { value: 300, name: '视频广告' }
      ],
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  },
  radar: {
    title: {
      text: '雷达图示例'
    },
    radar: {
      indicator: [
        { name: '销售', max: 6500 },
        { name: '管理', max: 16000 },
        { name: '信息技术', max: 30000 },
        { name: '客服', max: 38000 },
        { name: '研发', max: 52000 },
        { name: '市场', max: 25000 }
      ]
    },
    series: [{
      name: '预算 vs 开销',
      type: 'radar',
      data: [
        {
          value: [4200, 3000, 20000, 35000, 50000, 18000],
          name: '预算分配'
        },
        {
          value: [5000, 14000, 28000, 26000, 42000, 21000],
          name: '实际开销'
        }
      ]
    }]
  }
};

// Configuration for all page components
export const componentConfigs: Record<string, ComponentConfig> = {
  // Banner Component
  'pbanner-item': {
    name: 'pbanner-item',
    label: '轮播图',
    category: '展示组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置轮播图数据的API调用参数'
      },
      {
        name: 'banners',
        label: '轮播项',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '轮播项配置'
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        defaultValue: '200px',
        placeholder: '例如: 200px'
      }
    ]
  },
  
  // Calendar Component
  'pcalendar-item': {
    name: 'pcalendar-item',
    label: '日历',
    category: '展示组件',
    properties: [
      {
        name: 'width',
        label: '宽度',
        type: 'input',
        defaultValue: '200px',
        placeholder: '例如: 200px'
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        defaultValue: '200px',
        placeholder: '例如: 200px'
      }
    ]
  },
  
  // Card Component
  'pcard-item': {
    name: 'pcard-item',
    label: '卡片',
    category: '容器组件',
    properties: [
      {
        name: 'title',
        label: '标题',
        type: 'input',
        defaultValue: '卡片标题',
        placeholder: '请输入卡片标题'
      },
      {
        name: 'content',
        label: '内容',
        type: 'textarea',
        defaultValue: '卡片内容',
        placeholder: '请输入卡片内容'
      },
      {
        name: 'imageUrl',
        label: '图片地址',
        type: 'input',
        placeholder: '请输入图片URL'
      },
      {
        name: 'shadow',
        label: '阴影效果',
        type: 'select',
        defaultValue: 'hover',
        options: [
          { label: '始终显示', value: 'always' },
          { label: '悬停显示', value: 'hover' },
          { label: '从不显示', value: 'never' }
        ]
      }
    ]
  },
  
  // Card Component
  'pcard-item': {
    name: 'pcard-item',
    label: '卡片',
    category: '容器组件',
    properties: [
      {
        name: 'title',
        label: '标题',
        type: 'input',
        defaultValue: '卡片标题',
        placeholder: '请输入卡片标题'
      },
      {
        name: 'content',
        label: '内容',
        type: 'textarea',
        defaultValue: '卡片内容',
        placeholder: '请输入卡片内容'
      },
      {
        name: 'imageUrl',
        label: '图片地址',
        type: 'input',
        placeholder: '请输入图片URL'
      },
      {
        name: 'shadow',
        label: '阴影效果',
        type: 'select',
        defaultValue: 'hover',
        options: [
          { label: '始终显示', value: 'always' },
          { label: '悬停显示', value: 'hover' },
          { label: '从不显示', value: 'never' }
        ]
      }
    ]
  },
  
  // Carousel Component
  'pcarousel-item': {
    name: 'pcarousel-item',
    label: '走马灯',
    category: '展示组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置轮播项数据的API调用参数'
      },
      {
        name: 'items',
        label: '轮播项',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '轮播项配置'
      },
      {
        name: 'interval',
        label: '播放间隔(毫秒)',
        type: 'number',
        defaultValue: 4000,
        min: 1000,
        max: 10000,
        step: 500
      },
      {
        name: 'type',
        label: '类型',
        type: 'select',
        defaultValue: 'card',
        options: [
          { label: '默认', value: 'default' },
          { label: '卡片', value: 'card' }
        ]
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        defaultValue: '200px',
        placeholder: '例如: 200px'
      }
    ]
  },
  
  // Content Component
  'pcontent-item': {
    name: 'pcontent-item',
    label: '内容展示',
    category: '展示组件',
    properties: [
      {
        name: 'content',
        label: '内容',
        type: 'textarea',
        placeholder: '请输入展示内容'
      }
    ]
  },
  
  // Copyright Component
  'pcopyright-item': {
    name: 'pcopyright-item',
    label: '版权信息',
    category: '展示组件',
    properties: [
      {
        name: 'copyright',
        label: '版权文本',
        type: 'input',
        placeholder: '请输入版权信息'
      },
      {
        name: 'companyName',
        label: '公司名称',
        type: 'input',
        defaultValue: '公司名称',
        placeholder: '请输入公司名称'
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#000000'
      },
      {
        name: 'textColor',
        label: '文字颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        defaultValue: '30px',
        placeholder: '例如: 30px'
      }
    ]
  },
  
  // Form Component
  'pform-item': {
    name: 'pform-item',
    label: '表单',
    category: '表单组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置表单字段数据的API调用参数'
      },
      {
        name: 'fields',
        label: '表单字段',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '表单字段配置'
      },
      {
        name: 'labelPosition',
        label: '标签位置',
        type: 'select',
        defaultValue: 'right',
        options: [
          { label: '左侧', value: 'left' },
          { label: '顶部', value: 'top' },
          { label: '右侧', value: 'right' }
        ]
      },
      {
        name: 'labelWidth',
        label: '标签宽度',
        type: 'input',
        defaultValue: '100px',
        placeholder: '例如: 100px'
      },
      {
        name: 'inline',
        label: '行内表单',
        type: 'switch',
        defaultValue: false
      }
    ]
  },
  
  // Horizontal Menu Component
  'phmenu-item': {
    name: 'phmenu-item',
    label: '横向菜单',
    category: '导航组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置菜单项数据的API调用参数'
      },
      {
        name: 'items',
        label: '菜单项',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '菜单项配置'
      },
      {
        name: 'ellipsis',
        label: '省略菜单项',
        type: 'switch',
        defaultValue: true
      },
      {
        name: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'textColor',
        label: '文字颜色',
        type: 'color',
        defaultValue: '#303133'
      },
      {
        name: 'activeTextColor',
        label: '激活文字颜色',
        type: 'color',
        defaultValue: '#409eff'
      }
    ]
  },
  
  // Image Component
  'pimage-item': {
    name: 'pimage-item',
    label: '图片',
    category: '展示组件',
    properties: [
      {
        name: 'item',
        label: '图片信息',
        type: 'json',
        defaultValue: {},
        isComplex: true,
        complexType: 'object',
        description: '图片信息配置'
      }
    ]
  },
  
  // Link Component
  'plink-item': {
    name: 'plink-item',
    label: '链接',
    category: '展示组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置链接列表数据的API调用参数'
      },
      {
        name: 'links',
        label: '链接列表',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '链接列表配置'
      },
      {
        name: 'direction',
        label: '方向',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      },
      {
        name: 'styleType',
        label: '样式类型',
        type: 'select',
        defaultValue: 'text',
        options: [
          { label: '文本', value: 'text' },
          { label: '按钮', value: 'button' },
          { label: '图标', value: 'icon' }
        ]
      }
    ]
  },
  
  // Logo Component
  'plogo-item': {
    name: 'plogo-item',
    label: 'Logo',
    category: '展示组件',
    properties: [
      {
        name: 'item',
        label: 'Logo信息',
        type: 'json',
        defaultValue: {
          imageUrl: "",
          companyName: "公司名称",
          link: "",
          width: "100px",
          height: "100px",
          alt: "公司Logo"
        },
        isComplex: true,
        complexType: 'object',
        description: 'Logo信息配置'
      },
      {
        name: 'fit',
        label: '适应方式',
        type: 'select',
        defaultValue: 'contain',
        options: [
          { label: '填充', value: 'fill' },
          { label: '包含', value: 'contain' },
          { label: '覆盖', value: 'cover' },
          { label: '无缩放', value: 'none' },
          { label: '按比例填充', value: 'scale-down' }
        ]
      }
    ]
  },
  
  // Menu Bar Component
  'pmenubar-item': {
    name: 'pmenubar-item',
    label: '菜单栏',
    category: '导航组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置菜单项数据的API调用参数'
      },
      {
        name: 'menuItems',
        label: '菜单项',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '菜单项配置'
      },
      {
        name: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'textColor',
        label: '文字颜色',
        type: 'color',
        defaultValue: '#303133'
      },
      {
        name: 'activeTextColor',
        label: '激活文字颜色',
        type: 'color',
        defaultValue: '#409eff'
      }
    ]
  },
  
  // Navigation Bar Component
  'pnavbar-item': {
    name: 'pnavbar-item',
    label: '导航栏',
    category: '导航组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置导航项数据的API调用参数'
      },
      {
        name: 'title',
        label: '标题',
        type: 'input',
        defaultValue: '导航标题',
        placeholder: '请输入导航栏标题'
      },
      {
        name: 'navItems',
        label: '导航项',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '导航项配置'
      },
      {
        name: 'logoUrl',
        label: 'Logo地址',
        type: 'input',
        placeholder: '请输入Logo图片URL'
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#409eff'
      },
      {
        name: 'textColor',
        label: '文字颜色',
        type: 'color',
        defaultValue: '#ffffff'
      }
    ]
  },
  
  // Page Bar Component
  'ppagebar-item': {
    name: 'ppagebar-item',
    label: '分页',
    category: '导航组件',
    properties: [
      {
        name: 'total',
        label: '总条数',
        type: 'number',
        defaultValue: 100,
        min: 0
      },
      {
        name: 'pageSize',
        label: '每页条数',
        type: 'number',
        defaultValue: 10,
        min: 1,
        max: 100
      },
      {
        name: 'layout',
        label: '布局',
        type: 'select',
        defaultValue: 'prev, pager, next',
        options: [
          { label: '完整', value: 'sizes, prev, pager, next, jumper, ->, total' },
          { label: '简洁', value: 'prev, pager, next' },
          { label: '带跳转', value: 'prev, pager, next, jumper' }
        ]
      },
      {
        name: 'background',
        label: '背景色',
        type: 'switch',
        defaultValue: false
      }
    ]
  },
  
  // Page Header Component
  'ppageheader-item': {
    name: 'ppageheader-item',
    label: '页头',
    category: '展示组件',
    properties: [
      {
        name: 'title',
        label: '标题',
        type: 'input',
        defaultValue: '页面标题',
        placeholder: '请输入标题'
      },
      {
        name: 'breadcrumbs',
        label: '面包屑',
        type: 'json',
        defaultValue: [
          { path: "/", label: "首页" },
          { label: "当前页面" }
        ],
        isComplex: true,
        complexType: 'array',
        description: '面包屑配置'
      },
      {
        name: 'icon',
        label: '图标',
        type: 'input',
        placeholder: '请输入图标名称'
      }
    ]
  },
  
  // Splitter Component
  'psplitter-item': {
    name: 'psplitter-item',
    label: '分割面板',
    category: '容器组件',
    properties: [
      {
        name: 'direction',
        label: '方向',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      },
      {
        name: 'splitterSize',
        label: '分割线大小',
        type: 'number',
        defaultValue: 4,
        min: 1,
        max: 20
      }
    ]
  },
  
  // Statistic Component
  'pstatistic-item': {
    name: 'pstatistic-item',
    label: '统计数值',
    category: '展示组件',
    properties: [
      {
        name: 'value',
        label: '数值',
        type: 'number',
        defaultValue: 0
      },
      {
        name: 'title',
        label: '标题',
        type: 'input',
        placeholder: '请输入统计标题'
      },
      {
        name: 'description',
        label: '描述',
        type: 'input',
        placeholder: '请输入描述信息'
      },
      {
        name: 'precision',
        label: '小数位数',
        type: 'number',
        defaultValue: 0,
        min: 0,
        max: 10
      },
      {
        name: 'prefix',
        label: '前缀',
        type: 'input',
        placeholder: '数值前缀'
      },
      {
        name: 'suffix',
        label: '后缀',
        type: 'input',
        placeholder: '数值后缀'
      },
      {
        name: 'groupSeparator',
        label: '千分位分隔符',
        type: 'switch',
        defaultValue: false
      }
    ]
  },
  
  // Steps Component
  'psteps-item': {
    name: 'psteps-item',
    label: '步骤条',
    category: '导航组件',
    properties: [
      {
        name: 'steps',
        label: '步骤配置',
        type: 'json',
        defaultValue: [
          { title: "步骤1", description: "步骤1描述" },
          { title: "步骤2", description: "步骤2描述" },
          { title: "步骤3", description: "步骤3描述" }
        ],
        isComplex: true,
        complexType: 'array',
        description: '步骤配置'
      },
      {
        name: 'active',
        label: '当前步骤',
        type: 'number',
        defaultValue: 0,
        min: 0
      },
      {
        name: 'alignCenter',
        label: '居中对齐',
        type: 'switch',
        defaultValue: true
      },
      {
        name: 'simple',
        label: '简洁模式',
        type: 'switch',
        defaultValue: false
      },
      {
        name: 'direction',
        label: '方向',
        type: 'select',
        defaultValue: 'horizontal',
        options: [
          { label: '水平', value: 'horizontal' },
          { label: '垂直', value: 'vertical' }
        ]
      }
    ]
  },
  
  // Table Component
  'ptable-item': {
    name: 'ptable-item',
    label: '表格',
    category: '数据组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置表格数据的API调用参数'
      },
      {
        name: 'columns',
        label: '列配置',
        type: 'json',
        defaultValue: [
          { prop: "date", label: "日期", width: "180" },
          { prop: "name", label: "姓名", width: "180" },
          { prop: "address", label: "地址" }
        ],
        isComplex: true,
        complexType: 'array',
        description: '表格列配置'
      },
      {
        name: 'data',
        label: '数据',
        type: 'json',
        defaultValue: [],
        isComplex: true,
        complexType: 'array',
        description: '表格数据'
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        placeholder: '例如: 400px'
      },
      {
        name: 'maxHeight',
        label: '最大高度',
        type: 'input',
        placeholder: '例如: 500px'
      },
      {
        name: 'stripe',
        label: '斑马纹',
        type: 'switch',
        defaultValue: false
      },
      {
        name: 'border',
        label: '边框',
        type: 'switch',
        defaultValue: false
      },
      {
        name: 'size',
        label: '尺寸',
        type: 'select',
        defaultValue: 'default',
        options: [
          { label: '较大', value: 'large' },
          { label: '默认', value: 'default' },
          { label: '较小', value: 'small' }
        ]
      }
    ]
  },
  
  // Timeline Component
  'ptimeline-item': {
    name: 'ptimeline-item',
    label: '时间线',
    category: '展示组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置时间线项数据的API调用参数'
      },
      {
        name: 'items',
        label: '时间线项',
        type: 'json',
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
        complexType: 'array',
        description: '时间线项配置'
      },
      {
        name: 'reverse',
        label: '倒序',
        type: 'switch',
        defaultValue: false
      },
      {
        name: 'mode',
        label: '模式',
        type: 'select',
        defaultValue: 'left',
        options: [
          { label: '左侧', value: 'left' },
          { label: '右侧', value: 'right' },
          { label: '交替', value: 'alternate' }
        ]
      }
    ]
  },
  
  // Content Component
  'pcontent-item': {
    name: 'pcontent-item',
    label: '内容展示',
    category: '展示组件',
    properties: [
      {
        name: 'content',
        label: '内容',
        type: 'textarea',
        defaultValue: '请输入展示内容',
        placeholder: '请输入展示内容'
      }
    ]
  },
  
  // Copyright Component
  'pcopyright-item': {
    name: 'pcopyright-item',
    label: '版权信息',
    category: '展示组件',
    properties: [
      {
        name: 'copyright',
        label: '版权文本',
        type: 'input',
        placeholder: '请输入版权信息'
      },
      {
        name: 'companyName',
        label: '公司名称',
        type: 'input',
        defaultValue: '公司名称',
        placeholder: '请输入公司名称'
      },
      {
        name: 'backgroundColor',
        label: '背景颜色',
        type: 'color',
        defaultValue: '#000000'
      },
      {
        name: 'textColor',
        label: '文字颜色',
        type: 'color',
        defaultValue: '#ffffff'
      },
      {
        name: 'height',
        label: '高度',
        type: 'input',
        defaultValue: '30px',
        placeholder: '例如: 30px'
      }
    ]
  },
  
  // Image Component
  'pimage-item': {
    name: 'pimage-item',
    label: '图片',
    category: '展示组件',
    properties: [
      {
        name: 'item',
        label: '图片信息',
        type: 'json',
        defaultValue: {},
        isComplex: true,
        complexType: 'object',
        description: '图片信息配置'
      }
    ]
  },
  
  // Logo Component
  'plogo-item': {
    name: 'plogo-item',
    label: 'Logo',
    category: '展示组件',
    properties: [
      {
        name: 'item',
        label: 'Logo信息',
        type: 'json',
        defaultValue: {
          imageUrl: "",
          companyName: "公司名称",
          link: "",
          width: "100px",
          height: "100px",
          alt: "公司Logo"
        },
        isComplex: true,
        complexType: 'object',
        description: 'Logo信息配置'
      },
      {
        name: 'fit',
        label: '适应方式',
        type: 'select',
        defaultValue: 'contain',
        options: [
          { label: '填充', value: 'fill' },
          { label: '包含', value: 'contain' },
          { label: '覆盖', value: 'cover' },
          { label: '无缩放', value: 'none' },
          { label: '按比例填充', value: 'scale-down' }
        ]
      }
    ]
  },
  
  // Chart Component
  'chart-item': {
    name: 'chart-item',
    label: '图表',
    category: '图表组件',
    properties: [
      {
        name: 'apiConfig',
        label: '数据API',
        type: 'apiConfig',
        defaultValue: {},
        description: '配置图表数据的API调用参数'
      },
      {
        name: 'type',
        label: '图表类型',
        type: 'select',
        defaultValue: 'line',
        options: [
          { label: '折线图', value: 'line' },
          { label: '柱状图', value: 'bar' },
          { label: '饼图', value: 'pie' },
          { label: '雷达图', value: 'radar' },
          { label: '散点图', value: 'scatter' },
          { label: '漏斗图', value: 'funnel' },
          { label: '仪表盘', value: 'gauge' },
          { label: '地图', value: 'map' }
        ]
      },
      {
        name: 'option',
        label: '图表配置',
        type: 'json',
        defaultValue: defaultChartOptions.line,
        isComplex: true,
        complexType: 'object',
        description: 'ECharts 图表配置选项'
      }
    ]
  }

};