<script setup lang="ts">
defineOptions({
  name: "PageLogoItem"
});
interface LinkItem {
  id: string,
  companyName: string,
  logo: string,
  width: string,
  height: string,
  link: string,
}
defineProps({
  logoWidth: {
    type: String,
    default: '100px'
  },
  logoHeight: {
    type: String,
    default: '100px'
  },
  item: {
    type: Object as () => LinkItem,
    default: () => ({})
  }
})
</script>

<template>
  <div :style="{ width: logoWidth, height: logoHeight }">
    <a :href="item.link" target="_blank" :title="item.companyName">
      <PimageItem :imageUrl="item.logo" :width="item.width" :height="item.height" />
    </a>
  </div>
</template>

<style scoped lang="scss"></style>
