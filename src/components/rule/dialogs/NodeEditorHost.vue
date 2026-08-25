<template>
  <component
    :is="editorDef"
    v-if="editorDef && store.editor.visible"
    :node-data="nodeData"
    :item-index="store.editor.itemIndex"
    :variables="store.ruleData.variables"
    @save="onSave"
    @close="store.closeEditor"
  />
</template>

<script setup lang="ts">
/**
 * 统一节点编辑器宿主
 *
 * 根据 Store 中当前的编辑目标节点，从注册表解析该节点的
 * editor 组件并动态渲染；保存补丁统一写回节点数据。
 * 设计器不为任何具体节点维护弹窗状态。
 */
import {computed} from "vue";
import {useRuleDesignerStore} from "../ruleDesignerStore";
import {getNodeDef, resolveNodeType} from "../nodeTypes";

const store = useRuleDesignerStore();

const nodeType = computed(() =>
  resolveNodeType({type: canvasNode.value?.type, data: canvasNode.value?.data}),
);
const canvasNode = computed(() =>
  store.canvasApi?.getNode(store.editor.nodeId),
);
const nodeData = computed(
  () => canvasNode.value?.data ?? store.editingNodeData ?? {},
);

/** 该节点的编辑器组件（未注册 editor 的节点无弹层） */
const editorDef = computed(() => getNodeDef(nodeType.value)?.editor);

const onSave = (patch: Record<string, any>) => {
  store.saveEditor(patch);
  store.closeEditor();
};
</script>