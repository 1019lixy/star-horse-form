<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-report-qty">
      <div class="mes-rq-row">
        <div class="mes-rq-field mes-rq-qualified">
          <label class="mes-rq-label">合格数</label>
          <el-input-number
            v-model="qtyData.qualified"
            :precision="precision"
            :min="0"
            :max="maxQty"
            :disabled="checkIsDisabled(props)"
            :controls="false"
            size="default"
            class="mes-rq-input"
            @change="onQtyChange"
          />
        </div>
        <div v-if="showDefect" class="mes-rq-field">
          <label class="mes-rq-label">不良数</label>
          <el-input-number
            v-model="qtyData.defect"
            :precision="precision"
            :min="0"
            :max="maxQty"
            :disabled="checkIsDisabled(props)"
            :controls="false"
            size="default"
            class="mes-rq-input"

            @change="onQtyChange"
          />
        </div>
        <div v-if="showScrap" class="mes-rq-field">
          <label class="mes-rq-label">废品数</label>
          <el-input-number
            v-model="qtyData.scrap"
            :precision="precision"
            :min="0"
            :max="maxQty"
            :disabled="checkIsDisabled(props)"
            :controls="false"
            size="default"
            class="mes-rq-input"
            @change="onQtyChange"
          />
        </div>
        <div v-if="showRework" class="mes-rq-field">
          <label class="mes-rq-label">返工数</label>
          <el-input-number
            v-model="qtyData.rework"
            :precision="precision"
            :min="0"
            :max="maxQty"
            :disabled="checkIsDisabled(props)"
            :controls="false"
            size="default"
            class="mes-rq-input"
            @change="onQtyChange"
          />
        </div>
      </div>
      <div class="mes-rq-summary">
        <span class="mes-rq-total">
          总数：<strong>{{ totalQty }}</strong>
        </span>
        <span class="mes-rq-yield" :class="yieldClass">
          合格率：<strong>{{ yieldRate }}%</strong>
        </span>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, onMounted, reactive, watch} from "vue";
import {ItemPreps, checkIsDisabled, allAction} from "star-horse-lowcode";

const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");

const preps = computed(() => props.field?.preps || {});
const precision = computed(() => Number(preps.value.precision) || 0);
const maxQty = computed(() => Number(preps.value.maxQty) || 999999);
const showDefect = computed(() => preps.value.showDefect !== false && preps.value.showDefect !== "false");
const showScrap = computed(() => preps.value.showScrap !== false && preps.value.showScrap !== "false");
const showRework = computed(() => preps.value.showRework === true || preps.value.showRework === "true");

const qtyData = reactive({
  qualified: 0,
  defect: 0,
  scrap: 0,
  rework: 0,
});

const totalQty = computed(() => {
  const p = precision.value;
  const sum = qtyData.qualified + qtyData.defect + qtyData.scrap + qtyData.rework;
  return Number(sum.toFixed(p));
});

const yieldRate = computed(() => {
  const total = totalQty.value;
  if (total === 0) return "0.00";
  const rate = (qtyData.qualified / total) * 100;
  return rate.toFixed(2);
});

const yieldClass = computed(() => {
  const rate = parseFloat(yieldRate.value);
  if (rate >= 95) return "mes-rq-yield--good";
  if (rate >= 80) return "mes-rq-yield--warn";
  return "mes-rq-yield--bad";
});

const itemAction = (prep: any) => {
  allAction(props, emits, formData, prep);
};

const onQtyChange = () => {
  const fieldName = props.field?.fieldName;
  if (!fieldName) return;
  formData.value[fieldName] = {
    qualified: qtyData.qualified,
    defect: qtyData.defect,
    scrap: qtyData.scrap,
    rework: qtyData.rework,
    total: totalQty.value,
    yieldRate: parseFloat(yieldRate.value),
  };
  itemAction("change");
};

const loadExisting = () => {
  const fieldName = props.field?.fieldName;
  if (!fieldName) return;
  const existing = formData.value?.[fieldName];
  if (existing && typeof existing === "object") {
    qtyData.qualified = Number(existing.qualified) || 0;
    qtyData.defect = Number(existing.defect) || 0;
    qtyData.scrap = Number(existing.scrap) || 0;
    qtyData.rework = Number(existing.rework) || 0;
  }
};

onMounted(() => {
  if (!props.field.preps) props.field.preps = {};
  loadExisting();
});
</script>
<style lang="scss" scoped>
.mes-report-qty {
  width: 100%;
}
.mes-rq-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}
.mes-rq-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 100px;
}
.mes-rq-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.mes-rq-input {
  width: 100%;
}
.mes-rq-summary {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  padding: 6px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 14px;
}
.mes-rq-total {
  color: var(--el-text-color-primary);
}
.mes-rq-yield--good {
  color: var(--el-color-success);
}
.mes-rq-yield--warn {
  color: var(--el-color-warning);
}
.mes-rq-yield--bad {
  color: var(--el-color-danger);
}
</style>