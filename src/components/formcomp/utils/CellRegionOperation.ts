/**
 * 单元格区域操作（box/dytable/gridtable 框选批量操作）：
 * 数据结构与现有单元格操作完全一致——elements[row].columns[col] 上的
 * rowspan/colspan/cellVisible/items，合并沿用"原点设跨度、覆盖格 cellVisible=false"，
 * 拆分沿用 resetMerge 的"区域内全部还原为 1x1 可见"，删除组件即清空 column.items。
 * box 容器无 rowspan（仅同行 colspan 合并），合并沿用 mergeLeftCol(box) 的
 * "colspan 求和 + splice 移除被合并列"语义，拆分即还原为多个 colspan=1 的列。
 * 输入 cells 为框选得到的可见单元格（0-based 行列，考虑其 rowspan/colspan 合并占位）。
 */
import {uuid} from "star-horse-lowcode";
export interface RegionCell {
  //行下标（0-based）
  row: number;
  //列下标（0-based）
  col: number;
}

export interface RegionResult {
  ok: boolean;
  //成功时的统计信息（合并区域行数/列数、拆分/删除的单元格数等，用于成功提示）
  count?: number;
  rows?: number;
  cols?: number;
  //失败原因标记，调用方据此给出精确提示
  crossRow?: boolean;
  notContiguous?: boolean;
  notRectangular?: boolean;
}

interface Rect {
  r1: number;
  c1: number;
  r2: number;
  c2: number;
}

/**可见单元格的占位矩形（考虑 rowspan/colspan 合并占位），单元格不存在时返回 null*/
const cellRect = (elements: Array<any>, cell: RegionCell): Rect | null => {
  const col = elements[cell.row]?.columns?.[cell.col];
  if (!col) {
    return null;
  }
  return {
    r1: cell.row,
    c1: cell.col,
    r2: cell.row + (col.rowspan || 1) - 1,
    c2: cell.col + (col.colspan || 1) - 1,
  };
};

const intersects = (a: Rect, b: Rect) =>
  a.r1 <= b.r2 && a.r2 >= b.r1 && a.c1 <= b.c2 && a.c2 >= b.c1;

const unionRect = (a: Rect, b: Rect): Rect => ({
  r1: Math.min(a.r1, b.r1),
  c1: Math.min(a.c1, b.c1),
  r2: Math.max(a.r2, b.r2),
  c2: Math.max(a.c2, b.c2),
});

const sameRect = (a: Rect, b: Rect) =>
  a.r1 === b.r1 && a.c1 === b.c1 && a.r2 === b.r2 && a.c2 === b.c2;

/**遍历表格中所有可见的合并原点（rowspan/colspan 大于 1 的可见格）*/
const eachMergeOrigin = (
  elements: Array<any>,
  fn: (r: number, c: number, rect: Rect) => void,
) => {
  for (let r = 0; r < elements.length; r++) {
    const columns = elements[r]?.columns ?? [];
    for (let c = 0; c < columns.length; c++) {
      const col = columns[c];
      if (!col?.cellVisible) {
        continue;
      }
      const rowspan = col.rowspan || 1;
      const colspan = col.colspan || 1;
      if (rowspan <= 1 && colspan <= 1) {
        continue;
      }
      fn(r, c, {r1: r, c1: c, r2: r + rowspan - 1, c2: c + colspan - 1});
    }
  }
};

/**
 * 校验选中矩形的并集恰好铺满其包围盒（无空洞）：
 * 防止 Ctrl 多选离散区域后按包围盒合并导致意外合并中间未选中的大片单元格。
 */
const tilesBox = (rects: Array<Rect>, box: Rect): boolean => {
  const covered = new Set<string>();
  rects.forEach((r) => {
    for (let i = r.r1; i <= r.r2; i++) {
      for (let j = r.c1; j <= r.c2; j++) {
        covered.add(i + "," + j);
      }
    }
  });
  for (let i = box.r1; i <= box.r2; i++) {
    for (let j = box.c1; j <= box.c2; j++) {
      if (!covered.has(i + "," + j)) {
        return false;
      }
    }
  }
  return true;
};

