<template>
  <span class="node-name-title">
    <span v-if="!isInput" @click.stop="clickEvent()">{{ value }}</span>
    <a-input v-if="isInput" type="text" @blur="blurEvent()" @focus="$event.currentTarget.select()"
             v-focus v-model="value" :style="{ width: width }"/>
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
