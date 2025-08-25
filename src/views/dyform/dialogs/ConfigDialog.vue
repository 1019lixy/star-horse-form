<script setup lang="ts">
import { ref, nextTick } from "vue";

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save"): void;
  (e: "saveDraft"): void;
}>();

const props = defineProps<{
  visible: boolean;
  compSize: string;
}>();

const formPropertyRef = ref();

const closeAction = () => {
  emit("close");
};

const doSave = (isDraft: boolean = false) => {
  if (isDraft) {
    emit("saveDraft");
  } else {
    emit("save");
  }
};

const analysisDynamicFields = (formData: any) => {
  nextTick(() => {
    if (formPropertyRef.value) {
      formPropertyRef.value.analysisDynamicFields(formData);
    }
  });
};

defineExpose({
  analysisDynamicFields
});
</script>

<template>
  <star-horse-dialog
    :dialogVisible="visible"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    @merge="() => doSave(false)"
    :title="'表单配置'"
  >
    <FormPropertyPanel ref="formPropertyRef" />
    <template #extend>
      <el-button
        @click="() => doSave(true)"
        style="
          background: var(--star-horse-style);
          color: var(--star-horse-white);
        "
        :size="compSize"
      >
        <star-horse-icon
          icon-class="short_save"
          cursor="pointer"
          style="color: var(--star-horse-white)"
        />
        暂存
      </el-button>
    </template>
  </star-horse-dialog>
</template>