<script setup lang="ts">
import {computed, nextTick, onMounted, PropType, ref, watch} from "vue";
import {ElMessage} from "element-plus";
import {tableAction} from "@/components/formcomp/container/dytableUtils";
import {tableAction as gridtableAction} from "@/components/formcomp/container/gridtableUtils";
import {i18n} from "@/lang";
import {getDesignFormStore} from "@/store/StoreManager";
import FieldList from "@/components/formcomp/utils/FieldList.vue";
import {CellRubberBand} from "@/components/formcomp/utils/CellRubberBand";
import {numberRangeItem, uuid, warning} from "star-horse-lowcode";
import camelcase from "camelcase";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  disabled: { type: Object as PropType<Boolean | String> },
  field: { type: Object as PropType<any> },
  isFirstRow: { type: Boolean, default: false },
  isLastRow: { type: Boolean, default: false },
  isFirstCol: { type: Boolean, default: false },
  isLastCol: { type: Boolean, default: false },
  size: { type: String, default: "small" },
  rowIndex: { type: Number, default: -1 },
  colIndex: { type: Number, default: -1 },
  type: { type: String },
  validBox: { type: Boolean, default: false },
});
const cellInfo = computed(() => {
  const elements = props.parentField.preps.elements;
  const columns = elements[0].columns;
  return {
    maxRow: elements.length - props.rowIndex,
    maxCol: columns.length - props.colIndex,
  };
});
const currentCell = computed(() => {
  const elements = props.parentField.preps.elements;
  const element = elements[props.rowIndex];
  const columns = element.columns;
  return columns[props.colIndex];
});
const emits = defineEmits(["command"]);
const fieldForm = ref<Record<string, any>>({});
const designForm = getDesignFormStore();
const checkMenuStatus = () => {
  const moveFlag = !props.field.items?.length;
  const elements = props.parentField.preps.elements;
  const lastRow = props.isFirstRow
    ? 0
    : elements[props.rowIndex - 1]?.columns.length;
  const currentRow = elements[props.rowIndex].columns.length;
  const nextRow = props.isLastRow
    ? null
    : elements[props.rowIndex + 1]?.columns.length;
  const isFullColumn =
    (props.type == "dytable" || props.type == "gridtable") &&
    elements?.length == parseInt(props.field.rowspan);
  //检查当前列所有小于改列的数据是否存在合并
  const hasMergeCol = () => {
    // const currentCol=elements[props.rowIndex].columns;
    for (let row = 0; row < elements.length; row++) {
      const tempRow = elements[row];
      const tempCols = tempRow.columns;
      if (tempCols[props.colIndex].colspan > 1) {
        return true;
      }
      for (let i = 0; i < props.colIndex; i++) {
        const col = tempCols[i];
        //合并2
        if (col.colspan > 1 && i + col.colspan >= props.colIndex) {
          return true;
        }
      }
    }
  };
  const hasMergeRow = () => {
    // const currentCol=elements[props.rowIndex].columns;
    for (let row = 0; row < elements.length; row++) {
      const tempRow = elements[row];
      const tempCols = tempRow.columns;
      //如果有合并整列，不允许使用合并整行
      for (let col = 0; col < tempCols.length; col++) {
        const temp = tempCols[col];
        if (temp.rowspan == elements.length) {
          return true;
        }
      }

      for (let i = 0; i < props.rowIndex; i++) {
        const col = elements[i].columns[props.colIndex];
        //合并2
        if (col.rowspan > 1 && i + col.rowspan >= props.rowIndex) {
          return true;
        }
      }
    }
  };
  return {
    mergeLeftColDisabled: props.isFirstCol,
    mergeRightColDisabled: props.isLastCol,
    mergeWholeRowDisabled: hasMergeRow(),
    mergeWholeColDisabled: isFullColumn || hasMergeCol(),
    mergeAboveRowDisabled: props.isFirstRow || lastRow != currentRow,
    mergeBelowRowDisabled: props.isLastRow || nextRow != currentRow,
    undoMergeRowDisabled: props.field.rowspan == 1,
    undoMergeColDisabled: props.field.colspan == 1,
    resetMergeDisabled: !hasMergeCol() && !hasMergeRow(),
    deleteWholeColDisabled: false,
    deleteWholeRowDisabled: false,
    deleteCurrentColDisabled: false,
    addCellAfterDisabled: false,
    addCellBeforeDisabled: false,
  };
};
let buttonControl = computed(() => checkMenuStatus());
const configDialog = ref<boolean>(false);
const staticDataConfigDialog = ref<boolean>(false);
const componentVisible = ref<boolean>(false);
const currentCommand = ref<string>("");
//框选模式下弹窗临时隐藏：此时禁止 close() 清空表单状态，待框选结束恢复弹窗
const rubberActive = ref<boolean>(false);
const handleTableCellCommand = (command: string) => {
  currentCommand.value = command;
  if (command.includes("Config")) {
    configDialog.value = true;
    fieldForm.value["colHeight"] = props.field.colHeight;
    fieldForm.value["colWidth"] = props.field.colWidth;
    fieldForm.value["rowspan"] = props.field.rowspan;
    fieldForm.value["colspan"] = props.field.colspan;
    fieldForm.value["configRowType"] = "currentRow";
  } else if (command == "addText") {
    staticDataConfigDialog.value = true;
    fieldForm.value = {
      dataType: props.field?.dataType ?? "text",
      textContent: props.field?.textContent,
      visiblePlatform: "all",
      configRowType: "currentRow",
    };
  } else if (command == "removeText") {
    const elements = props.parentField.preps.elements;
    const element = elements[props.rowIndex];
    const columns = element.columns;
    const column = columns[props.colIndex];
    if (column) {
      column.staticData = false;
      column.dataType = "none";
      column.textContent = "";
      column.visiblePlatform = "";
    }
  } else if (command == "addComp") {
    componentVisible.value = true;
    fieldForm.value = {
      configRowType: "currentRow",
    };
  } else {
    emits("command", command);
  }
};
const close = () => {
  if (rubberActive.value) {
    //框选期间弹窗被程序隐藏触发的关闭回调，直接忽略，状态保留待恢复
    return;
  }
  configDialog.value = false;
  staticDataConfigDialog.value = false;
  componentVisible.value = false;
  currentItem.value = null;
  fieldForm.value = {};
};
//框选回填标记：回填期间触发的 unlinkRows/unlinkCols 变化不算手动编辑，不清除精确单元格
let rubberFilling = false;
/**
 * 框选单元格：临时隐藏添加组件弹窗（保留已选组件与表单状态），在当前单元格所在容器上
 * 拖拽框选并自动回填行/列——连续模式填 linkRows/linkCols 的起止值；非连续模式按单元格精确记忆
 * （Excel 语义，每次框选只累积自己覆盖的格子，行/列不交叉扩散）：unlinkRows/unlinkCols 回填
 * 行/列并集便于查看，unlinkCells 保存精确格子，提交时优先按其逐格添加。
 */
