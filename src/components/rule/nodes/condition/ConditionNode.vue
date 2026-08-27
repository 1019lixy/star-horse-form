<template>
  <div class="condition-node" @dblclick="$emit('edit')">
    <Handle type="target" :position="Position.Top" />
    <div class="node-card" :style="cardStyle">
      <div class="node-header">
        <svg
          class="header-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="header-title">{{ i18n("rule.node.condition") }}</span>
        <el-tag
          :type="data.logic === 'OR' ? 'warning' : 'primary'"
          class="logic-tag"
        >
          {{ data.logic || "AND" }}
        </el-tag>
        <el-button type="primary" link @click.stop="addGroup" class="header-btn" title="添加条件组">
          <el-icon><FolderAdd /></el-icon>
        </el-button>
        <el-button
          type="primary"
          link
          @click.stop="$emit('edit')"
          class="header-btn"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
      </div>
      <div class="node-body" :style="bodyStyle">
        <div
          v-if="!data.conditions || data.conditions.length === 0"
          class="empty-tip"
        >
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n("rule.node.condEmptyTip") }}</span>
        </div>
        <div v-else class="condition-list">
          <template v-for="(item, index) in data.conditions" :key="index">
            <!-- 条件组 -->
            <div v-if="item.type === 'group'" class="condition-group">
              <div class="group-strip">
                <el-tag :type="item.logic === 'OR' ? 'warning' : 'primary'" size="small" effect="dark">
                  {{ item.logic || "AND" }}
                </el-tag>
                <div class="group-strip-actions">
                  <el-button type="primary" link size="small" @click.stop="addGroupCond(index)" title="添加条件">
                    <el-icon><Plus /></el-icon>
                  </el-button>
                </div>
              </div>
              <div class="group-conditions">
                <div
                  v-for="(gc, gIdx) in (item.conditions || [])"
                  :key="gIdx"
                  class="group-cond-row"
                >
                  <span class="gc-field">{{ gc.fieldLabel || gc.fieldName || "-" }}</span>
                  <span class="gc-op">{{ getOperatorSymbol(gc.operator) }}</span>
                  <span class="gc-val">{{ gc.value || "-" }}</span>
                  <div class="gc-actions">
                    <el-button type="primary" link size="small" @click.stop="editGroupCond(index, Number(gIdx))">
                      <el-icon><Edit /></el-icon>
                    </el-button>
                    <el-button type="danger" link size="small" @click.stop="removeGroupCond(index, Number(gIdx))">
                      <el-icon><Delete /></el-icon>
                    </el-button>
                  </div>
                </div>
                <div v-if="!item.conditions || item.conditions.length === 0" class="group-empty-line">
                  空组
                </div>
              </div>
            </div>
            <!-- 根级条件 -->
            <div v-else class="condition-item">
              <div class="logic-badge" v-if="index > 0 && data.logic">
                {{ data.logic }}
              </div>
              <div class="cond-content">
                <span class="cond-field">{{
                  item.fieldLabel || item.fieldName || i18n("rule.lbl.fieldName")
                }}</span>
                <span class="cond-operator">{{
                  getOperatorSymbol(item.operator)
                }}</span>
                <span class="cond-value">{{
                  item.valueType === "VARIABLE"
                    ? item.valueField
                    : item.value || "-"
                }}</span>
              </div>
              <div class="cond-actions">
                <el-button
                  type="primary"
                  link
                  @click.stop="$emit('editCondition', index)"
                >
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click.stop="$emit('deleteCondition', index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
          </template>
        </div>
      </div>
      <div class="resize-handle" @mousedown.stop="onResizeStart"></div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
    <!-- 组内条件编辑弹窗 -->
    <ConditionEditDialog
      v-if="inlineEditor.visible"
      :visible="true"
      :condition="inlineEditor.condition"
      :variables="variables"
      @save="onInlineSave"
      @close="inlineEditor.visible = false"
    />
  </div>
</template>

<script setup lang="ts">
import {Handle, Position} from "../../compat";
import {Delete, Edit, FolderAdd, InfoFilled, Plus} from "@element-plus/icons-vue";
import {i18n} from "@/lang";
import {useNodeResize} from "../../utils/useNodeResize";
import {reactive, inject, type Ref} from "vue";
import ConditionEditDialog from "./ConditionEditDialog.vue";

defineOptions({
  name: "ConditionNode",
});

