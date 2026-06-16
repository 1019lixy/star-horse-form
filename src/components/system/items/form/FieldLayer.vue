<script setup lang="ts" name="FieldLayer">
import {computed, onMounted, ref, watch} from "vue";
import {analysisCompDatas, getDesignFormStore, SelectOption,} from "star-horse-lowcode";
import {i18n} from "@/lang/index.js";

const props = defineProps({
  operType: {type: String, required: false},
});
const emits = defineEmits(["dataBind"]);
const designForm = getDesignFormStore();
const compList = computed(() => designForm.compList);
const compNames = ref<SelectOption[]>([]);
// 缓存 id -> 组件 的映射，避免依赖 store 的 isCompListUpdated 缓存
const compMap = ref<Record<string, any>>({});
const dataChange = (data: any) => {
  if (!data) {
    return;
  }
  if (props.operType == "bind") {
    emits("dataBind", data);
  } else {
    const compItem = compMap.value[data.id];
    if (!compItem) {
      console.log("未找到组件");
      return;
    }
    designForm.selectItem(compItem, compItem.itemType, "");
    // 触发滚动定位
    const event = new CustomEvent("scroll-to-field", {detail: data.id});
    window.dispatchEvent(event);
  }
};
const init = () => {
  let {selectList, compListResult} = analysisCompDatas(compList);
  compNames.value = selectList;
  compMap.value = compListResult;
};
onMounted(() => {
  init();
});
watch(
    () => compList.value,
    () => {
      init();
    },
    {deep: true},
);
</script>
<template>
  <star-horse-tree
      ref="starHorseTreeRef"
      :expand="true"
      :showCode="true"
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