/**
 * 框选合并单元格：把选中区域（含所有与之相交的既有合并区域，Excel 行为——
 * 部分选中的合并单元格会整体并入）合并为一个单元格。要求选中区域本身构成
 * 完整矩形（一次拖拽天然满足；Ctrl 多次拖拽需恰好拼接成矩形），否则返回
 * notRectangular 由调用方提示重新框选。
 * 原点（左上角）设置 rowspan/colspan 为区域高宽，其余格子 cellVisible=false，
 * 与现有 mergeRightCol/mergeWholeCol/mergeWholeRow 的数据语义一致。
 */
export const mergeRegionByCells = (
  elements: Array<any>,
  cells: Array<RegionCell>,
): RegionResult => {
  const rects = cells
    .map((c) => cellRect(elements, c))
    .filter((r): r is Rect => !!r);
  if (rects.length === 0) {
    return {ok: false};
  }
  //初始包围盒（选中格子的占位矩形之并的外框）
  let box = rects.reduce((acc, r) => unionRect(acc, r));
  //非矩形选择（离散多选未拼接成完整矩形）不允许合并，避免包围盒吞掉未选区域
  if (!tilesBox(rects, box)) {
    return {ok: false, notRectangular: true};
  }
  //迭代扩展：与包围盒相交的合并区域整体并入，直至稳定（处理嵌套/相邻合并扩散）
  let changed = true;
  while (changed) {
    changed = false;
    eachMergeOrigin(elements, (_r, _c, rect) => {
      if (intersects(rect, box)) {
        const next = unionRect(box, rect);
        if (!sameRect(next, box)) {
          box = next;
          changed = true;
        }
      }
    });
  }
  const height = box.r2 - box.r1 + 1;
  const width = box.c2 - box.c1 + 1;
  if (height <= 1 && width <= 1) {
    //单个未合并单元格，无事可做
    return {ok: false};
  }
  for (let r = box.r1; r <= box.r2; r++) {
    const columns = elements[r]?.columns ?? [];
    for (let c = box.c1; c <= box.c2; c++) {
      const col = columns[c];
      if (!col) {
        continue;
      }
      if (r === box.r1 && c === box.c1) {
        col.rowspan = height;
        col.colspan = width;
        col.cellVisible = true;
      } else {
        col.cellVisible = false;
      }
    }
  }
  return {ok: true, rows: height, cols: width};
};

/**
 * 框选拆分单元格：把与选中区域相交的所有合并单元格还原为 1x1
 * （区域内全部 cellVisible=true、rowspan/colspan=1，与现有 resetMerge 语义一致）。
 */
export const splitRegionByCells = (
  elements: Array<any>,
  cells: Array<RegionCell>,
): {ok: boolean; count: number} => {
  const rects = cells
    .map((c) => cellRect(elements, c))
    .filter((r): r is Rect => !!r);
  if (rects.length === 0) {
    return {ok: false, count: 0};
  }
  //收集与选中区域相交的合并原点（先收集再还原，避免还原过程中矩形判断失真）
  const origins: Array<Rect> = [];
  eachMergeOrigin(elements, (_r, _c, rect) => {
    if (rects.some((sel) => intersects(rect, sel))) {
      origins.push(rect);
    }
  });
  if (origins.length === 0) {
    return {ok: false, count: 0};
  }
  origins.forEach((rect) => {
    for (let r = rect.r1; r <= rect.r2; r++) {
      const columns = elements[r]?.columns ?? [];
      for (let c = rect.c1; c <= rect.c2; c++) {
        const col = columns[c];
        if (!col) {
          continue;
        }
        col.cellVisible = true;
        col.colspan = 1;
        col.rowspan = 1;
      }
    }
  });
  return {ok: true, count: origins.length};
};

/**
 * 框选删除区域内组件：清空选中格子占位矩形内所有格子（含被合并隐藏的格子）的
 * column.items，返回删除的组件总数与被删组件 id 列表（供调用方清理选中态）。
 */
