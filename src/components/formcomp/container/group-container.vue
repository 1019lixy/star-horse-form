<script setup lang="ts">
import {insertBelowRow, insertRightCol,} from "@/components/formcomp/container/dytableUtils";
import {
  insertBelowRow as gtInsertBelowRow,
  insertRightCol as gtInsertRightCol,
} from "@/components/formcomp/container/gridtableUtils";
import {i18n} from "@/lang";
import {copyContainer, dynamicFormContextMenuData,} from "@/plugins/AblesPlugin";
import {getDesignFormStore} from "@/store/StoreManager";
import {fieldCopy} from "@/utils/FieldOperationUtils";
import {hasOpenDialog} from "@/api/keyboard-event-utils";
import FieldList from "@/components/formcomp/utils/FieldList.vue";
import {CellRubberBand} from "@/components/formcomp/utils/CellRubberBand";
import {
  clearRegionItems,
  mergeBoxRegionByCells,
  mergeRegionByCells,
  splitBoxRegionByCells,
  splitRegionByCells,
} from "@/components/formcomp/utils/CellRegionOperation";

import {computed, PropType, ref, watch} from "vue";
import {operationConfirm, uuid, warning} from "star-horse-lowcode";
import {ElMessage} from "element-plus";
import camelcase from "camelcase";

const props = defineProps({
  isDesign: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  parentField: { type: Object as PropType<any> },
  formItem: { type: Object, required: true },
});
let designForm = getDesignFormStore();
let compList = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
let componentVisible = computed(() => {
  return (
    designForm.componentVisible &&
    currentItemId.value == props.formItem?.preps.id
  );
});
let isEdit = computed(() => props.isDesign);

// ── Collapse/Expand ──
const collapsed = ref(false);
const toggleCollapse = (e: Event) => {
  e.stopPropagation();
  collapsed.value = !collapsed.value;
};

// Auto-expand when a child component is selected (e.g. from outline)
const containsItemId = (container: any, targetId: string): boolean => {
  if (!targetId || !container) return false;
  const elements = container.preps?.elements || [];
  for (const el of elements) {
    for (const item of el.items || []) {
      if ((item.preps?.id || item.id) === targetId) return true;
      if (item.itemType && containsItemId(item, targetId)) return true;
    }
    for (const item of el.headerFieldList || []) {
      if ((item.preps?.id || item.id) === targetId) return true;
    }
    for (const col of el.columns || []) {
      for (const item of col.items || []) {
        if ((item.preps?.id || item.id) === targetId) return true;
        if (item.itemType && containsItemId(item, targetId)) return true;
      }
    }
  }
  for (const child of container.children || []) {
    if ((child.preps?.id || child.id) === targetId) return true;
    if (child.itemType && containsItemId(child, targetId)) return true;
  }
  return false;
};

watch(currentItemId, (newId) => {
  if (collapsed.value && newId && containsItemId(props.formItem, newId)) {
    collapsed.value = false;
  }
});
const containerLabel = computed(() => {
  const labels: Record<string, string> = {
    tab: "选项卡",
    box: "栅格",
    table: "表格",
    card: "卡片",
    dytable: "动态表格",
    gridtable: "栅格表格",
    collapse: "折叠",
    splitter: "分割",
    condition: "条件",
    step: "步骤",
    dialog: "对话框",
    drawer: "抽屉",
    fieldset: "分组",
    descriptions: "描述列表",
    anchor: "锚点导航",
  };
  return labels[props.formItem?.itemType] || "容器";
});

