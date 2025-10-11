<template>
  2 {{field}}
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
import { computed, onMounted, ref } from "vue";
import { warning,ItemPreps} from "star-horse-lowcode";
const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
  field:{
    preps:{}
  }
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");
const itemAction = () => {
  emits("selfFunc", formData);
};
let filePath = computed(() => {
  let path = formData[props.field.preps["name"]];
  if (path) {
    path = `?file=${path}`;
  } else {
    path = "";
  }
  return `/lib/pdfjs/web/viewer.html${encodeURIComponent(path)}`;
});
let pdfPages = ref(0); // pdf文件的页数

const pdfView = () => {
  if (!filePath.value.includes("file=")) {
    warning("请先上传文件");
    return;
  }
  window.open(`${filePath.value}`, "_blank");
};
onMounted(() => {});
</script>
<style lang="scss" scoped>
.interviewVideo_main {
  height: 100%;
  width: 100%;
}
</style>
