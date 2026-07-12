# Internationalization Changes Summary

## Overview
All 10 dialog components in `src/components/rule/dialogs/` have been internationalized by replacing hardcoded Chinese text with i18n function calls.

## Modified Files

1. **GatewayConfigDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, placeholders, button text, and validation messages
   - Keys: `rule.dialog.gatewayConfig`, `rule.lbl.gatewayName`, `rule.lbl.gatewayType`, etc.

2. **ConditionEditDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title (conditional), form labels, placeholders, operator labels, and validation messages
   - Keys: `rule.dialog.editCondition`, `rule.dialog.addCondition`, `rule.lbl.fieldName`, `rule.lbl.operator`, etc.

3. **RulePropertyDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, placeholders, radio button labels, and validation messages
   - Keys: `rule.dialog.ruleProperty`, `rule.lbl.ruleCode`, `rule.lbl.ruleName`, `rule.lbl.ruleType`, etc.

4. **HttpCallDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, placeholders, button text, and validation messages
   - Keys: `rule.dialog.httpCallConfig`, `rule.lbl.requestMethod`, `rule.lbl.requestHeaders`, etc.

5. **ActionEditDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title (conditional), form labels, placeholders, action type groups, and validation messages
   - Keys: `rule.dialog.editAction`, `rule.dialog.addAction`, `rule.lbl.actionType`, `rule.lbl.targetField`, etc.

6. **ScriptEditDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, placeholders, help text, and validation messages
   - Keys: `rule.dialog.scriptEdit`, `rule.lbl.scriptLang`, `rule.lbl.scriptContent`, etc.

7. **VariableAssignDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, table column labels, button text, placeholders, and warning messages
   - Keys: `rule.dialog.variableAssignConfig`, `rule.lbl.variableName`, `rule.lbl.valueType`, etc.

8. **RuleTestDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, button text, status labels, and success/error messages
   - Keys: `rule.dialog.ruleTestExecution`, `rule.lbl.testData`, `rule.btn.executeTest`, etc.

9. **RuleSetRefDialog.vue**
   - Added `import { i18n } from '@/lang'`
   - Replaced dialog title, form labels, placeholders, radio button labels, and validation messages
   - Keys: `rule.dialog.ruleSetRefConfig`, `rule.lbl.ruleSet`, `rule.lbl.paramMode`, etc.

10. **LoopConfigDialog.vue**
    - Added `import { i18n } from '@/lang'`
    - Replaced dialog title, form labels, placeholders, help text, and validation messages
    - Keys: `rule.dialog.loopNodeConfig`, `rule.lbl.collectionVarName`, `rule.lbl.currentItemVarName`, etc.

## i18n Key Patterns Used

### Dialog Titles
- `rule.dialog.conditionEdit`, `rule.dialog.actionEdit`, `rule.dialog.gatewayConfig`, etc.

### Form Labels
- `rule.lbl.fieldName`, `rule.lbl.operator`, `rule.lbl.value`, `rule.lbl.ruleCode`, etc.

### Buttons
- `rule.btn.save`, `rule.btn.cancel`, `rule.btn.add`, `rule.btn.executeTest`, etc.

### Placeholders
- `rule.ph.enterValue`, `rule.ph.selectOption`, `rule.ph.enterFieldName`, etc.

### Validation Messages
- Used same placeholder keys for validation messages (e.g., `rule.ph.enterFieldName`)

### Status/Result Labels
- `rule.dialog.success`, `rule.dialog.failed`, `rule.dialog.satisfied`, `rule.dialog.notSatisfied`, etc.

## Next Steps

To complete the internationalization, you need to:

1. Add all the i18n keys to `src/lang/zh_CN.ts` with Chinese translations
2. Add all the i18n keys to `src/lang/en_US.ts` with English translations

Example structure for `zh_CN.ts`:
```typescript
export default {
  rule: {
    dialog: {
      gatewayConfig: '网关分支配置',
      editCondition: '编辑条件',
      addCondition: '添加条件',
      // ... more keys
    },
    lbl: {
      gatewayName: '网关名称',
      fieldName: '字段名',
      operator: '操作符',
      // ... more keys
    },
    ph: {
      enterGatewayName: '请输入网关名称',
      enterFieldName: '请输入字段名',
      // ... more keys
    },
    btn: {
      save: '保存',
      cancel: '取消',
      add: '添加',
      // ... more keys
    }
  }
}
```

Example structure for `en_US.ts`:
```typescript
export default {
  rule: {
    dialog: {
      gatewayConfig: 'Gateway Branch Configuration',
      editCondition: 'Edit Condition',
      addCondition: 'Add Condition',
      // ... more keys
    },
    lbl: {
      gatewayName: 'Gateway Name',
      fieldName: 'Field Name',
      operator: 'Operator',
      // ... more keys
    },
    ph: {
      enterGatewayName: 'Please enter gateway name',
      enterFieldName: 'Please enter field name',
      // ... more keys
    },
    btn: {
      save: 'Save',
      cancel: 'Cancel',
      add: 'Add',
      // ... more keys
    }
  }
}
```

## Notes

- All user-visible text has been replaced with i18n calls
- The i18n function is imported from `@/lang`
- Template text uses `{{ i18n('key') }}` syntax
- Attribute values use `:attribute="i18n('key')"` syntax
- Script section text uses `i18n('key')` directly
- Some keys support parameters (e.g., `i18n('rule.dialog.executionCompleted', count)`)
