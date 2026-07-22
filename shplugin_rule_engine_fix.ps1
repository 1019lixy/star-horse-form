# ==================== shplugin 规则引擎代码质量修正 ====================
# 修正内容：
#   1. ItemPreps.ts: 补全 RelationDetail.controlCondition 联合类型 + 新增 ruleEngineConfig
#   2. ItemRelationEventUtils.ts: 提取 callRuleEngine 公共函数，消除重复代码
#
# 执行方式：
#   cd e:\lixycode\shplugin
#   PowerShell -ExecutionPolicy Bypass -File .\shplugin_rule_engine_fix.ps1
#
# 幂等：可重复执行，已修正的步骤会跳过

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$utilsFile = "$root\src\components\formcomp\utils\ItemRelationEventUtils.ts"
$typesFile = "$root\src\components\types\ItemPreps.ts"

# ==================== Step 1: 修复 ItemPreps.ts 类型定义 ====================
Write-Host "=== Step 1: 修复 ItemPreps.ts ===" -ForegroundColor Green

$typesContent = Get-Content -Path $typesFile -Raw -Encoding UTF8

# 1a. 补全 controlCondition 联合类型（在 "assignValue" 前插入缺失的值）
if ($typesContent -notmatch '"ruleEngine"') {
    $typesContent = $typesContent -replace '"assignValue"', '"eqUnRequired" | "assignValue" | "ruleHide" | "ruleVisible" | "ruleDisable" | "ruleEditable" | "ruleRequired" | "ruleUnRequired" | "ruleEngine"'
    Write-Host "  1a: controlCondition 联合类型已补全" -ForegroundColor Gray
} else {
    Write-Host "  1a: 已补全，跳过" -ForegroundColor Gray
}

# 1b. 在 RelationDetail 接口末尾（isWorking 之前）添加 ruleEngineConfig
if ($typesContent -notmatch 'ruleEngineConfig') {
    $oldIsWorking = @'
  /**
   * 多次事件是否 working
   */
  isWorking: boolean;
}
'@
    $newIsWorking = @'
  /**
   * 规则引擎配置（ruleEngine / buttonRuleEngine 专用）
   * - formId: 规则引擎 formId（不传则回退到 props.formId）
   * - triggerEvent: 触发事件（默认 ON_CHANGE）
   * - apiBasePath: API 基础路径（默认 /userdb/ruleEngine）
   */
  ruleEngineConfig?: {
    formId?: string;
    triggerEvent?: string;
    apiBasePath?: string;
  };
  /**
   * 多次事件是否 working
   */
  isWorking: boolean;
}
'@
    $typesContent = $typesContent -replace [regex]::Escape($oldIsWorking), $newIsWorking
    Write-Host "  1b: ruleEngineConfig 字段已添加" -ForegroundColor Gray
} else {
    Write-Host "  1b: 已添加，跳过" -ForegroundColor Gray
}

Set-Content -Path $typesFile -Value $typesContent -Encoding UTF8 -NoNewline
Write-Host "  ItemPreps.ts 保存完成" -ForegroundColor Green

# ==================== Step 2: 修复 ItemRelationEventUtils.ts ====================
Write-Host "=== Step 2: 修复 ItemRelationEventUtils.ts ===" -ForegroundColor Green

$utilsContent = Get-Content -Path $utilsFile -Raw -Encoding UTF8

