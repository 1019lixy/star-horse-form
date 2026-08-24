<script setup lang="ts" name="gridtable-container">
import {computed, PropType, ref} from "vue";
import GridtableCol from "@/components/formcomp/container/gridtable-col.vue";
import GroupContainer from "@/components/formcomp/container/group-container.vue";

const props = defineProps({
  parentField: { type: Object as PropType<any> },
  isDesign: { type: Boolean, default: false },
  showFormItem: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
  formInfo: { type: Object as PropType<any> },
  field: { type: Object as PropType<any> },
  compSize: { type: String, default: "default" },
});
const formData = defineModel("formData");

const resizingColIndex = ref(-1);
const startX = ref(0);
const startWidth = ref(0);
let resizeLine: HTMLElement | null = null;

const handleColResizeStart = (e: MouseEvent, index: number) => {
  e.preventDefault();
  resizingColIndex.value = index;
  startX.value = e.clientX;
  const elements = props.field.preps.elements;
  const firstRow = elements[0];
  if (!firstRow?.columns?.[index]) return;
  const colElement = (e.target as HTMLElement).parentElement as HTMLElement;
  startWidth.value = colElement.offsetWidth;
  resizeLine = document.createElement("div");
  const handleHalf = 3;
  //  z-index: 9999;
  resizeLine.style.cssText = `
    position: fixed;
    top: 0;
    left: ${e.clientX - handleHalf}px;
    width: 4px;
    height: 100vh;
    background: #409eff;

    pointer-events: none;
  `;
  document.body.appendChild(resizeLine);
  document.addEventListener("mousemove", handleColResizeMove);
  document.addEventListener("mouseup", handleColResizeEnd);
};

const handleColResizeMove = (e: MouseEvent) => {
  if (resizingColIndex.value === -1 || !resizeLine) return;
  const handleHalf = 3;
  resizeLine.style.left = `${e.clientX - handleHalf}px`;
  const delta = e.clientX - startX.value;
  const newWidth = Math.max(20, startWidth.value + delta);
  const newWidthStr = `${newWidth}px`;
  const elements = props.field.preps.elements;
  elements?.forEach((row: any) => {
    if (row.columns && row.columns[resizingColIndex.value]) {
      row.columns[resizingColIndex.value].colWidth = newWidthStr;
    }
  });
};

const handleColResizeEnd = () => {
  resizingColIndex.value = -1;
  if (resizeLine) {
    document.body.removeChild(resizeLine);
    resizeLine = null;
  }
  document.removeEventListener("mousemove", handleColResizeMove);
  document.removeEventListener("mouseup", handleColResizeEnd);
};

const totalCols = computed(() => {
  const elements = props.field.preps?.elements || [];
  return elements[0]?.columns?.length || 1;
});

const hasCustomWidth = computed(() => {
  const elements = props.field.preps?.elements || [];
  const firstRow = elements[0];
  if (!firstRow?.columns?.length) return false;
  return firstRow.columns.some((c: any) => c.colWidth);
});

const gridTemplateColumns = computed(() => {
  if (hasCustomWidth.value) {
    const elements = props.field.preps?.elements || [];
    const firstRow = elements[0];
    const parts: string[] = [];
    for (const col of firstRow.columns) {
      parts.push(col.colWidth || `calc(100% / ${totalCols.value})`);
    }
    return parts.join(" ");
  }
  return `repeat(${totalCols.value}, 1fr)`;
});

const columnStructure = computed(() => {
  const elements: any = props.field.preps?.elements;
  if (!elements?.length) return [];
  const firstRow = elements[0];
  const columns = firstRow.columns.length;
  const colStructure = [];
  for (let i = 0; i < columns; i++) {
    colStructure.push({ width: firstRow.columns[i].colWidth });
  }
  return colStructure;
});

const gridModel = computed(() => {
  const elements = props.field.preps?.elements || [];
  if (!elements.length) return [];
  const cols = totalCols.value;
  const occupied: boolean[][] = elements.map(() => new Array(cols).fill(false));
  const positions: number[][] = [];
  for (let r = 0; r < elements.length; r++) {
    const row = elements[r];
    if (!row.columns) {
      positions.push([]);
      continue;
    }
    let colPos = 0;
    const rowPositions: number[] = [];
    for (let c = 0; c < row.columns.length; c++) {
      const cell = row.columns[c];
      const cs = cell.colspan || 1;
      const rs = cell.rowspan || 1;
      if (cell.cellVisible === false) {
        rowPositions.push(0);
        continue;
      }
      while (colPos < cols && occupied[r][colPos]) colPos++;
      rowPositions.push(colPos + 1);
      if (rs > 1) {
        for (let rr = r + 1; rr < Math.min(r + rs, elements.length); rr++) {
          for (let i = 0; i < cs && colPos + i < cols; i++) {
            occupied[rr][colPos + i] = true;
          }
        }
      }
      colPos += cs;
    }
    positions.push(rowPositions);
  }
  return positions;
});

const getGridPosition = (rowIndex: number, colIndex: number, col: any) => {
  const colStart = gridModel.value[rowIndex]?.[colIndex] ?? 1;
  const colSpan = col.colspan || 1;
  const rowSpan = col.rowspan || 1;
  const offset = shouldShowLineNumber.value ? 1 : 0;
  return {
    gridColumn: `${colStart + offset} / span ${colSpan}`,
    gridRow: `${rowIndex + 1} / span ${rowSpan}`,
  };
};

