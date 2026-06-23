<script setup lang="ts">
import {computed, onMounted, PropType, ref, watch} from "vue";
import {tableAction} from "@/components/formcomp/container/dytableUtils";
import {i18n} from "@/lang";
import {FieldList, numberRangeItem, StarHorseDialog, uuid, warning} from "star-horse-lowcode";
import camelcase from "camelcase";

const props = defineProps({
  parentField: {type: Object as PropType<any>},
  disabled: {type: Object as PropType<Boolean | String>},
  field: {type: Object as PropType<any>},
  isFirstRow: {type: Boolean, default: false},
  isLastRow: {type: Boolean, default: false},
  isFirstCol: {type: Boolean, default: false},
  isLastCol: {type: Boolean, default: false},
  size: {type: String, default: "small"},
  rowIndex: {type: Number, default: -1},
  colIndex: {type: Number, default: -1},
  type: {type: String},
  validBox: {type: Boolean, default: false},
});
const cellInfo = computed(() => {
  const elements = props.parentField.preps.elements;
  const columns = elements[0].columns;
  return {
    maxRow: elements.length - props.rowIndex,
    maxCol: columns.length - props.colIndex,
  }
});
const currentCell = computed(() => {
  const elements = props.parentField.preps.elements;
  const element = elements[props.rowIndex];
  const columns = element.columns;
  return columns[props.colIndex];
})
const emits = defineEmits(["command"]);
const fieldForm = ref<Record<string, any>>({});
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
      props.type == "dytable" &&
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
        if (col.colspan > 1 && (i + col.colspan) >= props.colIndex) {
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
        if (col.rowspan > 1 && (i + col.rowspan) >= props.rowIndex) {
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
      dataType: props.field?.dataType ?? 'text',
      textContent: props.field?.textContent,
      visiblePlatform: "all",
      configRowType: "currentRow"
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
      configRowType: "currentRow"
    };
  } else {
    emits("command", command);
  }
};
const close = () => {
  configDialog.value = false;
  staticDataConfigDialog.value = false;
  componentVisible.value = false;
  currentItem.value = null;
  fieldForm.value = {};
};
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
}
const operationCellText = (column: any, fieldForm: any) => {
  column["dataType"] = fieldForm["dataType"];
  column["staticData"] = column["dataType"] != 'none';
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
    const configRowType = fieldForm.value.configRowType ?? 'currentRow';
    let unlinkRows = fieldForm.value.unlinkRows ?? [];
    if (configRowType == "linkRows") {
      const linkRowsMin = fieldForm.value.linkRowsMin;
      const linkRowsMax = fieldForm.value.linkRowsMax;
      if (!linkRowsMin || !linkRowsMax) {
        warning("请设置指定连续行");
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
    const configRowType = fieldForm.value.configRowType ?? 'currentRow';
    let unlinkRows = fieldForm.value.unlinkRows ?? [];
    if (configRowType == "linkRows") {
      const linkRowsMin = fieldForm.value.linkRowsMin;
      const linkRowsMax = fieldForm.value.linkRowsMax;
      if (!linkRowsMin || !linkRowsMax) {
        warning("请设置指定连续行");
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
  const fieldName = camelcase(["field",id.substring(0, 6)]) ;
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
      itemNameLabel:item.itemName,
      label: item.itemName
    }
  }
};
const addCompOperation = (column: any, item: any, suffix: string) => {
  if (column.cellVisible) {
    const listItems = Array.isArray(item) ? item.map(i => JSON.parse(JSON.stringify(i))) : [JSON.parse(JSON.stringify(item))];
    for (let i = 0; i < listItems.length; i++) {
      const id = uuid();
      const tempItem = listItems[i];
      tempItem.id = id;
      tempItem.fieldName = camelcase(["field",id.substring(0, 6),suffix]) ;
      if (!tempItem.preps) {
        tempItem.preps = {};
      }
      tempItem.preps.id = id;
      tempItem.preps.name = tempItem.fieldName;
      if (!column.items) {
        column.items = [];
      }
      console.log(tempItem);
      column.items.push(tempItem);
    }
  }
}
const compAddOperation = (type: string) => {
  if (!currentItem.value && !fieldForm.value.copyCurrentItem) {
    warning("请先选择组件");
    return;
  }
  const configRowType = fieldForm.value.configRowType ?? 'currentRow';
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
      warning("请设置指定连续行");
      return;
    }
    const linkColsMin = fieldForm.value.linkColsMin;
    const linkColsMax = fieldForm.value.linkColsMax;
    for (let i = linkRowsMin - 1; i < linkRowsMax; i++) {
      element = elements[i];
      columns = element.columns;
      for (let j = linkColsMin - 1; j < linkColsMax; j++) {
        if (fieldForm.value.copyCurrentItem && i == props.rowIndex && j == props.colIndex) {
          continue;
        }
        addCompOperation(columns[j], currentItem.value, i + "" + j);
      }
    }
  } else if (configRowType == "unlinkRows") {
    let unlinkRows = fieldForm.value.unlinkRows ?? [];
    let unLinkCols = fieldForm.value.unlinkCols ?? [];
    for (let nums in unlinkRows) {
      const tempRow = parseInt(unlinkRows[nums]) - 1;
      element = elements[tempRow];
      columns = element.columns;
      for (let col of unLinkCols) {
        const tempCol = parseInt(unLinkCols[col]) - 1;
        if (fieldForm.value.copyCurrentItem && tempRow == props.rowIndex && tempCol == props.colIndex) {
          continue;
        }
        addCompOperation(columns[tempCol], currentItem.value, tempRow + "" + tempCol);
      }
    }
  } else {
    addCompOperation(column, currentItem.value, "");
  }
  close();
};
const init = () => {
  tableAction(props, buttonControl.value, props.type);
};
onMounted(() => {
  init();
});
watch(
    () => props.field,
    () => {
      checkMenuStatus();
    },
    {deep: true, immediate: true},
);
watch(
    () => props.parentField,
    () => tableAction(props, buttonControl.value, props.type),
    {
      immediate: false,
      deep: true,
    },
);
</script>

