import {operationConfirm, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";

const createCell = () => {
    return {id: uuid(), colspan: 1, rowspan: 1, items: [], cellVisible: true};
};

const cellInfo = (props: any) => {
    const rows = props.parentField.preps.elements;
    const row = rows[props.rowIndex];
    const col = row.columns[props.colIndex];
    return {rows, row, col};
};

const insertCol = (props: any, position: number) => {
    const rows = props.parentField.preps.elements;
    for (let index = 0; index < rows.length; index++) {
        const cols = rows[index].columns;
        const newCol = createCell();
        newCol.cellVisible = true;
        if (cols[0].colspan == cols.length && cols[0].colspan > 1) {
            cols[0].colspan = cols[0].colspan + 1;
            newCol.cellVisible = false;
        }
        cols.splice(position, 0, newCol);
    }
};

const insertLeftCol = (props: any) => {
    insertCol(props, props.isFirstCol ? 0 : props.colIndex);
};

const insertRightCol = (props: any) => {
    insertCol(props, props.colIndex + 1);
};

const addRow = (props: any, position: number) => {
    const rows = props.parentField.preps.elements;
    const columns = rows[0].columns;
    const len = columns.length;
    const items = [];
    for (let i = 0; i < len; i++) {
        const newCol = createCell();
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
    rows.splice(position, 0, {id: uuid(), columns: items});
};

const insertAboveRow = (props: any) => {
    addRow(props, props.rowIndex);
};

const insertBelowRow = (props: any) => {
    addRow(props, props.rowIndex + 1);
};

const mergeLeftCol = (props: any) => {
    const {row, col} = cellInfo(props);
    for (let i = props.colIndex - 1; i >= 0; i--) {
        const tempCol = row.columns[i];
        if (tempCol.cellVisible) {
            tempCol.colspan = (col.colspan ?? 1) + tempCol.colspan;
            tempCol.mergedRow = true;
            col.cellVisible = false;
            break;
        }
    }
};

const mergeRightCol = (props: any) => {
    const {row, col} = cellInfo(props);
    const columns = row.columns;
    for (let i = props.colIndex + 1; i < columns.length; i++) {
        const tempCol = columns[i];
        if (tempCol.cellVisible) {
            col.colspan = (col.colspan ?? 1) + tempCol.colspan;
            col.mergedRow = true;
            tempCol.cellVisible = false;
            break;
        }
    }
};

const mergeAboveRow = (props: any) => {
    const {rows, col} = cellInfo(props);
    const aboveRow = rows[props.rowIndex - 1];
    const aboveCol = aboveRow.columns[props.colIndex];
    aboveCol.rowspan = (aboveCol.rowspan ?? 1) + (col.rowspan ?? 1);
    aboveCol.mergedCol = true;
    col.cellVisible = false;
};

const mergeBelowRow = (props: any) => {
    const {rows, col} = cellInfo(props);
    const belowRow = rows[props.rowIndex + (col.rowspan ?? 1)];
    col.rowspan = (col.rowspan ?? 1) + 1;
    col.mergedCol = true;
    if (belowRow?.columns?.[props.colIndex]) {
        belowRow.columns[props.colIndex].cellVisible = false;
    }
};

const mergeWholeRow = (props: any) => {
    const {row, col} = cellInfo(props);
    let totalCols = 0;
    for (const c of row.columns) {
        if (c.cellVisible !== false) totalCols += c.colspan || 1;
    }
    if ((col.colspan ?? 1) >= totalCols) return;
    for (let i = 0; i < row.columns.length; i++) {
        row.columns[i].cellVisible = i === 0;
    }
    row.columns[0].colspan = totalCols;
    row.columns[0].mergedRow = true;
};

const mergeWholeCol = (props: any) => {
    const {rows, col} = cellInfo(props);
    if ((col.rowspan ?? 1) === rows.length) {
        return;
    }
    for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].columns;
        if (cols[props.colIndex] && i > 0) {
            cols[props.colIndex].cellVisible = false;
        }
    }
    rows[0].columns[props.colIndex].rowspan = rows.length;
    rows[0].columns[props.colIndex].mergedCol = true;
};

