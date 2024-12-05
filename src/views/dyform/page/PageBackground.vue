<script setup lang="ts" name="PageBackground">

import {ModelRef} from "vue-demi";

let backgroundData:ModelRef<any> =defineModel("background");
</script>

<template>
  <el-form v-model="backgroundData" label-width="auto" label-position="left"
           style="width: 98%;margin:0 auto; overflow-x:hidden;">
    <el-form-item label="颜色" prop="backgroundColor">
      <div class="row">
        <el-color-picker v-model="backgroundData.backgroundColor" color-format="rgb" size="small" placeholder="X"/>
        <el-input v-model="backgroundData.backgroundColor" size="small" placeholder="" style="margin-left: 5px"/>
      </div>
    </el-form-item>
    <el-form-item label="背景图片" prop="backgroundImage">
      <el-upload v-model="backgroundData.backgroundImage" list-type="picture-card" size="small" placeholder="Y"/>
    </el-form-item>
    <el-form-item label="背景大小" prop="width">
      <el-input v-model="backgroundData.width" size="small" placeholder="背景大小"></el-input>
    </el-form-item>

    <el-form-item label="背景重复" prop="repeat">
      <el-radio-group v-model="backgroundData.repeat" size="small">
        <el-radio value="no-repeat">不重复</el-radio>
        <el-radio value="repeat-x">水平方向重复</el-radio>
        <el-radio value="repeat-y">垂直方向重复</el-radio>
        <el-radio value="space">重复，空白区域填充</el-radio>
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

</style>
