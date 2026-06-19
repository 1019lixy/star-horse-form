<script setup lang="ts" name="FieldPanel">
import {computed, PropType, ref} from "vue";
import {getDesignFormStore, loadData, StarHorseIcon,} from "star-horse-lowcode";
import {fieldCopy} from "@/components/system/items/utils/FieldOperationUtils.js";
import {i18n} from "@/lang/index.js";
import {FormConfig} from "@/components/types";
import OutlineTree from "@/components/system/items/form/components/OutlineTree.vue";

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>},
});
const emits = defineEmits(["loadData"]);
const designForm = getDesignFormStore();
const baseFormDataList = computed(() => designForm.formDataList);
const baseContainerList = computed(() => designForm.containerList);
const baseSelfFormDataList = computed(() => designForm.selfFormDataList);
const formQuery = ref<string>("");
const containerQuery = ref<string>("");
const selfQuery = ref<string>("");
const formDataList = computed(() => {
  if (!formQuery.value) {
    return baseFormDataList.value;
  }
  return baseFormDataList.value.filter((item) => item.itemName.toLowerCase().includes(formQuery.value.toLowerCase()));
});
let containerList = computed(() => {
  if (!containerQuery.value) {
    return baseContainerList.value;
  }
  return baseContainerList.value.filter((item) => item.itemName.toLowerCase().includes(containerQuery.value.toLowerCase()));
});
let selfFormDataList = computed(() => {
  if (!selfQuery.value) {
    return baseSelfFormDataList.value;
  }
  return baseSelfFormDataList.value.filter((item) => item.itemName.toLowerCase().includes(selfQuery.value.toLowerCase()));
});
let list = computed(() => designForm.compList);
let tabModel = ref<string>("component");
let activeNames = ref<string[]>(["a", "b", "c"]);
const model = computed(() => props.optional?.model ?? "simple");

const tabList = computed(() => [
  { name: "component", icon: "component", label: i18n("dyform.tab.component"), visible: true },
  { name: "outline", icon: "dept", label: i18n("dyform.tab.outline"), visible: true },
  { name: "dbinfo", icon: "database", label: i18n("dyform.tab.dbinfo"), visible: model.value === "full" },
  { name: "template", icon: "template", label: i18n("dyform.tab.template"), visible: model.value === "full" },
  { name: "help", icon: "help", label: i18n("dyform.tab.help"), visible: true },
]);

