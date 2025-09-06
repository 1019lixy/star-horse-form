<template>
  <div ref="svgContainer"></div>
</template>
<script lang="ts" setup>
import { onMounted, ref, watch } from "vue";

const props = defineProps({
  path: { type: String, required: true },
  size: { type: String, default: "20px" },
  cursor: { type: String, default: "normal" },
  marginLeft: { type: String, default: "1px" },
  marginRight: { type: String, default: "1px" },
  color: { type: String, default: "var(--star-horse-style)" },
});
const svgContainer = ref(null);
const loadSvg = async () => {
  const path = props.path.endsWith(".svg") ? props.path : `${props.path}.svg`;
  console.log(path);
  const response = await fetch(path);
  let svgText = await response.text();
  // svgText = svgText.replace(/fill="[^"]*"/g, 'fill="currentColor"');
  svgContainer.value.innerHTML = svgText;
};
onMounted(loadSvg);
watch(() => props.path, loadSvg);
</script>
<style scoped>
:deep(svg) {
  cursor: v-bind(cursor);
  width: v-bind(size) !important;
  height: v-bind(size) !important;
  color: v-bind(color);
  margin-left: v-bind(marginLeft);
  margin-right: v-bind(marginRight);
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
  outline: none;
  align-items: center;
  justify-content: center;
  display: flex;
}
</style>
