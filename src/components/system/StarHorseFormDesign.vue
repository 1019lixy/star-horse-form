<script lang="ts" setup>
import {computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, PropType, ref, watch} from "vue";
import {
  ApiUrls,
  CompType,
  operationConfirm,
  piniaInstance,
  useDesignFormStore,
  useGlobalConfigStore,
  useSelfOperationStore,
  warning
} from "star-horse-lowcode";
import {validDynamicFormCompParams} from "@/components/system/items/utils/preview";
import {delCacheData, getCacheData, setCacheData} from "@/api/cached_utils";
import {i18n} from "@/lang";
import {Config} from "@/api/settings";
import CodeDialog from "@/components/system/items/form/dialogs/CodeDialog.vue";
import BatchEditDialog from "@/components/system/items/form/dialogs/BatchEditDialog.vue";
import PreviewDialog from "@/components/system/items/form/dialogs/PreviewDialog.vue";
import FieldLayerDrawer from "@/components/system/items/form/dialogs/FieldLayerDrawer.vue";
import FormToolbar from "@/components/system/items/form/components/FormToolbar.vue";
import FormDesigner from "@/components/system/items/form/components/FormDesigner.vue";
import FieldPanel from "@/components/system/items/form/FieldPanel.vue";
import PropertyPanel from "@/components/system/items/form/PropertyPanel.vue";
import {useKeyboardEvents} from "@/components/system/items/form/composables/useKeyboardEvents";
import {useDialogManager} from "@/components/system/items/form/composables/useDialogManager";
import {ToolBtnType} from "@/components/types/ToolBtnType";
import ConfigDialog from "@/components/system/items/form/dialogs/ConfigDialog.vue";
import {formContainer} from "@/components/system/items/form/composables/formContainer";
import {formExtendItems} from "@/components/system/items/form/composables/formExtendItems";
import {formItems} from "@/components/system/items/form/composables/formItems";

defineOptions({
  name: "StarHorseFormDesign",
});
const props = defineProps({
  permissions: {
    type: Object as PropType<any>,
    default: {},
  },
  primaryKey: {
    type: String,
    default: "idDynamicForm",
  },
  /**
   * 接口地址
   */
  api: {
    type: Object as PropType<ApiUrls>,
  },
  extendBtns: {
    type: Array as PropType<ToolBtnType[]>,
    default: () => [],
  },
  forbiddenSystemItems: {
    type: Boolean,
    default: false,
  },
});
const emits = defineEmits(["changeDataHandle", "loadData", "action", "saveData"]);
let designForm = useDesignFormStore(piniaInstance);
let userOperation = useSelfOperationStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);

let compSize = computed(
    () => configStore.configFormInfo?.buttonSize || Config.compSize,
);
let draggingItem = computed(() => designForm.draggingItem);
let list = computed(() => designForm.compList);
let isPreview = computed(() => designForm.previewVisible);
let isEdit = computed(() => designForm.isEdit);
let errMessage = ref<string>("");
let formData = computed(() => designForm.formData);
let formInfo = computed(() => designForm.formInfo);
const isDragging = computed(() => designForm.isDragging);
const fieldPanelRef = ref();
const dynamicFormRef = ref();
const previewDynamicFormRef = ref();
let reOrUnDoFlag = ref<boolean>(false);
let currentPageStyle = ref<any>({label: "电脑", key: "pc"});
let currentPageClass = ref<string>("main-design");
let cacheName = "dynamicFormCache";
let cacheData = ref<any>([]);
const propertyRef = ref();
const isSubmit = ref(false);
const configDialogRef = ref();
let shortKeySwitch: Function = () => {
};
const {dialogStates, openDialog, closeAllDialogs} = useDialogManager();

