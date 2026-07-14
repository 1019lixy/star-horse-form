<template>
  <div class="node-panel">
    <el-tabs v-model="activeTab" class="panel-tabs">
      <!-- 节点库 -->
      <el-tab-pane name="nodes">
        <template #label>
          <span class="tab-label">
            <el-icon><Grid /></el-icon>{{ i18n('rule.panel.nodeLibrary') }}
          </span>
        </template>
        <div class="tab-body">
          <div class="search-wrap">
            <el-input v-model="searchKeyword" :placeholder="i18n('rule.panel.searchNode')" class="search-input" clearable size="small">
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </div>
          <div class="panel-scroll">
            <el-collapse v-model="activeGroups" class="node-collapse">
              <el-collapse-item
                v-for="cat in filteredCategories"
                :key="cat.name"
                :name="cat.name"
              >
                <template #title>
                  <div class="category-title">
                    <span class="cat-icon" :style="{ background: cat.color + '20', color: cat.color }">{{ cat.icon }}</span>
                    <span class="cat-name">{{ i18n(cat.name) }}</span>
                    <el-tag type="info" round size="small">{{ cat.nodes.length }}</el-tag>
                  </div>
                </template>
                <div class="node-list">
                  <div
                    v-for="node in cat.nodes"
                    :key="node.type"
                    class="node-item"
                    :draggable="true"
                    @dragstart="onDragStart($event, node.type)"
                    @click="addToCanvas(node.type)"
                  >
                    <div class="node-icon"
                         :style="{ background: cat.color + '15', borderColor: cat.color + '40', color: cat.color }">
                      {{ node.icon }}
                    </div>
                    <div class="node-info">
                      <div class="node-label">{{ i18n(node.label) }}</div>
                      <div class="node-desc">{{ i18n(node.desc) }}</div>
                    </div>
                    <el-icon class="drag-handle"><Plus /></el-icon>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>
      </el-tab-pane>

      <!-- 变量库 -->
      <el-tab-pane name="vars">
        <template #label>
          <span class="tab-label">
            <el-icon><Coin /></el-icon>{{ i18n('rule.panel.variableLibrary') }}
            <el-tag v-if="variables.length" type="primary" round size="small" class="tab-count">{{ variables.length }}</el-tag>
          </span>
        </template>
        <div class="tab-body var-body">
          <div class="var-toolbar">
            <el-button type="primary" size="small" @click="startAddVar">
              <el-icon><Plus /></el-icon>{{ i18n('rule.var.add') }}
            </el-button>
            <el-input v-model="varSearch" :placeholder="i18n('rule.var.search')" size="small" clearable class="var-search">
              <template #prefix><el-icon><Search /></el-icon></template>
            </el-input>
          </div>

          <!-- 内联编辑表单 -->
          <div v-if="varEditing" class="var-edit-form">
            <div class="vef-row">
              <el-input v-model="varForm.field" :placeholder="i18n('rule.var.phField')" size="small" class="vef-field" />
              <el-input v-model="varForm.label" :placeholder="i18n('rule.var.phLabel')" size="small" class="vef-label" />
            </div>
            <div class="vef-row">
              <el-select v-model="varForm.type" size="small" class="vef-type">
                <el-option :label="i18n('rule.dialog.string')" value="STRING" />
                <el-option :label="i18n('rule.dialog.number')" value="NUMBER" />
                <el-option :label="i18n('rule.dialog.date')" value="DATE" />
                <el-option :label="i18n('rule.dialog.boolean')" value="BOOLEAN" />
                <el-option :label="i18n('rule.dialog.array')" value="ARRAY" />
              </el-select>
              <el-select v-model="varForm.source" size="small" class="vef-source">
                <el-option :label="i18n('rule.var.sourceInput')" value="INPUT" />
                <el-option :label="i18n('rule.var.sourceContext')" value="CONTEXT" />
                <el-option :label="i18n('rule.var.sourceConstant')" value="CONSTANT" />
              </el-select>
            </div>
            <el-input v-model="varForm.defaultValue" :placeholder="i18n('rule.var.phDefault')" size="small" class="vef-default" />
            <el-input v-model="varForm.desc" :placeholder="i18n('rule.var.phDesc')" size="small" class="vef-desc" />
            <div class="vef-actions">
              <el-button size="small" @click="cancelVarEdit">{{ i18n('rule.var.cancel') }}</el-button>
              <el-button type="primary" size="small" @click="saveVar">{{ i18n('rule.var.confirm') }}</el-button>
            </div>
          </div>

          <!-- 变量列表 -->
          <div class="panel-scroll var-list">
            <el-empty v-if="!filteredVariables.length" :description="i18n('rule.var.empty')" :image-size="60" />
            <div v-for="(v, idx) in filteredVariables" :key="v.field + idx" class="var-item" @click="startEditVar(idx)">
              <div class="var-head">
                <span class="var-label">{{ v.label || v.field }}</span>
                <span class="var-field">{{ v.field }}</span>
              </div>
              <div class="var-meta">
                <el-tag :type="typeTagType(v.type)" size="small" effect="light">{{ typeText(v.type) }}</el-tag>
                <el-tag :type="sourceTagType(v.source)" size="small" effect="plain">{{ sourceText(v.source) }}</el-tag>
              </div>
              <div v-if="v.desc" class="var-desc">{{ v.desc }}</div>
              <div class="var-ops" @click.stop>
                <el-icon @click="startEditVar(idx)"><Edit /></el-icon>
                <el-icon @click="deleteVar(idx)"><Delete /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { Grid, Search, Plus, Coin, Edit, Delete } from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { NODE_CATEGORIES } from "./nodeTypes";
