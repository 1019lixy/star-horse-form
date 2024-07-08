<template>
  <el-card class="box-card" style="height: 100%;width: 100%">
    {{ val }}
    <StarHorseEditor v-model:value="val"/>
  </el-card>
</template>
<script setup lang="ts">
import {ref} from "vue";
let val = ref("xxx");
</script>
<style lang="scss" scoped>
:deep(.el-card__body) {
  height: 100%;
}
</style>
