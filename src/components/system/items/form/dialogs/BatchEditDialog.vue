<script setup lang="ts">
import {i18n} from "@/lang/index.js";
import BatchEditFields from "@/components/system/items/form/BatchEditFields.vue";
import {ref, watch} from "vue";

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
const dialogVisible = ref<boolean>(false);
watch(
  () => props.visible,
  (val) => {
    dialogVisible.value = val;
  },
  { immediate: true },
);
</script>

<template>
  <star-horse-panel
    v-model="dialogVisible"
    @closeAction="closeAction"
    :userAction="true"
    :compSize="compSize"
    @merge="() => emit('save')"
    :title="i18n('dyform.batch.edit.title')"
    boxHeight="90%"
    boxWidth="70%"
  >
    <batch-edit-fields :compSize="compSize" />
  </star-horse-panel>
</template>