export const clearRegionItems = (
  elements: Array<any>,
  cells: Array<RegionCell>,
): {ok: boolean; count: number; removedIds: Array<string>} => {
  const rects = cells
    .map((c) => cellRect(elements, c))
    .filter((r): r is Rect => !!r);
  const removedIds: Array<string> = [];
  const visited = new Set<string>();
  rects.forEach((rect) => {
    for (let r = rect.r1; r <= rect.r2; r++) {
      const columns = elements[r]?.columns ?? [];
      for (let c = rect.c1; c <= rect.c2; c++) {
        const key = r + "," + c;
        if (visited.has(key)) {
          continue;
        }
        visited.add(key);
        const col = columns[c];
        if (!col || !Array.isArray(col.items) || col.items.length === 0) {
          continue;
        }
        col.items.forEach((item: any) => {
          removedIds.push(item?.preps?.id || item?.id || "");
        });
        col.items = [];
      }
    }
  });
  return {ok: removedIds.length > 0, count: removedIds.length, removedIds};
};

/**
 * box 容器框选合并单元格：box 无 rowspan，仅支持同一行内连续列合并。
 * 语义与现有 mergeLeftCol(box)/mergeWholeRow 一致——首列 colspan 累加其余列的
 * colspan，其余列从 columns 中 splice 移除（box 合并即销毁列，拆分时等分还原）。
 */
export const mergeBoxRegionByCells = (
  elements: Array<any>,
  cells: Array<RegionCell>,
): RegionResult => {
  if (cells.length === 0) {
    return {ok: false};
  }
  //box 不支持跨行合并
  const rowSet = new Set(cells.map((c) => c.row));
  if (rowSet.size > 1) {
    return {ok: false, crossRow: true};
  }
  const rowIndex = cells[0].row;
  const columns = elements[rowIndex]?.columns ?? [];
  const cols = [...new Set(cells.map((c) => c.col))].sort((a, b) => a - b);
  //必须同行连续列（有间隙时按包围合并会吞掉中间未选列，拒绝）
  for (let i = 1; i < cols.length; i++) {
    if (cols[i] !== cols[i - 1] + 1) {
      return {ok: false, notContiguous: true};
    }
  }
  if (cols.length < 2) {
    //单列（或列不存在）无合并意义
    return {ok: false};
  }
  const first = columns[cols[0]];
  if (!first) {
    return {ok: false};
  }
  let total = 0;
  cols.forEach((c) => {
    total += columns[c]?.colspan || 1;
  });
  first.colspan = total;
  //从右往左 splice 移除被合并列，避免索引位移
  for (let i = cols.length - 1; i >= 1; i--) {
    columns.splice(cols[i], 1);
  }
  return {ok: true, cols: total};
};

/**
 * box 容器框选拆分单元格：colspan>1 的格子还原为 colspan 个 colspan=1 的列
 * （与 undoMergeCol(box) 的插列还原方向一致；box 合并时原列已销毁，等分还原）。
 * 同行多个待拆分格按列索引降序处理，避免插列影响右侧索引。
 */
export const splitBoxRegionByCells = (
  elements: Array<any>,
  cells: Array<RegionCell>,
): RegionResult => {
  //按行分组，组内列索引降序
  const byRow = new Map<number, Array<number>>();
  cells.forEach((c) => {
    const list = byRow.get(c.row) ?? [];
    list.push(c.col);
    byRow.set(c.row, list);
  });
  let count = 0;
  byRow.forEach((cols, rowIndex) => {
    [...new Set(cols)]
      .sort((a, b) => b - a)
      .forEach((colIndex) => {
        const col = elements[rowIndex]?.columns?.[colIndex];
        if (!col || (col.colspan || 1) <= 1) {
          return;
        }
        const colspan = col.colspan || 1;
        const newCols = [];
        for (let i = 0; i < colspan; i++) {
          newCols.push({
            id: uuid(),
            colspan: 1,
            items: [],
            cellVisible: true,
          });
        }
        elements[rowIndex].columns.splice(colIndex, 1, ...newCols);
        count++;
      });
  });
  return {ok: count > 0, count};
};
