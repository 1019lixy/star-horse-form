import { loadData, SelectOption } from "star-horse-lowcode";
import {i18n} from "@/lang";
import {
  AppContext,
  createVNode,
  isVNode,
  nextTick,
  ref,
  render,
  VNode,
} from "vue";
import { getVueContext } from "@/api/vueContext";

const validUrl: string = "/userdb-manage/redirect/valid";

/**
 * 获取打印机列表
 */
export async function printerList(): Promise<Array<SelectOption>> {
  const getData = {
    type: "getPrinter",
  };
  const options: Array<SelectOption> = [];
  //创建一个实例
  const ws = new WebSocket("ws://127.0.0.1:55333");
  //用于指定连接成功后的回调函数
  ws.onopen = (_evt) => {
    console.log("Connection open ...");
    ws.send(JSON.stringify(getData));
  };
  //用于指定连接关闭后的回调函数
  ws.onclose = (_event) => {
    // let _code: number = event.code;
    // let _reason: string = event.reason;
    // let _wasClean: boolean = event.wasClean;
  };
  //
  return await new Promise((resolve, reject) => {
    //用于指定收到服务器数据后的回调函数
    ws.onmessage = (event) => {
      const data = event.data;
      const printers = JSON.parse(data)["data"];
      if (printers) {
        printers.forEach((item: any) => {
          options.push({ name: item, value: item });
        });
        resolve(options);
      } else {
        reject(i18n("dyform.api.printerFailed"));
      }
    };
  });
}

/**
 * 验证接口，并取回数据
 * @param url
 * @param params 参数
 * @param dataType 数据类型 FORM,JSON 默认JSON
 * @param httpMethod 接口请求方式 POST,GET,PUT,DELETE
 */
export async function validDataUrl(
  url: string,
  params?: any,
  dataType: string = "JSON",
  httpMethod: string = "POST",
) {
  const checkParams: any = {
    url,
    httpMethod: httpMethod.toUpperCase(),
    dataType,
    params: params,
  };
  const data = await loadData(validUrl, checkParams);
  return { ...data };
}

/**
 * 支持函数、数组、对象的深拷贝函数
 * @param {any} obj - 需要拷贝的对象
 * @returns {any} 拷贝后的新对象
 */
export function deepClone(obj: any) {
  // 处理 null/undefined
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理数组
  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item));
  }

  // 处理普通对象（包括保留函数）
  if (obj instanceof Object) {
    const clonedObj = {};
    // 遍历所有属性（包括可枚举/不可枚举）
    Object.getOwnPropertyNames(obj).forEach((key) => {
      const value = obj[key];
      // 如果是函数，直接赋值（函数是引用类型，无需深拷贝）
      if (typeof value === "function") {
        clonedObj[key] = value;
      } else {
        clonedObj[key] = deepClone(value);
      }
    });
    return clonedObj;
  }

  // 其他类型（如原始类型）直接返回
  return obj;
}

// 定义 TS 接口（增强类型提示，可选但推荐）
export interface DynamicContainerOptions {
  type: any; // Dialog 组件
  title?: string;
  content: DynamicContainerOptions | VNode;
  props?: Record<string, any>;
  events?: Record<string, any>;
  appContext?: AppContext;
}

/**
 * 动态创建 Dialog/Drawer 组件
 * @param {Object} options - 配置项
 * @param {string} options.type - 类型：'dialog' 或 'drawer'
 * @param {string} options.title - 标题
 * @param {string} options.content - 内容（支持简单文本或HTML）
 * @param {Object} options.props - 组件额外属性（如 width、direction 等）
 */
export const createDynamicComp = (options: DynamicContainerOptions) => {
  const { type, title, content, props, events } = options;
  // 1. 创建容器 DOM 节点（挂载点）
  const container = document.createElement("div");
  document.body.appendChild(container);
  // 2. 定义关闭/销毁逻辑
  const close = () => {
    // 清空并移除 DOM 节点，释放内存
    render(null, container);
    document.body.removeChild(container);
  };
  let dataContent: any = content;
  // 定义 Form 组件的 ref（核心：用于获取实例）
  const formInstance = ref<any>(null);

  if (!isVNode(content)) {
    dataContent = createVNode(
      content.type,
      {
        ...content.props,
      },
      {
        default: () => [],
      },
    );
  } else {
    // 如果 content 已是 VNode，覆盖其 ref 回调
    dataContent.props = {
      ...dataContent.props,
    };
  }
  // 3. 构建组件 VNode（虚拟节点）
  const vNode = createVNode(
    type,
    {
      // 合并传入的 props + 基础属性
      ...props,
      title,
      ...events,
    },
    // 组件内容（默认插槽）
    {
      default: () => [dataContent],
    },
  );
  vNode.appContext = getVueContext("formContext");
  dataContent.appContext = vNode.appContext;
  console.log(vNode, dataContent);
  // 4. 渲染 VNode 到 DOM 中
  render(vNode, container);

  setTimeout(() => {
    console.log("valid:", formInstance);
  }, 2000);
  nextTick(() => {
    // debugger;
    formInstance.value = dataContent.component?.exposed;
    console.log(formInstance, dataContent.component);
    // if (refName) {
    //     refName.value = formInstance.value;
    // }
  });
  // 返回销毁方法，供外部手动控制
  return { close, formInstance };
};
