<script setup lang="ts">
defineOptions({
  name: "PageSplitterItem"
});
</script>

<template>
  <div style="height: 100%; box-shadow: var(--el-border-color-light) 0px 0px 10px">
    <el-splitter>
      <el-splitter-panel collapsible size="30%">
        <div class="demo-panel">1</div>
      </el-splitter-panel>
      <el-splitter-panel :min="200">
        <div class="demo-panel">2</div>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style scoped lang="scss">
.demo-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}
</style>
