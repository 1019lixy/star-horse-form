<script setup lang="ts">
import {loadRolesInfo} from "@/api/sh_api.ts";
import {computed, onMounted, ref} from "vue";
import {SelectOption} from "@/components/types/SearchProps";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
// let systemInfoList = ref<SelectOption[]>();
let rolesList = ref<SelectOption[]>();
// let menusList = ref<SelectOption[]>();
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const checkChange = (data: TreeNodeData, checked: boolean) => {

  console.log(data, checked);
};
const initData = async () => {
  // systemInfoList.value = await loadSystemInfo([]);
  rolesList.value = await loadRolesInfo([]);
  // authorityList.value = await dictData("button_authority");
};
onMounted(async () => {
  await initData();
})
</script>

<template>
  <el-row :gutter="10" style="height: 100%;">
    <el-col :span="5" style="height: inherit">
      <star-horse-tree v-model:tree-datas="rolesList" treeTitle="用户组" @selectData="checkChange" :compSize="compSize"/>
    </el-col>
    <el-col :span="19" style="height: inherit">
      <el-card class="inner_content" style="height: inherit">

      </el-card>
    </el-col>
  </el-row>
</template>

<style scoped lang="scss">

</style>