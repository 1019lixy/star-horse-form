<script setup lang="ts">
  import { ModelRef } from "vue";

  let data: ModelRef<any> = defineModel("pageFont");
</script>

<template>
  <el-form
    v-model="data"
    label-width="auto"
    label-position="left"
    style="width: 99%; margin: 0 auto; overflow-x: hidden"
  >
    <div class="row">
      <el-form-item label="大小" prop="size">
        <el-input v-model="data.size" size="small" placeholder=""></el-input>
      </el-form-item>
      <el-form-item label="行高" prop="lineHeight">
        <el-input v-model="data.lineHeight" size="small" placeholder=""></el-input>
      </el-form-item>
    </div>
    <el-form-item label="颜色" prop="color">
      <div class="row">
        <el-color-picker v-model="data.color" color-format="rgb" size="small" />
        <el-input v-model="data.color" size="small" placeholder="" style="margin-left: 5px" />
      </div>
    </el-form-item>
    <el-form-item label="样式" prop="fontWeight">
      <el-radio-group v-model="data.fontWeight" size="small">
        <el-radio-button value="B" style="font-weight: bolder">B</el-radio-button>
        <el-radio-button value="I" style="font-weight: bold; font-style: italic">I</el-radio-button>
        <el-radio-button value="U" style="text-decoration: underline; font-weight: bold">U</el-radio-button>
      </el-radio-group>
    </el-form-item>
    <el-form-item label="位置" prop="align">
      <el-radio-group v-model="data.align" size="small">
        <el-radio-button value="left" style="font-weight: bold">Left</el-radio-button>
        <el-radio-button value="middle" style="font-weight: bold">Middle</el-radio-button>
        <el-radio-button value="right" style="text-decoration: underline; font-weight: bold">Right</el-radio-button>
      </el-radio-group>
    </el-form-item>
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
