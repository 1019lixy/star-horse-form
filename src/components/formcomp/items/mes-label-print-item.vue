<template>
  <starhorse-form-item
    :showFormItem="showFormItem"
    :isDesign="isDesign"
    :disabled="disabled"
    :bareFlag="bareFlag"
    :field="field"
    :parentField="parentField"
  >
    <div class="mes-label-print">
      <div class="mes-lp-head">
        <span v-if="printMode === 'websocket'" class="mes-lp-status">
          <span :class="['mes-lp-dot', `mes-lp-dot--${wsStatus}`]"></span>
          打印客户端{{ wsStatusText }}
        </span>
        <span v-else class="mes-lp-status">浏览器打印</span>
        <span class="mes-lp-space"></span>
        <span v-if="copies > 1" class="mes-lp-copies">×{{ copies }} 份</span>
      </div>

      <div v-if="printMode === 'websocket'" class="mes-lp-preview">
        <div class="mes-lp-preview__title">
          {{ templateName || "未指定模板" }}
        </div>
        <div class="mes-lp-preview__body">
          <div v-for="(v, k) in printData" :key="k" class="mes-lp-preview__row">
            <span class="mes-lp-preview__label">{{ k }}：</span>
            <span class="mes-lp-preview__value">{{ v }}</span>
          </div>
          <span v-if="Object.keys(printData).length === 0" class="mes-lp-preview__empty">
            表单数据为空
          </span>
        </div>
      </div>

      <div class="mes-lp-actions">
        <el-button
          type="primary"
          :disabled="checkIsDisabled(props) || printing"
          :loading="printing"
          @click="handlePrint"
        >
          打印标签
        </el-button>
        <el-button
          v-if="printMode === 'websocket'"
          link
          size="small"
          :disabled="printing"
          @click="testConnect"
        >
          测试连接
        </el-button>
      </div>

      <div v-if="lastMessage" :class="['mes-lp-msg', lastSuccess ? 'mes-lp-msg--ok' : 'mes-lp-msg--fail']">
        {{ lastMessage }}
      </div>
    </div>
  </starhorse-form-item>
</template>
<script setup lang="ts">
import {computed, onBeforeUnmount, ref} from "vue";
import {ItemPreps, checkIsDisabled, allAction, warning} from "star-horse-lowcode";

defineOptions({name: "MesLabelPrintItem"});

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
const printMode = computed(() => preps.value.printMode || "websocket");
const wsUrl = computed(() => preps.value.wsUrl || "ws://127.0.0.1:16823");
const templateName = computed(() => preps.value.templateName || "");
const copies = computed(() => Number(preps.value.copies) || 1);
const printer = computed(() => preps.value.printer || "");

const parseMapping = (raw: any): Record<string, string> => {
  if (!raw) return {};
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const printData = computed<Record<string, any>>(() => {
  const mapping = parseMapping(preps.value.dataMapping);
  const source = formData.value || {};
  const keys = Object.keys(mapping);
  if (keys.length === 0) {
    const result: Record<string, any> = {};
    for (const key in source) {
      if (key === "index") continue;
      const val = source[key];
      if (val != null && typeof val !== "object") {
        result[key] = String(val);
      }
    }
    return result;
  }
  const result: Record<string, any> = {};
  keys.forEach((tplVar) => {
    const field = mapping[tplVar];
    const val = source[field];
    result[tplVar] = val != null ? String(val) : "";
  });
  return result;
});

type WsStatus = "disconnected" | "connecting" | "connected" | "error";
const wsStatus = ref<WsStatus>("disconnected");
const wsStatusText = computed(() => {
  const map: Record<WsStatus, string> = {
    disconnected: "未连接",
    connecting: "连接中",
    connected: "已连接",
    error: "连接失败",
  };
  return map[wsStatus.value];
});

const printing = ref<boolean>(false);
const lastMessage = ref("");
const lastSuccess = ref<boolean>(false);

let ws: WebSocket | null = null;
let pendingPrint: ((res: {success: boolean; message: string}) => void) | null = null;
let connectWaiter: (() => void) | null = null;
const CONNECT_TIMEOUT = 5000;
const PRINT_TIMEOUT = 15000;

const cleanupWs = () => {
  if (ws) {
    try {
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      ws.close();
    } catch {
      // ignore
    }
  }
  ws = null;
};

const connectWs = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      resolve();
      return;
    }
    cleanupWs();
    wsStatus.value = "connecting";
    connectWaiter = resolve;
    let settled = false;
    try {
      ws = new WebSocket(wsUrl.value);
    } catch (e: any) {
      wsStatus.value = "error";
      reject(new Error("打印客户端地址无效：" + (e?.message || e)));
      return;
    }
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        connectWaiter = null;
        wsStatus.value = "error";
        cleanupWs();
        reject(new Error(`连接打印客户端超时（${wsUrl.value}），请确认 C/S 客户端已启动`));
      }
    }, CONNECT_TIMEOUT);
    ws.onopen = () => {
      wsStatus.value = "connected";
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        const waiter = connectWaiter;
        connectWaiter = null;
        waiter?.();
      }
    };
    ws.onerror = () => {
      if (!settled) {
        settled = true;
        clearTimeout(timer);
        connectWaiter = null;
        wsStatus.value = "error";
        cleanupWs();
        reject(new Error(`无法连接打印客户端（${wsUrl.value}）`));
      }
    };
    ws.onclose = () => {
      if (wsStatus.value === "connected") {
        wsStatus.value = "disconnected";
      }
    };
    ws.onmessage = (ev: MessageEvent) => {
      let res: any = null;
      try {
        res = typeof ev.data === "string" ? JSON.parse(ev.data) : ev.data;
      } catch {
        res = {success: false, message: "打印客户端返回非 JSON 数据：" + String(ev.data)};
      }
      if (pendingPrint) {
        const p = pendingPrint;
        pendingPrint = null;
        p({
          success: res?.success !== false,
          message: String(res?.message ?? res?.msg ?? (res?.success !== false ? "打印指令已发送" : "打印失败")),
        });
      }
    };
  });
};

