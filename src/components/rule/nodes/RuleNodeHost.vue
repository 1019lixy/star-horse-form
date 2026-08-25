<template>
  <component
    :is="resolved"
    v-bind="$attrs"
    :id="id"
    :type="type"
    :data="data"
    @edit="emit('host-edit')"
    @[uiEvents?.editItemEvent]="(i: number) => emit('host-edit-item', i)"
    @[uiEvents?.deleteItemEvent]="(i: number) => emit('host-delete-item', i)"
    @updateNodeData="(p: Record<string, any>) => emit('host-update-data', p)"
  />
</template>

<script setup lang="ts">
/**
 * 规则节点动态宿主
 *
 * - 渲染：按注册表解析指定类型的 component，缺省回退 GenericNode；
 * - 交互：将节点组件 emit 的 edit / 编辑列表项 / 删除列表项事件
 *   （事件名由注册表 uiEvents 描述）归一化为 host-edit /
 *   host-edit-item / host-delete-item 向上转发，
 *   设计器监听统一动作即可，无需感知具体节点类型。
 *
 * 未声明的插槽属性（selected / events 等）经 $attrs 原样透传。
 */
import {computed, type Component} from "vue";
import {getNodeDef} from "../nodeTypes";
import GenericNode from "./GenericNode.vue";

const props = defineProps<{
  id?: string;
  type?: string;
  data?: any;
}>();

const emit = defineEmits<{
  (e: "host-edit"): void;
  (e: "host-edit-item", index: number): void;
  (e: "host-delete-item", index: number): void;
  (e: "host-update-data", patch: Record<string, any>): void;
}>();

const def = computed(() => getNodeDef(props.type || ""));
const resolved = computed<Component>(
  () => (def.value?.component as Component) || (GenericNode as Component),
);
const uiEvents = computed(() => def.value?.uiEvents);
</script>