const selectData = () => {
  let container = props.formItem;
  designForm.setParentContainer(props.parentField);
  designForm.selectItem(container, container?.itemType, "");
};
const removeData = () => {
  operationConfirm(i18n("dyform.comp.container.440")).then((res) => {
    if (res) {
      let id = props.formItem.preps?.id || props.formItem.id;
      let parentType = props.parentField?.itemType;
      if (
        parentType == "tab" ||
        parentType == "card" ||
        parentType == "collapse" ||
        parentType == "step" ||
        parentType == "dialog" ||
        parentType == "drawer" ||
        parentType == "fieldset" ||
        parentType == "descriptions" ||
        parentType == "anchor"
      ) {
        // These containers store items in elements[i].items
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
          let items = elements[i].items;
          for (let j = 0; j < items.length; j++) {
            let itemId = items[j]?.preps?.id || items[j]?.id;
            if (id === itemId) {
              items.splice(j, 1);
              return;
            }
          }
        }
      } else if (
        parentType == "box" ||
        parentType == "dytable" ||
        parentType == "gridtable" ||
        parentType == "table"
      ) {
        // These containers store items in elements[i].columns[j].items
        let elements = props.parentField!.preps.elements;
        for (let i = 0; i < elements.length; i++) {
          let columns = elements[i].columns;
          if (!columns) continue;
          for (let j = 0; j < columns.length; j++) {
            let items = columns[j].items;
            for (let k = 0; k < items.length; k++) {
              let itemId = items[k]?.preps?.id || items[k]?.id;
              if (id === itemId) {
                items.splice(k, 1);
                return;
              }
            }
          }
        }
      } else {
        // Top-level container in compList
        let dataList = compList.value;
        for (let i = 0; i < dataList.length; i++) {
          let itemId = dataList[i].preps?.id || dataList[i].id;
          if (id === itemId) {
            dataList.splice(i, 1);
            return;
          }
        }
      }
    }
  });
};
const containerContextMenuRef = ref();
const containerContextMenu = (evt: MouseEvent | any) => {
  if (!isEdit.value) return;
  if (hasOpenDialog()) return;
  evt.stopPropagation();
  evt.preventDefault();
  evt.props = props;
  // 右键时先选中当前容器，确保"添加组件"弹窗等后续操作正常工作
  selectContainer();
  containerContextMenuRef.value?.show(evt);
};
const selectContainer = () => {
  designForm.selectItem(props.formItem, props.formItem.itemType, "");
};
const close = () => {
  designForm.setComponentVisible(false);
};
const addItem = (item: any) => {
  let type = item.category == 2 ? "container" : "formItem";
  let data = fieldCopy(item, type);
  let itemType = props.formItem.itemType;
  let activeItemName = props.formItem.activeItemName;
  let elements = props.formItem.preps.elements;
  for (let index in elements) {
    let element = elements[index];
    if (activeItemName && activeItemName != element.subTablePrimaryKey) {
      continue;
    }
    let columns = element.columns;
    if (!columns) {
      let items = element.items;
      if (itemType == "table") {
        if (items.length == 0) {
          items.push(data);
          designForm.selectItem(data, data.itemType, "");
          return;
        }
      } else {
        items.push(data);
        designForm.selectItem(data, data.itemType, "");
        return;
      }
    }
    for (let colIndex in columns) {
      let col = columns[colIndex];
      if (col.items.length == 0) {
        col.items.push(data);
        designForm.selectItem(data, data.itemType, "");
        return;
      }
    }
  }
};
const tableOperation = (actonName: string, _preps: any) => {
  let preps = props.formItem.preps;
  if (!preps.elements) {
    preps["elements"] = [];
  }
  const itemType = props.formItem.itemType;
  const isGridtable = itemType == "gridtable";
  if (actonName == "insertRow") {
    if (isGridtable) {
      gtInsertBelowRow(
        {
          parentField: props.formItem,
          rowIndex: preps.elements.length - 1,
        },
        itemType,
      );
    } else {
      insertBelowRow(
        {
          parentField: props.formItem,
          rowIndex: preps.elements.length - 1,
        },
        itemType,
      );
    }
  } else if (actonName == "insertCol") {
    if (props.formItem.itemType == "table") {
      preps.columns = (preps.columns || 1) + 1;
      return;
    }
    if (isGridtable) {
      gtInsertRightCol(
        {
          parentField: props.formItem,
          colIndex: preps.elements[0].columns.length - 1,
        },
        itemType,
        true,
      );
    } else {
      insertRightCol(
        {
          parentField: props.formItem,
          colIndex: preps.elements[0].columns.length - 1,
        },
        itemType,
        true,
      );
    }
  } else if (actonName == "copy") {
    //拷贝容器
    copyContainer(props.parentField, props.formItem, false);
  }
};
/**
 * 容器级框选操作（box/dytable/gridtable）：进入框选模式后拖拽选择单元格
 * （按住 Ctrl 可多次框选累积），提示条上执行合并单元格/拆分单元格/删除区域组件/
 * 添加组件，数据语义与单元格菜单的合并、resetMerge、删除组件、添加组件完全一致。
 * dytable/gridtable 为 rowspan/colspan + cellVisible 语义；box 无 rowspan，
 * 合并即 colspan 求和 + splice 移除列（与单元格菜单的 box 合并一致）。
 */
