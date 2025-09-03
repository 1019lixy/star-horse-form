<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
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
          trigger: 'item'
        },
        legend: {
          orient: 'vertical',
          left: 'left'
        },
        series: [
          {
            name: '访问来源',
            type: 'pie',
            radius: '50%',
            data: [
              { value: 1048, name: '搜索引擎' },
              { value: 735, name: '直接访问' },
              { value: 580, name: '邮件营销' },
              { value: 484, name: '联盟广告' },
              { value: 300, name: '视频广告' }
            ],
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetX: 0,
                shadowColor: 'rgba(0, 0, 0, 0.5)'
              }
            }
          }
        ]
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
  饼图
</template>

<style scoped lang="scss"></style>