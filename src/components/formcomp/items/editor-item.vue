<template>
  <starhorse-form-item
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :formItem="field"
    :parentField="parentField"
  >
    <star-horse-editor
      :lang="field.preps?.lang || 'javascript'"
      style="min-height: 200px !important; flex-direction: column !important"
      v-model:value="formData[field.preps['name']]"
    />
  </starhorse-form-item>
</template>
<script setup lang="ts" name="codeItem">
import { onMounted } from "vue";
import { ItemPreps } from "star-horse-lowcode";
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
const init = async () => {};
const rendered = () => {};
onMounted(() => {
  init();
});
</script>
<style scoped></style>
