<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-qc-inspect">
      <div
        v-for="(item, idx) in items"
        :key="idx"
        class="mes-qc-row"
        :class="{'mes-qc-row--fail': itemResult(item) === false}"
      >
        <span class="mes-qc-name">
          {{ item.name }}
          <span v-if="item.unit" class="mes-qc-unit">({{ item.unit }})</span>
        </span>
        <span v-if="item.type !== 'text' && hasRange(item)" class="mes-qc-range">
          {{ item.min }} ~ {{ item.max }}
        </span>
        <span v-else-if="item.standard" class="mes-qc-range">{{ item.standard }}</span>

        <el-input-number
          v-if="item.type !== 'text'"
          v-model="item.actual"
          :precision="item.precision ?? 2"
          :controls="false"
          :disabled="checkIsDisabled(props)"
          placeholder="实测"
          class="mes-qc-input"
          @change="emitValue"
        />
        <el-select
          v-else
          v-model="item.manualResult"
          :disabled="checkIsDisabled(props)"
          placeholder="判定"
          class="mes-qc-select"
          @change="emitValue"
        >
          <el-option label="合格" value="pass" />
          <el-option label="不合格" value="fail" />
        </el-select>

        <el-tag :type="resultTagType(item)" size="small" class="mes-qc-result">
          {{ resultText(item) }}
        </el-tag>
      </div>

      <el-empty
        v-if="items.length === 0"
        :image-size="50"
        description="请在组件属性中配置检验项"
      />

      <div v-if="items.length > 0" class="mes-qc-conclusion">
        <span>检验结论：</span>
        <el-select
          v-if="allowOverride"
          v-model="conclusion"
          :disabled="checkIsDisabled(props)"
          class="mes-qc-conclusion__select"
          @change="emitValue"
        >
          <el-option label="合格" value="pass" />
          <el-option label="让步接收" value="concession" />
          <el-option label="不合格" value="fail" />
        </el-select>
        <el-tag v-else :type="conclusionTagType" size="default">
          {{ conclusionText }}
        </el-tag>
      </div>

      <el-select
        v-if="showDefectCode && conclusion !== 'pass'"
        v-model="defectCodes"
        multiple
        filterable
        allow-create
        default-first-option
        :disabled="checkIsDisabled(props)"
        placeholder="选择不良代码"
        class="mes-qc-defect"
        @change="emitValue"
      >
        <el-option v-for="op in defectOptions" :key="op.value" :label="op.name" :value="op.value" />
      </el-select>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, onMounted, reactive, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction, compDynamicData} from "star-horse-lowcode";

defineOptions({name: "MesQcInspectItem"});

interface InspectItem {
  name: string;
  type?: "number" | "text";
  unit?: string;
  standard?: string;
  min?: number;
  max?: number;
  precision?: number;
  actual?: number;
  manualResult?: "pass" | "fail";
}

const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["userAction", "selectItem"]);
const formData = defineModel("formData");

const preps = computed<any>(() => props.field?.preps || {});
const allowOverride = computed(
    () => preps.value.allowOverride === true || preps.value.allowOverride === "true",
);
const showDefectCode = computed(
    () => preps.value.showDefectCode !== false && preps.value.showDefectCode !== "false",
);

const parseItems = (raw: any): InspectItem[] => {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    if (!Array.isArray(parsed)) return [];
    return parsed
        .filter((it: any) => it && it.name)
        .map((it: any) => ({
          name: String(it.name),
          type: it.type === "text" ? "text" : "number",
          unit: it.unit || "",
          standard: it.standard != null ? String(it.standard) : "",
          min: it.min != null ? Number(it.min) : undefined,
          max: it.max != null ? Number(it.max) : undefined,
          precision: it.precision != null ? Number(it.precision) : 2,
          actual: undefined,
          manualResult: undefined,
        }));
  } catch {
    return [];
  }
};

const items = reactive<InspectItem[]>([]);
const conclusion = ref<"pass" | "concession" | "fail" | "auto">("auto");
const defectCodes = ref<string[]>([]);
const defectOptions = ref<any[]>([]);

const hasRange = (item: InspectItem): boolean =>
    item.min != null && item.max != null;

