<script setup lang="ts">
import { defineOptions, onMounted, ref } from "vue";
import { pageCompList } from "@/utils/layoutcomp";
import { PageCompItem } from "@/components/types/PageLayoutComp";
import SvgLoader from "../SvgLoader.vue";
import { piniaInstance, uuid } from "star-horse-lowcode";
import { useFlexDesignStore } from "@/store/FlexDesign.js";

defineOptions({
  name: "PageCompPanel",
});
const props = defineProps({});
const flexDesign = useFlexDesignStore(piniaInstance);
const emit = defineEmits(["selectItem"]);
const activeNames = ref<string[]>(["a", "b", "c"]);
const onContainerCopy = (data: PageCompItem) => {
  let item = JSON.parse(JSON.stringify(data));
  item.id = uuid();
  flexDesign.setDraggingItem(item);
  return item;
};
const addElement = (item: PageCompItem, type: string) => {};
const init = () => {};
onMounted(() => {
  init();
});
</script>
<template>
  <div class="field-area">
    <el-scrollbar height="100%">
      <el-collapse class="starhorse-collapse" v-model="activeNames">
        <template v-for="(item, index) in pageCompList" :key="index">
          <el-collapse-item :name="item.id">
            <template #title>
              <div
                class="collapse-item-title title h-full flex justify-between"
              >
                <div class="flex flex-row items-center h-full">
                  {{ item.label }}
                </div>
                <star-horse-icon
                  :icon-class="item.icon"
                  size="24px"
                  style="color: var(--star-horse-style); margin-right: 10px"
                />
              </div>
            </template>
            <draggable
              :clone="onContainerCopy"
              :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
              :sort="false"
              animation="300"
              ghost-class="ghost"
              item-key="id"
              tag="ul"
              :list="item.items"
            >
              <template #item="{ element }">
                <li
                  class="field-item h-[70px]!"
                  @dblclick="addElement(element, item.name)"
                  :title="element.label"
                >
                  <SvgLoader
                    :path="'comp/' + element.icon"
                    size="24px"
                    style="color: var(--star-horse-style)"
                  />
                  <i>{{ element.label }}</i>
                </li>
              </template>
            </draggable>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped>
i {
  font-style: normal;
  font-size: 12px;
}

// Enhanced styling for the collapse component with grid layout
:deep(.starhorse-collapse) {
  border: none;
  background: transparent;

  .el-collapse-item {
    margin-bottom: 16px;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
    border: 1px solid #e4e7ed;
    transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
      transform: translateY(-3px);
    }

    .el-collapse-item__header {
      background: linear-gradient(120deg, #f0f2f5, #ffffff);
      border-bottom: 1px solid #e4e7ed;
      height: 56px;
      padding: 0 20px;
      font-weight: 600;
      color: #303133;
      font-size: 16px;

      .collapse-item-title {
        letter-spacing: 0.5px;

        .star-horse-icon {
          transition: transform 0.4s ease;
          font-size: 20px;
        }
      }

      &.is-active {
        .star-horse-icon {
          transform: rotate(180deg);
        }
      }
    }

    .el-collapse-item__wrap {
      background: #ffffff;
      border-radius: 0 0 12px 12px;

      .el-collapse-item__content {
        padding: 20px;
      }
    }
  }
}

// Grid layout for field items - exactly two per row as per standards
.field-area {
  .el-scrollbar__view {
    padding: 8px;
  }
}

// Optimized styling for individual field items (li elements) with image on top and text below
:deep(.el-collapse-item__content) {
  ul {
    display: grid;
    grid-template-columns: repeat(
      2,
      1fr
    ); // Exactly two items per row as specified
    gap: 5px; // Proper spacing between items
    padding: 0;
    margin: 0;

    li {
      // Large square cells as requested (大方格)
      height: 70px; // Reduced height to match the class
      padding: 8px 6px; // Further reduced padding
      border-radius: 8px;
      background: linear-gradient(145deg, #ffffff, #f8f9fa);
      border: 2px solid #e4e7ed;
      cursor: pointer;
      transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center; // Center content vertically
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
      position: relative;
      overflow: hidden;

      // Add a subtle inner glow effect
      &::after {
        content: "";
        position: absolute;
        top: 4px;
        left: 4px;
        right: 4px;
        bottom: 4px;
        border: 1px solid rgba(64, 158, 255, 0.1);
        border-radius: 6px;
        pointer-events: none;
      }

      &:hover {
        transform: translateY(-4px) scale(1.02);
        border-color: #409eff;
        box-shadow: 0 12px 24px rgba(64, 158, 255, 0.2);
        background: linear-gradient(145deg, #ffffff, #f0f8ff);

        &::after {
          border-color: rgba(64, 158, 255, 0.3);
        }
      }

      &:active {
        transform: translateY(-2px) scale(1.01);
        box-shadow: 0 8px 20px rgba(64, 158, 255, 0.25);
      }

      // Style for the SVG loader (component icon)
      .svg-loader {
        margin-bottom: 5px; // Reduced margin
        transition: transform 0.3s ease;
        flex-shrink: 0; // Prevent icon from shrinking
        width: 24px;
        height: 24px;
      }

      // Style for the component label text
      i {
        font-size: 11px; // Reduced font size
        font-weight: 500;
        color: #606266;
        text-align: center;
        line-height: 1.2; // Reduced line height
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 0; // Prevent text from shrinking
      }

      // Hover effect for the icon
      &:hover .svg-loader {
        transform: scale(1.1);
      }
    }
  }
}
</style>
