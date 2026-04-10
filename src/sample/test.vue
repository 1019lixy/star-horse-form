<script setup lang="ts" name="Areainfo">
import {onMounted, ref} from "vue";
import DytableContainerValid from "@/sample/DytableContainerValid.vue";
import BoxContainerDemo from "@/sample/BoxContainerDemo.vue";
import TableContainerValid from "@/sample/TableContainerValid.vue";
import FormTestValid from "@/sample/FormTestValid.vue";

const visible = ref<boolean>(false);
const actName = ref<string>("a");
const initData = async () => {
};
onMounted(() => {
  initData();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-auto">
    <el-tabs v-model="actName" class="h-full">
      <el-tab-pane name="a" label="动态表单">
        <FormTestValid/>
      </el-tab-pane>
      <el-tab-pane name="b" label="动态列表">
        <DytableContainerValid/>
      </el-tab-pane>
      <el-tab-pane name="c" label="动态Box">
        <BoxContainerDemo/>
      </el-tab-pane>
      <el-tab-pane name="g" label="动态列表">
        <TableContainerValid/>
      </el-tab-pane>

    </el-tabs>
  </div>
</template>
<style lang="scss" scoped>
svg {
  border: 1px solid blue;
}
</style>
