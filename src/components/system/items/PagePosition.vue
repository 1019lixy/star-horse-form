<script setup lang="ts">
import {ModelRef} from "vue";
import {Config} from "@/api/settings";
import { i18n } from "@/lang";

defineProps({
  compSize: {
    type: String,
    default: Config.compSize,
  }
});

const data: ModelRef<any> = defineModel("dataForm");
</script>

<template>
  <div class="row">
    <el-form-item :label="i18n('system.flex.pagePosition.label.x')" prop="left">
      <el-input v-model="data.left" :size="compSize" clearable :placeholder="i18n('system.flex.pagePosition.label.x')"/>
    </el-form-item>
    <el-form-item :label="i18n('system.flex.pagePosition.label.y')" prop="top">
      <el-input v-model="data.top" :size="compSize" clearable :placeholder="i18n('system.flex.pagePosition.label.y')"/>
    </el-form-item>
  </div>
  <div class="row">
    <el-form-item :label="i18n('system.flex.pagePosition.label.width')" prop="width">
      <el-input v-model="data.width" :size="compSize" clearable :placeholder="i18n('system.flex.pagePosition.placeholder.width')"/>
    </el-form-item>

    <el-form-item :label="i18n('system.flex.pagePosition.label.height')" prop="height">
      <el-input v-model="data.height" :size="compSize" clearable :placeholder="i18n('system.flex.pagePosition.placeholder.height')"/>
    </el-form-item>
  </div>
  <div class="main-container">
    <!-- 外边框 -->
    <div class="border"
         :data-outer-border="i18n('system.flex.pagePosition.border.outer')"
         :data-inner-border="i18n('system.flex.pagePosition.border.inner')">
      <el-input
          clearable
          :size="compSize"
          v-model="data.marginTop"
          class="input-box horizontal-input outer-top"
          placeholder="margin top"
      />
      <el-input
          :size="compSize"
          v-model="data.marginLeft"
          class="input-box vertical-input outer-left"
          placeholder="margin left"
      />
      <el-input
          :size="compSize"
          v-model="data.marginRight"
          class="input-box vertical-input outer-right"
          placeholder="margin right"
      />
      <el-input
          clearable
          :size="compSize"
          v-model="data.marginBottom"
          class="input-box horizontal-input outer-bottom"
          placeholder="margin bottom"
      />

      <!-- 内边框 -->
      <div class="inner-border">
        <el-input
            clearable
            :size="compSize"
            v-model="data.paddingTop"
            class="input-box horizontal-input inner-top"
            placeholder="padding top"
        />
        <el-input
            :size="compSize"
            v-model="data.paddingLeft"
            class="input-box vertical-input inner-left"
            placeholder="padding left"
        />
        <el-input
            :size="compSize"
            v-model="data.paddingRight"
            class="input-box vertical-input inner-right"
            placeholder="padding right"
        />
        <el-input
            clearable
            :size="compSize"
            v-model="data.paddingBottom"
            class="input-box horizontal-input inner-bottom"
            placeholder="padding bottom"
        />

        <!-- 中间内容 -->
        <div class="content">{{ i18n('system.flex.pagePosition.content') }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.row {
  width: 100%;
  display: flex;
  flex: 1;
}

:deep(.el-form-item__content) {
  min-width: 0 !important;
}

/* 主容器：使用 Grid 布局 */
.main-container {
  width: 310px;
  height: 320px;
  margin: 0 auto;
  display: grid;
  font-family: "Arial", sans-serif;
  grid-template-columns: 35px 1fr 35px;
  /* 左右内边距 + 中间内容 */
  grid-template-rows: 40px 1fr 50px;
  /* 上下内边距 + 中间内容 */
  gap: 5px;
  /* 单元格间距 */
}

/* 外边框样式 */
.border {
  border: 2px solid #6b7785;
  grid-column: 1 / 4;
  /* 跨越所有列 */
  grid-row: 1 / 4;
  /* 跨越所有行 */
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  /* 增加左右内边距，确保输入框不溢出 */
  grid-template-rows: 45px 1fr 45px;
  /* 增加上下内边距，确保输入框不溢出 */
  gap: 8px;
  background-color: #6b7785;
  /* 浅灰色背景 */
  position: relative;
  border-radius: 6px;
}

/* 外边框背景内容 - 移至左上角 */
.border::before {
  content: attr(data-outer-border);
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.5);
  z-index: 0;
}

