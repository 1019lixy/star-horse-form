<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-rework">
      <div class="mes-rw-row">
        <div class="mes-rw-field">
          <label class="mes-rw-label">返工数量</label>
          <el-input-number
            v-model="qty"
            :min="1"
            :max="maxQty"
            :precision="0"
            :controls="false"
            :disabled="checkIsDisabled(props)"
            placeholder="返工数量"
            class="mes-rw-input"
            @change="emitValue"
          />
        </div>
        <div class="mes-rw-field">
          <label class="mes-rw-label">不良原因</label>
          <el-select
            v-model="defectCode"
            filterable
            allow-create
            default-first-option
            :disabled="checkIsDisabled(props)"
            placeholder="选择不良原因"
            class="mes-rw-input"
            @change="onDefectChange"
          >
            <el-option v-for="op in defectOptions" :key="op.value" :label="op.name" :value="op.value" />
          </el-select>
        </div>
        <div class="mes-rw-field">
          <label class="mes-rw-label">返工去向工序</label>
          <el-input
            v-model="targetOperation"
            :disabled="checkIsDisabled(props)"
            placeholder="返工工序"
            class="mes-rw-input"
            @change="emitValue"
          />
        </div>
      </div>
      <el-input
        v-model="remark"
        type="textarea"
        :rows="2"
        :disabled="checkIsDisabled(props)"
        placeholder="返工说明（可选）"
        @change="emitValue"
      />
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, onMounted, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction, compDynamicData} from "star-horse-lowcode";

defineOptions({name: "MesReworkRecordItem"});

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
const maxQty = computed(() => Number(preps.value.maxQty) || 9999);

const parseTargetMap = (raw: any): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const defectTargetMap = computed<Record<string, string>>(() =>
    parseTargetMap(preps.value.defectTargetMap),
);

const qty = ref<number>();
const defectCode = ref("");
const targetOperation = ref("");
const remark = ref("");
const defectOptions = ref<any[]>([]);

const emitValue = () => {
  const fieldName = props.field?.fieldName;
  if (!fieldName || !formData.value) return;
  formData.value[fieldName] = {
    qty: qty.value ?? null,
    defectCode: defectCode.value || "",
    targetOperation: targetOperation.value || "",
    remark: remark.value || "",
  };
  allAction(props, emits, formData, "change");
};

const onDefectChange = () => {
  const mapped = defectTargetMap.value[defectCode.value];
  if (mapped) {
    targetOperation.value = mapped;
  }
  emitValue();
};

const loadExisting = () => {
  const fieldName = props.field?.fieldName;
  const existing = fieldName ? formData.value?.[fieldName] : null;
  if (existing && typeof existing === "object") {
    qty.value = existing.qty != null ? Number(existing.qty) : undefined;
    defectCode.value = existing.defectCode || "";
    targetOperation.value = existing.targetOperation || "";
    remark.value = existing.remark || "";
  }
};

onMounted(async () => {
  if (!props.field.preps) props.field.preps = {};
  loadExisting();
  if (preps.value.apiDataSource) {
    const {data} = await compDynamicData(props.field);
    if (data?.length) defectOptions.value = data;
  }
});
</script>
<style lang="scss" scoped>
.mes-rework {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.mes-rw-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.mes-rw-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 120px;
}
.mes-rw-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.mes-rw-input {
  width: 100%;
}
</style>