const props = defineProps<{
  id?: string;
  data: {
    conditions: any[];
    logic: string;
    __width?: number;
    __height?: number;
  };
}>();

const emit = defineEmits<{
  (e: "edit"): void;
  (e: "editCondition", index: number): void;
  (e: "deleteCondition", index: number): void;
  (e: "updateNodeData", patch: Record<string, any>): void;
}>();

const { cardStyle, bodyStyle, onResizeStart } = useNodeResize(props.data);

const injectedVars = inject<Ref<any[]> | any[] | undefined>("ruleVariables", undefined);
const variables = (injectedVars as any)?.value ?? injectedVars ?? [];

// 节点内组条件编辑
const inlineEditor = reactive<{
  visible: boolean;
  condition: any;
  groupIdx: number;
  condIdx: number;
  isAdd: boolean;
}>({
  visible: false,
  condition: null,
  groupIdx: -1,
  condIdx: -1,
  isAdd: false,
});

const addGroup = () => {
  const list = [...(props.data.conditions || [])];
  list.push({type: "group", logic: "AND", conditions: []});
  emit("updateNodeData", {conditions: list});
};

const addGroupCond = (groupIdx: number) => {
  inlineEditor.condition = null;
  inlineEditor.groupIdx = groupIdx;
  inlineEditor.condIdx = -1;
  inlineEditor.isAdd = true;
  inlineEditor.visible = true;
};

const editGroupCond = (groupIdx: number, condIdx: number) => {
  const group = props.data.conditions?.[groupIdx];
  inlineEditor.condition = group?.conditions?.[condIdx] ?? null;
  inlineEditor.groupIdx = groupIdx;
  inlineEditor.condIdx = condIdx;
  inlineEditor.isAdd = false;
  inlineEditor.visible = true;
};

const removeGroupCond = (groupIdx: number, condIdx: number) => {
  const list = [...(props.data.conditions || [])];
  const group = list[groupIdx];
  if (group?.type === "group") {
    const gc = [...(group.conditions || [])];
    gc.splice(condIdx, 1);
    list[groupIdx] = {...group, conditions: gc};
    emit("updateNodeData", {conditions: list});
  }
};

const onInlineSave = (c: any) => {
  const list = [...(props.data.conditions || [])];
  const group = list[inlineEditor.groupIdx];
  if (group?.type === "group") {
    const gc = [...(group.conditions || [])];
    if (inlineEditor.isAdd) {
      gc.push(c);
    } else {
      gc[inlineEditor.condIdx] = c;
    }
    list[inlineEditor.groupIdx] = {...group, conditions: gc};
    emit("updateNodeData", {conditions: list});
  }
  inlineEditor.visible = false;
};

const getOperatorSymbol = (op: string) => {
  const map: Record<string, string> = {
    EQ: "=",
    NEQ: "≠",
    GT: ">",
    GTE: "≥",
    LT: "<",
    LTE: "≤",
    CONTAINS: i18n("rule.opt.contains"),
    NOT_CONTAINS: i18n("rule.opt.notContains"),
    STARTS_WITH: i18n("rule.opt.startsWith"),
    ENDS_WITH: i18n("rule.opt.endsWith"),
    IN: "∈",
    NOT_IN: "∉",
    IS_NULL: i18n("rule.opt.isNull"),
    IS_NOT_NULL: i18n("rule.opt.isNotNull"),
    BETWEEN: i18n("rule.opt.between"),
  };
  return map[op] || op;
};
</script>

<style scoped lang="scss">
@use "../../styles/design-tokens.scss" as tokens;

