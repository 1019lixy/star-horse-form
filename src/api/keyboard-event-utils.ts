import { ref } from "vue";
import { ShortKey, getDesignFormStore } from "star-horse-lowcode";
import { ModuleEnums } from "@/components/enums/ModuleEnums";
import {
  altDownFun,
  altLeftFun,
  altRightFun,
  altUpFun,
  backspaceFun,
  copyFun,
  ctrlDownFun,
  ctrlLeftFun,
  ctrlRightFun,
  ctrlUpFun,
  cutFun,
  deleteAllFun,
  deleteFun,
  downFun,
  enterFun,
  escapeFun,
  exchangeFun,
  findFun,
  groupFun,
  leftFun,
  newFun,
  openFun,
  pasteFun,
  previewFun,
  printFun,
  redoFun,
  returnFun,
  rightFun,
  saveFun,
  selectAllFun,
  tabFun,
  undoFun,
  unGroupFun,
  upFun,
} from "@/api/short-key-operation";

const ctrlKey = ref<boolean>(false);
const altKey = ref<boolean>(false);
const shiftKey = ref<boolean>(false);

/**
 * 判断事件目标是否为可输入元素
 * 当用户在输入框、文本域、下拉框等元素中操作时，不应拦截快捷键
 */
const isEditableTarget = (evt: KeyboardEvent): boolean => {
  const target = evt.target as HTMLElement;
  if (!target) return false;
  const tagName = target.tagName;
  // input / textarea / select 元素
  if (tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT") {
    return true;
  }
  // contenteditable 元素
  if (target.isContentEditable) {
    return true;
  }
  // el-input 等组件的内部 input
  if (target.closest(".el-input") || target.closest(".el-textarea") || target.closest(".el-select")) {
    return true;
  }
  return false;
};
/**
 * 重置ctrlKey
 */
export const resetCtrlKey = (evt: KeyboardEvent) => {
  if (evt.key == "Control") {
    ctrlKey.value = false;
  }
  if (evt.key == "Alt") {
    altKey.value = false;
  }
  if (evt.key == "Shift") {
    shiftKey.value = false;
  }
};
const shortKeyList = (model: ModuleEnums) => {
  const keyboardEventMap: ShortKey[] = [
    {
      key: "Enter",
      action: "enter",
      handler: () => enterFun(model),
    },
    {
      key: "Escape",
      action: "escape",
      handler: () => escapeFun(model),
    },
    {
      key: "Tab",
      action: "tab",
      handler: () => tabFun(model),
    },
    {
      key: "Backspace",
      action: "backspace",
      handler: () => backspaceFun(model),
    },
    {
      key: "Delete",
      action: "delete",
      handler: () => deleteFun(model),
    },
    {
      key: "b",
      action: "leftPanel",
      ctrl: true,
    },
    {
      key: "j",
      action: "rightPanel",
      ctrl: true,
    },
    {
      key: "z",
      action: "undo",
      ctrl: true,
      handler: () => undoFun(model),
    },
    {
      key: "z",
      action: "redo",
      ctrl: true,
      shift: true,
      handler: () => redoFun(model),
    },
    {
      key: "y",
      action: "redo",
      ctrl: true,
      handler: () => redoFun(model),
    },
    {
      key: "c",
      action: "copy",
      ctrl: true,
      handler: () => copyFun(model),
    },
    {
      key: "x",
      action: "cut",
      ctrl: true,
      handler: () => cutFun(model),
    },
    {
      key: "v",
      action: "paste",
      ctrl: true,
      handler: () => pasteFun(model),
    },
    {
      key: "v",
      action: "valid",
      ctrl: true,
      shift: true,
    },
    {
      key: "n",
      action: "new",
      ctrl: true,
      handler: () => newFun(model),
    },
    {
      key: "s",
      action: "save",
      ctrl: true,
      handler: () => saveFun(model),
    },
    {
      key: "o",
      action: "open",
      ctrl: true,
      handler: () => openFun(model),
    },
    {
      key: "d",
      action: "deleteAll",
      ctrl: true,
      shift: true,
      handler: () => deleteAllFun(model),
    },
    {
      key: "a",
      action: "selectAll",
      ctrl: true,
      handler: () => selectAllFun(model),
    },
    {
      key: "f",
      action: "find",
      ctrl: true,
      handler: () => findFun(model),
    },
    {
      key: "m",
      action: "exchange",
      ctrl: true,
      handler: () => exchangeFun(model),
    },
    {
      key: "g",
      action: "group",
      ctrl: true,
      handler: () => groupFun(model),
    },
    {
      key: "g",
      action: "unGroup",
      ctrl: true,
      shift: true,
      handler: () => unGroupFun(model),
    },
    {
      key: "p",
      action: "preview",
      ctrl: true,
      handler: () => previewFun(model),
    },
    {
      key: "p",
      action: "print",
      ctrl: true,
      shift: true,
      handler: () => printFun(model),
    },
    {
      key: "ArrowLeft",
      action: "goBack",
      alt: true,
      handler: () => returnFun(model),
    },
    {
      key: "ArrowUp",
      action: "altUp",
      alt: true,
      handler: () => altUpFun(model),
    },
    {
      key: "ArrowDown",
      action: "altDown",
      alt: true,
      handler: () => altDownFun(model),
    },
    {
      key: "ArrowLeft",
      action: "altLeft",
      alt: true,
      handler: () => altLeftFun(model),
    },
    {
      key: "ArrowRight",
      action: "altRight",
      alt: true,
      handler: () => altRightFun(model),
    },
    {
      key: "ArrowUp",
      action: "ctrlUp",
      ctrl: true,
      handler: () => ctrlUpFun(model),
    },
    {
      key: "ArrowDown",
      action: "ctrlDown",
      ctrl: true,
      handler: () => ctrlDownFun(model),
    },
    {
      key: "ArrowLeft",
      action: "ctrlLeft",
      ctrl: true,
      handler: () => ctrlLeftFun(model),
    },
    {
      key: "ArrowRight",
      action: "ctrlRight",
      ctrl: true,
      handler: () => ctrlRightFun(model),
    },
  ];
  return keyboardEventMap;
};

