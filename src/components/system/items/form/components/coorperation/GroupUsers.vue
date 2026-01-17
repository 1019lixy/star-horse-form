<script setup lang="ts">

import {StarHorseIcon} from "star-horse-lowcode";
import {ref, watch} from "vue";

const props = defineProps({
  type: {
    type: String,
    default: "userList"
  },
  docId: {
    type: String,
  }
});
const userList = ref<any>([]);
const testNums=ref<number>(10);
const loadUserList = () => {
  testNums.value=props.type=="userList"?5:2;
  if (props.docId) {

  }
};
watch(() => props.type, () => {
  loadUserList();
}, {immediate: true});
</script>

<template>
  <ul class="flex flex-col w-full">
    <li v-for=" i of testNums" class="flex-row flex justify-between items-center my-1">
      <div class="flex-1 flex items-center">
        <star-horse-icon iconClass="user-circle" size="24px"/>
        <span class="mx-3">用户{{ i }}</span></div>
      <div class="flex-1 flex justify-center">角色{{ i }}</div>
    </li>
  </ul>
</template>

<style scoped lang="scss">

</style>
