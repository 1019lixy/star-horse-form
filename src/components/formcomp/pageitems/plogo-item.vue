<script setup lang="ts">
defineOptions({
  name: "PageLogoItem",
});

interface LogoItem {
  imageUrl: string;
  companyName: string;
  link?: string;
  width?: string;
  height?: string;
  alt?: string;
}

defineProps({
  item: {
    type: Object as () => LogoItem,
    default: () => ({
      imageUrl: "",
      companyName: "公司名称",
      link: "",
      width: "100px",
      height: "100px",
      alt: "公司Logo",
    }),
  },
  fit: {
    type: String,
    default: "contain", // fill, contain, cover, none, scale-down
  },
});
</script>

<template>
  <div
    class="flex items-center justify-center"
    :style="{ width: item.width, height: item.height }"
  >
    <a
      v-if="item.link"
      :href="item.link"
      target="_blank"
      :title="item.companyName"
    >
      <el-image
        :src="item.imageUrl"
        :alt="item.alt || item.companyName"
        :fit="fit"
        class="w-full h-full"
      />
    </a>
    <el-image
      v-else
      :src="item.imageUrl"
      :alt="item.alt || item.companyName"
      :fit="fit"
      class="w-full h-full"
    />
  </div>
</template>

<style scoped lang="scss"></style>
