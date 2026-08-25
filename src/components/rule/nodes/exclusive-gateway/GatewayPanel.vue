<template>
  <div class="prop-section">
    <div class="section-title">{{ i18n("rule.panel.gatewayConfig") }}</div>
    <el-form label-width="70px" labelPosition="top">
      <el-form-item :label="i18n('rule.panel.name')">
        <el-input
          v-model="nodeData.name"
          @input="emit('update', { name: nodeData.name })"
        />
      </el-form-item>
      <el-form-item :label="i18n('rule.panel.branchCount')">
        <span>{{ branches.length }} {{ i18n("rule.panel.branchUnit") }}</span>
      </el-form-item>
    </el-form>
    <el-button
      type="primary"
      @click="emit('configure')"
      style="width: 100%"
    >
      <el-icon><Setting /></el-icon> {{ i18n("rule.panel.configBranch") }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import {computed} from "vue";
import {Setting} from "@element-plus/icons-vue";
import {i18n} from "@/lang";

const props = defineProps<{
  nodeData: Record<string, any>;
  variables?: any[];
}>();
const emit = defineEmits<{
  (e: "update", patch: Record<string, any>): void;
  (e: "configure", itemIndex?: number): void;
}>();

const branches = computed(() => props.nodeData?.branches || []);
</script>

<style scoped lang="scss">
.prop-section {
  border-bottom: 1px solid #f1f5f9;
  padding: 12px 14px;
  .section-title {
    font-size: 11px;
    font-weight: 600;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 10px;
  }
}
:deep(.el-form-item) {
  margin-bottom: 10px;
}
:deep(.el-form-item__label) {
  font-size: 12px;
  color: #475569;
}
</style>