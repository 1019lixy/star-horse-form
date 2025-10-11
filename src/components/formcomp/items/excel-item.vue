<template>
  <starhorse-form-item
      :isDesign="isDesign"
      :disabled="disabled"
      :bareFlag="bareFlag"
      :formItem="field"
      :parentField="parentField"
  >
    <div
        ref="container"
        style="height: 600px; width: 100%; position: relative"
    ></div>
  </starhorse-form-item>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from "vue";
import {UniverSheetsCorePreset} from "@univerjs/preset-sheets-core";
import sheetsCoreZhCN from "@univerjs/preset-sheets-core/locales/zh-CN";
import {createUniver, LocaleType, mergeLocales} from "@univerjs/presets";
import "@univerjs/preset-sheets-core/lib/index.css";
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
const univerAPIRef = ref<any>(null);

onMounted(() => {
  const {univerAPI} = createUniver({
    locale: LocaleType.ZH_CN,
    locales: {
      [LocaleType.ZH_CN]: mergeLocales(
          sheetsCoreZhCN,
      ),
    },
    presets: [
      UniverSheetsCorePreset({
        container: container.value,
      }),
    ],
  });


  univerAPI.createWorkbook({name: "Test Sheet"});
  univerAPIRef.value = univerAPI;
});

onBeforeUnmount(() => {
  container.value?.dispose();
  univerAPIRef.value = null;
});
</script>
