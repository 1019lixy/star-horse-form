<script lang="ts" setup>
import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  PropType,
  ref,
  unref,
  watch,
} from "vue";
import {debounce} from "lodash";
import {
  CompType,
  error,
  operationConfirm,
  piniaInstance,
  success,
  useDesignFormStore,
  useGlobalConfigStore,
  useSelfOperationStore,
  warning
} from "star-horse-lowcode";
import {validDynamicFormCompParams} from "@/components/system/items/utils/FormParamsValid";
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
import {FormConfig} from "@/components/types";
import {FormSocketService} from "@/components/system/items/FormSocketService";
import JSON5 from "json5";

defineOptions({
  name: "StarHorseFormDesign",
});
const props = defineProps({
  primaryKey: {
    type: String,
    default: "idDynamicForm",
  },
  optional: {type: Object as PropType<FormConfig>},
});
const emits = defineEmits([
  "changeDataHandle",
  "loadData",
  "action",
  "saveData",
  "loadMenu",
  "loadTableColumns",
]);
const formSocketInstance = ref<FormSocketService | null>(null);
let designForm = useDesignFormStore(piniaInstance);
let userOperation = useSelfOperationStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);

let compSize = computed(
    () => configStore.configFormInfo?.buttonSize || Config.compSize,
);
let draggingItem = computed(() => designForm.draggingItem);
let list = computed(() => designForm.compList);
let currentItemId = computed(() => designForm.currentItemId);
let isPreview = computed(() => designForm.previewVisible);
let isEdit = computed(() => designForm.isEdit);
let errMessage = ref<string>("");
let operType = ref<string>("view");
let formData = computed(() => designForm.formData);
const currentUserInfo = ref<any>({});
let formInfo = computed(() => {
  let temp = unref(designForm.formInfo);
  let pageType = temp["currentPageType"];
  if (pageType && currentPageStyle.value?.key != pageType) {
    actionsStyle({
      key: pageType,
    });
  }
  return temp;
});
const isDragging = computed(() => designForm.isDragging);
const fieldPanelRef = ref();
const dynamicFormRef = ref();
const previewDynamicFormRef = ref();
const formConfigDialogVisible = ref<boolean>(false);
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
const isCooperationMode = computed(() => formInfo.value?.cooperation === "Y");
const connectionStatus = ref<string>("未连接");
const isConnected = ref<boolean>(false);
const currentFormId = computed(() => {
  // 优先使用表单的实际 ID
  if (formInfo.value?.formId) {
    return formInfo.value.formId;
  }
  // 如果没有 ID，使用默认值
  return "default";
});
const messageSubscriptions = ref<string[]>([]);
const isSyncing = ref<boolean>(false);

watch(
    () => currentItemId.value,
    (newVal, oldVal) => {
      console.log("Current item changed:", oldVal, "->", newVal);

      if (!isCooperationMode.value) {
        return;
      }

      if (!formSocketInstance.value || !formSocketInstance.value.isConnected()) {
        console.log("WebSocket not connected, skipping component lock/unlock");
        return;
      }

      // 当组件切换时，解锁旧组件
      if (oldVal && oldVal !== newVal) {
        unlockComponentById(oldVal);
      }

      // 锁定新组件
      if (newVal) {
        lockComponent(newVal);
      }
    },
    {immediate: true},
);