const switchTab = (name: string) => {
  tabModel.value = name;
  if (name === "template" && props.optional?.api?.basePrefix) {
    loadData(props.optional.api.basePrefix + "/loadTemplate", {}).then(
        async (res: any) => {
          templateList.value = res.data || [];
        },
    );
  }
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
const templateList = ref<any[]>([]);
const loadFormData = (formId: any) => {
  emits("loadData", formId);
};

const previewRefs = ref<any[]>([]);
const createRef = (el: any) => {
  previewRefs.value.push(el);
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
          v-for="tab in tabList"
          :key="tab.name"
          :class="['sidebar-tab', { active: tabModel === tab.name }]"
          @click="switchTab(tab.name)"
          v-show="tab.visible"
          :title="tab.label"
      >
        <star-horse-icon :icon-class="tab.icon" size="22px"/>
        <span class="sidebar-tab-label">{{ tab.label }}</span>
      </button>
      <div class="sidebar-spacer"></div>
    </div>

    <!-- Tab Content Area -->
    <div class="field-panel-content">
      <!-- Component Tab -->
      <template v-if="tabModel === 'component'">
        <el-scrollbar height="100%">
          <div class="field-sections">
            <!-- Layout Components -->
            <div class="field-section">
              <div class="section-header" @click="toggleSection('a')">
                <div class="section-title">
                  <star-horse-icon icon-class="container" size="18px" class="section-icon"/>
                  <span>{{ i18n("dyform.collapse.layout") }}</span>
                </div>
                <svg :class="['section-arrow', { expanded: activeNames.includes('a') }]"
                     viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-show="activeNames.includes('a')" class="section-body">
                <div class="search-box">
                  <el-input v-model="containerQuery"
                            :placeholder="i18n('dyform.collapse.layout')"
                            clearable size="small">
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
                      <span class="field-card-name">{{ element.itemName }}</span>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>

            <!-- Form Components -->
            <div class="field-section">
              <div class="section-header" @click="toggleSection('b')">
                <div class="section-title">
                  <star-horse-icon icon-class="form" size="18px" class="section-icon"/>
                  <span>{{ i18n("dyform.collapse.form") }}</span>
                </div>
                <svg :class="['section-arrow', { expanded: activeNames.includes('b') }]"
                     viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-show="activeNames.includes('b')" class="section-body">
                <div class="search-box">
                  <el-input v-model="formQuery"
                            :placeholder="i18n('dyform.collapse.form')"
                            clearable size="small">
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
                      <span class="field-card-name">{{ element.itemName }}</span>
                    </div>
                  </template>
                </draggable>
              </div>
            </div>

            <!-- Custom Components -->
            <div class="field-section">
              <div class="section-header" @click="toggleSection('c')">
                <div class="section-title">
                  <star-horse-icon icon-class="other" size="18px" class="section-icon"/>
                  <span>{{ i18n("dyform.collapse.custom") }}</span>
                </div>
                <svg :class="['section-arrow', { expanded: activeNames.includes('c') }]"
                     viewBox="0 0 10 6" fill="none">
                  <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5"
                        stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div v-show="activeNames.includes('c')" class="section-body">
                <div class="search-box">
                  <el-input v-model="selfQuery"
                            :placeholder="i18n('dyform.collapse.custom')"
                            clearable size="small">
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
                    :list="selfFormDataList"
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
                      <span class="field-card-name">{{ element.itemName }}</span>
                    </div>
                  </template>
                </draggable>
                <div style="height: 40px"></div>
              </div>
            </div>
          </div>
        </el-scrollbar>
      </template>

      <!-- Outline Tab -->
      <template v-if="tabModel === 'outline'">
        <OutlineTree />
      </template>

      <!-- DB Info Tab -->
      <template v-if="tabModel === 'dbinfo' && model === 'full'">
        <db-list-comp :optional="optional" class="db-tab-content"/>
      </template>

      <!-- Template Tab -->
      <template v-if="tabModel === 'template' && model === 'full'">
        <div class="template-content">
          <el-empty v-if="!templateList || templateList?.length == 0"/>
          <el-scrollbar height="100%">
            <el-card
                class="temp-card"
                style="margin-bottom: 10px !important"
                v-for="item in templateList"
                :key="item.idDynamicForm"
            >
              <div class="flex w-full flex-1 justify-center items-center">
                <el-popover placement="right" :width="500">
                  <template #reference>
                    <el-image :src="item.shortImages">
                      <template #error>
                        <star-horse-icon iconClass="empty_image" size="100px"/>
                      </template>
                    </el-image>
                  </template>
                  <template #default>
                    <form-preview
                        :compSize="'small'"
                        :formDisabled="true"
                        :list="JSON.parse(item['details'].content || '[]')"
                        :ref="createRef"
                        class="flex w-full flex-1 justify-center items-center"
                        v-if="item['details'].content"
                    />
                  </template>
                </el-popover>
              </div>
              <template #footer>
                <div class="flex items-center">
                  <div
                      class="w-[60%] overflow-hidden text-ellipsis whitespace-nowrap"
                  >
                    #{{ item.formName }}
                  </div>
                  <div class="flex-1 justify-end">
                    <el-button
                        size="small"
                        link
                        @click="loadFormData(item.idDynamicForm)"
                        icon="plus"
                    >{{ i18n("dyform.template.load") }}
                    </el-button>
                  </div>
                </div>
              </template>
            </el-card>
          </el-scrollbar>
        </div>
      </template>

      <!-- Help Tab -->
      <template v-if="tabModel === 'help'">
        <div class="help-placeholder">
          <star-horse-icon icon-class="help" size="48px" style="color: #c0c4cc"/>
          <p class="help-text">{{ i18n("dyform.tab.help") }}</p>
        </div>
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
      content: '';
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

/* ====== Template Tab ====== */
.template-content {
  height: 100%;
  padding: 8px;
}

.temp-card {
  width: 100% !important;
  padding: 0 !important;
  margin: 0 !important;
  height: 250px !important;
  box-shadow: none !important;
  margin-bottom: 10px !important;
  border: 1px solid #ebeef5;
  border-radius: 8px;
}

/* ====== DB Tab ====== */
.db-tab-content {
  height: 100%;
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