import { i18n } from "@/lang";

type VarType = "STRING" | "NUMBER" | "DATE" | "BOOLEAN" | "ARRAY";
type VarSource = "INPUT" | "CONTEXT" | "CONSTANT";
interface RuleVariable {
  field: string; label: string; type: VarType;
  source: VarSource; defaultValue?: string; desc?: string;
}

// 变量库双向绑定 + 节点添加事件
const props = defineProps<{ variables: RuleVariable[] }>();
const emit = defineEmits<{
  (e: "update:variables", val: RuleVariable[]): void
  (e: "add", nodeType: string): void
}>();
const syncVariables = (val: RuleVariable[]) => emit("update:variables", val);

const activeTab = ref("nodes");

// ===== 节点库 =====
const searchKeyword = ref("");
const activeGroups = ref(NODE_CATEGORIES.map(c => c.name));
const filteredCategories = computed(() => {
  if (!searchKeyword.value) return NODE_CATEGORIES;
  const kw = searchKeyword.value.toLowerCase();
  return NODE_CATEGORIES.map(cat => ({
    ...cat,
    nodes: cat.nodes.filter(n => {
      const label = i18n(n.label).toLowerCase();
      const desc = i18n(n.desc).toLowerCase();
      return label.includes(kw) || desc.includes(kw) || n.type.includes(kw);
    })
  })).filter(cat => cat.nodes.length > 0);
});
const onDragStart = (e: DragEvent, nodeType: string) => {
  if (e.dataTransfer) {
    e.dataTransfer.setData("application/vueflow", nodeType);
    e.dataTransfer.effectAllowed = "move";
  }
};
const emitAdd = (nodeType: string) => emit("add", nodeType);
const addToCanvas = (nodeType: string) => emitAdd(nodeType);

// ===== 变量库 =====
const varSearch = ref("");
const varEditing = ref(false);
const varEditIndex = ref(-1);
const blankVar = (): RuleVariable => ({ field: "", label: "", type: "STRING", source: "INPUT", defaultValue: "", desc: "" });
const varForm = ref<RuleVariable>(blankVar());

const filteredVariables = computed(() => {
  if (!varSearch.value) return props.variables;
  const kw = varSearch.value.toLowerCase();
  return props.variables.filter(v =>
    v.field.toLowerCase().includes(kw) ||
    (v.label || "").toLowerCase().includes(kw) ||
    (v.desc || "").toLowerCase().includes(kw)
  );
});

