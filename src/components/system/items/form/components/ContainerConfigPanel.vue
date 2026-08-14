<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {i18n} from "@/lang";
import type {ItemType} from "star-horse-lowcode";
import {uuid} from "star-horse-lowcode";
import {deepClone} from "@/api/system";
import {formContainer} from "@/components/system/items/form/composables/formContainer";

defineOptions({name: "ContainerConfigPanel"});

const props = withDefaults(defineProps<{
  currentItemType: string;
  compSize?: string;
}>(), {compSize: "default"});

const emit = defineEmits<{ (e: "inited"): void }>();

// ==================== 从 formContainer 读取当前容器配置 ====================
const containerDef = computed(() => formContainer.find((c) => c.itemType === props.currentItemType));
const ownFields = computed<ItemType[]>(() => containerDef.value?.fields || []);
const advancedFields = computed<ItemType[]>(() => containerDef.value?.advancedFields || []);
const prepFields = computed<ItemType[]>(() => containerDef.value?.preps || []);
const hasOwnProps = computed(() => ownFields.value.length > 0 || advancedFields.value.length > 0);
const hasElements = computed(() => prepFields.value.length > 0);
const propsModel = ref("elements");
// 判断栅格型：preps 中存在 fieldType === "gridColumns"
const gridFieldDef = computed(() => prepFields.value.find((f) => f.fieldType === "gridColumns"));
const isGrid = computed(() => !!gridFieldDef.value);
const gridColDefs = computed<any[]>(() => gridFieldDef.value?.configParams || []);

// 列表展示字段（排除 gridColumns 类型）+ 展开行字段
const listFields = computed(() => prepFields.value.filter((f) => f.fieldType !== "gridColumns"));
const expandFields = computed(() => listFields.value.filter((f) => isSpecialField(f)));
// 公共字段：前几个常规字段（label/subTablePrimaryKey/subFormFlag/subTableName/mapping）
const commonListFields = computed(() => listFields.value.filter((f) => !isSpecialField(f)));
const hasExpand = computed(() => expandFields.value.length > 0 || isGrid.value);
const showAdvanced = ref(false);

/** 判断是否为特殊字段（非常规公共字段） */
const isSpecialField = (f: ItemType): boolean => {
  const commonNames = ["label", "subTablePrimaryKey", "subFormFlag", "subTableName", "mapping"];
  return !commonNames.includes(f.fieldName);
};

