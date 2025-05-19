<script setup lang="ts">
import {dynamicPageContextMenuData, Editable} from "@/plugins/AblesPlugin";
import {onMounted, ref} from "vue";
import {uuid} from "star-horse-lowcode";

const props = defineProps({
  field: {type: Object, required: true},
  formData: {type: Object, required: true},
  itemName: {type: String, required: true}
});
const target = ref();
const moveable = ref({
  draggable: true,
  throttleDrag: 1,
  resizable: true,
  throttleResize: 1,
  keepRatio: false,
  scalable: true,
  throttleScale: 0.01,
  rotatable: true,
  throttleRotate: 0.2,
  pinchable: true,
  origin: false
});
const contentMenuRef = ref();
const contextmenu = (e: MouseEvent) => {
  e.preventDefault();
  contentMenuRef.value?.show(e);
};
const handleDrag = ({target, transform}) => {
  console.log("onDrag", transform);
  target.style.transform = transform;
};
const handleResize = ({target, width, height}) => {
  console.log("onResize", width, height);
  target.style.width = `${width}px`;
  target.style.height = `${height}px`;
};
const handleScale = ({target, transform}) => {
  console.log("onScale", transform);
  target.style.transform = transform;
};
const handleRotate = ({target, transform}) => {
  console.log("onRotate", transform);
  target.style.transform = transform;
};
const handleWarp = ({target, transform}) => {
  console.log("onWarp", transform);
  target.style.transform = transform;
};
// const clearAllStates = () => {
//   Object.keys(states).forEach(key => {
//     moveable[key] = false;
//   });
// }
let clazz = ref<string>("clz");
onMounted(() => {
  clazz.value = "clz" + uuid();
});
</script>

<template>
  <div
      :class="clazz"
      :style="{
      display: 'flex',
      alignItems: 'center'
    }"
      @contextmenu="contextmenu"
      ref="target"
  >
    <component :is="itemName" :field="field" :formData="formData"/>
  </div>
  <VueMoveable
      class="moveable"
      :target="['.' + clazz]"
      :props="{ editable: true }"
      v-bind="moveable"
      :ables="[Editable]"
      @drag="handleDrag"
      @resize="handleResize"
      @scale="handleScale"
      @rotate="handleRotate"
      @warp="handleWarp"
  />
  <Teleport to="body">
    <ContentMenu ref="contentMenuRef" :menu-data="dynamicPageContextMenuData()"/>
  </Teleport>
</template>

<style scoped lang="scss">
.moveable {
  font-family: "Roboto", sans-serif;
  position: relative;
  width: 300px;
  height: 200px;
  /*text-align: center;*/
  font-size: 40px;
  margin: 0 auto;
  font-weight: 100;
  letter-spacing: 1px;
}
</style>
