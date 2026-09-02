/**
 * 统一调试日志工具。
 *
 * 全项目调试日志统一通过本模块输出，避免散落的 console.log/warn/error/info。
 * 通过 {@link setDebugEnabled} 统一开关，关闭时所有调试日志静默（生产环境零开销）。
 *
 * 使用方式：
 * ```ts
 * import { dlog, dwarn, derror, dinfo } from "@/utils/debugLog";
 * dlog("FlowDesign init", node);     // 等价 console.log("[debug]", ...)
 * derror("save failed", err);        // 等价 console.error("[debug]", ...)
 * ```
 *
 * 统一开关：
 * ```ts
 * import { setDebugEnabled } from "@/utils/debugLog";
 * setDebugEnabled(true);   // 打开（开发环境）
 * setDebugEnabled(false);  // 关闭（生产环境，默认）
 * ```
 *
 * 也可通过 `window._isDebug_ = true` 联动（与既有全局调试开关对齐）。
 */

/** 模块级开关：默认关闭，生产环境不输出任何调试日志 */
let debugEnabled: boolean = false;

/**
 * 设置调试日志开关。
 * @param on 是否开启
 */
export const setDebugEnabled = (on: boolean): void => {
  debugEnabled = on;
  if (on && typeof window !== "undefined") {
    (window as any)._isDebug_ = true;
  }
};

/** 查询当前调试日志是否开启 */
export const isDebugEnabled = (): boolean => {
  if (debugEnabled) return true;
  if (typeof window !== "undefined" && (window as any)._isDebug_) return true;
  return false;
};

/** 调试日志（等价 console.log，带 [debug] 前缀） */
export const dlog = (...args: unknown[]): void => {
  if (isDebugEnabled()) console.log("[debug]", ...args);
};

/** 调试警告（等价 console.warn，带 [debug] 前缀） */
export const dwarn = (...args: unknown[]): void => {
  if (isDebugEnabled()) console.warn("[debug]", ...args);
};

/** 调试错误（等价 console.error，带 [debug] 前缀） */
export const derror = (...args: unknown[]): void => {
  if (isDebugEnabled()) console.error("[debug]", ...args);
};

/** 调试信息（等价 console.info，带 [debug] 前缀） */
export const dinfo = (...args: unknown[]): void => {
  if (isDebugEnabled()) console.info("[debug]", ...args);
};

/** 调试分组日志（等价 console.groupCollapsed / console.groupEnd） */
export const dgroup = (label: string, fn: () => void): void => {
  if (!isDebugEnabled()) return;
  console.groupCollapsed(`[debug] ${label}`);
  try {
    fn();
  } finally {
    console.groupEnd();
  }
};