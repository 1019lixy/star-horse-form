<script setup lang="ts">
import { PageCompInfo } from "@/components/types/PageLayoutComp.js";
import { useFlexDesignStore } from "@/store/FlexDesign";
import { piniaInstance, uuid } from "star-horse-lowcode";
import { computed, defineOptions, ref } from "vue";

defineOptions({
  name: "PageSplitterItem",
});
const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});
const flexDesign = useFlexDesignStore(piniaInstance);

const currentId = computed(() => flexDesign.getCurrentItem());
const draggingItem = computed(() => flexDesign.getDraggingItem());
const leftSplitterList = ref<any>([]);
const rightSplitterList = ref<any>([]);
const selectComponent = (componentId: string) => {
  flexDesign.setCurrentItem(componentId);
};
const onDragAdd = (evt: Event, splitterList: any) => {
  if (draggingItem.value) {
    selectComponent(draggingItem.value.id);
  }
};
</script>

<template>
  <div
    style="height: 100%; box-shadow: var(--el-border-color-light) 0px 0px 10px"
    :style="styles"
  >
    <el-splitter v-bind="preps">
      <el-splitter-panel collapsible size="30%">
        <div
          class="relative flex flex-col h-full w-full overflow-hidden min-w-0 max-w-full"
        >
          <draggable
            @add="(evt: Event) => onDragAdd(evt, leftSplitterList)"
            class="w-full h-full min-w-[0]"
            tag="div"
            group="starHorseGroup"
            ghost-class="ghost"
            :list="leftSplitterList"
            :itemKey="uuid()"
          >
            <template #item="{ element: data, index }">
              <div
                class="overflow-visible flex flex-col flex-wrap w-full"
                :data-field-id="data.id"
                :key="data.id"
              >
                <component
                  :key="data.id"
                  :field="data"
                  :isDesign="true"
                  :index-of-parent-list="index"
                  :is="data.name + '-item'"
                  v-bind="data.preps"
                  style="min-width: 0; width: 100%"
                />
              </div>
            </template>
          </draggable>
        </div>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div
          class="relative flex flex-col h-full w-full overflow-hidden min-w-0 max-w-full"
        >
          <draggable
            @add="(evt: Event) => onDragAdd(evt, rightSplitterList)"
            class="w-full h-full min-w-[0]"
            tag="div"
            group="starHorseGroup"
            ghost-class="ghost"
            :list="rightSplitterList"
            :itemKey="uuid()"
          >
            <template #item="{ element: data, index }">
              <div
                class="overflow-visible flex flex-col flex-wrap w-full"
                :data-field-id="data.id"
                :key="data.id"
                @click.stop="selectComponent(data.id)"
              >
                <component
                  :key="data.id"
                  :field="data"
                  :isDesign="true"
                  :index-of-parent-list="index"
                  :is="data.name + '-item'"
                  v-bind="data.preps"
                  style="min-width: 0; width: 100%"
                />
              </div>
            </template>
          </draggable>
        </div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style scoped lang="scss"></style>
