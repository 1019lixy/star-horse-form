import {ref} from "vue";

let ctrlKey = ref<boolean>(false);
let altKey = ref<boolean>(false);
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
}
/**
 * 键盘事件
 * @param evt
 * @param actions 回调函数
 * @param params 参数
 */
export const keyboardEvent = (evt: KeyboardEvent, actions: Function, ...params: any) => {
    console.log(evt.key);
    //ctrlKey
    if (evt.key == "Control") {
        ctrlKey.value = true;
    }
    //altKey
    if (evt.key == "Alt") {
        altKey.value = true;
    }
    // 撤销
    if (evt.key == "z" && ctrlKey.value) {
        actions("undo", params);
    }
    //重做
    if (evt.key == "y" && ctrlKey.value) {
        actions("redo", params);
    }
    // 复制
    if (evt.key == "c" && ctrlKey.value) {
        actions("copy", params);
    }
    // 剪切
    if (evt.key == "x" && ctrlKey.value) {
        actions("cut", params);
    }
    // 粘贴
    if (evt.key == "v" && ctrlKey.value) {
        actions("paste", params);
    }
    // 新建
    if (evt.key == "n" && ctrlKey.value) {
        actions("new", params);
    }
    // 保存
    if (evt.key == "s" && ctrlKey.value) {
        actions("save", params);
    }
    // 打开
    if (evt.key == "o" && ctrlKey.value) {
        actions("open", params);
    }
    //删除
    if (evt.key == "d" && ctrlKey.value) {
        actions("delete", params);
    }
    //删除所有
    if (evt.key == "d" && ctrlKey.value && altKey.value) {
        actions("deleteAll", params);
    }
    //全选
    if (evt.key == "a" && ctrlKey.value) {
        actions("selectAll", params);
    }
    //查找
    if (evt.key == "f" && ctrlKey.value) {
        actions("find", params);
    }
    // 替换
    if (evt.key == "r" && ctrlKey.value) {
        actions("exchange", params);
    }
    // 分组
    if (evt.key == "g" && ctrlKey.value) {
        actions("group", params);
    }
    // 取消分组
    if (evt.key == "g" && ctrlKey.value && altKey.value) {
        actions("ungroup", params);
    }
    // 打印
    if (evt.key == "p" && ctrlKey.value) {
        window.print();
        actions("print", params);
    }
    //返回
    if (evt.key == "r" && ctrlKey.value) {
        actions("return", params);
    }
}
//初始化键盘事件
export const initKeyboardEvent = (actions: Function, ...params: any) => {
    removeKeyboardEvent(actions, ...params);
    window.addEventListener("keydown", (evt: KeyboardEvent) => keyboardEvent(evt, actions, ...params));
    window.addEventListener("keyup", (evt: KeyboardEvent) => resetCtrlKey(evt));
}
//移除键盘事件
export const removeKeyboardEvent = (actions: Function, ...params: any) => {
    window.removeEventListener("keydown", (evt: KeyboardEvent) => keyboardEvent(evt, actions, ...params));
    window.removeEventListener("keyup", (evt: KeyboardEvent) => resetCtrlKey(evt));
}
