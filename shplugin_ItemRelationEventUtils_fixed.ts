import {closeLoad, createCondition, dynamicUrlOperation, isJson, load,} from "@/api/star_horse_utils";
import {userFunction} from "@/api/user_func";
import {ApiLinkageDetail, ItemRelation, RelationDetail, SelectOption,} from "@/components/types";
import {error, warning} from "@/utils/message";
import {i18n} from "@/lang";
import {computed, nextTick, Ref, unref, watch} from "vue";
import JSON5 from "json5";
import {
    executeFormulaWithFill,
    initFormFormulaWatchers,
    setupFormulaWatchers,
} from "@/components/formcomp/utils/FormulaEngine";
import {postRequest} from "@/api/star_horse_apis";
import {PreOrPendEventConfig} from "@/components/types/PreOrPendType";


// ==================== 字段状态层（独立响应式，解耦 compList 引用） ====================
/**
 * 模块级 fieldStateMap 引用，由表单容器组件通过 setFieldStateMap 设置
 * controlFieldProps / applyRuleEngineActionsToFields / fieldAssign 在修改字段属性时同步写入
 * 实现字段配置与运行时状态解耦，不依赖 tableFieldList 对象引用
 */
let _fieldStateMap: Record<string, any> | null = null;
export const setFieldStateMap = (map: Record<string, any> | null) => { _fieldStateMap = map; }
const syncFieldState = (fieldName: string, prop: string, value: any) => {
  if (!_fieldStateMap || !fieldName) return;
  if (!_fieldStateMap[fieldName]) {
    _fieldStateMap[fieldName] = { visible: true, required: false, disabled: false, readonly: false, options: [], value: undefined };
  }
  ;(_fieldStateMap[fieldName] as any)[prop] = value;
};

// ==================== 公共工具函数 ====================

/** 将值归一化为数组 */
const ensureArray = (val: any): any[] => {
    if (!Array.isArray(val)) {
        return val ? [val] : [];
    }
    return val;
};

/** 查找字段并确保 preps 存在，支持递归查找 children */
const findField = (props: any, fieldName: string, fieldList?: any[]): any => {
    const list = fieldList || props.formInfo || [];

    for (const field of list) {
        if (field.fieldName === fieldName) {
            if (!field.preps) {
                field.preps = {};
            }
            return field;
        }
        // 递归查找 children 中的字段
        if (field.children && Array.isArray(field.children)) {
            const found = findField(props, fieldName, field.children);
            if (found) {
                return found;
            }
        }
    }
    return null;
};

/** 遍历关联字段，对每个字段执行操作 */
const forEachRelationField = (
    props: any,
    relationFields: string | string[],
    callback: (field: any, fieldName: string) => void,
) => {
    ensureArray(relationFields).forEach((name: string) => {
        const field = findField(props, name);
        if (field) callback(field, name);
    });
};

// ==================== 字段赋值 ====================

const fieldAssign = (
    props: any,
    relationFields: Array<string>,
    values: SelectOption[] | any,
) => {
    const record: Record<string, Array<string>> = {
        values: ["select", "autocomplete", "radio", "checkbox"],
        data: ["tselect", "transfer"],
        options: ["cascade"],
    };
    forEachRelationField(props, relationFields, (field, fieldName) => {
        let flag = false;
        field["formVisible"] = true;
        syncFieldState(fieldName, "visible", true);
        Object.entries(record).forEach(([key, value]) => {
            if (value.includes(field.itemType ?? field.type)) {
                field.preps[key] = values;
                syncFieldState(fieldName, key, values);
                flag = true;
                return false;
            }
        });
        if (!flag) {
            if (isJson(values)) {
                Object.entries(values).forEach(([key, value]) => {
                    field.preps[key] = value;
                    syncFieldState(fieldName, key, value);
                });
            } else if (!Array.isArray(values)) {
                field["defaultValue"] = values;
                syncFieldState(fieldName, "value", values);
            }
        }
    });
};

// ==================== 匹配判断 ====================