const undoMergeRow = (props: any) => {
    const {row, col} = cellInfo(props);
    if (!col.mergedRow) return;
    const colspan = col.colspan ?? 1;
    if (colspan <= 1) return;
    for (let i = props.colIndex + 1; i < row.columns.length; i++) {
        if (row.columns[i].cellVisible === false) {
            col.colspan = colspan - (row.columns[i].colspan ?? 1);
            row.columns[i].cellVisible = true;
            break;
        }
    }
    if ((col.colspan ?? 1) <= 1) col.mergedRow = false;
};

const undoMergeCol = (props: any) => {
    const {rows, col} = cellInfo(props);
    if (!col.mergedCol) return;
    const rowspan = col.rowspan ?? 1;
    if (rowspan <= 1) return;
    for (let i = props.rowIndex + 1; i < rows.length; i++) {
        const targetCol = rows[i]?.columns?.[props.colIndex];
        if (targetCol?.cellVisible === false) {
            col.rowspan = rowspan - (targetCol.rowspan ?? 1);
            targetCol.cellVisible = true;
            break;
        }
    }
    if ((col.rowspan ?? 1) <= 1) col.mergedCol = false;
};

const resetMerge = (props: any) => {
    const {rows, col} = cellInfo(props);
    const colspan = col.colspan ?? 1;
    const rowspan = col.rowspan ?? 1;
    for (let i = props.rowIndex; i < (props.rowIndex + rowspan); i++) {
        const tempColumns = rows[i].columns;
        for (let j = props.colIndex; j < (props.colIndex + colspan); j++) {
            tempColumns[j].cellVisible = true;
            tempColumns[j].colspan = 1;
            tempColumns[j].rowspan = 1;
            tempColumns[j].mergedRow = false;
            tempColumns[j].mergedCol = false;
        }
    }
};

