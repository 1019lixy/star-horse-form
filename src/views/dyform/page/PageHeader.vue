<script setup lang="ts">
import {CHART_LIST, SHAPE_LIST} from "@/views/dyform/page/shapes.ts";

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

      <el-tooltip content="插入文本">
        <star-horse-icon icon-class="text" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="插入图片">
        <star-horse-icon icon-class="image" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="插入视频">
        <star-horse-icon icon-class="video" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="插入表格">
        <star-horse-icon icon-class="table" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="插入容器">
        <star-horse-icon icon-class="container" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-popover trigger="click" :width="450">
        <template #reference>
          <star-horse-icon icon-class="charts" cursor="pointer" title="插入图表"/>
        </template>
        <template #default>
          <el-scrollbar>
            <template v-for="item in CHART_LIST">
              <div class="shape-info">
                <div class="shape-title">{{ item.type }}</div>
                <div class="shape-content">
                  <template v-for="sitem in item.children">
                    <star-horse-svg :data="sitem" cursor="pointer" width="28" height="28" size="28px"/>
                  </template>
                </div>
              </div>
            </template>
          </el-scrollbar>
        </template>
      </el-popover>
      <el-popover trigger="click" :width="450">
        <template #reference>
          <star-horse-icon icon-class="shapes" cursor="pointer" title="插入图形"/>
        </template>
        <template #default>
          <el-scrollbar>
            <template v-for="item in SHAPE_LIST">
              <div class="shape-info">
                <div class="shape-title">{{ item.type }}</div>
                <div class="shape-content">
                  <template v-for="sitem in item.children">
                    <star-horse-svg :data="sitem" cursor="pointer" width="28" height="28" size="28px"/>
                  </template>
                </div>
              </div>
            </template>
          </el-scrollbar>
        </template>
      </el-popover>
      <el-tooltip content="插入表单">
        <star-horse-icon icon-class="form" @click="goBack" cursor="pointer"/>
      </el-tooltip>
    </div>
    <div class="header-right">
      <div class="split-line"/>
      <el-tooltip content="保存">
        <star-horse-icon icon-class="save" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="预览">
        <star-horse-icon icon-class="preview" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="发布">
        <star-horse-icon icon-class="publish" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="分享">
        <star-horse-icon icon-class="share" @click="goBack" cursor="pointer"/>
      </el-tooltip>
      <el-tooltip content="全屏">
        <star-horse-icon icon-class="fullscreen-expand" @click="goBack" cursor="pointer"/>
      </el-tooltip>
    </div>
  </div>
</template>

<style scoped lang="scss">
.svg-icon{
  margin:0 10px;
}
:deep(.el-popper) {
  padding: unset;
}

.shape-info {
  display: flex;
  flex-direction: column;

  .shape-title {
    height: 30px;
    background: #ebebeb;
    display: flex;
    align-items: center;
    padding-left: 15px;
  }

  .shape-content {
    display: flex;
    flex-wrap: wrap;
    margin: 5px;

    svg {
      margin: 5px;
    }
  }
}

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
  .header-right {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
