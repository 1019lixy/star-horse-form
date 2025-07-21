<script setup lang="ts">
defineOptions({
  name: 'PageFormItem',
});
const flag = true;
</script>

<template>
  <div class="relative flex flex-col flex-wrap w-full">
    <sh-form>
      <template v-if="flag" #default>bbbb</template>
      <template #empty>请配置表单属性</template>
    </sh-form>
  </div>
</template>

<style scoped lang="scss"></style>
