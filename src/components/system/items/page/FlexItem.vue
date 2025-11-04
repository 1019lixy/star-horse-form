<script setup lang="ts">
import {useFlexDesignStore} from "@/store/FlexDesign";
import {DynamicNode, piniaInstance, uuid} from "star-horse-lowcode";
import {computed, defineOptions, onBeforeUnmount, onMounted, ref} from "vue";
import {i18n} from "@/lang/index";

defineOptions({
  name: "FlexItem",
});
const props = defineProps({
  itemId: {type: String, required: true},
  type: {type: String, default: "flex"},
  direction: {type: String, default: "row"},
  previewMode: {type: Boolean, default: false}, // Add previewMode prop
});
const emits = defineEmits(["contextAction", "selectItem", "selectComponent"]);
const flexDesign = useFlexDesignStore(piniaInstance);
const itemStyle = computed(() => flexDesign.getItem(props.itemId));
const compList = computed(() => flexDesign.getComp(props.itemId));
const currentId = computed(() => flexDesign.getCurrentItem());
const draggingItem = computed(() => flexDesign.getDraggingItem());
const containerDirection = computed(() => flexDesign.getContainerDirection());

// Add reactive variable to track selected component
const selectedComponentId = ref<string>("");

// Only allow selection if not in preview mode
const selectItem = () => {
  if (!props.previewMode) {
    flexDesign.setCurrentItem(props.itemId);
    emits("selectItem", props.itemId);
  }
};

// Add this new function to handle component selection within the draggable area
const selectComponent = (componentId: string) => {
  if (!props.previewMode) {
    // Find which item this component belongs to
    flexDesign.setCurrentItem(props.itemId);
    // emit("selectItem", props.itemId);
    // Also emit a specific event for component selection
    emits("selectComponent", props.itemId, componentId);
    // Set the selected component ID for highlighting
    selectedComponentId.value = componentId;
  }
};
const selectNode = (compInfo: any) => {
  selectedComponentId.value = compInfo.id;
  selectComponent(compInfo.id);
};

// Only allow deletion if not in preview mode
const deleteItem = () => {
  if (!props.previewMode) {
    flexDesign.delItem(props.itemId);
  }
};


const onDragAdd = (evt: any, list: any[]) => {
  if (!props.previewMode) {
    //  const cloneData = evt.item.__draggable_context.element;
    if (draggingItem.value) {
      selectComponent(draggingItem.value.id);
      // flexDesign.clearDraggingItem();
    }
  }
};

const resizeContainer = ref<HTMLElement>();
let startX = 0;
let startY = 0;
let startWidth = 0;
let startHeight = 0;
let resizeDirection = "";

// Only allow resizing if not in preview mode
const startResize = (dir: string, e: MouseEvent) => {
  if (props.previewMode) return;

  resizeDirection = dir;
  startX = e.clientX;
  startY = e.clientY;
  if (resizeContainer.value) {
    startWidth = resizeContainer.value.offsetWidth;
    startHeight = resizeContainer.value.offsetHeight;
    document.addEventListener("mousemove", handleResize);
    document.addEventListener("mouseup", stopResize);
  }
};

const handleResize = (e: MouseEvent) => {
  if (props.previewMode || !resizeContainer.value) return;

  const deltaX = e.clientX - startX;
  const deltaY = e.clientY - startY;
  if (resizeDirection === "right") {
    resizeContainer.value.style.width = `${startWidth + deltaX}px`;
  } else if (resizeDirection === "bottom") {
    resizeContainer.value.style.height = `${startHeight + deltaY}px`;
  }
};

const stopResize = () => {
  if (props.previewMode) return;

  removeListener();
  if (!resizeContainer.value) return;
  // 这里可以添加尺寸变化后的回调逻辑
  itemStyle.value.width = resizeContainer.value?.style?.width;
  itemStyle.value.height = resizeContainer.value?.style?.height;
};

const removeListener = () => {
  document.removeEventListener("mousemove", handleResize);
  document.removeEventListener("mouseup", stopResize);
};

const contextAction = (actionName: string, item: DynamicNode) => {
  if (actionName == "toTop") {
    if (!item.styles) {
      item.styles = {};
    }
    //获取compList.value中 zIndex 最大的值
    const maxZIndex = Math.max(...compList.value.map((comp: DynamicNode) => comp.styles?.zIndex || 0));
    item.styles.zIndex = maxZIndex + 1;
  } else if (actionName == "delete") {
    compList.value.splice(compList.value.findIndex((comp: DynamicNode) => comp.id == item.id), 1);
  }
  emits("contextAction", actionName, item);
};
onBeforeUnmount(() => {
  removeListener();
});

