<script lang="ts">
import { defineComponent, onMounted, ref } from "vue";

export default defineComponent({
  name: "funnel-item",
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
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}%'
        },
        legend: {
          data: ['展现', '点击', '访问', '咨询', '订单']
        },
        series: [
          {
            name: '漏斗图',
            type: 'funnel',
            left: '10%',
            top: 60,
            bottom: 60,
            width: '80%',
            min: 0,
            max: 100,
            minSize: '0%',
            maxSize: '100%',
            sort: 'descending',
            gap: 2,
            label: {
              show: true,
              position: 'inside'
            },
            labelLine: {
              length: 10,
              lineStyle: {
                width: 1,
                type: 'solid'
              }
            },
            itemStyle: {
              borderColor: '#fff',
              borderWidth: 1
            },
            emphasis: {
              label: {
                fontSize: 20
              }
            },
            data: [
              { value: 60, name: '访问' },
              { value: 40, name: '咨询' },
              { value: 20, name: '订单' },
              { value: 80, name: '点击' },
              { value: 100, name: '展现' }
            ]
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
</template>

<style scoped lang="scss"></style>