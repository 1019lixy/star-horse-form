import {warning} from "star-horse-lowcode";
import {i18n} from "@/lang";

/**
 * 单元格框选器（Excel 式 rubber band）：
 * 设计态在 box/dytable/gridtable 容器上拖拽框选单元格，自动计算选中的行列。
 * 依赖单元格 DOM 标记：data-cell-id / data-row-index / data-col-index（由 box-col/dytable-col/gridtable-col 提供），
 * 以及容器根标记 data-container-id（由 group-container 提供）。框选范围限定在目标容器内：
 * 只收集"最近的 data-container-id 祖先即目标容器"的单元格，嵌套容器（单元格里的子容器）互不影响。
 * 连续模式（continuous）：单次框选，松开鼠标即结束并回调命中行列。
 * 非连续模式（discrete）：按单元格精确记忆（Excel 语义，每次框选只累积自己覆盖的格子），
 * 按住 Ctrl 多次框选累积（不按 Ctrl 为重选），点击"完成"结束。
 * 操作模式（action）：与非连续相同的累积选择，提示条展示调用方自定义的操作按钮
 * （如合并单元格/拆分单元格/删除区域组件），点击操作后结束框选并回调 onAction。
 */
export interface RubberBandCell {
  //行下标（0-based）
  row: number;
  //列下标（0-based）
  col: number;
}

export interface RubberBandAction {
  //操作标识，回调中原样返回
  key: string;
  //按钮文案
  label: string;
  //图标名（内置图标库：merge/split/trash/plus/edit/check/close）
  icon?: string;
  //是否主按钮样式
  primary?: boolean;
}

export interface RubberBandOptions {
  //目标容器 id（data-container-id）
  containerId: string;
  //continuous：单次框选即完成；discrete：Ctrl 多次框选累积；action：累积选择 + 自定义操作按钮
  mode: "continuous" | "discrete" | "action";
  //非连续模式带入的已选单元格（0-based），继续累积
  initialCells?: Array<RubberBandCell>;
  //操作模式的按钮列表（action 模式必填）
  actions?: Array<RubberBandAction>;
  //框选完成回调（continuous/discrete）：rows/cols 为去重后的行列集合，cells 为精确选中的单元格（均 0-based）
  onFinish?: (
    rows: Array<number>,
    cols: Array<number>,
    cells: Array<RubberBandCell>,
  ) => void;
  //操作模式点击操作按钮回调：cells 为当前累积选中的单元格（0-based），回调前框选已结束
  onAction?: (key: string, cells: Array<RubberBandCell>) => void;
  //取消回调（Esc 或提示条"取消"按钮）
  onCancel?: () => void;
}

interface CellEntry {
  el: HTMLElement;
  row: number;
  col: number;
  key: string;
}

const ACTIVE_CLS = "rubber-band-cell-active";
const STYLE_ID = "cell-rubber-band-style";

/**
 * 内置 SVG 图标库（14px 线性风格，stroke/fill 使用 currentColor 随文字变色）：
 * merge 合并（双箭头向内汇聚）、split 拆分（双箭头向外分离）、trash 删除（垃圾桶）、
 * plus 添加组件（方框加号）、edit 批量编辑属性（滑杆）、check 完成（对勾）、close 取消（叉）。
 */
const ICON_LIB: Record<string, string> = {
  merge:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="2.5" width="13" height="11" rx="1.2"/><path d="M4.2 8h2.4M11.8 8H9.4M6.6 8l-1-1M6.6 8l-1 1M9.4 8l1-1M9.4 8l1 1"/></svg>',
  split:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="2.5" width="13" height="11" rx="1.2"/><path d="M8 2.5v11" stroke-dasharray="2 1.6"/><path d="M3.2 8h2.4M12.8 8h-2.4M6 8l1-1M6 8l1 1M10 8l-1-1M10 8l-1 1"/></svg>',
  trash:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4.5h11M6.5 4.5V3h3v1.5M4.5 4.5l.6 9h5.8l.6-9M6.8 7.5v3.5M9.2 7.5v3.5"/></svg>',
  plus:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/><path d="M8 4.8v6.4M4.8 8h6.4"/></svg>',
  edit:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M2 4h12M2 8h12M2 12h12"/><circle cx="10.5" cy="4" r="1.6" fill="#fff"/><circle cx="5" cy="8" r="1.6" fill="#fff"/><circle cx="11.5" cy="12" r="1.6" fill="#fff"/></svg>',
  check:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8.5l3.5 3.5L13 4.5"/></svg>',
  close:
    '<svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>',
};

