<template>
  <span class="node-name-title">
    <span v-if="!isInput" @click.stop="clickEvent()">{{ dataValue }}</span>
    <el-input v-if="isInput" type="text" @blur="blurEvent()" @focus="$event.target.select()" autofocus v-model="dataValue" :style="{ width: width }"/>
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
let dataValue = defineModel("nodeName");
let isInput = ref<boolean>(false);
const clickEvent = () => {
  isInput.value = true;
}
const blurEvent = () => {
  isInput.value = false;
}
</script>
