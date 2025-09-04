<script setup lang="ts">
import {useFlexDesignStore} from "@/store/FlexDesign";
import {piniaInstance, uuid} from "star-horse-lowcode";
import {computed, defineOptions, onBeforeUnmount, onMounted, ref} from "vue";
import { componentConfigs } from "@/components/formcomp/pageitems/componentConfig";

defineOptions({
  name: "FlexItem",
});
const props = defineProps({
  itemId: {type: String, required: true},
  type: {type: String, default: "flex"},
  direction: {type: String, default: "row"},
  previewMode: {type: Boolean, default: false}, // Add previewMode prop
});
const emit = defineEmits(["selectItem", "selectComponent"]);
const flexDesign = useFlexDesignStore(piniaInstance);
const itemStyle = computed(() => flexDesign.getItem(props.itemId));
const compList = computed(() => flexDesign.getComp(props.itemId));
const currentId = computed(() => flexDesign.getCurrentItem());
const containerDirection = computed(() => flexDesign.getContainerDirection());

// Only allow selection if not in preview mode
const selectItem = () => {
  if (!props.previewMode) {
    flexDesign.setCurrentItem(props.itemId);
    emit("selectItem", props.itemId);
  }
};

// Add this new function to handle component selection within the draggable area
const selectComponent = (componentId: string) => {
  if (!props.previewMode) {
    // Find which item this component belongs to
    flexDesign.setCurrentItem(props.itemId);
    emit("selectItem", props.itemId);
    // Also emit a specific event for component selection
    emit("selectComponent", props.itemId, componentId);
  }
};

// Only allow deletion if not in preview mode
const deleteItem = () => {
  if (!props.previewMode) {
    flexDesign.delItem(props.itemId);
  }
};

const onDragAdd = (evt: any, list: any[]) => {
  if (!props.previewMode) {
    // Access the cloned data from the draggable event
    // The cloned data is available in evt.added.element when using vuedraggable with clone function
    const cloneData = evt.added?.element;
    if (cloneData) {
      // Create a new component with default values from componentConfig
      const componentName = `${cloneData.name}-item`;
      const componentConfig = componentConfigs[componentName];
      
      // Initialize properties with default values
      const preps: Record<string, any> = {};
      if (componentConfig) {
        componentConfig.properties.forEach(prop => {
          // Use default value if defined, otherwise use empty value based on type
          if (prop.defaultValue !== undefined) {
            preps[prop.name] = prop.defaultValue;
          } else {
            // Set appropriate empty values based on type
            switch (prop.type) {
              case 'input':
              case 'textarea':
              case 'select':
              case 'color':
              case 'date':
              case 'time':
              case 'json':
              case 'code':
                preps[prop.name] = '';
                break;
              case 'number':
                preps[prop.name] = 0;
                break;
              case 'switch':
              case 'checkbox':
                preps[prop.name] = false;
                break;
              case 'apiConfig':
                preps[prop.name] = {};
                break;
              default:
                preps[prop.name] = '';
            }
          }
        });
      } else {
        // If no component config found, at least set some basic properties
        preps['content'] = '请输入展示内容'; // Default for content components
      }
      
      // Create the new component object
      const newComponent = {
        id: uuid(),
        name: cloneData.name,
        label: cloneData.label,
        preps: preps,
        itemType: "item"
      };
      
      // Add the component to the list
      list.push(newComponent);
      
      // Add the component to the store
      flexDesign.addComp(props.itemId, newComponent);
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
  <div :style="itemStyle" @click.stop="selectItem" class="item-info" ref="resizeContainer" :class="{
    'w-full': type == 'grid',
    'item-width': containerDirection.includes('column'),
    'preview-mode': previewMode
  }">
    <div class="absolute top-0 right-0 z-10" @click.stop="deleteItem" v-if="!previewMode">
      <star-horse-icon iconClass="delete" :cursor="'pointer'" :color="'var(--star-horse-danger)'" title="删除"/>
    </div>


    <div v-if="!previewMode && currentId == itemId" class="absolute top-0 left-0">
      <star-horse-icon iconClass="check" :color="'var(--star-horse-style)'" title="选中"/>
    </div>
    <div class="resize-handle right" @mousedown.prevent="startResize('right', $event)" v-if="!previewMode"/>
    <div class="resize-handle bottom" @mousedown.prevent="startResize('bottom', $event)" v-if="!previewMode"/>

    <div class="relative flex flex-col h-full w-full overflow-hidden min-w-0 max-w-full">
      <draggable @add="(evt: Event) => onDragAdd(evt, compList)" class="w-full h-full min-w-[0]" tag="div"
                 group="starHorseGroup" ghost-class="ghost" :list="compList" :itemKey="uuid()" :disabled="previewMode">
        <template #item="{ element: data, index }">
          <div class="overflow-visible flex flex-col flex-wrap w-full" :class="{ 'h-full': compList.length == 1 }"
               :data-field-id="data.id" :key="data.id" @click.stop="selectComponent(data.id)">
            <component :key="data.id" :field="data" :isDesign="!previewMode" :index-of-parent-list="index"
                       :is="data.name + '-item'" v-bind="data.preps" style="min-width: 0; width: 100%"/>
          </div>
        </template>
      </draggable>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.item-width {
  width: 100% !important;
}

.item-info {
  border-radius: 3px;
  padding: 1rem 1.5rem;
  cursor: pointer;
  min-width: 7rem;
  min-height: 5.5rem;
  max-width: 100%;
  width: inherit;
  background: #fefefe;
  /*   margin: 0 auto; */
  border: 3px solid var(--star-horse-style);
  position: relative;
  overflow: hidden;
  transition: background 0.3s ease,
  box-shadow 0.3s ease;

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
      height: 40px;
      top: 50%;
      right: -5px;
      /* 调整到边框中间 */
      transform: translateY(-40%);
    }

    &.bottom {
      cursor: row-resize;
      width: 40px;
      height: 10px;
      bottom: -5px;
      left: 50%;
      /* 调整到边框中间 */
      transform: translateX(-40%);
    }
  }
}
</style>
