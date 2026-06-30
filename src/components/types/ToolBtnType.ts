export interface ToolBtnType {
  /**
   * 按钮图标
   */
  icon: string;
  /**
   * 按钮唯一标识
   */
  key: string;
  /**
   * 按钮权限
   */
  auth: string;
  /**
   * 按钮显示文本
   */
  label: string;
  /**
   * 是否默认编辑状态下显示
   */
  defaultEdit?: boolean;
  /**
   * 按钮快捷键
   */
  shortcut?: string;
  /**
   * 按钮帮助文本
   */
  help?: string;
  /**
   * 按钮点击事件
   */
  action?: Function;
  /**
   * 子按钮
   */
  children?: ToolBtnType[];
  /**
   * 平铺组标记：为 true 时 children 在工具条中平铺渲染（不收进下拉），
   * 用于高频操作组（如撤销/重做）；为 false/未设置时 children 渲染为下拉菜单。
   * 仅当 children 存在时该字段生效。
   */
  flat?: boolean;
}