/** 判断 e 是否匹配 matchFieldValue，支持 e 为数组的情况 */
const isMatch = (matchType: string, matchFieldValue: any, e: any) => {
    if (Array.isArray(e)) {
        return e.some((item) => matchFieldValue.includes(item));
    }
    switch (matchType) {
        case "llk":
            return matchFieldValue.startsWith(e);
        case "rlk":
            return matchFieldValue.endsWith(e);
        case "neq":
        case "nlk":
            return !matchFieldValue.includes(e);
        case "lt":
            return matchFieldValue < e;
        case "lte":
            return matchFieldValue <= e;
        case "gt":
            return matchFieldValue > e;
        case "gte":
            return matchFieldValue >= e;
        case "isnull":
            return !e;
        case "notnull":
            return !!e;
        case "bt":
            return matchFieldValue[0] <= e && e <= matchFieldValue[1];
        default:
            return matchFieldValue.includes(e);
    }
};

// ==================== 联动处理器 ====================

/** 属性控制映射表：controlCondition -> { 目标属性, 是否取反 } */
const CONTROL_ACTION_MAP: Record<
    string,
    { targetProp: string; negate: boolean; isPreps: boolean }
> = {
    eqHide: {targetProp: "formVisible", negate: true, isPreps: false},
    eqVisible: {targetProp: "formVisible", negate: false, isPreps: false},
    eqDisable: {targetProp: "disabled", negate: false, isPreps: true},
    eqEditable: {targetProp: "disabled", negate: true, isPreps: true},
    eqRequired: {targetProp: "required", negate: false, isPreps: false},
    eqUnRequired: {targetProp: "required", negate: true, isPreps: false},
    // 规则引擎控制动作 - 与上面保持相同的属性映射机制
    ruleHide: {targetProp: "formVisible", negate: true, isPreps: false},
    ruleVisible: {targetProp: "formVisible", negate: false, isPreps: false},
    ruleDisable: {targetProp: "disabled", negate: false, isPreps: true},
    ruleEditable: {targetProp: "disabled", negate: true, isPreps: true},
    ruleRequired: {targetProp: "required", negate: false, isPreps: false},
    ruleUnRequired: {targetProp: "required", negate: true, isPreps: false},
};

/** 属性控制（显隐/禁用/必填） */
const controlFieldProps = (props: any, item: RelationDetail, e: any) => {
    const {matchFieldValue, matchType, controlCondition, relationFields} = item;
    const matchResult = isMatch(matchType, ensureArray(matchFieldValue), e);
    const action = CONTROL_ACTION_MAP[controlCondition];
    if (!action) return;

    const finalValue = action.negate ? !matchResult : matchResult;
    forEachRelationField(props, relationFields, (field, fieldName) => {
        if (action.isPreps) {
            field.preps[action.targetProp] = finalValue;
        } else {
            field[action.targetProp] = finalValue;
        }
        // 同步写入 fieldStateMap（独立响应式状态层）
        syncFieldState(fieldName, action.targetProp, finalValue);
    });
};

/** 数据关联 */
const dataLinkage = async (props: any, item: RelationDetail, e: any) => {
    let {relationFields, params, matchFieldValue} = item;

    const matchValues = ensureArray(matchFieldValue);
    if (matchValues.length > 0 && !matchValues.includes(e)) {
        return;
    }

    const tempParams: any = JSON5.parse(JSON5.stringify(params));
    if (item.controlCondition == "asParamDataLinkage") {
        tempParams["queryParams"] = tempParams.queryParams || [];
        tempParams.queryParams.push(
            createCondition(item.matchFieldName, e, item.matchType),
        );
    }
    const resultData = await dynamicUrlOperation({
        preps: Object.assign({}, tempParams),
    });
    fieldAssign(props, ensureArray(relationFields) as string[], resultData);
};

/** 赋值 */
const assignValue = (props: any, item: RelationDetail, _e: any) => {
    fieldAssign(
        props,
        ensureArray(item.relationFields) as string[],
        item.staticDatas,
    );
};

/** 改变字段类型 */
const changeType = (props: any, item: RelationDetail, e: any) => {
    const {matchFieldValue, matchType, relationFields, staticDatas} = item;
    const matchResult = isMatch(matchType, ensureArray(matchFieldValue), e);
    if (!matchResult) return;

    forEachRelationField(props, relationFields, (field) => {
        field["itemType"] = staticDatas;
        field["type"] = staticDatas;
    });
};

// ==================== 联动事件分发 ====================
/**
 * 联动事件分发函数
 * @param props
 * @param item
 * @param e
 * @param formData
 * @param actionName
 */
