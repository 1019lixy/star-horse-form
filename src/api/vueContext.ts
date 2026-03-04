// src/utils/vueContext.ts
import type { AppContext } from "vue";

// 上下文存储（支持多实例）
const contextMap = new Map<string, AppContext>();

/**
 * 注册Vue上下文
 * @param key 上下文标识
 * @param context 应用上下文
 */
export function registerVueContext(key: string, context: AppContext) {
  contextMap.set(key, context);
}

/**
 * 获取Vue上下文
 * @param key 上下文标识
 * @returns 应用上下文
 */
export function getVueContext(key: string): AppContext | undefined {
  return contextMap.get(key);
}
