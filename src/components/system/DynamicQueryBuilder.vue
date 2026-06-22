<script setup lang="ts" name="DynamicQueryBuilder">
import {computed, PropType, ref, watch} from "vue";
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
  /** Which tabs to show: 'all' or array of 'conditions','sort','aggregate' */
  tabs: {
    type: [String, Array] as PropType<"all" | ("conditions" | "sort" | "aggregate")[]>,
    default: "all",
  },
  /** Output key name for sort field */
  sortName: {type: String, default: "sortField"},
  /** Output key name for aggregate field */
  aggName: {type: String, default: "aggField"},
  /** Sort items (use with v-model:sort-value or :sort-value) */
  sortValue: {type: Array as PropType<any[]>, default: undefined},
  /** Aggregate items (use with v-model:agg-value or :agg-value) */
  aggValue: {type: Array as PropType<any[]>, default: undefined},
});

const emit = defineEmits<{
  (e: "update:sortValue", val: any[]): void;
  (e: "update:aggValue", val: any[]): void;
}>();

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

// ─── Models ──────────────────────────────────────────────────
const modelValue = defineModel<any[]>("modelValue", {default: () => []});

// Use local refs for sort/aggregate to avoid defineModel issues when parent doesn't bind them
const localSort = ref<any[]>(props.sortValue || []);
const localAgg = ref<any[]>(props.aggValue || []);

// Sync from parent prop changes
watch(() => props.sortValue, (v) => {
  if (v && Array.isArray(v)) localSort.value = v;
}, {deep: true});

watch(() => props.aggValue, (v) => {
  if (v && Array.isArray(v)) localAgg.value = v;
}, {deep: true});

const activeTab = ref("conditions");

const effectivePlaceholder = computed(() =>
  props.propertyPlaceholder || i18n("queryBuilder.placeholder.property"),
);

// ─── Tab visibility ──────────────────────────────────────────
const showConditions = computed(() =>
  props.tabs === "all" || (Array.isArray(props.tabs) && props.tabs.includes("conditions")),
);
const showSort = computed(() =>
  props.tabs === "all" || (Array.isArray(props.tabs) && props.tabs.includes("sort")),
);
const showAggregate = computed(() =>
  props.tabs === "all" || (Array.isArray(props.tabs) && props.tabs.includes("aggregate")),
);

const visibleTabs = computed(() => {
  const t: {name: string; label: string}[] = [];
  if (showConditions.value) t.push({name: "conditions", label: i18n("queryBuilder.tab.conditions")});
  if (showSort.value) t.push({name: "sort", label: i18n("queryBuilder.tab.sort")});
  if (showAggregate.value) t.push({name: "aggregate", label: i18n("queryBuilder.tab.aggregate")});
  return t;
});

// ─── Factory ─────────────────────────────────────────────────
function createItem(): Record<string, any> {
  return {id: "qc_" + uuid().substring(0, 8), [PK.value]: "", [CK.value]: "eq", [VK.value]: ""};
}

function createSortItem(): Record<string, any> {
  return {id: "qs_" + uuid().substring(0, 8), [props.sortName]: "", sortDirection: "asc"};
}

function createAggItem(): Record<string, any> {
  return {id: "qa_" + uuid().substring(0, 8), [props.aggName]: "", aggFunction: "COUNT"};
}

