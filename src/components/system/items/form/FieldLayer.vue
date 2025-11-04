<script setup lang="ts" name="FieldLayer">
import {computed, onMounted} from "vue";
import {piniaInstance, useDesignFormStore} from "star-horse-lowcode";
import {i18n} from "@/lang/index.js";

const designForm = useDesignFormStore(piniaInstance);
const compNames = computed(() => designForm.forceLoadCompNames());
const dataChange = (data: any) => {
  console.log(data);
  if (!data) {
    return;
  }

  const compItem = designForm.selectItemById(data.id);
  if (!compItem) {
    console.log("未找到组件");
    return;
  }
  designForm.selectItem(compItem, compItem.itemType, "");
  // 新增：触发滚动定位
  const event = new CustomEvent("scroll-to-field", {detail: data.id});
  window.dispatchEvent(event);
};
onMounted(() => {
});
</script>
<template>
  <star-horse-tree
      ref="starHorseTreeRef"
      :expand="true"
      :treeTitle="i18n('dyform.field.list.title')"
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
