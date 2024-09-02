<template>
  <el-select v-model="currentValue" :size="size" :mode="mode" allowClear class="w-fill" @change="onChange">
    <el-option :value="data[valueName]" v-for="(data, i) in datas" :key="i">
      {{ data[labelName] }}
    </el-option>
  </el-select>
</template>
<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const props = defineProps({
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
  mode: {
    type: String,
    required: false,
    default: 'default',
  },
  value: {
    type: Array,
    required: false,
    default: () => [],
  },
});
const emits = defineEmits(["input", "update:name", "change"]);
let currentValue = ref<any>(props.mode == 'multiple' ? [] : null);
const initData = (value) => {
  if (value && value.length > 0 && props.mode == 'default') {
    currentValue.value = value[0];
  } else if (value && value.length > 0 && props.mode == 'multiple') {
    currentValue.value = value;
  } else {
    currentValue.value = props.mode == 'multiple' ? [] : null;
  }
}
const onChange = (value) => {
  emits('input', props.mode == 'multiple' ? value : [value]);
  emits(
      'update:name',
      props.datas.filter((data) => (props.mode == 'multiple' ? value.includes(data[props.valueName]) : data[props.valueName] == value)).map((data) => data[props.labelName]),
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
