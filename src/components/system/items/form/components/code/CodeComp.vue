<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {analysisCompDatas, getDesignFormStore} from "star-horse-lowcode";
import {FormConfig} from "@/components/types/FormConfig";

const props = defineProps<{
  optional: FormConfig;
}>();
let designForm = getDesignFormStore();
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let compSize = computed(() => props.optional?.compSize ?? "default");
let tabName = ref<string>("vue3");
let pageInfo = ref<any>({});
const init = async () => {
  let {fieldList, searchItemList} = analysisCompDatas(compList);
  pageInfo.value["searchFormData"] = {
    fieldList: searchItemList,
  };
  pageInfo.value["tableFieldList"] = {
    fieldList,
  };
};

onMounted(async () => {
  await init();
});
</script>
<template>
  <el-tabs v-model="tabName" type="border-card">
    <el-tab-pane name="vue3" label="Vue3">
      <vue3 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="vue2" label="Vue2">
      <vue2 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="react" label="React">
      <react :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="json" label="Json代码">
      <div class="flex justify-end my-3">
        <el-button type="primary" @click="exportCode">导出代码</el-button>
      </div>
      <star-horse-json-editor currentMode="json" v-model="compList"/>
    </el-tab-pane>
  </el-tabs>
</template>
<style scoped lang="scss">
.code-container {
  height: 100%;
  overflow: hidden;
}
</style>
