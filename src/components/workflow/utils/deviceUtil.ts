/**
 * 设备/屏幕工具。
 *
 * 从 shdevopsui 移植，用于流程设计器在不同设备（PC/移动端）下的样式适配。
 * 仅做纯计算，不依赖任何框架，可安全在 SSR 环境降级。
 */
const getClientSize = () => {
  if (typeof document === "undefined") {
    return { w: 1280, h: 720 };
  }
  return {
    w: document.documentElement.clientWidth,
    h: document.documentElement.clientHeight,
  };
};

const scale = {
  /** 屏幕缩放比例（基于 1280 设计稿） */
  sizeScale: () => {
    const { w } = getClientSize();
    const fixedWh = { w: 1280, h: 609, r: 1280 / 609 };
    return w / fixedWh.w;
  },
  /** 是否移动端 */
  isMobile: () => {
    if (typeof navigator === "undefined") return null;
    return navigator.userAgent.match(
      /(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i,
    );
  },
  /** 是否竖屏 */
  isOrientation: () => {
    const { w, h } = getClientSize();
    return w < h;
  },
  /** 缩放信息：r 为缩放比，c 为是否移动端 */
  isScale: () => {
    const ismobile = scale.isMobile();
    const rscale = scale.sizeScale();
    if (ismobile === null) {
      return { r: 1, c: false };
    }
    return { r: rscale, c: true };
  },
};

export { scale };