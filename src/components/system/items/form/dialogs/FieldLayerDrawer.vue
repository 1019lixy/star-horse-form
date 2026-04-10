<script setup lang="ts">
import FieldLayer from "@/components/system/items/form/FieldLayer.vue";
import {i18n} from "@/lang/index.js";

const emit = defineEmits<{
  (e: "update:visible", visible: boolean): void;
  (e: "dataBind", data: any): void;
}>();

defineProps<{
  visible: boolean;
  operType: string;
}>();

const updateVisible = (val: boolean) => {
  emit("update:visible", val);
};
const dataBind = (data: any) => {
  emit("dataBind", data);
}
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
      <h4>{{ i18n("dyform.field.layer.title") }}</h4>
    </template>
    <template #default>
      <FieldLayer :operType="operType" @dataBind="dataBind"/>
    </template>
  </el-drawer>
</template>
