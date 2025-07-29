<template>
  <starhorse-form-item
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :formItem="field"
    :parentField="parentField"
  >
    <iframe
      v-if="field.preps?.viewType == 'view'"
      :src="filePath"
      width="100%"
      :web.xmlHeight="field.preps?.height || 100"
    />
    <el-button v-else type="primary" @click="pdfView" text>
      <star-horse-icon icon-class="pdf" color="var(--star-horse-style)" />
      预览
    </el-button>
  </starhorse-form-item>
</template>
<script setup lang="ts" name="pdfItem">
import { computed, onMounted, ref } from 'vue';
import { warning } from 'star-horse-lowcode';

const props = defineProps({
  isDesign: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  bareFlag: {
    type: Boolean,
    default: false,
  },
  isSearch: {
    type: Boolean,
    default: false,
  },
  field: {
    type: Object,
    default: {},
  },
  parentField: {
    type: Object,
    default: {},
  },
  formInfo: {
    type: Object,
    default: {},
  },
});
const emits = defineEmits(['selfFunc', 'selectItem']);
const formData = defineModel('formData');
const itemAction = () => {
  emits('selfFunc', formData);
};
let filePath = computed(() => {
  let path = formData[props.field.preps['name']];
  if (path) {
    path = `?file=${path}`;
  } else {
    path = '';
  }
  return `/lib/pdfjs/web/viewer.html${encodeURIComponent(path)}`;
});
let pdfPages = ref(0); // pdf文件的页数

const pdfView = () => {
  if (!filePath.value.includes('file=')) {
    warning('请先上传文件');
    return;
  }
  window.open(`${filePath.value}`, '_blank');
};
onMounted(() => {});
</script>
<style lang="scss" scoped>
.interviewVideo_main {
  height: 100%;
  width: 100%;
}
</style>
