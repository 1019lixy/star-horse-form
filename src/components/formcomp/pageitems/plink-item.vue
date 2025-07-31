<script setup lang="ts">
import PimageItem from "./pimage-item.vue";

defineOptions({
  name: "PageLinkItem",
});
interface LinkItem {
  id: string;
  companyName: string;
  logo: string;
  width: string;
  height: string;
  link: string;
}
defineProps({
  linkList: {
    type: Array as () => LinkItem[],
    default: () => [],
  },
});
</script>

<template>
  <div class="w-full h-[30px]">
    <ul
      class="m-auto flex justify-center items-center"
      v-for="item in linkList"
    >
      <li class="w-[100px] h-[30px]">
        <div class="text-white text-center w-full h-full">
          <a :href="item.link" target="_blank" :title="item.companyName">
            <PimageItem
              :imageUrl="item.logo"
              :width="item.width"
              :height="item.height"
              v-if="item.logo"
            />
            <span v-else>{{ item.companyName }}</span>
          </a>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="scss"></style>
