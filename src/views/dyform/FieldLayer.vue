<script setup lang="ts" name="FieldLayer">
import { computed, onMounted } from "vue";
import { piniaInstance, useDesignFormStore } from "star-horse-lowcode";

const designForm = useDesignFormStore(piniaInstance);

const draggingItem = computed(() => designForm.draggingItem);
const compNames = computed(() => designForm.loadCompNames());
const dataChange = (data: any) => {
  if (!data) {
    return;
  }
  const compItem = designForm.selectItemById(data.id);
  // designForm.setCurrentItemId(data.id);
  // designForm.setCurrentComp(compItem);
  designForm.selectItem(compItem, compItem.itemType, "");
  // 新增：触发滚动定位
  const event = new CustomEvent("scroll-to-field", { detail: data.id });
  window.dispatchEvent(event);
};
onMounted(() => {});
</script>
<template>
  <star-horse-tree
    ref="starHorseTreeRef"
    :expand="true"
    treeTitle="表单列表"
    @selectData="dataChange"
    v-model:treeDatas="compNames"
  />
</template>
<style scoped lang="scss">
.el-input-number,
.el-input-number-small {
  width: unset;
}
</style>
