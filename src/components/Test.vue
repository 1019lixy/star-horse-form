<script setup lang="ts">
import {onMounted, ref} from "vue";
import {DynamicNode} from "@/components/types/DynamicNode";

let nodeList = ref<Array<DynamicNode>>([]);
const handleClick = () => {
  nodeList.value.push({
    id: "node" + nodeList.value.length + 1,
    name: "节点" + (nodeList.value.length + 1),
    width: 100,
    height: 100,
    left: 0,
    top: 0,
  })
}
onMounted(() => {

})
</script>

<template>
  <el-button @click="handleClick">添加节点</el-button>
  <div class="box">
    <StarHorseDraggable v-for="(item,index) in nodeList" :key="index" :node="item"
                        />
  </div>
</template>

<style lang="scss" scoped>
.box {
  width: 100%;
  height: 100%;
  border: 1px #056768 solid;
  border-radius: 10px;
  position: relative;
}
</style>

