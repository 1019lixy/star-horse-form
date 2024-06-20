<script setup lang="ts" name="PropertyPanel">
import ItemPropertiesPanel from "@/views/dyform/ItemPropertiesPanel.vue";
import {ref, watch} from "vue";

const props = defineProps({
  activeTab: {type: String, default: "first"}
});
let activeName = ref(props.activeTab);
let formRef = ref(null);
let formItemRef = ref(null);
const handleClick = () => {
};
watch(() => props.activeTab,
    (val) => activeName.value = val,
    {immediate: true, deep: true});
</script>

<style lang="scss" scoped>

</style>
<template>
  <!--  <el-tabs @tab-click = "handleClick" class = "demo-tabs" v-model = "activeName">
      <el-tab-pane label = "Item属性" name = "first">

      </el-tab-pane>
      <el-tab-pane label = "表单属性" name = "second">
        <form-property-panel ref = "formRef"/>
      </el-tab-pane>
    </el-tabs>-->
  <item-properties-panel ref="formItemRef"/>
</template>