const getColIndex = (rowIndex: number, colIndex: number, col: any) => {
  const elements = props.field.preps.elements;
  if (rowIndex === 0) return colIndex;
  let totalCols = 0;
  elements.forEach((row: any) => {
    if (row.columns) {
      let rowCols = 0;
      row.columns.forEach((c: any) => {
        rowCols += c.colspan || 1;
      });
      totalCols = Math.max(totalCols, rowCols);
    }
  });
  const fullRowCols: boolean[] = new Array(totalCols).fill(false);
  for (let r = 0; r < rowIndex; r++) {
    const row = elements[r];
    if (!row.columns) continue;
    let colPos = 0;
    for (let c = 0; c < row.columns.length; c++) {
      const checkCol = row.columns[c];
      const colspan = checkCol.colspan || 1;
      const rowspan = checkCol.rowspan || 1;
      if (rowspan > 1 && r + rowspan > rowIndex) {
        for (let i = 0; i < colspan; i++) {
          fullRowCols[colPos + i] = true;
        }
      }
      colPos += colspan;
    }
  }
  let currentColPosition = 0;
  for (let refColIdx = 0; refColIdx < totalCols; refColIdx++) {
    if (!fullRowCols[refColIdx]) {
      if (currentColPosition === colIndex) return refColIdx;
      currentColPosition++;
    }
  }
  return colIndex;
};

const showLineNumber = computed(
  () => props.field.preps?.showLineNumber !== false,
);
const shouldShowLineNumber = computed(
  () => props.isDesign || showLineNumber.value,
);

const wrapperStyle = computed(() => {
  const baseWidth = props.field.preps?.tableWidth || "100%";
  const style: Record<string, any> = {};
  if (hasCustomWidth.value) {
    style["minWidth"] = baseWidth;
    style["width"] = "fit-content";
  } else {
    style["width"] = baseWidth;
  }
  return style;
});
</script>
<template>
  <group-container
    class="star-horse-form-container"
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :parentField="parentField"
    :form-item="field"
  >
    <div class="gridtable-wrapper" :style="wrapperStyle">
      <div
        v-if="isDesign && field.preps.elements.length > 0"
        class="gridtable-header"
        :style="{ gridTemplateColumns: `30px ${gridTemplateColumns}` }"
      >
        <div class="gridtable-header-cell no-cell"></div>
        <div
          v-for="(col, index) in columnStructure"
          :key="index"
          class="gridtable-header-cell no-cell col-resize-container"
          :style="{ width: col.width || '100%' }"
        >
          {{ index + 1 }}
          <div
            class="col-resize-handle"
            @mousedown="(e) => handleColResizeStart(e, index)"
          />
        </div>
      </div>
      <div
        class="gridtable-body"
        :style="{
          gridTemplateColumns: shouldShowLineNumber
            ? `30px ${gridTemplateColumns}`
            : gridTemplateColumns,
        }"
      >
        <template
          v-for="(row, rowIndex) in field.preps.elements"
          :key="row.id || rowIndex"
        >
          <div
            v-if="shouldShowLineNumber"
            class="gridtable-line-number no-cell"
            :style="{ gridColumn: '1', gridRow: `${rowIndex + 1}` }"
          >
            {{ rowIndex + 1 }}
          </div>
          <template
            v-for="(td, colIndex) in row.columns"
            :key="td.id || colIndex"
          >
            <gridtable-col
              :field="td"
              v-if="td.cellVisible"
              :formInfo="formInfo"
              v-model:formData="formData"
              :isDesign="isDesign"
              :showFormItem="showFormItem"
              :disabled="disabled"
              :isFirstRow="rowIndex == 0"
              :parentField="field"
              :isLastRow="rowIndex == field.preps.elements.length - 1"
              :isFirstCol="colIndex == 0"
              :isLastCol="colIndex == row.columns.length - 1"
              :rowIndex="Number(rowIndex)"
              :colIndex="Number(colIndex)"
              :actionColIndex="
                getColIndex(Number(rowIndex), Number(colIndex), td)
              "
              :gridPosition="
                getGridPosition(Number(rowIndex), Number(colIndex), td)
              "
              :showLineNumber="showLineNumber"
            />
          </template>
        </template>
      </div>
    </div>
  </group-container>
</template>
<style lang="scss" scoped>
.gridtable-wrapper {
  width: 100%;
  border: 1px solid var(--star-horse-style);
}
.gridtable-header {
  display: grid;
  border-bottom: 1px solid var(--star-horse-style);
}
.gridtable-header-cell {
  padding: 2px 4px;
  text-align: center;
  font-size: 12px;
  border-right: 1px solid var(--star-horse-style);
  position: relative;
  min-height: 20px;
}
.gridtable-body {
  display: grid;
}
.gridtable-line-number {
  padding: 2px 4px;
  text-align: center;
  font-size: 12px;
  border-right: 1px solid var(--star-horse-style);
  border-bottom: 1px solid var(--star-horse-style);
  display: flex;
  align-items: center;
  justify-content: center;
}
.col-resize-container {
  position: relative;
}
.col-resize-handle {
  position: absolute;
  top: 0;
  bottom: 0;
  right: -3px;
  width: 6px;
  cursor: col-resize;
  background: var(--star-horse-style);
  opacity: 0.5;
  transition: opacity 0.3s;
  // z-index: 500;
  &:hover {
    opacity: 1;
  }
}
.no-cell {
  border: 1px solid var(--star-horse-style);
}
</style>