/** 单项判定：null=未检，true=合格，false=不合格 */
const itemResult = (item: InspectItem): boolean | null => {
  if (item.type === "text") {
    if (!item.manualResult) return null;
    return item.manualResult === "pass";
  }
  if (item.actual == null) return null;
  if (hasRange(item)) {
    return item.actual >= (item.min as number) && item.actual <= (item.max as number);
  }
  return true;
};

const autoConclusion = computed<"pass" | "fail" | null>(() => {
  if (items.length === 0) return null;
  const results = items.map(itemResult);
  if (results.some((r) => r === false)) return "fail";
  if (results.every((r) => r === true)) return "pass";
  return null;
});

const effectiveConclusion = computed<"pass" | "concession" | "fail" | null>(() => {
  if (conclusion.value !== "auto") return conclusion.value;
  return autoConclusion.value;
});

const conclusionText = computed(() => {
  const c = effectiveConclusion.value;
  if (c === "pass") return "合格";
  if (c === "concession") return "让步接收";
  if (c === "fail") return "不合格";
  return "待检验";
});

const conclusionTagType = computed(() => {
  const c = effectiveConclusion.value;
  if (c === "pass") return "success";
  if (c === "concession") return "warning";
  if (c === "fail") return "danger";
  return "info";
});

const resultTagType = (item: InspectItem) => {
  const r = itemResult(item);
  if (r === true) return "success";
  if (r === false) return "danger";
  return "info";
};

const resultText = (item: InspectItem) => {
  const r = itemResult(item);
  if (r === true) return "合格";
  if (r === false) return "不合格";
  return "待检";
};

const emitValue = () => {
  const fieldName = props.field?.fieldName;
  if (!fieldName || !formData.value) return;
  formData.value[fieldName] = {
    items: items.map((it) => ({
      name: it.name,
      actual: it.type === "text" ? undefined : it.actual ?? null,
      result: itemResult(it),
      manualResult: it.type === "text" ? it.manualResult ?? null : undefined,
    })),
    conclusion: effectiveConclusion.value || "",
    defectCodes: conclusion.value !== "pass" && effectiveConclusion.value !== "pass"
        ? defectCodes.value
        : [],
    inspectTime: new Date().toISOString(),
  };
  allAction(props, emits, formData, "change");
};

const loadExisting = () => {
  const fieldName = props.field?.fieldName;
  const existing = fieldName ? formData.value?.[fieldName] : null;
  if (existing && typeof existing === "object" && Array.isArray(existing.items)) {
    existing.items.forEach((saved: any, idx: number) => {
      if (items[idx] && items[idx].name === saved.name) {
        if (items[idx].type !== "text") {
          items[idx].actual = saved.actual != null ? Number(saved.actual) : undefined;
        } else {
          items[idx].manualResult = saved.manualResult === "pass" ? "pass" : saved.manualResult === "fail" ? "fail" : undefined;
        }
      }
    });
    conclusion.value = ["pass", "concession", "fail"].includes(existing.conclusion)
        ? existing.conclusion
        : "auto";
    defectCodes.value = Array.isArray(existing.defectCodes) ? existing.defectCodes : [];
  }
};

onMounted(async () => {
  if (!props.field.preps) props.field.preps = {};
  const parsed = parseItems(preps.value.inspectItems);
  items.push(...parsed);
  loadExisting();
  if (preps.value.apiDataSource) {
    const {data} = await compDynamicData(props.field);
    if (data?.length) defectOptions.value = data;
  }
});
</script>
<style lang="scss" scoped>
.mes-qc-inspect {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.mes-qc-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.mes-qc-row--fail {
  border-color: var(--el-color-danger-light-5);
  background: var(--el-color-danger-light-9);
}
.mes-qc-name {
  font-weight: 600;
  min-width: 80px;
}
.mes-qc-unit {
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.mes-qc-range {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  min-width: 90px;
}
.mes-qc-input {
  width: 120px;
}
.mes-qc-select {
  width: 110px;
}
.mes-qc-result {
  margin-left: auto;
  flex-shrink: 0;
}
.mes-qc-conclusion {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-weight: 600;
}
.mes-qc-conclusion__select {
  width: 140px;
}
.mes-qc-defect {
  width: 100%;
}
</style>