export class CellRubberBand {
  private static active: CellRubberBand | null = null;
  private opts: RubberBandOptions;
  private cells: Array<CellEntry> = [];
  private overlay: HTMLElement | null = null;
  private tipBar: HTMLElement | null = null;
  private box: HTMLElement | null = null;
  private dragging = false;
  private ctrlDrag = false;
  private startX = 0;
  private startY = 0;
  //已选单元格（key 为 "row,col"，0-based）：非连续/操作模式按格子精确记忆，
  //避免行/列并集做笛卡尔积导致不同批次框选的行列交叉扩散
  private selected = new Set<string>();
  private finished = false;

  private constructor(opts: RubberBandOptions) {
    this.opts = opts;
  }

  /**注入全局样式（选框/高亮/提示条），仅注入一次*/
  private static injectStyle() {
    if (document.getElementById(STYLE_ID)) {
      return;
    }
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      ".rubber-band-overlay{position:fixed;inset:0;z-index:9998;cursor:crosshair;user-select:none;-webkit-user-select:none;background:transparent;}",
      ".rubber-band-box{position:fixed;z-index:9999;pointer-events:none;border:1px solid #409eff;background:rgba(64,158,255,.12);box-sizing:border-box;}",
      `.${ACTIVE_CLS}{outline:2px solid #409eff !important;outline-offset:-2px;background:rgba(64,158,255,.18) !important;position:relative;}`,
      /*提示条锚定视口顶部居中（框选操作工具栏），已选单元格描述显示在工具栏行下方，
        不与工具栏同行、不撑宽工具栏 */
      ".rubber-band-tip{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;flex-direction:column;gap:6px;padding:8px 12px;background:#fff;border:1px solid #e4e7ed;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.12);font-size:13px;color:#303133;user-select:none;pointer-events:none;box-sizing:border-box;max-width:86vw;}",
      ".rubber-band-tip .rb-text{color:#606266;font-size:12px;line-height:1.6;width:100%;}",
      ".rubber-band-tip .rb-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;}",
      ".rubber-band-tip .rb-desc{border-top:1px dashed #ebeef5;padding-top:6px;color:#909399;font-size:12px;line-height:1.6;}",
      ".rubber-band-tip .rbtn{pointer-events:auto;cursor:pointer;display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:4px;border:1px solid #dcdfe6;background:#fff;font-size:12px;line-height:20px;white-space:nowrap;color:#606266;}",
      ".rubber-band-tip .rbtn .ricon{display:inline-flex;align-items:center;}",
      ".rubber-band-tip .rbtn-ok{background:#409eff;border-color:#409eff;color:#fff;}",
      ".rubber-band-tip .rbtn:hover{opacity:.85;}",
      ".rubber-band-tip .rinfo{color:#909399;font-size:12px;}",
    ].join("\n");
    document.head.appendChild(style);
  }

  /**
   * 启动框选；若已有活动实例先取消。返回是否成功启动（容器 DOM 找不到时返回 false）。
   */
  static start(opts: RubberBandOptions): boolean {
    if (CellRubberBand.active) {
      CellRubberBand.active.cancel();
    }
    const root = document.querySelector(
      `[data-container-id="${opts.containerId}"]`,
    );
    if (!root) {
      return false;
    }
    CellRubberBand.injectStyle();
    const instance = new CellRubberBand(opts);
    CellRubberBand.active = instance;
    instance.run(root as HTMLElement);
    return true;
  }

  /**取消当前框选（若无活动实例则忽略）*/
  static cancelActive() {
    CellRubberBand.active?.cancel();
  }

  /**收集属于目标容器的单元格：向上找到最近的 data-container-id 祖先必须就是目标容器，
   * 从而排除嵌套在单元格内的子容器（其行列坐标相对于子容器，不属于本容器）*/
  private collectCells(root: HTMLElement): Array<CellEntry> {
    const containerId = root.getAttribute("data-container-id");
    return Array.from(
      root.querySelectorAll<HTMLElement>("[data-cell-id]"),
    )
      .filter((el) => {
        let p = el.parentElement;
        while (p && p !== document.body) {
          const cid = p.getAttribute?.("data-container-id");
          if (cid) {
            return cid === containerId;
          }
          p = p.parentElement;
        }
        return false;
      })
      .map((el) => {
        const row = parseInt(el.dataset.rowIndex || "-1");
        const col = parseInt(el.dataset.colIndex || "-1");
        return {el, row, col, key: row + "," + col};
      });
  }

  private run(root: HTMLElement) {
    this.cells = this.collectCells(root);
    this.selected = new Set(
      (this.opts.initialCells ?? []).map((c) => c.row + "," + c.col),
    );
    this.buildOverlay();
    this.buildTipBar();
    document.addEventListener("keydown", this.onKeyDown, true);
    if (this.opts.mode !== "continuous") {
      //回显已有选择的单元格高亮
      this.highlightSelected();
    }
  }

  private buildOverlay() {
    const overlay = document.createElement("div");
    overlay.className = "rubber-band-overlay";
    overlay.addEventListener("mousedown", this.onMouseDown);
    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  /**
   * 构建提示条：视口顶部居中。工具栏行 = 操作说明 + 操作按钮（带图标）；
   * 已选单元格描述（rb-desc）独立显示在工具栏行下方，不与按钮同行、不撑宽工具栏。
   */
  private buildTipBar() {
    const bar = document.createElement("div");
    bar.className = "rubber-band-tip";
    //工具栏行：操作说明 + 按钮
    const row = document.createElement("div");
    row.className = "rb-row";
    const text = document.createElement("span");
    text.className = "rb-text";
    text.textContent =
      this.opts.mode === "continuous"
        ? i18n("dyform.container.rubberContinuousTip")
        : this.opts.mode === "action"
          ? i18n("dyform.container.rubberActionTip")
          : i18n("dyform.container.rubberDiscreteTip");
    row.appendChild(text);
    if (this.opts.mode === "action") {
      //操作模式：渲染调用方自定义的操作按钮，点击后结束框选并回调
      (this.opts.actions ?? []).forEach((action) => {
        row.appendChild(
          this.buildBtn(
            action.label,
            action.icon,
            action.primary ? "rbtn rbtn-ok" : "rbtn",
            () => this.runAction(action.key),
          ),
        );
      });
    } else if (this.opts.mode === "discrete") {
      row.appendChild(
        this.buildBtn(
          i18n("dyform.container.rubberDone"),
          "check",
          "rbtn rbtn-ok",
          () => this.finish(),
        ),
      );
    }
    row.appendChild(
      this.buildBtn(i18n("dyform.container.rubberCancel"), "close", "rbtn", () =>
        this.cancel(),
      ),
    );
    bar.appendChild(row);
    //描述行：已选单元格统计（显示在工具栏行下方）
    if (this.opts.mode !== "continuous") {
      const info = document.createElement("div");
      info.className = "rb-desc";
      this.renderInfo(info);
      bar.appendChild(info);
      (bar as any).__info__ = info;
    }
    document.body.appendChild(bar);
    this.tipBar = bar;
  }

  /**构建带图标的操作按钮（图标取自内置图标库）*/
  private buildBtn(
    label: string,
    icon: string | undefined,
    cls: string,
    onClick: () => void,
  ) {
    const btn = document.createElement("span");
    btn.className = cls;
    if (icon && ICON_LIB[icon]) {
      const ic = document.createElement("span");
      ic.className = "ricon";
      ic.innerHTML = ICON_LIB[icon];
      btn.appendChild(ic);
    }
    btn.appendChild(document.createTextNode(label));
    btn.addEventListener("mousedown", (e) => e.stopPropagation());
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      onClick();
    });
    return btn;
  }

  /**更新提示条中的已选单元格统计（内部 0-based，展示 +1），按行分组精确显示*/
  private renderInfo(info: HTMLElement) {
    const byRow = new Map<number, Array<number>>();
    this.selected.forEach((k) => {
      const [r, c] = k.split(",").map(Number);
      const cols = byRow.get(r) ?? [];
      cols.push(c);
      byRow.set(r, cols);
    });
    const parts = [...byRow.keys()]
      .sort((a, b) => a - b)
      .map((r) => {
        const cols = [...new Set(byRow.get(r))]
          .sort((a, b) => a - b)
          .map((c) => c + 1)
          .join(",");
        return `${i18n("dyform.container.rubberRowShort")}${r + 1}: ${i18n("dyform.container.rubberColShort")}${cols}`;
      });
    const label = i18n("dyform.container.rubberCellSummary");
    info.textContent = parts.length
      ? `${label}: ${this.selected.size}（${parts.join("; ")}）`
      : `${label}: 0`;
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      this.cancel();
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) {
      return;
    }
    e.preventDefault();
    this.dragging = true;
    this.startX = e.clientX;
    this.startY = e.clientY;
    //记录本次拖拽是否按住 Ctrl（Excel 语义：Ctrl 追加，普通拖拽重选）
    this.ctrlDrag = e.ctrlKey || e.metaKey;
    const box = document.createElement("div");
    box.className = "rubber-band-box";
    document.body.appendChild(box);
    this.box = box;
    this.updateBox(e.clientX, e.clientY);
    document.addEventListener("mousemove", this.onMouseMove);
    document.addEventListener("mouseup", this.onMouseUp);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.dragging) {
      return;
    }
    this.updateBox(e.clientX, e.clientY);
    const hits = this.hitCells(this.currentRect(e.clientX, e.clientY));
    const hitKeys = new Set(hits.map((h) => h.key));
    //拖拽中高亮 = 已累积格子 ∪ 当前选框命中格子
    this.cells.forEach(({el, key}) => {
      el.classList.toggle(
        ACTIVE_CLS,
        hitKeys.has(key) || this.selected.has(key),
      );
    });
  };

  private onMouseUp = (e: MouseEvent) => {
    if (!this.dragging) {
      return;
    }
    this.dragging = false;
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    this.box?.remove();
    this.box = null;
    const hits = this.hitCells(this.currentRect(e.clientX, e.clientY));
    if (this.opts.mode === "continuous") {
      if (hits.length === 0) {
        //空选择视为取消
        this.cancel();
        return;
      }
      this.finishWith(hits);
      return;
    }
    //非连续/操作模式：空选择忽略；Ctrl 或首次为追加，普通拖拽为重选
    if (hits.length > 0) {
      if (!this.ctrlDrag && this.selected.size > 0) {
        this.selected.clear();
      }
      hits.forEach((h) => this.selected.add(h.key));
      this.highlightSelected();
      const info = (this.tipBar as any)?.__info__;
      if (info) {
        this.renderInfo(info);
      }
    }
  };

  /**矩形与单元格相交：交集面积须超过单元格自身面积的一半才算选中（防止拖拽路径擦边误选）*/
  private hitCells(rect: {x1: number; y1: number; x2: number; y2: number}) {
    const left = Math.min(rect.x1, rect.x2);
    const right = Math.max(rect.x1, rect.x2);
    const top = Math.min(rect.y1, rect.y2);
    const bottom = Math.max(rect.y1, rect.y2);
    return this.cells.filter(({el}) => {
      const r = el.getBoundingClientRect();
      const overlapW = Math.min(right, r.right) - Math.max(left, r.left);
      const overlapH = Math.min(bottom, r.bottom) - Math.max(top, r.top);
      if (overlapW <= 0 || overlapH <= 0) {
        return false;
      }
      //交集面积 > 单元格面积一半：拖拽中选框掠过的边缘单元格不再被误选
      return overlapW * overlapH > (r.width * r.height) / 2;
    });
  }

  private highlightSelected() {
    this.cells.forEach(({el, key}) => {
      el.classList.toggle(ACTIVE_CLS, this.selected.has(key));
    });
  }

  private currentRect(x: number, y: number) {
    return {x1: this.startX, y1: this.startY, x2: x, y2: y};
  }

  private updateBox(x: number, y: number) {
    if (!this.box) {
      return;
    }
    const left = Math.min(this.startX, x);
    const top = Math.min(this.startY, y);
    this.box.style.left = `${left}px`;
    this.box.style.top = `${top}px`;
    this.box.style.width = `${Math.abs(x - this.startX)}px`;
    this.box.style.height = `${Math.abs(y - this.startY)}px`;
  }

  /**操作模式：执行指定操作（先结束框选再回调，操作可能引起 DOM 结构变化）*/
  private runAction(key: string) {
    if (this.selected.size === 0) {
      warning(i18n("dyform.container.rubberNoSelection"));
      return;
    }
    //必须在 cleanup 之前取出累积结果（cleanup 会清空 selected）
    const result = this.extractResult([...this.selected]);
    this.cleanup();
    this.opts.onAction?.(key, result.cells);
  }

  /**非连续模式点击"完成"*/
  private finish() {
    if (this.selected.size === 0) {
      warning(i18n("dyform.container.rubberNoSelection"));
      return;
    }
    //必须在 cleanup 之前取出累积结果（cleanup 会清空 selected）
    const result = this.extractResult([...this.selected]);
    this.cleanup();
    this.opts.onFinish?.(result.rows, result.cols, result.cells);
  }

  private finishWith(hits: Array<CellEntry>) {
    const result = this.extractResult(hits.map((h) => h.key));
    this.cleanup();
    this.opts.onFinish?.(result.rows, result.cols, result.cells);
  }

  /**由选中的格子 key 集合提取行列集合与精确单元格列表*/
  private extractResult(keys: Array<string>) {
    const cells = keys.map((k) => {
      const [row, col] = k.split(",").map(Number);
      return {row, col};
    });
    return {
      cells,
      rows: [...new Set(cells.map((c) => c.row))],
      cols: [...new Set(cells.map((c) => c.col))],
    };
  }

  private cancel() {
    if (this.finished) {
      return;
    }
    this.cleanup();
    this.opts.onCancel?.();
  }

  private cleanup() {
    this.finished = true;
    if (CellRubberBand.active === this) {
      CellRubberBand.active = null;
    }
    document.removeEventListener("keydown", this.onKeyDown, true);
    document.removeEventListener("mousemove", this.onMouseMove);
    document.removeEventListener("mouseup", this.onMouseUp);
    this.cells.forEach(({el}) => el.classList.remove(ACTIVE_CLS));
    this.box?.remove();
    this.box = null;
    this.overlay?.remove();
    this.overlay = null;
    this.tipBar?.remove();
    this.tipBar = null;
    this.cells = [];
    this.selected.clear();
  }
}