/* 内边框样式 */
.inner-border {
  border: 2px solid #86909c;
  grid-column: 2 / 3;
  /* 位于中间列 */
  grid-row: 2 / 3;
  /* 位于中间行 */
  display: grid;
  grid-template-columns: 40px 1fr 40px;
  /* 增加左右内边距，确保输入框不溢出 */
  grid-template-rows: 28px 1fr 28px;
  /* 增加上下内边距，确保输入框不溢出 */
  gap: 4px;
  border-radius: 6px;
  background-color: #86909c;
  /* 中灰色背景 */
  position: relative;
  z-index: 1;
}

/* 内边框背景内容 - 移至左上角 */
.inner-border::before {
  content: attr(data-inner-border);
  position: absolute;
  top: 5px;
  left: 5px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.6);
  z-index: 0;
}

/* 输入框通用样式 */
.input-box {
  padding: 3px;
  font-size: 12px;
  position: relative;
  z-index: 2;
  border: none;
  background-color: #fff;
  /* 白色背景 */
  border-radius: 3px;
  box-sizing: border-box;

  /* 确保 padding 和 border 包含在尺寸内 */
  &:focus {
    outline: none;
    /* 去除默认的聚焦边框 */
  }
}

/* 上下输入框样式 */
.horizontal-input {
  min-height: 30px;
  /* 上下输入框高度 */
  width: 100px;
  /* 上下输入框宽度 */
}

/* 左右输入框样式 */
.vertical-input {
  min-height: 120px;
  /* 左右输入框高度（与上下输入框宽度一致） */
  width: 30px;
  /* 左右输入框宽度 */
  writing-mode: vertical-lr;
  /* 文字垂直排列 */
  text-align: center;
  /* 文字居中 */
  /* 为vertical-input的子孙节点input设置完整样式 */
  input {
    padding-top: 5px !important;
    /* 增加更多样式 */
    width: 100%;
    height: 100%;
    border: none !important;
    outline: none !important;
    background: transparent !important;
    font-size: 12px !important;
    line-height: 1.2 !important;
    cursor: text;
  }
  
  /* 针对element-plus输入框组件的更深层样式 */
  :deep(.el-input__wrapper) {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
  }
  
  :deep(.el-input__inner) {
    background-color: transparent !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    writing-mode: vertical-lr;
    text-align: center;
    font-size: 12px;
    line-height: 1.2;
  }
}

/* 外边框输入框位置 */
.outer-top {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  justify-self: center;
  align-self: center;
  /* 垂直居中 */
}

.outer-left {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: center;
  /* 水平居中 */
  align-self: center;
  /* 垂直居中 */
}

.outer-right {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
  justify-self: center;
  /* 水平居中 */
  align-self: center;
  /* 垂直居中 */
}

.outer-bottom {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  justify-self: center;
  align-self: center;
  /* 垂直居中 */
  margin-bottom: 5px;
}

/* 内边框输入框位置 */
.inner-top {
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  justify-self: center;
  align-self: center;
  /* 垂直居中 */
  margin: 5px auto;
}

.inner-left {
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: center;
  /* 水平居中 */
  align-self: center;
  /* 垂直居中 */
  margin: auto 5px;
}

.inner-right {
  grid-column: 3 / 4;
  grid-row: 2 / 3;
  justify-self: center;
  /* 水平居中 */
  align-self: center;
  /* 垂直居中 */
  margin: auto 5px;
}

.inner-bottom {
  grid-column: 2 / 3;
  grid-row: 3 / 4;
  justify-self: center;
  align-self: center;
  /* 垂直居中 */
  margin: 5px auto;
}

/* 中间内容 */
.content {
  grid-column: 2 / 3;
  grid-row: 2 / 3;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 12px;
  border-radius: 6px;
  margin: 5px auto;
  width: 100%;
  background-color: #a9aeb8;
  /* 深灰色背景 */
  position: relative;
  z-index: 2;
}
</style>
