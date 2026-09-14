import {ref} from "vue";

/**
 * MES 扫码公共逻辑：扫码枪（键盘模拟输入+回车）场景的
 * 声音提示、防重复、扫码历史。供 scan-input / station-pass / packing 复用。
 */

export interface ScanHistoryItem {
  value: string;
  success: boolean;
  message: string;
  time: string;
}

export interface UseScannerOptions {
  /** 是否允许重复扫码，默认 false */
  allowRepeat?: boolean;
  /** 历史记录最大条数，默认 20 */
  historySize?: number;
  /** 是否声音提示，默认 true */
  soundTip?: boolean;
}

const playBeep = (ok: boolean) => {
  try {
    const AudioCtx =
        (window as any).AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx: AudioContext = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    if (ok) {
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else {
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(180, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
    osc.onended = () => ctx.close();
  } catch {
    // 音频不可用时静默
  }
};

export function useScanner(options: UseScannerOptions = {}) {
  const allowRepeat = options.allowRepeat ?? false;
  const historySize = options.historySize ?? 20;
  const soundTip = options.soundTip ?? true;

  const scanning = ref<boolean>(false);
  const history = ref<ScanHistoryItem[]>([]);
  const scannedKeys = ref<Set<string>>(new Set());

  const beep = (ok: boolean) => {
    if (soundTip) playBeep(ok);
  };

  /** 防重复检查：重复返回 true */
  const isDuplicate = (value: string): boolean => {
    return !allowRepeat && scannedKeys.value.has(value);
  };

  const markScanned = (value: string) => {
    scannedKeys.value.add(value);
  };

  const unmarkScanned = (value: string) => {
    scannedKeys.value.delete(value);
  };

  const addHistory = (value: string, success: boolean, message: string) => {
    history.value.unshift({
      value,
      success,
      message,
      time: new Date().toLocaleTimeString(),
    });
    if (history.value.length > historySize) {
      history.value.length = historySize;
    }
  };

  const reset = () => {
    history.value = [];
    scannedKeys.value = new Set();
  };

  return {
    scanning,
    history,
    beep,
    isDuplicate,
    markScanned,
    unmarkScanned,
    addHistory,
    reset,
  };
}

/**
 * 通过 apiDataSource 调后端校验/业务接口（复用 DataSourceConfigPanel 配置体系）。
 * 请求体：{ ...apiDataSource, formData: 表单数据, queryCondition: { fieldList: 业务参数 } }
 * 返回 { data, error }，error 非空即失败。
 */
export async function callMesApi(
    apiDataSource: any,
    formData: Record<string, any>,
    bizParams: Record<string, any>,
): Promise<{ data: any; error: string }> {
  if (!apiDataSource) {
    return {data: null, error: ""};
  }
  const {loadData} = await import("star-horse-lowcode");
  const fieldList = Object.keys(bizParams).map((key) => ({
    propertyName: key,
    value: bizParams[key],
    operation: "eq",
  }));
  return loadData(
      apiDataSource.proxyUrl ?? "/system-config/redirect/apiLinkage",
      {
        ...apiDataSource,
        formData: formData || {},
        queryCondition: {fieldList},
      },
  );
}