<script setup lang="ts" name="OutlineTree">
import { computed, ref, watch, nextTick } from "vue";
import { getDesignFormStore } from "star-horse-lowcode";
import { i18n } from "@/lang";

const designForm = getDesignFormStore();
const compList = computed(() => designForm.compList);

const searchQuery = ref("");
const treeRef = ref();
const selectedNodeId = ref<string>("");

// Container item types
const CONTAINER_TYPES = [
  "tab", "box", "table", "card",
  "dytable", "collapse", "splitter", "condition",
];

// Container display labels
const containerLabels: Record<string, string> = {
  tab: "选项卡",
  box: "栅格布局",
  table: "表格布局",
  card: "卡片",
  dytable: "动态表格",
  collapse: "折叠面板",
  splitter: "分割面板",
  condition: "条件组",
};

// ─── Helper functions ───
const getLabel = (field: any): string => {
  return (
    field.preps?.label ||
    field.preps?.itemNameLabel ||
    field.label ||
    field.itemType ||
    "未命名"
  );
};

const getName = (field: any): string => {
  return field.preps?.name || field.fieldName || "";
};

// ─── Tree data building ───

const createNode = (
  id: string,
  label: string,
  type: string,
  name: string = "",
  isContainer: boolean = false,
  children: any[] = [],
): any => ({
  id,
  label,
  type,
  name,
  isContainer,
  children,
});

/** Build tree nodes for tab/collapse/card/splitter containers */
const buildTabLikeChildren = (field: any): any[] => {
  const elements = field.preps?.elements || [];
  return elements.map((el: any, idx: number) => {
    const items = el.items || [];
    const headerItems = el.headerFieldList || [];
    const allItems = [...headerItems, ...items];

    return createNode(
      `${field.id}__el_${idx}`,
      el.label || `Tab ${idx + 1}`,
      "__panel__",
      el.tabName || "",
      false,
      allItems.map((item: any) =>
        CONTAINER_TYPES.includes(item.itemType)
          ? buildContainerNode(item)
          : createNode(item.id, getLabel(item), item.itemType, getName(item)),
      ),
    );
  });
};

/** Build tree nodes for box/dytable containers (rows -> columns -> items) */
const buildBoxLikeChildren = (field: any): any[] => {
  const elements = field.preps?.elements || [];
  return elements.flatMap((row: any, rowIdx: number) => {
    const columns = row.columns || [];
    return columns.map((col: any, colIdx: number) => {
      const items = col.items || [];
      return createNode(
        `${field.id}__cell_${rowIdx}_${colIdx}`,
        `R${rowIdx + 1}C${colIdx + 1}`,
        "__cell__",
        "",
        false,
        items.map((item: any) =>
          CONTAINER_TYPES.includes(item.itemType)
            ? buildContainerNode(item)
            : createNode(item.id, getLabel(item), item.itemType, getName(item)),
        ),
      );
    });
  });
};

/** Build tree nodes for table containers (columns -> items) */
const buildTableChildren = (field: any): any[] => {
  const elements = field.preps?.elements || [];
  return elements.map((col: any, colIdx: number) => {
    const items = col.items || [];
    return createNode(
      `${field.id}__col_${colIdx}`,
      `列 ${colIdx + 1}`,
      "__col__",
      "",
      false,
      items.map((item: any) =>
        CONTAINER_TYPES.includes(item.itemType)
          ? buildContainerNode(item)
          : createNode(item.id, getLabel(item), item.itemType, getName(item)),
      ),
    );
  });
};

/** Build tree nodes for condition containers (children[]) */
const buildConditionChildren = (field: any): any[] => {
  const children = field.children || [];
  return children.map((child: any) =>
    CONTAINER_TYPES.includes(child.itemType)
      ? buildContainerNode(child)
      : createNode(child.id, getLabel(child), child.itemType, getName(child)),
  );
};

/** Build a container node with its children based on type */
const buildContainerNode = (field: any): any => {
  const id = field.id || field.preps?.id || "";
  const label = getLabel(field);
  const type = field.itemType;
  const name = getName(field);

  let children: any[] = [];
  switch (type) {
    case "tab":
    case "collapse":
    case "card":
    case "splitter":
      children = buildTabLikeChildren(field);
      break;
    case "box":
    case "dytable":
      children = buildBoxLikeChildren(field);
      break;
    case "table":
      children = buildTableChildren(field);
      break;
    case "condition":
      children = buildConditionChildren(field);
      break;
  }

  return createNode(id, label, type, name, true, children);
};