const startBoxSelectOperation = () => {
  const itemType = props.formItem.itemType;
  if (itemType != "dytable" && itemType != "gridtable" && itemType != "box") {
    return;
  }
  const isBox = itemType == "box";
  const elements = props.formItem.preps.elements ?? [];
  const started = CellRubberBand.start({
    containerId: props.formItem?.preps?.id || props.formItem?.id,
    mode: "action",
    actions: [
      {key: "merge", label: i18n("dyform.container.boxMergeCells"), icon: "merge", primary: true},
      {key: "split", label: i18n("dyform.container.boxSplitCells"), icon: "split"},
      {key: "clearItems", label: i18n("dyform.container.boxClearItems"), icon: "trash"},
      {key: "addComp", label: i18n("dyform.container.boxAddCompBtn"), icon: "plus"},
      {key: "editProps", label: i18n("dyform.container.boxEditPropsBtn"), icon: "edit"},
    ],
    onAction: (key, cells) => {
      if (key == "merge") {
        const res = isBox
          ? mergeBoxRegionByCells(elements, cells)
          : mergeRegionByCells(elements, cells);
        if (res.ok) {
          ElMessage.success(
            isBox
              ? `${i18n("dyform.container.boxMergeDone")}（${i18n("dyform.container.rubberColShort")}${res.cols}）`
              : `${i18n("dyform.container.boxMergeDone")}（${res.rows} × ${res.cols}）`,
          );
        } else if (res.crossRow) {
          warning(i18n("dyform.container.boxMergeBoxCrossRow"));
        } else if (res.notContiguous) {
          warning(i18n("dyform.container.boxMergeBoxNotContiguous"));
        } else if (res.notRectangular) {
          warning(i18n("dyform.container.boxMergeNotRect"));
        } else {
          warning(i18n("dyform.container.boxMergeSingle"));
        }
      } else if (key == "split") {
        const res = isBox
          ? splitBoxRegionByCells(elements, cells)
          : splitRegionByCells(elements, cells);
        if (res.ok) {
          ElMessage.success(
            `${i18n("dyform.container.boxSplitDone")}（${res.count}）`,
          );
        } else {
          warning(i18n("dyform.container.boxSplitNone"));
        }
      } else if (key == "clearItems") {
        operationConfirm(i18n("dyform.container.boxClearConfirm")).then(
          (confirm) => {
            if (!confirm) {
              return;
            }
            const res = clearRegionItems(elements, cells);
            if (res.ok) {
              //被删组件若正处于选中态，清空选中避免属性面板悬空
              if (res.removedIds.includes(designForm.currentItemId)) {
                designForm.selectItem(null, "", "");
              }
              ElMessage.success(
                `${i18n("dyform.container.boxClearDone")}（${res.count}）`,
              );
            } else {
              warning(i18n("dyform.container.boxClearNone"));
            }
          },
        );
      } else if (key == "addComp") {
        //记住框选的单元格，打开组件选择面板，选择后逐格添加
        rubberAddCells.value = cells;
        resetRubberProps();
        rubberAddVisible.value = true;
      } else if (key == "editProps") {
        //框选批量编辑属性：作用于框选单元格内所有已有组件
        rubberEditCells.value = cells;
        resetRubberPropsFromCells(cells);
        rubberEditVisible.value = true;
      }
    },
  });
  if (!started) {
    warning(i18n("dyform.container.rubberContainerNotFound"));
  }
};
//框选添加组件：待添加的单元格（0-based）与选择面板开关
const rubberAddCells = ref<Array<{row: number; col: number}>>([]);
const rubberAddVisible = ref(false);
//框选批量编辑属性：待编辑的单元格与面板开关
const rubberEditCells = ref<Array<{row: number; col: number}>>([]);
const rubberEditVisible = ref(false);
const rubberEditClose = () => {
  rubberEditVisible.value = false;
  rubberEditCells.value = [];
};
/**
 * 组件基础属性定义（与 ItemPropertiesPanel 基础属性面板一致的字段与 i18n），
 * 用于框选添加组件时的属性预设与框选批量编辑属性。
 */
