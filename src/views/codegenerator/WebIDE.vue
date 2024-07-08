<script setup lang="ts">
import {onMounted, ref} from "vue";
import {loadTemplate, templateList} from "@/views/codegenerator/utils/IdeOperation.ts";
import {SelectOption} from "@/components/types/SearchProps";

const editor = ref();
let tempList = ref<SelectOption[]>([]);
let sourceCode = ref<string>("");
let templateCode = ref<string>("");

const init = async () => {
  tempList.value = await templateList();
}
const changeTemplate = async (val: string) => {
  let value = await loadTemplate(val, "com.starhorse.devops.customer", "Customer");
  editor.value.setValue(value);
}
onMounted(() => {
  init();
});
</script>

<template>
  <el-select v-model="templateCode" @change="changeTemplate">
    <el-option v-for="item in tempList" :value="item.value" :label="item.name" :key="item.value"/>
  </el-select>
  <el-card class="box-card" style="height: 100%;width: 100%">

    <StarHorseEditor v-model:value="sourceCode" :lang="'java'" ref="editor"/>
  </el-card>
</template>

<style lang="scss" scoped>
:deep(.el-card__body) {
  height: 100%;
}
</style>
