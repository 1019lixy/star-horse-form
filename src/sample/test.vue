<script setup lang="ts" name="Areainfo">
import {onMounted, ref, defineAsyncComponent} from "vue";
import {i18n} from "@/lang";

// 懒加载重量级组件，按需初始化
const FormTestValid = defineAsyncComponent(() => import("@/sample/FormTestValid.vue"));
const RuleTestValid = defineAsyncComponent(() => import("@/sample/RuleTestValid.vue"));

const visible = ref<boolean>(false);
const actName = ref<string>("form");
const initData = async () => {
};
onMounted(() => {
  initData();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-auto">
    <el-tabs v-model="actName">
      <el-tab-pane label="表单设计" name="form">
        <FormTestValid v-if="actName === 'form'" />
      </el-tab-pane>
      <el-tab-pane label="规则设计" name="rule">
        <RuleTestValid v-if="actName === 'rule'" />
      </el-tab-pane>
    </el-tabs>
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
