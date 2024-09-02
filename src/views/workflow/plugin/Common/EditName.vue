<template>
  <span class="node-name-title">
    <span v-if="!isInput" @click.stop="clickEvent()">{{ value }}</span>
    <el-input v-if="isInput" type="text" @blur="blurEvent()" @focus="$event.currentTarget.select()"
              autofocus v-model="dataValue" :style="{ width: width }"/>
  </span>
</template>
<script setup lang="ts">
import {ref} from "vue";

const props = defineProps({
  value: {
    type: String,
    required: false,
  },
  width: {
    type: String,
    required: false,
    default: '85%',
  },
});
let dataValue = ref<string>(props.value);
const emits = defineEmits(["edit", "input"]);
let isInput = ref<boolean>(false);
const clickEvent = () => {
  isInput.value = true;
  emits('edit', false);
}
const blurEvent = () => {
  isInput.value = false;
  emits('input', props.value);
  emits('edit', true);
}
</script>
