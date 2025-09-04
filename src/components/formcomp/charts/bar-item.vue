<script setup lang="ts">
import BaseChart from './BaseChart.vue';

const option = {
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
</script>

<template>
  <BaseChart :option="option" />
</template>

<style scoped lang="scss"></style>