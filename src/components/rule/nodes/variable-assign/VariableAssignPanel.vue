<template>
  <div class="prop-section">
    <div class="section-title">
      <span>{{ i18n("rule.panel.assignList") }}</span>
      <el-button type="primary" link @click="emit('configure', -1)">
        <el-icon><Plus /></el-icon> {{ i18n("rule.add") }}
      </el-button>
    </div>
    <div v-if="!assignments.length" class="empty-tip">
      {{ i18n("rule.panel.noAssign") }}
    </div>
    <div v-for="(assign, idx) in assignments" :key="idx" class="list-item">
      <div class="item-info">
        <span class="item-field">{{ assign.variableName }}</span>
        <span class="item-op">=</span>
        <span class="item-val">{{
          assign.value || i18n("rule.panel.empty")
        }}</span>
      </div>
      <div class="item-actions">
        <el-button link type="danger" @click="removeItem(Number(idx))">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {Delete, Plus} from "@element-plus/icons-vue";
import {i18n} from "@/lang";

const props = defineProps<{
  nodeData: Record<string, any>;
  variables?: any[];
}>();
const emit = defineEmits<{
  (e: "update", patch: Record<string, any>): void;
  (e: "configure", itemIndex?: number): void;
}>();

const assignments = computed(() => props.nodeData?.assignments || []);

const removeItem = (idx: number) => {
  const list = [...assignments.value];
  list.splice(idx, 1);
  emit("update", {assignments: list});
};
</script>

<style scoped lang="scss">
@use "../_shared.scss" as *;
</style>