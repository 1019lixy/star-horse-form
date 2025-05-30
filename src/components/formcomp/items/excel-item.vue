<template>
  <starhorse-form-item :isDesign="isDesign" :disabled="disabled" :bareFlag="bareFlag" :formItem="field"
                       :parentField="parentField">
    <div ref="container" style="height: 600px;width: 100%;position: relative"></div>
  </starhorse-form-item>
</template>

<script setup lang="ts">
import {onBeforeUnmount, onMounted, ref} from 'vue'
import {setupUniver} from "@/components/formcomp/utils/setup-univer.ts";

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

  univerAPIRef.value = setupUniver(container.value)

});

onBeforeUnmount(() => {
  container.value?.dispose();
  univerAPIRef.value = null;
});

</script>
