<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import {
  dynamicFormContextMenuData,
  itemCheck,
  uuid,
} from "star-horse-lowcode";
import { i18n } from "@/lang/index";

const emit = defineEmits<{
  (e: "dragAdd", event: Event, dataList: Array<any>): void;
  (e: "contextMenu", event: MouseEvent): void;
  (e: "update:formData", value: any): void;
}>();

defineProps<{
  list: any[];
  formData: any;
  formInfo: any;
  isDragging: boolean;
  currentPageClass: string;
}>();

const onDragAdd = (evt: Event, dataList: Array<any>) => {
  emit("dragAdd", evt, dataList);
};

const contextMenu = (evt: MouseEvent) => {
  emit("contextMenu", evt);
};

const dynamicFormRef = ref();
const contentMenuRef = ref();
const formContainerRef = ref<HTMLElement | null>(null);

// Handle scroll to field event
const handleScrollToField = (event: Event) => {
  const customEvent = event as CustomEvent;
  const fieldId = customEvent.detail;
  scrollToField(fieldId);
};

// Scroll to the specified field (supports nested components via data-field-id)
const scrollToField = (fieldId: string) => {
  if (!formContainerRef.value) return;

  const fieldElement = formContainerRef.value.querySelector(
    `[data-field-id="${fieldId}"]`,
  );
  if (fieldElement) {
    // Get container and element positions
    const container = formContainerRef.value;
    const elementRect = fieldElement.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    // Check if element is outside the visible area
    const isAbove = elementRect.top < containerRect.top;
    const isBelow = elementRect.bottom > containerRect.bottom;

    if (isAbove || isBelow) {
      fieldElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }
};
const checkFormItem = (item: any) => {
  return item?.itemType != "table";
};
onMounted(() => {
  // Add event listener for scroll-to-field event
  window.addEventListener("scroll-to-field", handleScrollToField);
});

onUnmounted(() => {
  // Remove event listener
  window.removeEventListener("scroll-to-field", handleScrollToField);
});
</script>

<template>
  <sh-form
    ref="dynamicFormRef"
    :needScroller="false"
    class="design-form-container"
    :class="{ 'dragging-area': isDragging }"
    :disabled="formInfo['disabled'] == 'Y'"
    :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'Y'"
    :inline="formInfo.inline == 'Y'"
    :inline-message="formInfo['inlineMessage'] == 'Y'"
    :label-position="formInfo['labelPosition']"
    :label-suffix="formInfo['labelSuffix']"
    :label-width="formInfo['labelWidth']"
    :dataForm="formData"
    @update:dataForm="$emit('update:formData', $event)"
    :require-asterisk-position="formInfo['requireAsteriskPosition']"
    :rules="formInfo.rules || {}"
    :scroll-to-error="formInfo['scrollToError'] == 'Y'"
    :show-message="formInfo['showMessage'] == 'Y'"
    :size="'default'"
    :status-icon="formInfo['statusIcon'] == 'Y'"
    :validate-on-rule-change="formInfo['validateOnRuleChange'] == 'Y'"
    style="width: 100% !important; position: relative"
  >
    <!-- Empty Canvas State -->
    <template v-if="list.length === 0">
      <div
        class="empty-canvas"
        :style="{
          margin: '0 auto',
          width:
            currentPageClass == 'main-design-phone'
              ? '420px'
              : currentPageClass == 'main-design-pad'
                ? '600px'
                : '100%',
        }"
      >
        <div class="empty-illustration">
          <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <!-- Form outline -->
            <rect x="30" y="10" width="100" height="100" rx="8" fill="#f5f7fa" stroke="#dce1e8" stroke-width="1.5"/>
            <!-- Header bar -->
            <rect x="30" y="10" width="100" height="20" rx="8" fill="#e8eaed"/>
            <rect x="30" y="22" width="100" height="8" fill="#e8eaed"/>
            <!-- Form fields -->
            <rect x="42" y="40" width="30" height="4" rx="2" fill="#c0c4cc"/>
            <rect x="42" y="48" width="76" height="8" rx="4" fill="#e8eaed" stroke="#dce1e8" stroke-width="0.5"/>
            <rect x="42" y="64" width="24" height="4" rx="2" fill="#c0c4cc"/>
            <rect x="42" y="72" width="76" height="8" rx="4" fill="#e8eaed" stroke="#dce1e8" stroke-width="0.5"/>
            <rect x="42" y="88" width="20" height="4" rx="2" fill="#c0c4cc"/>
            <rect x="42" y="96" width="76" height="8" rx="4" fill="#e8eaed" stroke="#dce1e8" stroke-width="0.5"/>
            <!-- Plus icon -->
            <circle cx="130" cy="90" r="14" fill="#409eff" fill-opacity="0.1" stroke="#409eff" stroke-width="1.5"/>
            <path d="M125 90H135M130 85V95" stroke="#409eff" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="empty-message">
          <h3>{{ i18n("dyform.designer.welcome") }}</h3>
          <p>{{ i18n("dyform.designer.instruction") }}</p>
          <div class="tips">
            <span class="tip-item">{{ i18n("dyform.designer.tip.drag") }}</span>
            <span class="tip-item">{{ i18n("dyform.designer.tip.config") }}</span>
            <span class="tip-item">{{ i18n("dyform.designer.tip.build") }}</span>
          </div>
        </div>
      </div>
    </template>
    <div
      ref="formContainerRef"
      :class="currentPageClass"
      @contextmenu="contextMenu"
      class="design-canvas"
    >
      <draggable
        @add="(evt: Event) => onDragAdd(evt, list)"
        tag="div"
        class="draggable-wrapper"
        group="starHorseGroup"
        :list="list"
        :itemKey="'id'"
        animation="200"
        ghost-class="drag-ghost"
        chosen-class="drag-chosen"
        drag-class="drag-active"
      >
        <template #item="{ element: data, index }">
          <div
            :class="{ 'comp-item': data.preps?.headerFlag == 'Y' }"
            class="design-field-item"
            :data-field-id="data.id"
            :key="data.id"
          >
            <component
              :key="data.id"
              :field="data"
              :isDesign="true"
              :formInfo="formInfo"
              :showFormItem="data?.itemType != 'table'"
              :index-of-parent-list="index"
              :is="itemCheck(data)"
              :formData="formData"
              @update:formData="$emit('update:formData', $event)"
            />
          </div>
        </template>
      </draggable>
    </div>
  </sh-form>
  <Teleport to="body">
    <ContentMenu
      ref="contentMenuRef"
      :menu-data="dynamicFormContextMenuData({}, {})"
    />
  </Teleport>
