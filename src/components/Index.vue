<script setup lang="ts">
import Speech from "speak-tts";
import { onMounted, ref, unref } from "vue";
import { i18n } from "@/lang";

const speech = new Speech();
const msg = ref(i18n("index.hello"));
const init = () => {
  speech.setLanguage("zh-CN");
  speech.init().then(() => {
    console.log(i18n("index.speechInitComplete"));
  });
};
onMounted(() => {
  init();
});
const playMsg = () => {
  speech.speak({ text: unref(msg) }).then(() => {});
};
</script>
