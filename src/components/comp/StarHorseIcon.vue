<script setup lang="ts" name="StarHorseIcon">
import {computed} from 'vue';

const props = defineProps({
  iconClass: {type: String, required: true,},
  className: {type: String,},
  title: {type: String, default: "",},
  size: {type: String, default: "20px"},
  color: {type: String, default: "var(--star-horse-style)"},
  cursor: {type: String, default: "small"}
});
const iconName = computed(() => `#icon-${props.iconClass}`);
const svgClass = computed(() => {
  if (props.className) {
    return "svg-icon " + props.className;
  } else {
    return "svg-icon";
  }
});
</script>
<style lang="scss" scoped>
.svg-icon {
  cursor: v-bind(cursor);
  width: v-bind(size);
  height: v-bind(size);
  color: v-bind(color);
  margin-left: 0.35em;
  margin-right: 0.35em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  outline: none;
}
</style>
<template>
  <svg :class="svgClass" aria-hidden="false">
    <use :xlink:href="iconName"></use>
    <title v-if="!!title">{{ title }}</title>
  </svg>
</template>
