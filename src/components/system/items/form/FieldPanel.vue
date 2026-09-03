<script setup lang="ts" name="FieldPanel">
import {computed, PropType, ref, useSlots} from "vue";
import {StarHorseIcon} from "star-horse-lowcode";
import {getDesignFormStore} from "@/store/StoreManager";
import {fieldCopy} from "@/components/system/items/utils/FieldOperationUtils.js";
import {i18n} from "@/lang/index.js";
import {FormConfig} from "@/components/types";
import OutlineTree from "@/components/system/items/form/components/OutlineTree.vue";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
  /** tab 显示顺序（按 name），未列出的 tab 追加在最后 */
  tabOrder: {type: Array as PropType<string[]>, default: () => []},
});
const slots = useSlots();
const designForm = getDesignFormStore();
const baseFormDataList = computed(() => designForm.formDataList);
const baseContainerList = computed(() => designForm.containerDataList);
const baseSelfFormDataList = computed(() => designForm.selfFormDataList);
const formQuery = ref<string>("");
const containerQuery = ref<string>("");
const selfQuery = ref<string>("");
const formDataList = computed(() => {
  if (!formQuery.value) {
    return baseFormDataList.value;
  }
  return baseFormDataList.value.filter((item) =>
      item.itemName.toLowerCase().includes(formQuery.value.toLowerCase()),
  );
});
let containerList = computed(() => {
  if (!containerQuery.value) {
    return baseContainerList.value;
  }
  return baseContainerList.value.filter((item) =>
      item.itemName.toLowerCase().includes(containerQuery.value.toLowerCase()),
  );
});
let selfFormDataList = computed(() => {
  if (!selfQuery.value) {
    return baseSelfFormDataList.value;
  }
  return baseSelfFormDataList.value.filter((item) =>
      item.itemName.toLowerCase().includes(selfQuery.value.toLowerCase()),
  );
});
// 自定义组件子分类: 系统内置扩展组件(仅显示系统扩展)
const systemSelfList = computed(() =>
    selfFormDataList.value.filter((item: any) => !item.isCustom),
);
let list = computed(() => designForm.compList);
let tabModel = ref<string>("component");
let activeNames = ref<string[]>(["a", "b", "c"]);

interface TabItem {
  name: string;
  icon: string;
  label: string;
}

/** 内置通用 tab（无强业务耦合） */
const builtinTabs = computed<TabItem[]>(() => [
  {
    name: "component",
    icon: "component",
    label: i18n("dyform.tab.component"),
  },
  {name: "outline", icon: "dept", label: i18n("dyform.tab.outline")},
  {name: "help", icon: "help", label: i18n("dyform.tab.help")},
]);

/**
 * 常用扩展 tab 的标题/图标映射（历史内置 tab 保持原样式），
 * 未在此表中的 tab 以插槽名作为标题
 */
const builtinTabMeta: Record<string, {icon: string; label: string}> = {
  mycomp: {icon: "custom_component", label: i18n("dyform.tab.mycomp")},
  dbinfo: {icon: "database", label: i18n("dyform.tab.dbinfo")},
  template: {icon: "template", label: i18n("dyform.tab.template")},
};

/**
 * 插槽即 tab：模板中写入 <template #tab-xxx> 即自动生成名为 xxx 的 tab，
 * 内置 tab（component/outline/help）也可通过同名插槽覆盖默认内容
 */
const extensionTabs = computed<TabItem[]>(() => {
  const builtinNames = new Set(builtinTabs.value.map((tab) => tab.name));
  return Object.keys(slots)
      .filter((slotName) => slotName.startsWith("tab-"))
      .map((slotName) => slotName.slice(4))
      .filter((name) => name && !builtinNames.has(name))
      .map((name) => ({
        name,
        icon: builtinTabMeta[name]?.icon ?? "other",
        label: builtinTabMeta[name]?.label ?? name,
      }));
});

/** 完整 tab 列表 = 内置 tab + 插槽扩展 tab（同名插槽覆盖内置 tab 内容），按 tabOrder 排序 */
const allTabList = computed<TabItem[]>(() => {
  const all = [...builtinTabs.value, ...extensionTabs.value];
  if (!props.tabOrder?.length) return all;
  const ordered = props.tabOrder
      .map((name) => all.find((tab) => tab.name === name))
      .filter((tab): tab is TabItem => !!tab);
  const rest = all.filter((tab) => !props.tabOrder!.includes(tab.name));
  return [...ordered, ...rest];
});

