<template>
  <div class="flow-design-operate">
    <!-- <div class="flow-fullscreen">
      <span class="flow-fullscreen-icon"></span>
    </div>  -->
    <div class="flow-design-zoom">
      <div class="flow-design-zoom-less" @click="onZoomOut"></div>
      <span>{{ zoomValue }}%</span>
      <div class="flow-design-zoom-more" @click="onZoomIn"></div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {ref} from "vue";

const INIT_ZOOM_VALUE = 100;
const MIN_ZOOM_VALUE = 50;
const MAX_ZOOM_VALUE = 200;
defineProps({
  min: {
    type: Number,
    required: false,
    default: MIN_ZOOM_VALUE,
  },
  max: {
    type: Number,
    required: false,
    default: MAX_ZOOM_VALUE,
  },
});
const emits = defineEmits(["input"]);
let zoomValue = ref<number>(INIT_ZOOM_VALUE);
const onZoomOut = () => {
  let value = zoomValue.value;
  value -= 10;
  if (value <= MIN_ZOOM_VALUE) {
    value = MIN_ZOOM_VALUE;
  }
  zoomValue.value = value;
  emits('input', value);
}
const onZoomIn = () => {
  let value = zoomValue.value;
  value += 10;
  if (value >= MAX_ZOOM_VALUE) {
    value = MAX_ZOOM_VALUE;
  }
  zoomValue.value = value;
  emits('input', value);
}
</script>
