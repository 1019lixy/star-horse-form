export interface ProcessVariablesType {
  /**
   * 变量名称
   */
  paramLabel: string;
  /**
   * 变量属性
   */
  paramName: string;
  /**
   * 变量值类型,可以是字符串，数字，数组，Json对象
   */
  paramValueType: "string" | "number" | "array" | "json";
  /**
   * 变量类型，流程变量/任务变量
   */
  type: "process" | "task";
  /**
   * 是否内置变量
   */
  systemFlag: "inner" | "extend";
  /**
   * 默认值
   */
  defaultValue: any;
}
