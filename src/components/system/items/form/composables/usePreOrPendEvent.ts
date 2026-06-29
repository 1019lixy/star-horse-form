import {computed, type Ref} from "vue";
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
 */
export interface PreOrPendEventConfig {
    /** 事件类型 */
    eventType: PreOrPendEventType;
    /** 联动策略配置（eventType = "linkage"） */
    dataRelation?: any;
    /** 数据源配置（eventType = "dataSource"） */
    dataSourceConfig?: any;
    /** 自定义 JS 代码（eventType = "custom"） */
    customCode?: string;
}

/**
 * 支持事件配置的前后缀插槽定义
 */
export interface PreOrPendEventSlot {
    /** 对应 formProps 字段名 */
    fieldName: string;
    /** 触发事件名 */
    eventName: string;
    /** 展示标签 */
    label: string;
    /** 该插槽是否为数组型（如 appendAction 按钮组，每个按钮独立配置） */
    isArray?: boolean;
}

/**
 * 前后缀元素支持的事件插槽
 *
 * 仅保留前置/后置按钮（prependAction / appendAction）的事件配置，
 * 其它元素（文本、下拉列表、图标等）不做事件处理
 */
export const preOrPendEventSlots: PreOrPendEventSlot[] = [
    {
        fieldName: "prependAction",
        eventName: "click",
        label: i18n("dyform.preOrPend.event.prependActionClick"),
        isArray: true,
    },
    {
        fieldName: "appendAction",
        eventName: "click",
        label: i18n("dyform.preOrPend.event.appendActionClick"),
        isArray: true,
    },
];

/**
 * 事件类型选项
 */
export const preOrPendEventTypeOptions = computed(() => [
    {value: "none", label: i18n("dyform.preOrPend.event.type.none"), icon: "CircleClose"},
    {value: "linkage", label: i18n("dyform.preOrPend.event.type.linkage"), icon: "Connection"},
    {value: "dataSource", label: i18n("dyform.preOrPend.event.type.dataSource"), icon: "DataAnalysis"},
    {value: "custom", label: i18n("dyform.preOrPend.event.type.custom"), icon: "EditPen"},
]);

/**
 * 获取事件配置在 formProps 上的存储 key
 * @param fieldName 字段名
 * @param eventName 事件名
 * @param index 数组型插槽的索引（非数组型省略）
 */
export const getEventConfigKey = (fieldName: string, eventName: string, index?: number) => {
    return index === undefined
        ? `${fieldName}__${eventName}`
        : `${fieldName}__${eventName}__${index}`;
};

/**
 * 前后缀事件配置管理 composable
 *
 * 负责对 prepend/append 元素的事件配置进行读写：
 * 1. 联动策略（dataRelation）
 * 2. 数据源（dataSourceConfig）
 * 3. 自定义实现（customCode）
 *
 * 配置统一存储在 formProps 上，key 规则见 {@link getEventConfigKey}
 */
export function usePreOrPendEvent(formProps: Ref<any>) {
    /**
     * 读取某个插槽的事件配置
     */
    const getEventConfig = (fieldName: string, eventName: string, index?: number): PreOrPendEventConfig => {
        const key = getEventConfigKey(fieldName, eventName, index);
        const stored = formProps.value?.[key];
        if (stored && typeof stored === "object") {
            return {eventType: "none", ...stored};
        }
        return {eventType: "none"};
    };

    /**
     * 写入某个插槽的事件配置
     */
    const setEventConfig = (
        fieldName: string,
        eventName: string,
        config: PreOrPendEventConfig,
        index?: number,
    ) => {
        if (!formProps.value) {
            formProps.value = {};
        }
        const key = getEventConfigKey(fieldName, eventName, index);
        formProps.value[key] = config;
    };

    /**
     * 清除某个插槽的事件配置
     */
    const clearEventConfig = (fieldName: string, eventName: string, index?: number) => {
        const key = getEventConfigKey(fieldName, eventName, index);
        if (formProps.value && Object.prototype.hasOwnProperty.call(formProps.value, key)) {
            delete formProps.value[key];
        }
    };

    /**
     * 判断某个插槽是否已配置事件
     */
    const hasEventConfig = (fieldName: string, eventName: string, index?: number): boolean => {
        const config = getEventConfig(fieldName, eventName, index);
        return config.eventType !== "none";
    };

    /**
     * 获取已配置事件类型的展示标签
     */
    const getEventTypeLabel = (fieldName: string, eventName: string, index?: number): string => {
        const config = getEventConfig(fieldName, eventName, index);
        const opt = preOrPendEventTypeOptions.value.find((o) => o.value === config.eventType);
        return opt?.label ?? "";
    };

    return {
        getEventConfig,
        setEventConfig,
        clearEventConfig,
        hasEventConfig,
        getEventTypeLabel,
    };
}

/**
 * 事件类型 tag 颜色映射，供模板渲染使用
 */
export const eventTagTypeMap: Record<PreOrPendEventType, "" | "success" | "warning" | "info" | "danger"> = {
    none: "info",
    linkage: "primary",
    dataSource: "warning",
    custom: "danger",
};