watch(
    () => formInfo.value?.cooperation,
    (newVal, oldVal) => {
      console.log("Cooperation mode changed:", oldVal, "->", newVal);

      if (newVal === "Y" && oldVal !== "Y") {
        // 切换到协作模式，初始化 WebSocket
        initWebSocketService();
      } else if (newVal !== "Y" && oldVal === "Y") {
        // 切换到非协作模式，断开 WebSocket
        if (formSocketInstance.value) {
          formSocketInstance.value.disconnect();
          formSocketInstance.value = null;
        }
      }
    },
);
const subscribeToMessages = () => {
  if (!formSocketInstance.value || !formSocketInstance.value.isConnected()) {
    console.error("WebSocket not connected");
    return;
  }

  messageSubscriptions.value.forEach((subscription) => {
    formSocketInstance.value?.unsubscribe(subscription);
  });
  messageSubscriptions.value = [];

  const privateSubscription = formSocketInstance.value.subscribeToGroupMessages(
      (message: any) => {
        handleIncomingMessage(message);
      },
      currentFormId.value,
  );
  if (privateSubscription) {
    messageSubscriptions.value.push(privateSubscription);
  }
};
//处理消息
const handleIncomingMessage = (message: any) => {
  console.log("Received message:", message);

  switch (message.type) {
    case "lock":
      if (message.success) {
        console.log("Component locked successfully:", message.compId);
        // 如果是自己锁定的组件，不需要添加编辑用户信息
        if (
            message.userInfo &&
            message.userInfo.userId !== currentUserInfo.value.userId
        ) {
          designForm.addCurrentCompEditUserInfo(
              message.compId,
              message.userInfo,
          );
        }
      } else {
        console.error(
            "Component lock failed:",
            message.compId,
            message.message,
        );
        // 显示锁定失败的提示
        warning(
            `组件 ${message.compId} 已被 ${message.userInfo?.name || "其他用户"} 锁定`,
        );
      }
      break;
    case "unlock":
      console.log("Component unlocked:", message.compId);
      if (message.compId) {
        designForm.removeCurrentCompEditUserInfo(message.compId);
      }
      break;
    case "sync":
      console.log("Syncing form data:", message.data);
      if (message.data && message.data.list) {
        isSyncing.value = true;
        try {
          designForm.setCompList(message.data.list);
        } finally {
          isSyncing.value = false;
        }
      }
      break;
    case "lock-status":
      console.log("Component lock status:", message.compId, message.userInfo);
      if (message.compId && message.userInfo) {
        // 跳过自己的锁定状态，只显示其他用户的编辑状态
        if (message.userInfo.userId !== currentUserInfo.value.userId) {
          designForm.addCurrentCompEditUserInfo(
              message.compId,
              message.userInfo,
          );
        }
      }
      break;
  }
};

