<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  name: "line-item",
  setup(_props, context) {
    let shChartRef = ref<HTMLElement>();
    const init = async () => {
      const echarts = await import('echarts');
      type EChartsOption = echarts.EChartsOption;
      let myChart = echarts.init(shChartRef.value, null, {
        renderer: "svg",
      });
      let option: EChartsOption;
      option = {
        xAxis: {
          type: "category",
          data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [150, 230, 224, 218, 135, 147, 260],
            type: "line",
          },
        ],
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