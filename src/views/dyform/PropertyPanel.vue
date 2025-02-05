<script setup lang="ts" name="PropertyPanel">
import ItemPropertiesPanel from "@/views/dyform/ItemPropertiesPanel.vue";
import {ref, watch} from "vue";

const props = defineProps({
  activeTab: {type: String, default: "first"}
});
const emits = defineEmits(["shortKeySwitch"]);
let activeName = ref(props.activeTab);
let formItemRef = ref(null);
const shortKeySwitch = (val: boolean) => {
  emits("shortKeySwitch", val);
}
watch(() => props.activeTab,
    (val) => activeName.value = val,
    {immediate: true, deep: true});
</script>
<style lang="scss" scoped>
</style>
<template>
  <item-properties-panel @shortKeySwitch="shortKeySwitch" ref="formItemRef"/>
</template>
