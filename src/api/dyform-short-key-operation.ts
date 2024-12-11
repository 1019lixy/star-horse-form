import {DesignForm} from "@/store/DesignFormStore.ts";
import {CopyerOperation} from "@/store/CopyerOperationStore.ts";
import piniaInstance from "@/store";
import {computed} from "vue";
import {confirm, warning} from "@/utils/message.ts";
import {ModuleEnums} from "@/components/enums/ModuleEnums.ts";
import {moveDownItem, moveUpItem, removeItem} from "@/views/dyform/page/AblesPlugin.ts";
import {uuid} from "@/api/system.ts";
import router from "@/router";

const designForm = DesignForm(piniaInstance);
const copyerOperation = CopyerOperation(piniaInstance);

let list = computed(() => designForm.compList);
let currentComp = computed(() => designForm.currentComp);
let action = computed(() => copyerOperation.action);
let parentContainer = computed(() => copyerOperation.parentContainer);
let copyerData = computed(() => copyerOperation.copyerData);
/**
 * 复制
 */
const dyCopy = () => {
    let item: any = currentComp.value;
    if (!item || Object.keys(item).length === 0) {
        warning("请先选择要复制的组件");
        return;
    }

    let copyItem: any = JSON.parse(JSON.stringify(item));
    copyerOperation.keyboardOperation("copy", ModuleEnums.DYNAMIC_FORM, {}, copyItem);

}
/**
 * 剪切
 */
const dyCut = () => {
    let item: any = currentComp.value;
    if (!item || Object.keys(item).length === 0) {
        warning("请先选择要剪切的组件");
        return;
    }
    let copyItem: any = JSON.parse(JSON.stringify(item));
    copyerOperation.keyboardOperation("cut", ModuleEnums.DYNAMIC_FORM, {}, copyItem);
}
/**
 * 粘贴
 */
const dyPaste = () => {
    let copyItem: any = JSON.parse(JSON.stringify(copyerData.value));
    if (action.value === "cut") {
        removeItem(list.value, currentComp.value, parentContainer.value);
    } else {
        copyItem.id = uuid();
        copyItem.preps.id = copyItem.id;
        copyItem.preps.label = copyItem.preps.label + "(复制)";
        copyItem.preps.name = copyItem.preps.name + (list.value.length + 1);
    }
    list.value.push(copyItem);
    designForm.selectItem(copyItem, copyItem.itemType, "");
    console.log("paste")
}
const dyEnter = () => {

    console.log("enter")
}
/**
 * tab
 */
const dyTab = () => {

    console.log("tab")
}
/**
 * 撤销
 */
const dyEscape = () => {
    console.log("escape")
}
const dyBackspace = () => {
    console.log("backspace")
}

const dyRedo = () => {
    designForm.redo();
    // console.log("redo")
}
const dyUndo = () => {
    designForm.undo();
    console.log("undo")
}
const dyNew = () => {

    console.log("new")
}
const dySave = () => {

    console.log("save")
}
const dyOpen = () => {

    console.log("open")
}
const dyDelete = () => {
    confirm("确定要删除所选组件吗？").then(() => {
        console.log("delete")
    });

}
const dySelectAll = () => {

    console.log("selectAll")
}
const dyDeleteAll = () => {
    confirm("确定要删除所有组件吗？").then(() => {
        designForm.clearAll();
    });
    console.log("deleteAll")
}
const dyFind = () => {

    console.log("find")
}
const dyExchange = () => {
    designForm.setComponentVisible(true);
    console.log("exchange")
}
const dyGroup = () => {

    console.log("group")
}
const dyUnGroup = () => {

    console.log("unGroup")
}
const dyPrint = () => {

    console.log("print")
}
const dyPreview = () => {
    designForm.setPreviewVisible(true);
    designForm.setIsEdit(false);
    console.log("preview")
}
const dyReturn = () => {
    router.push({
        path: "/dyform/DynamicFormUi",
        componentName: "DynamicFormUi",
    });
    console.log("return")
}
const dyUp = () => {
    moveUpItem(true, currentComp.value, {});
    console.log("up")
}
const dyDown = () => {
    moveDownItem(true, currentComp.value, {});
    console.log("down")
}
const dyLeft = () => {

    console.log("left")
}
const dyRight = () => {

    console.log("right")
}
const dyAltUp = () => {

    console.log("altUp")
}
const dyAltDown = () => {

    console.log("altDown")
}
const dyAltLeft = () => {

    console.log("altLeft")
}
const dyAltRight = () => {

    console.log("altRight")
}
const dyCtrlUp = () => {

    console.log("ctrlUp")
}
const dyCtrlDown = () => {

    console.log("ctrlDown")
}
const dyCtrlLeft = () => {

    console.log("ctrlLeft")
}
const dyCtrlRight = () => {

    console.log("ctrlRight")
}
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
    dyCtrlRight
}
