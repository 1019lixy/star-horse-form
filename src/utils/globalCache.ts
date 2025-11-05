/**
 * 全局缓存工具
 * 用于缓存计算密集型操作的结果，避免重复计算
 */

interface CacheEntry {
  value: any;
  timestamp: number;
  size: number;
}

/**
 * 全局缓存管理器
 */
export class GlobalCache {
  private cache: Map<string, CacheEntry> = new Map();
  private maxSize: number;
  private maxAge: number;

  /**
   * 构造函数
   * @param maxSize 缓存最大大小(KB)
   * @param maxAge 缓存最大存活时间(ms)
   */
  constructor(maxSize: number = 1024, maxAge: number = 3600000) {
    this.maxSize = maxSize * 1024; // 转换为字节
    this.maxAge = maxAge;
    this.cleanupInterval();
  }

  /**
   * 设置缓存项
   * @param key 缓存键
   * @param value 缓存值
   */
  set(key: string, value: any): void {
    try {
      // 计算缓存项大小
      const serialized = JSON.stringify(value);
      const size = new Blob([serialized]).size;

      // 检查是否超过最大大小
      if (size > this.maxSize) {
        console.warn(`缓存项超过最大大小限制: ${key}`);
        return;
      }

      // 检查总缓存大小
      this.ensureCapacity(size);

      this.cache.set(key, {
        value,
        timestamp: Date.now(),
        size,
      });
    } catch (e) {
      console.error(`设置缓存失败: ${key}`, e);
    }
  }

  /**
   * 获取缓存项
   * @param key 缓存键
   * @returns 缓存值，如果不存在则返回undefined
   */
  get(key: string): any | undefined {
    const entry = this.cache.get(key);
    if (!entry) {
      return undefined;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.value;
  }

  /**
   * 删除缓存项
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 确保缓存容量
   * @param requiredSize 需要的大小
   */
  private ensureCapacity(requiredSize: number): void {
    let currentSize = 0;
    const entries = Array.from(this.cache.entries());

    // 计算当前总大小
    for (const [, entry] of entries) {
      currentSize += entry.size;
    }

    // 如果加上新项后超过最大大小，则删除最旧的项
    if (currentSize + requiredSize > this.maxSize) {
      // 按时间戳排序
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);

      // 删除旧项直到有足够空间
      while (entries.length > 0 && currentSize + requiredSize > this.maxSize) {
        const oldest = entries.shift();
        if (oldest) {
          this.cache.delete(oldest[0]);
          currentSize -= oldest[1].size;
        }
      }
    }
  }

  /**
   * 设置定期清理过期项的定时器
   */
  private cleanupInterval(): void {
    // 每5分钟清理一次过期项
    setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.cache.entries()) {
        if (now - entry.timestamp > this.maxAge) {
          this.cache.delete(key);
        }
      }
    }, 300000);
  }
}

// 创建全局缓存实例
export const formFieldCache = new GlobalCache(512, 1800000); // 512KB缓存，30分钟过期
export const jsonParseCache = new GlobalCache(256, 600000); // 256KB缓存，10分钟过期
export const iconDataCache = new GlobalCache(128, 3600000); // 128KB缓存，1小时过期