function normalizeItem(item: any) {
  if (!(PK.value in item)) item[PK.value] = "";
  if (!(CK.value in item)) item[CK.value] = "eq";
  if (!(VK.value in item)) item[VK.value] = "";
  return item;
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
const AGG_FUNCTIONS = ["COUNT", "SUM", "AVG", "MAX", "MIN"];

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

// ─── Operations on conditions ────────────────────────────────
function addItem() {
  modelValue.value!.push(createItem());
}

function removeItem(i: number | string) {
  modelValue.value!.splice(i as number, 1);
  if (modelValue.value!.length === 0) modelValue.value!.push(createItem());
}

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

// ─── Operations on sort ──────────────────────────────────────
function addSort() {
  localSort.value = [...localSort.value, createSortItem()];
  emit("update:sortValue", localSort.value);
}

function removeSort(i: number | string) {
  localSort.value = localSort.value.filter((_, idx) => idx !== i);
  emit("update:sortValue", localSort.value);
}

// ─── Operations on aggregate ─────────────────────────────────
function addAgg() {
  localAgg.value = [...localAgg.value, createAggItem()];
  emit("update:aggValue", localAgg.value);
}

function removeAgg(i: number | string) {
  localAgg.value = localAgg.value.filter((_, idx) => idx !== i);
  emit("update:aggValue", localAgg.value);
}
</script>

<template>
  <div class="dqb">
    <!-- Tabs mode -->
    <el-tabs v-if="visibleTabs.length > 1" v-model="activeTab" class="dqb-tabs">
      <!-- ── Conditions Tab ───────────────────────────────── -->
      <el-tab-pane v-if="showConditions" :label="i18n('queryBuilder.tab.conditions')" name="conditions">
        <template v-if="modelValue">
          <div class="dqb-col-header">
            <span class="dqb-col-prop">{{ i18n('queryBuilder.col.property') }}</span>
            <span class="dqb-col-cond">{{ i18n('queryBuilder.col.condition') }}</span>
            <span class="dqb-col-val">{{ i18n('queryBuilder.col.value') }}</span>
            <span class="dqb-col-action"></span>
          </div>
          <div class="dqb-list">
            <div v-for="(item, idx) in modelValue" :key="item.id" class="dqb-entry">
              <div class="dqb-item">
                <div class="dqb-item-prop">
                  <el-select v-if="propertyOptions.length" v-model="item[PK]" :placeholder="effectivePlaceholder" filterable allow-create default-first-option :disabled="disabled">
                    <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
                  </el-select>
                  <el-input v-else v-model="item[PK]" :placeholder="effectivePlaceholder" :disabled="disabled"/>
                </div>
                <div class="dqb-item-cond">
                  <el-select v-model="item[CK]" :placeholder="i18n('queryBuilder.placeholder.condition')" :disabled="disabled" @change="onConditionChange(item)">
                    <el-option v-for="m in matchList" :key="m.value" :label="m.name" :value="m.value"/>
                  </el-select>
                </div>
                <div class="dqb-item-val">
                  <span v-if="!needsValue(item[CK])" class="dqb-val-empty">&mdash;</span>
                  <div v-else-if="isRange(item[CK])" class="dqb-range">
                    <el-input v-model="item[VK][0]" :placeholder="i18n('queryBuilder.placeholder.min')" :disabled="disabled"/>
                    <span class="dqb-range-sep">~</span>
                    <el-input v-model="item[VK][1]" :placeholder="i18n('queryBuilder.placeholder.max')" :disabled="disabled"/>
                  </div>
                  <el-select v-else-if="isMulti(item[CK])" v-model="item[VK]" multiple filterable allow-create default-first-option :placeholder="i18n('queryBuilder.placeholder.multi')" :disabled="disabled"/>
                  <el-input v-else v-model="item[VK]" :placeholder="i18n('queryBuilder.placeholder.value')" :disabled="disabled"/>
                </div>
                <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeItem(idx)"/>
              </div>
              <div v-if="item[GK]?.length" class="dqb-or-list">
                <div v-for="(orCond, oi) in item[GK]" :key="orCond.id" class="dqb-item dqb-item--or">
                  <span class="dqb-or-tag">OR</span>
                  <div class="dqb-item-prop">
                    <el-select v-if="propertyOptions.length" v-model="orCond[PK]" :placeholder="effectivePlaceholder" filterable allow-create default-first-option :disabled="disabled">
                      <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
                    </el-select>
                    <el-input v-else v-model="orCond[PK]" :placeholder="effectivePlaceholder" :disabled="disabled"/>
                  </div>
                  <div class="dqb-item-cond">
                    <el-select v-model="orCond[CK]" :placeholder="i18n('queryBuilder.placeholder.condition')" :disabled="disabled" @change="onConditionChange(orCond)">
                      <el-option v-for="m in matchList" :key="m.value" :label="m.name" :value="m.value"/>
                    </el-select>
                  </div>
                  <div class="dqb-item-val">
                    <span v-if="!needsValue(orCond[CK])" class="dqb-val-empty">&mdash;</span>
                    <div v-else-if="isRange(orCond[CK])" class="dqb-range">
                      <el-input v-model="orCond[VK][0]" :placeholder="i18n('queryBuilder.placeholder.min')" :disabled="disabled"/>
                      <span class="dqb-range-sep">~</span>
                      <el-input v-model="orCond[VK][1]" :placeholder="i18n('queryBuilder.placeholder.max')" :disabled="disabled"/>
                    </div>
                    <el-select v-else-if="isMulti(orCond[CK])" v-model="orCond[VK]" multiple filterable allow-create default-first-option :placeholder="i18n('queryBuilder.placeholder.multi')" :disabled="disabled"/>
                    <el-input v-else v-model="orCond[VK]" :placeholder="i18n('queryBuilder.placeholder.value')" :disabled="disabled"/>
                  </div>
                  <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeOrCondition(item, oi)"/>
                </div>
              </div>
              <div v-if="!disabled && depth < maxDepth - 1" class="dqb-or-action">
                <el-button type="warning" text size="small" icon="Plus" @click="addOrCondition(item)">{{ i18n('queryBuilder.action.addOr') }}</el-button>
              </div>
            </div>
          </div>
          <div v-if="!disabled" class="dqb-actions">
            <el-button type="primary" text size="small" icon="Plus" @click="addItem">{{ i18n('queryBuilder.action.addCondition') }}</el-button>
          </div>
        </template>
      </el-tab-pane>

      <!-- ── Sort Tab ─────────────────────────────────────── -->
      <el-tab-pane v-if="showSort" :label="i18n('queryBuilder.tab.sort')" name="sort">
        <div class="dqb-col-header">
          <span class="dqb-col-sort-field">{{ i18n('queryBuilder.sort.field') }}</span>
          <span class="dqb-col-sort-dir">{{ i18n('queryBuilder.sort.direction') }}</span>
          <span class="dqb-col-action"></span>
        </div>
        <div class="dqb-list">
          <div v-for="(s, si) in localSort" :key="s.id" class="dqb-item">
            <div class="dqb-sort-field">
              <el-select v-if="propertyOptions.length" v-model="s[sortName]" :placeholder="i18n('queryBuilder.sort.selectField')" filterable allow-create default-first-option :disabled="disabled">
                <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
              </el-select>
              <el-input v-else v-model="s[sortName]" :placeholder="i18n('queryBuilder.sort.selectField')" :disabled="disabled"/>
            </div>
            <div class="dqb-sort-dir">
              <el-radio-group v-model="s.sortDirection" :disabled="disabled" size="default">
                <el-radio-button value="asc">{{ i18n('queryBuilder.sort.asc') }}</el-radio-button>
                <el-radio-button value="desc">{{ i18n('queryBuilder.sort.desc') }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="dqb-item-val"></div>
            <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeSort(si)"/>
          </div>
        </div>
        <div v-if="!disabled" class="dqb-actions">
          <el-button type="primary" text size="small" icon="Plus" @click="addSort">{{ i18n('queryBuilder.action.addSort') }}</el-button>
        </div>
      </el-tab-pane>

      <!-- ── Aggregate Tab ────────────────────────────────── -->
      <el-tab-pane v-if="showAggregate" :label="i18n('queryBuilder.tab.aggregate')" name="aggregate">
        <div class="dqb-col-header">
          <span class="dqb-col-agg-field">{{ i18n('queryBuilder.agg.field') }}</span>
          <span class="dqb-col-agg-func">{{ i18n('queryBuilder.agg.function') }}</span>
          <span class="dqb-col-action"></span>
        </div>
        <div class="dqb-list">
          <div v-for="(a, ai) in localAgg" :key="a.id" class="dqb-item">
            <div class="dqb-agg-field">
              <el-select v-if="propertyOptions.length" v-model="a[aggName]" :placeholder="i18n('queryBuilder.agg.selectField')" filterable allow-create default-first-option :disabled="disabled">
                <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
              </el-select>
              <el-input v-else v-model="a[aggName]" :placeholder="i18n('queryBuilder.agg.selectField')" :disabled="disabled"/>
            </div>
            <div class="dqb-agg-func">
              <el-select v-model="a.aggFunction" :placeholder="i18n('queryBuilder.agg.selectFunc')" :disabled="disabled">
                <el-option v-for="fn in AGG_FUNCTIONS" :key="fn" :label="fn" :value="fn"/>
              </el-select>
            </div>
            <div class="dqb-item-val"></div>
            <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeAgg(ai)"/>
          </div>
        </div>
        <div v-if="!disabled" class="dqb-actions">
          <el-button type="primary" text size="small" icon="Plus" @click="addAgg">{{ i18n('queryBuilder.action.addAggregate') }}</el-button>
        </div>
      </el-tab-pane>
    </el-tabs>

    <!-- Single-tab mode (no tab wrapper) -->
    <template v-else-if="visibleTabs.length === 1">
      <!-- Conditions only -->
      <template v-if="visibleTabs[0].name === 'conditions' && modelValue">
        <div class="dqb-col-header">
          <span class="dqb-col-prop">{{ i18n('queryBuilder.col.property') }}</span>
          <span class="dqb-col-cond">{{ i18n('queryBuilder.col.condition') }}</span>
          <span class="dqb-col-val">{{ i18n('queryBuilder.col.value') }}</span>
          <span class="dqb-col-action"></span>
        </div>
        <div class="dqb-list">
          <div v-for="(item, idx) in modelValue" :key="item.id" class="dqb-entry">
            <div class="dqb-item">
              <div class="dqb-item-prop">
                <el-select v-if="propertyOptions.length" v-model="item[PK]" :placeholder="effectivePlaceholder" filterable allow-create default-first-option :disabled="disabled">
                  <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
                </el-select>
                <el-input v-else v-model="item[PK]" :placeholder="effectivePlaceholder" :disabled="disabled"/>
              </div>
              <div class="dqb-item-cond">
                <el-select v-model="item[CK]" :placeholder="i18n('queryBuilder.placeholder.condition')" :disabled="disabled" @change="onConditionChange(item)">
                  <el-option v-for="m in matchList" :key="m.value" :label="m.name" :value="m.value"/>
                </el-select>
              </div>
              <div class="dqb-item-val">
                <span v-if="!needsValue(item[CK])" class="dqb-val-empty">&mdash;</span>
                <div v-else-if="isRange(item[CK])" class="dqb-range">
                  <el-input v-model="item[VK][0]" :placeholder="i18n('queryBuilder.placeholder.min')" :disabled="disabled"/>
                  <span class="dqb-range-sep">~</span>
                  <el-input v-model="item[VK][1]" :placeholder="i18n('queryBuilder.placeholder.max')" :disabled="disabled"/>
                </div>
                <el-select v-else-if="isMulti(item[CK])" v-model="item[VK]" multiple filterable allow-create default-first-option :placeholder="i18n('queryBuilder.placeholder.multi')" :disabled="disabled"/>
                <el-input v-else v-model="item[VK]" :placeholder="i18n('queryBuilder.placeholder.value')" :disabled="disabled"/>
              </div>
              <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeItem(idx)"/>
            </div>
            <div v-if="item[GK]?.length" class="dqb-or-list">
              <div v-for="(orCond, oi) in item[GK]" :key="orCond.id" class="dqb-item dqb-item--or">
                <span class="dqb-or-tag">OR</span>
                <div class="dqb-item-prop">
                  <el-select v-if="propertyOptions.length" v-model="orCond[PK]" :placeholder="effectivePlaceholder" filterable allow-create default-first-option :disabled="disabled">
                    <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
                  </el-select>
                  <el-input v-else v-model="orCond[PK]" :placeholder="effectivePlaceholder" :disabled="disabled"/>
                </div>
                <div class="dqb-item-cond">
                  <el-select v-model="orCond[CK]" :placeholder="i18n('queryBuilder.placeholder.condition')" :disabled="disabled" @change="onConditionChange(orCond)">
                    <el-option v-for="m in matchList" :key="m.value" :label="m.name" :value="m.value"/>
                  </el-select>
                </div>
                <div class="dqb-item-val">
                  <span v-if="!needsValue(orCond[CK])" class="dqb-val-empty">&mdash;</span>
                  <div v-else-if="isRange(orCond[CK])" class="dqb-range">
                    <el-input v-model="orCond[VK][0]" :placeholder="i18n('queryBuilder.placeholder.min')" :disabled="disabled"/>
                    <span class="dqb-range-sep">~</span>
                    <el-input v-model="orCond[VK][1]" :placeholder="i18n('queryBuilder.placeholder.max')" :disabled="disabled"/>
                  </div>
                  <el-select v-else-if="isMulti(orCond[CK])" v-model="orCond[VK]" multiple filterable allow-create default-first-option :placeholder="i18n('queryBuilder.placeholder.multi')" :disabled="disabled"/>
                  <el-input v-else v-model="orCond[VK]" :placeholder="i18n('queryBuilder.placeholder.value')" :disabled="disabled"/>
                </div>
                <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeOrCondition(item, oi)"/>
              </div>
            </div>
            <div v-if="!disabled && depth < maxDepth - 1" class="dqb-or-action">
              <el-button type="warning" text size="small" icon="Plus" @click="addOrCondition(item)">{{ i18n('queryBuilder.action.addOr') }}</el-button>
            </div>
          </div>
        </div>
        <div v-if="!disabled" class="dqb-actions">
          <el-button type="primary" text size="small" icon="Plus" @click="addItem">{{ i18n('queryBuilder.action.addCondition') }}</el-button>
        </div>
      </template>

      <!-- Sort only -->
      <template v-if="visibleTabs[0].name === 'sort'">
        <div class="dqb-col-header">
          <span class="dqb-col-sort-field">{{ i18n('queryBuilder.sort.field') }}</span>
          <span class="dqb-col-sort-dir">{{ i18n('queryBuilder.sort.direction') }}</span>
          <span class="dqb-col-action"></span>
        </div>
        <div class="dqb-list">
          <div v-for="(s, si) in localSort" :key="s.id" class="dqb-item">
            <div class="dqb-sort-field">
              <el-select v-if="propertyOptions.length" v-model="s[sortName]" :placeholder="i18n('queryBuilder.sort.selectField')" filterable allow-create default-first-option :disabled="disabled">
                <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
              </el-select>
              <el-input v-else v-model="s[sortName]" :placeholder="i18n('queryBuilder.sort.selectField')" :disabled="disabled"/>
            </div>
            <div class="dqb-sort-dir">
              <el-radio-group v-model="s.sortDirection" :disabled="disabled" size="default">
                <el-radio-button value="asc">{{ i18n('queryBuilder.sort.asc') }}</el-radio-button>
                <el-radio-button value="desc">{{ i18n('queryBuilder.sort.desc') }}</el-radio-button>
              </el-radio-group>
            </div>
            <div class="dqb-item-val"></div>
            <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeSort(si)"/>
          </div>
        </div>
        <div v-if="!disabled" class="dqb-actions">
          <el-button type="primary" text size="small" icon="Plus" @click="addSort">{{ i18n('queryBuilder.action.addSort') }}</el-button>
        </div>
      </template>

      <!-- Aggregate only -->
      <template v-if="visibleTabs[0].name === 'aggregate'">
        <div class="dqb-col-header">
          <span class="dqb-col-agg-field">{{ i18n('queryBuilder.agg.field') }}</span>
          <span class="dqb-col-agg-func">{{ i18n('queryBuilder.agg.function') }}</span>
          <span class="dqb-col-action"></span>
        </div>
        <div class="dqb-list">
          <div v-for="(a, ai) in localAgg" :key="a.id" class="dqb-item">
            <div class="dqb-agg-field">
              <el-select v-if="propertyOptions.length" v-model="a[aggName]" :placeholder="i18n('queryBuilder.agg.selectField')" filterable allow-create default-first-option :disabled="disabled">
                <el-option v-for="p in propertyOptions" :key="p.value" :label="p.name" :value="p.value"/>
              </el-select>
              <el-input v-else v-model="a[aggName]" :placeholder="i18n('queryBuilder.agg.selectField')" :disabled="disabled"/>
            </div>
            <div class="dqb-agg-func">
              <el-select v-model="a.aggFunction" :placeholder="i18n('queryBuilder.agg.selectFunc')" :disabled="disabled">
                <el-option v-for="fn in AGG_FUNCTIONS" :key="fn" :label="fn" :value="fn"/>
              </el-select>
            </div>
            <div class="dqb-item-val"></div>
            <el-button v-if="!disabled" type="danger" text size="small" icon="Close" class="dqb-item-del" @click="removeAgg(ai)"/>
          </div>
        </div>
        <div v-if="!disabled" class="dqb-actions">
          <el-button type="primary" text size="small" icon="Plus" @click="addAgg">{{ i18n('queryBuilder.action.addAggregate') }}</el-button>
        </div>
      </template>
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

/* ── Column header ─────────────────────────────────────────── */
.dqb-col-header {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 6px 4px;
  font-size: 12px;
  color: #909399;
  font-weight: 500;
}

.dqb-col-prop { width: 22%; flex-shrink: 0; }
.dqb-col-cond { width: 22%; flex-shrink: 0; }
.dqb-col-val { flex: 1; min-width: 0; }
.dqb-col-action { width: 28px; flex-shrink: 0; }

/* ── Entry (item + its OR sub-list) ────────────────────────── */
.dqb-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* ── Condition list ────────────────────────────────────────── */
.dqb-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
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

  &:hover { border-color: #c0c4cc; }
}

/* property: 22% */
.dqb-item-prop {
  width: 22%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-input),
  :deep(.el-select) { width: 100% !important; }
}

/* condition: 22% */
.dqb-item-cond {
  width: 22%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-select) { width: 100% !important; }
}

