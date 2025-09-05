<script setup lang="ts">
defineOptions({
  name: "PageCardItem",
});

// Package all props into preps object for easier management
const props = withDefaults(defineProps<PageCompInfo>(),{
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});


// Extract props from preps or use defaults
const title = props.preps?.title || "卡片标题";
const content = props.preps?.content || "卡片内容";
const imageUrl = props.preps?.imageUrl || "";
const shadow = props.preps?.shadow || "hover";

// Card style properties
const bodyStyle = props.preps?.bodyStyle || {};
const headerClass = props.preps?.headerClass || "";
const bodyClass = props.preps?.bodyClass || "";
const footerClass = props.preps?.footerClass || "";
</script>

<template>
  <el-card 
    :shadow="shadow" 
    :body-style="bodyStyle"
    :header-class="headerClass"
    :body-class="bodyClass"
    :footer-class="footerClass"
    class="w-full"
  >
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