<script setup lang="ts" name="help">
defineProps({
  width: {type: Number, default: 340},
  message: {type: String, required: true, default: "帮助"}
});
</script>

<template>
  <el-popover
      trigger="hover"
      :width="width"
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
<pre>
{{ message }}
</pre>
    </div>

  </el-popover>
</template>

<style scoped lang="scss">

</style>
