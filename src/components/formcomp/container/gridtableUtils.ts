import {operationConfirm, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";

export const colDataInfo = () => {
  return { id: uuid(), colspan: 1, rowspan: 1, items: [], cellVisible: true };
};

const insertLeftCol = (props: any) => {
  const position = props.isFirstCol ? 0 : props.colIndex;
  insertCol(props, position);
};

const insertCol = (props: any, position: number) => {
  const rows = props.parentField.preps.elements;
  for (let index = 0; index < rows.length; index++) {
    const cols = rows[index].columns;
    const newCol = colDataInfo();
    newCol.cellVisible = true;
    if (cols[0].colspan == cols.length && cols[0].colspan > 1) {
      cols[0].colspan = cols[0].colspan + 1;
      newCol.cellVisible = false;
    }
    cols.splice(position, 0, newCol);
  }
  changeRowAndColNums(props);
};

const changeRowAndColNums = (props: any) => {
  const rows = props.parentField.preps.elements;
  const cols = rows[0].columns;
  props.parentField.preps["rowNums"] = rows.length;
  props.parentField.preps["columnNums"] = cols.length;
};

export const insertRightCol = (props: any, _type?: any, _allCol?: boolean) => {
  const position = props.colIndex + 1;
  insertCol(props, position);
};

const insertAboveRow = (props: any) => {
  const position = props.rowIndex;
  addRow(props, position);
};

const addRow = (props: any, position: number) => {
  const rows = props.parentField.preps.elements;
  const columns = rows[0].columns;
  let len = columns.length;
  const items = [];
  for (let i = 0; i < len; i++) {
    const newCol = colDataInfo();
    newCol.cellVisible = true;
    items.push(newCol);
  }
  for (let index = 0; index < len; index++) {
    const tempRowSpan = columns[index].rowspan;
    if (tempRowSpan > 1 && tempRowSpan == rows.length) {
      items[index].cellVisible = false;
      columns[index].rowspan = columns[index].rowspan + 1;
      break;
    }
  }
  rows.splice(position, 0, { id: uuid(), columns: items });
  changeRowAndColNums(props);
};

export const insertBelowRow = (props: any, _type?: any) => {
  const position = props.rowIndex + 1;
  addRow(props, position);
};

const tableCellInfo = (props: any) => {
  const rows = props.parentField.preps.elements;
  const row = rows[props.rowIndex];
  const col = row.columns[props.colIndex];
  return { rows, row, col };
};

const mergeLeftCol = (props: any) => {
  const { row, col } = tableCellInfo(props);
  for (let i = props.colIndex - 1; i >= 0; i--) {
    const tempCol = row.columns[i];
    if (tempCol.cellVisible) {
      tempCol.colspan = col.colspan + tempCol.colspan;
      col.cellVisible = false;
      break;
    }
  }
};

const mergeRightCol = (props: any) => {
  const { row, col } = tableCellInfo(props);
  const columns = row.columns;
  for (let i = props.colIndex + 1; i < columns.length; i++) {
    const tempCol = columns[i];
    if (tempCol.cellVisible) {
      col.colspan = (col.colspan ?? 1) + tempCol.colspan;
      tempCol.cellVisible = false;
      break;
    }
  }
};

const mergeWholeCol = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  if (col.rowspan === rows.length) {
    return;
  }
  for (let i = 0; i < rows.length; i++) {
    const row1 = rows[i];
    const cols = row1.columns;
    if (cols[props.colIndex] && i > 0) {
      cols[props.colIndex].cellVisible = false;
    }
  }
  rows[0].columns[props.colIndex].rowspan = rows.length;
};

const mergeAboveRow = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  const aboveRow = rows[props.rowIndex - 1];
  const aboveCol = aboveRow.columns[props.colIndex];
  aboveCol.rowspan = aboveCol.rowspan + col.rowspan;
  col.cellVisible = false;
};

const mergeBelowRow = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  const belowRow = rows[props.rowIndex + col.rowspan];
  col.rowspan = col.rowspan + 1;
  if (belowRow.columns[props.colIndex]) {
    belowRow.columns[props.colIndex].cellVisible = false;
  }
};

