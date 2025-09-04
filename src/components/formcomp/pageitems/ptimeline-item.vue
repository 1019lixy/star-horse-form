<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { hasValidApiConfig, fetchData } from './composables/useApiData';

defineOptions({
  name: "PageTimelineItem",
});

interface TimelineItem {
  content: string;
  timestamp: string;
  type?: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'normal' | 'large';
  icon?: string;
  placement?: 'top' | 'bottom';
  hideTimestamp?: boolean;
}

const props = defineProps({
  items: {
    type: Array as () => TimelineItem[],
    default: () => [
      {
        content: "事件开始",
        timestamp: "2018-04-15",
      },
      {
        content: "已批准",
        timestamp: "2018-04-13",
      },
      {
        content: "成功",
        timestamp: "2018-04-11",
      },
    ]
  },
  reverse: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: "left" // left, right, alternate
  },
  apiConfig: {
    type: Object,
    default: () => ({})
  }
});

// Reactive data
const apiData = ref<TimelineItem[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static data)
const timelineData = computed(() => {
  return apiData.value && apiData.value.length > 0 ? apiData.value : props.items;
});

// Fetch data from API
const fetchApiData = async () => {
  // If no API config, don't fetch and don't set loading state
  if (!hasValidApiConfig(props.apiConfig)) {
    return;
  }
  
  loading.value = true;
  error.value = null;
  
  try {
    const result: any = await fetchData(props.apiConfig);
    if (!result.error) {
      // Set the fetched data
      apiData.value = result.data;
    } else {
      error.value = result.error;
      console.error('API call failed:', result.error);
    }
  } catch (err: any) {
    error.value = err instanceof Error ? err.message : 'Unknown error occurred';
    console.error('API call failed:', err);
  } finally {
    loading.value = false;
  }
};

// Watch for API config changes
watch(() => props.apiConfig, () => {
  fetchApiData();
}, { deep: true });

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
  
  <el-timeline 
    v-else
    :reverse="reverse"
    :mode="mode"
    style="max-width: 600px"
  >
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