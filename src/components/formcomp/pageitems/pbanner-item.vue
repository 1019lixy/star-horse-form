<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { hasValidApiConfig, fetchData } from "./composables/useApiData";
import { PageCompInfo } from "@/components/types/PageLayoutComp";

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

// Package all props into preps and styles objects for easier management
const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

// Extract props from preps
const banners = props.preps?.banners || [];
const apiConfig = props.preps?.apiConfig || {};
const height = props.preps?.height || "200px";

// Reactive data
const apiData = ref<BannerItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const bannerData = computed(() => {
  return apiData.value && apiData.value.length > 0 ? apiData.value : banners;
});

// Fetch data from API
const fetchApiData = async () => {
  // If no API config, don't fetch and don't set loading state
  if (!hasValidApiConfig(apiConfig)) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result: any = await fetchData(apiConfig);
    if (!result.error) {
      // Set the fetched data
      apiData.value = result.data;
    } else {
      error.value = result.error;
      console.error("API call failed:", result.error);
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : "Unknown error occurred";
    console.error("API call failed:", err);
  } finally {
    loading.value = false;
  }
};

// Watch for API config changes
watch(
  () => apiConfig,
  () => {
    fetchApiData();
  },
  { deep: true },
);

// Fetch initial data
onMounted(() => {
  fetchApiData();
});
</script>

<template>
  <div class="w-full">
    <div v-if="loading" class="text-center py-4">
      <el-skeleton :rows="2" animated />
    </div>

    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <el-carousel v-else :height="height" indicator-position="outside">
      <el-carousel-item v-for="banner in bannerData" :key="banner.id">
        <div class="w-full h-full relative">
          <el-image :src="banner.imageUrl" fit="cover" class="w-full h-full" />
          <div
            class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4"
          >
            <h3 class="text-xl font-bold">{{ banner.title }}</h3>
            <p class="text-sm mt-1">{{ banner.description }}</p>
          </div>
        </div>
      </el-carousel-item>
    </el-carousel>
  </div>
</template>

<style scoped lang="scss"></style>