const init = () => {
};
onMounted(() => {
  init();
});
</script>

<template>
  <div
      :style="itemStyle"
      @click.stop="selectItem"
      class="item-info"
      ref="resizeContainer"
      :class="{
      'w-full': type == 'grid',
      'item-width': containerDirection.includes('column'),
      'preview-mode': previewMode,
      'item-selected': currentId == itemId && !previewMode,
    }"
  >
    <div class="absolute top-1 right-1 z-10 flex gap-1" v-if="!previewMode">

      <div class="flex items-center justify-center" @click.stop="deleteItem">
        <star-horse-icon
            iconClass="delete"
            :color="'var(--star-horse-danger)'"
            :title="i18n('system.delete')"
            class="text-xs"
        />
      </div>
    </div>

    <div
        class="resize-handle right"
        @mousedown.prevent="startResize('right', $event)"
        v-if="!previewMode"
    />
    <div
        class="resize-handle bottom"
        @mousedown.prevent="startResize('bottom', $event)"
        v-if="!previewMode"
    />

    <div class="relative flex flex-col h-full w-full overflow-hidden min-w-0 max-w-full">
      <draggable
          @add="(evt: Event) => onDragAdd(evt, compList)"
          class="w-full h-full min-w-[0] relative"
          tag="div"
          group="starHorseGroup"
          ghost-class="ghost"
          :list="compList"
          :itemKey="uuid()"
          :disabled="previewMode"
      >
        <template #item="{ element: data, index }">
          <StarHorseDraggable
              :key="data.id"
              :node="data"
              :isDesign="!previewMode"
              :isActive="selectedComponentId == data.id && !previewMode"
              @contextAction="contextAction"
              @selectNode="selectNode"
          >
            <component
                :key="data.id"
                :field="data"
                :isDesign="!previewMode"
                :index-of-parent-list="index"
                :is="data.name + '-item'"
                :preps="data.preps"
                :styles="data.styles || {}"
                style="min-width: 0; width: 100%"
            />
          </StarHorseDraggable>
        </template>
      </draggable>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.item-width {
  width: 100% !important;
  max-width: 100%;
}

.item-info {
  border-radius: 3px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  min-width: 7rem;
  min-height: 5.5rem;
  box-sizing: border-box;
  background: #fefefe;
  border: 3px solid var(--star-horse-style);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease,
  box-shadow 0.3s ease;
  flex-shrink: 1;

  &.item-selected {
    background-image: radial-gradient(
            circle at 100% 100%,
            rgba(64, 158, 255, 0.1) 15%,
            transparent 15.5%
    ),
    radial-gradient(
            circle at 0 100%,
            rgba(64, 158, 255, 0.1) 15%,
            transparent 15.5%
    ),
    radial-gradient(
            circle at 100% 0,
            rgba(64, 158, 255, 0.1) 15%,
            transparent 15.5%
    ),
    radial-gradient(
            circle at 0 0,
            rgba(64, 158, 255, 0.1) 15%,
            transparent 15.5%
    );
    background-size: 10px 10px;
    background-position: 1px 1px,
    1px 1px,
    1px 1px,
    1px 1px;
  }

  // In preview mode, remove interactive styles
  &.preview-mode {
    cursor: default;
    border: 1px solid #e4e7ed;

    &:hover {
      background: #fefefe;
      box-shadow: none;
    }
  }

  &:hover .resize-handle {
    opacity: 1; // 悬停时显示
  }

  .resize-handle {
    opacity: 0; // 默认隐藏
    transition: opacity 0.2s ease;
    position: absolute;
    z-index: 20;
    background: rgba(105, 97, 97, 0.8);
    border-radius: 3px;
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.1),
    inset 0 0 4px rgba(255, 255, 255, 0.8);
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.2);
      background: rgba(146, 164, 183, 0.9);
    }

    &.right {
      cursor: col-resize;
      width: 10px;
      height: 100px;
      top: 45%;
      right: 0;
      /* 调整到边框中间 */
      transform: translateY(-40%);
    }

    &.bottom {
      cursor: row-resize;
      width: 100px;
      height: 10px;
      bottom: -5px;
      left: 45%;
      /* 调整到边框中间 */
      transform: translateX(-40%);
    }
  }
}

.component-selected {
  border: 2px solid var(--star-horse-style);
  outline-offset: 2px;
  border-radius: 4px;
}
</style>