const relationEventDispatcher = (
    props: any,
    item: ItemRelation,
    e: any,
    formData: Ref<Record<string, any>>,
    actionName: string,
) => {
    const relationDetails = item.relationDetails;
    const apiLinkage = item.apiLinkage;
    if (relationDetails && relationDetails.length > 0) {
        relationEvent(props, relationDetails, e, formData, actionName);
    } else if (apiLinkage && Object.keys(apiLinkage).length > 0 && props.source != 3) {
        apiLinkageOperation(apiLinkage, formData);
    }
};
/**
 *
 * @param apiLinkage
 * @param formData
 */
export const apiLinkageOperation = (
    apiLinkage: ApiLinkageDetail,
    formData: Ref<Record<string, any>>
) => {
    //数据配置OK后
    const condition = {
        ...apiLinkage,
        formData: unref(formData),
    };
    load(i18n("ide.status.loading"));
    postRequest(
        apiLinkage.proxyUrl ?? "/system-config/redirect/apiLinkage",
        condition,
    )
        .then((response) => {
            const result = response?.data;
            closeLoad();
            if (result?.code) {
                warning(result.cnMessage);
                return;
            }
            const data = result?.data;
            if (data) {
                for (let key in data) {
                    if ("_value" != key) {

                        //如果有数据不替换
                        //任何时候都替换
                        //如果数据和返回数据不一致替换
                        unref(formData)[key] = data[key];
                    }
                }
            }
        })
        .finally(() => {
            closeLoad();
        });
};

// ==================== 规则引擎调度 ====================

/**
 * 从 ruleEngineConfig 中提取 formId / triggerEvent / apiBasePath
 * ruleEngineConfig 可来自 item.ruleEngineConfig（RelationDetail 扩展字段）
 * 或 field.preps.ruleEngineConfig（按钮字段配置）
 */
const resolveRuleEngineConfig = (config: any, props: any) => {
    const cfg = config || {};
    return {
        formId: cfg.formId || props.formId || props.field?.preps?.formId,
        triggerEvent: cfg.triggerEvent || "ON_CHANGE",
        apiBasePath: cfg.apiBasePath || "/userdb/ruleEngine",
    };
};

/**
 * 公共规则引擎调用函数
 * 消除 ruleEngineDispatcher 和 buttonRuleEngineDispatcher 中的重复代码
 *
 * @param formData 表单数据
 * @param formId 表单ID
 * @param triggerEvent 触发事件
 * @param apiBasePath API 基础路径
 * @param props 表单组件 props
 * @param beforeCall 请求前回调（注入按钮上下文等）
 */
const callRuleEngine = async (
    formData: Ref<Record<string, any>>,
    formId: string,
    triggerEvent: string,
    apiBasePath: string,
    props: any,
    beforeCall?: (data: Record<string, any>) => void,
) => {
    if (!formId) {
        console.warn("[callRuleEngine] formId 未配置，跳过规则引擎调用");
        return;
    }

    try {
        const currentFormData = { ...unref(formData) };
        if (beforeCall) beforeCall(currentFormData);

        const res = await postRequest(
            `${apiBasePath}/executeByForm/${formId}?triggerEvent=${triggerEvent}`,
            currentFormData,
        );

        const data = res?.data?.data;
        if (!data || !Array.isArray(data)) return;

        // 合并所有规则集的 mergedContext
        const merged: Record<string, any> = {};
        for (const rs of data) {
            if (rs.mergedContext) Object.assign(merged, rs.mergedContext);
        }

        // 解析字段控制指令并应用
        const fieldActions = parseRuleEngineActions(merged);
        applyRuleEngineActionsToFields(props, fieldActions, formData);
    } catch (err) {
        console.error("[callRuleEngine] 规则引擎执行失败:", err);
    }
};

/**
 * 规则引擎 ON_CHANGE 调度器
 *
 * 当字段的 dataRelation 配置了 controlCondition="ruleEngine" 时触发。
 * 融入已有事件流，复用现有 relationEventDispatcher 的字段级 watch 机制。
 *
 * @param props 表单组件 props
 * @param item 联动详情配置（RelationDetail 扩展了 ruleEngineConfig）
 * @param e 当前字段值
 * @param formData 表单数据
 */
const ruleEngineDispatcher = async (
    props: any,
    item: RelationDetail & { ruleEngineConfig?: any },
    e: any,
    formData: Ref<Record<string, any>>,
) => {
    const {matchFieldValue} = item;

    // 匹配检查：与 dataLinkage 保持一致的匹配逻辑
    const matchValues = ensureArray(matchFieldValue);
    if (matchValues.length > 0 && !matchValues.includes(e)) {
        return;
    }

    const { formId, triggerEvent, apiBasePath } = resolveRuleEngineConfig(
        (item as any).ruleEngineConfig, props
    );
    await callRuleEngine(formData, formId, triggerEvent, apiBasePath, props);
};

