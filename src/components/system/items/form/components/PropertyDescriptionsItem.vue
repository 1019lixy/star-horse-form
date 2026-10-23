<script setup lang="ts">
import {computed, inject, PropType, Ref} from "vue";

defineOptions({
  name: "PropertyDescriptionsItem",
});

const props = defineProps({
  label: {type: String, default: ""},
  labelPosition: {
    type: String as PropType<"top" | "left">,
    default: "top",
  },
  required: {type: Boolean, default: false},
});

const panelInDialog = inject<Ref<boolean>>(
    "propertyPanelInDialog",
    computed(() => false),
);
const isHorizontal = computed(
    () => panelInDialog.value || props.labelPosition === "left",
);
</script>

<template>
  <el-descriptions
      class="property-desc-item"
      :direction="isHorizontal ? 'horizontal' : 'vertical'"
      :column="1"
      border
      size="small"
  >
    <el-descriptions-item>
      <template #label>
        <span :class="['prop-item-label', {'is-required': required}]">
          <i v-if="required" class="required-star">*</i>{{ label }}
        </span>
      </template>
      <slot/>
    </el-descriptions-item>
  </el-descriptions>
</template>

<style lang="scss" scoped>
.property-desc-item {
  width: 100%;

  :deep(.el-descriptions__label) {
    font-size: 13px;
    color: #606266;
    font-weight: normal;
  }

  :deep(.el-descriptions__label.is-bordered-label) {
    width: 80px;
  }

  :deep(.el-descriptions__content) {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  :deep(.el-descriptions__content.is-vertical-content) {
    > .el-input,
    > .el-select,
    > .el-textarea,
    > .el-input-number {
      flex: 1;
    }
  }

  :deep(.el-descriptions__cell) {
    padding: 8px 10px;
  }

  > :deep(.el-popover) {
    flex-shrink: 0;
  }
}

.prop-item-label {
  &.is-required .required-star {
    color: var(--el-color-danger);
    margin-right: 2px;
  }
}
</style>