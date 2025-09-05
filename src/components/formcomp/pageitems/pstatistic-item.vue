<script setup lang="ts">
import {Warning} from "@element-plus/icons-vue";
import {PageCompInfo} from "@/components/types/PageLayoutComp.js";

defineOptions({
  name: "PageStatisticItem",
});
withDefaults(defineProps<PageCompInfo>(), {
  isDesign: () => false,
  preps: () => ({}),
  styles: () => ({})
});
</script>

<template>
  <el-statistic
      v-bind="preps"
  >
    <template #title>
      <div style="display: inline-flex; align-items: center">
        {{ preps.title }}
        <el-tooltip
            v-if="preps.description"
            effect="dark"
            :content="preps.description"
            placement="top"
        >
          <el-icon style="margin-left: 4px" :size="12">
            <Warning/>
          </el-icon>
        </el-tooltip>
      </div>
    </template>
    <template #prefix>
      <span v-if="preps.prefix">{{ preps.prefix }}</span>
    </template>
    <template #suffix>
      <span v-if="preps.suffix">{{ preps.suffix }}</span>
    </template>
  </el-statistic>
</template>

<style scoped lang="scss"></style>
