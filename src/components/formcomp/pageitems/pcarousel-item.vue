<script setup lang="ts">
defineOptions({
  name: "PageCarouselItem",
});
interface CarouselInfo {
  name: string;
  url: string;
  imageUrl: string;
  openType: string;
}
defineProps({
  interval: {
    type: Number,
    default: 4000,
  },
  type: {
    type: String,
    default: "card",
  },
  height: {
    type: String,
    default: "200px",
  },
  items: {
    type: Array as () => CarouselInfo[],
    default: () => [],
  },
});
</script>

<template>
  <div class="w-full">
    <el-carousel :interval="interval" :type="type" :height="height">
      <el-carousel-item v-for="item in items" :key="item">
        <div class="w-[99%] h-full relative" style="margin: 3px auto">
          <el-image :src="item.imageUrl" fit="fill" />
          <div
            class="absolute bottom-0 left-0 w-full h-[30px] bg-black bg-opacity-50"
          >
            <div class="text-white text-center w-full h-full hover-underline">
              {{ item.name }}
            </div>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss"></style>
