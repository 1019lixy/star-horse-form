<script setup lang="ts" name="help">
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

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
      <star-horse-icon icon-class="help" color="var(--star-horse-style)"/>
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
