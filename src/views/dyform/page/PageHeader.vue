<script setup lang="ts">
const goBack = () => {
  window.history.back();
}
</script>

<template>
  <div class="header-container">
    <div class="header-left">
      <el-tooltip content="返回">
        <star-horse-icon icon-class="return" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="移动组件">
        <star-horse-icon icon-class="cursor-move" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="插入文本">
        <star-horse-icon icon-class="text" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="插入图片">
        <star-horse-icon icon-class="image" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="插入视频">
        <star-horse-icon icon-class="video" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="插入表格">
        <star-horse-icon icon-class="table" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-tooltip content="插入容器">
        <star-horse-icon icon-class="container" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <div class="split-line"/>
      <el-popover trigger="click" :width="300" >
        <template #reference>
          <star-horse-icon icon-class="charts" cursor="pointer" title="插入图表"/>
        </template>
        <template #default>
          1xxxxxxxxxxxxxxxxxxxxxxxxxx
        </template>
      </el-popover>
      <div class="split-line"/>
      <el-popover trigger="click" :width="300">
        <template #reference>
          <star-horse-icon icon-class="shapes" cursor="pointer" title="插入图形"/>
        </template>
        <template #default>
          2xxxxxxxxxxxxxxxxxxxxxxxxxx
        </template>
      </el-popover>

      <div class="split-line"/>
      <el-tooltip content="插入表单">
        <star-horse-icon icon-class="form" @click="goBack" cursor="pointer"/>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.header-container {
  height: 50px;
  display: flex;
  justify-content: space-between;
  background-color: #1d2129;
  color: #c9cdd4;
  border-bottom: 1px solid #4e5969;

  .header-left {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