const basePropList = [
  {key: "required", label: "dyform.props.required", def: false},
  {key: "formVisible", label: "dyform.props.formVisible", def: true},
  {key: "listVisible", label: "dyform.props.listVisible", def: true},
  {key: "searchVisible", label: "dyform.props.searchVisible", def: false},
  {key: "hideLabel", label: "dyform.props.hideLabel", def: false},
  {key: "viewVisible", label: "dyform.props.viewVisible", def: true},
  {key: "disabled", label: "dyform.props.disabled", def: false},
  {key: "editDisabled", label: "dyform.props.editDisabled", def: false},
  {key: "readonly", label: "dyform.props.readonly", def: false},
  {key: "clearable", label: "dyform.props.clearable", def: false},
  {key: "prototypeDisplay", label: "dyform.props.prototypeDisplay", def: false},
  {key: "uniqueValid", label: "dyform.props.uniqueValid", def: false},
];
//属性开关取值：添加面板按默认值初始化；批量编辑面板按区域内第一个组件的当前值初始化
const rubberPropValues = ref<Record<string, boolean>>({});
const resetRubberProps = () => {
  const values: Record<string, boolean> = {};
  basePropList.forEach((p) => {
    values[p.key] = p.def;
  });
  rubberPropValues.value = values;
};
//批量编辑面板：以区域内第一个组件的当前属性值初始化开关（无组件时用默认值）
const resetRubberPropsFromCells = (cells: Array<{row: number; col: number}>) => {
  const elements = props.formItem.preps.elements ?? [];
  const values: Record<string, boolean> = {};
  const firstItem = cells
    .map((cell) => elements[cell.row]?.columns?.[cell.col]?.items?.[0])
    .find((item) => !!item);
  basePropList.forEach((p) => {
    values[p.key] = firstItem?.preps?.[p.key] ?? p.def;
  });
  rubberPropValues.value = values;
};
//批量编辑影响的组件数（框选单元格内的全部组件）
const rubberEditCompCount = computed(() => {
  const elements = props.formItem.preps.elements ?? [];
  let count = 0;
  rubberEditCells.value.forEach((cell) => {
    const column = elements[cell.row]?.columns?.[cell.col];
    count += column?.items?.length ?? 0;
  });
  return count;
});
//由 FieldList 选中项构建组件模板（与 ContainerDropDown.changeItem 一致）
const buildCompTemplate = (item: any) => {
  const id = uuid();
  const fieldName = camelcase(["field", id.substring(0, 6)]);
  return {
    id: "Sh" + id,
    label: item.itemName,
    fieldName: fieldName,
    itemType: item.itemType,
    type: item.itemType,
    compType: item.compType,
    preps: {
      id: "Sh" + id,
      name: fieldName,
      itemNameLabel: item.itemName,
      label: item.itemName,
    },
  };
};
//向指定单元格添加组件（与 ContainerDropDown.addCompOperation 一致：深拷贝 + 重生成 id/fieldName），
//extraProps 为面板中勾选的基础属性预设
const addCompToCell = (
  column: any,
  template: any,
  suffix: string,
  extraProps?: Record<string, boolean>,
) => {
  if (!column || column.cellVisible === false) {
    return null;
  }
  const id = uuid();
  const tempItem = JSON.parse(JSON.stringify(template));
  tempItem.id = id;
  tempItem.fieldName = camelcase(["field", id.substring(0, 6), suffix]);
  if (!tempItem.preps) {
    tempItem.preps = {};
  }
  tempItem.preps.id = id;
  tempItem.preps.name = tempItem.fieldName;
  if (extraProps) {
    Object.assign(tempItem.preps, extraProps);
  }
  if (!column.items) {
    column.items = [];
  }
  column.items.push(tempItem);
  return tempItem;
};
//框选添加组件：已选组件列表（点击左侧组件仅记录于此，点"提交"才真正添加）
const rubberAddPicked = ref<Array<any>>([]);
const rubberAddClose = () => {
  rubberAddVisible.value = false;
  rubberAddCells.value = [];
  rubberAddPicked.value = [];
};
//点击左侧组件：仅记录/取消记录（可多选），不立即添加
const rubberAddSelect = (item: any) => {
  const idx = rubberAddPicked.value.findIndex(
    (it) => it.itemName === item.itemName && it.itemType === item.itemType,
  );
  if (idx >= 0) {
    rubberAddPicked.value.splice(idx, 1);
  } else {
    rubberAddPicked.value.push(item);
  }
};
//移除单个已选组件
const rubberAddRemove = (index: number) => {
  rubberAddPicked.value.splice(index, 1);
};
//提交：把所有已选组件按面板开关值统一设置属性，添加到所有框选单元格并关闭面板
const rubberAddSubmit = () => {
  if (rubberAddPicked.value.length === 0) {
    warning(i18n("dyform.container.boxAddCompNoPick"));
    return;
  }
  const elements = props.formItem.preps.elements ?? [];
  let added = 0;
  let lastItem: any = null;
  rubberAddCells.value.forEach((cell) => {
    const column = elements[cell.row]?.columns?.[cell.col];
    rubberAddPicked.value.forEach((item, i) => {
      const template = buildCompTemplate(item);
      const newItem = addCompToCell(
        column,
        template,
        cell.row + "" + cell.col + "" + i,
        {...rubberPropValues.value},
      );
      if (newItem) {
        added++;
        lastItem = newItem;
      }
    });
  });
  if (added > 0) {
    if (lastItem) {
      designForm.selectItem(lastItem, lastItem.itemType, lastItem.compType);
    }
    ElMessage.success(
      `${i18n("dyform.container.boxAddCompDone")}（${added}）`,
    );
  } else {
    warning(i18n("dyform.container.boxClearNone"));
  }
  rubberAddClose();
};
//框选批量编辑属性：把面板全部开关值写入框选单元格内所有组件的 preps
const rubberEditApply = () => {
  const elements = props.formItem.preps.elements ?? [];
  let count = 0;
  rubberEditCells.value.forEach((cell) => {
    const column = elements[cell.row]?.columns?.[cell.col];
    (column?.items ?? []).forEach((item: any) => {
      if (!item.preps) {
        item.preps = {};
      }
      Object.assign(item.preps, rubberPropValues.value);
      count++;
    });
  });
  if (count > 0) {
    ElMessage.success(
      `${i18n("dyform.container.boxEditPropsDone")}（${count}）`,
    );
  } else {
    warning(i18n("dyform.container.boxClearNone"));
  }
  rubberEditClose();
};
</script>
<template>
  <star-horse-panel
    box-width="450px"
    box-height="70%"
    :source="3"
    :full-screen="false"
    :title="i18n('form.addComponent')"
    :userAction="true"
    v-model="componentVisible"
    @closeAction="close"
  >
    <template #footer>
      <el-button type="primary" size="default" @click="close"
        >{{ i18n("form.confirm") }}
      </el-button>
    </template>
    <field-list @selectData="addItem" />
  </star-horse-panel>
  <!--框选添加组件面板：框选单元格后选择组件（左侧，点击记录可多选）并预设基础属性（右侧），点提交逐格添加-->
  <star-horse-panel
    box-width="60%"
    box-height="70%"
    :source="1"
    :full-screen="false"
    :title="i18n('dyform.container.boxAddCompTitle')"
    :userAction="true"
    v-model="rubberAddVisible"
    @merge="rubberAddSubmit"
    @closeAction="rubberAddClose"
  >
    <el-splitter>
      <el-splitter-panel size="40%">
        <field-list @selectData="rubberAddSelect" />
      </el-splitter-panel>
      <el-splitter-panel>
        <!--已选组件（点击左侧组件添加/移除，点标签叉移除），提交时才真正添加-->
        <div class="rubber-picked">
          <span class="rubber-picked-label"
            >{{ i18n("dyform.container.boxAddCompPicked") }}：</span
          >
          <template v-if="rubberAddPicked.length">
            <el-tag
              v-for="(it, i) in rubberAddPicked"
              :key="it.itemType + it.itemName"
              closable
              size="small"
              @close="rubberAddRemove(i)"
              >{{ it.itemName }}
            </el-tag>
          </template>
          <span v-else class="rubber-picked-empty">{{
            i18n("dyform.container.boxAddCompNoPickTip")
          }}</span>
        </div>
        <el-form label-position="top" class="rubber-props-form">
          <div class="rubber-props-tip">
            {{ i18n("dyform.container.boxAddPropsTip") }}
          </div>
          <el-form-item
            v-for="prop in basePropList"
            :key="prop.key"
            :label="i18n(prop.label)"
          >
            <el-switch
              v-model="rubberPropValues[prop.key]"
              :active-text="i18n('dyform.props.yes')"
              :inactive-text="i18n('dyform.props.no')"
            />
          </el-form-item>
        </el-form>
      </el-splitter-panel>
    </el-splitter>
  </star-horse-panel>
  <!--框选批量编辑属性面板：把面板开关值写入框选单元格内所有组件-->
  <star-horse-panel
    box-width="450px"
    box-height="70%"
    :source="3"
    :full-screen="false"
    :title="i18n('dyform.container.boxEditPropsTitle')"
    :userAction="true"
    v-model="rubberEditVisible"
    @closeAction="rubberEditClose"
  >
    <template #footer>
      <el-button type="primary" size="default" @click="rubberEditApply"
        >{{ i18n("dyform.container.boxEditPropsApply") }}
      </el-button>
    </template>
    <el-form label-position="top" class="rubber-props-form">
      <div class="rubber-props-tip">
        {{ i18n("dyform.container.boxEditPropsTip") }}（{{
          i18n("dyform.container.boxEditPropsAffect")
        }}：{{ rubberEditCompCount }}）
      </div>
      <el-form-item
        v-for="prop in basePropList"
        :key="prop.key"
        :label="i18n(prop.label)"
      >
        <el-switch
          v-model="rubberPropValues[prop.key]"
          :active-text="i18n('dyform.props.yes')"
          :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
    </el-form>
  </star-horse-panel>
  <div
    class="field-item"
    :class="{ 'container-collapsed': collapsed }"
    :data-container-id="formItem?.preps?.id || formItem?.id"
    v-if="isEdit && isDesign"
    @click.stop="selectContainer"
    @contextmenu="containerContextMenu"
  >
    <!-- Collapse toggle button (always visible in design mode) -->
    <div
      class="collapse-toggle"
      @click.stop="toggleCollapse"
      :title="
        collapsed
          ? i18n('dyform.container.expand')
          : i18n('dyform.container.collapse')
      "
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        width="12"
        height="12"
        :class="{ rotated: collapsed }"
      >
        <path
          d="M4 6L8 10L12 6"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <!-- Collapsed indicator (shown only when collapsed, click to expand) -->
    <div
      v-if="collapsed"
      class="collapsed-placeholder"
      @click.stop="toggleCollapse"
    >
      <span class="collapsed-label">{{ containerLabel }}</span>
      <span class="collapsed-hint">{{
        i18n("dyform.container.collapsedClickExpand")
      }}</span>
    </div>

    <!-- Container content (hidden when collapsed) -->
    <div v-show="!collapsed">
      <slot></slot>
    </div>
    <div class="component-header-actions">
      <div
        class="drag-handler"
        v-if="isEdit && currentItemId == formItem.id && !collapsed"
      >
        <el-tooltip :content="i18n('form.drag')">
          <star-horse-icon
            icon-class="drag"
            size="18px"
            style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <el-tooltip :content="i18n('form.selectContainer')">
          <star-horse-icon
            cursor="pointer"
            @click.stop="selectData"
            icon-class="select-parent"
            style="color: var(--star-horse-white)"
          />
        </el-tooltip>
        <el-tooltip :content="i18n('form.deleteContainer')">
          <star-horse-icon
            cursor="pointer"
            @click.stop="removeData"
            icon-class="clear-all"
            style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </div>
      <div
        class="field-action"
        v-if="isEdit && currentItemId == formItem.id && !collapsed"
      >
        <template
          v-if="
            formItem.itemType == 'dytable' ||
            formItem.itemType == 'box' ||
            formItem.itemType == 'gridtable'
          "
        >
          <el-tooltip :content="i18n('form.insertRow')">
            <star-horse-icon
              @click.stop="tableOperation('insertRow', formItem?.preps)"
              icon-class="insert_row"
              cursor="pointer"
              style="color: var(--star-horse-white)"
            />
          </el-tooltip>
        </template>
        <template
          v-if="
            formItem.itemType == 'dytable' ||
            formItem.itemType == 'box' ||
            formItem.itemType == 'gridtable' ||
            formItem.itemType == 'table'
          "
        >
          <el-tooltip :content="i18n('form.insertCol')">
            <star-horse-icon
              @click.stop="tableOperation('insertCol', formItem?.preps)"
              icon-class="insert_col"
              cursor="pointer"
              style="color: var(--star-horse-white)"
            />
          </el-tooltip>
        </template>
        <template
          v-if="
            formItem.itemType == 'dytable' ||
            formItem.itemType == 'gridtable' ||
            formItem.itemType == 'box'
          "
        >
          <el-tooltip :content="i18n('dyform.container.boxSelectOperation')">
            <span
              class="box-select-icon"
              @click.stop="startBoxSelectOperation"
            >
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none">
                <rect
                  x="1.5"
                  y="1.5"
                  width="13"
                  height="13"
                  rx="1.5"
                  stroke="currentColor"
                  stroke-width="1.3"
                  stroke-dasharray="3 2"
                />
                <path d="M9.5 7.6l4.6 1.8-2.1.8-.8 2.1z" fill="currentColor" />
              </svg>
            </span>
          </el-tooltip>
        </template>
        <el-tooltip :content="i18n('form.copyContainer')">
          <star-horse-icon
            @click.stop="tableOperation('copy', formItem?.preps)"
            icon-class="copy"
            style="color: var(--star-horse-white)"
          />
        </el-tooltip>
      </div>
    </div>
    <Teleport to="body">
      <ContentMenu
        ref="containerContextMenuRef"
        :menu-data="
          dynamicFormContextMenuData(formItem, parentField, 'container')
        "
      />
    </Teleport>
  </div>
  <div class="field-item" style="border: unset" v-else>
    <slot></slot>
  </div>
