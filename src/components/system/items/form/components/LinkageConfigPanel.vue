<script setup lang="ts">
import { computed } from "vue";
import { i18n } from "@/lang";

defineOptions({ name: "LinkageConfigPanel" });

const props = defineProps<{
  /** 当前组件类型 */
  itemType: string;
  /** 设计器模式 */
  model: string;
}>();

const emit = defineEmits<{
  (e: "open"): void;
}>();

/** 支持联动策略的组件类型 */
const relationComps = [
  "select", "tselect", "switch", "autocomplete",
  "checkbox", "radio", "cascade", "transfer","input",
  "page-select", "dialog-input", "icon", "datapicker",
];

/** 不显示联动策略的组件类型 */
const exclusionRelation = ["icon", "transfer"];

/** 是否显示联动策略配置 */
const visible = computed(() => {
  return relationComps.includes(props.itemType) &&
    !exclusionRelation.includes(props.itemType) &&
    props.model === "full";
});

const handleOpen = () => {
  emit("open");
};
</script>

<template>
  <el-form-item
    v-if="visible"
    :label="i18n('dyform.props.dataRelation')"
    prop="dataRelation"
  >
    <div class="linkage-config">
      <el-button type="primary" plain icon="Setting" @click="handleOpen">
        {{ i18n("dyform.props.dataRelation.btn") }}
      </el-button>
      <help :message="i18n('dyform.props.dataRelation.helpMsg')" />
    </div>
  </el-form-item>
</template>

<style scoped lang="scss">
.linkage-config {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
}
</style>
