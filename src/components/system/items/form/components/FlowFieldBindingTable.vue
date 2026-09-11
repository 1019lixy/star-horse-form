<script setup lang="ts">
/**
 * 流程节点字段绑定表格。
 *
 * 支撑"一个节点绑定多个字段、每个字段承担不同用途"的配置模型：
 * 每行描述一条绑定（字段 + 用途 + 取值方式 + 流程变量 + 必填），
 * 用途选项由外部传入（可插拔），面板只负责渲染与收集，不硬编码业务语义。
 */
import { computed } from "vue";
import {SelectOption, uuid} from "star-horse-lowcode";
import { i18n } from "@/lang";
import type {
  ApproveMode,
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
    fields?: SelectOption[];
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

/** 默认用途选项（外部未传时兜底）。usage 值与后端 NodeTypeEnums.code 一一对应 */
const defaultUsageOptions = computed<FieldBindingUsageOption[]>(() => [
  { value: "param", label: i18n("dyform.step.usageParam"), multiple: true, needFlowVar: true },
  { value: "ApprovalNode", label: i18n("dyform.step.usageAssignee"), multiple: true },
  { value: "HandleNode", label: i18n("dyform.step.usageHandle"), multiple: true },
  { value: "CopyerNode", label: i18n("dyform.step.usageCc"), multiple: true },
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

/** 抄送通知时机（仅 CopyerNode 行使用）：node=执行到节点才通知，full=全程通知 */
const ccVisibleTypeOptions = [
  { value: "full", label: i18n("dyform.step.ccVisibleTypeFull") },
  { value: "node", label: i18n("dyform.step.ccVisibleTypeNode") },
];

/** 审批方式（仅 ApprovalNode/HandleNode 行使用） */
const approveModeOptions = [
  { value: "or", label: i18n("dyform.step.approveModeOr") },
  { value: "sequential", label: i18n("dyform.step.approveModeSequential") },
  { value: "all", label: i18n("dyform.step.approveModeAll") },
];

/** usage 是否为审批/办理节点（需要配置审批方式） */
const isApproveUsage = (usage: string) => usage === "ApprovalNode" || usage === "HandleNode";

/** 是否配置了抄送绑定（决定"通知时机"列是否显示） */
const hasCopyerBinding = computed(() =>
  bindings.value.some((b) => b.usage === "CopyerNode"),
);

/** 是否配置了审批/办理绑定（决定"审批方式"列是否显示） */
const hasApproveBinding = computed(() =>
  bindings.value.some((b) => isApproveUsage(b.usage)),
);

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
    approveMode: "or" as ApproveMode,
  });
  sync(list);
};

/** 移除绑定行 */
const removeBinding = (id: string) => {
  sync(bindings.value.filter((b) => b.id !== id));
};

/** 字段变更时同步 fieldLabel 与默认 flowVar */
const onFieldChange = (row: NodeFieldBinding) => {
  const f = props.fields.find((x) => x.value === row.fieldName);
  row.fieldLabel = f?.name || row.fieldName;
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
              :key="f.value"
              :label="f.name"
              :value="f.value"
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
        v-if="hasApproveBinding"
        :label="i18n('dyform.step.approveMode')"
        min-width="110"
      >
        <template #default="{ row }">
          <el-select
            v-if="isApproveUsage(row.usage)"
            v-model="row.approveMode"
            filterable
          >
            <el-option
              v-for="opt in approveModeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <span v-else class="text-muted">—</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="hasCopyerBinding"
        :label="i18n('dyform.step.ccVisibleType')"
        min-width="110"
      >
        <template #default="{ row }">
          <el-select
            v-if="row.usage === 'CopyerNode'"
            v-model="row.ccVisibleType"
            filterable
          >
            <el-option
              v-for="opt in ccVisibleTypeOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
          <span v-else class="text-muted">—</span>
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
