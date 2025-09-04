<script setup lang="ts">
defineOptions({
  name: "PageBannerItem",
});

interface BannerItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  linkUrl: string;
}

defineProps({
  banners: {
    type: Array as () => BannerItem[],
    default: () => []
  },
  height: {
    type: String,
    default: "200px"
  }
});
</script>

<template>
  <div class="w-full">
    <el-carousel :height="height" indicator-position="outside">
      <el-carousel-item v-for="banner in banners" :key="banner.id">
        <div class="w-full h-full relative">
          <el-image 
            :src="banner.imageUrl" 
            fit="cover" 
            class="w-full h-full"
          />
          <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h3 class="text-xl font-bold">{{ banner.title }}</h3>
            <p class="text-sm mt-1">{{ banner.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss"></style>