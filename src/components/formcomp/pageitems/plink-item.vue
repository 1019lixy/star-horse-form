<script setup lang="ts">
defineOptions({
  name: "PageLinkItem",
});

interface LinkItem {
  id: string;
  label: string;
  url: string;
  icon?: string;
  target?: string; // _blank, _self, _parent, _top
}

defineProps({
  links: {
    type: Array as () => LinkItem[],
    default: () => []
  },
  direction: {
    type: String,
    default: "horizontal" // horizontal, vertical
  },
  styleType: {
    type: String,
    default: "text" // text, button, icon
  }
});
</script>

<template>
  <div 
    class="w-full"
    :class="{
      'flex flex-wrap justify-center gap-4': direction === 'horizontal',
      'flex flex-col gap-2': direction === 'vertical'
    }"
  >
    <template v-for="link in links" :key="link.id">
      <a
        v-if="styleType === 'text'"
        :href="link.url"
        :target="link.target || '_blank'"
        class="text-blue-500 hover:text-blue-700 hover:underline"
      >
        <el-icon v-if="link.icon">
          <component :is="link.icon" />
        </el-icon>
        {{ link.label }}
      </a>
      
      <el-button
        v-else-if="styleType === 'button'"
        :href="link.url"
        :target="link.target || '_blank'"
        type="primary"
        link
      >
        <el-icon v-if="link.icon">
          <component :is="link.icon" />
        </el-icon>
        {{ link.label }}
      </el-button>
      
      <el-tooltip
        v-else-if="styleType === 'icon'"
        :content="link.label"
        placement="top"
      >
        <a
          :href="link.url"
          :target="link.target || '_blank'"
          class="text-gray-500 hover:text-gray-700"
        >
          <el-icon :size="20">
            <component :is="link.icon || 'Link'" />
          </el-icon>
        </a>
      </el-tooltip>
    </template>
  </div>
</template>

<style scoped lang="scss"></style>