/** 解析 selectValues 为 options */
const parseOptions = (selectValues: any): { name: string; value: any }[] => {
  if (Array.isArray(selectValues)) return selectValues;
  if (typeof selectValues === "string" && selectValues.startsWith("[")) {
    try {
      return JSON.parse(selectValues.replace(/'/g, '"'));
    } catch {
      return [];
    }
  }
  return [];
};

/** 从 configParams 读取 switch 的 active/inactive 值 */
const switchValues = (f: ItemType): { active: any; inactive: any } => {
  const cp = f.configParams?.[0];
  if (cp && cp.activeValue !== undefined) return {active: cp.activeValue, inactive: cp.inactiveValue};
  return {active: true, inactive: false};
};

/** 从 configParams 读取字段联动：subFormFlag=Y 时显示哪些字段 */
const showFieldsMap = computed<Record<string, string[]>>(() => {
  const map: Record<string, string[]> = {};
  prepFields.value.forEach((f) => {
    const cp = f.configParams?.[0];
    if (cp && cp.showFields && cp.activeValue !== undefined) {
      map[f.fieldName] = cp.showFields;
    }
  });
  return map;
});

const isFieldVisible = (fieldName: string, row: any): boolean => {
  for (const [ctrlField, showFields] of Object.entries(showFieldsMap.value)) {
    if (showFields.includes(fieldName)) {
      const cp = prepFields.value.find((f) => f.fieldName === ctrlField)?.configParams?.[0];
      if (cp && row[ctrlField] !== cp.activeValue) return false;
    }
  }
  return true;
};

// ==================== 数据 ====================
const containerProps = reactive<Record<string, any>>({});
const localElements = ref<any[]>([]);

const initContainerProps = (data: any) => {
  Object.keys(containerProps).forEach((k) => delete containerProps[k]);
  const all = [...ownFields.value, ...advancedFields.value];
  all.forEach((f) => {
    const key = f.fieldName;
    if (data && data[key] !== undefined) containerProps[key] = data[key];
    else if (f.defaultValues !== undefined && f.defaultValues !== "") containerProps[key] = f.defaultValues;
    else if (f.fieldType === "switch") containerProps[key] = false;
    else if (f.fieldType === "number") containerProps[key] = undefined;
    else containerProps[key] = "";
  });
};

/** 检测数据 key：elements 或 children */
const detectDataKey = (data: any): string => {
  if (data && Array.isArray(data.children)) return "children";
  return "elements";
};

const createNewElement = () => {
  const idx = localElements.value.length + 1;
  const el: any = {};
  // 按字段定义初始化默认值
  listFields.value.forEach((f) => {
    if (f.fieldType === "gridColumns") return;
    if (f.defaultValues !== undefined && f.defaultValues !== "") el[f.fieldName] = f.defaultValues;
    else if (f.fieldType === "switch") {
      const {active} = switchValues(f);
      el[f.fieldName] = active;
    } else if (f.fieldType === "number") el[f.fieldName] = undefined;
    else if (f.fieldName === "label") el[f.fieldName] = `${containerDef.value?.itemName || "Item"}${idx}`;
    else if (f.fieldName === "subTablePrimaryKey") el[f.fieldName] = `${props.currentItemType}${idx}`;
    else el[f.fieldName] = "";
  });
  // 栅格列
  if (isGrid.value) {
    el.columns = [createGridColumn()];
  } else {
    el.items = [];
  }
  return el;
};

const createGridColumn = () => {
  const col: any = {id: uuid(), colIndex: 1, rowspan: 1, items: [], cellVisible: true};
  gridColDefs.value.forEach((d: any) => {
    col[d.fieldName] = d.default ?? d.defaultValues ?? "";
  });
  return col;
};

const addElement = () => localElements.value.push(createNewElement());
const removeElement = (i: number) => localElements.value.splice(i, 1);
const moveUp = (i: number) => {
  if (i <= 0) return;
  const [x] = localElements.value.splice(i, 1);
  localElements.value.splice(i - 1, 0, x);
};
const moveDown = (i: number) => {
  if (i >= localElements.value.length - 1) return;
  const [x] = localElements.value.splice(i, 1);
  localElements.value.splice(i + 1, 0, x);
};

const addColumn = (row: any) => {
  const col = createGridColumn();
  col.colIndex = row.columns.length + 1;
  row.columns.push(col);
  // 均分：按 gridColDefs 第一个字段的 max 值判断总量（24 或 100）
  const total = gridColDefs.value[0]?.max === 24 ? 24 : 100;
  const avg = Math.floor(total / row.columns.length);
  const field = gridColDefs.value[0]?.fieldName;
  if (field) row.columns.forEach((c: any) => (c[field] = avg));
};
const removeColumn = (row: any, ci: number) => row.columns.splice(ci, 1);

// ==================== 公共API ====================
let currentDataKey = "elements";

const setFormData = (data: any) => {
  initContainerProps(data);
  currentDataKey = detectDataKey(data);
  if (data && Array.isArray(data[currentDataKey])) {
    localElements.value = deepClone(data[currentDataKey]);
  } else {
    localElements.value = [];
  }
};

const getFormData = () => {
  const result: any = {...containerProps};
  if (hasElements.value) result[currentDataKey] = localElements.value;
  return {value: result};
};

defineExpose({setFormData, getFormData});

onMounted(() => emit("inited"));
watch(() => props.currentItemType, () => {
  showAdvanced.value = false;
});
</script>
<template>
  <div v-if="containerDef" class="container-cfg-panel w-full">
    <!-- ====== 容器自身属性 ====== -->
    <el-tabs v-if="hasOwnProps" v-model="propsModel" class="cfg-collapse">

      <!-- ====== 子项列表 ====== -->
      <el-tab-pane v-if="hasElements" name="elements">
        <template #label><span class="section-title">{{ i18n("dyform.container.cfg.elementsConfig") }}</span></template>
        <el-table :data="localElements" :fit="true" style="width:100%" border :size="compSize" row-key="id"
                  max-height="400">
          <el-table-column v-if="hasExpand" type="expand" width="38">
            <template #default="{ row }">
              <div class="expand-body">
                <!-- 特殊字段 -->
                <template v-if="expandFields.length">
                  <el-descriptions :title="i18n('dyform.container.cfg.specialParams')" border column="2"
                                   direction="horizontal" label-width="150px">
                    <el-descriptions-item v-for="f in expandFields" :label="f.label" :key="f.fieldName"
                                          label-align="right">
                      <el-input v-if="f.fieldType === 'input'" v-model="row[f.fieldName]" :size="compSize"
                      />
                      <el-input-number v-else-if="f.fieldType === 'number'" v-model="row[f.fieldName]" :size="compSize"
                                       controls-position="right"/>
                      <el-switch v-else-if="f.fieldType === 'switch'" v-model="row[f.fieldName]"
                                 :active-value="switchValues(f).active" :inactive-value="switchValues(f).inactive"/>
                      <el-select v-else-if="f.fieldType === 'select'" v-model="row[f.fieldName]" :size="compSize"
                                 clearable filterable>
                        <el-option v-for="opt in parseOptions(f.selectValues)" :key="opt.value" :label="opt.name"
                                   :value="opt.value"/>
                      </el-select>
                    </el-descriptions-item>
                  </el-descriptions>

                </template>
                <!-- 栅格列配置 -->
                <template v-if="isGrid">
                  <div class="expand-section-title">{{ i18n("dyform.container.cfg.columnsConfig") }}</div>
                  <div v-for="(col, ci) in row.columns" :key="col.id" class="col-row">
                    <span class="col-label">{{ i18n("dyform.container.cfg.column") }}{{ ci + 1 }}</span>
                    <template v-for="d in gridColDefs" :key="d.fieldName">
                      <span class="col-field-label">{{ d.label }}</span>
                      <el-input-number v-model="col[d.fieldName]" :min="d.min" :max="d.max" :step="d.step || 1"
                                       :size="compSize" controls-position="right" style="width:120px"/>
                    </template>
                    <el-button :size="compSize" type="danger" plain icon="Delete" @click="removeColumn(row, ci)"
                               style="margin-left:12px"/>
                  </div>
                  <el-button :size="compSize" type="primary" plain icon="Plus" @click="addColumn(row)"
                             style="margin-top:8px">
                    {{ i18n("dyform.container.cfg.addColumn") }}
                  </el-button>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#" width="45" align="center"/>
          <el-table-column v-for="f in commonListFields" :key="f.fieldName" :label="f.label" :min-width="200">
            <template #default="{ row }">
              <template v-if="isFieldVisible(f.fieldName, row)">
                <el-input v-if="f.fieldType === 'input'" v-model="row[f.fieldName]" :size="compSize"/>
                <el-input-number v-else-if="f.fieldType === 'number'" v-model="row[f.fieldName]" :size="compSize"
                                 controls-position="right"/>
                <el-switch v-else-if="f.fieldType === 'switch'" v-model="row[f.fieldName]"
                           :active-value="switchValues(f).active" :inactive-value="switchValues(f).inactive"/>
                <el-select v-else-if="f.fieldType === 'select'" v-model="row[f.fieldName]" :size="compSize"
                           style="width:100%">
                  <el-option v-for="opt in parseOptions(f.selectValues)" :key="opt.value" :label="opt.name"
                             :value="opt.value"/>
                </el-select>
              </template>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column v-if="isGrid" :label="i18n('dyform.container.cfg.columnCount')" width="80" align="center">
            <template #default="{ row }">{{ row.columns?.length ?? 0 }}</template>
          </el-table-column>
          <el-table-column :label="i18n('dyform.container.cfg.operations')" width="160" fixed="right" align="center">
            <template #default="{ $index }">
              <el-button-group>
                <el-button :size="compSize" icon="Top" :disabled="$index === 0" @click="moveUp($index)"/>
                <el-button :size="compSize" icon="Bottom" :disabled="$index === localElements.length - 1"
                           @click="moveDown($index)"/>
                <el-button :size="compSize" type="danger" icon="Delete" @click="removeElement($index)"/>
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" plain icon="Plus" @click="addElement" style="margin-top:10px;width:100%">
          {{ i18n("dyform.container.cfg.addElement") }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane name="props">
        <template #label><span class="section-title">{{ i18n("dyform.container.cfg.ownProps") }}</span></template>
        <el-descriptions border label-width="150px">
          <el-descriptions-item v-for="f in ownFields" :key="f.fieldName">
            <template #label>
              <label class="prop-label">{{ f.label }}<span v-if="f.required" class="required-mark">*</span></label>
            </template>

            <el-input v-if="f.fieldType === 'input'" v-model="containerProps[f.fieldName]" :size="compSize"/>
            <el-input-number v-else-if="f.fieldType === 'number'" v-model="containerProps[f.fieldName]" :size="compSize"
                             controls-position="right" style="width:100%"/>
            <el-switch v-else-if="f.fieldType === 'switch'" v-model="containerProps[f.fieldName]"/>
            <el-select v-else-if="f.fieldType === 'select'" v-model="containerProps[f.fieldName]" :size="compSize"
                       style="width:100%" clearable filterable>
              <el-option v-for="opt in parseOptions(f.selectValues)" :key="opt.value" :label="opt.name"
                         :value="opt.value"/>
            </el-select>
          </el-descriptions-item>
          <template v-if="advancedFields.length">
            <el-button text type="primary" size="small" @click="showAdvanced = !showAdvanced" style="margin-top:8px">
              <el-icon>
                <ArrowDown v-if="!showAdvanced"/>
                <ArrowUp v-else/>
              </el-icon>
              {{ showAdvanced ? i18n("dyform.container.cfg.collapse") : i18n("dyform.container.cfg.more") }}
            </el-button>
            <el-descriptions v-show="showAdvanced" border style="margin-top:8px">
              <el-descriptions-item v-for="f in advancedFields"  :key="f.fieldName">
                <template #label>
                  <label class="prop-label">{{ f.label }}<span v-if="f.required" class="required-mark">*</span></label>
                </template>
                <el-input v-if="f.fieldType === 'input'" v-model="containerProps[f.fieldName]" :size="compSize"/>
                <el-input-number v-else-if="f.fieldType === 'number'" v-model="containerProps[f.fieldName]"
                                 :size="compSize" controls-position="right" style="width:100%"/>
                <el-switch v-else-if="f.fieldType === 'switch'" v-model="containerProps[f.fieldName]"/>
                <el-select v-else-if="f.fieldType === 'select'" v-model="containerProps[f.fieldName]" :size="compSize"
                           style="width:100%" clearable filterable>
                  <el-option v-for="opt in parseOptions(f.selectValues)" :key="opt.value" :label="opt.name"
                             :value="opt.value"/>
                </el-select>
              </el-descriptions-item>
            </el-descriptions>
          </template>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>
  </div>
  <el-empty v-else :description="i18n('dyform.container.cfg.unsupported')"/>
</template>
<style lang="scss" scoped>
.container-cfg-panel {
  padding: 4px
}

.cfg-collapse {
  :deep(.el-collapse-item__header) {
    font-weight: 600
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 12px
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary)
}

.props-grid {
  display: grid;
  grid-template-columns:repeat(2, 1fr);
  gap: 8px 16px
}

.prop-item {
  display: flex;
  flex-direction: column;
  gap: 4px
}

.prop-label {
  font-size: 13px;
  color: var(--el-text-color-regular)
}

.required-mark {
  color: var(--el-color-danger)
}

.expand-body {
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 6px
}

.expand-section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;

  &:not(:first-child) {
    margin-top: 12px
  }
}

.expand-fields {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 20px
}

.expand-field-item {
  display: flex;
  align-items: center;
  gap: 6px
}

.expand-field-label {
  font-size: 13px;
  white-space: nowrap;
  color: var(--el-text-color-regular)
}

.col-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px
}

.col-label {
  font-size: 13px;
  font-weight: 500;
  min-width: 44px
}

.col-field-label {
  font-size: 12px;
  color: var(--el-text-color-secondary)
}

.text-muted {
  color: var(--el-text-color-placeholder)
}
</style>