.condition-node {
  .node-card {
    position: relative;
    min-width: tokens.$rd-node-min-width;
    max-width: 600px;
    background: tokens.$rd-bg-surface;
    border: 1px solid tokens.$rd-border;
    border-radius: tokens.$rd-radius-lg;
    box-shadow: tokens.$rd-shadow-xs;
    overflow: hidden;
    transition:
      box-shadow tokens.$rd-transition-base,
      border-color tokens.$rd-transition-base;

    &:hover {
      border-color: tokens.$rd-primary-border;
      box-shadow: tokens.$rd-shadow-sm;
    }
  }

  .resize-handle {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 14px;
    height: 14px;
    cursor: se-resize;
    z-index: 10;
    opacity: 0;
    transition: opacity tokens.$rd-transition-fast;

    &::after {
      content: "";
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      border-right: 2px solid tokens.$rd-text-tertiary;
      border-bottom: 2px solid tokens.$rd-text-tertiary;
      border-bottom-right-radius: 2px;
    }
  }

  .node-card:hover .resize-handle {
    opacity: 1;
  }

  .node-header {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    padding: tokens.$rd-space-2 tokens.$rd-space-4;
    background: rgba(37, 99, 235, 0.08);
    color: tokens.$rd-node-condition;
    border-bottom: 1px solid tokens.$rd-divider;

    .header-icon {
      width: 18px;
      height: 18px;
    }

    .header-title {
      flex: 1;
      font-size: tokens.$rd-font-base;
      font-weight: tokens.$rd-font-weight-semibold;
    }

    .logic-tag {
      font-size: tokens.$rd-font-xs;
      font-weight: tokens.$rd-font-weight-semibold;
    }

    .header-btn {
      color: tokens.$rd-node-condition;
      font-size: tokens.$rd-font-lg;
      &:hover {
        color: tokens.$rd-node-condition;
        opacity: 0.8;
      }
    }
  }

  .node-body {
    padding: 6px 8px;
    min-height: 40px;

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: tokens.$rd-space-2;
      padding: tokens.$rd-space-3 0;
      color: tokens.$rd-text-tertiary;
      font-size: tokens.$rd-font-sm;
      .empty-icon { font-size: tokens.$rd-font-md; }
    }

    .condition-list {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .condition-item {
        position: relative;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 8px;
        background: rgba(37, 99, 235, 0.05);
        border-radius: 4px;
        border: 1px solid rgba(37, 99, 235, 0.12);
        transition: background 0.15s, border-color 0.15s;

        &:hover {
          border-color: rgba(37, 99, 235, 0.24);
          background: rgba(37, 99, 235, 0.09);
        }

        .logic-badge {
          position: absolute;
          top: -10px;
          left: 50%;
          transform: translateX(-50%);
          padding: 1px 6px;
          background: tokens.$rd-node-condition;
          color: tokens.$rd-text-inverse;
          font-size: 10px;
          font-weight: 600;
          border-radius: 8px;
          line-height: 14px;
        }

        .cond-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          min-width: 0;

          .cond-field {
            color: tokens.$rd-node-condition;
            font-weight: 600;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          .cond-operator {
            color: tokens.$rd-text-tertiary;
            flex-shrink: 0;
          }
          .cond-value {
            color: tokens.$rd-text-secondary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .cond-actions {
          display: flex;
          gap: 2px;
          flex-shrink: 0;
        }
      }

      /* 条件组：紧凑括号样式 */
      .condition-group {
        border: 1px solid rgba(99, 102, 241, 0.28);
        border-radius: 6px;
        background: rgba(99, 102, 241, 0.03);
        overflow: hidden;

        .group-strip {
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 2px 6px;
          background: rgba(99, 102, 241, 0.08);
          border-bottom: 1px solid rgba(99, 102, 241, 0.14);
          min-height: 22px;

          .group-strip-actions {
            margin-left: auto;
            display: flex;
            gap: 2px;
            :deep(.el-button) { padding: 0 2px; height: 16px; }
            :deep(.el-icon) { font-size: 11px; }
          }
        }

        .group-conditions {
          padding: 4px 6px;
          display: flex;
          flex-direction: column;
          gap: 3px;
        }

        .group-empty-line {
          text-align: center;
          color: #94a3b8;
          font-size: 11px;
          padding: 4px 0;
          background: rgba(255,255,255,0.5);
          border-radius: 3px;
          border: 1px dashed #c7d2fe;
        }

        .group-cond-row {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 3px 6px;
          background: rgba(255,255,255,0.7);
          border-radius: 4px;
          border: 1px solid rgba(99, 102, 241, 0.1);
          font-size: 11px;

          &:hover {
            background: rgba(255,255,255,0.95);
            border-color: rgba(99, 102, 241, 0.22);
          }

          .gc-field { color: #4338ca; font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .gc-op { color: tokens.$rd-text-tertiary; flex-shrink: 0; font-family: monospace; font-size: 10px; }
          .gc-val { color: tokens.$rd-text-secondary; flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
          .gc-actions {
            display: flex; gap: 2px; flex-shrink: 0;
            :deep(.el-button) { padding: 0 2px; height: 16px; }
            :deep(.el-icon) { font-size: 11px; }
          }
        }
      }
    }
  }
}

</style>