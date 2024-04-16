<template>
  <el-card class = "box-card" style = "height: 100%;width: 100%">
    {{val}}
    <code-js6 v-model:value="val"/>

  </el-card>
</template>

<script setup lang = "ts">
import {ref} from "vue";
import CodeJs6 from "@/components/code/CodeJs6.vue";
let val=ref("xxx");
</script>

<style scoped>
:deep(.el-card__body) {
  height: 100%;
}
</style>