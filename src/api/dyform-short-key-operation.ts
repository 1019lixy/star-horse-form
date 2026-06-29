import {
    copyContainer,
    getCopyerOperationStore,
    getDesignFormStore,
    moveDownItem,
    moveUpItem,
        operationConfirm,
    removeItem,
    uuid,
    warning,
} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {computed} from "vue";
import {ModuleEnums} from "@/components/enums/ModuleEnums";
import {deepClone} from "@/api/system";


const list = computed(() => getDesignFormStore().compList);
const isEdit = computed(() => getDesignFormStore().isEdit);
const currentComp = computed(() => getDesignFormStore().currentComp);
const action = computed(() => getCopyerOperationStore().action);
const shortKeyDisabled = computed(() => getDesignFormStore().shortKeyDisabled);
const parentContainer = computed(() => getCopyerOperationStore().parentContainer);
const copyerData = computed(() => getCopyerOperationStore().copyerData);
const currentSubItemId = computed(() => getDesignFormStore().currentSubItemId);
const parentCompType = computed(() => getDesignFormStore().getParentContainer());
/**
 * 复制
 */
const dyCopy = () => {
    if (shortKeyDisabled.value) {
        return;
    }
    const item: any = currentComp.value;
    if (!item || Object.keys(item).length === 0) {
        warning(i18n("dyform.shortKey.selectCopyFirst"));
        return;
    }
    const copyItem: any = deepClone(item);
    getCopyerOperationStore().keyboardOperation(
        "copy",
        ModuleEnums.DYNAMIC_FORM,
        {},
        copyItem,
    );
};
/**
 * 剪切
 */
const dyCut = () => {
    if (shortKeyDisabled.value) {
        return;
    }
    const item: any = currentComp.value;
    if (!item || Object.keys(item).length === 0) {
        warning(i18n("dyform.shortKey.selectCutFirst"));
        return;
    }
    const copyItem: any = deepClone(item);
    getCopyerOperationStore().keyboardOperation(
        "cut",
        ModuleEnums.DYNAMIC_FORM,
        {},
        copyItem,
    );
};
/**
 * 粘贴
 */
const dyPaste = () => {
    if (shortKeyDisabled.value) {
        return;
    }
    const copyItem: any = deepClone(copyerData.value);
    if (!copyItem || Object.keys(copyItem).length === 0) {
        return;
    }
    const compType = copyItem.compType;
    const itemType = copyItem.itemType;
    if (action.value === "cut") {
        removeItem(isEdit.value, currentComp.value, parentContainer.value);
    }
    if (compType == "container") {
        copyContainer(list.value, copyItem, action.value === "cut");
    } else {
        copyItem.id = uuid();
        if (!copyItem.preps) {
            copyItem.preps = {};
        }
        copyItem.preps.id = copyItem.id;
        // copyItem.preps.label = copyItem.preps.label;
        //判断copyItem.preps.name是否以数字结尾，如果是，则去掉数字，然后加上formInfo.value["dataIndex"]
        let name = copyItem.preps.name;
        if (name.match(/\d+$/)) {
            name = name.replace(/\d+$/, "");
        }
        copyItem.preps.name = name + getDesignFormStore().getFieldDataIndex();
        if (currentSubItemId.value) {

            // const subItem = designForm.selectItemById(currentSubItemId.value);
            // console.log(subItem);
            //如果有容器，则查找
            // 定义一个标签名，比如 findColumn
            findColumn:
                for (const item of list.value.filter(item => item.compType === "container")) {
                    if (item.itemType === "dytable" || item.itemType === "box") {
                        for (const prepItem of item.preps.elements) {
                            for (const column of prepItem.columns) {
                                if (column.id === currentSubItemId.value) {
                                    if (!column.items) {
                                        column.items = [];
                                    }
                                    column.items.push(copyItem);

                                    // 跳出所有循环，直接到 label 外面
                                    break findColumn;
                                }
                            }
                        }
                    }
                }
        } else if (parentCompType.value) {
            findColumn2:
                for (const item of list.value.filter(item => item.compType === "container")) {
                    if (item.itemType !== "dytable" || item.itemType !== "box") {
                        for (const prepItem of item.preps.elements) {
                            if (prepItem.items?.find((item) => item.id === currentComp.value.id)) {
                                prepItem.items.push(copyItem);
                                break findColumn2;
                            }
                        }
                    }
                }
        } else {
            list.value.push(copyItem);
        }
    }
    getDesignFormStore().selectItem(copyItem, itemType, "");
};
const dyEnter = () => {
    console.log("enter");
};
/**
 * tab
 */