</template>
<style lang="scss" scoped>
.field-item {
  border: 1px dashed #e6a23c;
  position: relative;
  width: 100%;
}
/* 框选添加组件面板：已选组件标签区 */
.rubber-picked {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 12px 0;
  .rubber-picked-label {
    font-size: 12px;
    color: #909399;
  }
  .rubber-picked-empty {
    font-size: 12px;
    color: #c0c4cc;
  }
}
/* 框选属性设置/批量编辑表单 */
.rubber-props-form {
  padding: 0 12px;
  .rubber-props-tip {
    font-size: 12px;
    color: #909399;
    line-height: 1.6;
    margin-bottom: 8px;
  }
}
/* 容器工具栏"框选"入口图标（虚线选框+光标，与其他工具栏图标尺寸一致） */
.box-select-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  color: var(--star-horse-white);
  cursor: pointer;
  border-radius: 2px;
  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

/* ── Collapse/Expand ── */
.collapse-toggle {
  position: absolute;
  top: 5px;
  left: 0;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--star-horse-style, #409eff);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  cursor: pointer;
  color: #fff;
  z-index: 98;
  padding: 0;

  svg {
    transition: transform 0.15s ease;

    &.rotated {
      transform: rotate(-90deg);
    }
  }

  &:hover {
    background: #66b1ff;
  }
}

