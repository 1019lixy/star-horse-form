<script setup lang="ts">
import {computed, onMounted, ref, watch} from "vue";
import {i18n} from "@/lang";
import {analysisAppComps, analysisCompDatas, getDesignFormStore, operationConfirm} from "star-horse-lowcode";
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
const jsonPrototype = ref<any>([]);
const tabChange = (name: string) => {
  if (name == "json_prototype") {
    jsonPrototype.value = compList.value;
  }
}
const updateJsonPrototype = () => {
  operationConfirm("确定更新JSON原型吗？").then(() => {
    designForm.setCompList(jsonPrototype.value);
  });
}
onMounted(async () => {
  await init("pc");
});
watch(
    () => compList.value,
    () => {
      // 当舞台数据变化时（如导入），同步更新代码编辑器
      init(codeStyle.value);
      if (tabName.value === "json_prototype") {
        jsonPrototype.value = compList.value;
      }
    },
    {deep: true},
);
</script>
<template>
  <el-tabs v-model="tabName" type="border-card" @tabChange="tabChange">
    <el-tab-pane name="vue3" label="Vue3">
      <vue3 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="vue2" label="Vue2">
      <vue2 :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="react" label="React">
      <react :formInfo="formInfo" :compList="pageInfo" :compSize="compSize"/>
    </el-tab-pane>
    <el-tab-pane name="json_prototype" :label="i18n('dyform.common.a433')">
      <div class="flex justify-end my-3">
        <el-button type="primary" @click="updateJsonPrototype">
          <star-horse-icon iconClass="edit" color="var(--star-horse-white)"/>
          {{ i18n("workflow.edit") }}
        </el-button>
      </div>
      <star-horse-json-editor currentMode="json" v-model="jsonPrototype"/>
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
