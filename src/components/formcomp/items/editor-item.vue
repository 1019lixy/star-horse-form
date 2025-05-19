<template>
  <starhorse-form-item :isDesign="isDesign" :disabled="disabled" :bareFlag="bareFlag" :formItem="field"
                       :parentField="parentField">
    <star-horse-editor :lang="field.preps?.lang || 'javascript'"
                       style="min-height: 200px !important; flex-direction: column !important"
                       v-model:value="formData[field.preps['name']]"/>
  </starhorse-form-item>
</template>
<script setup lang="ts" name="codeItem">
import {onMounted} from "vue";

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
const init = async () => {
};
const rendered = () => {
};
onMounted(() => {
  init();
});

</script>
<style scoped></style>