const startRubberSelect = () => {
  const containerId =
    props.parentField?.preps?.id || props.parentField?.id || "";
  const isContinuous = fieldForm.value.configRowType == "linkRows";
  //输入框中的行列号为 1-based（提交逻辑按 -1 取下标），框选器内部以 DOM 的 0-based 行列为准，
  //带入初始值时 -1 转换，回填结果时 +1 还原，保证框选所见与输入框/提交语义一致
  const toZeroBased = (list: any) =>
    (list ?? [])
      .map((v: any) => parseInt(v))
      .filter((n: number) => !isNaN(n) && n > 0)
      .map((n: number) => n - 1);
  //带入初始已选单元格：优先用上次框选的精确结果，否则按输入框行/列的笛卡尔积（手动输入语义）
  const initialCells = (() => {
    const precise = fieldForm.value.unlinkCells ?? [];
    if (precise.length > 0) {
      return precise.map((c: any) => ({row: c.row - 1, col: c.col - 1}));
    }
    const cells: Array<{row: number; col: number}> = [];
    toZeroBased(fieldForm.value.unlinkRows).forEach((r: number) =>
      toZeroBased(fieldForm.value.unlinkCols).forEach((c: number) =>
        cells.push({row: r, col: c}),
      ),
    );
    return cells;
  })();
  rubberActive.value = true;
  componentVisible.value = false;
  const started = CellRubberBand.start({
    containerId,
    mode: isContinuous ? "continuous" : "discrete",
    initialCells: isContinuous ? [] : initialCells,
    onFinish: (rows, cols, cells) => {
      rubberActive.value = false;
      if (isContinuous) {
        if (rows.length > 0) {
          fieldForm.value.linkRowsMin = Math.min(...rows) + 1;
          fieldForm.value.linkRowsMax = Math.max(...rows) + 1;
          fieldForm.value.linkColsMin = Math.min(...cols) + 1;
          fieldForm.value.linkColsMax = Math.max(...cols) + 1;
        }
        //切换到连续模式后，之前非连续框选的精确单元格不再生效
        fieldForm.value.unlinkCells = [];
      } else {
        rubberFilling = true;
        fieldForm.value.unlinkRows = [...new Set(rows.map((r) => r + 1))]
          .sort((a, b) => a - b)
          .map(String);
        fieldForm.value.unlinkCols = [...new Set(cols.map((c) => c + 1))]
          .sort((a, b) => a - b)
          .map(String);
        //精确单元格（1-based），提交时优先按其添加，避免行/列并集交叉扩散到未框选的格子
        fieldForm.value.unlinkCells = cells.map((c) => ({
          row: c.row + 1,
          col: c.col + 1,
        }));
        nextTick(() => {
          rubberFilling = false;
        });
      }
      componentVisible.value = true;
    },
    onCancel: () => {
      rubberActive.value = false;
      componentVisible.value = true;
    },
  });
  if (!started) {
    //容器 DOM 定位失败（如容器被折叠销毁），恢复弹窗
    rubberActive.value = false;
    componentVisible.value = true;
    warning(i18n("dyform.container.rubberContainerNotFound"));
  } else {
    //进入框选模式的即时操作指引（提示条常驻，此消息用于强化引导）
    ElMessage.info({
      message: isContinuous
        ? i18n("dyform.container.rubberContinuousTip")
        : i18n("dyform.container.rubberDiscreteTip"),
      duration: 4000,
      showClose: true,
    });
  }
};
//手动编辑行/列输入框后，框选产生的精确单元格失效（提交回退为输入框行/列的笛卡尔积语义）
watch(
  () => [fieldForm.value.unlinkRows, fieldForm.value.unlinkCols],
  () => {
    if (rubberFilling) {
      return;
    }
    if (fieldForm.value.unlinkCells?.length) {
      fieldForm.value.unlinkCells = [];
    }
  },
);
//切离非连续模式时精确单元格同样失效
watch(
  () => fieldForm.value.configRowType,
  (v) => {
    if (v != "unlinkRows" && fieldForm.value.unlinkCells?.length) {
      fieldForm.value.unlinkCells = [];
    }
  },
);
//框选明细（精确到 行: 列），与 unlinkRows/unlinkCols 输入框的并集展示互补
const unlinkCellDetail = computed(() => {
  const cells = fieldForm.value.unlinkCells ?? [];
  const byRow = new Map<number, Array<number>>();
  cells.forEach((c: any) => {
    const cols = byRow.get(c.row) ?? [];
    cols.push(c.col);
    byRow.set(c.row, cols);
  });
  return [...byRow.keys()]
    .sort((a, b) => a - b)
    .map((row) => {
      const cols = [...new Set(byRow.get(row))]
        .sort((a, b) => a - b)
        .join(",");
      return `${i18n("dyform.container.rubberRowShort")}${row}: ${i18n("dyform.container.rubberColShort")}${cols}`;
    })
    .join("；");
});
const operationCell = (endCol: number, endRow: number, columns: any) => {
  const elements = props.parentField.preps.elements;
  //将当前行合并的单元格的可见改为false
  // console.log((props.colIndex + 1) + "," + endCol, column);
  for (let col = props.colIndex + 1; col < endCol; col++) {
    columns[col].cellVisible = false;
  }
  //将跨行合并的单元格的可见改为false
  for (let row = props.rowIndex + 1; row < endRow; row++) {
    const tempRow = elements[row];
    const tempCols = tempRow.columns;
    for (let col = props.colIndex; col < endCol; col++) {
      tempCols[col].cellVisible = false;
    }
  }
};
const operationCellText = (column: any, fieldForm: any) => {
  column["dataType"] = fieldForm["dataType"];
  column["staticData"] = column["dataType"] != "none";
  column["visiblePlatform"] = column["visiblePlatform"] ?? "all";
  column["textContent"] = fieldForm["textContent"];
};
const submitAction = () => {
  const elements = props.parentField.preps.elements;
  let element = elements[props.rowIndex];
  let columns = element.columns;
  let column = columns[props.colIndex];
  if (currentCommand.value === "rowConfig") {
    column["colHeight"] = fieldForm.value["colHeight"];
  } else if (currentCommand.value === "colConfig") {
    column["colWidth"] = fieldForm.value["colWidth"];
  } else if (currentCommand.value === "cellConfig") {
    let newRowspan = fieldForm.value["rowspan"] || 1;
    let newColspan = fieldForm.value["colspan"] || 1;
    const startRow = props.rowIndex;
    const endRow = startRow + newRowspan;
    const endCol = props.colIndex + newColspan;
    const configRowType = fieldForm.value.configRowType ?? "currentRow";
    let unlinkRows = fieldForm.value.unlinkRows ?? [];
    if (configRowType == "linkRows") {
      const linkRowsMin = fieldForm.value.linkRowsMin;
      const linkRowsMax = fieldForm.value.linkRowsMax;
      if (!linkRowsMin || !linkRowsMax) {
        warning(i18n("dyform.container.warning.setLinkRows"));
        return;
      }
      for (let i = linkRowsMin - 1; i < linkRowsMax; i++) {
        element = elements[i];
        columns = element.columns;
        column = columns[props.colIndex];
        column["rowspan"] = newRowspan;
        column["colspan"] = newColspan;
        operationCell(endCol, endRow, columns);
      }
    } else if (configRowType == "unlinkRows") {
      // unlinkRows=["6","10","11","12","13","14","15","18","21","22","23","25","26","27","32","34","40","41","43","45","46"];
      for (let nums in unlinkRows) {
        element = elements[parseInt(unlinkRows[nums]) - 1];
        columns = element.columns;
        column = columns[props.colIndex];
        column["rowspan"] = newRowspan;
        column["colspan"] = newColspan;
        operationCell(endCol, endRow, columns);
      }
    } else {
      column["rowspan"] = newRowspan;
      column["colspan"] = newColspan;
      operationCell(endCol, endRow, columns);
    }
  } else if (currentCommand.value === "addText") {
    const configRowType = fieldForm.value.configRowType ?? "currentRow";
    let unlinkRows = fieldForm.value.unlinkRows ?? [];
    if (configRowType == "linkRows") {
      const linkRowsMin = fieldForm.value.linkRowsMin;
      const linkRowsMax = fieldForm.value.linkRowsMax;
      if (!linkRowsMin || !linkRowsMax) {
        warning(i18n("dyform.container.warning.setLinkRows"));
        return;
      }
      for (let i = linkRowsMin - 1; i < linkRowsMax; i++) {
        element = elements[i];
        columns = element.columns;
        column = columns[props.colIndex];
        operationCellText(column, fieldForm.value);
      }
    } else if (configRowType == "unlinkRows") {
      for (let nums in unlinkRows) {
        element = elements[parseInt(unlinkRows[nums]) - 1];
        columns = element.columns;
        column = columns[props.colIndex];
        operationCellText(column, fieldForm.value);
      }
    } else {
      operationCellText(column, fieldForm.value);
    }
  }
  Object.entries(fieldForm.value ?? {}).forEach(([key, value]) => {
    props.field[key] = value;
  });
  close();
};
const currentItem = ref<any>();
const changeItem = (item: any) => {
  const id = uuid();
  const fieldName = camelcase(["field", id.substring(0, 6)]);
  currentItem.value = {
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
const addCompOperation = (column: any, item: any, suffix: string) => {
  if (column.cellVisible) {
    const listItems = Array.isArray(item)
      ? item.map((i) => JSON.parse(JSON.stringify(i)))
      : [JSON.parse(JSON.stringify(item))];
    for (let i = 0; i < listItems.length; i++) {
      const id = uuid();
      const tempItem = listItems[i];
      tempItem.id = id;
      tempItem.fieldName = camelcase(["field", id.substring(0, 6), suffix]);
      if (!tempItem.preps) {
        tempItem.preps = {};
      }
      tempItem.preps.id = id;
      tempItem.preps.name = tempItem.fieldName;
      tempItem.preps.hideLabel = fieldForm.value.hideLabel;
      tempItem.preps.required = fieldForm.value.required;
      if (!column.items) {
        column.items = [];
      }
      column.items.push(tempItem);
    }
    if (listItems.length > 0) {
      const newItem = column.items[column.items.length - 1];
      designForm.selectItem(newItem, newItem.itemType, newItem.compType);
    }
  }
};
const compAddOperation = (type: string) => {
  if (!currentItem.value && !fieldForm.value.copyCurrentItem) {
    warning(i18n("dyform.container.warning.selectComponent"));
    return;
  }
  const configRowType = fieldForm.value.configRowType ?? "currentRow";
  const elements = props.parentField.preps.elements;
  let element = elements[props.rowIndex];
  let columns = element.columns;
  let column = columns[props.colIndex];
  if (fieldForm.value.copyCurrentItem) {
    currentItem.value = column.items;
  }
  if (configRowType == "linkRows") {
    const linkRowsMin = fieldForm.value.linkRowsMin;
    const linkRowsMax = fieldForm.value.linkRowsMax;
    if (!linkRowsMin || !linkRowsMax) {
      warning(i18n("dyform.container.warning.setLinkRows"));
      return;
    }
    const linkColsMin = fieldForm.value.linkColsMin;
    const linkColsMax = fieldForm.value.linkColsMax;
    for (let i = linkRowsMin - 1; i < linkRowsMax; i++) {
      element = elements[i];
      columns = element.columns;
      for (let j = linkColsMin - 1; j < linkColsMax; j++) {
        if (
          fieldForm.value.copyCurrentItem &&
          i == props.rowIndex &&
          j == props.colIndex
        ) {
          continue;
        }
        addCompOperation(columns[j], currentItem.value, i + "" + j);
      }
    }
  } else if (configRowType == "unlinkRows") {
    const unlinkCells = fieldForm.value.unlinkCells ?? [];
    if (unlinkCells.length > 0) {
      //框选产生的精确单元格（行/列绑定，Excel 语义）：仅添加框选命中的格子，
      //避免行/列并集做笛卡尔积扩散到未框选的格子
      for (let cell of unlinkCells) {
        const tempRow = cell.row - 1;
        const tempCol = cell.col - 1;
        element = elements[tempRow];
        if (!element || !element.columns[tempCol]) {
          continue;
        }
        columns = element.columns;
        if (
          fieldForm.value.copyCurrentItem &&
          tempRow == props.rowIndex &&
          tempCol == props.colIndex
        ) {
          continue;
        }
        addCompOperation(
          columns[tempCol],
          currentItem.value,
          tempRow + "" + tempCol,
        );
      }
    } else {
      //手动输入的行/列（笛卡尔积语义，原有行为）
      let unlinkRows = fieldForm.value.unlinkRows ?? [];
      let unLinkCols = fieldForm.value.unlinkCols ?? [];
      for (let nums in unlinkRows) {
        const tempRow = parseInt(unlinkRows[nums]) - 1;
        element = elements[tempRow];
        if (!element) {
          continue;
        }
        columns = element.columns;
        for (let col of unLinkCols) {
          //注意：col 已经是值（如 "3"），直接解析即可，之前误用值当索引导致取错列
          const tempCol = parseInt(col) - 1;
          if (
            fieldForm.value.copyCurrentItem &&
            tempRow == props.rowIndex &&
            tempCol == props.colIndex
          ) {
            continue;
          }
          addCompOperation(
            columns[tempCol],
            currentItem.value,
            tempRow + "" + tempCol,
          );
        }
      }
    }
  } else {
    addCompOperation(column, currentItem.value, "");
  }
  close();
};
const init = () => {
  if (props.type == "gridtable") {
    gridtableAction(props, buttonControl.value);
  } else {
    tableAction(props, buttonControl.value, props.type);
  }
};
onMounted(() => {
  init();
});
watch(
  () => props.field,
  () => {
    checkMenuStatus();
  },
  { deep: true, immediate: true },
);
watch(
  () => props.parentField,
  () => {
    if (props.type == "gridtable") {
      gridtableAction(props, buttonControl.value);
    } else {
      tableAction(props, buttonControl.value, props.type);
    }
  },
  {
    immediate: false,
    deep: true,
  },
);
</script>

<template>
  <star-horse-panel
    box-width="50%"
    box-height="60%"
    :source="2"
    :full-screen="false"
    :title="i18n('form.changeComponent')"
    :self-func="true"
    v-model="componentVisible"
    @merge="compAddOperation"
    @closeAction="close"
  >
    <el-splitter>
      <el-splitter-panel size="40%">
        <field-list @selectData="changeItem" />
      </el-splitter-panel>
      <el-splitter-panel>
        <el-form v-model="fieldForm" label-position="top">
          <el-descriptions column="1" border label-width="120px">
            <el-descriptions-item
              v-if="currentItem"
              :label="i18n('dyform.container.selectedComponent')"
            >
              <el-tag type="primary">{{ currentItem.label }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.sameConfigRows')"
            >
              <el-select v-model="fieldForm.configRowType">
                <el-option
                  :label="i18n('dyform.container.currentCell')"
                  value="currentRow"
                />
                <el-option
                  :label="i18n('dyform.container.continuous')"
                  value="linkRows"
                />
                <el-option
                  :label="i18n('dyform.container.nonContinuous')"
                  value="unlinkRows"
                />
              </el-select>
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.rubberSelect')"
              v-if="
                fieldForm.configRowType == 'linkRows' ||
                fieldForm.configRowType == 'unlinkRows'
              "
            >
              <div class="rubber-select-entry">
                <el-button size="small" type="primary" plain @click="startRubberSelect">
                  {{ i18n("dyform.container.rubberSelect") }}
                </el-button>
                <span class="rubber-select-tip">{{
                  fieldForm.configRowType == "linkRows"
                    ? i18n("dyform.container.rubberSelectTipLink")
                    : i18n("dyform.container.rubberSelectTipUnlink")
                }}</span>
              </div>
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.copyCurrentComponent')"
              v-if="
                currentCell?.items?.length > 0 &&
                fieldForm.configRowType != 'currentRow'
              "
            >
              <el-switch v-model="fieldForm.copyCurrentItem" />
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.linkRows')"
              v-if="fieldForm.configRowType == 'linkRows'"
            >
              <number-range-item
                :field="{
                  fieldName: 'linkRows',
                  preps: {},
                }"
                v-model:formData="fieldForm"
              />
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.linkCols')"
              prop="linkCols"
              v-if="fieldForm.configRowType == 'linkRows'"
            >
              <number-range-item
                :field="{
                  fieldName: 'linkCols',
                  preps: {},
                }"
                v-model:formData="fieldForm"
              />
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.unlinkRows')"
              prop="unlinkRows"
              v-if="fieldForm.configRowType == 'unlinkRows'"
            >
              <el-input-tag v-model="fieldForm.unlinkRows" />
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.unlinkCols')"
              prop="unlinkCols"
              v-if="fieldForm.configRowType == 'unlinkRows'"
            >
              <el-input-tag v-model="fieldForm.unlinkCols" />
            </el-descriptions-item>
            <el-descriptions-item
              :label="i18n('dyform.container.rubberDetailLabel')"
              v-if="
                fieldForm.configRowType == 'unlinkRows' &&
                fieldForm.unlinkCells?.length
              "
            >
              <span class="rubber-cell-detail">{{ unlinkCellDetail }}</span>
            </el-descriptions-item>
            <el-descriptions-item
              label-position="left"
              :label="i18n('dyform.props.hideLabel')"
              prop="hideLabel"
            >
              <el-switch v-model="fieldForm.hideLabel" />
            </el-descriptions-item>
            <el-descriptions-item
              label-position="left"
              :label="i18n('dyform.props.required')"
              prop="required"
            >
              <el-switch v-model="fieldForm.required" />
            </el-descriptions-item>
          </el-descriptions>
        </el-form>
      </el-splitter-panel>
    </el-splitter>
  </star-horse-panel>
  <star-horse-panel
    :title="i18n('dyform.container.editStaticText')"
    :self-func="true"
    :hide-full-screen-icon="true"
    @merge="submitAction"
    @closeAction="close"
    v-model="staticDataConfigDialog"
    box-width="40%"
  >
    <el-form v-model="fieldForm">
      <el-form-item
        :label="i18n('dyform.container.visiblePlatform')"
        prop="visiblePlatform"
      >
        <el-radio-group v-model="fieldForm.visiblePlatform">
          <el-radio label="PC" value="pc" />
          <el-radio label="App" value="app" />
          <el-radio :label="i18n('dyform.container.all')" value="all" />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.sameConfigRows')"
        prop="sameConfigRows"
      >
        <el-select v-model="fieldForm.configRowType">
          <el-option
            :label="i18n('dyform.container.currentRow')"
            value="currentRow"
          />
          <el-option
            :label="i18n('dyform.container.continuousRow')"
            value="linkRows"
          />
          <el-option
            :label="i18n('dyform.container.nonContinuousRow')"
            value="unlinkRows"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.linkRows')"
        prop="linkRows"
        v-if="fieldForm.configRowType == 'linkRows'"
      >
        <number-range-item
          :field="{
            fieldName: 'linkRows',
            preps: {},
          }"
          v-model:formData="fieldForm"
        />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.unlinkRows')"
        prop="unlinkRows"
        v-if="fieldForm.configRowType == 'unlinkRows'"
      >
        <el-input-tag v-model="fieldForm.unlinkRows" />
      </el-form-item>
      <el-form-item :label="i18n('dyform.container.textType')" prop="dataType">
        <el-radio-group v-model="fieldForm.dataType">
          <el-radio label="Text" value="text" />
          <el-radio label="Html" value="html" />
          <el-radio :label="i18n('dyform.container.none')" value="none" />
        </el-radio-group>
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.textContent')"
        prop="textContent"
      >
        <el-input
          type="textarea"
          v-model="fieldForm.textContent"
          v-if="fieldForm.dataType == 'text'"
        />
        <htmleditor-item
          v-if="fieldForm.dataType == 'html'"
          :formData="fieldForm"
          :field="{
            fieldName: 'textContent',
          }"
        />
      </el-form-item>
    </el-form>
  </star-horse-panel>
  <star-horse-panel
    :title="i18n('ui.operation')"
    :self-func="true"
    :hide-full-screen-icon="true"
    @merge="submitAction"
    @closeAction="close"
    v-model="configDialog"
    box-width="40%"
  >
    <el-form v-model="fieldForm">
      <el-form-item
        :label="i18n('dyform.utils.434')"
        prop="colHeight"
        v-if="currentCommand == 'rowConfig'"
      >
        <el-input v-model="fieldForm.colHeight" />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.utils.435')"
        prop="colWidth"
        v-if="currentCommand == 'colConfig'"
      >
        <el-input v-model="fieldForm.colWidth" />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.sameConfigRows')"
        prop="sameConfigRows"
        v-if="currentCommand == 'cellConfig'"
      >
        <el-select v-model="fieldForm.configRowType">
          <el-option
            :label="i18n('dyform.container.currentRow')"
            value="currentRow"
          />
          <el-option
            :label="i18n('dyform.container.continuousRow')"
            value="linkRows"
          />
          <el-option
            :label="i18n('dyform.container.nonContinuousRow')"
            value="unlinkRows"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.linkRows')"
        prop="linkRows"
        v-if="fieldForm.configRowType == 'linkRows'"
      >
        <number-range-item
          :field="{
            fieldName: 'linkRows',
            preps: {},
          }"
          v-model:formData="fieldForm"
        />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.container.unlinkRows')"
        prop="unlinkRows"
        v-if="fieldForm.configRowType == 'unlinkRows'"
      >
        <el-input-tag v-model="fieldForm.unlinkRows" />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.utils.436')"
        prop="rowspan"
        v-if="
          (type == 'dytable' || type == 'gridtable') &&
          currentCommand == 'cellConfig'
        "
      >
        <el-input-number
          min="1"
          step="1"
          :max="cellInfo.maxRow"
          v-model="fieldForm.rowspan"
        />
        <help :message="i18n('dyform.utils.437')" />
      </el-form-item>
      <el-form-item
        :label="i18n('dyform.utils.438')"
        prop="colspan"
        v-if="currentCommand == 'cellConfig'"
      >
        <el-input-number
          min="1"
          step="1"
          :max="type == 'dytable' || type == 'gridtable' ? cellInfo.maxCol : 24"
          v-model="fieldForm.colspan"
        />
        <help
          :message="i18n('dyform.utils.439')"
          v-if="type == 'dytable' || type == 'gridtable'"
        />
      </el-form-item>
    </el-form>
  </star-horse-panel>
  <el-dropdown
    trigger="click"
    :disabled="disabled"
    @command="handleTableCellCommand"
    :size="size"
  >
    <star-horse-icon icon-class="menu" style="color: var(--star-horse-white)" />
    <template #dropdown>
      <el-dropdown-menu style="max-height: 400px; overflow-y: auto">
        <el-dropdown-item command="addText">
          <star-horse-icon iconClass="edit" />
          {{ i18n("ui.addText") }}
        </el-dropdown-item>
        <el-dropdown-item command="removeText">
          <star-horse-icon iconClass="delete" />
          {{ i18n("ui.removeText") }}
        </el-dropdown-item>
        <el-dropdown-item command="colConfig" divided>
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.colConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="rowConfig">
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.rowConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="cellConfig">
          <star-horse-icon iconClass="config" />
          {{ i18n("ui.cellConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="addComp">
          <star-horse-icon iconClass="add" />
          {{ i18n("ui.addComp") }}
        </el-dropdown-item>

        <el-dropdown-item divided command="insertLeftCol">
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.insertLeftCol") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertRightCol">
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.insertRightCol") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertAboveRow">
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.insertAboveRow") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertBelowRow">
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.insertBelowRow") }}
        </el-dropdown-item>

        <el-dropdown-item
          command="mergeLeftCol"
          :disabled="buttonControl.mergeLeftColDisabled"
          divided
        >
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.mergeLeftCell") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="mergeRightCol"
          :disabled="buttonControl.mergeRightColDisabled"
        >
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.mergeRightCell") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="mergeWholeRow"
          :disabled="buttonControl.mergeWholeRowDisabled"
        >
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.mergeWholeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="mergeAboveRow"
          v-if="type != 'box' || validBox"
          :disabled="buttonControl.mergeAboveRowDisabled"
          divided
        >
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.mergeAboveCell") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="mergeBelowRow"
          v-if="type != 'box' || validBox"
          :disabled="buttonControl.mergeBelowRowDisabled"
        >
          <star-horse-icon iconClass="document" />
          {{ i18n("ui.mergeBelowCell") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="mergeWholeCol"
          v-if="type != 'box' || validBox"
          :disabled="buttonControl.mergeWholeColDisabled"
        >
          <star-horse-icon iconClass="plus" />
          {{ i18n("ui.mergeWholeCol") }}
        </el-dropdown-item>

        <el-dropdown-item
          command="undoMergeRow"
          v-if="type != 'box' || validBox"
          :disabled="buttonControl.undoMergeRowDisabled"
          divided
        >
          <star-horse-icon iconClass="undo" />
          {{ i18n("ui.undoMergeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="undoMergeCol"
          :disabled="buttonControl.undoMergeColDisabled"
        >
          <star-horse-icon iconClass="undo" />
          {{ i18n("ui.undoMergeCol") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="resetMerge"
          :disabled="buttonControl.resetMergeDisabled"
        >
          <star-horse-icon iconClass="reset" />
          {{ i18n("ui.resetMerge") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="addCellAfter"
          v-if="type == 'box'"
          :disabled="buttonControl.addCellAfterDisabled"
          divided
        >
          <star-horse-icon iconClass="add" />
          {{ i18n("ui.addCellAfter") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="addCellBefore"
          v-if="type == 'box'"
          :disabled="buttonControl.addCellBeforeDisabled"
        >
          <star-horse-icon iconClass="add" />
          {{ i18n("ui.addCellBefore") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="deleteWholeCol"
          v-if="type != 'box'"
          :disabled="buttonControl.deleteWholeColDisabled"
          divided
        >
          <star-horse-icon iconClass="delete" />
          {{ i18n("ui.deleteWholeCol") }}
        </el-dropdown-item>
        <el-dropdown-item
          command="deleteWholeRow"
          :disabled="buttonControl.deleteWholeRowDisabled"
        >
          <star-horse-icon iconClass="delete" />
          {{ i18n("ui.deleteWholeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
          v-if="type == 'box'"
          command="deleteCurrentCol"
          :disabled="buttonControl.deleteWholeColDisabled"
        >
          <star-horse-icon iconClass="delete" />
          {{ i18n("ui.deleteCurrentCol") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
:deep(.field-item) {
  cursor: pointer;
}
.rubber-select-entry {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  .rubber-select-tip {
    font-size: 12px;
    color: #909399;
  }
}
.rubber-cell-detail {
  font-size: 12px;
  color: #67c23a;
  word-break: break-all;
}
</style>
