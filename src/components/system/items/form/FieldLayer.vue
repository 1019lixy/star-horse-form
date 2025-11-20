<script setup lang="ts" name="FieldLayer">
import {computed, onMounted, ref, watch} from "vue";
import {analysisCompDatas, piniaInstance, SelectOption, useDesignFormStore} from "star-horse-lowcode";
import {i18n} from "@/lang/index.js";

const designForm = useDesignFormStore(piniaInstance);
const compList = computed(() => designForm.compList);
const compNames = ref<SelectOption[]>([]);
const dataChange = (data: any) => {
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
const init = () => {
  let {selectList} = analysisCompDatas(compList);
  compNames.value = selectList;
};
onMounted(() => {
  init();
});
watch(() => compList.value, (val: any) => {
  init();
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
