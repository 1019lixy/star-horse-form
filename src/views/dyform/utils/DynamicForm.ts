const formActions = [
  {
    icon: "left_panel",
    defaultEdit: true,
    key: "leftPanel",
    auth: "none",
    label: "左侧工具栏"
  },
  {
    icon: "return",
    defaultEdit: true,
    key: "goBack",
    auth: "none",
    label: "返回列表"
  },
  {
    icon: "style",
    defaultEdit: true,
    key: "style",
    auth: "none",
    label: "风格",
    children: [
      {
        icon: "pc",
        defaultEdit: true,
        key: "pc",
        auth: "none",
        label: "电脑"
      },
      {
        icon: "pad",
        defaultEdit: true,
        key: "pad",
        auth: "none",
        label: "平板"
      },
      {
        icon: "phone",
        defaultEdit: true,
        key: "phone",
        auth: "none",
        label: "手机"
      }
    ]
  },
  {
    icon: "add",
    defaultEdit: true,
    key: "new",
    auth: "none",
    label: "新建"
  },
  {
    icon: "edit",
    key: "eprep",
    auth: "none",
    label: "修改属性"
  },
  {
    icon: "setting",
    key: "tprep",
    auth: "none",
    label: "表属性配置"
  },
  {
    icon: "empty_setting",
    key: "empty",
    auth: "none",
    label: "清空元素"
  },
  {
    icon: "undo",
    key: "undo",
    auth: "none",
    label: "后退一步"
  },
  {
    icon: "redo",
    key: "redo",
    auth: "none",
    label: "前进一步"
  },
  {
    icon: "valid",
    key: "valid",
    auth: "none",
    label: "校验"
  },
  {
    icon: "preview",
    key: "preview",
    auth: "none",
    label: "预览"
  },
  {
    icon: "code",
    key: "code",
    auth: "none",
    label: "生成代码"
  },
  {
    icon: "save",
    key: "save",
    auth: "add",
    label: "保存"
  },
  {
    icon: "right_panel",
    defaultEdit: true,
    key: "rightPanel",
    auth: "none",
    label: "右侧属性栏"
  }
];
const shortKeyHelpMessage = `
快捷键：
  1、Ctrl + X 剪切操作；
  2、Ctrl + C 复制操作；
  3、Ctrl + V 粘贴操作；
  4、Ctrl + Z 后退一步操作；
  5、Ctrl + Y 前进一步操作；
  6、Alt + V 校验操作；
  7、Ctrl + Alt + N 新建操作；
  8、Ctrl + Alt + S 保存操作；
  9、Ctrl + D 删除操作；
  10、Ctrl + A 全选操作（未实现）；
  11、Ctrl + Alt + D 清空操作；
  12、Ctrl + F 查找操作（未实现）；
  13、Alt + 1 打开/关闭左侧面板；
  14、Alt + 2 打开/关闭右侧面板；
  15、Ctrl + Alt + M 更换选中组件；
  16、Alt + P 预览操作；
  17、Ctrl + R 返回上一个页面；
  18、PgUp 向上移动选中组件；
  19、PgDn 向下移动选中组件；
  其它快捷键待更新
`;
const dynamicFormHelpMessage = `
描述：StarHorse 表单设计器是一款通过拖拽即可实现
     复杂表单模型，可满足大部分常见业务。
规则：所有同级组件的名字不能重复，在Tab组件中tabName
     和objectName不能重复;
     Table组件中batchFieldName不能重复。
操作步骤：
  1、将左边的组件拖动中间空白区域；
  2、在右边属性区域设置选中组件得属性；
  3、在头部可批量编辑按钮可编辑属性名称；
  4、在在头部设置按钮可设置表单属性；
  5、在头部代码按钮可以生产代码（目前只能生产vue3）；
  6、在头部预览按钮可以预览表单信息；
  7、在舞台上点击鼠标右键可打开右键菜单
盲点（数据源生成的表单模型）：
  1、须注意选择器、单选框、多选框等组件的值类型，
     系统默认是字符串类型，如果数据库设置是数值类型
     需要在对应字段的属性面板中修改值类型。
  2、提交时须注意表的主键生成策略，默认是动态赋值，
    如果是自增，需要在保存时修改主键策略。
${shortKeyHelpMessage}
`;
export { formActions, dynamicFormHelpMessage };
