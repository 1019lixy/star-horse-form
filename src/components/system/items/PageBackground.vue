<script setup lang="ts" name="PageBackground">
import { ModelRef, watch } from "vue";

let backgroundData: ModelRef<any> = defineModel("dataForm");
const currentBackgroundImage = ref("");
// 新增文件转base64方法
const beforeUpload = (file: File) => {
  console.log(file);
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // currentBackgroundImage.value = reader.result;
      backgroundData.value.backgroundImage = "url(" + reader.result + ")";
      console.log(backgroundData.value.backgroundImage);
      resolve(false); // 阻止自动上传
    };
  });
};
watch(
  () => backgroundData.value.backgroundImage,
  () => {
    // 使用正则表达式提取url内容
    const match = backgroundData.value.backgroundImage.match(
      /url\((['"]?)(.*?)\1\)/,
    );
    currentBackgroundImage.value = match ? match[2] : "";
  },
);
</script>

<template>
  <el-form-item label="颜色" prop="backgroundColor">
    <div class="row">
      <el-color-picker
        v-model="backgroundData.backgroundColor"
        color-format="rgb"
        size="small"
        placeholder="X"
      />
      <el-input
        v-model="backgroundData.backgroundColor"
        size="small"
        placeholder=""
        style="margin-left: 5px"
      />
    </div>
  </el-form-item>
  <el-form-item label="背景图片" prop="backgroundImage">
    <el-upload
      :before-upload="beforeUpload"
      list-type="picture-card"
      accept="image/*"
      :show-file-list="false"
    >
      <img
        v-if="backgroundData.backgroundImage"
        :src="currentBackgroundImage"
        class="preview-image"
      />
      <el-icon v-else>
        <Plus />
      </el-icon>
    </el-upload>
  </el-form-item>
  <el-form-item label="背景大小" prop="backgroundSize">
    <el-input
      v-model="backgroundData.backgroundSize"
      size="small"
      placeholder="背景大小"
    ></el-input>
  </el-form-item>

  <el-form-item label="背景重复" prop="repeat">
    <el-radio-group v-model="backgroundData.backgroundRepeat" size="small">
      <el-radio value="no-repeat">不重复</el-radio>
      <el-radio value="repeat">重复</el-radio>
      <el-radio value="repeat-x">水平方向重复</el-radio>
      <el-radio value="repeat-y">垂直方向重复</el-radio>
      <el-radio value="space">重复，空白区域填充</el-radio>
    </el-radio-group>
  </el-form-item>
</template>

<style scoped lang="scss">
.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.row {
  width: 100%;
  display: flex;
  flex: 1 1;
}

:deep(.el-form-item__content) {
  min-width: 0 !important;
  width: 100% !important;
}
</style>
