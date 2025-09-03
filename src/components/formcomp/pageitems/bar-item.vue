<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  name: "bar-item",
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
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: {
          type: "category",
          data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        },
        yAxis: {
          type: "value",
        },
        series: [
          {
            data: [120, 200, 150, 80, 70, 110, 130],
            type: "bar",
            name: "销量"
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