const mergeWholeRow = (props: any) => {
  const { row } = tableCellInfo(props);
  let totalCols: number = 0;
  for (const index in row.columns) {
    const col = row.columns[index];
    totalCols += col.colspan;
    col.cellVisible = parseInt(index) == 0;
  }
  row.columns[0].colspan = totalCols;
};

const undoMergeRow = (props: any) => {
  const { rows, row, col } = tableCellInfo(props);
  if (row.columns.length == 1) {
    col.colspan = col.colspan - 1;
    row.columns[props.colIndex + 1].cellVisible = true;
  } else {
    col.rowspan = col.rowspan - 1;
    const tempCols = rows[props.rowIndex + col.rowspan].columns;
    for (
      let start = props.colIndex;
      start <= props.colIndex + col.colspan;
      start++
    ) {
      tempCols[start].cellVisible = true;
    }
  }
};

const undoMergeCol = (props: any) => {
  const { rows, row, col } = tableCellInfo(props);
  if (col.rowspan == rows.length) {
    col.rowspan = col.rowspan - 1;
    const tempCols = rows[col.rowspan].columns;
    for (
      let start = props.colIndex;
      start <= props.colIndex + col.colspan;
      start++
    ) {
      tempCols[start].cellVisible = true;
    }
  } else {
    col.colspan = col.colspan - 1;
    row.columns[props.colIndex + col.colspan].cellVisible = true;
  }
};

const resetMerge = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  const colspan = col.colspan;
  const rowspan = col.rowspan;
  for (let i = props.rowIndex; i < props.rowIndex + rowspan; i++) {
    const tempColumns = rows[i].columns;
    for (let j = props.colIndex; j < props.colIndex + colspan; j++) {
      tempColumns[j].cellVisible = true;
      tempColumns[j].colspan = 1;
      tempColumns[j].rowspan = 1;
    }
  }
};

const deleteWholeCol = (props: any) => {
  const rows = props.parentField.preps.elements;
  operationConfirm(i18n("dyform.comp.container.444")).then((res) => {
    for (let i = 0; i < rows.length; i++) {
      const tempColumns = rows[i].columns;
      const col = tempColumns.splice(props.colIndex, 1)[0];
      if (col.colspan > 1) {
        for (let j = props.colIndex; j < props.colIndex + col.colspan; j++) {
          tempColumns[j].cellVisible = true;
        }
      }
      if (!col.cellVisible) {
        for (let j = props.colIndex - 1; j >= 0; j--) {
          if (tempColumns[j].colspan > 1) {
            tempColumns[j].colspan = tempColumns[j].colspan - 1;
            break;
          }
        }
      }
    }
  });
};

const deleteWholeRow = (props: any) => {
  const rows = props.parentField.preps.elements;
  operationConfirm(i18n("dyform.comp.container.445")).then((res) => {
    const row = rows.splice(props.rowIndex, 1);
    row[0].columns.forEach((column, col) => {
      let rangRowAndCol = column.rowspan > 1 && column.colspan > 1;
      if (column.rowspan > 1) {
        for (let i = props.rowIndex; i < props.rowIndex + column.rowspan; i++) {
          const tempColumns = rows[i].columns;
          tempColumns[col].cellVisible = true;
          if (rangRowAndCol) {
            for (let j = col; j < col + column.colspan; j++) {
              tempColumns[j].cellVisible = true;
            }
          }
        }
      }
      if (!column.cellVisible) {
        for (let j = props.rowIndex; j >= 0; j--) {
          const tempColumn = rows[j].columns[col];
          if (tempColumn.rowspan > 1) {
            tempColumn.rowspan -= 1;
            break;
          }
        }
      }
    });
  });
};

