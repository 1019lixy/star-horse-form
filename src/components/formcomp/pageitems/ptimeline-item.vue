<script setup lang="ts">
defineOptions({
  name: "PageTimelineItem",
});

interface TimelineItem {
  content: string;
  timestamp: string;
  type?: '' | 'primary' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'normal' | 'large';
  icon?: string;
  placement?: 'top' | 'bottom';
  hideTimestamp?: boolean;
}

defineProps({
  items: {
    type: Array as () => TimelineItem[],
    default: () => [
      {
        content: "事件开始",
        timestamp: "2018-04-15",
      },
      {
        content: "已批准",
        timestamp: "2018-04-13",
      },
      {
        content: "成功",
        timestamp: "2018-04-11",
      },
    ]
  },
  reverse: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: "left" // left, right, alternate
  }
});
</script>

<template>
  <el-timeline 
    :reverse="reverse"
    :mode="mode"
    style="max-width: 600px"
  >
    <el-timeline-item
      v-for="(item, index) in items"
      :key="index"
      :timestamp="item.timestamp"
      :type="item.type"
      :size="item.size"
      :icon="item.icon"
      :placement="item.placement"
      :hide-timestamp="item.hideTimestamp"
    >
      {{ item.content }}
    </el-timeline-item>
  </el-timeline>
</template>

<style scoped lang="scss"></style>