<template>
  <el-dropdown @command="handleSetLanguage" class="languages" trigger="click">
    <div style="font-size: 15px; color: var(--star-horse-white)">
      <span>{{ langName }}</span>
      <i class="el-icon-arrow-down el-icon--right" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh'" command="zh"
          >中文</el-dropdown-item
        >
        <el-dropdown-item :disabled="language === 'en'" command="en"
          >English</el-dropdown-item
        >
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';

const langName = ref('');
const language = ref('');
const init = () => {
  let lang = localStorage.getItem('lang');
  if (!lang || lang == 'zh') {
    langName.value = '中文';
    language.value = 'zh';
  } else {
    langName.value = 'English';
    language.value = 'en';
  }
};
onMounted(() => {
  init();
});
const handleSetLanguage = (lang: string) => {
  if (lang === 'zh') {
    langName.value = '中文';
  } else {
    langName.value = 'English';
  }
  language.value = lang;
  localStorage.setItem('lang', lang);
  location.reload();
};
</script>
<style scoped>
.languages {
  width: 76px;
  float: left;
  padding-top: 0px;
  margin-top: -10px;
  text-align: center;
}
</style>
