<script setup lang="ts">
/**
 * 流程节点字段绑定表格。
 *
 * 支撑"一个节点绑定多个字段、每个字段承担不同用途"的配置模型：
 * 每行描述一条绑定（字段 + 用途 + 取值方式 + 流程变量 + 必填），
 * 用途选项由外部传入（可插拔），面板只负责渲染与收集，不硬编码业务语义。
 */
import { computed } from "vue";
import { uuid } from "star-horse-lowcode";
import { i18n } from "@/lang";
import type {
  BindableField,
  FieldBindingUsageOption,
  NodeFieldBinding,
} from "@/components/workflow/types";

defineOptions({ name: "FlowFieldBindingTable" });

const props = withDefaults(
  defineProps<{
    /** 绑定项列表（v-model） */
    modelValue?: NodeFieldBinding[];
    /** 可绑定字段 */
    fields?: BindableField[];
    /** 用途选项（外部可扩展） */
    usageOptions?: FieldBindingUsageOption[];
    compSize?: string;
  }>(),
  {
    modelValue: () => [],
    fields: () => [],
    usageOptions: () => [],
    compSize: "default",
  },
);
const emit = defineEmits(["update:modelValue"]);

/** 默认用途选项（外部未传时兜底） */
const defaultUsageOptions = computed<FieldBindingUsageOption[]>(() => [
  { value: "param", label: i18n("dyform.step.usageParam"), multiple: true, needFlowVar: true },
  { value: "assignee", label: i18n("dyform.step.usageAssignee"), multiple: true },
  { value: "cc", label: i18n("dyform.step.usageCc"), multiple: true },
  { value: "notice", label: i18n("dyform.step.usageNotice"), multiple: true },
  { value: "condition", label: i18n("dyform.step.usageCondition"), multiple: true },
  { value: "title", label: i18n("dyform.step.usageTitle"), multiple: false },
  { value: "urgency", label: i18n("dyform.step.usageUrgency"), multiple: false },
]);

const usageOpts = computed(() =>
  props.usageOptions.length ? props.usageOptions : defaultUsageOptions.value,
);

const valueModeOptions = [
  { value: "direct", label: i18n("dyform.step.valueModeDirect") },
  { value: "ref", label: i18n("dyform.step.valueModeRef") },
  { value: "expression", label: i18n("dyform.step.valueModeExpression") },
  { value: "constant", label: i18n("dyform.step.valueModeConstant") },
];

const bindings = computed<NodeFieldBinding[]>(() => props.modelValue || []);

/** 同步修改后回发 */
const sync = (list: NodeFieldBinding[]) => emit("update:modelValue", list);

/** 新增绑定行 */
const addBinding = () => {
  const list = [...bindings.value];
  list.push({
    id: uuid(),
    fieldName: "",
    usage: "param",
    valueMode: "direct",
    flowVar: "",
    required: false,
  });
  sync(list);
};

/** 移除绑定行 */
const removeBinding = (id: string) => {
  sync(bindings.value.filter((b) => b.id !== id));
};

/** 字段变更时同步 fieldLabel 与默认 flowVar */
const onFieldChange = (row: NodeFieldBinding) => {
  const f = props.fields.find((x) => x.fieldName === row.fieldName);
  row.fieldLabel = f?.label || row.fieldName;
  if (!row.flowVar) row.flowVar = row.fieldName;
};

/** 当前用途选项元数据 */
const usageMeta = (usage: string) => usageOpts.value.find((o) => o.value === usage);
</script>

<template>
  <div class="ffbt-wrap">
    <el-table
      :data="bindings"
      :size="compSize"
      border
      max-height="240"
      row-key="id"
      class="ffbt-table"
    >
      <el-table-column
        :label="i18n('dyform.step.bindFieldLabel')"
        min-width="120"
      >
        <template #default="{ row }">
          <el-select
            v-model="row.fieldName"
            filterable
            clearable
            :placeholder="i18n('dyform.step.assigneeFieldPlaceholder')"
            @change="onFieldChange(row)"
          >
            <el-option
              v-for="f in fields"
              :key="f.fieldName"
              :label="`${f.label} (${f.fieldName})`"
              :value="f.fieldName"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        :label="i18n('dyform.step.flowBindingUsage')"
        min-width="110"
      >
        <template #default="{ row }">
          <el-select v-model="row.usage" filterable>
            <el-option
              v-for="opt in usageOpts"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        :label="i18n('dyform.step.flowValueMode')"
        min-width="100"
      >
        <template #default="{ row }">
          <el-select v-model="row.valueMode" filterable>
            <el-option
              v-for="opt in valueModeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </template>
      </el-table-column>
      <el-table-column
        :label="i18n('dyform.step.flowVarName')"
        min-width="110"
      >
        <template #default="{ row }">
          <el-input
            v-if="usageMeta(row.usage)?.needFlowVar"
            v-model="row.flowVar"
            :size="compSize"
            :placeholder="row.fieldName"
          />
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column
        :label="i18n('dyform.step.flowParamRequired')"
        width="60"
        align="center"
      >
        <template #default="{ row }">
          <el-switch v-model="row.required" :size="compSize" />
        </template>
      </el-table-column>
      <el-table-column
        :label="i18n('dyform.step.bindAction')"
        width="70"
        align="center"
      >
        <template #default="{ row }">
          <el-button
            link
            type="danger"
            :size="compSize"
            @click="removeBinding(row.id)"
          >
            {{ i18n("dyform.step.flowRemoveBinding") }}
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-button
      :size="compSize"
      type="primary"
      plain
      class="ffbt-add"
      @click="addBinding"
    >
      + {{ i18n("dyform.step.flowAddBinding") }}
    </el-button>
  </div>
</template>

<style lang="scss" scoped>
.ffbt-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ffbt-table {
  width: 100%;

  :deep(.el-select) {
    width: 100%;
  }
}

.ffbt-add {
  align-self: flex-start;
}

.text-muted {
  color: var(--el-text-color-placeholder);
}
</style>