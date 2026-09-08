<script setup lang="ts">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {i18n} from "@/lang";
import {analysisCompDatas, ItemType, SelectOption, StarHorseDataSelector, uuid} from "star-horse-lowcode";
import {deepClone} from "@/api/system";
import {formContainer} from "@/components/system/items/form/composables/formContainer";
import FlowNodeConfigPanel from "@/components/system/items/form/components/FlowNodeConfigPanel.vue";
import type {FlowDefineOption, FlowParam,} from "@/components/workflow/types";

defineOptions({name: "ContainerConfigPanel"});

const props = withDefaults(
    defineProps<{
      currentItemType: string;
      compSize?: string;
      /** 已有流程定义选项（透传给 FlowNodeConfigPanel reuse 模式） */
      flowDefineOptions?: FlowDefineOption[];
      /** 加载流程参数（透传给 FlowNodeConfigPanel reuse 模式） */
      loadFlowParams?: (flowDefineId: string) => Promise<FlowParam[]>;
    }>(),
    {
      compSize: "default",
      flowDefineOptions: () => [],
      loadFlowParams: undefined,
    },
);

const emit = defineEmits<{ (e: "inited"): void }>();

// ==================== 从 formContainer 读取当前容器配置 ====================
const containerDef = computed(() =>
    formContainer.find((c) => c.itemType === props.currentItemType),
);
const ownFields = computed<ItemType[]>(() => containerDef.value?.fields || []);
const advancedFields = computed<ItemType[]>(
    () => containerDef.value?.advancedFields || [],
);
const prepFields = computed<ItemType[]>(() => containerDef.value?.preps || []);
const hasOwnProps = computed(
    () => ownFields.value.length > 0 || advancedFields.value.length > 0,
);
const hasElements = computed(() => prepFields.value.length > 0);
const propsModel = ref("elements");
// 判断栅格型：preps 中存在 fieldType === "gridColumns"
const gridFieldDef = computed(() =>
    prepFields.value.find((f) => f.fieldType === "gridColumns"),
);
const isGrid = computed(() => !!gridFieldDef.value);
const gridColDefs = computed<any[]>(
    () => gridFieldDef.value?.configParams || [],
);

// 列表展示字段（排除 gridColumns 类型）+ 展开行字段
const listFields = computed(() =>
    prepFields.value.filter((f) => f.fieldType !== "gridColumns"),
);
const expandFields = computed(() =>
    listFields.value.filter((f) => isSpecialField(f)),
);
// 公共字段：前几个常规字段（label/subTablePrimaryKey/subFormFlag/subTableName/mapping）
const commonListFields = computed(() =>
    listFields.value.filter((f) => !isSpecialField(f)),
);
const hasExpand = computed(() => expandFields.value.length > 0 || isGrid.value);
const showAdvanced = ref(false);

/** 判断是否为特殊字段（非常规公共字段） */
const isSpecialField = (f: ItemType): boolean => {
  const commonNames = [
    "dataIndex",
    "label",
    "subTablePrimaryKey",
    "subFormFlag",
    "formVisible",
    "subTableName",
    "mapping",
  ];
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
  if (cp && cp.activeValue !== undefined)
    return {active: cp.activeValue, inactive: cp.inactiveValue};
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
      const cp = prepFields.value.find((f) => f.fieldName === ctrlField)
          ?.configParams?.[0];
      if (cp && row[ctrlField] !== cp.activeValue) return false;
    }
  }
  return true;
};

/** userSelector 字段的可选项（dataUrl 配置在字段 configParams，未配置时允许手输） */
const selectorProps = (f: ItemType) => {
  const cp = f.configParams?.[0] || {};
  return {
    multiple: !!cp.multiple,
    dataUrl: cp.dataUrl,
    params: cp.params,
    displayName: cp.displayName || "name",
    displayValue: cp.displayValue || "value",
  };
};

/** 流程节点配置面板字段（flowNode 类型特殊渲染，不进常规 descriptions） */
const flowNodeFields = computed(() =>
    listFields.value.filter((f) => f.fieldType === "flowNode"),
);

/**
 * 递归提取分段内的可绑定字段（叶子组件的 fieldName+label），
 * 供流程节点配置面板做字段绑定与"表单字段取人"下拉
 */