/**
 * 键盘事件
 * @param evt
 * @param actions 回调函数
 * @param params 参数
 */
export const keyboardEvent = (
  evt: KeyboardEvent,
  actions: Function,
  module: ModuleEnums,
  ...params: any
) => {
  //ctrlKey
  if (evt.key == "Control") {
    ctrlKey.value = true;
  }
  //altKey
  if (evt.key == "Alt") {
    altKey.value = true;
  }
  //shiftKey
  if (evt.key == "Shift") {
    shiftKey.value = true;
  }
  // 当焦点在输入框/文本域/下拉框等可编辑元素中时，不拦截快捷键
  // 这样用户可以在弹窗、属性面板等输入框中正常使用 Ctrl+C/V 等操作
  if (isEditableTarget(evt)) {
    return;
  }
  // 当弹窗打开等场景下 shortKeyDisabled 为 true 时，跳过快捷键处理
  if (getDesignFormStore().shortKeyDisabled) {
    return;
  }
  let keyInfo;
  if (ctrlKey.value && altKey.value && shiftKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.ctrl && item.alt && item.shift,
    );
  } else if (ctrlKey.value && altKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.ctrl && item.alt,
    );
  } else if (ctrlKey.value && shiftKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.ctrl && item.shift,
    );
  } else if (altKey.value && shiftKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.alt && item.shift,
    );
  } else if (ctrlKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.ctrl && !item.alt && !item.shift,
    );
  } else if (altKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.alt && !item.ctrl && !item.shift,
    );
  } else if (shiftKey.value) {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && item.shift && !item.ctrl && !item.alt,
    );
  } else {
    keyInfo = shortKeyList(module).find(
      (item) => item.key == evt.key && !item.ctrl && !item.alt && !item.shift,
    );
  }
  if (keyInfo) {
    //阻止浏览器默认行为
    evt.preventDefault();
    //执行方法
    keyInfo.handler && keyInfo.handler();
    actions && actions(keyInfo.action, ...params);
  }
};
const windowBlur = () => {
  altKey.value = false;
  shiftKey.value = false;
  ctrlKey.value = false;
};
//初始化键盘事件
export const initKeyboardEvent = (
  actions: Function,
  module: ModuleEnums,
  ...params: any
): {
  keydown: (evt: KeyboardEvent) => void;
  keyup: (evt: KeyboardEvent) => void;
} => {
  // removeKeyboardEvent(actions, module, params);
  // 将处理函数保存为变量，用于后续卸载
  const keydownHandler = (evt: KeyboardEvent) =>
    keyboardEvent(evt, actions, module, ...params);
  const keyupHandler = (evt: KeyboardEvent) => resetCtrlKey(evt);

  window.addEventListener("keydown", keydownHandler, true);
  window.addEventListener("keyup", keyupHandler, true);
  window.addEventListener("blur", windowBlur, false);

  // 返回包含处理函数的对象用于卸载
  return {
    keydown: keydownHandler,
    keyup: keyupHandler,
  };
};
//移除键盘事件
export const removeKeyboardEvent = (handlers: {
  keydown: (evt: KeyboardEvent) => void;
  keyup: (evt: KeyboardEvent) => void;
}) => {
  window.removeEventListener("keydown", handlers.keydown, true);
  window.removeEventListener("keyup", handlers.keyup, true);
  window.removeEventListener("blur", windowBlur, false);
};
