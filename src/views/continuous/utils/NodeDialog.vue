<script setup lang="ts">
import {ref} from "vue";

const emit = defineEmits(["close", "save"]);
const props = defineProps<{
  visible: boolean;
  compSize: string;
}>();
const toolInfoRef = ref();
const closeAction = () => {
  emit("close");
};
const dataSubmit = () => {
  let node = toolInfoRef.value.getNode();
  emit("save", node);
};
</script>

<template>
  <star-horse-dialog
      :title="'节点列表'"
      :dialogVisible="visible"
      :self-func="true"
      @closeAction="closeAction"
      @merge="dataSubmit"
      :is-batch="false"
      boxHeight="80%"
      :is-show-btn-continue="false"
  >
    <ToolInfo ref="toolInfoRef" @selectNode="dataSubmit"/>
  </star-horse-dialog>
</template>
