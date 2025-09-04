<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { hasValidApiConfig, fetchData } from './composables/useApiData';
import { defaultChartOptions } from './componentConfig';

const props = defineProps<{
  option: any;
  type?: string; // Chart type (optional)
  apiConfig?: any; // API configuration
}>();

const shChartRef = ref<HTMLElement>();
let myChart: any = null;
const loading = ref<boolean>(false); // Start with false since we're not loading by default
const apiData = ref<any>(null);
const error = ref<string | null>(null);

// Determine which data to use (API data if available, otherwise static option)
const chartOption = computed(() => {
  // If we have API data, use it
  if (apiData.value && Object.keys(apiData.value).length > 0) {
    return apiData.value;
  }
  // If we have a specific chart type and default options for it, use those
  if (props.type && defaultChartOptions[props.type]) {
    return defaultChartOptions[props.type];
  }
  // If we have static option passed in props and it's not empty, use it
  if (props.option && typeof props.option === 'object' && Object.keys(props.option).length > 0) {
    return props.option;
  }
  // Fallback to default chart type options
  if (props.type && defaultChartOptions[props.type]) {
    return defaultChartOptions[props.type];
  }
  // Final fallback to line chart
  return defaultChartOptions.line;
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

const initChart = async () => {
  if (!shChartRef.value) return;
  const echarts = await import('echarts');

  if (myChart) {
    myChart.dispose();
  }

  myChart = echarts.init(shChartRef.value, null, {
    renderer: "svg",
  });

  // Use chartOption which will be either API data or static option
  if (chartOption.value) {
    myChart.setOption(chartOption.value);
  }

  // Add resize observer to handle parent container height changes
  const resizeObserver = new ResizeObserver(() => {
    myChart?.resize();
  });

  if (shChartRef.value) {
    resizeObserver.observe(shChartRef.value);
  }
};

// Watch for option changes
watch(() => chartOption.value, () => {
  if (myChart && chartOption.value) {
    myChart.setOption(chartOption.value, true); // true for notMerge
  }
});

// Watch for API config changes
watch(() => props.apiConfig, () => {
  fetchApiData();
}, { deep: true });

// Watch for option changes
watch(() => props.option, () => {
  if (myChart && props.option) {
    myChart.setOption(props.option, true); // true for notMerge
  }
});

// Watch for type changes
watch(() => props.type, (newType, oldType) => {
  if (myChart) {
    // When type changes, update the chart with the appropriate default options
    const newOption = newType && defaultChartOptions[newType] 
      ? defaultChartOptions[newType] 
      : props.option || defaultChartOptions.line;
    myChart.setOption(newOption, true); // true for notMerge
  }
});

onMounted(() => {
  fetchApiData();
  initChart();
});
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <el-skeleton animated />
  </div>
  
  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>
  
  <div v-else ref="shChartRef" style="width: 100%; height: 100%; min-height: 200px;"></div>
</template>

<style scoped lang="scss"></style>