const initWebSocketService = () => {
  if (!isCooperationMode.value) {
    console.log("非协作模式，跳过WebSocket初始化");
    return;
  }

  try {
    console.log("Initializing WebSocket service");
    formSocketInstance.value = new FormSocketService({
      endpoint: "/api/ws/form",
      onChatConnected: () => {
        console.log("Form WebSocket连接已建立");
        isConnected.value = true;
        connectionStatus.value = "已连接";
        subscribeToMessages();

        // 注册表单信息到后端
        registerFormInfo();

        // 同步当前表单数据到后端
        if (list.value.length > 0) {
          syncFormData();
        }
      },

      onError: (error) => {
        console.error("WebSocket错误:", error);
        connectionStatus.value = "错误: " + error;
      },
      onDisconnected: () => {
        isConnected.value = false;
        connectionStatus.value = "已断开";
        console.log("WebSocket连接已断开");
      },
    });

    console.log("Attempting to connect to WebSocket server");
    formSocketInstance.value
        .connect()
        .then((connected) => {
          if (connected) {
            isConnected.value = true;
            connectionStatus.value = "已连接";
            console.log("WebSocket服务连接成功");
          } else {
            isConnected.value = false;
            connectionStatus.value = "连接失败";
            console.error("WebSocket服务连接失败");
          }
        })
        .catch((error) => {
          console.error("WebSocket连接过程中出错:", error);
          isConnected.value = false;
          connectionStatus.value = "连接出错";
        });

    console.log("WebSocket服务初始化完成");
  } catch (error) {
    console.error("初始化WebSocket服务失败:", error);
    isConnected.value = false;
    connectionStatus.value = "初始化失败";
  }
};
const changeRole = (data: any) => {
  console.log("changeRole", data);
  currentUserInfo.value = data;
};
//导入文件
const operImportFile = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const jsonData = JSON5.parse(content);
        if (jsonData) {
          if (Array.isArray(jsonData)) {
            designForm.setCompList(jsonData);

          } else if (jsonData.dataList) {
            designForm.setCompList(jsonData.dataList);
            designForm.setFormInfo(jsonData.formInfo);
          } else {
            designForm.setCompList([jsonData]);
          }
          success('导入成功');
        } else {
          error('文件格式不正确，请导入正确的JSON文件');
        }
      } catch (err) {
        console.error('导入文件失败:', err);
        error('文件解析失败，请检查文件格式');
      }
    };
    reader.readAsText(file);
  };
  input.click();
}
const actions = (action: ToolBtnType) => {
  switch (action.key) {
    case "formConfig":
      formConfigDialogVisible.value = true;
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
    case "upload":
      operImportFile();
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
  if (!props.optional?.forbiddenSystemItems) {
    assignData(formContainer);
    assignData(formItems);
    assignData(formExtendItems);
    designForm.setContainerList(formContainer);
    designForm.setFormDataList(formItems);
    designForm.setSelfFormDataList(formExtendItems);
    designForm.setAllFormDataList(allFormDataList);
  }
  if (
      props.optional?.containerList &&
      typeof props.optional.containerList == "function"
  ) {
    props.optional.containerList().then((res: CompType[]) => {
      designForm.addContainerList(res);
    });
  }
  if (
      props.optional?.itemList &&
      typeof props.optional.itemList == "function"
  ) {
    props.optional.itemList().then((res: CompType[]) => {
      designForm.addFormDataList(res);
    });
  }
  if (
      props.optional?.extendItemList &&
      typeof props.optional.extendItemList == "function"
  ) {
    props.optional.extendItemList().then((res: CompType[]) => {
      designForm.addSelfFormDataList(res);
    });
  }
  cacheDataRestore(null as MouseEvent);
  // 初始化 WebSocket 服务
  initWebSocketService();
  //解决数据已经加载完成，但是组件属性没有加载完成的问题
  if (list.value.length > 0) {
    let activeItem = list.value[0];
    designForm.selectItem(activeItem, activeItem.itemType, activeItem.compType);
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
  // 仅在协作模式下同步数据到其他用户，且不在同步过程中
  if (isCooperationMode.value && !isSyncing.value) {
    syncFormData();
  }
};

const onComponentSelect = (component: any) => {
  if (!isCooperationMode.value) {
    designForm.selectItem(component, component["itemType"], "");
    return;
  }

  // 先解锁当前选中的组件
  if (currentItemId.value) {
    unlockComponentById(currentItemId.value);
  }

  // 锁定新组件
  lockComponent(component.id);

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
  formInfo.value["currentPageType"] = item.key ?? "pc";
};

const cacheDataRestore = (evt: MouseEvent) => {
  evt?.stopPropagation();
  designForm.clearAll(true);
  cacheData.value = getCacheData(cacheName);
  if (cacheData.value && typeof cacheData.value == "object") {
    designForm.setFormInfo(cacheData.value["formInfo"]);
    designForm.setCompList(cacheData.value["dataList"]);
  }
  setCacheData(cacheName, null);
  cacheData.value = "";
};

const viewFieldLayer = (type?: string) => {
  shortKeySwitch(false);
  operType.value = type || "view";
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
    debounce((val: any) => {
      designForm.removePromise();
      designForm.setRefresh();
      designForm.addHistoryRecord(reOrUnDoFlag.value);
      reOrUnDoFlag.value = false;
      userOperation.setFormInstance(dynamicFormRef);
      userOperation.setFormData(formData);
      userOperation.addFormItemList(val);
      setCacheData(cacheName, {
        dataList: val,
        formInfo: unref(formInfo),
      });
    }, 300),
    {
      immediate: false,
      deep: true,
    },
);

onMounted(async () => {
  await init();
  shortKeySwitch(true);

  // 如果是协作模式，初始化 WebSocket
  if (isCooperationMode.value) {
    initWebSocketService();
  }
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

// 注册表单信息到后端
const registerFormInfo = () => {
  if (!formSocketInstance.value || !formSocketInstance.value.isConnected()) {
    console.error("WebSocket not connected");
    return;
  }

  const formInfoData = {
    formId: currentFormId.value,
    formInfo: formInfo.value,
    formData: formData.value,
    list: list.value,
  };

  console.log("Registering form info to backend:", formInfoData);
  formSocketInstance.value.registerFormInfo(formInfoData);
};

// 锁定组件
const lockComponent = (compId: string) => {
  if (!formSocketInstance.value || !formSocketInstance.value.isConnected()) {
    console.error("WebSocket not connected");
    return;
  }

  formSocketInstance.value.lockComponent(
      compId,
      currentFormId.value,
      currentUserInfo.value,
  );
};

// 解锁组件
const unlockComponentById = (compId: string) => {
  if (
      !formSocketInstance.value ||
      !formSocketInstance.value.isConnected() ||
      !compId
  ) {
    return;
  }

  formSocketInstance.value.unlockComponent(compId, currentFormId.value);
};

// 同步表单数据
const syncFormData = () => {
  if (!formSocketInstance.value || !formSocketInstance.value.isConnected()) {
    return;
  }

  const data = {
    list: list.value,
    formInfo: formInfo.value,
    formData: formData.value,
  };

  formSocketInstance.value.syncComponentData(currentFormId.value, data);
};
const nodeList = () => {
  return list.value;
};
const setFormInfo = (
    nodeList: Array<any>,
    formInfo: any,
    formData: any,
    isEdit: boolean,
) => {
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
defineExpose({
  validatePreviewForm,
  exportPreviewToHtml,
  nodeList,
  setFormInfo,
  closeAction,
  initStoreData,
  formShortKeySwitch,
});
</script>

<template>
  <ConfigDialog
      ref="configDialogRef"
      :visible="dialogStates.configDialogVisible"
      :optional="optional"
      @save="saveData"
      @close="closeAction"
  />
  <CodeDialog
      :visible="dialogStates.codeDialogVisible"
      :optional="optional"
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
  <PageConfig v-model="formConfigDialogVisible">
    <!--    <template #header="{form}">
          <el-form-item label="页面风格" prop="pageStyle">
            <select-item :formData="form" :field="{
              fieldName:'pageStyle',
              preps:{
                values:langList
              }
            }"/>
          </el-form-item>
        </template>-->
  </PageConfig>
  <FieldLayerDrawer v-model:visible="dialogStates.formFieldLayer"
                    :operType="operType"/>
  <el-splitter>
    <el-splitter-panel collapsible size="350" min="200" max="450">
      <field-panel
          ref="fieldPanelRef"
          :optional="optional"
          @loadData="loadData"
      />
    </el-splitter-panel>
    <el-splitter-panel>
      <el-splitter layout="vertical">
        <el-splitter-panel :collapsible="false" :resizable="false" size="42">
          <FormToolbar
              :list="list"
              :currentPageStyle="currentPageStyle"
              :cacheData="cacheData"
              @action="actions"
              @changeRole="changeRole"
              @cacheRestore="cacheDataRestore"
              :optional="optional"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-splitter>
            <el-splitter-panel>
              <div class="main-design-outer">
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
                    v-if="Object.keys(optional?.api || {}).length > 0"
                    @change="changeDataHandle"
                    :dataUrl="optional?.api"
                    :prop="optional?.shotProps"
                    :primaryKey="optional?.primaryKey"
                />
                <div class="main-copyright">
                  {{ i18n("starhorse.copyright") }}
                </div>
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
                <property-panel ref="propertyRef" :optional="optional"/>
              </el-scrollbar>
            </el-splitter-panel>
          </el-splitter>
        </el-splitter-panel>
      </el-splitter>
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
