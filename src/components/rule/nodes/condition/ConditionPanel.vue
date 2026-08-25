<template>
  <div class="prop-section">
    <div class="section-title">
      <span>{{ i18n("rule.panel.conditionList") }}</span>
      <div class="section-actions">
        <el-button type="primary" link @click="addCondition(-1)">
          <el-icon><Plus /></el-icon> {{ i18n("rule.add") }}
        </el-button>
        <el-button type="primary" link @click="addGroup">
          <el-icon><FolderAdd /></el-icon> 添加条件组
        </el-button>
      </div>
    </div>
    <div class="logic-toggle">
      <span>{{ i18n("rule.panel.logic") }}：</span>
      <el-radio-group
        :model-value="nodeData.logic"
        @change="(v: any) => emit('update', { logic: v })"
      >
        <el-radio-button value="AND">{{ i18n("rule.option.and") }}</el-radio-button>
        <el-radio-button value="OR">{{ i18n("rule.option.or") }}</el-radio-button>
      </el-radio-group>
    </div>
    <div v-if="!conditions.length" class="empty-tip">
      {{ i18n("rule.panel.noCondition") }}
    </div>
    <template v-for="(item, idx) in conditions" :key="idx">
      <!-- 条件组 -->
      <div v-if="item.type === 'group'" class="group-card">
        <div class="group-strip">
          <el-radio-group
            :model-value="item.logic"
            size="small"
            @change="(v: any) => updateGroupLogic(idx, v)"
          >
            <el-radio-button value="AND">AND</el-radio-button>
            <el-radio-button value="OR">OR</el-radio-button>
          </el-radio-group>
          <span class="group-label">#{{ idx + 1 }}</span>
          <div class="group-actions">
            <el-button link size="small" @click="addConditionToGroup(idx)">
              <el-icon><Plus /></el-icon>
            </el-button>
            <el-button link size="small" type="danger" @click="removeGroup(idx)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div class="group-body">
        <div
          v-if="!item.conditions || item.conditions.length === 0"
          class="group-empty-tip"
        >
          组内尚无条件，点击 + 添加
        </div>
        <div
          v-for="(cond, cIdx) in item.conditions || []"
          :key="cIdx"
          class="list-item group-item"
        >
          <div class="item-info">
            <span class="item-field">{{ cond.fieldName || "-" }}</span>
            <span class="item-op">{{ getOpSymbol(cond.operator) }}</span>
            <span class="item-val">{{
              cond.value || i18n("rule.panel.emptyValue")
            }}</span>
          </div>
          <div class="item-actions">
            <el-button link @click="editGroupCondition(idx, cIdx)">
              <el-icon><Edit /></el-icon>
            </el-button>
            <el-button link type="danger" @click="removeGroupCondition(idx, cIdx)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        </div>
      </div>
      <!-- 根级条件 -->
      <div v-else class="list-item">
        <div class="item-info">
          <span class="item-field">{{ item.fieldName || "-" }}</span>
          <span class="item-op">{{ getOpSymbol(item.operator) }}</span>
          <span class="item-val">{{
            item.value || i18n("rule.panel.emptyValue")
          }}</span>
        </div>
        <div class="item-actions">
          <el-button link @click="editCondition(idx)">
            <el-icon><Edit /></el-icon>
          </el-button>
          <el-button link type="danger" @click="removeCondition(idx)">
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>
    </template>
  </div>
  <!-- 组内条件编辑弹窗 -->
  <ConditionEditDialog
    v-if="inlineEditor.visible"
    :visible="true"
    :condition="inlineEditor.condition"
    :variables="variables"
    @save="onInlineSave"
    @close="inlineEditor.visible = false"
  />
</template>

<script setup lang="ts">
import {computed, reactive} from "vue";
import {Delete, Edit, FolderAdd, Plus} from "@element-plus/icons-vue";
import {i18n} from "@/lang";
import ConditionEditDialog from "./ConditionEditDialog.vue";

const props = defineProps<{
  nodeData: Record<string, any>;
  variables?: any[];
}>();
const emit = defineEmits<{
  (e: "update", patch: Record<string, any>): void;
  (e: "configure", itemIndex?: number): void;
}>();

const conditions = computed(() => props.nodeData?.conditions || []);

