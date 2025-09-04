<script setup lang="ts">
defineOptions({
  name: "PageCardItem",
});

defineProps({
  title: {
    type: String,
    default: "卡片标题"
  },
  content: {
    type: String,
    default: "卡片内容"
  },
  imageUrl: {
    type: String,
    default: ""
  },
  shadow: {
    type: String,
    default: "hover" // always, never, hover
  }
});
</script>

<template>
  <el-card :shadow="shadow" class="w-full">
    <template #header>
      <div class="flex items-center">
        <span class="font-bold">{{ title }}</span>
      </div>
    </template>
    <div class="flex flex-col items-center">
      <el-image
        v-if="imageUrl"
        :src="imageUrl"
        fit="cover"
        class="w-full h-40 mb-4"
      />
      <div class="text-gray-700">
        {{ content }}
      </div>
    </div>
  </el-card>
</template>

<style scoped lang="scss"></style>