/** Build the complete tree from compList */
const buildTree = (): any[] => {
  return compList.value.map((comp: any) => {
    if (comp.compType === "container" || CONTAINER_TYPES.includes(comp.itemType)) {
      return buildContainerNode(comp);
    }
    return createNode(
      comp.id,
      getLabel(comp),
      comp.itemType,
      getName(comp),
    );
  });
};

// ─── Reactive tree data ───
const treeData = ref<any[]>([]);
const compMap = ref<Record<string, any>>({});

const rebuildTree = () => {
  treeData.value = buildTree();

  // Build flat lookup map from compList
  const map: Record<string, any> = {};
  const traverse = (list: any[]) => {
    list.forEach((comp: any) => {
      if (comp.id) map[comp.id] = comp;
      // Traverse nested structures
      if (comp.preps?.elements) {
        comp.preps.elements.forEach((el: any) => {
          if (el.items) traverse(el.items);
          if (el.headerFieldList) traverse(el.headerFieldList);
          if (el.columns) {
            el.columns.forEach((col: any) => {
              if (col.items) traverse(col.items);
            });
          }
        });
      }
      if (comp.children) traverse(comp.children);
    });
  };
  traverse(compList.value);
  compMap.value = map;
};

// ─── Filter method for el-tree ───
const filterNode = (value: string, data: any) => {
  if (!value) return true;
  const q = value.toLowerCase();
  return (
    data.label?.toLowerCase().includes(q) ||
    data.name?.toLowerCase().includes(q) ||
    data.type?.toLowerCase().includes(q)
  );
};

// ─── Watch compList changes ───
watch(
  () => compList.value,
  () => {
    rebuildTree();
    nextTick(() => {
      if (searchQuery.value) {
        treeRef.value?.filter(searchQuery.value);
      }
    });
  },
  {
    deep: true,
    // flush: 'post' 避免在 compList 高频变化时阻塞主线程
    flush: "post",
  },
);

watch(searchQuery, (val) => {
  treeRef.value?.filter(val);
});

// ─── Node interaction ───
const handleNodeClick = (data: any) => {
  // Virtual nodes (tab panels, cells, cols) are not selectable
  if (data.type?.startsWith("__")) return;

  if (compMap.value[data.id]) {
    selectedNodeId.value = data.id;
    const comp = compMap.value[data.id];
    designForm.selectItem(comp, comp.itemType, "");
    // Trigger scroll to field in canvas (delayed to allow collapsed containers to expand first)
    nextTick(() => {
      window.dispatchEvent(
        new CustomEvent("scroll-to-field", { detail: data.id }),
      );
    });
  }
};

// Track selected component from store
watch(
  () => designForm.currentItemId,
  (newVal) => {
    if (newVal) {
      selectedNodeId.value = newVal;
    }
  },
);

// ─── Count total components ───
const totalComponents = computed(() => Object.keys(compMap.value).length);

// ─── Init ───
rebuildTree();
</script>