const switchTab = (name: string) => {
  tabModel.value = name;
};

const toggleSection = (name: string) => {
  const idx = activeNames.value.indexOf(name);
  if (idx > -1) {
    activeNames.value.splice(idx, 1);
  } else {
    activeNames.value.push(name);
  }
};

const onContainerCopy = (data: any) => {
  return onDataCopy(data, "container");
};
const onFormItemCopy = (data: any) => {
  return onDataCopy(data, "formItem");
};
const onDataCopy = (data: any, type: string) => {
  let mvData = fieldCopy(data, type);
  designForm.setDraggingItem(mvData);
  return mvData;
};

const addElement = (element: any, type: string) => {
  let mvData = fieldCopy(element, type);
  list.value.push(mvData);
  if (Array.isArray(mvData)) {
    let temp = mvData[mvData.length - 1];
    designForm.selectItem(temp, temp["itemType"], "");
  } else {
    designForm.selectItem(mvData, mvData["itemType"], "");
  }
};
</script>
<template>
  <div class="field-panel-root">
    <!-- Left Vertical Tabs -->
    <div class="field-sidebar-tabs">
      <button
          v-for="tab in allTabList"
          :key="tab.name"
          :class="['sidebar-tab', { active: tabModel === tab.name }]"
          @click="switchTab(tab.name)"
          :title="tab.label"
      >
        <star-horse-icon :icon-class="tab.icon || 'other'" size="22px"/>
        <span class="sidebar-tab-label">{{ tab.label }}</span>
      </button>
      <div class="sidebar-spacer"></div>
    </div>

    <!-- Tab Content Area -->
    <!--
      插槽规则:
      1. 外部扩展 tab 内容通过动态插槽 tab-{name} 提供
      2. 内置 tab(component/outline/help)有默认内容,同名插槽可整体覆盖
      3. 插槽作用域透出当前 tab 配置
    -->
    <div class="field-panel-content">
      <template v-for="tab in allTabList" :key="tab.name">
        <template v-if="tabModel === tab.name">
          <slot :name="`tab-${tab.name}`" :tab="tab">
            <!-- Component Tab -->
            <template v-if="tab.name === 'component'">
              <el-scrollbar height="100%">
                <div class="field-sections">
                  <!-- Layout Components -->
                  <div class="field-section">
                    <div class="section-header" @click="toggleSection('a')">
                      <div class="section-title">
                        <star-horse-icon
                            icon-class="container"
                            size="18px"
                            class="section-icon"
                        />
                        <span>{{ i18n("dyform.collapse.layout") }}</span>
                      </div>
                      <svg
                          :class="[
                    'section-arrow',
                    { expanded: activeNames.includes('a') },
                  ]"
                          viewBox="0 0 10 6"
                          fill="none"
                      >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div v-show="activeNames.includes('a')" class="section-body">
                      <div class="search-box">
                        <el-input
                            v-model="containerQuery"
                            :placeholder="i18n('dyform.collapse.layout')"
                            clearable
                            size="small"
                        >
                          <template #prefix>
                            <star-horse-icon iconClass="search" size="14px"/>
                          </template>
                        </el-input>
                      </div>
                      <draggable
                          :clone="onContainerCopy"
                          :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                          :sort="false"
                          animation="200"
                          ghost-class="ghost"
                          item-key="id"
                          tag="div"
                          class="field-grid"
                          :list="containerList"
                      >
                        <template #item="{ element }">
                          <div
                              class="field-card"
                              @dblclick="addElement(element, 'container')"
                              :title="element.itemName"
                          >
                            <star-horse-icon
                                :icon-class="element.itemIcon"
                                size="24px"
                                class="field-card-icon"
                            />
                            <span class="field-card-name">{{
                                element.itemName
                              }}</span>
                          </div>
                        </template>
                      </draggable>
                    </div>
                  </div>

                  <!-- Form Components -->
                  <div class="field-section">
                    <div class="section-header" @click="toggleSection('b')">
                      <div class="section-title">
                        <star-horse-icon
                            icon-class="form"
                            size="18px"
                            class="section-icon"
                        />
                        <span>{{ i18n("dyform.collapse.form") }}</span>
                      </div>
                      <svg
                          :class="[
                    'section-arrow',
                    { expanded: activeNames.includes('b') },
                  ]"
                          viewBox="0 0 10 6"
                          fill="none"
                      >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div v-show="activeNames.includes('b')" class="section-body">
                      <div class="search-box">
                        <el-input
                            v-model="formQuery"
                            :placeholder="i18n('dyform.collapse.form')"
                            clearable
                            size="small"
                        >
                          <template #prefix>
                            <star-horse-icon iconClass="search" size="14px"/>
                          </template>
                        </el-input>
                      </div>
                      <draggable
                          :clone="onFormItemCopy"
                          :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
                          :sort="false"
                          animation="200"
                          ghost-class="ghost"
                          item-key="key"
                          tag="div"
                          class="field-grid"
                          :list="formDataList"
                      >
                        <template #item="{ element }">
                          <div
                              class="field-card"
                              @dblclick="addElement(element, 'item')"
                              :title="element.itemName"
                          >
                            <star-horse-icon
                                :icon-class="element.itemIcon"
                                size="24px"
                                class="field-card-icon"
                            />
                            <span class="field-card-name">{{
                                element.itemName
                              }}</span>
                          </div>
                        </template>
                      </draggable>
                    </div>
                  </div>

                  <!-- Custom Components -->
                  <div class="field-section">
                    <div class="section-header" @click="toggleSection('c')">
                      <div class="section-title">
                        <star-horse-icon
                            icon-class="other"
                            size="18px"
                            class="section-icon"
                        />
                        <span>{{ i18n("dyform.collapse.custom") }}</span>
                      </div>
                      <svg
                          :class="[
                    'section-arrow',
                    { expanded: activeNames.includes('c') },
                  ]"
                          viewBox="0 0 10 6"
                          fill="none"
                      >
                        <path
                            d="M1 1L5 5L9 1"
                            stroke="currentColor"
                            stroke-width="1.5"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        />
                      </svg>
                    </div>
                    <div v-show="activeNames.includes('c')" class="section-body">
                      <div class="search-box">
                        <el-input
                            v-model="selfQuery"
                            :placeholder="i18n('dyform.collapse.custom')"
                            clearable
                            size="small"
                        >
                          <template #prefix>
                            <star-horse-icon iconClass="search" size="14px"/>
                          </template>
                        </el-input>
                      </div>
                      <!-- 系统扩展组件子分组 -->
                      <div v-if="systemSelfList.length > 0" class="sub-section">
                        <div class="sub-section-title">
                          <star-horse-icon icon-class="other" size="14px"/>
                          <span>{{ i18n("dyform.collapse.systemExtend") }}</span>
                        </div>
                        <draggable
                            :clone="onFormItemCopy"
                            :group="{
                      name: 'starHorseGroup',
                      pull: 'clone',
                      put: false,
                    }"
                            :sort="false"
                            animation="200"
                            ghost-class="ghost"
                            item-key="key"
                            tag="div"
                            class="field-grid"
                            :list="systemSelfList"
                        >
                          <template #item="{ element }">
                            <div
                                class="field-card"
                                @dblclick="addElement(element, 'item')"
                                :title="element.itemName"
                            >
                              <star-horse-icon
                                  :icon-class="element.itemIcon"
                                  size="24px"
                                  class="field-card-icon"
                              />
                              <span class="field-card-name">{{
                                  element.itemName
                                }}</span>
                            </div>
                          </template>
                        </draggable>
                      </div>
                      <el-empty
                          v-if="systemSelfList.length === 0"
                          :image-size="60"
                          :description="i18n('dyform.collapse.custom')"
                      />
                      <div style="height: 40px"></div>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </template>
            <!-- Outline Tab -->
            <template v-else-if="tab.name === 'outline'">
              <OutlineTree/>
            </template>
            <!-- Help Tab -->
            <template v-else-if="tab.name === 'help'">
              <div class="help-placeholder">
                <star-horse-icon
                    icon-class="help"
                    size="48px"
                    style="color: #c0c4cc"
                />
                <p class="help-text">{{ i18n("dyform.tab.help") }}</p>
              </div>
            </template>
          </slot>
        </template>
      </template>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.field-panel-root {
  height: 100%;
  display: flex;
  flex-direction: row;
  background: #ffffff;
  border-right: 1px solid #ebeef5;
  overflow: hidden;
}

