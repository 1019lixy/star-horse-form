import {computed, ref, Ref, ComputedRef} from "vue";
import {getDesignFormStore} from "star-horse-lowcode";

/**
 * Create the standard onDragAdd handler used by all container components.
 * Selects the dragged item in the design form store.
 */
export function useDragAdd(designForm?: any) {
    const store = designForm ?? getDesignFormStore();
    const onDragAdd = (evt: Event | any, dataList: any) => {
        const newIndex = evt.newIndex;
        if (newIndex != null && newIndex != "undefined") {
            const dataInfo = dataList[newIndex];
            store.selectItem(dataInfo, dataInfo.itemType, "");
        }
    };
    return {onDragAdd};
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
export function useRowHeight(compSize: Ref<string> | ComputedRef<string> | (() => string)) {
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
export function usePanelState(formData: Ref<any>, field: Ref<any> | (() => any)) {
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
                Object.keys(tempFormData.value).forEach(key => {
                    formData.value[key] = tempFormData.value[key];
                });
            }
            visible.value = false;
        } else {
            visible.value = false;
        }
    };

    return {visible, tempFormData, handleOpen, handleClose};
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