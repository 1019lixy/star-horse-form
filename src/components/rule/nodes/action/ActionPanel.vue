<template>
  <div class="prop-section">
    <div class="section-title">
      <span>{{ i18n("rule.panel.actionList") }}</span>
      <el-button type="primary" link @click="emit('configure', -1)">
        <el-icon><Plus /></el-icon> {{ i18n("rule.add") }}
      </el-button>
    </div>
    <div v-if="!actions.length" class="empty-tip">
      {{ i18n("rule.panel.noAction") }}
    </div>
    <div v-for="(act, idx) in actions" :key="idx" class="list-item">
      <div class="item-info">
        <el-tag type="success" effect="plain">{{
          getActionLabel(act.actionType)
        }}</el-tag>
        <span class="item-field">{{ act.targetField || "-" }}</span>
      </div>
      <div class="item-actions">
        <el-button link @click="emit('configure', idx)">
          <el-icon><Edit /></el-icon>
        </el-button>
        <el-button link type="danger" @click="removeItem(idx)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {Delete, Edit, Plus} from "@element-plus/icons-vue";
import {i18n} from "@/lang";

const props = defineProps<{
  nodeData: Record<string, any>;
  variables?: any[];
}>();
const emit = defineEmits<{
  (e: "update", patch: Record<string, any>): void;
  (e: "configure", itemIndex?: number): void;
}>();

const actions = computed(() => props.nodeData?.actions || []);

const removeItem = (idx: number) => {
  const list = [...actions.value];
  list.splice(idx, 1);
  emit("update", {actions: list});
};

const getActionLabel = (type: string) => {
  const map: Record<string, string> = {
    SHOW_FIELD: "rule.action.showField",
    HIDE_FIELD: "rule.action.hideField",
    SET_VALUE: "rule.action.setValue",
    CLEAR_VALUE: "rule.action.clearValue",
    SET_REQUIRED: "rule.action.setRequired",
    SET_OPTIONAL: "rule.action.setOptional",
    SET_READONLY: "rule.action.setReadonly",
    SET_EDITABLE: "rule.action.setEditable",
    SET_DISABLED: "rule.action.setDisabled",
    SET_ENABLED: "rule.action.setEnabled",
    SHOW_MESSAGE: "rule.action.showMessage",
    REDIRECT: "rule.action.redirect",
  };
  return i18n(map[type] || type);
};
</script>

<style scoped lang="scss">
@use "../_shared.scss" as *;
</style>