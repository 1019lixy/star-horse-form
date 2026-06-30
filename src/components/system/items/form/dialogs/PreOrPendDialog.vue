<script setup lang="ts">
import {computed, nextTick, ref, shallowRef, unref, watch} from "vue";
import {i18n} from "@/lang";
import {loadSvgIcons} from "@/api/star_horse_form_utils.js";
import {analysisCompDatas, getDesignFormStore, SelectOption} from "star-horse-lowcode";
import PreOrPendEventDialog from "@/components/system/items/form/dialogs/PreOrPendEventDialog.vue";
import {
  PreOrPendEventConfig,
  preOrPendEventTypeOptions,
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

/** 可选图标列表（shallowRef + 一次性初始化，避免 computed 反复求值引发响应式连锁） */
const iconOptions = shallowRef<SelectOption[]>(loadSvgIcons());

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
// 事件配置直接内联到按钮项的 actions 字段上：
//   props.formProps.appendAction[i].actions = { eventType, dataRelation?, dataSourceConfig?, customCode? }
// 读取/赋值都在 props.formProps 上直接操作，无中间层

/** 当前激活的 tab */
const activeTab = ref<"basic" | "prependAction" | "appendAction">("basic");

/** 按钮组字段名 */
type ActionFieldName = "prependAction" | "appendAction";

/**
 * 取得某个按钮组数组（只读，不在此处初始化）
 * 初始化在 ensureActionList 中完成，避免在 computed 内写入触发死循环
 */
const getActionList = (fieldName: ActionFieldName): any[] => {
  return Array.isArray(props.formProps?.[fieldName]) ? props.formProps[fieldName] : [];
};

/**
 * 确保某个按钮组数组存在（写入操作必须在 computed 之外）
 */
const ensureActionList = (fieldName: ActionFieldName): any[] => {
  if (!props.formProps) return [];
  if (!Array.isArray(props.formProps[fieldName])) {
    props.formProps[fieldName] = [];
  }
  return props.formProps[fieldName];
};

const prependActionItems = computed<any[]>(() => getActionList("prependAction"));
const appendActionItems = computed<any[]>(() => getActionList("appendAction"));

/**
 * 新增一个按钮
 * actions 内联事件配置，运行时按 eventType 分发
 */
const addAction = (fieldName: ActionFieldName) => {
  ensureActionList(fieldName).push({
    actionTitle: "",
    icon: "",
    actions: {eventType: "none"},
  });
};

/**
 * 删除某个按钮（事件配置内联在按钮项上，随按钮一起删除）
 */
const removeAction = (fieldName: ActionFieldName, index: number) => {
  ensureActionList(fieldName).splice(index, 1);
};

/**
 * 读取某个按钮的事件配置（直接从按钮项的 actions 字段读）
 */
const getEventConfig = (fieldName: ActionFieldName, index: number): PreOrPendEventConfig => {
  const list = getActionList(fieldName);
  const item = list[index];
  if (item?.actions && typeof item.actions === "object") {
    return {eventType: "none", ...item.actions};
  }
  return {eventType: "none"};
};

/**
 * 赋值某个按钮的事件配置（直接写到按钮项的 actions 字段上）
 */
const setEventConfig = (fieldName: ActionFieldName, index: number, config: PreOrPendEventConfig) => {
  const list = ensureActionList(fieldName);
  if (list[index]) {
    list[index].actions = config;
  }
};

/**
 * 判断某个按钮是否已配置事件
 */
const hasEventConfig = (fieldName: ActionFieldName, index: number): boolean => {
  return getEventConfig(fieldName, index).eventType !== "none";
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
const currentEventTypeOf = (fieldName: ActionFieldName, index: number) => {
  return getEventConfig(fieldName, index).eventType;
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
 * 事件类型对应标签文案
 */
const eventTypeLabelOf = (type: PreOrPendEventConfig["eventType"]): string => {
  return preOrPendEventTypeOptions.value.find((o) => o.value === type)?.label ?? "";
};

/**
 * 打开事件配置对话框
 */
const openEventConfig = (fieldName: ActionFieldName, index: number) => {
  currentSlotField.value = fieldName;
  currentIndex.value = index;
  const list = fieldName === "prependAction" ? prependActionItems.value : appendActionItems.value;
  const actionItem = list[index];
  currentButtonTitle.value = actionItem?.actionTitle
      || `${i18n("dyform.preOrPend.event.appendAction.item")} ${index + 1}`;
  currentEventConfig.value = getEventConfig(fieldName, index);
  eventDialogVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
};

/**
 * 事件配置保存回调：直接赋值到 props.formProps[fieldName][index].actions
 */
const handleEventMerge = (config: PreOrPendEventConfig) => {
  if (currentIndex.value !== undefined) {
    setEventConfig(currentSlotField.value, currentIndex.value, config);
  }
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
const querySearch = (queryString: string, cb: any) => {
  const results = queryString
      ? iconOptions.value.filter(createFilter(queryString))
      : iconOptions.value
  // call callback function to return suggestions
  cb(results)
}
const createFilter = (queryString: string) => {
  return (restaurant: SelectOption) => {
    return (
        restaurant.value?.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
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
                <el-autocomplete
                    v-model="action.icon"
                    :placeholder="i18n('dyform.item.139')"
                    class="row-control"
                    :fetch-suggestions="querySearch"
                    clearable
                    filterable
                >
                  <template #default="{ item }">
                    <div class="flex flex-row items-center">
                      <star-horse-icon :iconClass="item.value"/>
                      <span>{{ item.name }}</span>
                    </div>
                  </template>
                </el-autocomplete>
              </div>
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.dialog.425') }}</label>
                <el-input
                    v-model="action.actionTitle"
                    :placeholder="i18n('dyform.dialog.425')"
                    class="row-control"
                />
              </div>
              <div class="row-field row-field--event">
                <label class="row-label">{{ i18n('dyform.preOrPend.event.type') }}</label>
                <div class="row-control event-control">
                  <el-tag
                      v-if="hasEventConfig('prependAction', idx)"
                      :type="eventTagType(currentEventTypeOf('prependAction', idx))"
                      effect="light"
                  >
                    {{ eventTypeLabelOf(currentEventTypeOf('prependAction', idx)) }}
                  </el-tag>
                  <el-tag v-else size="small" type="info" effect="plain">
                    {{ i18n('dyform.preOrPend.event.type.none') }}
                  </el-tag>
                  <el-button
                      :type="hasEventConfig('prependAction', idx) ? 'success' : 'primary'"
                      plain
                      icon="Setting"
                      @click="openEventConfig('prependAction', idx)"
                  >
                    {{ i18n('dyform.custProp.config') }}
                  </el-button>
                </div>
              </div>
              <div class="row-actions">
                <star-horse-icon iconClass="delete" color="var(--el-color-danger)"
                                 @click="removeAction('prependAction', idx)"/>
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
                <el-autocomplete
                    v-model="action.icon"
                    :placeholder="i18n('dyform.item.139')"
                    class="row-control"
                    :fetch-suggestions="querySearch"
                    clearable
                    filterable
                >
                  <template #default="{ item }">
                    <div class="flex flex-row items-center">
                      <star-horse-icon :iconClass="item.value"/>
                      <span>{{ item.name }}</span>
                    </div>
                  </template>
                </el-autocomplete>
              </div>
              <div class="row-field">
                <label class="row-label">{{ i18n('dyform.dialog.425') }}</label>
                <el-input
                    v-model="action.actionTitle"
                    :placeholder="i18n('dyform.dialog.425')"
                    class="row-control"
                />
              </div>
              <div class="row-field row-field--event">
                <label class="row-label">{{ i18n('dyform.preOrPend.event.type') }}</label>
                <div class="row-control event-control">
                  <el-tag
                      v-if="hasEventConfig('appendAction', idx)"
                      :type="eventTagType(currentEventTypeOf('appendAction', idx))"
                      effect="light"
                  >
                    {{ eventTypeLabelOf(currentEventTypeOf('appendAction', idx)) }}
                  </el-tag>
                  <el-tag v-else size="small" type="info" effect="plain">
                    {{ i18n('dyform.preOrPend.event.type.none') }}
                  </el-tag>
                  <el-button
                      :type="hasEventConfig('appendAction', idx) ? 'success' : 'primary'"
                      plain
                      icon="Setting"
                      @click="openEventConfig('appendAction', idx)"
                  >
                    {{ i18n('dyform.custProp.config') }}
                  </el-button>
                </div>
              </div>
              <div class="row-actions">
                <star-horse-icon iconClass="delete" color="var(--el-color-danger)"
                                 @click="removeAction('appendAction', idx)"/>

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
