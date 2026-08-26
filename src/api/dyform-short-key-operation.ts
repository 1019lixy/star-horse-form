import {copyContainer, moveDownItem, moveUpItem, removeItem,} from "@/plugins/AblesPlugin";
import {getCopyerOperationStore, getDesignFormStore,} from "@/store/StoreManager";
import {operationConfirm, uuid, warning} from "star-horse-lowcode";
import {i18n} from "@/lang";
import {computed, nextTick} from "vue";
import {ModuleEnums} from "@/components/enums/ModuleEnums";
import {deepClone} from "@/api/system";

const list = computed(() => getDesignFormStore().compList);
const isEdit = computed(() => getDesignFormStore().isEdit);
const currentComp = computed(() => getDesignFormStore().currentComp);
const action = computed(() => getCopyerOperationStore().action);
const shortKeyDisabled = computed(() => getDesignFormStore().shortKeyDisabled);
const parentContainer = computed(
  () => getCopyerOperationStore().parentContainer,
);
const copyerData = computed(() => getCopyerOperationStore().copyerData);
const currentSubItemId = computed(() => getDesignFormStore().currentSubItemId);
const currentItemId = computed(() => getDesignFormStore().currentItemId);
const parentCompType = computed(() =>
  getDesignFormStore().getParentContainer(),
);
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
      findColumn: for (const item of list.value.filter(
        (item) => item.compType === "container",
      )) {
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
      findColumn2: for (const item of list.value.filter(
        (item) => item.compType === "container",
      )) {
        if (item.itemType !== "dytable" && item.itemType !== "box") {
          for (const prepItem of item.preps.elements) {
            if (
              prepItem.items?.find((item) => item.id === currentComp.value.id)
            ) {
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
  stepSelectThrottled(-1);
};
const dyDown = () => {
  stepSelectThrottled(1);
};
const dyLeft = () => {
  console.log("left");
};
const dyRight = () => {
  console.log("right");
};
// ── Up/Down 选中组件切换（先序深度优先顺序，与大纲树文档顺序一致）──
// 容器类型清单（与 OutlineTree 保持一致）
const CONTAINER_TYPES = [
  "tab",
  "box",
  "table",
  "card",
  "dytable",
  "gridtable",
  "collapse",
  "splitter",
  "condition",
  "step",
  "dialog",
  "drawer",
  "fieldset",
  "descriptions",
  "anchor",
];
// 是否为容器组件
const isContainerComp = (comp: any) =>
  !!comp && (comp.compType === "container" || CONTAINER_TYPES.includes(comp.itemType));
// 按容器类型提取子组件列表（顺序与大纲树展示一致）
const getChildItems = (comp: any): any[] => {
  if (!isContainerComp(comp)) {
    return [];
  }
  const type = comp.itemType;
  if (type === "condition") {
    return comp.children || [];
  }
  const elements = comp.preps?.elements || [];
  if (["box", "dytable", "gridtable"].includes(type)) {
    return elements.flatMap((row: any) =>
      (row.columns || []).flatMap((col: any) => col.items || []),
    );
  }
  if (type === "table") {
    return elements.flatMap((col: any) => col.items || []);
  }
  // tab/collapse/card/splitter/step/dialog/drawer/fieldset/descriptions/anchor 等
  return elements.flatMap((el: any) => [
    ...(el.headerFieldList || []),
    ...(el.items || []),
  ]);
};
// 先序深度优先展开组件树：容器本身在前，随后依次展开其子组件（含嵌套容器）
const buildFlatCompList = (
  items: any[],
  parent: any = null,
  result: Array<{ comp: any; parent: any }> = [],
) => {
  for (const comp of items || []) {
    if (!comp || !comp.id) {
      continue;
    }
    result.push({ comp, parent });
    buildFlatCompList(getChildItems(comp), comp, result);
  }
  return result;
};
// 选中并滚动定位到对应组件
const selectFlatItem = (entry: { comp: any; parent: any }) => {
  const designForm = getDesignFormStore();
  designForm.setParentContainer(entry.parent);
  designForm.selectItem(
    entry.comp,
    entry.comp.itemType,
    entry.parent?.compType || "formItem",
  );
  nextTick(() => {
    window.dispatchEvent(
      new CustomEvent("scroll-to-field", { detail: entry.comp.id }),
    );
  });
};
/**
 * Up/Down 按先序顺序切换选中组件：
 * 向下：选中下一个组件；当前为容器时进入容器依次选中其内部组件，
 * 到达容器最后一个组件后跳出容器，选中紧挨容器的下一个元素（组件或容器）；
 * 向上为其逆过程。未选中时，向下选第一个、向上选最后一个；到头/尾即停。
 */
const stepSelectComp = (step: number) => {
  if (shortKeyDisabled.value) {
    return;
  }
  const flatList = buildFlatCompList(list.value);
  if (flatList.length === 0) {
    return;
  }
  const index = flatList.findIndex(
    (entry) =>
      entry.comp.id === currentItemId.value ||
      entry.comp.preps?.id === currentItemId.value,
  );
  const nextIndex =
    index < 0 ? (step > 0 ? 0 : flatList.length - 1) : index + step;
  if (nextIndex < 0 || nextIndex >= flatList.length) {
    return;
  }
  selectFlatItem(flatList[nextIndex]);
};
// 步进节流间隔（毫秒）：按住 Up/Down 时以该节奏推进选中，保证样式可见地逐个滚动
const STEP_INTERVAL = 60;
let stepThrottleTimer: ReturnType<typeof setTimeout> | null = null;
/**
 * 步进节流：键盘自动重复触发频率（约 30ms/次）远高于渲染与滚动速度，
 * 直接逐次处理会导致卡顿、松手后选中位置跳跃。这里每 STEP_INTERVAL 最多推进一步，
 * 按住时选中样式以固定节奏在组件上滚动，松手后即停在当前所见位置。
 */
const stepSelectThrottled = (step: number) => {
  if (stepThrottleTimer != null) {
    return;
  }
  stepSelectComp(step);
  stepThrottleTimer = setTimeout(() => {
    stepThrottleTimer = null;
  }, STEP_INTERVAL);
};
const dyAltUp = () => {
  moveUpItem(
    true,
    currentComp.value,
    getDesignFormStore().getParentContainer(),
  );
};
const dyAltDown = () => {
  moveDownItem(
    true,
    currentComp.value,
    getDesignFormStore().getParentContainer(),
  );
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
