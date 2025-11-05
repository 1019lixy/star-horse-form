<script setup lang="ts" name="PageBackground">
import { ModelRef, watch, ref } from "vue";
import { Config } from "@/api/settings.js";
import { i18n } from "@/lang/index.js";
defineProps({
  compSize: {
    type: String,
    default: Config.compSize,
  },
});
let backgroundData: ModelRef<any> = defineModel("dataForm");
const currentBackgroundImage = ref("");
// 新增文件转base64方法
const beforeUpload = (file: File) => {
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
  <el-form-item
    :label="i18n('system.flex.pageBackground.label.color')"
    prop="backgroundColor"
  >
    <div class="row">
      <el-color-picker
        v-model="backgroundData.backgroundColor"
        color-format="rgb"
        :size="compSize"
        placeholder="X"
        show-alpha
      />
      <el-input
        v-model="backgroundData.backgroundColor"
        :size="compSize"
        placeholder=""
        style="margin-left: 5px"
      />
    </div>
  </el-form-item>
  <el-form-item
    :label="i18n('system.flex.pageBackground.label.backgroundImage')"
    prop="backgroundImage"
  >
    <el-upload
      :before-upload="beforeUpload"
      list-type="picture-card"
      accept="image/*"
      :size="compSize"
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
  <el-form-item
    :label="i18n('system.flex.pageBackground.label.backgroundSize')"
    prop="backgroundSize"
  >
    <el-input
      v-model="backgroundData.backgroundSize"
      :size="compSize"
      :placeholder="
        i18n('system.flex.pageBackground.placeholder.backgroundSize')
      "
    ></el-input>
  </el-form-item>

  <el-form-item
    :label="i18n('system.flex.pageBackground.label.backgroundRepeat')"
    prop="repeat"
  >
    <el-radio-group v-model="backgroundData.backgroundRepeat" :size="compSize">
      <el-radio value="no-repeat">{{
        i18n("system.flex.pageBackground.radio.noRepeat")
      }}</el-radio>
      <el-radio value="repeat">{{
        i18n("system.flex.pageBackground.radio.repeat")
      }}</el-radio>
      <el-radio value="repeat-x">{{
        i18n("system.flex.pageBackground.radio.repeatX")
      }}</el-radio>
      <el-radio value="repeat-y">{{
        i18n("system.flex.pageBackground.radio.repeatY")
      }}</el-radio>
      <el-radio value="space">{{
        i18n("system.flex.pageBackground.radio.space")
      }}</el-radio>
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
