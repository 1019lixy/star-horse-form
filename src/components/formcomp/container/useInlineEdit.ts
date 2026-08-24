import {nextTick, ref} from "vue";

/**
 * Composable for inline double-click label editing.
 * Shared by card / collapse / condition / condition-node / descriptions /
 * fieldset / splitter / tab / step containers.
 *
 * @param isDesign - function returning whether design mode is active
 * @param inputSelectorPrefix - CSS class prefix for the edit input (e.g. "card-edit-input")
 */
export function useInlineEdit(
  isDesign: () => boolean,
  inputSelectorPrefix: string,
) {
  const editingId = ref<string>("");
  const editingText = ref<string>("");

  const startEditName = (element: any) => {
    if (!isDesign()) return;
    editingId.value = element.subTablePrimaryKey || element.subTableName;
    editingText.value = element.label || "";
    nextTick(() => {
      const input = document.querySelector(
        `.${inputSelectorPrefix} input`,
      ) as HTMLInputElement;
      if (input) {
        input.focus();
        input.select();
      }
    });
  };

  const finishEditName = (element: any) => {
    if (editingText.value.trim()) {
      element.label = editingText.value.trim();
    }
    editingId.value = "";
  };

  return {
    editingId,
    editingText,
    startEditName,
    finishEditName,
  };
}
