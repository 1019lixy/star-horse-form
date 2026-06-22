<script setup lang="ts" name="DynamicQueryBuilder">
import {computed, PropType, watch} from "vue";
import {searchMatchList, SelectOption, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";

defineOptions({name: "DynamicQueryBuilder"});

// ─── Props ───────────────────────────────────────────────────
const props = defineProps({
  /** Property name options for dropdown (SelectOption[] or string[]) */
  properties: {
    type: Array as PropType<SelectOption[] | string[]>,
    default: () => [],
  },
  /** Max nesting depth (default 3) */
  maxDepth: {type: Number, default: 3},
  /** Current depth (used internally for recursion) */
  depth: {type: Number, default: 0},
  /** Whether component is disabled */
  disabled: {type: Boolean, default: false},
  /** Placeholder text for property name */
  propertyPlaceholder: {type: String, default: ""},
  /** Output key name for property field */
  propertyName: {type: String, default: "propertyName"},
  /** Output key name for value field */
  valueName: {type: String, default: "value"},
  /** Output key name for condition field */
  conditionName: {type: String, default: "condition"},
  /** Output key name for OR sub-list */
  orConditionName: {type: String, default: "orOperList"},
});

// Dynamic key shortcuts
const PK = computed(() => props.propertyName);
const VK = computed(() => props.valueName);
const CK = computed(() => props.conditionName);
const GK = computed(() => props.orConditionName);

/** Normalize properties to SelectOption[] */
const propertyOptions = computed<SelectOption[]>(() =>
  (props.properties || []).map((p: any) =>
    typeof p === "string" ? {name: p, value: p} : p,
  ),
);

// modelValue is a flat array of condition items
const modelValue = defineModel<any[]>("modelValue", {default: () => []});

const effectivePlaceholder = computed(() =>
  props.propertyPlaceholder || i18n("queryBuilder.placeholder.property"),
);

// ─── Factory ─────────────────────────────────────────────────
function createItem(): Record<string, any> {
  return {id: "qc_" + uuid().substring(0, 8), [PK.value]: "", [CK.value]: "eq", [VK.value]: ""};
}

function normalizeItem(item: any) {
  if (!(PK.value in item)) item[PK.value] = "";
  if (!(CK.value in item)) item[CK.value] = "eq";
  if (!(VK.value in item)) item[VK.value] = "";
  return item;
}

function normalizeList(list: any[]): any[] {
  if (!list || !list.length) return [createItem()];
  return list.map(normalizeItem);
}

watch(
  () => modelValue.value,
  (val) => {
    if (!val || !Array.isArray(val) || val.length === 0) {
      modelValue.value = [createItem()];
    } else {
      val.forEach(normalizeItem);
    }
  },
  {immediate: true, deep: true},
);

// ─── Constants ───────────────────────────────────────────────
const matchList = searchMatchList();
const NO_VALUE_CONDS = ["isnull", "notnull"];
const RANGE_CONDS = ["bt"];
const MULTI_CONDS = ["ini", "ins"];

// ─── Helpers ─────────────────────────────────────────────────
const needsValue = (c: string) => !NO_VALUE_CONDS.includes(c);
const isRange = (c: string) => RANGE_CONDS.includes(c);
const isMulti = (c: string) => MULTI_CONDS.includes(c);

function onConditionChange(cond: Record<string, any>) {
  const vk = VK.value;
  const ck = CK.value;
  if (NO_VALUE_CONDS.includes(cond[ck])) cond[vk] = null;
  else if (RANGE_CONDS.includes(cond[ck])) cond[vk] = ["", ""];
  else if (MULTI_CONDS.includes(cond[ck])) cond[vk] = [];
  else cond[vk] = "";
}

// ─── Operations on main list ─────────────────────────────────
function addItem() {
  modelValue.value!.push(createItem());
}

function removeItem(i: number | string) {
  modelValue.value!.splice(i as number, 1);
  if (modelValue.value!.length === 0) modelValue.value!.push(createItem());
}

// ─── Operations on OR sub-list ───────────────────────────────
function addOrCondition(item: any) {
  const gk = GK.value;
  if (!item[gk]) item[gk] = [];
  item[gk].push(createItem());
}

function removeOrCondition(item: any, i: number | string) {
  const gk = GK.value;
  if (!item[gk]) return;
  item[gk].splice(i as number, 1);
  if (item[gk].length === 0) delete item[gk];
}
</script>

<template>
  <div class="dqb" :class="{'dqb--nested': depth > 0}">
    <template v-if="modelValue">
      <!-- ── Header: logic toggle + actions ──────────────── -->
      <div class="dqb-header">
        <div class="dqb-logic" @click.stop="!disabled && toggleLogic(modelValue)">
          <span class="dqb-logic-badge" :class="`dqb-logic-badge--${modelValue.logic}`">
            {{ logicTag(modelValue.logic) }}
          </span>
          <span class="dqb-logic-desc">{{ logicDesc(modelValue.logic) }}</span>
          <span v-if="!disabled" class="dqb-logic-switch">{{ i18n('queryBuilder.logic.switch') }}</span>
        </div>
      </div>

      <!-- ── Column headers ───────────────────────────────── -->
      <div class="dqb-col-header">
        <span class="dqb-col-prop">{{ i18n('queryBuilder.col.property') }}</span>
        <span class="dqb-col-cond">{{ i18n('queryBuilder.col.condition') }}</span>
        <span class="dqb-col-val">{{ i18n('queryBuilder.col.value') }}</span>
        <span class="dqb-col-action"></span>
      </div>

      <!-- ── Condition Rows ──────────────────────────────── -->
      <div class="dqb-list">
        <div
            v-for="(cond, idx) in (modelValue.conditions || [])"
            :key="cond.id"
            class="dqb-item"
        >
          <!-- property -->
          <div class="dqb-item-prop">
            <el-select
                v-if="properties.length"
                v-model="cond[PK]"
                :placeholder="effectivePlaceholder"
                filterable
                :disabled="disabled"
            >
              <el-option v-for="p in properties" :key="p.value" :label="p.name" :value="p.value"/>
            </el-select>
            <el-input
                v-else
                v-model="cond[PK]"
                :placeholder="effectivePlaceholder"
                :disabled="disabled"
            />
          </div>

          <!-- condition -->
          <div class="dqb-item-cond">
            <el-select
                v-model="cond[CK]"
                :placeholder="i18n('queryBuilder.placeholder.condition')"
                :disabled="disabled"
                @change="onConditionChange(cond)"
            >
              <el-option v-for="m in matchList" :key="m.value" :label="m.name" :value="m.value"/>
            </el-select>
          </div>

          <!-- value -->
          <div class="dqb-item-val">
            <span v-if="!needsValue(cond[CK])" class="dqb-val-empty">—</span>

            <div v-else-if="isRange(cond[CK])" class="dqb-range">
              <el-input v-model="cond[VK][0]" :placeholder="i18n('queryBuilder.placeholder.min')" :disabled="disabled"
                        size="default"/>
              <span class="dqb-range-sep">~</span>
              <el-input v-model="cond[VK][1]" :placeholder="i18n('queryBuilder.placeholder.max')" :disabled="disabled"
                        size="default"/>
            </div>

            <el-select
                v-else-if="isMulti(cond[CK])"
                v-model="cond[VK]"
                multiple
                filterable
                allow-create
                default-first-option
                :placeholder="i18n('queryBuilder.placeholder.multi')"
                :disabled="disabled"
            />

            <el-input
                v-else
                v-model="cond[VK]"
                :placeholder="i18n('queryBuilder.placeholder.value')"
                :disabled="disabled"
            />
          </div>

          <!-- delete -->
          <el-button
              v-if="!disabled"
              type="danger"
              text
              size="small"
              icon="Close"
              class="dqb-item-del"
              :disabled="(modelValue.conditions?.length || 0) <= 1"
              @click="removeCondition(modelValue, idx)"
          />
        </div>
      </div>

      <!-- ── Child Groups (recursive) ────────────────────── -->
      <div v-if="modelValue[GK]?.length" class="dqb-groups">
        <div v-for="(child, ci) in modelValue[GK]" :key="child.id" class="dqb-group-slot">
          <DynamicQueryBuilder
              v-model="modelValue[GK][ci]"
              :properties="properties"
              :max-depth="maxDepth"
              :depth="depth + 1"
              :disabled="disabled"
              :property-placeholder="propertyPlaceholder"
          />
          <el-button
              v-if="!disabled"
              class="dqb-group-del"
              type="danger"
              text
              size="small"
              icon="Delete"
              @click="removeChildGroup(modelValue, ci)"
          />
        </div>
      </div>

      <!-- ── Actions ─────────────────────────────────────── -->
      <div v-if="!disabled" class="dqb-actions">
        <el-button type="primary" text size="small" icon="Plus" @click="addCondition(modelValue)">
          {{ i18n('queryBuilder.action.addCondition') }}
        </el-button>
        <el-button
            v-if="depth < maxDepth - 1"
            type="success"
            text
            size="small"
            icon="FolderAdd"
            @click="addChildGroup(modelValue)"
        >
          {{ i18n('queryBuilder.action.addGroup') }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.dqb {
  overflow: hidden;
  padding: 10px;
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.dqb--nested {
  background: #fff;
}

/* ── Header ─────────────────────────────────────────────── */
.dqb-header {
  margin-bottom: 8px;
}

.dqb-logic {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
  padding: 2px 0;
}

.dqb-logic-badge {
  display: inline-block;
  padding: 1px 10px;
  border-radius: 3px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 1px;
  line-height: 20px;

  &--and {
    background: #ecf5ff;
    color: #409eff;
  }

  &--or {
    background: #fdf6ec;
    color: #e6a23c;
  }
}

.dqb-logic-desc {
  font-size: 12px;
  color: #909399;
}

.dqb-logic-switch {
  font-size: 11px;
  color: #409eff;
  margin-left: 2px;

  &:hover {
    text-decoration: underline;
  }
}

/* ── Column header ──────────────────────────────────── */
.dqb-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 4px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.dqb-col-prop {
  width: 22%;
  flex-shrink: 0;
}

.dqb-col-cond {
  width: 22%;
  flex-shrink: 0;
}

.dqb-col-val {
  flex: 1;
  min-width: 0;
}

.dqb-col-action {
  width: 28px;
  flex-shrink: 0;
}

/* ── Condition list ─────────────────────────────────────── */
.dqb-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.dqb-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  transition: border-color 0.15s;

  &:hover {
    border-color: #c0c4cc;
  }
}

/* property: 22% */
.dqb-item-prop {
  width: 22%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-input),
  :deep(.el-select) {
    width: 100% !important;
  }
}

/* condition: 22% */
.dqb-item-cond {
  width: 22%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-select) {
    width: 100% !important;
  }
}

