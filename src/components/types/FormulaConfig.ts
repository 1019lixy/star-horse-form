/** 公式类型 */
export type FormulaType =
  | "calc"
  | "concat"
  | "condition"
  | "lookup"
  | "aggregate"
  | "dateCalc"
  | "format"
  | "ternary";

/** 条件分支配置 */
export interface ConditionBranch {
  when: string;
  then: any;
}

/** 联动回填映射配置 */
export interface LookupMapping {
  key: string;
  values: Record<string, any>;
}

/** 公式配置 - 与 FormulaEngine.ts 的 FormulaConfig 对齐 */
export interface FormulaConfig {
  enable: boolean;
  type: FormulaType;
  sourceFields: string[];
  expression?: string;
  branches?: ConditionBranch[];
  lookupMappings?: LookupMapping[];
  precision?: number;
  prefix?: string;
  suffix?: string;
  dateUnit?: "year" | "month" | "day" | "hour" | "minute" | "second";
  dateOffset?: number;
  dateMode?: "diff" | "offset" | "format";
  dateFormat?: string;
  formatType?: "thousands" | "padStart" | "toFixed" | "regex";
  formatArg?: string | number;
  formatArg2?: string;
  aggregateField?: string;
  defaultValue?: any;
}
