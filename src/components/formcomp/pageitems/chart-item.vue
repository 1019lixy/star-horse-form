<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {fetchData, hasValidApiConfig} from "./composables/useApiData";
import {PageCompInfo} from "@/components/types/PageLayoutComp";

// Package all props into preps and styles objects for easier management
const props = withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});

const shChartRef = ref<HTMLElement>();
let myChart: any = null;
const loading = ref<boolean>(false); // Start with false since we're not loading by default
const apiData = ref<any>(null);
const error = ref<string | null>(null);

// Extract props from preps
const apiConfig = props.preps?.apiConfig || {};
const type = props.preps?.type || "line";
const option = props.preps?.option || {};


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
      myChart.setOption(result.data);
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

const initChart = async () => {
  if (!shChartRef.value) return;
  const echarts = await import("echarts");

  if (myChart) {
    myChart.dispose();
  }

  myChart = echarts.init(shChartRef.value, null, {
    renderer: "svg",
  });

  if (props.preps?.option) {
    myChart.setOption(props.preps.option);
  }

  // Add resize observer to handle parent container height changes
  const resizeObserver = new ResizeObserver(() => {
    myChart?.resize();
  });

  if (shChartRef.value) {
    resizeObserver.observe(shChartRef.value);
  }
};

watch(
    () => props.preps.option,
    () => {
      if (myChart && props.preps.option) {
        myChart.setOption(props.preps.option, true); // true for notMerge
      }
    },
);

watch(
    () => props.preps.apiConfig,
    () => {
      fetchApiData();
    },
    {deep: true},
);

onMounted(() => {
  fetchApiData();
  initChart();
});
</script>

<template>
  <div v-if="loading" class="text-center py-4">
    <el-skeleton animated/>
  </div>

  <div v-else-if="error" class="text-center py-4 text-red-500">
    {{ error }}
  </div>

  <div
      v-else
      ref="shChartRef"
      style="width: 100%; height: 100%; min-height: 200px"
  ></div>
</template>

<style scoped lang="scss"></style>
