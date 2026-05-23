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

// Scroll to the specified field
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
      // Use scrollIntoView with options for smooth scrolling
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
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <rect x="20" y="30" width="80" height="60" rx="4" fill="#E1E8ED" />
            <rect x="30" y="45" width="60" height="8" rx="4" fill="#A1AEBB" />
            <rect x="30" y="60" width="40" height="8" rx="4" fill="#A1AEBB" />
            <rect x="30" y="75" width="50" height="8" rx="4" fill="#A1AEBB" />
          </svg>
        </div>
        <div class="empty-message">
          <h3>{{ i18n("dyform.designer.welcome") }}</h3>
          <p>{{ i18n("dyform.designer.instruction") }}</p>
          <div class="tips">
            <span class="tip-item"
              >💡 {{ i18n("dyform.designer.tip.drag") }}</span
            >
            <span class="tip-item"
              >⚙️ {{ i18n("dyform.designer.tip.config") }}</span
            >
            <span class="tip-item"
              >🚀 {{ i18n("dyform.designer.tip.build") }}</span
            >
          </div>
        </div>
      </div>
    </template>
    <div
      ref="formContainerRef"
      :class="currentPageClass"
      @contextmenu="contextMenu"
      style="scrollbar-width: thin; padding-top: 32px"
      class="overflow-auto! relative"
    >
      <draggable
        @add="(evt: Event) => onDragAdd(evt, list)"
        tag="div"
        class="h-full w-[99%] mx-auto relative"
        group="starHorseGroup"
        :list="list"
        :itemKey="uuid()"
      >
        <template #item="{ element: data, index }">
          <div
            :class="{ 'comp-item': data.preps?.headerFlag == 'Y' }"
            class="overflow-visible relative my-[5px]"
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
:deep(.form-item-operation){
  min-height: 45px;
}
.design-form-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.design-canvas {
  flex: 1;
  min-height: 400px;
  position: relative;
  border-radius: 4px;
  overflow: hidden;
}

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
  padding: 20px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  margin: 20px;
  z-index: 0;
  pointer-events: none;
}

.empty-illustration {
  margin-bottom: 24px;
}

.empty-message {
  h3 {
    color: #1a1a1a;
    font-size: 20px;
    margin-bottom: 12px;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  p {
    color: #4d4d4d;
    font-size: 14px;
    line-height: 1.6;
    max-width: 500px;
    margin-bottom: 20px;
    text-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
  }
}

.tips {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.tip-item {
  background: #ffffff;
  color: #409eff;
  padding: 6px 12px;
  border-radius: 16px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  text-shadow: none;
}

.dragging-area {
  background:
    linear-gradient(45deg, #e6f7ff 25%, transparent 25%),
    linear-gradient(-45deg, #e6f7ff 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #e6f7ff 75%),
    linear-gradient(-45deg, transparent 75%, #e6f7ff 75%);
  background-size: 20px 20px;
  background-position:
    0 0,
    0 10px,
    10px -10px,
    -10px 0px;
}
</style>
