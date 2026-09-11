<script setup lang="ts">
/**
 * 流程节点配置面板（双模式）。
 *
 * 模式一 design（配置节点）：
 *   在面板内完成"字段绑定 → 流转设置"，配置结果存入 flowConfig。
 *   适用于分段本身即为一个审批节点的场景。
 *
 * 模式二 reuse（绑定已有流程）：
 *   选择已创建的流程定义 → 加载流程参数 → 将参数与分段内表单字段绑定。
 *   适用于分段复用已有流程定义的场景，配置结果存入 flowConfig。
 *
 * 数据结构（flowConfig）：
 * - mode: "design" | "reuse"  绑定模式
 * - flowFlag: "Y"/"N"         是否启用
 *
 * design 模式字段：
 * - fieldBindings: NodeFieldBinding[]   多字段绑定
 * - assigneeType/assigneeField/assigneeValue/ccValue/visibleScope/rejectPolicy: 流转设置
 *
 * reuse 模式字段：
 * - flowDefineId: string                 已绑定的流程定义 ID
 * - flowParamBindings: FlowParamBinding[]  流程参数与表单字段绑定
 */
import {computed, ref, watch} from "vue";
import {SelectOption, StarHorseDataSelector, uuid} from "star-horse-lowcode";
import {i18n} from "@/lang";
import FlowFieldBindingTable from "@/components/system/items/form/components/FlowFieldBindingTable.vue";
import type {
  FieldBindingUsageOption,
  FlowDefineOption,
  FlowNodeMode,
  FlowParam,
  FlowParamBinding,
  NodeFieldBinding,
} from "@/components/workflow/types";

defineOptions({name: "FlowNodeConfigPanel"});

const props = withDefaults(
    defineProps<{
      modelValue?: any;
      fields?: SelectOption[];
      /** 字段绑定用途选项（外部可扩展，不传则使用内置默认） */
      usageOptions?: FieldBindingUsageOption[];
      nodeKey?: string;
      nodeName?: string;
      compSize?: string;
      /** 已有流程定义选项（reuse 模式下拉选择） */
      flowDefineOptions?: FlowDefineOption[];
      /** 加载流程参数：根据流程定义 ID 返回参数列表 */
      loadFlowParams?: (flowDefineId: string) => Promise<FlowParam[]>;
    }>(),
    {
      fields: () => [],
      usageOptions: () => [],
      nodeKey: "",
      nodeName: "",
      compSize: "default",
      flowDefineOptions: () => [],
      loadFlowParams: undefined,
    },
);
const emit = defineEmits(["update:modelValue"]);

/** 默认配置工厂 */
const defaultCfg = () => ({
  mode: "design" as FlowNodeMode,
  flowFlag: "N",
  fieldBindings: [] as NodeFieldBinding[],
  assigneeType: "starter_pick",
  assigneeField: "",
  assigneeValue: [],
  ccValue: [],
  visibleScope: "prev_and_self",
  rejectPolicy: "to_prev",
});

/** 旧版 paramFields 迁移为 fieldBindings */
const migrateParamFields = (c: any) => {
  if (Array.isArray(c.paramFields) && !Array.isArray(c.fieldBindings)) {
    c.fieldBindings = c.paramFields.map((p: any) => ({
      id: uuid(),
      fieldName: p.fieldName,
      fieldLabel: p.fieldName,
      usage: "param",
      valueMode: "direct",
      flowVar: p.flowVar || p.fieldName,
      required: !!p.required,
    }));
  }
  delete c.paramFields;
};

/** 旧版 usage 值迁移为 NodeTypeEnums.code */
const migrateUsage = (c: any) => {
  if (!Array.isArray(c.fieldBindings)) return;
  const map: Record<string, string> = {
    assignee: "ApprovalNode",
    handle: "HandleNode",
    cc: "CopyerNode",
  };
  for (const b of c.fieldBindings) {
    if (b && typeof b.usage === "string" && map[b.usage]) b.usage = map[b.usage];
  }
};

/** 流程节点配置对象（父级传入的响应式引用，直接维护其属性） */
const cfg = computed<any>(() => {
  const c = props.modelValue;
  return c && typeof c === "object" && !Array.isArray(c) ? c : null;
});