const dyTab = () => {
    console.log("tab");
};
/**
 * 撤销
 */
const dyEscape = () => {
    console.log("escape");
};
const dyBackspace = () => {
    console.log("backspace");
};

const dyRedo = () => {
    //已有实现接口
    // designForm.redo();
};
const dyUndo = () => {
    //已有实现接口
    // designForm.undo();
    console.log("undo");
};
const dyNew = () => {
    //已有实现接口
    // if (list.value.length > 0) {
    //     confirm("新建后表单，已设置的数据会丢失，是否需要保存").then(() => {
    //         dySave();
    //     }).catch(() => {
    //         designForm.clearAll();
    //     });
    // }
};
const dySave = () => {
    //已有实现接口
    // designForm.setBatchEditFieldVisible(true);
    console.log("save");
};
const dyOpen = () => {
    console.log("open");
};
const dyDelete = () => {
    operationConfirm(i18n("dyform.shortKey.confirmDeleteSelected")).then(() => {
        console.log("delete");
    });
};
const dySelectAll = () => {
    console.log("selectAll");
};
const dyDeleteAll = () => {
    operationConfirm(i18n("dyform.shortKey.confirmDeleteAll")).then(() => {
        getDesignFormStore().clearAll();
    });
    console.log("deleteAll");
};
const dyFind = () => {
    console.log("find");
};
const dyExchange = () => {
    getDesignFormStore().setComponentVisible(true);
    console.log("exchange");
};
const dyGroup = () => {
    console.log("group");
};
const dyUnGroup = () => {
    console.log("unGroup");
};
const dyPrint = () => {
    console.log("print");
};
const dyPreview = () => {
    //已有实现接口
    // designForm.setPreviewVisible(true);
    // designForm.setIsEdit(false);
};
const dyReturn = () => {
    //已有实现接口
    // router.push({
    //     path: "/dyform/DynamicFormUi",
    //     componentName: "DynamicFormUi",
    // });
};
const dyUp = () => {
    moveUpItem(true, currentComp.value, {});
    console.log("up");
};
const dyDown = () => {
    moveDownItem(true, currentComp.value, {});
    console.log("down");
};
const dyLeft = () => {
    console.log("left");
};
const dyRight = () => {
    console.log("right");
};
const dyAltUp = () => {
    console.log("altUp");
};
const dyAltDown = () => {
    console.log("altDown");
};
const dyAltLeft = () => {
    console.log("altLeft");
};
const dyAltRight = () => {
    console.log("altRight");
};
const dyCtrlUp = () => {
    console.log("ctrlUp");
};
const dyCtrlDown = () => {
    console.log("ctrlDown");
};
const dyCtrlLeft = () => {
    console.log("ctrlLeft");
};
const dyCtrlRight = () => {
    console.log("ctrlRight");
};
export {
    dyCopy,
    dyCut,
    dyPaste,
    dyEnter,
    dyEscape,
    dyBackspace,
    dyTab,
    dyRedo,
    dyUndo,
    dyNew,
    dySave,
    dyOpen,
    dyDelete,
    dySelectAll,
    dyDeleteAll,
    dyFind,
    dyExchange,
    dyGroup,
    dyUnGroup,
    dyPrint,
    dyPreview,
    dyReturn,
    dyUp,
    dyDown,
    dyLeft,
    dyRight,
    dyAltUp,
    dyAltDown,
    dyAltLeft,
    dyAltRight,
    dyCtrlDown,
    dyCtrlUp,
    dyCtrlLeft,
    dyCtrlRight,
};
