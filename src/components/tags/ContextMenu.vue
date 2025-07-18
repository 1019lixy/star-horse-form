<script setup lang="ts" name="ContextMenu">
import { PropType, ref } from "vue";
import type { RouteLocationNormalizedLoaded } from "vue-router";

const emit = defineEmits(["visibleChange"]);
const props = defineProps({
  schema: {
    type: Array<any>,
    default: () => [],
  },
  trigger: {
    type: String as PropType<"click" | "hover" | "focus" | "contextmenu">,
    default: "contextmenu",
  },
  tagItem: {
    type: Object as PropType<RouteLocationNormalizedLoaded>,
    default: () => ({}),
  },
});
const command = (item: any) => {
  item.command && item.command(item);
};
const visibleChange = (visible: boolean) => {
  emit("visibleChange", visible, props.tagItem);
};
const elDropdownMenuRef = ref(null);
defineExpose({
  elDropdownMenuRef,
  tagItem: props.tagItem,
});
</script>
<template>
  <el-dropdown
    ref="elDropdownMenuRef"
    :trigger="trigger"
    placement="bottom-start"
    @command="command"
    @visible-change="visibleChange"
  >
    <slot></slot>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="(item, index) in schema"
          :key="`star_horse${index}`"
          :divided="item.divided"
          :disabled="item.disabled"
          :command="item"
        >
          <star-horse-icon
            :icon-class="item.icon"
            style="color: var(--star-horse-style)"
          />
          {{ item.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