/** modelValue 缺失时通知父级初始化；有效时补齐缺省字段并迁移旧数据 */
watch(
    () => props.modelValue,
    (c) => {
      if (!c || typeof c !== "object" || Array.isArray(c)) {
        emit("update:modelValue", defaultCfg());
        return;
      }
      migrateParamFields(c);
      migrateUsage(c);
      if (c.mode !== "design" && c.mode !== "reuse") c.mode = "design";
      if (c.flowFlag !== "Y" && c.flowFlag !== "N") c.flowFlag = "N";
      if (!Array.isArray(c.fieldBindings)) c.fieldBindings = [];
      if (!c.assigneeType) c.assigneeType = "starter_pick";
      if (typeof c.assigneeField !== "string") c.assigneeField = "";
      if (!Array.isArray(c.assigneeValue)) c.assigneeValue = [];
      if (!Array.isArray(c.ccValue)) c.ccValue = [];
      if (!c.visibleScope) c.visibleScope = "prev_and_self";
      if (!c.rejectPolicy) c.rejectPolicy = "to_prev";
      if (typeof c.flowDefineId !== "string") c.flowDefineId = "";
      if (!Array.isArray(c.flowParamBindings)) c.flowParamBindings = [];
    },
    {immediate: true},
);

/** 节点启用开关 */
const flowEnabled = computed({
  get: () => cfg.value?.flowFlag === "Y",
  set: (v: boolean) => {
    if (cfg.value) cfg.value.flowFlag = v ? "Y" : "N";
  },
});

/** 绑定模式 */
const bindMode = computed<FlowNodeMode>({
  get: () => (cfg.value?.mode === "reuse" ? "reuse" : "design"),
  set: (v: FlowNodeMode) => {
    if (cfg.value) cfg.value.mode = v;
  },
});

const bindModeOptions = [
  {name: i18n("dyform.step.flowBindMode.design"), value: "design"},
  {name: i18n("dyform.step.flowBindMode.reuse"), value: "reuse"},
];

// ==================== design 模式：字段绑定 + 流转设置 ====================

/** 字段绑定列表（双向绑定到 cfg.fieldBindings） */
const fieldBindings = computed<NodeFieldBinding[]>({
  get: () => cfg.value?.fieldBindings || [],
  set: (val) => {
    if (cfg.value) cfg.value.fieldBindings = val;
  },
});

const assigneeType = computed(() => cfg.value.assigneeType || "starter_pick");

const assigneeTypeOptions = [
  {name: i18n("dyform.step.assigneeStarterPick"), value: "starter_pick"},
  {name: i18n("dyform.step.assigneeUser"), value: "user"},
  {name: i18n("dyform.step.assigneeRole"), value: "role"},
  {name: i18n("dyform.step.assigneeDept"), value: "dept"},
  {name: i18n("dyform.step.assigneeFormField"), value: "form_field"},
];

const visibleScopeOptions = [
  {name: i18n("dyform.step.scopePrevSelf"), value: "prev_and_self"},
  {name: i18n("dyform.step.scopeAllFilled"), value: "all_filled"},
  {name: i18n("dyform.step.scopeSelfOnly"), value: "self_only"},
];

const rejectPolicyOptions = [
  {name: i18n("dyform.step.rejectNone"), value: "none"},
  {name: i18n("dyform.step.rejectToStarter"), value: "to_starter"},
  {name: i18n("dyform.step.rejectToPrev"), value: "to_prev"},
];

/** 经办人字段候选：usage=ApprovalNode 的绑定字段 + 全部字段（去重） */
const assigneeFieldOptions = computed(() => {
  const seen = new Set<any>();
  const out: SelectOption[] = [];
  fieldBindings.value.forEach((b) => {
    if (b.usage === "ApprovalNode" && b.fieldName && !seen.has(b.fieldName)) {
      seen.add(b.fieldName);
      const f = props.fields.find((x) => x.value === b.fieldName);
      out.push({value: b.fieldName, name: f?.name || b.fieldName});
    }
  });
  props.fields.forEach((f) => {
    if (!seen.has(f.value)) {
      seen.add(f.value);
      out.push(f);
    }
  });
  return out;
});

// ==================== reuse 模式：选择已有流程 → 参数绑定 ====================

/** 流程参数加载状态 */
const flowParamsLoading = ref(false);
/** 当前选中流程定义的参数列表 */
const flowParams = ref<FlowParam[]>([]);

/**
 * 选择流程定义时：加载参数列表，并以新参数为基准重建绑定项。
 * 保留旧绑定中同参数名的字段映射，新增参数自动生成空绑定。
 */