const actions = (action: ToolBtnType) => {
  switch (action.key) {
    case "leftPanel":
      leftPanelVisible.value = !leftPanelVisible.value;
      break;
    case "rightPanel":
      rightPanelVisible.value = !rightPanelVisible.value;
      break;
    case "new":
    case "empty":
      clearData(false);
      break;
    case "eprep":
      batchEdit();
      break;
    case "layer":
      viewFieldLayer();
      break;
    case "preview":
      preview();
      break;
    case "valid":
      errMessage.value = validDynamicFormCompParams(list.value);
      if (errMessage.value) {
        warning(errMessage.value);
      }
      break;
    case "code":
      createCode();
      break;
    case "undo":
      reOrUnDoFlag.value = true;
      designForm.undo();
      break;
    case "redo":
      reOrUnDoFlag.value = true;
      designForm.redo();
      break;
    case "save":
      tableEdit(true);
      break;
    case "pad":
    case "phone":
    case "pc":
      actionsStyle(action);
      break;
  }
  emits("action", action);
};

const keyboardEvents = useKeyboardEvents(actions);
shortKeySwitch = keyboardEvents.shortKeySwitch;

const init = async () => {
  //初始化数据
  designForm.clearAll(true);
  const allFormDataList: Array<any> = [];
  const assignData = (datas: any) => {
    datas?.forEach((item: any) => {
      allFormDataList.push({
        name: item.itemName,
        value: item.itemType,
      });
    });
  };
  //如果禁用系统组件，不加载系统组件
  if (!props.forbiddenSystemItems) {
    assignData(formContainer);
    assignData(formItems);
    assignData(formExtendItems);
    designForm.setContainerList(formContainer);
    designForm.setFormDataList(formItems);
    designForm.setSelfFormDataList(formExtendItems);
    designForm.setAllFormDataList(allFormDataList);
  }
  cacheDataRestore(null as MouseEvent);

  //解决数据已经加载完成，但是组件属性没有加载完成的问题
  if (list.value.length > 0) {
    let activeItem = list.value[0];
    designForm.selectItem(
        activeItem,
        activeItem.itemType,
        activeItem.compType,
    );
  }
};

const tableEdit = async (submit: boolean) => {
  isSubmit.value = submit;
  openDialog("configDialogVisible");
  designForm.setShortKeyDisabled(true);
  await nextTick(() => {
    if (configDialogRef.value) {
      configDialogRef.value.analysisDynamicFields(submit);
    }
  });
};
const closeAction = () => {
  designForm.setIsEdit(true);
  designForm.setPreviewVisible(false);
  userOperation.setFormInstance(dynamicFormRef);
  userOperation.clearAll();
  designForm.setBatchEditFieldVisible(false);
  closeAllDialogs();
  designForm.setShortKeyDisabled(false);
};

const clearData = (flag: boolean = true) => {
  if (list.value?.length > 0) {
    operationConfirm("新建将清空舞台上的所有元素，是否确定要清空？").then(
        (res: boolean) => {
          if (res) {
            designForm.clearAll(flag);
            delCacheData(cacheName);
          }
        },
    );
  } else {
    designForm.clearAll(flag);
  }
};

const preview = async () => {
  designForm.setPreviewVisible(true);
  designForm.setIsEdit(false);
  designForm.setShortKeyDisabled(true);
  shortKeySwitch(false);
  await nextTick();
  userOperation.setFormInstance(previewDynamicFormRef);
  list.value.forEach((item: any) => {
    userOperation.addFormItem(item);
  });
};

/**
 * 代码操作
 */
const codeDoSave = () => {
  // Implementation here
};


const onDragAdd = async (_evt: Event, dataList?: Array<any>) => {
  if (!draggingItem.value) {
    return;
  }
  if (Array.isArray(draggingItem.value)) {
    let temp = draggingItem.value[draggingItem.value.length - 1];
    designForm.selectItem(temp, temp["itemType"], "");
  } else {
    designForm.selectItem(
        draggingItem.value,
        draggingItem.value["itemType"],
        "",
    );
  }
};

const onComponentSelect = (component: any) => {
  designForm.selectItem(component, component["itemType"], "");
};

const createCode = () => {
  openDialog("codeDialogVisible");
  designForm.setShortKeyDisabled(true);
  shortKeySwitch(false);
};

const batchEdit = () => {
  openDialog("batchEditFieldVisible");
  designForm.setShortKeyDisabled(true);
};


