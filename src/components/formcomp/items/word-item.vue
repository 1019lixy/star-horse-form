<template>
  <starhorse-form-item
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :formItem="field"
    :parentField="parentField"
  >
    <div ref="container" style="height: 600px; width: 100%" />
  </starhorse-form-item>
</template>
<script setup lang="ts" name="excelItem">
import { onMounted, ref } from "vue";
import {
  createUniver,
  defaultTheme,
  LocaleType,
  merge,
} from "@univerjs/presets";
import { UniverDocsCorePreset } from "@univerjs/presets/preset-docs-core";
import docsCoreZhCN from "@univerjs/presets/preset-docs-core/locales/zh-CN";
import { UniverDocsDrawingPreset } from "@univerjs/presets/preset-docs-drawing";
import docsDrawingZhCN from "@univerjs/presets/preset-docs-drawing/locales/zh-CN";
import { UniverDocsHyperLinkPreset } from "@univerjs/presets/preset-docs-hyper-link";
import docsHyperLinkZhCN from "@univerjs/presets/preset-docs-hyper-link/locales/zh-CN";
import "@univerjs/presets/lib/styles/preset-docs-core.css";
import "@univerjs/presets/lib/styles/preset-docs-drawing.css";
import "@univerjs/presets/lib/styles/preset-docs-hyper-link.css";

import {ItemPreps} from "star-horse-lowcode";
const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");
const itemAction = () => {
  emits("selfFunc", formData);
};
const container = ref<HTMLElement | null>(null);

const init = async () => {
  const { univerAPI } = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: merge(
        {},
        docsCoreZhCN,
        docsDrawingZhCN,
        docsHyperLinkZhCN,
      ),
    },
    theme: defaultTheme,
    presets: [
      UniverDocsCorePreset({
        container: container.value,
      }),
      UniverDocsDrawingPreset(),
      UniverDocsHyperLinkPreset(),
    ],
  });
  univerAPI.createUniverDoc({});
};
const rendered = () => {};
onMounted(() => {
  init();
});
</script>
<style scoped></style>
