<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { fetchData, hasValidApiConfig } from "./composables/useApiData";
import { PageCompInfo } from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageTimelineItem",
});

interface TimelineItem {
  content: string;
  timestamp: string;
  type?: "" | "primary" | "success" | "warning" | "danger" | "info";
  size?: "normal" | "large";
  icon?: string;
  placement?: "top" | "bottom";
  hideTimestamp?: boolean;
}

const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({}),
});

// Reactive data
const apiData = ref<TimelineItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const timelineData = computed(() => {
  return apiData.value && apiData.value.length > 0
    ? apiData.value
    : props.preps.items;
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
    <el-skeleton :rows="3" animated />
  </div>

  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>

  <el-timeline v-else v-bind="preps" :style="styles">
    <el-timeline-item
      v-for="(item, index) in timelineData"
      :key="index"
      :timestamp="item.timestamp"
      :type="item.type"
      :size="item.size"
      :icon="item.icon"
      :placement="item.placement"
      :hide-timestamp="item.hideTimestamp"
    >
      {{ item.content }}
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped lang="scss"></style>