/* 选中容器时，拖拽按钮右移避开折叠按钮 */
:deep(.drag-handler) {
  left: 28px !important;
}

.collapsed-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 32px 8px 12px;
  background: rgba(230, 162, 60, 0.04);
  border-radius: 2px;
  cursor: pointer;

  &:hover {
    background: rgba(230, 162, 60, 0.08);
  }
}

.collapsed-label {
  font-size: 12px;
  color: #e6a23c;
  font-weight: 500;
}

.collapsed-hint {
  font-size: 11px;
  color: #c0c4cc;
}

.container-collapsed {
  border-style: dashed;
  border-color: #f0d9a8;
  min-height: auto !important;
}

.el-form-item {
  position: relative;

  :deep(.el-form-item__label) {
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  span.custom-label .icon-cls {
    margin: 0 3px;
  }

  :deep(.hide-spin-button) input::-webkit-outer-spin-button,
  :deep(.hide-spin-button) input::-webkit-inner-spin-button {
    -webkit-appearance: none !important;
  }

  :deep(.hide-spin-button) input[type="number"] {
    -moz-appearance: textfield;
  }
}

.required :deep(.el-form-item__label)::before {
  content: "*";
  color: #f56c6c;
  margin-right: 4px;
}

.static-content-item {
  min-height: 20px;
  display: flex;
  /* 垂直居中 */
  align-items: center;

  /* 垂直居中 */
  :deep(.el-divider--horizontal) {
    margin: 0;
  }
}

.el-form-item.selected,
.static-content-item.selected {
  outline: 2px solid var(--star-horse-style);
}

:deep(.label-left-align) .el-form-item__label {
  text-align: left;
  justify-content: flex-start !important;
}

:deep(.label-center-align) .el-form-item__label {
  text-align: center;
  justify-content: center !important;
}

:deep(.label-right-align) .el-form-item__label {
  text-align: right;
  justify-content: flex-end !important;
}

.component-header-actions {
  justify-content: space-between;
}
</style>
