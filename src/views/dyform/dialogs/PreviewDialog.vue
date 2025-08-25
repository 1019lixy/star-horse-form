<script setup lang="ts">
import { ref } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
}>();

const props = defineProps<{
  visible: boolean;
  compSize: string;
  list: any[];
}>();

const closeAction = () => {
  emit("close");
};

const previewFormRef = ref();
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    :title="'表单预览'"
    :source="3"
  >
    <form-preview :list="list" ref="previewFormRef"/>
  </star-horse-dialog>
</template>