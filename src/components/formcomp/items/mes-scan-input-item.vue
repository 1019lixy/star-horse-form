<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-scan-input">
      <el-input
        ref="scanInputRef"
        v-model="scanValue"
        :placeholder="placeholder"
        :disabled="checkIsDisabled(props)"
        clearable
        :class="{'mes-scan--ok': flash === 'ok', 'mes-scan--fail': flash === 'fail'}"
        @keyup.enter="handleScan"
      >
        <template #prefix>
          <star-horse-icon icon-class="search" size="14px" />
        </template>
      </el-input>

      <div v-if="lastMessage" :class="['mes-scan-msg', lastSuccess ? 'mes-scan-msg--ok' : 'mes-scan-msg--fail']">
        {{ lastMessage }}
      </div>

      <div v-if="history.length > 0" class="mes-scan-history">
        <div class="mes-scan-history__head">
          <span>扫码记录</span>
          <el-button link type="danger" size="small" @click="clearHistory">清空</el-button>
        </div>
        <div class="mes-scan-history__body">
          <div
            v-for="(item, idx) in history"
            :key="idx"
            class="mes-scan-history__row"
            :class="item.success ? 'is-ok' : 'is-fail'"
          >
            <span class="mes-scan-history__time">{{ item.time }}</span>
            <span class="mes-scan-history__value">{{ item.value }}</span>
            <span class="mes-scan-history__msg">{{ item.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, nextTick, onMounted, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction, StarHorseIcon} from "star-horse-lowcode";
import {useScanner, callMesApi} from "../utils/useScanner";

defineOptions({name: "MesScanInputItem"});

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
const placeholder = computed(() => preps.value.placeholder || "扫码或输入后回车");
const messageField = computed(() => preps.value.messageField || "");

const scanValue = ref("");
const scanInputRef = ref();
const flash = ref<"" | "ok" | "fail">("");
const lastMessage = ref("");
const lastSuccess = ref<boolean>(false);

const scanner = useScanner({
  allowRepeat: preps.value.allowRepeat === true || preps.value.allowRepeat === "true",
  historySize: Number(preps.value.historySize) || 20,
  soundTip: preps.value.soundTip !== false && preps.value.soundTip !== "false",
});
const history = scanner.history;

const writeField = (key: string, value: any) => {
  if (key && formData.value) {
    formData.value[key] = value;
  }
};

const finishScan = (value: string, success: boolean, message: string) => {
  lastSuccess.value = success;
  lastMessage.value = message;
  flash.value = success ? "ok" : "fail";
  scanner.beep(success);
  scanner.addHistory(value, success, message);
  if (success) {
    writeField(props.field?.fieldName, value);
    if (messageField.value) {
      writeField(messageField.value, message);
    }
    scanner.markScanned(value);
    allAction(props, emits, formData, "change");
  } else if (messageField.value) {
    writeField(messageField.value, message);
  }
  setTimeout(() => {
    flash.value = "";
  }, 600);
  scanValue.value = "";
  nextTick(() => scanInputRef.value?.focus?.());
};

const handleScan = async () => {
  if (props.isDesign || scanner.scanning.value) return;
  const value = (scanValue.value || "").trim();
  if (!value) return;
  if (scanner.isDuplicate(value)) {
    finishScan(value, false, "该码已扫描，请勿重复扫码");
    return;
  }
  const apiDataSource = preps.value.apiDataSource;
  if (!apiDataSource) {
    finishScan(value, true, "扫码成功");
    return;
  }
  scanner.scanning.value = true;
  try {
    const {data, error} = await callMesApi(apiDataSource, formData.value || {}, {
      scanValue: value,
      fieldName: props.field?.fieldName || "",
    });
    if (error) {
      finishScan(value, false, String(error));
      return;
    }
    const remoteOk = data?.success !== false && data?.pass !== false;
    const remoteMsg = String(data?.message ?? data?.msg ?? (remoteOk ? "校验通过" : "校验失败"));
    finishScan(value, remoteOk, remoteMsg);
  } catch (e: any) {
    finishScan(value, false, String(e?.message || e || "校验接口异常"));
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
  if (preps.value.autoFocus !== false && preps.value.autoFocus !== "false") {
    nextTick(() => scanInputRef.value?.focus?.());
  }
});
</script>
<style lang="scss" scoped>
.mes-scan-input {
  width: 100%;
}
.mes-scan--ok :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-success) inset;
}
.mes-scan--fail :deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px var(--el-color-danger) inset;
  animation: mes-scan-shake 0.3s;
}
@keyframes mes-scan-shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  75% { transform: translateX(4px); }
}
.mes-scan-msg {
  margin-top: 4px;
  font-size: 13px;
}
.mes-scan-msg--ok {
  color: var(--el-color-success);
}
.mes-scan-msg--fail {
  color: var(--el-color-danger);
}
.mes-scan-history {
  margin-top: 8px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}
.mes-scan-history__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  background: var(--el-fill-color-light);
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mes-scan-history__body {
  max-height: 180px;
  overflow-y: auto;
}
.mes-scan-history__row {
  display: flex;
  gap: 8px;
  padding: 3px 8px;
  font-size: 12px;
  border-top: 1px solid var(--el-border-color-extra-light);
}
.mes-scan-history__row.is-ok .mes-scan-history__value {
  color: var(--el-color-success);
}
.mes-scan-history__row.is-fail .mes-scan-history__value {
  color: var(--el-color-danger);
  text-decoration: line-through;
}
.mes-scan-history__time {
  flex-shrink: 0;
  color: var(--el-text-color-placeholder);
}
.mes-scan-history__value {
  font-weight: 600;
  word-break: break-all;
}
.mes-scan-history__msg {
  margin-left: auto;
  color: var(--el-text-color-secondary);
  text-align: right;
}
</style>
