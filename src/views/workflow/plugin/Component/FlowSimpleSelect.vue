<template>
  <a-select v-model="currentValue" :size="size" allowClear class="w-fill" :placeholder="placeholder" @change="onChange">
    <a-select-option :value="data[valueName]" v-for="(data, i) in datas" :key="i">
      {{ data[labelName] }}
    </a-select-option>
  </a-select>
</template>
<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const props=defineProps({
  datas: {
    type: Array,
    required: false,
    default: () => [],
  },
  valueName: {
    type: String,
    required: false,
    default: 'value',
  },
  labelName: {
    type: String,
    required: false,
    default: 'name',
  },
  size: {
    type: String,
    required: false,
    default: 'large',
  },
  placeholder: {
    type: String,
    required: false,
    default: '请选择',
  },
  value: {
    type: Number,
    required: false,
    default: null,
  },
});
const emits = defineEmits(["input", "update:name", "change"]);
let currentValue = ref<any>( null);
const initData = (value) => {
  if (value ) {
    currentValue.value = value;
  } else {
    currentValue.value = null;
  }
}
const onChange = (value) => {
  emits('input', value);
  emits(
      'update:name',
      props.datas.filter((data) => data[this.valueName] == value).map((data) => data[this.labelName]),
  );
  emits('change', value);
}
onMounted(() => {
  initData(props.value);
});
watch(() => props.value,
    (val) => {
      initData(val);
    },
    {immediate: true, deep: true}
);
</script>
