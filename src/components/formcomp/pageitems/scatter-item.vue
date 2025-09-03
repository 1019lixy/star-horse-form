<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  name: "scatter-item",
  setup(_props, context) {
    let shChartRef = ref<HTMLElement>();
    const init = async () => {
      const echarts = await import('echarts');
      type EChartsOption = echarts.EChartsOption;
      let myChart = echarts.init(shChartRef.value, null, {
        renderer: "svg",
      });
      let option: EChartsOption;
      
      // Generate sample data
      const data = [];
      for (let i = 0; i < 50; i++) {
        data.push([
          Math.random() * 100,
          Math.random() * 100,
          Math.random() * 100
        ]);
      }
      
      option = {
        xAxis: {},
        yAxis: {},
        series: [{
          symbolSize: 20,
          data: data,
          type: 'scatter'
        }]
      };
      option && myChart.setOption(option);
    };

    onMounted(() => {
      init();
    });

    return {
      shChartRef,
    };
  },
});
</script>

<template>
  <div ref="shChartRef" style="width: 100%; height: 300px;"></div>
</template>

<style scoped lang="scss"></style>