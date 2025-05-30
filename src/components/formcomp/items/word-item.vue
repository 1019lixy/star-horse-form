<template>
  <starhorse-form-item :isDesign="isDesign" :disabled="disabled" :bareFlag="bareFlag" :formItem="field"
                       :parentField="parentField">
    <div ref="container" style="height: 600px;width: 100%"/>
  </starhorse-form-item>
</template>
<script setup lang="ts" name="excelItem">
import {onMounted, ref} from "vue";
import {docSetupUniver} from "@/components/formcomp/utils/setup-univer.ts";


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

const init = async () => {
  docSetupUniver(container.value);
};
const rendered = () => {
};
onMounted(() => {
  init();
});

</script>
<style scoped></style>
