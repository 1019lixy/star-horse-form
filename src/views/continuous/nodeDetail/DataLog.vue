<script setup lang="ts" name="DataLog">
import { ref } from "vue";

const value = ref(
  "",
);
</script>
<style lang="scss" scoped>
.query-area {
  text-align: left;
  display: flex;
  font-size: 13px;
  height: 100%;
  flex-direction: column;
  z-index: 9999;
  flex: 1;
}
</style>
<template>
  <div class="query-area">
    <star-horse-editor :value="value" :lang="'markdown'" />
  </div>
</template>
