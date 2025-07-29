import { PageFieldInfo } from 'star-horse-lowcode';
// ... 前面import部分保持不变 ...

export const flexBoxItemsConfig: PageFieldInfo = {
  fieldList: [
    {
      fieldName: 'order',
      label: '排列顺序',
      formVisible: true,
      helpMsg: '指定项目在容器中的排列顺序',
      type: 'number',
      defaultValue: '',
      preps: {
        icon: '',
      },
    },
    {
      fieldName: 'flexGrow',
      label: '扩展比例',
      formVisible: true,
      helpMsg: '定义项目相对于其他项目的扩展比例',
      preps: {
        icon: '',
      },
      type: 'number',
      defaultValue: '',
    },
    {
      fieldName: 'flexShrink',
      label: '收缩比例',
      formVisible: true,
      helpMsg: '控制空间不足时项目的收缩比例',
      preps: {
        icon: '',
      },
      type: 'number',
      defaultValue: '1',
    },
    {
      fieldName: 'flexBasis',
      label: '初始大小',
      formVisible: true,
      helpMsg: '定义空间分配前项目的初始尺寸',
      preps: {
        icon: '',
        appendList: [
          { name: '自动', value: 'auto' },
          { name: '像素', value: 'px' },
          { name: '百分比', value: '%' },
        ],
      },
      type: 'input',
      defaultValue: 'auto',
    },
    {
      fieldName: 'alignSelf',
      label: '自身对齐',
      formVisible: true,
      helpMsg: '覆盖容器对齐设置，单独定义项目交叉轴对齐',
      type: 'select',
      defaultValue: 'auto',
      preps: {
        icon: '',
        values: [
          { name: '自动', value: 'auto' },
          { name: '起始对齐', value: 'flex-start' },
          { name: '末尾对齐', value: 'flex-end' },
          { name: '居中', value: 'center' },
          { name: '基线对齐', value: 'baseline' },
          { name: '拉伸', value: 'stretch' },
        ],
      },
    },
    {
      fieldName: 'width',
      label: '宽度',
      formVisible: true,
      helpMsg: '指定项目宽度，覆盖默认尺寸',
      type: 'input',
      defaultValue: 'auto',
      preps: {
        icon: '',
        appendList: [
          { name: '自动', value: 'auto' },
          { name: '像素', value: 'px' },
          { name: '百分比', value: '%' },
        ],
      },
    },
    {
      fieldName: 'height',
      label: '高度',
      formVisible: true,
      helpMsg: '指定项目高度，覆盖默认尺寸',
      type: 'input',
      defaultValue: 'auto',
      preps: {
        icon: '',
        appendList: [
          { name: '自动', value: 'auto' },
          { name: '像素', value: 'px' },
          { name: '百分比', value: '%' },
        ],
      },
    },
  ],
};