/* ====== Left Sidebar Tabs (Vertical) ====== */
.field-sidebar-tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 4px;
  background: #f5f7fa;
  border-right: 1px solid #ebeef5;
  flex-shrink: 0;
  width: 56px;
  min-width: 56px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.sidebar-spacer {
  flex: 1;
}

.sidebar-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 48px;
  padding: 10px 2px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: #909399;
  transition: all 0.15s ease;
  position: relative;
  flex-shrink: 0;

  :deep(.star-horse-icon) {
    font-size: 22px;
    color: inherit;
    transition: color 0.15s ease;
  }

  &:hover {
    background: #eef0f3;
    color: var(--star-horse-style);
  }

  &.active {
    background: #ffffff;
    color: var(--star-horse-style);
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);

    &::before {
      content: "";
      position: absolute;
      left: -4px;
      top: 50%;
      transform: translateY(-50%);
      width: 3px;
      height: 20px;
      background: var(--star-horse-style);
      border-radius: 0 3px 3px 0;
    }
  }
}

.sidebar-tab-label {
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 48px;
  writing-mode: vertical-lr;
  letter-spacing: 2px;
}

/* ====== Content Area ====== */
.field-panel-content {
  flex: 1;
  overflow: hidden;
  min-width: 0;
}

.field-sections {
  padding: 8px;
}

