<template>
  <starhorse-form-item :isDesign="isDesign" :disabled="disabled" :bareFlag="bareFlag" :formItem="field"
                       :parentField="parentField">
    <div ref="container" style="height: 600px;width: 100%;position: relative"></div>
  </starhorse-form-item>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {createUniver, defaultTheme, LocaleType, merge, Univer} from '@univerjs/presets';
import {UniverSheetsCorePreset} from '@univerjs/presets/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/presets/preset-sheets-core/locales/zh-CN';
import '@univerjs/presets/lib/styles/preset-sheets-core.css';
const props = defineProps({
  isDesign: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  bareFlag: {
    type: Boolean,
    default: false
  }, isSearch: {
    type: Boolean,
    default: false
  },
  field: {
    type: Object,
    default: {}
  },
  parentField: {
    type: Object,
    default: {}
  },
  formInfo: {
    type: Object,
    default: {}
  }
});
const emits = defineEmits(['selfFunc', 'selectItem']);
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
      [LocaleType.ZH_CN]: merge(
          {},
          UniverPresetSheetsCoreZhCN,
      ),
    },
    theme: defaultTheme,
    presets: [
      UniverSheetsCorePreset({
        container: container.value,
      }),
    ],
  });

  univerAPI.createWorkbook({name: 'Test Sheet'});
  univerAPIRef.value = univerAPI;

});

onBeforeUnmount(() => {
  container.value?.dispose();
  univerAPIRef.value = null;
});

</script>