<template>
  <star-horse-dialog
      box-width="50%"
      box-height="60%"
      :source="2"
      :full-screen="false"
      :title="i18n('form.changeComponent')"
      :self-func="true"
      :dialog-visible="componentVisible"
      @merge="compAddOperation"
      @closeAction="close"
  >
    <el-splitter>
      <el-splitter-panel size="40%">
        <field-list @selectData="changeItem"/>
      </el-splitter-panel>
      <el-splitter-panel>
        <el-form v-model="fieldForm" label-position="top">
          <el-form-item
              label="已选组件"
              label-position="left"
              v-if="currentItem"
          >
            <el-tag type="primary">{{currentItem.label}}</el-tag>
          </el-form-item>
          <el-form-item
              label="指定行数做相同设置"
              prop="sameConfigRows"
          >
            <el-select v-model="fieldForm.configRowType">
              <el-option label="当前单元格" value="currentRow"/>
              <el-option label="连续" value="linkRows"/>
              <el-option label="非连续" value="unlinkRows"/>
            </el-select>
          </el-form-item>
          <el-form-item label-position="left" label="拷贝当前组件" v-if="currentCell?.items?.length>0&&fieldForm.configRowType!='currentRow'"
                        prop="copyCurrentItem">
            <el-switch v-model="fieldForm.copyCurrentItem"/>
          </el-form-item>
          <el-form-item label="指定连续行" prop="linkRows" v-if="fieldForm.configRowType=='linkRows'">
            <number-range-item :field="{
              fieldName:'linkRows',
              preps:{}
            }" v-model:formData="fieldForm"/>
          </el-form-item>
          <el-form-item label="指定连续列" prop="linkCols" v-if="fieldForm.configRowType=='linkRows'">
            <number-range-item :field="{
                fieldName:'linkCols',
                preps:{}
              }" v-model:formData="fieldForm"/>
          </el-form-item>
          <el-form-item label="非连续行" prop="unlinkRows" v-if="fieldForm.configRowType=='unlinkRows'">
            <el-input-tag v-model="fieldForm.unlinkRows"/>
          </el-form-item>
          <el-form-item label="非连续列" prop="unlinkCols" v-if="fieldForm.configRowType=='unlinkRows'">
            <el-input-tag v-model="fieldForm.unlinkCols"/>
          </el-form-item>
        </el-form>
      </el-splitter-panel>
    </el-splitter>

  </star-horse-dialog>
  <star-horse-dialog
      title="编辑静态文本"
      :self-func="true"
      :hide-full-screen-icon="true"
      @merge="submitAction"
      @closeAction="close"
      :dialog-visible="staticDataConfigDialog"
      box-width="40%"
  >
    <el-form v-model="fieldForm">
      <el-form-item
          label="可见平台"
          prop="visiblePlatform"
      >
        <el-radio-group v-model="fieldForm.visiblePlatform">
          <el-radio label="PC" value="pc"/>
          <el-radio label="App" value="app"/>
          <el-radio label="全部" value="all"/>
        </el-radio-group>
      </el-form-item>
      <el-form-item
          label="指定行数做相同设置"
          prop="sameConfigRows"
      >
        <el-select v-model="fieldForm.configRowType">
          <el-option label="当前行" value="currentRow"/>
          <el-option label="连续行" value="linkRows"/>
          <el-option label="非连续行" value="unlinkRows"/>
        </el-select>
      </el-form-item>
      <el-form-item label="指定连续行" prop="linkRows" v-if="fieldForm.configRowType=='linkRows'">
        <number-range-item :field="{
          fieldName:'linkRows',
          preps:{}
        }" v-model:formData="fieldForm"/>
      </el-form-item>
      <el-form-item label="非连续行" prop="unlinkRows" v-if="fieldForm.configRowType=='unlinkRows'">
        <el-input-tag v-model="fieldForm.unlinkRows"/>
      </el-form-item>
      <el-form-item
          label="文本类型"
          prop="dataType"
      >
        <el-radio-group v-model="fieldForm.dataType">
          <el-radio label="Text" value="text"/>
          <el-radio label="Html" value="html"/>
          <el-radio label="无" value="none"/>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="内容" prop="textContent">
        <el-input type="textarea" v-model="fieldForm.textContent" v-if="fieldForm.dataType=='text'"/>
        <htmleditor-item v-if="fieldForm.dataType=='html'" :formData="fieldForm" :field="{
          fieldName:'textContent'
        }"/>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <star-horse-dialog
      :title="i18n('ui.operation')"
      :self-func="true"
      :hide-full-screen-icon="true"
      @merge="submitAction"
      @closeAction="close"
      :dialog-visible="configDialog"
      box-width="40%"
  >
    <el-form v-model="fieldForm">
      <el-form-item
          :label="i18n('dyform.utils.434')"
          prop="colHeight"
          v-if="currentCommand == 'rowConfig'"
      >
        <el-input v-model="fieldForm.colHeight"/>
      </el-form-item>
      <el-form-item
          :label="i18n('dyform.utils.435')"
          prop="colWidth"
          v-if="currentCommand == 'colConfig'"
      >
        <el-input v-model="fieldForm.colWidth"/>
      </el-form-item>
      <el-form-item
          label="指定行数做相同设置"
          prop="sameConfigRows"
          v-if="currentCommand == 'cellConfig'"
      >
        <el-select v-model="fieldForm.configRowType">
          <el-option label="当前行" value="currentRow"/>
          <el-option label="连续行" value="linkRows"/>
          <el-option label="非连续行" value="unlinkRows"/>
        </el-select>
      </el-form-item>
      <el-form-item label="指定连续行" prop="linkRows" v-if="fieldForm.configRowType=='linkRows'">
        <number-range-item :field="{
          fieldName:'linkRows',
          preps:{}
        }" v-model:formData="fieldForm"/>
      </el-form-item>
      <el-form-item label="非连续行" prop="unlinkRows" v-if="fieldForm.configRowType=='unlinkRows'">
        <el-input-tag v-model="fieldForm.unlinkRows"/>
      </el-form-item>
      <el-form-item
          :label="i18n('dyform.utils.436')"
          prop="rowspan"
          v-if="type == 'dytable' && currentCommand == 'cellConfig'"
      >
        <el-input-number min="1" step="1" :max="cellInfo.maxRow" v-model="fieldForm.rowspan"/>
        <help :message="i18n('dyform.utils.437')"/>
      </el-form-item>
      <el-form-item
          :label="i18n('dyform.utils.438')"
          prop="colspan"
          v-if="currentCommand == 'cellConfig'"
      >
        <el-input-number
            min="1"
            step="1"
            :max="type == 'dytable' ? cellInfo.maxCol : 24"
            v-model="fieldForm.colspan"
        />
        <help
            :message="i18n('dyform.utils.439')"
            v-if="type == 'dytable'"
        />
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <el-dropdown
      trigger="click"
      :disabled="disabled"
      @command="handleTableCellCommand"
      :size="size"
  >
    <star-horse-icon icon-class="menu" style="color: var(--star-horse-white)"/>
    <template #dropdown>
      <el-dropdown-menu style="max-height: 400px; overflow-y: auto;">
        <el-dropdown-item command="addText"
        >
          <star-horse-icon iconClass="edit"/>{{ i18n("ui.addText") }}
        </el-dropdown-item>
        <el-dropdown-item command="removeText"
        > <star-horse-icon iconClass="delete"/>{{ i18n("ui.removeText") }}
        </el-dropdown-item>
        <el-dropdown-item command="colConfig" divided>
          <star-horse-icon iconClass="document"/> {{ i18n("ui.colConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="rowConfig">
          <star-horse-icon iconClass="document"/> {{ i18n("ui.rowConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="cellConfig">
          <star-horse-icon iconClass="config"/>{{ i18n("ui.cellConfig") }}
        </el-dropdown-item>
        <el-dropdown-item command="addComp">
          <star-horse-icon iconClass="add"/>  {{ i18n("ui.addComp") }}
        </el-dropdown-item>

        <el-dropdown-item divided command="insertLeftCol"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.insertLeftCol") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertRightCol"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.insertRightCol") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertAboveRow"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.insertAboveRow") }}
        </el-dropdown-item>
        <el-dropdown-item command="insertBelowRow"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.insertBelowRow") }}
        </el-dropdown-item>

        <el-dropdown-item
            command="mergeLeftCol"
            :disabled="buttonControl.mergeLeftColDisabled"
            divided
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.mergeLeftCell") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="mergeRightCol"
            :disabled="buttonControl.mergeRightColDisabled"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.mergeRightCell") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="mergeWholeRow"
            :disabled="buttonControl.mergeWholeRowDisabled"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.mergeWholeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="mergeAboveRow"
            v-if="type != 'box' || validBox"
            :disabled="buttonControl.mergeAboveRowDisabled"
            divided
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.mergeAboveCell") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="mergeBelowRow"
            v-if="type != 'box' || validBox"
            :disabled="buttonControl.mergeBelowRowDisabled"
        > <star-horse-icon iconClass="document"/>{{ i18n("ui.mergeBelowCell") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="mergeWholeCol"
            v-if="type != 'box' || validBox"
            :disabled="buttonControl.mergeWholeColDisabled"
        > <star-horse-icon iconClass="plus"/>{{ i18n("ui.mergeWholeCol") }}
        </el-dropdown-item>

        <el-dropdown-item
            command="undoMergeRow"
            v-if="type != 'box' || validBox"
            :disabled="buttonControl.undoMergeRowDisabled"
            divided
        > <star-horse-icon iconClass="undo"/>{{ i18n("ui.undoMergeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="undoMergeCol"
            :disabled="buttonControl.undoMergeColDisabled"
        > <star-horse-icon iconClass="undo"/>{{ i18n("ui.undoMergeCol") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="resetMerge"
            :disabled="buttonControl.resetMergeDisabled"
        > <star-horse-icon iconClass="reset"/>{{ i18n("ui.resetMerge") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="addCellAfter"
            v-if="type == 'box'"
            :disabled="buttonControl.addCellAfterDisabled"
            divided
        > <star-horse-icon iconClass="add"/>{{ i18n("ui.addCellAfter") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="addCellBefore"
            v-if="type == 'box'"
            :disabled="buttonControl.addCellBeforeDisabled"
        > <star-horse-icon iconClass="add"/>{{ i18n("ui.addCellBefore") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="deleteWholeCol"
            v-if="type != 'box'"
            :disabled="buttonControl.deleteWholeColDisabled"
            divided
        > <star-horse-icon iconClass="delete"/>{{ i18n("ui.deleteWholeCol") }}
        </el-dropdown-item>
        <el-dropdown-item
            command="deleteWholeRow"
            :disabled="buttonControl.deleteWholeRowDisabled"
        > <star-horse-icon iconClass="delete"/>{{ i18n("ui.deleteWholeRow") }}
        </el-dropdown-item>
        <el-dropdown-item
            v-if="type == 'box'"
            command="deleteCurrentCol"
            :disabled="buttonControl.deleteWholeColDisabled"
        > <star-horse-icon iconClass="delete"/>{{ i18n("ui.deleteCurrentCol") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<style scoped lang="scss">
:deep(.field-item){
  cursor: pointer;
}
</style>