/* value: flex grow */
.dqb-item-val {
  flex: 1;
  min-width: 0;

  :deep(.el-select),
  :deep(.el-input) { width: 100% !important; }
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

  :deep(.el-input) { flex: 1; min-width: 0; }
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

  .dqb-item:hover & { opacity: 1; }
}

/* ── OR sub-list ───────────────────────────────────────────── */
.dqb-or-list {
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 10px;
  border-left: 2px solid #e6a23c;

  .dqb-item--or {
    background: #fffdf5;
    border-color: #f0e6c8;

    &:hover { border-color: #e6a23c; }
  }
}

.dqb-or-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #e6a23c;
  background: #fdf6ec;
  flex-shrink: 0;
  line-height: 18px;
}

.dqb-or-action {
  padding-left: 28px;
}

/* ── Actions ───────────────────────────────────────────────── */
.dqb-actions {
  display: flex;
  gap: 4px;
  margin-top: 6px;
  padding-top: 6px;
  border-top: 1px dashed #ebeef5;
}

/* ── Tabs ──────────────────────────────────────────────────── */
.dqb-tabs {
  :deep(.el-tabs__header) { margin-bottom: 8px; }
  :deep(.el-tabs__nav-wrap::after) { display: none; }
}

/* ── Sort columns ──────────────────────────────────────────── */
.dqb-col-sort-field { width: 40%; flex-shrink: 0; }
.dqb-col-sort-dir { width: 180px; flex-shrink: 0; }

.dqb-sort-field {
  width: 40%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-input),
  :deep(.el-select) { width: 100% !important; }
}

.dqb-sort-dir {
  width: 180px;
  flex-shrink: 0;
}

/* ── Aggregate columns ────────────────────────────────────── */
.dqb-col-agg-field { width: 40%; flex-shrink: 0; }
.dqb-col-agg-func { width: 160px; flex-shrink: 0; }

.dqb-agg-field {
  width: 40%;
  min-width: 0;
  flex-shrink: 0;

  :deep(.el-input),
  :deep(.el-select) { width: 100% !important; }
}

.dqb-agg-func {
  width: 160px;
  flex-shrink: 0;

  :deep(.el-select) { width: 100% !important; }
}
</style>
