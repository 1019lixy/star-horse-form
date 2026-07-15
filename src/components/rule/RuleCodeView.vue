<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { Check, Refresh } from "@element-plus/icons-vue";
import { i18n } from "@/lang";
import { success, warning, operationConfirm } from "star-horse-lowcode";

const props = defineProps<{
  ruleData: any;
  nodes: any[];
  edges: any[];
}>();

const emit = defineEmits<{
  (e: "update", data: { nodes: any[]; edges: any[]; variables: any[] }): void;
}>();

// 当前tab：json_prototype(可编辑) / json(只读完整数据)
const tabName = ref<string>("json_prototype");

// JSON原型数据（nodes+edges+variables，可编辑）
const jsonPrototype = ref<any>({ nodes: [], edges: [], variables: [] });

// 完整规则数据（只读，包含ruleData全部信息）
const fullRuleJson = computed(() => {
  const { idRuleDefinition, ruleCode, ruleName, ruleDesc, ruleType, ruleCategory,
    priority, enabled, conditionLogic, status, formId, variables } = props.ruleData;
  return {
    idRuleDefinition, ruleCode, ruleName, ruleDesc, ruleType, ruleCategory,
    priority, enabled, conditionLogic, status, formId,
    variables: variables || [],
    flow: {
      nodes: props.nodes.map(n => ({ ...n, selected: false })),
      edges: props.edges.map(e => ({ ...e, selected: false }))
    }
  };
});

// 从设计视图同步到代码视图
const syncFromDesign = () => {
  jsonPrototype.value = {
    nodes: props.nodes.map(n => ({ ...n, selected: false })),
    edges: props.edges.map(e => ({ ...e, selected: false })),
    variables: props.ruleData.variables ? JSON.parse(JSON.stringify(props.ruleData.variables)) : []
  };
};

// 将代码视图的修改应用回设计视图
const applyToDesign = async () => {
  try {
    await operationConfirm(i18n("rule.codeView.confirmApply"));
  } catch {
    return;
  }
  const data = jsonPrototype.value;
  if (!data || !Array.isArray(data.nodes) || !Array.isArray(data.edges)) {
    warning(i18n("rule.codeView.invalidFormat"));
    return;
  }
  emit("update", {
    nodes: data.nodes,
    edges: data.edges,
    variables: Array.isArray(data.variables) ? data.variables : []
  });
  success(i18n("rule.codeView.applySuccess"));
};

// tab切换时同步数据
const onTabChange = (name: string) => {
  if (name === "json_prototype") {
    syncFromDesign();
  }
};

// 初始化 & 监听设计视图变化（仅在当前tab为可编辑tab时自动同步）
syncFromDesign();
watch(
  [() => props.nodes, () => props.edges, () => props.ruleData.variables],
  () => {
    if (tabName.value === "json_prototype") {
      syncFromDesign();
    }
  },
  { deep: true }
);
</script>

<template>
  <div class="rule-code-view">
    <el-tabs v-model="tabName" type="border-card" @tabChange="onTabChange" class="code-tabs">
      <el-tab-pane name="json_prototype" :label="i18n('rule.codeView.flowJson')">
        <div class="tab-toolbar">
          <el-button type="primary" @click="applyToDesign">
            <el-icon><Check /></el-icon>
            {{ i18n("rule.codeView.applyToDesign") }}
          </el-button>
          <el-button @click="syncFromDesign">
            <el-icon><Refresh /></el-icon>
            {{ i18n("rule.codeView.syncFromDesign") }}
          </el-button>
        </div>
        <star-horse-json-editor currentMode="json" v-model="jsonPrototype" />
      </el-tab-pane>
      <el-tab-pane name="json" :label="i18n('rule.codeView.fullJson')">
        <div class="tab-toolbar">
          <el-tag type="info" effect="plain">{{ i18n("rule.codeView.readonly") }}</el-tag>
        </div>
        <star-horse-json-editor currentMode="view" :modelValue="fullRuleJson" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped lang="scss">
.rule-code-view {
  height: 100%;
  display: flex;
  flex-direction: column;

  .code-tabs {
    flex: 1;
    display: flex;
    flex-direction: column;
    :deep(.el-tabs__content) {
      flex: 1;
      overflow: auto;
      .el-tab-pane {
        height: 100%;
        display: flex;
        flex-direction: column;
      }
    }
  }

  .tab-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    flex-shrink: 0;
  }
}
</style>