/**
 * 从规则引擎返回的 mergedContext 中解析字段控制指令
 * 与 dynamicform useRuleEngine.parseFieldActions 逻辑一致
 */
const parseRuleEngineActions = (context: Record<string, any> = {}): Array<{
    field: string;
    visible?: boolean;
    required?: boolean;
    readonly?: boolean;
    disabled?: boolean;
    value?: any;
    options?: any[];
}> => {
    const actionMap = new Map<string, any>();
    const PREFIXES: Array<[string, string]> = [
        ["__visible_", "visible"],
        ["__required_", "required"],
        ["__readonly_", "readonly"],
        ["__disabled_", "disabled"],
        ["__options_", "options"],
    ];

    for (const [key, val] of Object.entries(context)) {
        let matched = false;
        for (const [prefix, prop] of PREFIXES) {
            if (key.startsWith(prefix)) {
                const fieldName = key.slice(prefix.length);
                if (!fieldName) break;
                const action = actionMap.get(fieldName) || {field: fieldName};
                action[prop] = val;
                actionMap.set(fieldName, action);
                matched = true;
                break;
            }
        }
        if (!matched && !key.startsWith("__") && val !== undefined) {
            const action = actionMap.get(key) || {field: key};
            action.value = val;
            actionMap.set(key, action);
        }
    }

    return Array.from(actionMap.values());
};

/**
 * 将规则引擎解析出的字段控制指令应用到 formFields
 * 与 controlFieldProps 保持一致的控制方式，同时同步写入 fieldStateMap
 */
const applyRuleEngineActionsToFields = (
    props: any,
    actions: Array<{
        field: string;
        visible?: boolean;
        required?: boolean;
        readonly?: boolean;
        disabled?: boolean;
        value?: any;
        options?: any[];
    }>,
    formData: Ref<Record<string, any>>,
) => {
    for (const action of actions) {
        const fn = action.field;

        // 显隐控制 - 与 eqHide/eqVisible 一致
        if (action.visible !== undefined) {
            forEachRelationField(props, fn, (field) => { field.formVisible = action.visible; });
            syncFieldState(fn, "visible", action.visible);
        }
        // 必填控制 - 与 eqRequired 一致
        if (action.required !== undefined) {
            forEachRelationField(props, fn, (field) => { field.required = action.required; });
            syncFieldState(fn, "required", action.required);
        }
        // 禁用控制 - 与 eqDisable 一致
        if (action.disabled !== undefined) {
            forEachRelationField(props, fn, (field) => { field.preps.disabled = action.disabled; });
            syncFieldState(fn, "disabled", action.disabled);
        }
        // 只读控制
        if (action.readonly !== undefined) {
            forEachRelationField(props, fn, (field) => { field.preps.readonly = action.readonly; });
            syncFieldState(fn, "readonly", action.readonly);
        }
        // 选项数据源赋值 - 用于 select/cascade/checkbox 等选项类字段的选项更新
        if (action.options !== undefined) {
            forEachRelationField(props, fn, (field) => {
                if (!field.preps) field.preps = {};
                field.preps.options = action.options;
            });
            syncFieldState(fn, "options", action.options);
        }
        // 值赋值 - 与 fieldAssign 逻辑对齐
        if (action.value !== undefined) {
            forEachRelationField(props, fn, (field) => {
                const valueRecord: Record<string, string[]> = {
                    values: ["select", "autocomplete", "radio", "checkbox"],
                    data: ["tselect", "transfer"],
                    options: ["cascade"],
                };
                const itemType = field.itemType ?? field.type;
                let matched = false;
                for (const [key, types] of Object.entries(valueRecord)) {
                    if (types.includes(itemType)) {
                        field.preps[key] = action.value;
                        syncFieldState(fn, key, action.value);
                        matched = true;
                        break;
                    }
                }
                if (!matched) {
                    unref(formData)[fn] = action.value;
                    syncFieldState(fn, "value", action.value);
                }
            });
        }
    }
};

/**
 * 按钮点击触发的规则引擎调度器
 *
 * 当按钮字段配置了 ruleEngineConfig.formId 时触发。
 * 通过后端 executeByForm API 以 ON_BUTTON_CLICK 事件执行规则集。
 * 不影响原有 buttonAction 的自定义代码、actions、selfFunc 逻辑。
 *
 * @param props 表单组件 props（context 即 props）
 * @param formData 表单数据（响应式）
 * @param evtName 按钮事件名（默认 click）
 */
