<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { hasValidApiConfig, fetchData } from "./composables/useApiData";
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageLinkItem",
});

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  target?: string; // _blank, _self, _parent, _top
}

const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});

// Reactive data
const apiData = ref<LinkItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const linkData = computed(() => {
  return apiData.value && apiData.value.length > 0
    ? apiData.value
    : props.preps.links;
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
  <div
    class="w-full"
    :class="{
      'flex flex-wrap justify-center gap-4': preps.direction === 'horizontal',
      'flex flex-col gap-2': preps.direction === 'vertical',
    }"
  >
    <div v-if="loading" class="text-center py-4">
      <el-skeleton animated />
    </div>

    <div v-else-if="error" class="text-center py-4 text-red-500">
      {{ error }}
    </div>

    <template v-else>
      <template v-for="link in linkData" :key="link.id">
        <a
          v-if="preps.styleType === 'text'"
          :href="link.url"
          :target="link.target || '_blank'"
          class="text-blue-500 hover:text-blue-700 hover:underline"
        >
          <el-icon v-if="link.icon">
            <component :is="link.icon" />
          </el-icon>
          {{ link.label }}
        </a>

        <el-button
          v-else-if="preps.styleType === 'button'"
          :href="link.url"
          :target="link.target || '_blank'"
          type="primary"
          link
        >
          <el-icon v-if="link.icon">
            <component :is="link.icon" />
          </el-icon>
          {{ link.label }}
        </el-button>

        <el-tooltip
          v-else-if="preps.styleType === 'icon'"
          :content="link.label"
          placement="top"
        >
          <a
            :href="link.url"
            :target="link.target || '_blank'"
            class="text-gray-500 hover:text-gray-700"
          >
            <el-icon :size="20">
              <component :is="link.icon || 'Link'" />
            </el-icon>
          </a>
        </el-tooltip>
      </template>
    </template>
  </div>
</template>

<style scoped lang="scss"></style>