const startAddVar = () => {
  varForm.value = blankVar();
  varEditIndex.value = -1;
  varEditing.value = true;
};
const startEditVar = (idx: number) => {
  // 以过滤后的索引定位原始索引
  const target = filteredVariables.value[idx];
  const realIdx = props.variables.indexOf(target);
  if (realIdx < 0) return;
  varForm.value = { ...props.variables[realIdx] };
  varEditIndex.value = realIdx;
  varEditing.value = true;
};
const cancelVarEdit = () => { varEditing.value = false; };
const saveVar = () => {
  const f = varForm.value;
  if (!f.field.trim()) {
    ElMessage.warning(i18n('rule.var.fieldRequired'));
    return;
  }
  // 字段名唯一性校验（排除自身）
  const dup = props.variables.findIndex((v, i) => v.field === f.field.trim() && i !== varEditIndex.value);
  if (dup >= 0) {
    ElMessage.warning(i18n('rule.var.fieldDup'));
    return;
  }
  const list = [...props.variables];
  const data: RuleVariable = { ...f, field: f.field.trim() };
  if (varEditIndex.value >= 0) list[varEditIndex.value] = data;
  else list.push(data);
  syncVariables(list);
  varEditing.value = false;
  ElMessage.success(i18n('rule.var.saved'));
};
const deleteVar = async (idx: number) => {
  const target = filteredVariables.value[idx];
  const realIdx = props.variables.indexOf(target);
  if (realIdx < 0) return;
  try {
    await ElMessageBox.confirm(
      i18n('rule.var.deleteConfirm').replace('{0}', props.variables[realIdx].label || props.variables[realIdx].field),
      i18n('rule.var.deleteTitle'),
      { type: "warning" }
    );
    const list = [...props.variables];
    list.splice(realIdx, 1);
    syncVariables(list);
    ElMessage.success(i18n('rule.var.deleted'));
  } catch { /* 取消 */ }
};

const typeText = (t: VarType) => ({
  STRING: i18n('rule.dialog.string'), NUMBER: i18n('rule.dialog.number'),
  DATE: i18n('rule.dialog.date'), BOOLEAN: i18n('rule.dialog.boolean'), ARRAY: i18n('rule.dialog.array')
}[t] || t);
const typeTagType = (t: VarType): any => ({
  STRING: "primary", NUMBER: "success", DATE: "warning", BOOLEAN: "info", ARRAY: ""
}[t]);
const sourceText = (s: VarSource) => ({
  INPUT: i18n('rule.var.sourceInput'), CONTEXT: i18n('rule.var.sourceContext'), CONSTANT: i18n('rule.var.sourceConstant')
}[s] || s);
const sourceTagType = (s: VarSource): any => ({
  INPUT: "primary", CONTEXT: "info", CONSTANT: "warning"
}[s]);
</script>

