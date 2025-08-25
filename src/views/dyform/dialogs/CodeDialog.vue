<script setup lang="ts">
const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

const props = defineProps<{
  visible: boolean;
  compSize: string;
}>();

const closeAction = () => {
  emit("close");
};

const codeDoSave = () => {
  emit("save");
};
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    @closeAction="closeAction"
    :selfFunc="true"
    :source="3"
    :full-screen="true"
    :compSize="compSize"
    @merge="codeDoSave"
    :title="'代码'"
  >
    <code-comp />
  </star-horse-dialog>
</template>