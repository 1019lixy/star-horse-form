<script setup lang="ts">
import {i18n} from "@/lang/index.js";
import {StarHorseDialog} from "star-horse-lowcode";
import BatchEditFields from "@/components/system/items/form/BatchEditFields.vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
}>();

defineProps<{
  visible: boolean;
  compSize: string;
}>();

const closeAction = () => {
  emit("close");
};

</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="() => emit('save')"
      :title="i18n('dyform.batch.edit.title')"
      boxHeight="90%"
      boxWidth="70%"
  >
    <batch-edit-fields :compSize="compSize"/>
  </star-horse-dialog>
</template>
