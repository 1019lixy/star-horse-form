<script setup lang="ts">
import FieldLayer from "../FieldLayer.vue";

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
}>();

const props = defineProps<{
  visible: boolean;
}>();

const updateVisible = (val: boolean) => {
  emit("update:visible", val);
};
</script>

<template>
  <el-drawer
    :model-value="visible"
    direction="ltr"
    size="20%"
    :with-header="false"
    :show-close="false"
    @update:model-value="updateVisible"
  >
    <template #header>
      <h4>表单属性层级</h4>
    </template>
    <template #default>
      <FieldLayer />
    </template>
  </el-drawer>
</template>