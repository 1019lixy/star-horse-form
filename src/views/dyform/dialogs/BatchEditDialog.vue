<script setup lang="ts">
import {ref} from "vue";
import {i18n} from "@/lang";
import {StarHorseDialog} from "star-horse-lowcode";

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

const prepsModel = ref("one");
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
