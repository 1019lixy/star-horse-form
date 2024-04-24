<script setup lang="ts" name="help">
const props = defineProps({
  message: {type: String, required: true, default: "帮助"}
});
</script>

<template>
  <el-popover
      trigger="hover"
      :width="340"
      placement="left-end"
  >
    <template #reference>
      <el-icon
          class="star-page-icon"
          style="cursor: pointer;font-size:16px;"
      >
        <el-tooltip content="帮助">
          <InfoFilled/>
        </el-tooltip>
      </el-icon>
    </template>
    <div style="font-size: 12px;">
      {{ message }}
    </div>

  </el-popover>
</template>

<style scoped lang="scss">

</style>