<script setup lang="ts">
/**
 * 流程节点配置面板。
 *
 * 重构说明：旧版仅支持"字段→流程变量"的单一参数绑定，无法满足一个节点取多个字段
 * 不同用途值的需求（如多人协作节点同时需要审批人来源、抄送人来源、条件字段等）。
 *
 * 新版采用多字段绑定模型：flowConfig.fieldBindings 为绑定项数组，每项描述
 * "取哪个字段、作什么用途、如何取值"。用途选项由外部传入（可插拔），
 * 面板只负责渲染与收集，不硬编码业务语义。
 *
 * 数据结构（flowConfig）：
 * - flowFlag: "Y"/"N" 是否启用
 * - fieldBindings: NodeFieldBinding[] 多字段绑定（替代旧 paramFields）
 * - assigneeType/assigneeField/assigneeValue/ccValue/visibleScope/rejectPolicy: 流转设置
 */
import { computed, watch } from "vue";
import { uuid } from "star-horse-lowcode";
import { i18n } from "@/lang";
import { StarHorseDataSelector } from "star-horse-lowcode";
import FlowFieldBindingTable from "@/components/system/items/form/components/FlowFieldBindingTable.vue";
import type {
  BindableField,
  FieldBindingUsageOption,
  NodeFieldBinding,
} from "@/components/workflow/types";

defineOptions({ name: "FlowNodeConfigPanel" });

const props = withDefaults(
  defineProps<{
    modelValue?: any;
    fields?: BindableField[];
    /** 字段绑定用途选项（外部可扩展，不传则使用内置默认） */
    usageOptions?: FieldBindingUsageOption[];
    nodeKey?: string;
    nodeName?: string;
    compSize?: string;
  }>(),
  {
    fields: () => [],
    usageOptions: () => [],
    nodeKey: "",
    nodeName: "",
    compSize: "default",
  },
);
const emit = defineEmits(["update:modelValue"]);

/** 默认配置工厂 */
const defaultCfg = () => ({
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
    if (c.flowFlag !== "Y" && c.flowFlag !== "N") c.flowFlag = "N";
    if (!Array.isArray(c.fieldBindings)) c.fieldBindings = [];
    if (!c.assigneeType) c.assigneeType = "starter_pick";
    if (typeof c.assigneeField !== "string") c.assigneeField = "";
    if (!Array.isArray(c.assigneeValue)) c.assigneeValue = [];
    if (!Array.isArray(c.ccValue)) c.ccValue = [];
    if (!c.visibleScope) c.visibleScope = "prev_and_self";
    if (!c.rejectPolicy) c.rejectPolicy = "to_prev";
  },
  { immediate: true },
);

/** 节点启用开关 */
const flowEnabled = computed({
  get: () => cfg.value?.flowFlag === "Y",
  set: (v: boolean) => {
    if (cfg.value) cfg.value.flowFlag = v ? "Y" : "N";
  },
});

/** 字段绑定列表（双向绑定到 cfg.fieldBindings） */
const fieldBindings = computed<NodeFieldBinding[]>({
  get: () => cfg.value?.fieldBindings || [],
  set: (val) => {
    if (cfg.value) cfg.value.fieldBindings = val;
  },
});

// ==================== 流转设置 ====================
const assigneeType = computed(() => cfg.value.assigneeType || "starter_pick");

const assigneeTypeOptions = [
  { name: i18n("dyform.step.assigneeStarterPick"), value: "starter_pick" },
  { name: i18n("dyform.step.assigneeUser"), value: "user" },
  { name: i18n("dyform.step.assigneeRole"), value: "role" },
  { name: i18n("dyform.step.assigneeDept"), value: "dept" },
  { name: i18n("dyform.step.assigneeFormField"), value: "form_field" },
];

const visibleScopeOptions = [
  { name: i18n("dyform.step.scopePrevSelf"), value: "prev_and_self" },
  { name: i18n("dyform.step.scopeAllFilled"), value: "all_filled" },
  { name: i18n("dyform.step.scopeSelfOnly"), value: "self_only" },
];

const rejectPolicyOptions = [
  { name: i18n("dyform.step.rejectNone"), value: "none" },
  { name: i18n("dyform.step.rejectToStarter"), value: "to_starter" },
  { name: i18n("dyform.step.rejectToPrev"), value: "to_prev" },
];

/** 经办人字段候选：usage=assignee 的绑定字段 + 全部字段（去重） */
const assigneeFieldOptions = computed(() => {
  const seen = new Set<string>();
  const out: BindableField[] = [];
  fieldBindings.value.forEach((b) => {
    if (b.usage === "assignee" && b.fieldName && !seen.has(b.fieldName)) {
      seen.add(b.fieldName);
      const f = props.fields.find((x) => x.fieldName === b.fieldName);
      out.push({ fieldName: b.fieldName, label: f?.label || b.fieldName });
    }
  });
  props.fields.forEach((f) => {
    if (!seen.has(f.fieldName)) {
      seen.add(f.fieldName);
      out.push(f);
    }
  });
  return out;
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
      <!-- ===== 字段绑定（多字段、多用途） ===== -->
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

      <!-- ===== 流转设置 ===== -->
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

.fnc-form {
  :deep(.el-select) {
    width: 100%;
  }
}
</style>
