<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { hasValidApiConfig, fetchData } from "./composables/useApiData";
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageNavbarItem",
});

interface NavItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
}

const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});

// Reactive data
const apiData = ref<NavItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const navData = computed(() => {
  return apiData.value && apiData.value.length > 0
    ? apiData.value
    : props.preps.navItems;
});

// Fetch data from API
const fetchApiData = async () => {
  // If no API config, don't fetch and don't set loading state
  if (!hasValidApiConfig(props.preps.apiConfig)) {
    return;
  }

  loading.value = true;
  error.value = null;

  try {
    const result: any = await fetchData(props.preps.apiConfig);
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
  () => props.preps.apiConfig,
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
  <div v-if="loading" class="text-center py-4">
    <el-skeleton animated />
  </div>

  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>

  <el-page-header v-else :title="preps.title">
    <template #content>
      <div class="flex items-center">
        <el-image
          v-if="preps.logoUrl"
          :src="preps.logoUrl"
          fit="cover"
          class="w-8 h-8 mr-2"
        />
        <span class="text-lg font-bold">{{ preps.title }}</span>
      </div>
    </template>
    <template #extra>
      <div class="flex items-center">
        <el-menu mode="horizontal" class="border-0">
          <el-menu-item v-for="item in navData" :key="item.id" :index="item.id">
            <el-icon v-if="item.icon">
              <component :is="item.icon" />
            </el-icon>
            <span>{{ item.label }}</span>
          </el-menu-item>
        </el-menu>
      </div>
    </template>
  </el-page-header>
</template>

<style scoped lang="scss"></style>
