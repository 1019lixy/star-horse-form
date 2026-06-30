<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import {i18n} from "@/lang";
import {SelectOption} from "star-horse-lowcode";
import {FormConfig} from "@/components/types";
import LinkPolicyComp from "@/components/system/items/utils/LinkPolicyComp.vue";
import DataSourceComp from "@/components/system/items/utils/DataSourceComp.vue";
import {
  PreOrPendEventConfig,
  preOrPendEventTypeOptions,
} from "@/components/system/items/form/composables/usePreOrPendEvent";
import {compressJs, formatJs, userOperationMsg} from "@/components/system/items/utils/jsCodeFormatter";

defineOptions({name: "PreOrPendEventDialog"});

const props = defineProps<{
  visible: boolean;
  /** 当前组件的 formProps */
  formProps: any;
  /** 当前组件类型 */
  itemType: string;
  /** 当前事件配置 */
  eventConfig: PreOrPendEventConfig;
  /** 当前按钮标题（用于对话框标题展示） */
  buttonTitle?: string;
  /** 数组型插槽的索引 */
  index?: number;
  /** 表单字段列表（联动策略使用） */
  formFields: SelectOption[];
  /** 设计器模式 */
  model?: string;
  optional?: FormConfig;
}>();

const emit = defineEmits<{
  (e: "merge", config: PreOrPendEventConfig): void;
  (e: "close"): void;
}>();

/** 当前编辑的事件类型 */
const currentEventType = ref<PreOrPendEventConfig["eventType"]>("none");

/** 联动策略组件引用 */
const linkageRef = ref();
/** 数据源组件引用 */
const dataSourceRef = ref();
/** 自定义代码 */
const customCodeRef = ref<string>("");
/** 自定义代码编辑器引用 */
const codeEditorRef = ref<any>(null);

/**
 * 临时承载联动策略/数据源配置的对象
 * LinkPolicyComp / DataSourceComp 会把配置写到 dataRelation / dataSource 等键上，
 * 为避免与主组件自身的配置冲突，这里使用独立的临时对象
 */
const tempConfigHolder = ref<any>({});

/** 是否显示联动策略 */
const showLinkage = computed(() => currentEventType.value === "linkage");
/** 是否显示数据源 */
const showDataSource = computed(() => currentEventType.value === "dataSource");
/** 是否显示自定义代码 */
const showCustom = computed(() => currentEventType.value === "custom");

/** 标题 */
const dialogTitle = computed(() => {
  const base = i18n("dyform.preOrPend.event.dialog.title");
  if (props.buttonTitle) {
    return `${base} - ${props.buttonTitle}`;
  }
  if (props.index !== undefined) {
    return `${base} - ${i18n("dyform.preOrPend.event.appendAction.item")} ${props.index + 1}`;
  }
  // 通用自定义事件：仅显示基础标题
  return base;
});

/**
 * 初始化表单数据
 * 自定义代码：加载时格式化，方便编辑
 */
const initFormData = () => {
  const cfg = props.eventConfig || {eventType: "none"};
  currentEventType.value = cfg.eventType || "none";
  // 自定义代码：格式化后回填到编辑器，方便阅读编辑
  customCodeRef.value = cfg.customCode ? formatJs(cfg.customCode) : "";

  // 把已有配置放入临时对象，供子组件读取
  tempConfigHolder.value = {
    dataRelation: cfg.dataRelation ? JSON.parse(JSON.stringify(cfg.dataRelation)) : undefined,
    dataSource: cfg.dataSourceConfig?.dataSource || "data",
    ...(cfg.dataSourceConfig ? JSON.parse(JSON.stringify(cfg.dataSourceConfig)) : {}),
  };
  if (cfg.dataRelation) {
    tempConfigHolder.value.dataRelation = JSON.parse(JSON.stringify(cfg.dataRelation));
  }

  nextTick(() => {
    if (showLinkage.value && linkageRef.value) {
      linkageRef.value?.setFormData(tempConfigHolder.value);
    }
    if (showDataSource.value && dataSourceRef.value) {
      dataSourceRef.value?.setFormData(tempConfigHolder.value);
    }
  });
};

/**
 * 切换事件类型时重置对应表单
 */
const handleTypeChange = (type: PreOrPendEventConfig["eventType"]) => {
  currentEventType.value = type;
  nextTick(() => {
    if (type === "linkage" && linkageRef.value) {
      linkageRef.value?.setFormData(tempConfigHolder.value);
    }
    if (type === "dataSource" && dataSourceRef.value) {
      dataSourceRef.value?.setFormData(tempConfigHolder.value);
    }
  });
};

/**
 * 提交保存
 */
