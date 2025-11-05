// 延迟计算国际化内容实现示例

import { i18n, loadLanguage, currentLang, onLanguageChange } from "@/lang";

/**
 * 方式一：基础函数形式导出配置
 * 适用于简单的配置对象
 */
// 错误写法：模块导入时立即计算
export const badConfig = {
  label: i18n("system.flexbox.container.display"),
  options: [
    { value: "flex", label: i18n("system.flexbox.container.flex") },
    { value: "block", label: i18n("system.flexbox.container.block") }
  ]
};

// 正确写法：函数形式延迟计算
export const getGoodConfig = () => ({
  label: i18n("system.flexbox.container.display"),
  options: [
    { value: "flex", label: i18n("system.flexbox.container.flex") },
    { value: "block", label: i18n("system.flexbox.container.block") }
  ]
});

// 保留原有的导出名称，确保向后兼容
export const goodConfig = {};

/**
 * 方式二：国际化配置工厂类
 * 适用于复杂的配置管理
 */
export class I18nConfigFactory {
  // 缓存配置对象
  private static configCache: Map<string, any> = new Map();
  
  /**
   * 获取容器配置
   */
  static getContainerConfig() {
    const cacheKey = 'containerConfig';
    
    // 如果有缓存且语言没有变化，直接返回缓存
    if (this.configCache.has(cacheKey)) {
      return this.configCache.get(cacheKey);
    }
    
    // 创建新的配置对象
    const config = {
      label: i18n("system.flexbox.container.title"),
      properties: {
        display: {
          label: i18n("system.flexbox.container.display"),
          type: "select",
          options: [
            { value: "flex", label: i18n("system.flexbox.container.flex") },
            { value: "block", label: i18n("system.flexbox.container.block") }
          ]
        },
        flexDirection: {
          label: i18n("system.flexbox.container.flexDirection"),
          type: "select",
          options: [
            { value: "row", label: i18n("system.flexbox.container.row") },
            { value: "column", label: i18n("system.flexbox.container.column") }
          ]
        }
      }
    };
    
    // 缓存配置
    this.configCache.set(cacheKey, config);
    return config;
  }
  
  /**
   * 清除缓存
   * 在语言变化时调用
   */
  static clearCache() {
    this.configCache.clear();
  }
}

/**
 * 方式三：Vue响应式适配
 * 适用于Vue组件中使用
 */
export function createReactiveI18nConfig<T extends () => any>(configFactory: T) {
  // 初始值
  let config = configFactory();
  
  // 注册语言变化监听
  const unregister = onLanguageChange(() => {
    config = configFactory();
  });
  
  return {
    get config() {
      return config;
    },
    // 清理函数
    cleanup: unregister
  };
}

/**
 * 工具函数：确保在国际化加载完成后执行
 */
export async function ensureI18nReady<T>(callback: () => T): Promise<T> {
  // 确保语言包已加载
  await loadLanguage(currentLang);
  return callback();
}

/**
 * 工具函数：创建国际化感知的配置对象
 */
export function createI18nAwareConfig<T extends object>(configFactory: () => T): {
  getConfig: () => T;
  registerChangeListener: () => () => void;
} {
  return {
    // 获取配置的函数
    getConfig: configFactory,
    
    // 注册语言变化监听器的函数
    registerChangeListener: () => {
      return onLanguageChange(() => {
        // 语言变化时可以在这里添加额外的处理逻辑
        console.log('Language changed, config should be refreshed');
      });
    }
  };
}

// 使用示例：在组件中
export async function setupComponentConfig() {
  // 方式1：直接使用函数
  await loadLanguage(currentLang);
  const config1 = getGoodConfig();
  
  // 方式2：使用工厂类
  const config2 = I18nConfigFactory.getContainerConfig();
  
  // 方式3：创建响应式配置
  const reactiveConfig = createReactiveI18nConfig(getGoodConfig);
  
  // 方式4：使用工具函数
  const config4 = await ensureI18nReady(() => getGoodConfig());
  
  // 清理函数（在组件卸载时调用）
  return () => {
    reactiveConfig.cleanup();
  };
}

// 语言变化时清除工厂类缓存
onLanguageChange(() => {
  I18nConfigFactory.clearCache();
});

// 导出默认的实用工具
export default {
  createReactiveI18nConfig,
  ensureI18nReady,
  createI18nAwareConfig,
  I18nConfigFactory
};

/**
 * 实战案例1：Vue3组件中使用延迟计算国际化
 */
/*
// 在Vue组件中使用的示例代码
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { getGoodConfig, ensureI18nReady, createReactiveI18nConfig } from './延迟计算国际化实现示例';

// 方法1：使用ref和生命周期钩子
const componentConfig = ref({});
let cleanupFunction: (() => void) | null = null;

onMounted(async () => {
  // 确保国际化加载完成后获取配置
  componentConfig.value = await ensureI18nReady(() => getGoodConfig());
  
  // 创建响应式配置
  const reactiveConfig = createReactiveI18nConfig(getGoodConfig);
  componentConfig.value = reactiveConfig.config;
  cleanupFunction = reactiveConfig.cleanup;
});

onUnmounted(() => {
  // 清理
  if (cleanupFunction) {
    cleanupFunction();
  }
});
</script>

<template>
  <div>
    <h2>{{ componentConfig.label }}</h2>
    <select>
      <option v-for="option in componentConfig.options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>
*/

/**
 * 实战案例2：复杂配置文件改造
 */
/*
// 改造前的复杂配置文件
import { i18n } from "@/lang";

export const complexConfig = {
  sections: [
    {
      title: i18n("system.section1.title"),
      description: i18n("system.section1.description"),
      fields: [
        {
          name: "field1",
          label: i18n("system.section1.field1.label"),
          help: i18n("system.section1.field1.help")
        },
        {
          name: "field2",
          label: i18n("system.section1.field2.label"),
          help: i18n("system.section1.field2.help")
        }
      ]
    },
    {
      title: i18n("system.section2.title"),
      description: i18n("system.section2.description"),
      fields: [
        {
          name: "field3",
          label: i18n("system.section2.field3.label"),
          help: i18n("system.section2.field3.help")
        }
      ]
    }
  ]
};

// 改造后的复杂配置文件
import { i18n } from "@/lang";

export const getComplexConfig = () => ({
  sections: [
    {
      title: i18n("system.section1.title"),
      description: i18n("system.section1.description"),
      fields: [
        {
          name: "field1",
          label: i18n("system.section1.field1.label"),
          help: i18n("system.section1.field1.help")
        },
        {
          name: "field2",
          label: i18n("system.section1.field2.label"),
          help: i18n("system.section1.field2.help")
        }
      ]
    },
    {
      title: i18n("system.section2.title"),
      description: i18n("system.section2.description"),
      fields: [
        {
          name: "field3",
          label: i18n("system.section2.field3.label"),
          help: i18n("system.section2.field3.help")
        }
      ]
    }
  ]
});

// 保留原有导出，确保向后兼容
export const complexConfig = {};
*/

/**
 * 最佳实践总结
 */
/*
1. 对于所有包含国际化内容的配置，都使用函数形式导出
2. 确保在使用配置前，国际化语言包已经加载完成
3. 在Vue组件中，使用响应式数据和生命周期钩子管理配置
4. 监听语言变化，及时更新配置内容
5. 保留原有的导出名称，确保向后兼容性
6. 对于复杂配置，可以使用工厂类或工具函数进行管理
*/