const onFlowDefineChange = async (flowDefineId: string) => {
  if (cfg.value) cfg.value.flowDefineId = flowDefineId;
  if (!flowDefineId || !props.loadFlowParams) {
    flowParams.value = [];
    if (cfg.value) cfg.value.flowParamBindings = [];
    return;
  }
  flowParamsLoading.value = true;
  try {
    const params = await props.loadFlowParams(flowDefineId);
    flowParams.value = params || [];
    const oldBindings: FlowParamBinding[] = cfg.value?.flowParamBindings || [];
    if (cfg.value) {
      cfg.value.flowParamBindings = flowParams.value.map((p) => {
        const old = oldBindings.find((b) => b.param === p.name);
        return {
          id: old?.id || uuid(),
          param: p.name,
          fieldName: old?.fieldName || "",
          required: !!p.required,
        };
      });
    }
  } catch {
    flowParams.value = [];
  } finally {
    flowParamsLoading.value = false;
  }
};

/** 回显：cfg 中已有 flowDefineId 时加载参数列表 */
watch(
    () => cfg.value?.flowDefineId,
    (id) => {
      if (bindMode.value === "reuse" && id && props.loadFlowParams && !flowParams.value.length) {
        onFlowDefineChange(id);
      }
    },
    {immediate: true},
);

/** 流程参数绑定项（双向绑定到 cfg.flowParamBindings） */
const flowParamBindings = computed<FlowParamBinding[]>({
  get: () => cfg.value?.flowParamBindings || [],
  set: (val) => {
    if (cfg.value) cfg.value.flowParamBindings = val;
  },
});
</script>

