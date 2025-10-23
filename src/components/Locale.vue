<template>
  <el-dropdown
    @command="handleSetLanguage"
    class="languages"
    trigger="click"
    :show-arrow="false"
  >
    <div style="font-size: 15px" :style="{ color: color }">
      <span>{{ langName }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="zh_CN"
          >{{ i18n("locale.chinese") }}
        </el-dropdown-item>
        <el-dropdown-item command="en_US"
          >{{ i18n("locale.english") }}
        </el-dropdown-item>
        <el-dropdown-item command="zh_TW"
          >{{ i18n("locale.traditionalChinese") }}
        </el-dropdown-item>
        <el-dropdown-item command="ja_JP"
          >{{ i18n("locale.japanese") }}
        </el-dropdown-item>
        <el-dropdown-item command="de_DE"
          >{{ i18n("locale.german") }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import { i18n } from "@/lang";
import { LangType } from "@/theme/theme";
import { getLang, setLang } from "@/theme/localStorge";
defineProps({
  color: {
    type: String,
    default: "var(--star-horse-white)",
  },
});
const langName = ref("");
const init = () => {
  let lang = getLang();
  if (lang == LangType.ZH_CN) {
    langName.value = i18n("locale.chinese");
  } else if (lang == LangType.ZH_TW) {
    langName.value = i18n("locale.traditionalChinese");
  } else if (lang == LangType.JA_JP) {
    langName.value = i18n("locale.japanese");
  } else if (lang == LangType.DE_DE) {
    langName.value = i18n("locale.german");
  } else {
    langName.value = i18n("locale.english");
  }
};
onMounted(() => {
  init();
});
const handleSetLanguage = (lang: string) => {
  let langType;
  if (lang === "zh_CN") {
    langType = LangType.ZH_CN;
    langName.value = i18n("locale.chinese");
  } else if (lang === "zh_TW") {
    langType = LangType.ZH_TW;
    langName.value = i18n("locale.traditionalChinese");
  } else if (lang === "ja_JP") {
    langType = LangType.JA_JP;
    langName.value = i18n("locale.japanese");
  } else if (lang === "de_DE") {
    langType = LangType.DE_DE;
    langName.value = i18n("locale.german");
  } else {
    langType = LangType.EN_US;
    langName.value = i18n("locale.english");
  }

  // Use the language synchronization service to set the language
  setLang(langType);

  // Dispatch a custom event to notify other components of the language change
  const event = new CustomEvent("starHorseLanguageChange", {
    detail: { lang: langType },
  });
  window.dispatchEvent(event);

  // Reload the page to apply the language change
  location.reload();
};
</script>
<style scoped>
.languages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: auto;
  cursor: pointer;
  min-width: 60px;
  text-align: center;
}
</style>
