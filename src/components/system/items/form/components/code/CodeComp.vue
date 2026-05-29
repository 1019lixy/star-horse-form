<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {i18n} from "@/lang";
import {analysisAppComps, analysisCompDatas, getDesignFormStore} from "star-horse-lowcode";
import {FormConfig} from "@/components/types/FormConfig";

const props = defineProps<{
  optional: FormConfig;
}>();
let designForm = getDesignFormStore();
let compList = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let compSize = computed(() => props.optional?.compSize ?? "default");
let tabName = ref<string>("vue3");
let codeStyle = ref<string>("pc");
let pageInfo = ref<any>({});
const init = async (type: string) => {
  if (type == "pc") {
    let {fieldList, searchItemList} = analysisCompDatas(compList);
    pageInfo.value["searchFormData"] = {
      fieldList: searchItemList,
    };
    pageInfo.value["tableFieldList"] = {
      fieldList,
    };
  } else {
    let {fieldList, searchItemList} = analysisAppComps(compList);
    pageInfo.value["searchFormData"] = {
      fieldList: searchItemList,
    };
    pageInfo.value["tableFieldList"] = {
      fieldList,
    };
  }
};

onMounted(async () => {
  await init("pc");
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
    <el-tab-pane name="json" :label="i18n('dyform.common.433')">
      <div class="flex justify-end my-3">
        <el-radio-group v-model="codeStyle" @change="init">
          <el-radio label="PC代码" value="pc"/>
          <el-radio label="App代码" value="app"/>
        </el-radio-group>
      </div>
      <star-horse-json-editor currentMode="json" v-model="pageInfo"/>
    </el-tab-pane>
  </el-tabs>
</template>
<style scoped lang="scss">
.code-container {
  height: 100%;
  overflow: hidden;
}
</style>