const notify = (success: boolean, message: string) => {
  lastSuccess.value = success;
  lastMessage.value = message;
};

const printByWs = async (): Promise<void> => {
  await connectWs();
  const payload = {
    action: "print",
    requestId: "r" + Date.now(),
    template: templateName.value,
    data: printData.value,
    copies: copies.value,
    printer: printer.value,
  };
  const result = await new Promise<{success: boolean; message: string}>((resolve, reject) => {
    pendingPrint = resolve;
    try {
      ws?.send(JSON.stringify(payload));
    } catch (e: any) {
      pendingPrint = null;
      reject(new Error("发送打印指令失败：" + (e?.message || e)));
      return;
    }
    setTimeout(() => {
      if (pendingPrint) {
        pendingPrint = null;
        reject(new Error("打印客户端响应超时"));
      }
    }, PRINT_TIMEOUT);
  });
  if (!result.success) {
    throw new Error(result.message);
  }
  notify(true, result.message);
};

const printByBrowser = () => {
  const rows = printData.value;
  const keys = Object.keys(rows);
  if (keys.length === 0) {
    throw new Error("表单数据为空，无可打印内容");
  }
  const html = `<html><head><style>
    body { font-family: 'Microsoft YaHei', sans-serif; padding: 12px; }
    .label { border: 1px solid #000; padding: 8px; width: 280px; }
    .label h3 { margin: 0 0 8px; font-size: 14px; border-bottom: 1px solid #000; padding-bottom: 4px; }
    .label .row { display: flex; font-size: 12px; padding: 2px 0; }
    .label .k { width: 80px; color: #333; }
    .label .v { font-weight: bold; }
  </style></head><body>
    <div class="label"><h3>${templateName.value || "标签"}</h3>
    ${keys.map((k) => `<div class="row"><span class="k">${k}</span><span class="v">${String(rows[k]).replace(/</g, "&lt;")}</span></div>`).join("")}
    </div>
  </body></html>`;
  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "none";
  document.body.appendChild(iframe);
  const doc = iframe.contentWindow?.document;
  if (!doc) {
    iframe.remove();
    throw new Error("无法创建打印窗口");
  }
  doc.open();
  doc.write(html);
  doc.close();
  iframe.contentWindow?.focus();
  iframe.contentWindow?.print();
  setTimeout(() => iframe.remove(), 60000);
  notify(true, "已调起浏览器打印");
};

const handlePrint = async () => {
  if (props.isDesign || printing.value) return;
  if (printMode.value === "websocket" && !templateName.value) {
    warning("请在组件属性中配置标签模板");
    return;
  }
  printing.value = true;
  try {
    if (printMode.value === "websocket") {
      await printByWs();
    } else {
      printByBrowser();
    }
    allAction(props, emits, formData, "change");
  } catch (e: any) {
    notify(false, String(e?.message || e || "打印失败"));
  } finally {
    printing.value = false;
  }
};

const testConnect = async () => {
  try {
    await connectWs();
    notify(true, "打印客户端连接成功");
  } catch (e: any) {
    notify(false, String(e?.message || e));
  }
};

onBeforeUnmount(() => {
  cleanupWs();
});
</script>
<style lang="scss" scoped>
.mes-label-print {
  width: 100%;
}
.mes-lp-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}
.mes-lp-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mes-lp-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  &--connected { background: var(--el-color-success); }
  &--connecting { background: var(--el-color-warning); }
  &--error { background: var(--el-color-danger); }
  &--disconnected { background: var(--el-text-color-placeholder); }
}
.mes-lp-space {
  flex: 1;
}
.mes-lp-copies {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
.mes-lp-preview {
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  margin-bottom: 8px;
}
.mes-lp-preview__title {
  font-weight: 600;
  font-size: 13px;
  padding: 6px 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
}
.mes-lp-preview__body {
  padding: 6px 10px;
  max-height: 120px;
  overflow-y: auto;
}
.mes-lp-preview__row {
  display: flex;
  gap: 4px;
  font-size: 12px;
  padding: 1px 0;
}
.mes-lp-preview__label {
  color: var(--el-text-color-secondary);
  flex-shrink: 0;
}
.mes-lp-preview__value {
  font-weight: 500;
  word-break: break-all;
}
.mes-lp-preview__empty {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.mes-lp-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.mes-lp-msg {
  margin-top: 6px;
  font-size: 13px;
}
.mes-lp-msg--ok {
  color: var(--el-color-success);
}
.mes-lp-msg--fail {
  color: var(--el-color-danger);
}
</style>