</template>
<style lang="scss" scoped>
:deep(.form-item-operation) {
  min-height: 45px;
}

.design-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #f0f2f5;
}

/* ====== Design Canvas ====== */
.design-canvas {
  flex: 1;
  overflow-y: auto;
  overflow-x: auto;
  scrollbar-width: thin;
  padding: 24px 16px 40px;
  position: relative;
  background:
    radial-gradient(circle, #dde0e4 1px, transparent 1px);
  background-size: 20px 20px;
  background-color: #f0f2f5;

  &::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c4cc;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }
}

.draggable-wrapper {
  min-height: 100%;
  width: 99%;
  margin: 0 auto;
  position: relative;
}

/* ====== Field Items ====== */
.design-field-item {
  position: relative;
  overflow: visible;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
}

/* ====== Component Toolbar Overflow Fix ====== */
:deep(.component-header-actions) {
  right: auto !important;
  min-width: 100%;
}

/* ====== Empty Canvas State ====== */
.empty-canvas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 32px;
  z-index: 0;
  pointer-events: none;
}

.empty-illustration {
  margin-bottom: 28px;
  opacity: 0.8;
}

.empty-message {
  h3 {
    color: #303133;
    font-size: 18px;
    margin-bottom: 8px;
    font-weight: 600;
  }

  p {
    color: #909399;
    font-size: 13px;
    line-height: 1.6;
    max-width: 420px;
    margin-bottom: 20px;
  }
}

.tips {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.tip-item {
  background: #ffffff;
  color: #606266;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  border: 1px solid #ebeef5;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

/* ====== Drag State ====== */
.dragging-area {
  background:
    radial-gradient(circle, #c8ddf5 1px, transparent 1px) !important;
  background-size: 20px 20px !important;
  background-color: #edf4ff !important;
}

/* ====== Drag & Drop Classes ====== */
:deep(.drag-ghost) {
  opacity: 0.4;
  background: #ecf5ff !important;
  border: 2px dashed #a0cfff !important;
  border-radius: 6px;
  min-height: 40px;
  transition: none !important;
}

:deep(.drag-chosen) {
  opacity: 0.9;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

:deep(.drag-active) {
  opacity: 0.6;
}
</style>