<template>
  <div class="outline-tree-root">
    <!-- Search Bar -->
    <div class="outline-search">
      <el-input
        v-model="searchQuery"
        :placeholder="i18n('dyform.outline.searchComponent')"
        clearable
        size="small"
      >
        <template #prefix>
          <svg class="search-icon" viewBox="0 0 16 16" fill="none" width="14" height="14">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" stroke-width="1.5"/>
            <path d="M10.5 10.5L14.5 14.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </template>
        <template #suffix>
          <span class="comp-count">{{ totalComponents }}</span>
        </template>
      </el-input>
    </div>

    <!-- Tree Content -->
    <el-scrollbar class="outline-scrollbar">
      <div v-if="treeData.length === 0" class="outline-empty">
        <svg viewBox="0 0 48 48" fill="none" width="40" height="40">
          <rect x="8" y="8" width="32" height="32" rx="4" stroke="#dce1e8" stroke-width="1.5" fill="#f5f7fa"/>
          <path d="M16 20H32M16 28H28" stroke="#c0c4cc" stroke-width="1.5" stroke-linecap="round"/>
        </svg>
        <span>{{ i18n('dyform.outline.noComponent') }}</span>
      </div>
      <el-tree
        v-else
        ref="treeRef"
        :data="treeData"
        :node-key="'id'"
        :default-expand-all="true"
        :expand-on-click-node="false"
        :highlight-current="true"
        :current-node-key="selectedNodeId"
        :filter-node-method="filterNode"
        @node-click="handleNodeClick"
        class="outline-el-tree"
      >
        <template #default="{ data }">
          <div :class="['outline-node', { 'is-container': data.isContainer, 'is-virtual': data.type?.startsWith('__') }]">
            <!-- Container expand indicator -->
            <span v-if="data.isContainer" class="node-badge container-badge">
              {{ data.type === 'tab' ? 'T' : data.type === 'box' ? 'B' : data.type === 'card' ? 'C' : data.type === 'collapse' ? 'F' : data.type === 'table' ? 'G' : data.type === 'splitter' ? 'S' : data.type === 'dytable' ? 'D' : data.type === 'condition' ? '?' : '□' }}
            </span>
            <!-- Virtual node (tab panel, cell, col) -->
            <span v-else-if="data.type?.startsWith('__')" class="node-badge virtual-badge">·</span>
            <!-- Regular item icon -->
            <span v-else class="node-dot"></span>

            <span class="node-label" :title="data.label">{{ data.label }}</span>
            <span v-if="data.name && !data.type?.startsWith('__')" class="node-name">{{ data.name }}</span>
            <span v-if="data.isContainer && data.children?.length" class="node-count">{{ data.children.length }}</span>
          </div>
        </template>
      </el-tree>
    </el-scrollbar>
  </div>
</template>

<style lang="scss" scoped>
.outline-tree-root {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* ── Search ── */
.outline-search {
  padding: 8px;
  flex-shrink: 0;
  border-bottom: 1px solid #f0f2f5;

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #e4e7ed inset;
      transition: box-shadow 0.15s ease;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px #409eff inset;
      }
    }

    .el-input__prefix {
      color: #c0c4cc;
    }
  }
}

.search-icon {
  color: #c0c4cc;
  flex-shrink: 0;
}

.comp-count {
  font-size: 11px;
  color: #c0c4cc;
  font-variant-numeric: tabular-nums;
}

/* ── Scrollbar ── */
.outline-scrollbar {
  flex: 1;
  overflow: hidden;
}

/* ── Empty State ── */
.outline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 20px;
  gap: 12px;
  color: #c0c4cc;

  span {
    font-size: 13px;
    color: #909399;
  }
}

/* ── Tree Override ── */
.outline-el-tree {
  background: transparent;
  --el-tree-node-hover-bg-color: #f0f7ff;
  --el-tree-node-content-height: 30px;

  :deep(.el-tree-node__content) {
    height: 30px;
    padding-left: 4px !important;
    border-radius: 4px;
    margin: 0 4px;
    transition: background 0.12s ease;

    &:hover {
      background: #f0f7ff;
    }

    &.is-current {
      background: #ecf5ff;

      .outline-node .node-label {
        color: #409eff;
        font-weight: 500;
      }
    }
  }

  :deep(.el-tree-node__expand-icon) {
    font-size: 12px;
    color: #c0c4cc;
    transition: transform 0.15s ease;

    &.expanded {
      transform: rotate(90deg);
    }

    &.is-leaf {
      color: transparent;
    }
  }

  :deep(.el-tree-node > .el-tree-node__children) {
    padding-left: 8px;
  }
}

/* ── Tree Node ── */
.outline-node {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  flex: 1;
  min-width: 0;
  padding-right: 4px;

  &.is-virtual {
    .node-label {
      color: #a0a4ab;
      font-style: italic;
    }
  }
}

.node-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  flex-shrink: 0;
  line-height: 1;
}

.container-badge {
  background: #e8f4ff;
  color: #409eff;
  border: 1px solid #d0e8ff;
}

.virtual-badge {
  background: #f5f5f5;
  color: #a0a4ab;
  font-size: 14px;
  font-weight: 400;
  width: 14px;
  height: 14px;
}

.node-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d0d3d9;
  flex-shrink: 0;
  margin: 0 4px 0 4px;
}

.node-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #303133;
  line-height: 1.3;
}

.node-name {
  font-size: 10px;
  color: #b0b3b8;
  flex-shrink: 0;
  max-width: 80px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.node-count {
  font-size: 10px;
  color: #909399;
  background: #f0f2f5;
  padding: 1px 5px;
  border-radius: 8px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  min-width: 16px;
  text-align: center;
}
</style>
