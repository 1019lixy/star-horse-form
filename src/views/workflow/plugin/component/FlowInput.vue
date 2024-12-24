<template>
  <el-input v-model="currentValue" :size="size" :placeholder="placeholder" class="w-fill"/>
</template>
<script setup lang="ts">
import {ref, watch} from "vue";

const props = defineProps({
  size: {
    type: String,
    required: false,
    default: 'large',
  },
  value: {
    type: Array,
    required: false,
    default: () => [],
  },
  placeholder: {
    type: String,
    required: false,
    default: '数值',
  },
})
const emits = defineEmits(["input", "update:name"]);
let currentValue = ref<any>(null);
const initData = (value) => {
  if (props.value && props.value.length > 0) {
    currentValue.value = value[0];
  } else {
    currentValue.value = null;
  }
}
const onChange = (value) => {
  emits('input', [value]);
  emits('update:name', [value]);
}
watch(() => props.value,
    (val) => {
      initData(val);
    },
    {immediate: true, deep: true}
);
watch(() => currentValue.value,
    (val) => {
      onChange(val);
    },
    {immediate: true, deep: true}
);
</script>
