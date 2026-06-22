<script setup lang="ts">
import { computed, ref } from "vue";
import { i18n } from "@/lang";
import type { DataSourceType } from "@/components/types/DataSourceTypes";

defineOptions({ name: "DataSourceConfigPanel" });

const props = defineProps<{
  /** 当前组件类型 */
  itemType: string;
  /** 设计器模式 */
  model: string;
}>();

const emit = defineEmits<{
  (e: "open"): void;
}>();

/** 支持数据源配置的组件类型 */
const dataSourceComps = [
  "select", "tselect", "switch", "autocomplete",
  "checkbox", "radio", "cascade", "transfer",
  "page-select", "dialog-input", "icon", "datapicker",
];

/** 不显示数据源配置的组件类型 */
const exclusionDataSource = ["page-select", "switch", "dialog-input"];

/** 是否显示数据源配置 */
const visible = computed(() => {
  return dataSourceComps.includes(props.itemType) &&
    !exclusionDataSource.includes(props.itemType);
});

/** 当前数据源类型标签 */
const sourceTypeTag = computed(() => {
  const typeMap: Record<string, string> = {
    data: i18n("dyform.unified.source.static"),
    url: i18n("dyform.unified.source.internalApi"),
    dict: i18n("dyform.unified.source.dict"),
    thirdParty: i18n("dyform.unified.source.thirdParty"),
  };
  return typeMap[props.currentSourceType] || "";
});

const currentSourceType = ref<DataSourceType>("data");

const handleOpen = () => {
  emit("open");
};

defineExpose({ currentSourceType });
</script>

<template>
  <el-form-item
    v-if="visible"
    :label="i18n('dyform.props.dataSource')"
    prop="dataSource"
  >
    <div class="data-source-config">
      <el-button type="primary" plain icon="Setting" @click="handleOpen">
        {{ i18n("dyform.props.dataSource.btn") }}
      </el-button>
      <el-tag
        v-if="sourceTypeTag"
        size="small"
        type="info"
        class="source-type-tag"
      >
        {{ sourceTypeTag }}
      </el-tag>
      <help :message="i18n('dyform.props.dataSource.helpMsg')" />
    </div>
  </el-form-item>
</template>

<style scoped lang="scss">
.data-source-config {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}

.source-type-tag {
  flex-shrink: 0;
}
</style>
