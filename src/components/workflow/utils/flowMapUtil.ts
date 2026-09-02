import {dlog, dwarn, derror, dinfo} from "@/utils/debugLog";
/**
 * 流程缩略图工具。
 *
 * 从 nodeUtil 拆分而来：原 `updateMap` 依赖 html2canvas 生成流程设计器缩略图，
 * 属于偏 UI 能力。这里通过动态 import 加载 html2canvas，使其成为可选依赖——
 * 未安装 html2canvas 时静默降级，不影响核心流程逻辑。
 */
import { type Ref } from "vue";
import { getWorkflowConfig } from "@/components/workflow/config/workflowConfig";

/**
 * 更新流程缩略图。
 * @param mapImg 存储缩略图 dataURL 的 Ref
 */
export async function updateMap(mapImg: Ref<string>) {
  try {
    const html2canvasModule: any = await import("html2canvas");
    const html2canvas = html2canvasModule.default || html2canvasModule;
    setTimeout(() => {
      const content: any = document.querySelector("#sh-flow-editor-content");
      if (!content) {
        if (getWorkflowConfig().debug) {
          dwarn("[workflow] updateMap: #sh-flow-editor-content not found");
        }
        return;
      }
      html2canvas(content, {
        backgroundColor: "#aaa",
        scale: 1,
        width: content.clientWidth,
        height: content.scrollHeight,
        windowHeight: content.scrollHeight,
      }).then((canvas: HTMLCanvasElement) => {
        mapImg.value = canvas.toDataURL("image/jpeg", 0.8);
      });
    }, 300);
  } catch (e) {
    if (getWorkflowConfig().debug) {
      dwarn("[workflow] updateMap: html2canvas not installed, skip", e);
    }
  }
}