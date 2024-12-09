import {ref} from "vue";
import {ShortKey} from "@/components/types/ShortKey";
import piniaInstance from "@/store";
import {copyerOperation} from "@/store/CopyerOperationStore.ts";

const copyerAction = copyerOperation(piniaInstance)
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

const keyboardEventMap: ShortKey[] = [
    {
        key: "Enter",
        action: "enter",
    },
    {
        key: "Escape",
        action: "escape",
    },
    {
        key: "Tab",
        action: "tab",
    },
    {
        key: "Backspace",
        action: "backspace",
    },
    {
        key: "Delete",
        action: "delete",
    },
    {
        key: "z",
        action: "undo",
        ctrl: true,
    },
    {
        key: "y",
        action: "redo",
        ctrl: true,
    },
    {
        key: "c",
        action: "copy",
        ctrl: true,
    },
    {
        key: "x",
        action: "cut",
        ctrl: true,
    },
    {
        key: "v",
        action: "paste",
        ctrl: true,
    },
    {
        key: "n",
        action: "new",
        ctrl: true,
    },
    {
        key: "s",
        action: "save",
        ctrl: true,
    },
    {
        key: "o",
        action: "open",
        ctrl: true,
    },
    {
        key: "d",
        action: "delete",
        ctrl: true,
    },
    {
        key: "a",
        action: "selectAll",
        ctrl: true,
    },
    {
        key: "d",
        action: "deleteAll",
        ctrl: true,
        alt: true,
    },
    {
        key: "f",
        action: "find",
        ctrl: true,
    },
    {
        key: "r",
        action: "exchange",
        ctrl: true,
    },
    {
        key: "g",
        action: "group",
        ctrl: true,
    },
    {
        key: "g",
        action: "ungroup",
        ctrl: true,
        alt: true,
    },
    {
        key: "p",
        action: "print",
        ctrl: true,
    },
    {
        key: "r",
        action: "return",
        ctrl: true,
    },
    {
        key: "ArrowUp",
        action: "up",
    },
    {
        key: "ArrowDown",
        action: "down",
    },
    {
        key: "ArrowLeft",
        action: "left",
    },
    {
        key: "ArrowRight",
        action: "right",
    },
    {
        key: "ArrowUp",
        action: "up",
        alt: true,
    },
    {
        key: "ArrowDown",
        action: "altDown",
        alt: true,
    },
    {
        key: "ArrowLeft",
        action: "altLeft",
        alt: true,
    },
    {
        key: "ArrowRight",
        action: "altRight",
        alt: true,
    },
    {
        key: "ArrowUp",
        action: "ctrlUp",
        ctrl: true,
    },
    {
        key: "ArrowDown",
        action: "ctrlDown",
        ctrl: true,
    },
    {
        key: "ArrowLeft",
        action: "ctrlLeft",
        ctrl: true,
    },
    {
        key: "ArrowRight",
        action: "ctrRight",
        ctrl: true,
    },
];
/**
 * 键盘事件
 * @param evt
 * @param actions 回调函数
 * @param params 参数
 */
export const keyboardEvent = (evt: KeyboardEvent, actions: Function, ...params: any) => {
    console.log(evt, evt.key);
    //ctrlKey
    if (evt.key == "Control") {
        ctrlKey.value = true;
    }
    //altKey
    if (evt.key == "Alt") {
        altKey.value = true;
    }
    let keyInfo = keyboardEventMap.find(item => item.key == evt.key);
    if (keyInfo) {
        if (keyInfo.ctrl && !ctrlKey.value) {
            return;
        }
        if (keyInfo.alt && !altKey.value) {
            return;
        }
        copyerAction.operation(keyInfo.action, {}, {})
        // if(keyInfo.other&&!keyInfo.other.includes(evt.key)){
        //     return;
        // }
        if (actions) {
            actions(keyInfo.action, ...params);
        }

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