<template>
  <div v-if="cfg" class="flow-node-config">
    <!-- 面板头：节点标识 + 启用开关 -->
    <div class="fnc-head">
      <span class="fnc-title">{{ i18n("dyform.step.flowNodeConfig") }}</span>
      <span class="fnc-node">
        <el-tag :size="compSize" type="info">{{ nodeName || "-" }}</el-tag>
        <el-tag v-if="nodeKey" :size="compSize">{{ nodeKey }}</el-tag>
      </span>
      <el-switch
          v-model="flowEnabled"
          :size="compSize"
          style="margin-left: auto"
      />
    </div>

    <template v-if="flowEnabled">
      <!-- ===== 绑定模式选择 ===== -->
      <div class="fnc-section">
        <span class="fnc-section-title">{{
            i18n("dyform.step.flowBindMode")
          }}</span>
      </div>
      <el-radio-group v-model="bindMode" :size="compSize" class="fnc-mode-radio">
        <el-radio-button
            v-for="opt in bindModeOptions"
            :key="opt.value"
            :value="opt.value"
        >{{ opt.name }}
        </el-radio-button>
      </el-radio-group>

      <!-- ===== design 模式：字段绑定 + 流转设置 ===== -->
      <template v-if="bindMode === 'design'">
        <div class="fnc-section">
          <span class="fnc-section-title">{{
              i18n("dyform.step.flowBindFields")
            }}</span>
          <span class="fnc-section-tip">{{
              i18n("dyform.step.flowBindFieldsRemark")
            }}</span>
        </div>

        <FlowFieldBindingTable
            v-if="fields.length"
            v-model="fieldBindings"
            :fields="fields"
            :usage-options="usageOptions"
            :comp-size="compSize"
        />
        <el-empty
            v-else
            :description="i18n('dyform.step.flowNoFields')"
            :image-size="48"
        />

        <div class="fnc-section">
          <span class="fnc-section-title">{{
              i18n("dyform.step.flowSettings")
            }}</span>
        </div>

        <el-form label-width="110px" :size="compSize" class="fnc-form">
          <el-form-item :label="i18n('dyform.step.assigneeType')">
            <el-select v-model="cfg.assigneeType" filterable>
              <el-option
                  v-for="opt in assigneeTypeOptions"
                  :key="opt.value"
                  :label="opt.name"
                  :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item
              v-if="assigneeType === 'form_field'"
              :label="i18n('dyform.step.assigneeField')"
          >
            <el-select
                v-model="cfg.assigneeField"
                filterable
                clearable
                :placeholder="i18n('dyform.step.assigneeFieldPlaceholder')"
            >
              <el-option
                  v-for="f in assigneeFieldOptions"
                  :key="f.fieldName"
                  :label="`${f.label} (${f.fieldName})`"
                  :value="f.fieldName"
              />
            </el-select>
          </el-form-item>

          <el-form-item
              v-else-if="
              assigneeType === 'user' ||
              assigneeType === 'role' ||
              assigneeType === 'dept'
            "
              :label="i18n('dyform.step.assigneeValue')"
          >
            <StarHorseDataSelector
                v-model="cfg.assigneeValue"
                multiple
                allow-create
                :comp-size="compSize"
                :placeholder="i18n('dyform.step.flowSelectorTip')"
                style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="i18n('dyform.step.ccValue')">
            <StarHorseDataSelector
                v-model="cfg.ccValue"
                multiple
                allow-create
                :comp-size="compSize"
                :placeholder="i18n('dyform.step.ccValueRemark')"
                style="width: 100%"
            />
          </el-form-item>

          <el-form-item :label="i18n('dyform.step.visibleScope')">
            <el-select v-model="cfg.visibleScope" filterable>
              <el-option
                  v-for="opt in visibleScopeOptions"
                  :key="opt.value"
                  :label="opt.name"
                  :value="opt.value"
              />
            </el-select>
          </el-form-item>

          <el-form-item :label="i18n('dyform.step.rejectPolicy')">
            <el-select v-model="cfg.rejectPolicy" filterable>
              <el-option
                  v-for="opt in rejectPolicyOptions"
                  :key="opt.value"
                  :label="opt.name"
                  :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </template>

      <!-- ===== reuse 模式：选择已有流程 → 参数绑定 ===== -->
      <template v-if="bindMode === 'reuse'">
        <div class="fnc-section">
          <span class="fnc-section-title">{{
              i18n("dyform.step.formFlowDefine")
            }}</span>
        </div>

        <el-form label-width="110px" :size="compSize" class="fnc-form">
          <el-form-item :label="i18n('dyform.step.formFlowDefine')">
            <el-select
                v-model="cfg.flowDefineId"
                filterable
                clearable
                :placeholder="i18n('dyform.step.formFlowDefinePlaceholder')"
                @change="onFlowDefineChange"
            >
              <el-option
                  v-for="opt in flowDefineOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
              />
            </el-select>
          </el-form-item>
        </el-form>

        <!-- 流程参数与表单字段绑定 -->
        <template v-if="cfg.flowDefineId">
          <div class="fnc-section">
            <span class="fnc-section-title">{{
                i18n("dyform.step.flowParamBinding")
              }}</span>
            <span class="fnc-section-tip">{{
                i18n("dyform.step.flowParamBindingRemark")
              }}</span>
          </div>

          <el-table
              v-loading="flowParamsLoading"
              :data="flowParamBindings"
              :size="compSize"
              border
              class="fnc-param-table"
          >
            <el-table-column
                :label="i18n('dyform.step.flowParamName')"
                prop="param"
                min-width="120"
            >
              <template #default="{ row }">
                <span>{{ row.param }}</span>
                <el-tag
                    v-if="row.required"
                    :size="compSize"
                    type="danger"
                    class="fnc-required-tag"
                >*
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
                :label="i18n('dyform.step.bindFieldLabel')"
                min-width="160"
            >
              <template #default="{ row }">
                <el-select
                    v-model="row.fieldName"
                    filterable
                    clearable
                    :placeholder="i18n('dyform.step.assigneeFieldPlaceholder')"
                    :size="compSize"
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
          </el-table>
        </template>

        <el-empty
            v-else
            :description="i18n('dyform.step.flowSelectDefineFirst')"
            :image-size="48"
        />
      </template>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.flow-node-config {
  border: 1px solid var(--el-border-color-light);
  border-radius: 6px;
  padding: 10px 12px;
  background: var(--el-bg-color);
}

.fnc-head {
  display: flex;
  align-items: center;
  gap: 8px;

  .fnc-title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .fnc-node {
    display: inline-flex;
    gap: 4px;
  }
}

.fnc-section {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin: 12px 0 8px;
  padding-bottom: 4px;
  border-bottom: 1px dashed var(--el-border-color-lighter);

  .fnc-section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-regular);
  }

  .fnc-section-tip {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

.fnc-mode-radio {
  margin-bottom: 4px;
}

.fnc-form {
  :deep(.el-select) {
    width: 100%;
  }
}

.fnc-param-table {
  margin-top: 4px;

  .fnc-required-tag {
    margin-left: 4px;
  }
}
</style>
