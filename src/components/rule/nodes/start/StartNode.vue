<template>
  <div class="start-node">
    <Handle type="source" :position="Position.Bottom" />
    <div class="node-pill">
      <div class="pill-badge">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor" />
        </svg>
      </div>
      <span class="pill-label">{{ i18n("rule.node.start") }}</span>
      <span v-if="triggerLabel" class="pill-event">{{ triggerLabel }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {Handle, Position} from "../../compat";
import {i18n} from "@/lang";

const props = defineProps<{
  data?: any;
}>();

const triggerLabel = computed(() => {
  const evt = props.data?.triggerEvent?.type;
  if (!evt) return "";
  const map: Record<string, string> = {
    ON_LOAD: i18n("rule.opt.onLoad"),
    ON_CHANGE: i18n("rule.opt.onChange"),
    ON_SUBMIT: i18n("rule.opt.onSubmit"),
    ON_VALIDATE: i18n("rule.opt.onValidate"),
    ON_BUTTON_CLICK: i18n("rule.opt.onButtonClick"),
  };
  return map[evt] || "";
});
</script>

<style scoped lang="scss">
@use "../../styles/design-tokens.scss" as tokens;

.start-node {
  position: relative;
  display: inline-block;

  .node-pill {
    display: inline-flex;
    align-items: center;
    gap: tokens.$rd-space-2;
    padding: 6px 14px 6px 6px;
    background: tokens.$rd-bg-surface;
    border: 1px solid tokens.$rd-border;
    border-radius: tokens.$rd-radius-pill;
    box-shadow: tokens.$rd-shadow-xs;
    transition:
      box-shadow tokens.$rd-transition-base,
      border-color tokens.$rd-transition-base;

    &:hover {
      border-color: tokens.$rd-node-start;
      box-shadow: 0 2px 8px rgba(71, 85, 105, 0.15);
    }
  }

  .pill-badge {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: tokens.$rd-node-start;
    color: tokens.$rd-text-inverse;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 1px 3px rgba(71, 85, 105, 0.35);

    svg {
      width: 12px;
      height: 12px;
      margin-left: 1px;
    }
  }

  .pill-label {
    font-size: tokens.$rd-font-sm;
    font-weight: tokens.$rd-font-weight-semibold;
    color: tokens.$rd-text-primary;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .pill-event {
    font-size: tokens.$rd-font-xs;
    color: tokens.$rd-text-tertiary;
    padding: 1px 6px;
    background: tokens.$rd-bg-subtle;
    border-radius: tokens.$rd-radius-sm;
    white-space: nowrap;
  }
}
</style>
