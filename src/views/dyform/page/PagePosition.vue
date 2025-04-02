<script setup lang="ts">
  import { ModelRef } from "vue";

  const data: ModelRef<any> = defineModel("position");
</script>

<template>
  <el-form
    v-model="data"
    label-width="auto"
    label-position="left"
    style="width: 98%; margin: 0 auto; overflow-x: hidden"
  >
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
    <div class="marginContainer">
      <div class="paddingContainer">
        <div class="box">
          <span>内容</span>
        </div>
        <span class="title">内边距</span>
        <input type="number" size="small" class="inputCommon inputTop" v-model="data.paddingTop" />
        <input type="number" size="small" class="inputCommon inputRight" v-model="data.paddingRight" />
        <input type="number" size="small" class="inputCommon inputBottom" v-model="data.paddingBottom" />
        <input type="number" size="small" class="inputCommon inputLeft" v-model="data.paddingLeft" />
      </div>
      <span class="title">外边距</span>
      <input type="number" size="small" class="inputCommon inputTop" v-model="data.marginTop" />
      <input type="number" size="small" class="inputCommon inputRight" v-model="data.marginRight" />
      <input type="number" size="small" class="inputCommon inputBottom" v-model="data.marginBottom" />
      <input type="number" size="small" class="inputCommon inputLeft" v-model="data.marginLeft" />
    </div>
  </el-form>
</template>

<style scoped lang="scss">
  .row {
    width: 100%;
    display: flex;
    flex: 1 1;
  }

  :deep(.el-form-item__content) {
    min-width: 0 !important;
  }

  .marginContainer {
    flex: 1;
    height: 190px;
    background-color: #6b7785;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 30px;
    position: relative;
    margin-bottom: 10px;
    border-radius: 6px;

    .paddingContainer {
      flex: 1;
      background-color: #86909c;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 30px;
      position: relative;
      height: 130px;
      border-radius: 6px;

      .box {
        flex: 1;
        height: 70px;
        background-color: #a9aeb8;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 6px;
      }
    }

    .title {
      font-size: 12px;
      line-height: 30px;
      left: 5px;
      top: 0;
      position: absolute;
    }

    .inputCommon {
      width: 50px;
      border: 0;
      background-color: #fafafa;
      height: 20px;
      position: absolute;
      border-radius: 3px;
      text-align: center;
      -moz-appearance: textfield;

      &::placeholder {
        color: white;
      }

      &:focus {
        outline: none;
        border: none;
      }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        appearance: none;
        margin: 0;
      }
    }

    .inputTop {
      top: 0;
      left: 50%;
      margin-left: -25px;
    }

    .inputLeft {
      left: 0;
      top: 50%;
      width: 30px;
      margin-top: -10px;
    }

    .inputRight {
      right: 0;
      top: 50%;
      width: 30px;
      margin-top: -10px;
    }

    .inputBottom {
      bottom: 0;
      left: 50%;
      margin-left: -25px;
    }
  }
</style>