const deleteWholeCol = (props: any) => {
    const rows = props.parentField.preps.elements;
    operationConfirm(i18n("dyform.comp.container.444")).then(() => {
        for (let i = 0; i < rows.length; i++) {
            const tempColumns = rows[i].columns;
            const col = tempColumns.splice(props.colIndex, 1)[0];
            if (col.colspan > 1) {
                for (let j = props.colIndex; j < (props.colIndex + col.colspan); j++) {
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
    operationConfirm(i18n("dyform.comp.container.445")).then(() => {
        const row = rows.splice(props.rowIndex, 1);
        row[0].columns.forEach((column, col) => {
            let rangRowAndCol = (column.rowspan ?? 1) > 1 && (column.colspan ?? 1) > 1;
            if ((column.rowspan ?? 1) > 1) {
                for (let i = props.rowIndex; i < (props.rowIndex + (column.rowspan ?? 1)); i++) {
                    const tempColumns = rows[i].columns;
                    tempColumns[col].cellVisible = true;
                    if (rangRowAndCol) {
                        for (let j = col; j < (col + (column.colspan ?? 1)); j++) {
                            tempColumns[j].cellVisible = true;
                        }
                    }
                }
            }
            if (!column.cellVisible) {
                for (let j = props.rowIndex; j >= 0; j--) {
                    const tempColumn = rows[j].columns[col];
                    if ((tempColumn.rowspan ?? 1) > 1) {
                        tempColumn.rowspan -= 1;
                        break;
                    }
                }
            }
        });
    });
};

export const boxCellOperation = (command: string, props: any) => {
    switch (command) {
        case "insertLeftCol":     insertLeftCol(props); break;
        case "insertRightCol":    insertRightCol(props); break;
        case "insertAboveRow":    insertAboveRow(props); break;
        case "insertBelowRow":    insertBelowRow(props); break;
        case "mergeLeftCol":      mergeLeftCol(props); break;
        case "mergeRightCol":     mergeRightCol(props); break;
        case "mergeAboveRow":     mergeAboveRow(props); break;
        case "mergeBelowRow":     mergeBelowRow(props); break;
        case "mergeWholeRow":     mergeWholeRow(props); break;
        case "mergeWholeCol":     mergeWholeCol(props); break;
        case "undoMergeRow":      undoMergeRow(props); break;
        case "undoMergeCol":      undoMergeCol(props); break;
        case "resetMerge":        resetMerge(props); break;
        case "deleteWholeCol":    deleteWholeCol(props); break;
        case "deleteWholeRow":    deleteWholeRow(props); break;
    }
};

const mergeLeftColDisabled = (props: any) => {
    const {row, col} = cellInfo(props);
    if (!row?.columns?.length) return true;
    const leftCol = row.columns[props.colIndex - 1];
    return (col.rowspan ?? 1) > 1 && leftCol
        ? (leftCol.rowspan ?? 1) != (col.rowspan ?? 1)
        : props.isFirstCol;
};

const mergeRightColDisabled = (props: any) => {
    const {row, col} = cellInfo(props);
    if (!row?.columns?.length) return true;
    const rightCol = row.columns[props.colIndex + 1];
    return (col.rowspan ?? 1) > 1 && rightCol
        ? (rightCol.rowspan ?? 1) != (col.rowspan ?? 1)
        : props.isLastCol;
};

const colCommonAction = (props: any) => {
    const {rows, col} = cellInfo(props);
    for (const index in rows) {
        const tempRow = rows[index];
        if (!tempRow?.columns?.length) return true;
        const tempCol = tempRow.columns[props.colIndex];
        if (!tempCol || (tempCol.colspan ?? 1) != (col.colspan ?? 1)) return true;
    }
    return false;
};

const rowCommonAction = (props: any) => {
    const {row, col} = cellInfo(props);
    for (const index in row.columns) {
        const tempCol = row.columns[index];
        if ((col.rowspan ?? 1) != (tempCol.rowspan ?? 1)) return true;
    }
    return false;
};

const mergeAboveRowDisabled = (props: any) => {
    const {rows, col} = cellInfo(props);
    const aboveRow = rows[props.rowIndex - 1];
    if (!aboveRow?.columns?.length) return true;
    const aboveCol = aboveRow.columns[props.colIndex];
    if (!aboveCol || (col.colspan ?? 1) != (aboveCol.colspan ?? 1)) return true;
    return props.isFirstRow;
};

const mergeBelowRowDisabled = (props: any) => {
    const {rows, col} = cellInfo(props);
    const belowRow = rows[props.rowIndex + 1];
    if (!belowRow?.columns?.length) return true;
    const belowCol = belowRow.columns[props.colIndex];
    if (!belowCol || (col.colspan ?? 1) != (belowCol.colspan ?? 1)) return true;
    return props.isLastRow;
};

const undoMergeRowDisabled = (props: any) => {
    const {col} = cellInfo(props);
    return !col.mergedRow || (col.colspan ?? 1) <= 1;
};

const undoMergeColDisabled = (props: any) => {
    const {col} = cellInfo(props);
    return !col.mergedCol || (col.rowspan ?? 1) <= 1;
};

const mergeWholeRowDisabled = (props: any) => {
    const {row, col} = cellInfo(props);
    let totalCols = 0;
    for (const c of row.columns) {
        if (c.cellVisible !== false) totalCols += c.colspan || 1;
    }
    if ((col.colspan ?? 1) >= totalCols) return true;
    return rowCommonAction(props);
};

const mergeWholeColDisabled = (props: any) => {
    const {rows, col} = cellInfo(props);
    if ((col.rowspan ?? 1) >= rows.length) return true;
    return colCommonAction(props);
};

export const boxAction = (props: any, buttonControl: any) => {
    const {col} = cellInfo(props);
    buttonControl.mergeLeftColDisabled = mergeLeftColDisabled(props);
    buttonControl.mergeRightColDisabled = mergeRightColDisabled(props);
    buttonControl.mergeWholeColDisabled = mergeWholeColDisabled(props);
    buttonControl.mergeAboveRowDisabled = mergeAboveRowDisabled(props);
    buttonControl.mergeBelowRowDisabled = mergeBelowRowDisabled(props);
    buttonControl.mergeWholeRowDisabled = mergeWholeRowDisabled(props);
    buttonControl.deleteWholeColDisabled = colCommonAction(props);
    buttonControl.deleteWholeRowDisabled = rowCommonAction(props);
    buttonControl.undoMergeRowDisabled = undoMergeRowDisabled(props);
    buttonControl.undoMergeColDisabled = undoMergeColDisabled(props);
    buttonControl.resetMergeDisabled = (!col.mergedRow || (col.colspan ?? 1) <= 1) && (!col.mergedCol || (col.rowspan ?? 1) <= 1);
};
