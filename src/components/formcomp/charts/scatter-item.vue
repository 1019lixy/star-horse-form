<script setup lang="ts">
import BaseChart from './BaseChart.vue';

// Generate sample data
const data = [];
for (let i = 0; i < 50; i++) {
  data.push([
    Math.random() * 100,
    Math.random() * 100,
    Math.random() * 100
  ]);
}

const option = {
  xAxis: {},
  yAxis: {},
  series: [{
    symbolSize: 20,
    data: data,
    type: 'scatter'
  }]
};
</script>

<template>
  <BaseChart :option="option" />
</template>

<style scoped lang="scss"></style>