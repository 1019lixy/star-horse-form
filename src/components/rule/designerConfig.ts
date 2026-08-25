/**
 * 规则设计器业务配置注册表
 *
 * 无状态 lib 库原则：
 * - 规则分类（ruleType）是纯业务概念，库内不穷举；
 * - 内置选项仅作默认兜底，宿主应用通过 configureRuleCategories
 *   或 RuleDesigner 的 ruleCategories prop 注入自己的分类体系。
 */

import {ref} from "vue";

/** 规则分类选项 */
export interface RuleCategoryOption {
  /** 显示名（支持 i18n key） */
  label: string;
  /** 分类值（写入 ruleData.ruleType / ruleCategory） */
  value: string;
}

export interface ConfigureRuleCategoriesOptions {
  /** 完整替换分类选项列表 */
  options?: RuleCategoryOption[];
  /** 新建规则时的默认分类值（须存在于 options 中，否则取 options[0]） */
  defaultRuleType?: string;
}

const builtinOptions = (): RuleCategoryOption[] => [
  {label: "rule.category.formLinkage", value: "FORM_LINKAGE"},
  {label: "rule.category.dataValidation", value: "DATA_VALIDATION"},
  {label: "rule.category.processControl", value: "PROCESS_CONTROL"},
  {label: "rule.category.calcAssignment", value: "CALC_ASSIGNMENT"},
  {label: "rule.category.businessRule", value: "BUSINESS_RULE"},
  {label: "rule.category.notificationMsg", value: "NOTIFICATION_MSG"},
  {label: "rule.category.dataTransform", value: "DATA_TRANSFORM"},
  {label: "rule.category.other", value: "OTHER"},
];

const categoryOptions = ref<RuleCategoryOption[]>(builtinOptions());
const defaultRuleType = ref("FORM_LINKAGE");

/**
 * 配置规则分类（无状态注入）
 *
 * @example
 * ```ts
 * import { configureRuleCategories } from "star-horse-form";
 * configureRuleCategories({
 *   options: [
 *     { label: "审批类", value: "AUDIT" },
 *     { label: "核算类", value: "ACCOUNTING" },
 *   ],
 *   defaultRuleType: "AUDIT",
 * });
 * ```
 */
export function configureRuleCategories(
  opts: ConfigureRuleCategoriesOptions,
): void {
  if (opts.options?.length) categoryOptions.value = [...opts.options];
  if (opts.defaultRuleType) defaultRuleType.value = opts.defaultRuleType;
}

/** 恢复内置默认分类 */
export function resetRuleCategories(): void {
  categoryOptions.value = builtinOptions();
  defaultRuleType.value = "FORM_LINKAGE";
}

/** 当前分类选项（响应式） */
export const getRuleCategoryOptions = (): RuleCategoryOption[] => [
  ...categoryOptions.value,
];

/** 新建规则的默认分类值；未配置或不在选项中时回退 options[0] */
export function getDefaultRuleType(): string {
  const list = categoryOptions.value;
  if (!list.length) return "";
  return list.some((o) => o.value === defaultRuleType.value)
    ? defaultRuleType.value
    : list[0].value;
}