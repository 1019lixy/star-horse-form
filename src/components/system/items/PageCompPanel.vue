<script setup lang="ts">
import { defineOptions, onMounted, ref } from "vue";
import { pageCompList } from "@/utils/layoutcomp";
import { PageCompItem } from "@/components/types/PageLayoutComp";
import SvgLoader from "../SvgLoader.vue";

defineOptions({
  name: "PageCompPanel",
});
const props = defineProps({});
const emit = defineEmits(["selectItem"]);
const activeNames = ref<string[]>(["a", "b"]);
const onContainerCopy = (data: PageCompItem) => {
  return JSON.parse(JSON.stringify(data));
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
          <el-collapse-item name="a">
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
                  class="field-item"
                  @dblclick="addElement(element, item.name)"
                  :title="element.label"
                >
                  &nbsp;&nbsp;
                  <span>
                    <SvgLoader
                      :path="'comp/' + element.icon"
                      :size="'18px'"
                    /><i>{{ element.label }}</i>
                  </span>
                </li>
              </template>
            </draggable>
          </el-collapse-item>
        </template>
      </el-collapse>
    </el-scrollbar>
  </div>
</template>
<style lang="scss" scoped></style>
