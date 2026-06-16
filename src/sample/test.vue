<script setup lang="ts" name="Areainfo">
import {onMounted, ref} from "vue";
import {i18n} from "@/lang";
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
    <FormTestValid/>
<!--    <el-tabs v-model="actName" class="h-full">
      <el-tab-pane name="a" :label="i18n('dyform.sample.dynamicForm')">
        <FormTestValid/>
      </el-tab-pane>
      <el-tab-pane name="b" :label="i18n('dyform.sample.dynamicList')">
        <DytableContainerValid/>
      </el-tab-pane>
      <el-tab-pane name="c" :label="i18n('dyform.sample.dynamicBox')">
        <BoxContainerDemo/>
      </el-tab-pane>
      <el-tab-pane name="g" :label="i18n('dyform.sample.dynamicList')">
        <TableContainerValid/>
      </el-tab-pane>

    </el-tabs>-->
  </div>
</template>
<style lang="scss" scoped>
svg {
  border: 1px solid blue;
}
</style>
