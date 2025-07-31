<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";
import * as echarts from "echarts";

export default defineComponent({
  setup(_props, context) {
    let shChartRef = ref<HTMLElement>();
    const init = () => {
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
      //分静态数据和动态数据
      //如果静态数据，则需要提供x坐标的数据和线条的数据
      //如果动态数据，需要提供url
    });

    return {
      shChartRef,
    };
  },
});
</script>

<template>
  <div ref="shChartRef"></div>
  折线图
</template>

<style scoped lang="scss"></style>