/* ====== Collapsible Sections ====== */
.field-section {
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid #ebeef5;
  overflow: hidden;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: #fafbfc;
  cursor: pointer;
  user-select: none;
  transition: background 0.15s ease;

  &:hover {
    background: #f0f2f5;
  }
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.section-icon {
  color: var(--star-horse-style);
}

.section-arrow {
  width: 10px;
  height: 6px;
  color: #c0c4cc;
  transition: transform 0.2s ease;
  transform: rotate(-90deg);

  &.expanded {
    transform: rotate(0deg);
  }
}

.section-body {
  padding: 8px;
  background: #ffffff;
}

/* ====== Custom Sub-section (系统扩展) ====== */
.sub-section {
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
}

.sub-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #909399;
  padding: 4px 2px 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  :deep(.star-horse-icon) {
    color: #c0c4cc;
  }
}

/* ====== Search Box ====== */
.search-box {
  margin-bottom: 8px;

  :deep(.el-input) {
    .el-input__wrapper {
      border-radius: 6px;
      box-shadow: 0 0 0 1px #e4e7ed inset;
      transition: box-shadow 0.15s ease;

      &:hover {
        box-shadow: 0 0 0 1px #c0c4cc inset;
      }

      &.is-focus {
        box-shadow: 0 0 0 1px var(--star-horse-style) inset;
      }
    }

    .el-input__prefix {
      color: #c0c4cc;
    }
  }
}

/* ====== Field Card Grid ====== */
.field-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 6px;
}

.field-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 4px;
  height: 68px;
  background: #fafbfc;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  cursor: grab;
  transition: all 0.15s ease;
  user-select: none;

  &:hover {
    background: #f0f7ff;
    border-color: var(--star-horse-style);
    box-shadow: 0 2px 8px rgba(64, 158, 255, 0.1);
    transform: translateY(-1px);

    .field-card-icon {
      color: var(--star-horse-style);
    }

    .field-card-name {
      color: #303133;
    }
  }

  &:active {
    cursor: grabbing;
    transform: scale(0.97);
  }
}

.field-card-icon {
  color: var(--star-horse-style);
  transition: color 0.15s ease;
  flex-shrink: 0;
}

.field-card-name {
  font-size: 11px;
  color: #606266;
  text-align: center;
  line-height: 1.3;
  max-height: 2.6em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: color 0.15s ease;
}

/* ====== Ghost (drag placeholder) ====== */
:deep(.ghost) {
  opacity: 0.4;
  background: #ecf5ff;
  border: 1px dashed var(--star-horse-style);
  border-radius: 8px;
}


/* ====== Help Tab ====== */
.help-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 12px;
  color: #c0c4cc;
}

.help-text {
  font-size: 13px;
  color: #909399;
  margin: 0;
}
</style>
