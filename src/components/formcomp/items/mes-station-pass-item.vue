<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-station-pass">
      <div class="mes-sp-info">
        <el-tag effect="plain" size="small">工序：{{ currentOperation || "未设置" }}</el-tag>
        <span v-if="passCount > 0" class="mes-sp-count">已过站 {{ passCount }} 件</span>
      </div>

      <el-input
        ref="snInputRef"
        v-model="snValue"
        :placeholder="placeholder"
        :disabled="checkIsDisabled(props)"
        clearable
        :class="{'mes-sp--ok': flash === 'ok', 'mes-sp--fail': flash === 'fail'}"
        @keyup.enter="handlePass"
      >
        <template #append>
          <el-button
            type="primary"
            :loading="scanning"
            :disabled="checkIsDisabled(props) || !snValue.trim()"
            @click="handlePass"
          >
            过站
          </el-button>
        </template>
      </el-input>

      <div v-if="lastMessage" :class="['mes-sp-msg', lastSuccess ? 'mes-sp-msg--ok' : 'mes-sp-msg--fail']">
        {{ lastMessage }}
      </div>

      <div v-if="history.length > 0" class="mes-sp-history">
        <div class="mes-sp-history__head">
          <span>过站记录</span>
          <el-button link type="danger" size="small" @click="clearHistory">清空</el-button>
        </div>
        <div class="mes-sp-history__body">
          <div
            v-for="(item, idx) in history"
            :key="idx"
            class="mes-sp-history__row"
            :class="item.success ? 'is-ok' : 'is-fail'"
          >
            <span class="mes-sp-history__time">{{ item.time }}</span>
            <span class="mes-sp-history__sn">{{ item.value }}</span>
            <span class="mes-sp-history__msg">{{ item.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction} from "star-horse-lowcode";
import {useScanner, callMesApi} from "../utils/useScanner";

defineOptions({name: "MesStationPassItem"});

const props = withDefaults(defineProps<ItemPreps>(), {
  isDesign: false,
  disabled: false,
  showFormItem: false,
  bareFlag: false,
  isSearch: false,
});
const emits = defineEmits(["selfFunc", "selectItem"]);
const formData = defineModel("formData");

const preps = computed<any>(() => props.field?.preps || {});
const placeholder = computed(() => preps.value.placeholder || "扫序列号后回车过站");
const operationField = computed(() => preps.value.operationField || "");
const operationValue = computed(() => preps.value.operationValue || "");

const currentOperation = computed<string>(() => {
  if (operationField.value) {
    const v = formData.value?.[operationField.value];
    return v != null ? String(v) : "";
  }
  return operationValue.value;
});

const snValue = ref("");
const snInputRef = ref();
const flash = ref<"" | "ok" | "fail">("");
const lastMessage = ref("");
const lastSuccess = ref<boolean>(false);
const passCount = ref<number>(0);

const scanner = useScanner({
  allowRepeat: false,
  historySize: Number(preps.value.historySize) || 20,
  soundTip: preps.value.soundTip !== false && preps.value.soundTip !== "false",
});

const finishPass = (sn: string, success: boolean, message: string, nextOperation?: string) => {
  lastSuccess.value = success;
  lastMessage.value = nextOperation && success ? `${message}，下一工序：${nextOperation}` : message;
  flash.value = success ? "ok" : "fail";
  scanner.beep(success);
  scanner.addHistory(sn, success, message);
  if (success) {
    passCount.value += 1;
    formData.value[props.field?.fieldName] = {
      lastSn: sn,
      operation: currentOperation.value,
      nextOperation: nextOperation || "",
      count: passCount.value,
    };
    scanner.markScanned(sn);
    allAction(props, emits, formData, "change");
  }
  setTimeout(() => {
    flash.value = "";
  }, 600);
  snValue.value = "";
  nextTick(() => snInputRef.value?.focus?.());
};

const handlePass = async () => {
  if (props.isDesign || scanner.scanning.value) return;
  const sn = (snValue.value || "").trim();
  if (!sn) return;
  if (!currentOperation.value) {
    finishPass(sn, false, "未设置当前工序，请先配置工序字段或固定工序值");
    return;
  }
  if (scanner.isDuplicate(sn)) {
    finishPass(sn, false, "该序列号本次已过站，请勿重复过站");
    return;
  }
  const apiDataSource = preps.value.apiDataSource;
  if (!apiDataSource) {
    finishPass(sn, false, "未配置过站校验接口，请在数据源中配置");
    return;
  }
  scanner.scanning.value = true;
  try {
    const {data, error} = await callMesApi(apiDataSource, formData.value || {}, {
      sn,
      operation: currentOperation.value,
      action: "stationPass",
    });
    if (error) {
      finishPass(sn, false, String(error));
      return;
    }
    const ok = data?.success !== false && data?.pass !== false;
    const nextOp = data?.nextOperation ? String(data.nextOperation) : undefined;
    const msg = String(data?.message ?? data?.msg ?? (ok ? "过站成功" : "过站被拒绝"));
    finishPass(sn, ok, msg, ok ? nextOp : undefined);
  } catch (e: any) {
    finishPass(sn, false, String(e?.message || e || "过站接口异常"));
  } finally {
    scanner.scanning.value = false;
  }
};

const clearHistory = () => {
  scanner.reset();
  lastMessage.value = "";
};

onMounted(() => {
  if (!props.field.preps) props.field.preps = {};
  nextTick(() => snInputRef.value?.focus?.());
});
</script>
<style lang="scss" scoped>
.mes-station-pass {
  width: 100%;
}
.mes-sp-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.mes-sp-count {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.mes-sp--ok :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-success) inset;
}
.mes-sp--fail :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  animation: mes-sp-shake 0.3s;
}
@keyframes mes-sp-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.mes-sp-msg {
  margin-top: 4px;
  font-size: 13px;
}
.mes-sp-msg--ok {
  color: var(--el-color-success);
}
.mes-sp-msg--fail {
  color: var(--el-color-danger);
}
.mes-sp-history {
  margin-top: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.mes-sp-history__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mes-sp-history__body {
  max-height: 200px;
  overflow-y: auto;
}
.mes-sp-history__row {
  display: flex;
  gap: 8px;
  padding: 3px 8px;
  font-size: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}
.mes-sp-history__row.is-ok .mes-sp-history__sn {
  color: var(--el-color-success);
}
.mes-sp-history__row.is-fail .mes-sp-history__sn {
  color: var(--el-color-danger);
  text-decoration: line-through;
}
.mes-sp-history__time {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}
.mes-sp-history__sn {
  font-weight: 600;
  word-break: break-all;
}
.mes-sp-history__msg {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  text-align: right;
}
</style>
