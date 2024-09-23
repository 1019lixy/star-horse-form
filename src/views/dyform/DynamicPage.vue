<script lang="ts" setup name="DynamicPage">
import {onMounted} from "vue";
import {apiInstance} from "@/api/sh_api";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicPage");

const init = async () => {
};

onMounted(async () => {
  await init();
});
</script>
<template>
  <el-card class="inner_content">
    动态页面开发中
  </el-card>
</template>
<style lang="scss" scoped>

</style>
