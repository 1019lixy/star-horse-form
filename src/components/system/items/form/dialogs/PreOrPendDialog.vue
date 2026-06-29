<script setup lang="ts">
import {computed, nextTick, ref, unref, watch} from "vue";
import {i18n} from "@/lang";
import {loadSvgIcons} from "@/api/star_horse_form_utils.js";
import {analysisCompDatas, getDesignFormStore, SelectOption} from "star-horse-lowcode";
import PreOrPendEventDialog from "@/components/system/items/form/dialogs/PreOrPendEventDialog.vue";
import {
  PreOrPendEventConfig,
  PreOrPendEventSlot,
  preOrPendEventSlots,
  usePreOrPendEvent,
} from "@/components/system/items/form/composables/usePreOrPendEvent";

const props = defineProps<{
  visible: boolean;
  formProps: any;
  formInfo: any;
  fieldName: string;
  currentField: any;
  /** 当前组件类型 */
  itemType?: string;
  /** 设计器模式 */
  model?: string;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const preOrPendRef = ref<any>(null);

/** 可选图标列表 */
const iconOptions = computed<SelectOption[]>(() => loadSvgIcons());

/**
 * 表单字段配置（仅保留前缀图标/文本/下拉、后缀图标/文本/下拉）
 * 前置/后置按钮组改为独立卡片式管理，不再走 json 组件
 */
const preOrPendFields = () => {
  return {
    fieldList: [
      // 前缀图标
      {
        label: i18n("dyform.dialog.415"),
        fieldName: "prefixIcon",
        type: "icon",
        formVisible: true,
        listVisible: false,
        preps: {
          iconType: "user",
          values: loadSvgIcons(),
        },
      },
      // 前缀文本
      {
        label: i18n("dyform.dialog.416"),
        fieldName: "prefix",
        formVisible: true,
        listVisible: false,
      },
      // 前缀固定文本
      {
        label: i18n("dyform.dialog.417"),
        fieldName: "prependText",
        type: "input",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.prependText.helpMsg"),
      },
      // 前缀下拉列表
      {
        label: i18n("dyform.dialog.418"),
        fieldName: "prependList",
        type: "json-array",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.prependList.helpMsg"),
        preps: {
          jsonConfig: {
            dialogTitle: i18n("dyform.preOrPend.prependList.title"),
            columns: [
              {title: i18n("dyform.dialog.419"), fieldName: "name", required: true},
              {title: i18n("dyform.dialog.420"), fieldName: "value", required: true},
            ],
          },
        },
      },
      // 后缀图标
      {
        label: i18n("dyform.dialog.421"),
        fieldName: "suffixIcon",
        type: "icon",
        formVisible: true,
        listVisible: false,
        preps: {
          iconType: "user",
          values: loadSvgIcons(),
        },
      },
      // 后缀文本
      {
        label: i18n("dyform.dialog.422"),
        fieldName: "suffix",
        formVisible: true,
        listVisible: false,
      },
      // 后缀固定文本
      {
        label: i18n("dyform.dialog.423"),
        fieldName: "appendText",
        type: "input",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.appendText.helpMsg"),
      },
      // 后缀下拉列表
      {
        label: i18n("dyform.dialog.427"),
        fieldName: "appendList",
        type: "json-array",
        formVisible: true,
        listVisible: false,
        helpMsg: i18n("dyform.preOrPend.appendList.helpMsg"),
        preps: {
          jsonConfig: {
            dialogTitle: i18n("dyform.preOrPend.appendList.title"),
            columns: [
              {title: i18n("dyform.dialog.419"), fieldName: "name", required: true},
              {title: i18n("dyform.dialog.420"), fieldName: "value", required: true},
            ],
          },
        },
      },
    ],
  };
};

/**
 * 表单验证和提交
 */
const preOrPendValid = async () => {
  let flag = false;
  await nextTick();
  await preOrPendRef.value?.$refs.starHorseFormRef.validate((res: boolean) => {
    flag = res;
  });

  if (!flag) {
    return;
  }

  const formData = unref(preOrPendRef.value.getFormData());
  for (const key in formData) {
    props.formProps[key] = formData[key];
  }
  // 按钮组直接同步（已在 formProps 上响应式修改）
  emit("merge");
};

const resetDataSourceForm = () => {
  // 重置表单逻辑
};

const setFormData = async (data: any) => {
  await nextTick();
  if (preOrPendRef.value) {
    setTimeout(() => {
      const formData = {
        prefixIcon: data.prefixIcon,
        prefix: data.prefix,
        suffixIcon: data.suffixIcon,
        suffix: data.suffix,
        prependText: data.prependText || "",
        prependList: data.prependList || [],
        appendText: data.appendText || "",
        appendList: data.appendList || [],
      };
      preOrPendRef.value?.setFormData(formData);
    }, 200);
  }
};

watch(
    () => props.visible,
    (newVal) => {
      if (newVal) {
        setFormData(props.formProps);
      }
    },
    {immediate: true},
);

// ==================== 前置/后置按钮组管理 ====================
const {
  getEventConfig,
  setEventConfig,
  clearEventConfig,
  hasEventConfig,
  getEventTypeLabel,
} = usePreOrPendEvent(computed(() => props.formProps));

/** 当前激活的 tab */
const activeTab = ref<"basic" | "prependAction" | "appendAction">("basic");

/** prependAction / appendAction 插槽定义 */
const prependActionSlot = preOrPendEventSlots.find(s => s.fieldName === "prependAction")!;
const appendActionSlot = preOrPendEventSlots.find(s => s.fieldName === "appendAction")!;

/**
 * 取得/初始化某个按钮组数据
 */
const getActionList = (fieldName: "prependAction" | "appendAction"): any[] => {
  if (!Array.isArray(props.formProps[fieldName])) {
    props.formProps[fieldName] = [];
  }
  return props.formProps[fieldName];
};

const prependActionItems = computed<any[]>(() => getActionList("prependAction"));
const appendActionItems = computed<any[]>(() => getActionList("appendAction"));

/**
 * 新增一个按钮
 */
const addAction = (fieldName: "prependAction" | "appendAction") => {
  getActionList(fieldName).push({
    actionTitle: "",
    icon: "",
    actions: "",
  });
};

/**
 * 删除某个按钮（同时清除其事件配置）
 */
const removeAction = (fieldName: "prependAction" | "appendAction", index: number) => {
  clearEventConfig(fieldName, "click", index);
  // 删除后，后续按钮的事件配置 key 需要前移，避免错位
  const list = getActionList(fieldName);
  for (let i = index + 1; i < list.length; i++) {
    if (hasEventConfig(fieldName, "click", i)) {
      const cfg = getEventConfig(fieldName, "click", i);
      setEventConfig(fieldName, "click", cfg, i - 1);
      clearEventConfig(fieldName, "click", i);
    }
  }
  list.splice(index, 1);
};

// ==================== 事件配置对话框 ====================
/** 事件配置对话框可见 */
const eventDialogVisible = ref(false);
/** 当前编辑的插槽字段名 */
const currentSlotField = ref<"prependAction" | "appendAction">("appendAction");
/** 当前编辑的数组索引 */
const currentIndex = ref<number | undefined>(undefined);
/** 当前事件配置 */
const currentEventConfig = ref<PreOrPendEventConfig>({eventType: "none"});
/** 当前编辑按钮标题 */
const currentButtonTitle = ref<string>("");

/**
 * 表单中所有可选字段（联动策略目标字段映射使用）
 */
const linkageFormFields = computed<SelectOption[]>(() => {
  const datas = analysisCompDatas(unref(getDesignFormStore().compList));
  const dataList: any = [];
  Object.entries(datas.compListResult).forEach(([key, value]) => {
    if ((value as any).compType != "container") {
      dataList.push(value);
    }
  });
  return dataList
      .filter((item: any) => item.fieldName)
      .map((item: any) => ({
        label: `${item.preps?.label ?? item.label} (${item.fieldName})`,
        value: item.fieldName,
        name: `${item.preps?.label ?? item.label} (${item.fieldName})`,
      }));
});

/**
 * 读取某个按钮当前事件类型（用于 tag 颜色显示）
 */
const currentEventTypeOf = (fieldName: string, eventName: string, index?: number) => {
  return getEventConfig(fieldName, eventName, index).eventType;
};

/**
 * 事件类型对应 tag 颜色
 */
const eventTagType = (type: PreOrPendEventConfig["eventType"]): "success" | "warning" | "danger" | "primary" => {
  switch (type) {
    case "linkage":
      return "primary";
    case "dataSource":
      return "warning";
    case "custom":
      return "danger";
    default:
      return "success";
  }
};

/**
 * 打开事件配置对话框
 */
const openEventConfig = (slot: PreOrPendEventSlot, index: number) => {
  currentSlotField.value = slot.fieldName as "prependAction" | "appendAction";
  currentIndex.value = index;
  const list = slot.fieldName === "prependAction" ? prependActionItems.value : appendActionItems.value;
  const actionItem = list[index];
  currentButtonTitle.value = actionItem?.actionTitle
      || `${i18n("dyform.preOrPend.event.appendAction.item")} ${index + 1}`;
  currentEventConfig.value = getEventConfig(slot.fieldName, slot.eventName, index);
  eventDialogVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
};

/**
 * 事件配置保存回调
 */
const handleEventMerge = (config: PreOrPendEventConfig) => {
  setEventConfig(currentSlotField.value, "click", config, currentIndex.value);
  eventDialogVisible.value = false;
  getDesignFormStore().setShortKeyDisabled(false);
};

/**
 * 事件配置关闭回调
 */
const handleEventClose = () => {
  eventDialogVisible.value = false;
  getDesignFormStore().setShortKeyDisabled(false);
};

defineExpose({
  setFormData,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      :title="i18n('dyform.preOrPend.dialog.title')"
      :isBatch="false"
      @merge="preOrPendValid"
      @closeAction="emit('close')"
      @resetForm="resetDataSourceForm"
      :selfFunc="true"
      box-height="80%"
  >
    <div class="pre-or-pend-body">
      <el-tabs v-model="activeTab" type="border-card" class="action-tabs">
        <!-- 基础前后缀配置 -->
        <el-tab-pane name="basic">
          <template #label>
            <div class="tab-label">
              <star-horse-icon icon-class="advance_preps"/>
              <span>{{ i18n('dyform.preOrPend.basic') }}</span>
            </div>
          </template>
          <star-horse-form ref="preOrPendRef" :fieldList="preOrPendFields()"/>
        </el-tab-pane>

        <!-- 前置按钮组 -->
        <el-tab-pane name="prependAction">
          <template #label>
            <div class="tab-label">
              <star-horse-icon icon-class="advance_preps"/>
              <span>{{ i18n('dyform.preOrPend.prependAction') }}</span>
              <el-badge
                  v-if="prependActionItems.length > 0"
                  :value="prependActionItems.length"
                  type="primary"
              />
            </div>
          </template>

          <div class="tab-toolbar">
            <help :message="i18n('dyform.preOrPend.prependAction.helpMsg')"/>
            <el-button
                type="primary"
                plain
                size="small"
                icon="Plus"
                @click="addAction('prependAction')"
            >
              {{ i18n('dyform.preOrPend.action.add') }}
            </el-button>
          </div>

          <div v-if="prependActionItems.length > 0" class="action-list">
            <div
                v-for="(action, idx) in prependActionItems"
                :key="`prepend-${idx}`"
                class="action-row"
            >
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.item.139') }}</label>
                <el-select
                    v-model="action.icon"
                    :placeholder="i18n('dyform.item.139')"
                    size="small"
                    class="row-control"
                    clearable
                    filterable
                >
                  <template #prefix>
                    <star-horse-icon v-if="action.icon" :icon-class="action.icon"/>
                  </template>
                  <el-option
                      v-for="opt in iconOptions"
                      :key="opt.value"
                      :label="opt.name"
                      :value="opt.value"
                  >
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <star-horse-icon :icon-class="opt.value"/>
                      <span>{{ opt.name }}</span>
                    </span>
                  </el-option>
                </el-select>
              </div>
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.dialog.425') }}</label>
                <el-input
                    v-model="action.actionTitle"
                    :placeholder="i18n('dyform.dialog.425')"
                    size="small"
                    class="row-control"
                />
              </div>
              <div class="row-field row-field--event">
                <label class="row-label">{{ i18n('dyform.preOrPend.event.type') }}</label>
                <div class="row-control event-control">
                  <el-tag
                      v-if="hasEventConfig('prependAction', 'click', idx)"
                      size="small"
                      :type="eventTagType(currentEventTypeOf('prependAction', 'click', idx))"
                      effect="light"
                  >
                    {{ getEventTypeLabel('prependAction', 'click', idx) }}
                  </el-tag>
                  <el-tag v-else size="small" type="info" effect="plain">
                    {{ i18n('dyform.preOrPend.event.type.none') }}
                  </el-tag>
                  <el-button
                      :type="hasEventConfig('prependAction', 'click', idx) ? 'success' : 'primary'"
                      plain
                      size="small"
                      icon="Setting"
                      @click="openEventConfig(prependActionSlot, idx)"
                  >
                    {{ i18n('dyform.custProp.config') }}
                  </el-button>
                </div>
              </div>
              <div class="row-actions">
                <el-button
                    type="danger"
                    text
                    size="small"
                    icon="Delete"
                    @click="removeAction('prependAction', idx)"
                />
              </div>
            </div>
          </div>
          <el-empty
              v-else
              :description="i18n('dyform.preOrPend.prependAction.empty')"
              :image-size="40"
          />
        </el-tab-pane>

        <el-tab-pane name="appendAction">
          <template #label>
            <div class="tab-label">
              <star-horse-icon icon-class="advance_preps"/>
              <span>{{ i18n('dyform.preOrPend.appendAction') }}</span>
              <el-badge
                  v-if="appendActionItems.length > 0"
                  :value="appendActionItems.length"
                  type="primary"
              />
            </div>
          </template>

          <div class="tab-toolbar">
            <help :message="i18n('dyform.preOrPend.appendAction.helpMsg')"/>
            <el-button
                type="primary"
                plain
                size="small"
                icon="Plus"
                @click="addAction('appendAction')"
            >
              {{ i18n('dyform.preOrPend.action.add') }}
            </el-button>
          </div>

          <div v-if="appendActionItems.length > 0" class="action-list">
            <div
                v-for="(action, idx) in appendActionItems"
                :key="`append-${idx}`"
                class="action-row"
            >
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.item.139') }}</label>
                <el-select
                    v-model="action.icon"
                    :placeholder="i18n('dyform.item.139')"
                    size="small"
                    class="row-control"
                    clearable
                    filterable
                >
                  <template #prefix>
                    <star-horse-icon v-if="action.icon" :icon-class="action.icon"/>
                  </template>
                  <el-option
                      v-for="opt in iconOptions"
                      :key="opt.value"
                      :label="opt.name"
                      :value="opt.value"
                  >
                    <span style="display: flex; align-items: center; gap: 6px;">
                      <star-horse-icon :icon-class="opt.value"/>
                      <span>{{ opt.name }}</span>
                    </span>
                  </el-option>
                </el-select>
              </div>
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.dialog.425') }}</label>
                <el-input
                    v-model="action.actionTitle"
                    :placeholder="i18n('dyform.dialog.425')"
                    size="small"
                    class="row-control"
                />
              </div>
              <div class="row-field row-field--event">
                <label class="row-label">{{ i18n('dyform.preOrPend.event.type') }}</label>
                <div class="row-control event-control">
                  <el-tag
                      v-if="hasEventConfig('appendAction', 'click', idx)"
                      size="small"
                      :type="eventTagType(currentEventTypeOf('appendAction', 'click', idx))"
                      effect="light"
                  >
                    {{ getEventTypeLabel('appendAction', 'click', idx) }}
                  </el-tag>
                  <el-tag v-else size="small" type="info" effect="plain">
                    {{ i18n('dyform.preOrPend.event.type.none') }}
                  </el-tag>
                  <el-button
                      :type="hasEventConfig('appendAction', 'click', idx) ? 'success' : 'primary'"
                      plain
                      size="small"
                      icon="Setting"
                      @click="openEventConfig(appendActionSlot, idx)"
                  >
                    {{ i18n('dyform.custProp.config') }}
                  </el-button>
                </div>
              </div>
              <div class="row-actions">
                <el-button
                    type="danger"
                    text
                    size="small"
                    icon="Delete"
                    @click="removeAction('appendAction', idx)"
                />
              </div>
            </div>
          </div>
          <el-empty
              v-else
              :description="i18n('dyform.preOrPend.appendAction.empty')"
              :image-size="40"
          />
        </el-tab-pane>
      </el-tabs>
    </div>

    <!-- 事件配置对话框 -->
    <PreOrPendEventDialog
        :visible="eventDialogVisible"
        :formProps="formProps"
        :itemType="itemType || ''"
        :eventConfig="currentEventConfig"
        :buttonTitle="currentButtonTitle"
        :index="currentIndex"
        :formFields="linkageFormFields"
        :model="model || 'full'"
        @merge="handleEventMerge"
        @close="handleEventClose"
    />
  </star-horse-dialog>
</template>

<style scoped lang="scss">
.pre-or-pend-body {
  display: flex;
  flex-direction: column;
  gap: 12px;

  .form-section {
    /* 表单按自身内容自然撑开 */
  }

  .action-tabs {
    :deep(.el-tabs__header) {
      margin: 0;
    }

    :deep(.el-tabs__item) {
      padding: 0 14px;
      height: 36px;
      line-height: 36px;
    }

    :deep(.el-tabs__content) {
      padding: 10px 12px 4px;
    }
  }

  .tab-label {
    display: inline-flex;
    align-items: center;
    gap: 4px;

    :deep(.el-badge__content) {
      font-size: 11px;
      transform: translateY(-6px) translateX(2px);
    }
  }

  .tab-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .action-row {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    gap: 8px 12px;
    padding: 10px 12px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
    border: 1px solid var(--el-border-color-lighter);
    transition: border-color 0.2s, box-shadow 0.2s;

    &:hover {
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
    }

    .row-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      flex: 1 1 200px;
      min-width: 0;

      &.row-field--event {
        flex: 1 1 280px;
      }

      .row-label {
        font-size: 12px;
        color: var(--el-text-color-secondary);
        line-height: 1;
      }

      .row-control {
        width: 100%;
      }

      .event-control {
        display: flex;
        align-items: center;
        gap: 8px;

        .el-button {
          margin-left: auto;
        }
      }
    }

    .row-actions {
      flex: 0 0 auto;
      display: flex;
      align-items: flex-end;
    }
  }
}
</style>