const buttonRuleEngineDispatcher = async (
    props: any,
    formData: Ref<Record<string, any>>,
    evtName: string = "click",
) => {
    const field = props?.field;
    if (!field) return;

    const ruleEngineConfig =
        field.preps?.ruleEngineConfig || field.ruleEngineConfig || {};
    const { formId, apiBasePath } = resolveRuleEngineConfig(ruleEngineConfig, props);

    await callRuleEngine(
        formData,
        formId,
        "ON_BUTTON_CLICK",
        apiBasePath,
        props,
        (data) => {
            // 注入按钮上下文，供后端规则匹配使用
            data.__buttonKey = field.fieldName;
            data.__buttonEvent = evtName;
        },
    );
};

const relationEvent = (
    props: any,
    relationDetails: RelationDetail[],
    e: any,
    formData: Ref<Record<string, any>>,
    actionName: string,
) => {
    if (!Array.isArray(relationDetails)) {
        console.error(i18n("api.relationDetailsMustBeArray"), relationDetails);
        return;
    }
    relationDetails?.forEach(async (item: RelationDetail) => {
        const {controlCondition, relationFields} = item;
        if (!relationFields || item.isWorking) {
            return;
        }

        switch (controlCondition) {
            case "eqConditionDataLinkage":
            case "asParamDataLinkage":
                await dataLinkage(props, item, e);
                break;
            case "eqDisable":
            case "eqHide":
            case "eqEditable":
            case "eqVisible":
            case "eqRequired":
            case "eqUnRequired":
            // 规则引擎控制动作 - 复用 controlFieldProps 机制
            case "ruleHide":
            case "ruleVisible":
            case "ruleDisable":
            case "ruleEditable":
            case "ruleRequired":
            case "ruleUnRequired":
                controlFieldProps(props, item, e);
                break;
            case "assignValue":
                assignValue(props, item, e);
                break;
            case "changeType":
                changeType(props, item, e);
                break;
            case "ruleEngine":
                // 规则引擎调度 - 调用后端 executeByForm API
                await ruleEngineDispatcher(props, item, e, formData);
                break;
            default:
                console.log(i18n("api.unhandledEvent") + controlCondition);
        }
        await nextTick();
        item.isWorking = false;
    });
};

// ==================== 事件触发 ====================

/** 所有触发的事件 */
const allAction = (
    context: any,
    emits: any,
    formData: any,
    actionName: string,
    _isInit: boolean = false,
) => {
    const currentData = unref(formData);
    try {
        emits("selfFunc", actionName, currentData);
    } catch (e) {
        error(i18n("api.eventTriggerError") + e);
    }
};

/** Button 组件的点击事件 */
const buttonAction = (
    context: any,
    emits: any,
    formData: any,
    code: string,
    evtName: string = "click",
) => {
    const currentData = unref(formData);
    if (code) {
        userFunction(code, context, currentData);
    } else {
        const field = context.field as any;
        currentData["starHorseBtnName"] = field.fieldName;
        const actions = field.actions;
        if (actions) {
            if (typeof actions === "function") {
                actions(formData);
            } else {
                actions[evtName]?.(formData);
            }
        } else {
            const ruleEngineConfig =
                field?.preps?.ruleEngineConfig || field?.ruleEngineConfig;
            if (ruleEngineConfig?.formId) {
                buttonRuleEngineDispatcher(context, formData, evtName);
                return;
            }
            emits("selfFunc", currentData);
        }
    }
};

// ==================== 禁用检查 ====================

/** 检查是否禁用 */
const checkIsDisabled = (attrs: any) => {
    const {field} = attrs;
    const fieldName = field.fieldName;
    const isExplicitlyDisabled =
        attrs?.disabled || field.disabled || field.preps?.disabled;
    const editDisabled =
        (attrs.editDisabled || field.editDisabled || field.preps?.editDisabled) &&
        field.preps?.starHorseFieldSource != 1;
    const isImplicitlyDisabled =
        !attrs?.formData?.[`_${fieldName}Editable`] && field?.preps?.disabled;
    return (
        editDisabled === true ||
        isExplicitlyDisabled === true ||
        isImplicitlyDisabled === true ||
        attrs.source == 3
    );
};

