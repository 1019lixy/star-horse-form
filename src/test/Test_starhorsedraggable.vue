<script setup lang="ts">
import { computed, onMounted } from "vue";
import { piniaInstance, useDesignPageStore, uuid } from "star-horse-lowcode";

let designPage = useDesignPageStore(piniaInstance);
let nodeList = computed(() => designPage.nodeList);
const handleClick = () => {
  designPage.addNode({
    id: uuid(),
    name: "节点" + (nodeList.value.length + 1),
    width: 100,
    height: 100,
    zIndex: designPage.defaultZindex + nodeList.value.length,
    left: 0,
    top: 0,
  });
};
onMounted(() => {
  designPage.setIsEdit(true);
});
</script>

<template>
  <el-button @click="handleClick">添加节点</el-button>
  <div class="box" @click.stop="designPage.selectNode({})">
    <StarHorseDraggable
      v-for="(item, index) in nodeList"
      :key="index"
      :node="item"
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