let leftPanelVisible = ref<boolean>(true);
let rightPanelVisible = ref<boolean>(true);

//页面风格
const actionsStyle = (item: any) => {
  currentPageStyle.value = item;
  if (item.key == "pad") {
    currentPageClass.value = "main-design-pad";
  } else if (item.key == "phone") {
    currentPageClass.value = "main-design-phone";
  } else {
    currentPageClass.value = "main-design";
  }
};

const cacheDataRestore = (evt: MouseEvent) => {
  evt?.stopPropagation();
  designForm.clearAll(true);
  cacheData.value = getCacheData(cacheName);
  if (cacheData.value) {
    try {
      designForm.setFormInfo(JSON.parse(cacheData.value));
    } catch (e) {
      designForm.setCompList(cacheData.value);
    }
  }
  setCacheData(cacheName, null);
  cacheData.value = "";
};

const viewFieldLayer = () => {
  shortKeySwitch(false);
  openDialog("formFieldLayer");
};

const contextMenu = (evt: MouseEvent) => {
  if (!isEdit.value) {
    console.log("当前处于预览状态，不能右键操作");
    return;
  }
  evt.preventDefault();
  evt.stopPropagation();
  nextTick(() => {
    contentMenuRef.value?.show(evt);
  });
};

/**
 * 数据操作
 * @param type 类别
 * @param data 选中的数据
 */
const changeDataHandle = (type: string, data: any) => {
  emits("changeDataHandle", type, data);
};
const loadData = (data: any) => {
  emits("loadData", data);
};
const saveData = (isDraft: boolean, formData: any) => {
  emits("saveData", isDraft, formData);
};
onActivated(() => {
  designForm.setIsEdit(true);
  shortKeySwitch(true);
});

onDeactivated(() => {
  designForm.setIsEdit(false);
  shortKeySwitch(false);
});

onBeforeUnmount(() => {
  designForm.setIsEdit(false);
  shortKeySwitch(false);
  listWatcher();
});

const listWatcher = watch(
    () => list.value,
    (val: any) => {
      designForm.removePromise();
      designForm.setRefresh();
      designForm.addHistoryRecord(reOrUnDoFlag.value);
      reOrUnDoFlag.value = false;
      userOperation.setFormInstance(dynamicFormRef);
      userOperation.setFormData(formData);
      userOperation.addFormItemList(val);
      setCacheData(cacheName, val);
    },
    {
      immediate: false,
      deep: true,
    },
);

onMounted(async () => {
  await init();
  shortKeySwitch(true);
});

const contentMenuRef = ref();
const formListRef = ref();
const previewDialogRef = ref(); // Add this ref

const validatePreviewForm = async () => {
  if (previewDialogRef.value) {
    return await previewDialogRef.value.validateForm();
  }
};

const exportPreviewToHtml = () => {
  if (previewDialogRef.value) {
    previewDialogRef.value.exportToHtml();
  }
};
const nodeList = () => {
  return list.value;
};
const setFormInfo = (nodeList: Array<any>, formInfo: any, formData: any, isEdit: boolean) => {
  initStoreData();
  designForm.setFormInfo(formInfo);
  designForm.setCompList(nodeList);
  designForm.setFormData(formData);
  designForm.setIsEdit(isEdit);
  let activeItem = list.value[0];
  //如果组件属性已经加载完成，则直接选中第一个组件
  if (activeItem) {
    designForm.selectItem(activeItem, activeItem.itemType, activeItem.compType);
  }
};
/**
 *
 * @param flag 如果为true 则清空所有组件,如果为false 则只清空选中的组件
 */
const initStoreData = () => {
  designForm.clearAll(true);
};
/**
 *
 * @param disabled true 禁用快捷键，false 开启快捷键
 */
const formShortKeySwitch = (disabled: boolean) => {
  designForm.setShortKeyDisabled(disabled);
};

/**
 *扩展第三方容器组件
 * @param containerData 容器组件
 */
const setContainerDatas = (containers: CompType[]) => {
  designForm.addContainerList(containers);
};
/**
 * 系统组件
 * @param items 组件列表
 */
