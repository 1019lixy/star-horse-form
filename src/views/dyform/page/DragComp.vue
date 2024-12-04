<script setup lang="ts">
import {contentMenuData, Editable} from "@/views/dyform/page/AblesPlugin.ts";
import Moveable from "vue3-moveable";
import {onMounted, ref} from "vue";
import {uuid} from "@/api/system.ts";

const props = defineProps({
  field: {type: Object, required: true},
  formData: {type: Object, required: true},
  itemName: {type: String, required: true},
});
const target = ref();
const contentMenuRef = ref();
const onDrag = ({transform}) => {
  target.value.style.transform = transform;
}

const contextmenu = (e: MouseEvent) => {
  console.log(e);
  e.preventDefault();
  contentMenuRef.value?.show(e);
}
const onScale = ({drag}) => {
  target.value.style.transform = drag.transform;
}
const onRotate = ({drag}) => {
  target.value.style.transform = drag.transform;
};
let clazz = ref<string>("clz");
onMounted(() => {
  clazz.value = "clz" + uuid();
})
</script>

<template>
  <div :class="clazz" @contextmenu="contextmenu" ref="target">
    <component :is="itemName" :field="field" :formData="formData"/>
  </div>
  <Moveable
      className="moveable"
      :target="['.'+clazz]"
      :props="({ editable: true })"
      :draggable="true"
      :scalable="true"
      :rotatable="true"
      :ables="[Editable]"
      @drag="onDrag"
      @scale="onScale"
      @rotate="onRotate"
  />
  <ContentMenu ref="contentMenuRef" :menu-data="contentMenuData"/>
</template>

<style scoped lang="scss">

</style>