/* value: flex grow */
.dqb-item-val {
  flex: 1;
  min-width: 0;

  :deep(.el-select),
  :deep(.el-input) {
    width: 100% !important;
  }
}

.dqb-val-empty {
  width: 100%;
  text-align: center;
  color: #dcdfe6;
}

.dqb-range {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 4px;

  :deep(.el-input) {
    flex: 1;
    min-width: 0;
  }
}

.dqb-range-sep {
  color: #c0c4cc;
  flex-shrink: 0;
  font-size: 12px;
}

.dqb-item-del {
  flex-shrink: 0;
  padding: 4px;
  opacity: 0;
  transition: opacity 0.15s;

  .dqb-item:hover & {
    opacity: 1;
  }

  &[disabled] {
    opacity: 0 !important;
  }
}

/* ── Child groups ───────────────────────────────────────── */
.dqb-groups {
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.dqb-group-slot {
  position: relative;
  padding-left: 12px;
  border-left: 2px solid #dcdfe6;

  &:hover {
    border-left-color: #409eff;
  }

  .dqb-group-del {
    position: absolute;
    top: 4px;
    right: 0;
    opacity: 0;
    transition: opacity 0.15s;
  }

  &:hover > .dqb-group-del {
    opacity: 1;
  }
}

/* ── Actions ────────────────────────────────────────────── */
.dqb-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #ebeef5;
}
</style>
