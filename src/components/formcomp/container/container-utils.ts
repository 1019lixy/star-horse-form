import {computed, ComputedRef, Ref, ref} from "vue";
import {warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {canAcceptChild} from "./container-types";
import {getDesignFormStore} from "@/store/StoreManager";

/**
 * Create the standard onDragAdd handler used by all container components.
 * Selects the dragged item in the design form store.
 */
export function useDragAdd(designForm?: any, parentItemType?: string) {
  const store = designForm;
  const onDragAdd = (evt: Event | any, dataList: any) => {
    const newIndex = evt.newIndex;
    if (newIndex != null && newIndex != "undefined") {
      const dataInfo = dataList[newIndex];
      store.selectItem(dataInfo, dataInfo.itemType, "");
    }
  };
  return { onDragAdd };
}

/**
 * Drop guard for container nesting restrictions.
 * Use the returned `moveHandler` as vuedraggable's `:move` callback.
 * Returns false to reject the drop BEFORE the item is added (pre-emptive),
 * replacing the old post-add splice rollback pattern.
 *
 * @param parentItemType - the container's itemType (string or getter)
 */
let _nestWarnLastTime = 0;
export function useDropGuard(parentItemType: string | (() => string)) {
  const getType =
    typeof parentItemType === "function"
      ? parentItemType
      : () => parentItemType;
  const reject = (): boolean => {
    const now = Date.now();
    if (now - _nestWarnLastTime > 800) {
      _nestWarnLastTime = now;
      warning(i18n("dyform.comp.container.nestDenied"));
    }
    return false;
  };
  const getDragType = (evt?: any): string | undefined => {
    const child = evt?.draggedContext?.element;
    return child?.itemType || getDesignFormStore()?.draggingItem?.itemType;
  };
  const moveHandler = (evt: any): boolean => {
    if (!canAcceptChild(getType(), getDragType(evt))) return reject();
    return true;
  };
  const guardAdd = (dataList: any[], newIndex: number): boolean => {
    if (
      !canAcceptChild(getType(), getDesignFormStore()?.draggingItem?.itemType)
    ) {
      if (
        newIndex != null &&
        newIndex >= 0 &&
        dataList &&
        dataList.length > newIndex
      ) {
        dataList.splice(newIndex, 1);
      }
      return reject();
    }
    return true;
  };
  return { moveHandler, guardAdd };
}

/**
 * Ensure a data object has an array at the given key (default "items").
 * Used by checkItem in container components.
 */
export function ensureItems(adata: any, key: string = "items") {
  if (!adata[key]) adata[key] = [];
}

/**
 * Create a checkItem function that ensures the given key exists.
 * Supports card-container's dual-key (header/body) pattern.
 */
export function createCheckItem(defaultKey: string = "items") {
  return (adata: any, type?: string) => {
    if (type && type !== defaultKey) {
      if (!adata[type + "FieldList"]) adata[type + "FieldList"] = [];
    } else {
      if (!adata[defaultKey]) adata[defaultKey] = [];
    }
  };
}

/**
 * Computed row height based on compSize.
 * Shared by box-col, box-container, dytable-col, table-container.
 */
export function useRowHeight(
  compSize: Ref<string> | ComputedRef<string> | (() => string),
) {
  return computed(() => {
    const size = typeof compSize === "function" ? compSize() : compSize.value;
    if (size === "large") return "45px";
    if (size === "small") return "35px";
    return "40px";
  });
}

/**
 * Dialog/Drawer panel state management.
 * Shared by dialog-container and drawer-container.
 */
export function usePanelState(
  formData: Ref<any>,
  field: Ref<any> | (() => any),
) {
  const visible = ref(false);
  const tempFormData = ref<any>({});

  const getField = () => (typeof field === "function" ? field() : field.value);

  const handleOpen = () => {
    tempFormData.value = JSON.parse(JSON.stringify(formData.value || {}));
    visible.value = true;
  };

  const handleClose = () => {
    const f = getField();
    const closeAction = f?.preps?.closeAction || "keep";
    if (closeAction === "clear") {
      visible.value = false;
    } else if (closeAction === "keep") {
      if (formData.value && tempFormData.value) {
        Object.keys(tempFormData.value).forEach((key) => {
          formData.value[key] = tempFormData.value[key];
        });
      }
      visible.value = false;
    } else {
      visible.value = false;
    }
  };

  return { visible, tempFormData, handleOpen, handleClose };
}

/**
 * Create a child node for condition-container / condition-node.
 * @param index - insertion index
 * @param withItems - whether to include an items array
 */
export function createChildNode(index: number, withItems: boolean = false) {
  const node: any = {
    id: `condition_${Date.now()}_${index}`,
    label: `条件${index + 1}`,
    matchType: "eq",
    matchFieldValue: "",
    children: [],
  };
  if (withItems) node.items = [];
  return node;
}

/**
 * Remove a leaf node from a condition tree.
 */
export function removeLeaf(items: any[], index: number) {
  if (index >= 0 && index < items.length) {
    items.splice(index, 1);
  }
}

/**
 * Compute CSS class for condition node depth.
 */
export function levelClass(data: any, depth: number): string {
  return `condition-level-${depth % 3}`;
}
