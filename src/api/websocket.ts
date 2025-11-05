// WebSocket地址
import { warning } from "star-horse-lowcode";
import { getUserInfo } from "@/utils/auth";

let globalUrl: string = "";
// WebSocket实例
let ws: WebSocket;
// 重连定时器实例
let reconnectTimer: any = null;
// WebSocket重连开关
let isReconnecting = false;
// 监听器集合
const listeners = new Set<Function>();
// WebSocket对象
const websocket = {
  // WebSocket建立连接
  init(url: string, _username: string) {
    // 判断浏览器是否支持WebSocket
    if (!("WebSocket" in window)) {
      warning("您的浏览器不支持 WebSocket");
      return;
    }
    globalUrl = url;
    if ((ws && ws.OPEN) || !url) {
      // 已经连接，无需重复连接
      return;
    }
    // 创建WebSocket实例
    ws = new WebSocket(url);
    // 监听WebSocket连接
    ws.onopen = () => {
      console.log("WebSocket连接成功");
    };
    // 监听WebSocket连接错误信息
    ws.onerror = (e) => {
      console.log("WebSocket重连开关", isReconnecting);
      console.log("WebSocket数据传输发生错误", e);
      // 打开重连
      reconnect();
    };
    // 监听WebSocket接收消息
    ws.onmessage = (e) => {
      console.log("WebSocket接收后端消息:" + e.data);
      // 心跳消息不做处理
      if (e.data === "ok") {
        return;
      }
      // 调用主回调函数处理接收到的消息（兼容旧用法）
      if (websocket.onMessageCallback) {
        try {
          websocket.onMessageCallback(e.data);
        } catch (err) {
          console.warn("主回调处理消息异常", err);
        }
      }
      // 调用所有注册的监听器
      listeners.forEach((fn) => {
        try {
          fn(e.data);
        } catch (err) {
          console.warn("监听器处理消息异常", err);
        }
      });
    };
  },
  // WebSocket连接关闭方法
  close() {
    // 关闭断开重连机制
    isReconnecting = true;
    ws.close();
  },
  // WebSocket发送信息方法
  send(data: any) {
    // 处理发送数据JSON字符串
    const msg = JSON.stringify(data);
    // 发送消息给后端
    ws.send(msg);
  },

  // 暴露WebSocket实例，其他地方调用就调用这个
  getWebSocket() {
    return ws;
  },
  // 新增回调函数用于处理收到的消息（兼容旧用法，仅支持一个）
  onMessageCallback: null as unknown as Function | null,
  // 设置消息处理回调函数（旧用法）
  setMessageCallback(callback: Function) {
    this.onMessageCallback = callback;
  },
  // 新增：添加消息监听器（支持多个）
  addMessageListener(callback: Function) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  // 新增：移除消息监听器
  removeMessageListener(callback: Function) {
    listeners.delete(callback);
  },
};

// 监听窗口关闭事件，当窗口关闭时-每一个页面关闭都会触发-扩张需求业务
window.onbeforeunload = () => {
  // 在窗口关闭时关闭 WebSocket 连接
  websocket.close();
  console.log("WebSocket窗口关闭事件触发");
};

// 浏览器刷新重新连接
// 刷新页面后需要重连-并且是在登录之后
if (performance.getEntriesByType("navigation")[0]?.type === "reload") {
  console.log("WebSocket浏览器刷新了");

  // 延迟一定时间再执行 WebSocket 初始化，确保页面完全加载后再进行连接
  setTimeout(() => {
    console.log("WebSocket执行刷新后重连...");
    // 刷新后重连
    // 获取username（假设为测试username写死，现在是动态获取）
    const username = getUserInfo().idUsersinfo;
    websocket.init(globalUrl, username);
  }, 200); // 适当调整延迟时间
}

// 重连方法
function reconnect() {
  console.log("WebSocket重连开关", isReconnecting);
  // 判断是否主动关闭连接
  if (isReconnecting) {
    return;
  }
  // 重连定时器-每次WebSocket错误方法onerror触发它都会触发
  reconnectTimer && clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(() => {
    console.log("WebSocket执行断线重连...");
    // 获取username（假设为测试username写死，现在是动态获取）
    const username = getUserInfo().idUsersinfo;
    websocket.init(globalUrl, username);
    isReconnecting = false;
  }, 4000);
}

// 暴露对象
export default websocket;
