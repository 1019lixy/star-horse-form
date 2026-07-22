# ==================== shplugin 类型修复 ====================
# 修复 ItemPreps.ts 中 RelationDetail 接口缺少 ruleEngineConfig 和缺失的 controlCondition 值
#
# 执行方式：在 shplugin 根目录下执行
#   cd e:\lixycode\shplugin
#   PowerShell -ExecutionPolicy Bypass -File .\shplugin_types_fix.ps1

$ErrorActionPreference = "Stop"
$file = "$PSScriptRoot\src\components\types\ItemPreps.ts"

$content = Get-Content -Path $file -Raw -Encoding UTF8

# 1. 补充 controlCondition 联合类型中缺失的值
$content = $content -replace '"assignValue"', '"eqUnRequired" | "assignValue" | "ruleHide" | "ruleVisible" | "ruleDisable" | "ruleEditable" | "ruleRequired" | "ruleUnRequired" | "ruleEngine"'

# 2. 在 RelationDetail 接口末尾（isWorking 之前）添加 ruleEngineConfig
$content = $content -replace '/\*\*\s*\n\s+\*\s*多次事件是否 working\s*\n\s+\*/', '/** 规则引擎配置（ruleEngine / buttonRuleEngine 专用） */' + "`n  ruleEngineConfig?: { formId?: string; triggerEvent?: string; apiBasePath?: string; };" + "`n  /**`n   * 多次事件是否 working`n   */"

Set-Content -Path $file -Value $content -Encoding UTF8 -NoNewline

Write-Host "ItemPreps.ts 修复完成" -ForegroundColor Green