<script setup lang="ts">
import { ModelRef } from "vue";

const data: ModelRef<any> = defineModel("dataForm");
</script>

<template>

  <div class="row">
    <el-form-item label="X" prop="xPoint">
      <el-input v-model="data.xPoint" size="small" placeholder="X" />
    </el-form-item>
    <el-form-item label="Y" prop="yPoint">
      <el-input v-model="data.yPoint" size="small" placeholder="Y" />
    </el-form-item>
  </div>
  <div class="row">
    <el-form-item label="宽度" prop="width">
      <el-input v-model="data.width" size="small" placeholder="宽度" />
    </el-form-item>

    <el-form-item label="高度" prop="height">
      <el-input v-model="data.height" size="small" placeholder="高度" />
    </el-form-item>
  </div>
  <div class="main-container">
    <!-- 外边框 -->
    <div class="border">
      <input type="text" class="input-box horizontal-input outer-top" placeholder="外上">
      <input type="text" class="input-box vertical-input outer-left" placeholder="外左">
      <input type="text" class="input-box vertical-input outer-right" placeholder="外右">
      <input type="text" class="input-box horizontal-input outer-bottom" placeholder="外下">

      <!-- 内边框 -->
      <div class="inner-border">
        <input type="text" class="input-box horizontal-input inner-top" placeholder="内上">
        <input type="text" class="input-box vertical-input inner-left" placeholder="内左">
        <input type="text" class="input-box vertical-input inner-right" placeholder="内右">
        <input type="text" class="input-box horizontal-input inner-bottom" placeholder="内下">

        <!-- 中间内容 -->
        <div class="content">这里是中间内容</div>
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
            width: 500px;
            height: 400px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: 20px 1fr 20px; /* 左右内边距 + 中间内容 */
            grid-template-rows: 20px 1fr 20px;    /* 上下内边距 + 中间内容 */
            gap: 10px;                            /* 单元格间距 */
        }

        /* 外边框样式 */
        .border {
            border: 2px solid #333;
            grid-column: 1 / 4;  /* 跨越所有列 */
            grid-row: 1 / 4;     /* 跨越所有行 */
            display: grid;
            grid-template-columns: 50px 1fr 50px; /* 增加左右内边距，确保输入框不溢出 */
            grid-template-rows: 50px 1fr 50px;    /* 增加上下内边距，确保输入框不溢出 */
            gap: 10px;
            background-color: #f0f0f0; /* 浅灰色背景 */
            position: relative;
        }

        /* 外边框背景内容 - 移至左上角 */
        .border::before {
            content: "外边框";
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 16px;
            color: rgba(0, 0, 0, 0.5);
            z-index: 0;
        }

        /* 内边框样式 */
        .inner-border {
            border: 2px solid #666;
            grid-column: 2 / 3;  /* 位于中间列 */
            grid-row: 2 / 3;     /* 位于中间行 */
            display: grid;
            grid-template-columns: 50px 1fr 50px; /* 增加左右内边距，确保输入框不溢出 */
            grid-template-rows: 50px 1fr 50px;    /* 增加上下内边距，确保输入框不溢出 */
            gap: 10px;
            background-color: #e0e0e0; /* 中灰色背景 */
            position: relative;
            z-index: 1;
        }

        /* 内边框背景内容 - 移至左上角 */
        .inner-border::before {
            content: "内边框";
            position: absolute;
            top: 10px;
            left: 10px;
            font-size: 14px;
            color: rgba(0, 0, 0, 0.6);
            z-index: 0;
        }

        /* 输入框通用样式 */
        .input-box {
            padding: 8px;
            font-size: 12px;
            position: relative;
            z-index: 2;
            box-sizing: border-box; /* 确保 padding 和 border 包含在尺寸内 */
        }

        /* 上下输入框样式 */
        .horizontal-input {
            min-height: 30px;     /* 上下输入框高度 */
            width: 100px;         /* 上下输入框宽度 */
        }

        /* 左右输入框样式 */
        .vertical-input {
            min-height: 100px;    /* 左右输入框高度（与上下输入框宽度一致） */
            width: 30px;          /* 左右输入框宽度 */
            writing-mode: vertical-lr; /* 文字垂直排列 */
            text-align: center;   /* 文字居中 */
        }

        /* 外边框输入框位置 */
        .outer-top {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            justify-self: center;
            align-self: center;   /* 垂直居中 */
        }
        .outer-left {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            justify-self: center; /* 水平居中 */
            align-self: center;   /* 垂直居中 */
        }
        .outer-right {
            grid-column: 3 / 4;
            grid-row: 2 / 3;
            justify-self: center; /* 水平居中 */
            align-self: center;   /* 垂直居中 */
        }
        .outer-bottom {
            grid-column: 2 / 3;
            grid-row: 3 / 4;
            justify-self: center;
            align-self: center;   /* 垂直居中 */
        }

        /* 内边框输入框位置 */
        .inner-top {
            grid-column: 2 / 3;
            grid-row: 1 / 2;
            justify-self: center;
            align-self: center;   /* 垂直居中 */
        }
        .inner-left {
            grid-column: 1 / 2;
            grid-row: 2 / 3;
            justify-self: center; /* 水平居中 */
            align-self: center;   /* 垂直居中 */
        }
        .inner-right {
            grid-column: 3 / 4;
            grid-row: 2 / 3;
            justify-self: center; /* 水平居中 */
            align-self: center;   /* 垂直居中 */
        }
        .inner-bottom {
            grid-column: 2 / 3;
            grid-row: 3 / 4;
            justify-self: center;
            align-self: center;   /* 垂直居中 */
        }

        /* 中间内容 */
        .content {
            grid-column: 2 / 3;
            grid-row: 2 / 3;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            font-size: 16px;
            background-color: #d0d0d0; /* 深灰色背景 */
            position: relative;
            z-index: 2;
        }
</style>