// ==================== 表单字段绑定 ====================

const useFormField = (context: any, field: any) => {
    const fieldName = computed(() => field.fieldName);
    const updateFormData = (value: any) => {
        const newData = context.attrs.formData;
        newData[fieldName.value] = value;
    };

    return {
        fieldValue: computed({
            get: () => context.attrs.formData[fieldName.value],
            set: updateFormData,
        }),
    };
};

// ==================== 初始化事件 ====================

const initRelationEvent = (props: any, formData: any, needWatch?: boolean) => {
    const dataRelation = props.field.preps?.dataRelation;
    const actionName = dataRelation?.actionName;
    if (actionName) {
        if (
            (Object.keys(formData.value || {}).length == 0 ||
                !formData.value?.[props.field?.fieldName]) &&
            needWatch
        ) {
            const stop = watch(
                () => formData.value?.[props.field?.fieldName],
                (val) => {
                    if (val) {
                        relationEventDispatcher(
                            props,
                            dataRelation,
                            val,
                            formData,
                            actionName,
                        );
                        stop();
                    }
                },
                {immediate: true},
            );
            return;
        }
        relationEvent(
            props,
            dataRelation,
            formData.value[props.field.fieldName],
            formData,
            actionName,
        );
    }
};

const initCompCallEvent = (props: any, emits: any, formData: any) => {
    const events: string[] = Object.keys(props.field.actions || {});
    if (
        !props.isSearch &&
        !props.field?.preps?.["stopInitCallAction"] &&
        events?.length > 0
    ) {
        if (
            Object.keys(formData.value || {}).length == 0 ||
            !formData.value[props.field.fieldName]
        ) {
            const stop = watch(
                () => formData.value[props.field.fieldName],
                (val) => {
                    if (val) {
                        doInitCallEvent(props, emits, formData);
                        initRelationEvent(props, val, false);
                        stop();
                    }
                },
                {immediate: true},
            );
            return;
        }
        doInitCallEvent(props, emits, formData);
    }
    initRelationEvent(props, formData, true);
};

const doInitCallEvent = (props: any, emits: any, formData: any) => {
    const events: string[] = Object.keys(props.field.actions || {});
    if (props.field?.preps?.["starHorseFieldSource"] == 5) {
        return;
    }
    events?.forEach((event) => {
        allAction(props, emits, unref(formData), event, true);
    });
};

// ==================== 工具函数 ====================

const isNaN = (value: any) => {
    return value !== value;
};

const isReadOnly = (obj: any, prop: string) => {
    const descriptor = Object.getOwnPropertyDescriptor(obj, prop);
    if (!descriptor) return false;
    return descriptor.writable === false;
};

const prepsFilter = (preps: any) => {
    if (!preps || Object.keys(preps).length == 0) return {};

    Object.keys(preps).forEach((key) => {
        const prep = preps[key];
        if (
            (prep === undefined || prep === null || prep === "" || isNaN(prep)) &&
            !isReadOnly(preps, key)
        ) {
            delete preps[key];
        }

        if (prep === "false" || prep === "true") {
            preps[key] = Boolean(prep);
        }
    });
    return preps;
};

const convertData = (data: any) => {
    if (typeof data === "string") {
        try {
            return JSON5.parse(data);
        } catch (error) {
            console.error(error);
            return [];
        }
    }
    return data;
};
/**
 * 自定义事件
 * @param action
 * @param props
 * @param emits
 * @param formData
 */
const userActionEvent = (action: PreOrPendEventConfig,props:any,emits:any,formData:any) => {
    if (action.eventType === "custom") {
        buttonAction(props, emits, formData, action.customCode);
    } else if (action.eventType === "linkage" || action.eventType === "dataSource") {
        apiLinkageOperation(action.dataRelation?.apiLinkage, formData);
    } else if (action.eventType === "function") {
        action.funcInfo?.(props, formData, props.formInfo);
    } else {
        console.error("Unknown action: ", action);
    }
};
// ==================== 导出 ====================

export {
    allAction,
    buttonAction,
    buttonRuleEngineDispatcher,
    checkIsDisabled,
    initCompCallEvent,
    prepsFilter,
    relationEvent,
    relationEventDispatcher,
    ruleEngineDispatcher,
    parseRuleEngineActions,
    applyRuleEngineActionsToFields,
    useFormField,
    convertData,
    executeFormulaWithFill,
    initFormFormulaWatchers,
    setupFormulaWatchers,
    userActionEvent
};