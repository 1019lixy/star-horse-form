<template>
  <div class="action-node" @dblclick="$emit('edit')">
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
            d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <span class="header-title">{{ i18n("rule.node.action") }}</span>
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
          v-if="!data.actions || data.actions.length === 0"
          class="empty-tip"
        >
          <el-icon class="empty-icon"><InfoFilled /></el-icon>
          <span>{{ i18n("rule.node.actionEmptyTip") }}</span>
        </div>
        <div v-else class="action-list">
          <div
            v-for="(action, index) in data.actions"
            :key="index"
            class="action-item"
          >
            <div class="action-index">{{ index + 1 }}</div>
            <div class="action-content">
              <el-tag
                :type="getActionTagType(action.actionType)"
                class="action-type-tag"
              >
                {{ getActionTypeName(action.actionType) }}
              </el-tag>
              <span class="action-target" v-if="action.targetField">{{
                action.targetField
              }}</span>
              <span
                class="action-value"
                v-if="
                  action.actionValue && needsValueDisplay(action.actionType)
                "
              >
                = {{ action.actionValue }}
              </span>
            </div>
            <div class="action-ops">
              <el-button
                type="primary"
                link
                @click.stop="$emit('editAction', index)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                type="danger"
                link
                @click.stop="$emit('deleteAction', index)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>
      <div class="resize-handle" @mousedown.stop="onResizeStart"></div>
    </div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>

<script setup lang="ts">
import {Handle, Position} from "../compat";
import {Delete, Edit, InfoFilled, Plus} from "@element-plus/icons-vue";
import {i18n} from "@/lang";
import {useNodeResize} from "../utils/useNodeResize";

const props = defineProps<{
  data: {
    actions: any[];
    __width?: number;
    __height?: number;
  };
}>();

const { cardStyle, bodyStyle, onResizeStart } = useNodeResize(props.data);

defineEmits<{
  (e: "edit"): void;
  (e: "editAction", index: number): void;
  (e: "deleteAction", index: number): void;
}>();

const getActionTypeName = (type: string) => {
  const map: Record<string, string> = {
    SHOW_FIELD: i18n("rule.opt.showField"),
    HIDE_FIELD: i18n("rule.opt.hideField"),
    SET_VALUE: i18n("rule.opt.setValue"),
    CLEAR_VALUE: i18n("rule.opt.clearValue"),
    SET_REQUIRED: i18n("rule.opt.setRequired"),
    SET_OPTIONS: i18n("rule.opt.setOptions"),
    SHOW_MESSAGE: i18n("rule.opt.showMessage"),
  };
  return map[type] || type;
};

const getActionTagType = (type: string) => {
  const map: Record<string, string> = {
    SHOW_FIELD: "success",
    HIDE_FIELD: "info",
    SET_VALUE: "warning",
    CLEAR_VALUE: "info",
    SET_REQUIRED: "danger",
    SET_OPTIONS: "primary",
    SHOW_MESSAGE: "",
  };
  return map[type] || "info";
};

const needsValueDisplay = (type: string) => {
  return ["SET_VALUE"].includes(type);
};
</script>

<style scoped lang="scss">
@use "../styles/design-tokens.scss" as tokens;

.action-node {
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
    background: rgba(5, 150, 105, 0.08);
    color: tokens.$rd-node-action;
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

    .header-btn {
      color: tokens.$rd-node-action;
      font-size: tokens.$rd-font-lg;

      &:hover {
        color: tokens.$rd-node-action;
        opacity: 0.8;
      }
    }
  }

  .node-body {
    padding: tokens.$rd-space-3 tokens.$rd-space-4;
    min-height: 40px;

    .empty-tip {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: tokens.$rd-space-2;
      padding: tokens.$rd-space-3 0;
      color: tokens.$rd-text-tertiary;
      font-size: tokens.$rd-font-sm;

      .empty-icon {
        font-size: tokens.$rd-font-md;
      }
    }

    .action-list {
      display: flex;
      flex-direction: column;
      gap: tokens.$rd-space-2;

      .action-item {
        display: flex;
        align-items: center;
        gap: tokens.$rd-space-2;
        padding: tokens.$rd-space-2 tokens.$rd-space-3;
        background: rgba(5, 150, 105, 0.05);
        border-radius: tokens.$rd-radius-md;
        border: 1px solid rgba(5, 150, 105, 0.12);
        transition:
          background tokens.$rd-transition-fast,
          border-color tokens.$rd-transition-fast;

        &:hover {
          border-color: rgba(5, 150, 105, 0.24);
          background: rgba(5, 150, 105, 0.09);
        }

        .action-index {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: tokens.$rd-node-action;
          color: tokens.$rd-text-inverse;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: tokens.$rd-font-xs;
          font-weight: tokens.$rd-font-weight-semibold;
          flex-shrink: 0;
        }

        .action-content {
          flex: 1;
          display: flex;
          align-items: center;
          gap: tokens.$rd-space-2;
          font-size: tokens.$rd-font-sm;
          min-width: 0;

          .action-type-tag {
            flex-shrink: 0;
          }

          .action-target {
            color: tokens.$rd-node-action;
            font-weight: tokens.$rd-font-weight-medium;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          .action-value {
            color: tokens.$rd-text-secondary;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }

        .action-ops {
          display: flex;
          gap: tokens.$rd-space-1;
          flex-shrink: 0;
        }
      }
    }
  }
}
</style>