const handleSubmit = async () => {
  const config: PreOrPendEventConfig = {
    eventType: currentEventType.value,
  };

  if (currentEventType.value === "linkage") {
    const valid = await linkageRef.value?.submitValid();
    if (!valid) return;
    const data = linkageRef.value?.getFormData();
    config.dataRelation = data?.dataRelation ?? data?.value?.dataRelation ?? tempConfigHolder.value.dataRelation;
  } else if (currentEventType.value === "dataSource") {
    const valid = await dataSourceRef.value?.submitValid();
    if (!valid) return;
    const data = dataSourceRef.value?.getFormData();
    config.dataSourceConfig = data?.value ?? data ?? tempConfigHolder.value;
  } else if (currentEventType.value === "custom") {
    // 自定义代码：保存时压缩，去掉多余空格
    config.customCode = customCodeRef.value ? compressJs(customCodeRef.value) : "";
  }

  emit("merge", config);
};

const handleClose = () => {
  emit("close");
};

watch(
    () => props.visible,
    (val) => {
      if (val) {
        initFormData();
      }
    },
    {immediate: true},
);
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      :title="dialogTitle"
      :isBatch="false"
      @merge="handleSubmit"
      @closeAction="handleClose"
      @resetForm="handleClose"
      :selfFunc="true"
      box-height="80%"
  >
    <div class="pre-or-pend-event">
      <!-- 事件类型选择 -->
      <div class="event-type-selector">
        <div class="selector-header">
          <span class="selector-title">{{ i18n("dyform.preOrPend.event.type") }}</span>
          <span class="selector-desc">
            {{ preOrPendEventTypeOptions.find((o) => o.value === currentEventType)?.label }}
          </span>
        </div>
        <div class="type-cards">
          <div
              v-for="opt in preOrPendEventTypeOptions"
              :key="opt.value"
              :class="['type-card', {active: currentEventType === opt.value}]"
              @click="handleTypeChange(opt.value)"
          >
            <el-icon class="type-icon" :size="18">
              <component :is="opt.icon"/>
            </el-icon>
            <span class="type-label">{{ opt.label }}</span>
          </div>
        </div>
      </div>

      <!-- 配置内容区 -->
      <div class="event-content">
        <!-- 联动策略 -->
        <div v-if="showLinkage" class="linkage-panel">
          <link-policy-comp
              ref="linkageRef"
              :formProps="tempConfigHolder"
              :model="model || 'full'"
              :hide-user-define="true"
              :optional="optional"
              :formFields="formFields"
          />
        </div>

        <!-- 数据源 -->
        <div v-if="showDataSource" class="data-source-panel">
          <data-source-comp
              ref="dataSourceRef"
              :formProps="tempConfigHolder"
              :model="model || 'full'"
              :optional="optional"
              :formFields="formFields"
          />
        </div>

        <!-- 自定义代码 -->
        <div v-if="showCustom" class="custom-panel">
          <div class="custom-help">
            <help :message="userOperationMsg"/>
          </div>
          <star-horse-editor
              v-model:value="customCodeRef"
              lang="javascript"
              ref="codeEditorRef"
              style="height: 100%"
          />
        </div>
        <!-- 无事件 -->
        <div v-show="currentEventType === 'none'" class="empty-panel">
          <el-empty :description="i18n('dyform.preOrPend.event.none.desc')"/>
        </div>
      </div>
    </div>
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.pre-or-pend-event {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.event-type-selector {
  margin-bottom: 16px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-lighter);

  .selector-header {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin-bottom: 12px;

    .selector-title {
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      white-space: nowrap;
    }

    .selector-desc {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }

  .type-cards {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }

  .type-card {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 6px;
    border: 1px solid var(--el-border-color);
    background: var(--el-bg-color);
    cursor: pointer;
    transition: all 0.2s ease;
    user-select: none;

    .type-icon {
      color: var(--el-text-color-secondary);
      transition: color 0.2s;
    }

    .type-label {
      font-size: 13px;
      color: var(--el-text-color-regular);
      white-space: nowrap;
    }

    &:hover {
      border-color: var(--el-color-primary-light-5);
      background: var(--el-color-primary-light-9);

      .type-icon {
        color: var(--el-color-primary);
      }
    }

    &.active {
      border-color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
      box-shadow: 0 0 0 1px var(--el-color-primary-light-7);

      .type-icon {
        color: var(--el-color-primary);
      }

      .type-label {
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}

.event-content {
  flex: 1;
  overflow: auto;
  min-height: 300px;
}

.custom-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;

  .custom-help {
    flex-shrink: 0;
  }
}

.empty-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}
</style>