const extractFields = (items: any[]): SelectOption[] => {
  let datas = analysisCompDatas(items);
  return datas.selectList;
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
    else if (f.defaultValues !== undefined && f.defaultValues !== "")
      containerProps[key] = f.defaultValues;
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
    if (f.defaultValues !== undefined && f.defaultValues !== "")
      el[f.fieldName] = f.defaultValues;
    else if (f.fieldType === "switch") {
      const {active} = switchValues(f);
      el[f.fieldName] = active;
    } else if (f.fieldName === "dataIndex") {
      // 排序字段为空时默认取行序号（新增行即将追加到末尾，序号为 length+1）
      el[f.fieldName] = idx;
    } else if (f.fieldType === "number") el[f.fieldName] = undefined;
    else if (f.fieldType === "userSelector") el[f.fieldName] = [];
    else if (f.fieldType === "flowNode") el[f.fieldName] = createFlowCfg();
    else if (f.fieldName === "label")
      el[f.fieldName] = `${containerDef.value?.itemName || "Item"}${idx}`;
    else if (f.fieldName === "subTablePrimaryKey")
      el[f.fieldName] = `${props.currentItemType}${idx}`;
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
  const col: any = {
    id: uuid(),
    colIndex: 1,
    rowspan: 1,
    items: [],
    cellVisible: true,
  };
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

/** flowNode 字段缺省配置结构（新建分段与旧数据补齐共用） */
const createFlowCfg = () => ({
  mode: "design" as const,
  flowFlag: "N",
  paramFields: [],
  assigneeType: "starter_pick",
  assigneeField: "",
  assigneeValue: [],
  ccValue: [],
  visibleScope: "prev_and_self",
  rejectPolicy: "to_prev",
});

const setFormData = (data: any) => {
  initContainerProps(data);
  currentDataKey = detectDataKey(data);
  if (data && Array.isArray(data[currentDataKey])) {
    localElements.value = deepClone(data[currentDataKey]);
  } else {
    localElements.value = [];
  }
  // dataIndex 为空时默认取行序号（与 # 序号列一致，从 1 开始）
  localElements.value.forEach((el: any, i: number) => {
    if (el.dataIndex === undefined || el.dataIndex === null || el.dataIndex === "") {
      el.dataIndex = i + 1;
    }
  });
  // 旧模板分段缺 flowConfig 时补齐缺省结构，保证面板 v-model 绑定到有效响应式对象
  if (flowNodeFields.value.length) {
    localElements.value.forEach((el: any) => {
      flowNodeFields.value.forEach((f) => {
        if (!el[f.fieldName] || typeof el[f.fieldName] !== "object") {
          el[f.fieldName] = createFlowCfg();
        }
      });
    });
  }
};

const getFormData = () => {
  const result: any = {...containerProps};
  if (hasElements.value) result[currentDataKey] = localElements.value;
  return {value: result};
};

defineExpose({setFormData, getFormData});

onMounted(() => emit("inited"));
watch(
    () => props.currentItemType,
    () => {
      showAdvanced.value = false;
      if (!hasElements.value) propsModel.value = "props";
      else propsModel.value = "elements";
    },
    {immediate: true},
);
</script>
<template>
  <div v-if="containerDef" class="container-cfg-panel w-full">
    <!-- ====== 容器自身属性 ====== -->
    <el-tabs v-if="hasOwnProps" v-model="propsModel" class="cfg-collapse">
      <!-- ====== 子项列表 ====== -->
      <el-tab-pane v-if="hasElements" name="elements">
        <template #label
        ><span class="section-title">{{
            i18n("dyform.container.cfg.elementsConfig")
          }}</span></template
        >
        <el-table
            :data="localElements"
            :fit="true"
            style="width: 100%"
            border
            :size="compSize"
            row-key="id"
            max-height="400"
        >
          <el-table-column v-if="hasExpand" type="expand" width="38">
            <template #default="{ row }">
              <div class="expand-body">
                <!-- 特殊字段（应用 showFields 联动；flowNode 类型面板单独渲染） -->
                <template v-if="expandFields.length">
                  <el-descriptions
                      :title="i18n('dyform.container.cfg.specialParams')"
                      border
                      column="2"
                      direction="horizontal"
                      label-width="150px"
                  >
                    <el-descriptions-item
                        v-for="f in expandFields.filter(
                        (x) =>
                          x.fieldType !== 'flowNode' &&
                          isFieldVisible(x.fieldName, row),
                      )"
                        :key="f.fieldName"
                        label-align="right"
                    >

                      <template #label>
                        <div class="flex flex-row items-center justify-between">
                          <label>
                        <span
                            :title="f.remark"
                            style="cursor: help; text-decoration: underline dotted"
                        >{{ f.label }}</span
                        >
                            <div v-if="f.required" style="color: var(--el-color-danger)">*</div>
                          </label>
                          <help :message="f.helpMsg" v-if="f.helpMsg"/>
                        </div>
                      </template>
                      <el-input
                          v-if="f.fieldType === 'input'"
                          v-model="row[f.fieldName]"
                          :size="compSize"
                      />
                      <el-input-number
                          v-else-if="f.fieldType === 'number'"
                          v-model="row[f.fieldName]"
                          :size="compSize"
                          controls-position="right"
                      />
                      <el-switch
                          v-else-if="f.fieldType === 'switch'"
                          v-model="row[f.fieldName]"
                          :active-value="switchValues(f).active"
                          :inactive-value="switchValues(f).inactive"
                      />
                      <el-select
                          v-else-if="f.fieldType === 'select'"
                          v-model="row[f.fieldName]"
                          :size="compSize"
                          clearable
                          filterable
                      >
                        <el-option
                            v-for="opt in parseOptions(f.selectValues)"
                            :key="opt.value"
                            :label="opt.name"
                            :value="opt.value"
                        />
                      </el-select>
                      <!-- 人员/编码选择器：经办人、抄送人等，支持手输与列表选择 -->
                      <StarHorseDataSelector
                          v-else-if="f.fieldType === 'userSelector'"
                          v-model="row[f.fieldName]"
                          v-bind="selectorProps(f)"
                          :comp-size="compSize"
                          allow-create
                          :placeholder="
                          i18n('dyform.step.flowSelectorTip')
                        "
                          style="width: 100%"
                      />
                    </el-descriptions-item>
                  </el-descriptions>
                </template>

                <!-- 流程节点配置面板：传入当前分段字段列表，组件内完成字段绑定+流转设置 -->
                <template v-if="flowNodeFields.length">
                  <FlowNodeConfigPanel
                      v-for="f in flowNodeFields"
                      :key="f.fieldName"
                      v-model="row[f.fieldName]"
                      :fields="extractFields(row.items)"
                      :node-key="row.subTablePrimaryKey"
                      :node-name="row.label"
                      :comp-size="compSize"
                      :flow-define-options="props.flowDefineOptions"
                      :load-flow-params="props.loadFlowParams"
                      style="margin-top: 12px"
                  />
                </template>
                <!-- 栅格列配置 -->
                <template v-if="isGrid">
                  <div class="grid-col-section">
                    <div
                        v-for="(col, ci) in row.columns"
                        :key="col.id"
                        class="grid-col-block"
                    >
                      <el-descriptions
                          border
                          :title="i18n('dyform.container.cfg.column') + (ci + 1)"
                          :column="3"
                          :size="compSize"
                      >
                        <template #extra>
                          <el-button
                              :size="compSize"
                              type="danger"
                              plain
                              icon="Delete"
                              @click="removeColumn(row, ci)"
                          />
                        </template>
                        <el-descriptions-item
                            v-for="d in gridColDefs"
                            :key="d.fieldName"
                            :label="d.label"
                        >
                          <el-input-number
                              v-model="col[d.fieldName]"
                              :min="d.min"
                              :max="d.max"
                              :step="d.step || 1"
                              :size="compSize"
                              controls-position="right"
                              style="width: 100%"
                          />
                        </el-descriptions-item>
                      </el-descriptions>
                    </div>
                  </div>
                  <el-button
                      :size="compSize"
                      type="primary"
                      plain
                      icon="Plus"
                      @click="addColumn(row)"
                      style="margin-top: 8px"
                  >
                    {{ i18n("dyform.container.cfg.addColumn") }}
                  </el-button>
                </template>
              </div>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#" width="45" align="center"/>
          <el-table-column
              v-for="f in commonListFields"
              :key="f.fieldName"
              :label="f.label"
          >
            <template #default="{ row }">
              <template v-if="isFieldVisible(f.fieldName, row)">
                <el-input
                    v-if="f.fieldType === 'input'"
                    v-model="row[f.fieldName]"
                    :size="compSize"
                />
                <el-input-number
                    v-else-if="f.fieldType === 'number'"
                    v-model="row[f.fieldName]"
                    :size="compSize"
                    controls-position="right"
                />
                <el-switch
                    v-else-if="f.fieldType === 'switch'"
                    v-model="row[f.fieldName]"
                    :active-value="switchValues(f).active"
                    :inactive-value="switchValues(f).inactive"
                />
                <el-select
                    v-else-if="f.fieldType === 'select'"
                    v-model="row[f.fieldName]"
                    :size="compSize"
                    style="width: 100%"
                >
                  <el-option
                      v-for="opt in parseOptions(f.selectValues)"
                      :key="opt.value"
                      :label="opt.name"
                      :value="opt.value"
                  />
                </el-select>
              </template>
              <span v-else class="text-muted">—</span>
            </template>
          </el-table-column>
          <el-table-column
              v-if="isGrid"
              :label="i18n('dyform.container.cfg.columnCount')"
              align="center"
          >
            <template #default="{ row }">{{
                row.columns?.length ?? 0
              }}
            </template>
          </el-table-column>
          <el-table-column
              :label="i18n('dyform.container.cfg.operations')"
              width="160"
              fixed="right"
              align="center"
          >
            <template #default="{ $index }">
              <el-button-group>
                <el-button
                    :size="compSize"
                    icon="Top"
                    :disabled="$index === 0"
                    @click="moveUp($index)"
                />
                <el-button
                    :size="compSize"
                    icon="Bottom"
                    :disabled="$index === localElements.length - 1"
                    @click="moveDown($index)"
                />
                <el-button
                    :size="compSize"
                    type="danger"
                    icon="Delete"
                    @click="removeElement($index)"
                />
              </el-button-group>
            </template>
          </el-table-column>
        </el-table>
        <el-button
            type="primary"
            plain
            icon="Plus"
            @click="addElement"
            style="margin-top: 10px; width: 100%"
        >
          {{ i18n("dyform.container.cfg.addElement") }}
        </el-button>
      </el-tab-pane>
      <el-tab-pane name="props">
        <template #label
        ><span class="section-title">{{
            i18n("dyform.container.cfg.ownProps")
          }}</span></template
        >
        <el-descriptions border label-width="150px">
          <el-descriptions-item
              v-for="f in [...ownFields, ...advancedFields]"
              :key="f.fieldName"
          >
            <template #label>
              <div class="flex flex-row items-center justify-between">
                <label class="prop-label"
                >{{
                    f.label
                  }}<span v-if="f.required" class="required-mark">*</span></label
                >
                <help :message="f.helpMsg" v-if="f.helpMsg"/>
              </div>
            </template>

            <el-input
                v-if="f.fieldType === 'input'"
                v-model="containerProps[f.fieldName]"
                :size="compSize"
            />
            <el-input-number
                v-else-if="f.fieldType === 'number'"
                v-model="containerProps[f.fieldName]"
                :size="compSize"
                controls-position="right"
                style="width: 100%"
            />
            <el-switch
                v-else-if="f.fieldType === 'switch'"
                v-model="containerProps[f.fieldName]"
            />
            <el-select
                v-else-if="f.fieldType === 'select'"
                v-model="containerProps[f.fieldName]"
                :size="compSize"
                style="width: 100%"
                clearable
                filterable
            >
              <el-option
                  v-for="opt in parseOptions(f.selectValues)"
                  :key="opt.value"
                  :label="opt.name"
                  :value="opt.value"
              />
            </el-select>
          </el-descriptions-item>
        </el-descriptions>
      </el-tab-pane>
    </el-tabs>
  </div>
  <el-empty v-else :description="i18n('dyform.container.cfg.unsupported')"/>
</template>
<style lang="scss" scoped>
.container-cfg-panel {
  padding: 4px;
}

.cfg-collapse {
  :deep(.el-collapse-item__header) {
    font-weight: 600;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 12px;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.props-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
}

.prop-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.prop-label {
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.required-mark {
  color: var(--el-color-danger);
}

.expand-body {
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
}


.grid-col-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.grid-col-block {
  background: var(--el-bg-color);
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

  :deep(.el-descriptions__title) {
    font-size: 13px;
    padding: 0 15px;
  }

  :deep(.el-descriptions__body) {
    .el-descriptions__cell {
      padding: 6px 10px;
    }
  }
}

.text-muted {
  color: var(--el-text-color-placeholder);
}
</style>
