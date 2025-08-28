<template>
  <el-dropdown @command="handleSetLanguage" class="languages" trigger="click">
    <div style="font-size: 15px; color: var(--star-horse-white)">
      <span>{{ langName }}</span>
      <i class="el-icon-arrow-down el-icon--right" />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item :disabled="language === 'zh'" command="zh">{{
          i18n("locale.chinese")
        }}</el-dropdown-item>
        <el-dropdown-item :disabled="language === 'en'" command="en">{{
          i18n("locale.english")
        }}</el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { i18n } from "@/lang";
import { LangType } from "@/theme/theme";

const langName = ref("");
const language = ref("");
const init = () => {
  let lang = localStorage.getItem("lang");
  if (!lang || lang == "zh") {
    langName.value = i18n("locale.chinese");
    language.value = "zh";
  } else {
    langName.value = i18n("locale.english");
    language.value = "en";
  }
};
onMounted(() => {
  init();
});
const handleSetLanguage = (lang: string) => {
  const langType = lang === "zh" ? LangType.ZH_CN : LangType.EN_US;

  // Use the language synchronization service to set the language

  if (lang === "zh") {
    langName.value = i18n("locale.chinese");
  } else {
    langName.value = i18n("locale.english");
  }
  language.value = lang;
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