<style scoped lang="scss">
@import './styles/design-tokens.scss';
.node-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: $rd-bg-surface;

  .panel-tabs {
    height: 100%;
    display: flex;
    flex-direction: column;
    :deep(.el-tabs__header) {
      margin: 0;
      flex-shrink: 0;
      background: $rd-bg-subtle;
      border-bottom: 1px solid $rd-border;
      padding: 0 8px;
    }
    :deep(.el-tabs__nav-wrap::after) { display: none; }
    :deep(.el-tabs__item) {
      height: 38px;
      padding: 0 12px;
      font-size: $rd-font-sm;
      font-weight: $rd-font-weight-medium;
      color: $rd-text-secondary;
      &.is-active { color: $rd-primary; }
    }
    :deep(.el-tabs__content) { flex: 1; min-height: 0; }
    :deep(.el-tab-pane) { height: 100%; }
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    .el-icon { font-size: 14px; }
    .tab-count { margin-left: 2px; transform: scale(0.85); }
  }

  .tab-body {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  // ===== 节点库 =====
  .search-wrap {
    padding: $rd-space-2 $rd-space-3;
    flex-shrink: 0;
  }

  .panel-scroll {
    flex: 1;
    overflow-y: auto;
    padding: 0 $rd-space-2 $rd-space-2;
  }

  .node-collapse {
    :deep(.el-collapse-item__header) {
      padding: 0 4px;
      height: 34px;
      font-size: $rd-font-sm;
      background: transparent;
      border-bottom: none;
    }
    :deep(.el-collapse-item__content) { padding: 4px 0 8px; }
  }

  .category-title {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    .cat-icon {
      display: inline-flex; align-items: center; justify-content: center;
      width: 22px; height: 22px; border-radius: $rd-radius-sm; font-size: 13px;
    }
    .cat-name {
      flex: 1; font-weight: $rd-font-weight-semibold; color: $rd-text-primary; font-size: $rd-font-xs;
    }
  }

  .node-list { display: flex; flex-direction: column; gap: $rd-space-1; }

  .node-item {
    display: flex; align-items: center; gap: $rd-space-2;
    padding: $rd-space-2; border: 1px solid $rd-border; border-radius: $rd-radius-md;
    cursor: grab; transition: all $rd-transition-fast; background: $rd-bg-surface;
    &:hover {
      border-color: $rd-primary-border; background: $rd-primary-bg; box-shadow: $rd-shadow-xs;
      .drag-handle { opacity: 1; }
    }
    &:active { cursor: grabbing; }
    .node-icon {
      display: flex; align-items: center; justify-content: center;
      width: 30px; height: 30px; border-radius: $rd-radius-md; border: 1px solid; font-size: 15px; flex-shrink: 0;
    }
    .node-info {
      flex: 1; min-width: 0;
      .node-label {
        font-size: $rd-font-xs; font-weight: $rd-font-weight-semibold; color: $rd-text-primary;
        white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      }
      .node-desc {
        font-size: 10px; color: $rd-text-tertiary; white-space: nowrap; overflow: hidden;
        text-overflow: ellipsis; margin-top: 1px;
      }
    }
    .drag-handle { color: $rd-primary; opacity: 0; transition: opacity $rd-transition-fast; flex-shrink: 0; }
  }

  // ===== 变量库 =====
  .var-body { padding: 0; }

  .var-toolbar {
    display: flex; gap: $rd-space-2; padding: $rd-space-2 $rd-space-3; flex-shrink: 0;
    align-items: center;
    .var-search { flex: 1; }
  }

  .var-edit-form {
    margin: 0 $rd-space-3 $rd-space-2;
    padding: $rd-space-2;
    background: $rd-primary-bg;
    border: 1px solid $rd-primary-border;
    border-radius: $rd-radius-md;
    display: flex; flex-direction: column; gap: $rd-space-2;
    .vef-row { display: flex; gap: $rd-space-2; }
    .vef-field { flex: 1.2; }
    .vef-label { flex: 1; }
    .vef-type { flex: 1; }
    .vef-source { flex: 1; }
    .vef-actions { display: flex; justify-content: flex-end; gap: $rd-space-2; margin-top: 2px; }
  }

  .var-list { display: flex; flex-direction: column; gap: $rd-space-1; padding: 0 $rd-space-3 $rd-space-2; }

  .var-item {
    position: relative;
    padding: $rd-space-2 $rd-space-3;
    border: 1px solid $rd-border;
    border-radius: $rd-radius-md;
    background: $rd-bg-surface;
    cursor: pointer;
    transition: all $rd-transition-fast;
    &:hover {
      border-color: $rd-primary-border;
      box-shadow: $rd-shadow-xs;
      .var-ops { opacity: 1; }
    }
    .var-head { display: flex; align-items: baseline; gap: $rd-space-2; }
    .var-label {
      font-size: $rd-font-sm; font-weight: $rd-font-weight-semibold; color: $rd-text-primary;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 55%;
    }
    .var-field {
      font-size: 10px; color: $rd-text-tertiary; font-family: ui-monospace, monospace;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .var-meta { display: flex; gap: $rd-space-1; margin-top: $rd-space-1; }
    .var-desc {
      font-size: 10px; color: $rd-text-tertiary; margin-top: $rd-space-1;
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    }
    .var-ops {
      position: absolute; top: $rd-space-2; right: $rd-space-2;
      display: flex; gap: $rd-space-1; opacity: 0; transition: opacity $rd-transition-fast;
      .el-icon {
        cursor: pointer; color: $rd-text-tertiary; padding: 2px; border-radius: $rd-radius-sm;
        &:hover { color: $rd-primary; background: $rd-primary-bg; }
      }
    }
  }
}
</style>
