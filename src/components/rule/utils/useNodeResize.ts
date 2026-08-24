import {computed} from "vue";

/**
 * 节点拖拽改变大小 composable
 * 宽高存储在 data.__width / data.__height，随节点数据持久化
 * 画布的 ResizeObserver 会自动感知尺寸变化并更新边端点
 */
export function useNodeResize(
  data: any,
  opts?: {
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
  },
) {
  const minWidth = opts?.minWidth ?? 200;
  const maxWidth = opts?.maxWidth ?? 600;
  const minHeight = opts?.minHeight ?? 80;
  const maxHeight = opts?.maxHeight ?? 600;

  const cardStyle = computed(() => {
    const s: Record<string, string> = {};
    if (data?.__width) s.width = `${data.__width}px`;
    return s;
  });

  const bodyStyle = computed(() => {
    const s: Record<string, string> = {};
    if (data?.__height) {
      s.minHeight = `${data.__height}px`;
      s.overflowY = "auto";
    }
    return s;
  });

  const onResizeStart = (e: MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    const card = (e.currentTarget as HTMLElement).closest(
      ".node-card",
    ) as HTMLElement;
    if (!card || !data) return;
    const startX = e.clientX;
    const startY = e.clientY;
    const startW = data.__width || card.offsetWidth;
    const startH = data.__height || card.offsetHeight;
    const onMove = (ev: MouseEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      data.__width = Math.max(minWidth, Math.min(maxWidth, startW + dx));
      data.__height = Math.max(minHeight, Math.min(maxHeight, startH + dy));
    };
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
    };
    document.body.style.cursor = "se-resize";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return { cardStyle, bodyStyle, onResizeStart };
}
