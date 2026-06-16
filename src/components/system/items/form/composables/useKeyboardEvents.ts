import { ref } from "vue";
import { ModuleEnums } from "@/components/enums/ModuleEnums";
import {
  initKeyboardEvent,
  removeKeyboardEvent,
} from "@/api/keyboard-event-utils";
import { ToolBtnType } from "@/components/types/ToolBtnType";

export function useKeyboardEvents(actions: (action: ToolBtnType) => void) {
  const keyboardHandlers = ref<{
    keydown: (evt: KeyboardEvent) => void;
    keyup: (evt: KeyboardEvent) => void;
  } | null>(null);

  const scrollHandler = (e: Event) => {
    const customEvent = e as CustomEvent;
    const target = document.querySelector(
      `[data-field-id="${customEvent.detail}"]`,
    );
    target?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
    });
  };

  /**
   * 开启或者关闭快捷键
   * @param val
   */
  const shortKeySwitch = (val: boolean) => {
    if (val) {
      if (keyboardHandlers.value) {
        removeKeyboardEvent(keyboardHandlers.value);
      }
      keyboardHandlers.value = initKeyboardEvent(
        actions,
        ModuleEnums.DYNAMIC_FORM,
      );
      window.addEventListener("scroll-to-field", scrollHandler);
    } else {
      if (keyboardHandlers.value) {
        removeKeyboardEvent(keyboardHandlers.value);
        keyboardHandlers.value = null;
      }
      window.removeEventListener("scroll-to-field", scrollHandler);
    }
  };

  return {
    shortKeySwitch,
    scrollHandler,
  };
}
