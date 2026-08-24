<template>
  <div
    class="generic-node"
    :class="{ highlighted: data.__highlighted, dimmed: data.__dimmed }"
  >
    <Handle type="target" :position="Position.Top" class="node-handle" />
    <div class="node-card" :style="{ borderLeftColor: categoryColor }">
      <div class="node-header">
        <span class="node-icon" :style="{ color: categoryColor }">{{
          nodeDef?.icon || "⬡"
        }}</span>
        <span class="node-title">{{
          nodeDef?.label
            ? i18n(nodeDef.label)
            : data.__nodeType || i18n("rule.node.unknown")
        }}</span>
        <span class="node-cat" :style="{ color: categoryColor }">{{
          categoryName
        }}</span>
      </div>
      <div class="node-content">
        <!-- 动态显示关键配置摘要 -->
        <div v-if="summary" class="node-summary">{{ summary }}</div>
        <div v-else class="node-empty">
          {{ i18n("rule.node.doubleClickEdit") }}
        </div>
      </div>
    </div>
    <Handle type="source" :position="Position.Bottom" class="node-handle" />
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {Handle, Position} from "../compat";
import {NODE_CATEGORIES, NODE_TYPE_MAP} from "../nodeTypes";
import {i18n} from "@/lang";

const props = defineProps<{
  id: string;
  type: string;
  data: any;
}>();

// 节点的实际类型存在 data.__nodeType 中（因为Vue Flow的type字段统一为'generic'）
const actualType = computed(() => props.data?.__nodeType || props.type);
const nodeDef = computed(() => NODE_TYPE_MAP[actualType.value]);
const categoryColor = computed(() => {
  if (nodeDef.value) {
    const cat = NODE_CATEGORIES.find((c) =>
      c.nodes.some((n) => n.type === actualType.value),
    );
    return cat?.color || "#64748b";
  }
  return "#64748b";
});
const categoryName = computed(() => {
  const cat = NODE_CATEGORIES.find((c) =>
    c.nodes.some((n) => n.type === actualType.value),
  );
  return cat?.name || "";
});

// 根据节点类型生成配置摘要
const summary = computed(() => {
  const d = props.data;
  if (!d) return "";
  switch (actualType.value) {
    case "http-call":
      return `${d.httpMethod || "GET"} ${d.url || "?"}`;
    case "start":
      return i18n("rule.exec.flowStart");
    case "end":
      return i18n("rule.exec.flowEnd");
    case "condition":
      return `${d.conditions?.length || 0}${i18n("rule.lbl.conditionCount")} (${d.logic})`;
    case "action":
      return `${d.actions?.length || 0}${i18n("rule.lbl.actionCount")}`;
    case "variable-assign":
      return `${d.assignments?.length || 0}${i18n("rule.lbl.itemAssignCount")}`;
    default:
      return "";
  }
});
</script>

<style scoped lang="scss">
@use "../styles/design-tokens.scss" as tokens;

.generic-node {
  .node-card {
    min-width: tokens.$rd-node-min-width;
    max-width: tokens.$rd-node-max-width;
    background: tokens.$rd-bg-surface;
    border: 1px solid tokens.$rd-border;
    border-left: 3px solid tokens.$rd-text-secondary;
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

  .node-header {
    display: flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    padding: tokens.$rd-space-2 tokens.$rd-space-3;
    background: tokens.$rd-bg-surface;
    border-bottom: 1px solid tokens.$rd-divider;

    .node-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 tokens.$rd-space-1;
      background: tokens.$rd-bg-subtle;
      border: 1px solid tokens.$rd-divider;
      border-radius: tokens.$rd-radius-sm;
      font-size: tokens.$rd-font-md;
    }

    .node-title {
      flex: 1;
      font-size: tokens.$rd-font-sm;
      font-weight: tokens.$rd-font-weight-semibold;
      color: tokens.$rd-text-secondary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-cat {
      font-size: tokens.$rd-font-xs;
      font-weight: tokens.$rd-font-weight-medium;
    }
  }

  .node-content {
    padding: tokens.$rd-space-2 tokens.$rd-space-3;
    min-height: 28px;

    .node-summary {
      font-size: tokens.$rd-font-xs;
      color: tokens.$rd-text-secondary;
      font-family: "JetBrains Mono", monospace;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .node-empty {
      font-size: tokens.$rd-font-xs;
      color: tokens.$rd-text-tertiary;
      font-style: italic;
    }
  }

  .node-handle {
    width: 10px;
    height: 10px;
    background: tokens.$rd-primary;
    border: 2px solid tokens.$rd-bg-surface;

    &:hover {
      background: tokens.$rd-primary-hover;
    }
  }

  &.highlighted .node-card {
    border-color: tokens.$rd-success;
    box-shadow: 0 0 0 2px tokens.$rd-success;
    animation: node-pulse 1.5s ease-in-out infinite;
  }

  &.dimmed {
    opacity: 0.3;
  }
}

@keyframes node-pulse {
  0%,
  100% {
    box-shadow: 0 0 0 2px tokens.$rd-success;
  }
  50% {
    box-shadow: 0 0 0 3px tokens.$rd-success;
  }
}
</style>