export const tableCellOperation = (command: string, props: any) => {
  switch (command) {
    case "insertLeftCol":
      insertLeftCol(props);
      break;
    case "insertRightCol":
      insertRightCol(props);
      break;
    case "insertAboveRow":
      insertAboveRow(props);
      break;
    case "insertBelowRow":
      insertBelowRow(props);
      break;
    case "mergeLeftCol":
      mergeLeftCol(props);
      break;
    case "mergeRightCol":
      mergeRightCol(props);
      break;
    case "mergeWholeCol":
      mergeWholeCol(props);
      break;
    case "mergeAboveRow":
      mergeAboveRow(props);
      break;
    case "mergeBelowRow":
      mergeBelowRow(props);
      break;
    case "mergeWholeRow":
      mergeWholeRow(props);
      break;
    case "undoMergeRow":
      undoMergeRow(props);
      break;
    case "undoMergeCol":
      undoMergeCol(props);
      break;
    case "resetMerge":
      resetMerge(props);
      break;
    case "deleteWholeCol":
      deleteWholeCol(props);
      break;
    case "deleteWholeRow":
      deleteWholeRow(props);
      break;
  }
  changeRowAndColNums(props);
};

const mergeLeftColAction = (props: any) => {
  const { row, col } = tableCellInfo(props);
  if (!row || !row.columns?.length) return true;
  const leftCol = row.columns[props.colIndex - 1];
  return col.rowspan > 1 && leftCol
    ? leftCol.rowspan != col.rowspan
    : props.isFirstCol;
};

const mergeRightColAction = (props: any) => {
  const { row, col } = tableCellInfo(props);
  if (!row || !row.columns?.length) return true;
  const rightCol = row.columns[props.colIndex + 1];
  return col.rowspan > 1 && rightCol
    ? rightCol.rowspan != col.rowspan
    : props.isLastCol;
};

const colCommonAction = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  for (const index in rows) {
    const tempRow = rows[index];
    if (!tempRow || !tempRow.columns?.length) return true;
    const tempCol = tempRow.columns[props.colIndex];
    if (!tempCol || tempCol.colspan != col.colspan) return true;
  }
  return false;
};

const rowCommonAction = (props: any) => {
  const { row, col } = tableCellInfo(props);
  for (const index in row.columns) {
    const tempCol = row.columns[index];
    if (col.rowspan != tempCol.rowspan) return true;
  }
  return false;
};

const mergeAboveRowAction = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  const aboveRow = rows[props.rowIndex - 1];
  if (!aboveRow?.columns?.length) return true;
  const aboveCol = aboveRow?.columns[props.colIndex];
  if (!aboveCol || col.colspan != aboveCol.colspan) return true;
  return props.isFirstRow;
};

const mergeBelowRowAction = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  const belowRow = rows[props.rowIndex + 1];
  if (!belowRow || !belowRow.columns?.length) return true;
  const belowCol = belowRow?.columns[props.colIndex];
  if (!belowCol || col.colspan != belowCol.colspan) return true;
  return props.isLastRow;
};

const undoMergeRowAction = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  let columns: number = 0;
  for (const index in rows) {
    const len = rows[index].columns?.length;
    if (columns < len) columns = len;
  }
  if (columns == col.colspan && col.colspan > 1) return false;
  return props.field.rowspan == 1;
};

const undoMergeColAction = (props: any) => {
  const { rows, col } = tableCellInfo(props);
  if (rows.length == col.rowspan && col.rowspan > 1) return false;
  return props.field.colspan == 1;
};

export const tableAction = (props: any, buttonControl: any) => {
  buttonControl.mergeLeftColDisabled = mergeLeftColAction(props);
  buttonControl.mergeRightColDisabled = mergeRightColAction(props);
  buttonControl.mergeWholeColDisabled = colCommonAction(props);
  buttonControl.mergeAboveRowDisabled = mergeAboveRowAction(props);
  buttonControl.mergeBelowRowDisabled = mergeBelowRowAction(props);
  buttonControl.mergeWholeRowDisabled = rowCommonAction(props);
  buttonControl.deleteWholeColDisabled = colCommonAction(props);
  buttonControl.deleteWholeRowDisabled = rowCommonAction(props);
  buttonControl.undoMergeRowDisabled = undoMergeRowAction(props);
  buttonControl.undoMergeColDisabled = undoMergeColAction(props);
};