const inlineEditor = reactive<{
  visible: boolean;
  condition: any;
  onSave: ((c: any) => void) | null;
}>({
  visible: false,
  condition: null,
  onSave: null,
});

const addCondition = (idx: number) => {
  emit("configure", idx);
};

const addGroup = () => {
  const list = [...conditions.value];
  list.push({type: "group", logic: "AND", conditions: []});
  emit("update", {conditions: list});
};

const addConditionToGroup = (groupIdx: number) => {
  inlineEditor.condition = null;
  inlineEditor.onSave = (c: any) => {
    const list = [...conditions.value];
    const group = list[groupIdx];
    if (group?.type === "group") {
      const gc = [...(group.conditions || []), c];
      list[groupIdx] = {...group, conditions: gc};
      emit("update", {conditions: list});
    }
    inlineEditor.visible = false;
  };
  inlineEditor.visible = true;
};

const editCondition = (idx: number) => {
  emit("configure", idx);
};

const editGroupCondition = (groupIdx: number, condIdx: number) => {
  const group = conditions.value[groupIdx];
  if (group?.type === "group") {
    inlineEditor.condition = group.conditions?.[condIdx] ?? null;
    inlineEditor.onSave = (c: any) => {
      const list = [...conditions.value];
      const g = list[groupIdx];
      if (g?.type === "group") {
        const gc = [...(g.conditions || [])];
        gc[condIdx] = c;
        list[groupIdx] = {...g, conditions: gc};
        emit("update", {conditions: list});
      }
      inlineEditor.visible = false;
    };
    inlineEditor.visible = true;
  }
};

const removeCondition = (idx: number) => {
  const list = [...conditions.value];
  list.splice(idx, 1);
  emit("update", {conditions: list});
};

const removeGroupCondition = (groupIdx: number, condIdx: number) => {
  const list = [...conditions.value];
  const group = list[groupIdx];
  if (group?.type === "group") {
    const gc = [...(group.conditions || [])];
    gc.splice(condIdx, 1);
    list[groupIdx] = {...group, conditions: gc};
    emit("update", {conditions: list});
  }
};

const removeGroup = (idx: number) => {
  const list = [...conditions.value];
  list.splice(idx, 1);
  emit("update", {conditions: list});
};

const updateGroupLogic = (idx: number, logic: string) => {
  const list = [...conditions.value];
  const group = list[idx];
  if (group?.type === "group") {
    list[idx] = {...group, logic};
    emit("update", {conditions: list});
  }
};

const onInlineSave = (c: any) => {
  if (inlineEditor.onSave) {
    inlineEditor.onSave(c);
  }
};

const getOpSymbol = (op: string) => {
  const map: Record<string, string> = {
    EQ: "=", NEQ: "≠", GT: ">", GTE: "≥", LT: "<", LTE: "≤",
    IN: "∈", NOT_IN: "∉", CONTAINS: "⊃", NOT_CONTAINS: "⊄",
    IS_NULL: "∅", NOT_NULL: "∃", STARTS_WITH: "⊙", ENDS_WITH: "⊛",
  };
  return map[op] || op;
};
</script>

<style scoped lang="scss">
@use "../_shared.scss" as *;

.section-actions {
  display: flex;
  gap: 4px;
  align-items: center;
}

.group-card {
  background: #f0f5ff;
  border: 1px solid #c7d2fe;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;

  .group-strip {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 2px 6px;
    background: rgba(99, 102, 241, 0.08);
    border-bottom: 1px solid rgba(99, 102, 241, 0.16);
    min-height: 26px;

    :deep(.el-radio-group) {
      display: flex;
    }
    :deep(.el-radio-button__inner) {
      padding: 1px 8px;
      font-size: 11px;
      height: 20px;
      line-height: 18px;
    }

    .group-label {
      flex: 1;
      font-size: 10px;
      font-weight: 600;
      color: #6366f1;
    }

    .group-actions {
      display: flex;
      gap: 2px;
      :deep(.el-button) { padding: 0 4px; min-height: auto; }
    }
  }

  .group-body {
    padding: 4px 6px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .group-empty-tip {
    text-align: center;
    color: #94a3b8;
    font-size: 11px;
    padding: 8px 0;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    border: 1px dashed #c7d2fe;
  }

  .group-item {
    background: #fff !important;
    margin-bottom: 2px;
  }
}
</style>