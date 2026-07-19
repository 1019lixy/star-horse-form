import {computed} from "vue";
import {i18n} from "@/lang";

/**
 * 前后缀事件类型
 * - none: 无事件
 * - linkage: 调用联动策略配置
 * - dataSource: 调用数据源配置
 * - custom: 自定义实现（JS 代码）
 */
export type PreOrPendEventType = "none" | "linkage" | "dataSource" | "custom";

/**
 * 前后缀元素事件配置
 *
 * 直接存储在按钮项的 `actions` 字段上，运行时通过 `eventType` 分发请求
 */
export interface PreOrPendEventConfig {
    /** 事件类别（用于运行时分发） */
    eventType: PreOrPendEventType;
    /** 联动策略配置（eventType = "linkage"） */
    dataRelation?: any;
    /** 数据源配置（eventType = "dataSource"） */
    dataSourceConfig?: any;
    /** 自定义 JS 代码（eventType = "custom"） */
    customCode?: string;
}

/**
 * 事件类型选项
 */
export interface PreOrPendEventTypeOption {
    value: PreOrPendEventType;
    label: string;
    icon: string;
}

export const preOrPendEventTypeOptions = computed<PreOrPendEventTypeOption[]>(() => [
    {value: "none", label: i18n("dyform.preOrPend.event.type.none"), icon: "CircleClose"},
    {value: "linkage", label: i18n("dyform.preOrPend.event.type.linkage"), icon: "Connection"},
    {value: "dataSource", label: i18n("dyform.preOrPend.event.type.dataSource"), icon: "DataAnalysis"},
    {value: "custom", label: i18n("dyform.preOrPend.event.type.custom"), icon: "EditPen"},
]);