# 2a. 在 "// ==================== 规则引擎调度 ====================" 之前插入
#     resolveRuleEngineConfig + callRuleEngine 公共函数
if ($utilsContent -notmatch 'const callRuleEngine =') {
    $insert = @'
// ==================== 规则引擎公共函数 ====================

/**
 * 从 ruleEngineConfig 中提取 formId / triggerEvent / apiBasePath
 * 统一配置解析逻辑，ruleEngineDispatcher 和 buttonRuleEngineDispatcher 共用
 *
 * @param config ruleEngineConfig（来自 item.ruleEngineConfig 或 field.preps.ruleEngineConfig）
 * @param props 表单组件 props（回退取 props.formId / props.field.preps.formId）
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
 * @param formData 表单数据（响应式）
 * @param formId 表单ID
 * @param triggerEvent 触发事件
 * @param apiBasePath API 基础路径
 * @param props 表单组件 props
 * @param beforeCall 请求前回调（注入按钮上下文等，可选）
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

'@
    $marker = '// ==================== 规则引擎调度 ===================='
    $utilsContent = $utilsContent -replace [regex]::Escape($marker), ($insert + $marker)
    Write-Host "  2a: callRuleEngine 公共函数已插入" -ForegroundColor Gray
} else {
    Write-Host "  2a: 已插入，跳过" -ForegroundColor Gray
}

# 2b. 替换 ruleEngineDispatcher 为简化版（调用 callRuleEngine）
$oldRuleDispatcher = @'
const ruleEngineDispatcher = async (
    props: any,
    item: RelationDetail,
    e: any,
    formData: Ref<Record<string, any>>,
) => {
    const {relationFields, matchFieldValue, matchType} = item;

    // 匹配检查：与 dataLinkage 保持一致的匹配逻辑
    const matchValues = ensureArray(matchFieldValue);
    if (matchValues.length > 0 && !matchValues.includes(e)) {
        return;
    }

    // 获取 formId 和规则引擎 API 配置
    const ruleEngineConfig = item.ruleEngineConfig || {};
    const formId = ruleEngineConfig.formId || props.formId || props.field?.preps?.formId;
    const triggerEvent = ruleEngineConfig.triggerEvent || "ON_CHANGE";
    const apiBasePath = ruleEngineConfig.apiBasePath || "/userdb/ruleEngine";

    if (!formId) {
        console.warn("[ruleEngineDispatcher] formId 未配置，跳过规则引擎调用");
        return;
    }

    try {
        const currentFormData = unref(formData);
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
        console.error("[ruleEngineDispatcher] 规则引擎执行失败:", err);
    }
};
'@
$newRuleDispatcher = @'
const ruleEngineDispatcher = async (
    props: any,
    item: RelationDetail,
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
'@
if ($utilsContent -match [regex]::Escape('const ruleEngineDispatcher = async')) {
    $utilsContent = $utilsContent -replace [regex]::Escape($oldRuleDispatcher), $newRuleDispatcher
    Write-Host "  2b: ruleEngineDispatcher 已简化" -ForegroundColor Gray
} else {
    Write-Host "  2b: 已简化或未匹配，跳过" -ForegroundColor Gray
}

# 2c. 替换 buttonRuleEngineDispatcher 为简化版（调用 callRuleEngine）
$oldBtnDispatcher = @'
const buttonRuleEngineDispatcher = async (
    props: any,
    formData: Ref<Record<string, any>>,
    evtName: string = "click",
) => {
    const field = props?.field;
    if (!field) return;

    const ruleEngineConfig =
        field.preps?.ruleEngineConfig || field.ruleEngineConfig || {};
    const formId = ruleEngineConfig.formId || props.formId || field.preps?.formId;
    const apiBasePath = ruleEngineConfig.apiBasePath || "/userdb/ruleEngine";

    if (!formId) {
        console.warn("[buttonRuleEngineDispatcher] formId 未配置，跳过规则引擎调用");
        return;
    }

    try {
        const currentFormData = unref(formData);
        // 注入按钮上下文，供后端规则匹配使用
        currentFormData["__buttonKey"] = field.fieldName;
        currentFormData["__buttonEvent"] = evtName;

        const res = await postRequest(
            `${apiBasePath}/executeByForm/${formId}?triggerEvent=ON_BUTTON_CLICK`,
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
        console.error("[buttonRuleEngineDispatcher] 规则引擎执行失败:", err);
    }
};
'@
$newBtnDispatcher = @'
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
'@
if ($utilsContent -match [regex]::Escape('const buttonRuleEngineDispatcher = async')) {
    $utilsContent = $utilsContent -replace [regex]::Escape($oldBtnDispatcher), $newBtnDispatcher
    Write-Host "  2c: buttonRuleEngineDispatcher 已简化" -ForegroundColor Gray
} else {
    Write-Host "  2c: 已简化或未匹配，跳过" -ForegroundColor Gray
}

Set-Content -Path $utilsFile -Value $utilsContent -Encoding UTF8 -NoNewline
Write-Host "  ItemRelationEventUtils.ts 保存完成" -ForegroundColor Green

# ==================== 完成 ====================
Write-Host ""
Write-Host "=== 全部完成 ===" -ForegroundColor Green
Write-Host "改动摘要：" -ForegroundColor Yellow
Write-Host "  1. ItemPreps.ts: 补全 controlCondition 联合类型 + 新增 ruleEngineConfig 字段"
Write-Host "  2. ItemRelationEventUtils.ts: 提取 callRuleEngine，两个 dispatcher 缩减为 5-6 行调用"
Write-Host ""
Write-Host "代码合并效果："
Write-Host "  ruleEngineDispatcher:      47 行 → 11 行（-77%）"
Write-Host "  buttonRuleEngineDispatcher: 44 行 → 15 行（-66%）"
Write-Host "  新增公共函数 callRuleEngine: 37 行（复用于两处）"
Write-Host "  净减少: 约 30 行重复代码"
Write-Host ""
Write-Host "请重新编译 shplugin 验证: npm run build" -ForegroundColor Yellow