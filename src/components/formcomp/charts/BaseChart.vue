<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const props = defineProps<{
  option: any;
}>();

const shChartRef = ref<HTMLElement>();
let myChart: any = null;

const initChart = async () => {
  if (!shChartRef.value) return;
  
  const echarts = await import('echarts');
  type EChartsOption = echarts.EChartsOption;
  
  // Dispose of existing chart if it exists
  if (myChart) {
    myChart.dispose();
  }
  
  myChart = echarts.init(shChartRef.value, null, {
    renderer: "svg",
  });
  
  const option: EChartsOption = props.option;
  option && myChart.setOption(option);
  
  // Add resize observer to handle parent container height changes
  const resizeObserver = new ResizeObserver(() => {
    myChart?.resize();
  });
  
  if (shChartRef.value) {
    resizeObserver.observe(shChartRef.value);
  }
};

// Watch for option changes
watch(() => props.option, () => {
  if (myChart && props.option) {
    myChart.setOption(props.option, true); // true for notMerge
  }
});

onMounted(() => {
  initChart();
});
</script>

<template>
  <div ref="shChartRef" style="width: 100%; height: 100%; min-height: 200px;"></div>
</template>

<style scoped lang="scss"></style>