<script setup lang="ts">
import {ref} from "vue";
import {SHAPE_LIST} from "@/views/dyform/page/shapes";
import icons from "../../../views/dyform/page/icon";
import images from "@/assets/image";

let activeName = ref<string>("first");
const goBack = () => {
  window.history.back();
};
const strToObj = (str: string) => {
  // 使用DOMParser来解析字符串
  const parser = new DOMParser();
  return parser.parseFromString(str, "image/svg+xml");
};
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
      <!--      <el-popover trigger="click" :width="450">
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
            </el-popover>-->
      <el-popover trigger="click" :width="450" :popper-style="{ 'max-height': '500px', overflow: 'hidden' }">
        <template #reference>
          <star-horse-icon icon-class="icon" cursor="pointer" title="插入图标/贴纸"/>
        </template>
        <template #default>
          <el-tabs v-model="activeName" style="height: 460px; overflow: hidden; position: relative">
            <el-tab-pane label="图标" name="first">
              <el-scrollbar height="100%">
                <template v-for="item in icons">
                  <div class="shape-info">
                    <div class="shape-title">{{ item.name }}</div>
                    <div class="shape-content">
                      <template v-for="sitem in item.list">
                        <template v-if="sitem.icon.startsWith('data')">
                          <img :src="sitem.icon" cursor="pointer" width="28" height="28" size="28px"/>
                        </template>
                        <span v-else v-html="sitem.icon"/>
                      </template>
                    </div>
                  </div>
                </template>
              </el-scrollbar>
            </el-tab-pane>
            <el-tab-pane label="贴纸" name="second">
              <el-scrollbar height="100%">
                <template v-for="item in images">
                  <div class="shape-info">
                    <div class="shape-title">{{ item.name }}</div>
                    <div class="shape-content">
                      <template v-for="sitem in item.list">
                        <span
                            v-if="sitem.name.includes('viewBox')"
                            v-html="sitem.name"
                            style="display: block; width: 28px; height: 28px; margin: 5px"
                        />
                        <star-horse-icon v-else :icon-class="sitem.name" cursor="pointer" size="30px"/>
                      </template>
                    </div>
                  </div>
                </template>
              </el-scrollbar>
            </el-tab-pane>
          </el-tabs>
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
:deep(.el-tabs) {
  position: relative;
  height: 100%;
  overflow: hidden;
}

.svg-icon,
.icon,
img {
  margin: 0 10px;
}

:deep(.el-popper) {
  padding: unset;
}

:deep(.el-popover) {
  max-height: 500px !important;
  overflow: hidden;
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