const setItemDatas = (items: CompType[]) => {
  designForm.addFormDataList(items);
};
/**
 * 扩展第三方组件
 * @param items 组件列表
 */
const addExtendItemDatas = (items: CompType[]) => {
  designForm.addSelfFormDataList(items);
};
defineExpose({
  validatePreviewForm,
  exportPreviewToHtml,
  nodeList,
  setFormInfo,
  closeAction,
  initStoreData,
  formShortKeySwitch,
  setContainerDatas,
  setItemDatas,
  addExtendItemDatas
});
</script>

<template>
  <ConfigDialog
      ref="configDialogRef"
      :visible="dialogStates.configDialogVisible"
      :compSize="compSize"
      @save="saveData"
      @close="closeAction"
  />
  <CodeDialog
      :visible="dialogStates.codeDialogVisible"
      :compSize="compSize"
      @close="closeAction"
      @save="codeDoSave"
  />
  <BatchEditDialog
      :visible="dialogStates.batchEditFieldVisible"
      :compSize="compSize"
      @close="closeAction"
      @save="closeAction"
  />
  <PreviewDialog
      :visible="isPreview"
      :compSize="compSize"
      :list="list"
      :currentPageClass="currentPageClass"
      @close="closeAction"
      ref="previewDialogRef"
  />
  <FieldLayerDrawer v-model:visible="dialogStates.formFieldLayer"/>
  <el-splitter>
    <el-splitter-panel collapsible size="350" min="200" max="450">
      <field-panel
          ref="fieldPanelRef"
          :api="api"
          @loadData="loadData"
          :batchCreatePage="true"
      />
    </el-splitter-panel>
    <el-splitter-panel>
      <div class="main-design-outer">
        <FormToolbar
            :list="list"
            :permissions="permissions"
            :currentPageStyle="currentPageStyle"
            :cacheData="cacheData"
            @action="actions"
            @cacheRestore="cacheDataRestore"
            :extendBtns="extendBtns"
        />
        <FormDesigner
            :list="list"
            :form-data="formData"
            :form-info="formInfo"
            :is-dragging="isDragging"
            :current-page-class="currentPageClass"
            @drag-add="onDragAdd"
            @context-menu="contextMenu"
            @select-component="onComponentSelect"
            ref="dynamicFormRef"
        />

        <FormMenuShot
            ref="formListRef"
            v-if="Object.keys(api||{}).length > 0"
            @change="changeDataHandle"
            :dataUrl="api"
            :primaryKey="primaryKey"
        />
        <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
      </div>
    </el-splitter-panel>
    <el-splitter-panel
        collapsible
        :size="350"
        min="260"
        max="500"
        class="overflow-hidden!"
        v-if="list.length > 0"
    >
      <el-scrollbar>
        <property-panel ref="propertyRef"/>
      </el-scrollbar>
    </el-splitter-panel>
  </el-splitter>
</template>

<style lang="scss" scoped>
:deep(.el-icon) {
  color: #fff !important;
}

:deep {
  .el-card {
    margin: 0 !important;
  }
}

:deep(.comp-item) {
  margin-top: unset !important;
}

:deep(.el-card__body) {
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
}

.fade-move {
  transition: transform 0.3s ease;
}

.design-form-container {
  width: 100%;
  display: flex; // 改用grid布局
  align-items: center;
}

// 在样式部分添加以下规则

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

:deep(.el-collapse-item__header) {
  height: 30px;
  background: var(--star-horse-font-color);
  border-bottom: 1px dashed var(--star-horse-shadow);
}

:deep(.el-collapse-item__wrap) {
  margin-top: 5px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

.inner_content {
  display: flex;
  flex: 1;
}

.main-design-outer {
  flex: 1;
  height: 100%;
  position: relative;
  background: var(--star-horse-background);
  justify-content: center;
  border: 1px dashed var(--star-horse-shadow);
  padding: 0;
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  top: 0;
  left: 0;
  transform: translate(0, 0);
}

.inner_button {
  ul {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;
  }

  li {
    border: none !important;
  }
}
</style>
