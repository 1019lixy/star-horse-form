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
  closeLoad,
  CompType,
  error,
  getDesignFormStore,
  getGlobalConfigStore,
  getSelfOperationStore,
  load,
  operationConfirm,
  success,
  uploadRequest,
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
import {quickAddItem} from "@/api/form_utils";
import type {Content} from "vanilla-jsoneditor";
import {createJSONEditor, isTextContent, toJSONContent} from "vanilla-jsoneditor";

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

// 合并默认值：确保 FormConfig 中标记为可选的字段有合理回退
const resolvedConfig = computed(() => {
  const opt = props.optional ?? {};
  const pk = opt.primaryKey ?? props.primaryKey ?? "id";
  return {
    model: opt.model ?? "simple",
    primaryKey: pk,
    forbiddenSystemItems: opt.forbiddenSystemItems ?? false,
    shotProps: opt.shotProps ?? { label: "formName", value: pk },
    compSize: opt.compSize ?? "default",
    ...opt,
  } as FormConfig;
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
let designForm = getDesignFormStore();
let userOperation = getSelfOperationStore();
let configStore = getGlobalConfigStore();

/**
 * Post-process imported container data: ensure box/dytable containers have
 * correct rowNums & columnNums in preps (and top-level) derived from their
 * actual elements grid structure.
 */
const initContainerDimensions = (comps: any[]) => {
  if (!Array.isArray(comps)) return;
  for (const comp of comps) {
    // Recurse into nested containers (card, tab, collapse, splitter, condition)
    if (comp.compType === 'container' && comp.preps?.elements) {
      for (const element of comp.preps.elements) {
        // tab/collapse/card/splitter elements have .items
        if (element.items && Array.isArray(element.items)) {
          initContainerDimensions(element.items);
        }
        // box/dytable elements have .columns[].items
        if (element.columns && Array.isArray(element.columns)) {
          for (const col of element.columns) {
            if (col.items && Array.isArray(col.items)) {
              initContainerDimensions(col.items);
            }
          }
        }
      }
    }
    // Also handle condition containers with children
    if (comp.children && Array.isArray(comp.children)) {
      initContainerDimensions(comp.children);
    }
    // Fix box/dytable dimensions
    if (comp.compType === 'container' &&
        (comp.itemType === 'box' || comp.itemType === 'dytable')) {
      const elements = comp.preps?.elements;
      if (Array.isArray(elements) && elements.length > 0) {
        const rows = elements.length;
        const cols = elements[0]?.columns?.length || 1;
        // Set in preps (read by property panel)
        if (!comp.preps) comp.preps = {};
        comp.preps.rowNums = rows;
        comp.preps.columnNums = cols;
        // Set at top-level (fallback for property panel)
        comp.rowNums = rows;
        comp.columnNums = cols;
      }
    }
  }
};

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
let currentPageStyle = ref<any>({label: i18n("dyform.design.pageStyle.pc"), key: "pc"});
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

// ── Design/Code Mode Toggle ──
const designMode = ref<"design" | "code">("design");
const codeEditorTarget = ref<HTMLDivElement | null>(null);
let jsonEditorInstance: ReturnType<typeof createJSONEditor> | null = null;
let currentJsonData: unknown = [];

const destroyEditor = () => {
  if (jsonEditorInstance) {
    try {
      jsonEditorInstance.destroy();
    } catch (_) {
    }
    jsonEditorInstance = null;
  }
};

const initEditor = () => {
  if (!codeEditorTarget.value) return;
  destroyEditor();
  try {
    jsonEditorInstance = createJSONEditor({
      target: codeEditorTarget.value,
      props: {
        content: {json: currentJsonData},
        mode: "text" as any,
        mainMenuBar: true,
        navigationBar: false,
        statusBar: true,
        onChange: (content: Content) => {
          if (isTextContent(content)) {
            try {
              currentJsonData = JSON.parse(content.text);
            } catch (_) {
            }
          } else {
            currentJsonData = content.json;
          }
        },
      },
    });
  } catch (e) {
    console.error("Failed to create JSON editor:", e);
  }
};

const switchToCodeMode = () => {
  currentJsonData = JSON.parse(JSON.stringify(list.value));
  designMode.value = "code";
  shortKeySwitch(false);
  designForm.setShortKeyDisabled(true);
  nextTick(() => initEditor());
};

const switchToDesignMode = () => {
  // Auto-apply valid changes before switching
  if (Array.isArray(currentJsonData)) {
    const parsed = JSON.parse(JSON.stringify(currentJsonData));
    initContainerDimensions(parsed);
    designForm.setCompList(parsed);
  }
  destroyEditor();
  shortKeySwitch(true);
  designForm.setShortKeyDisabled(false);
  designMode.value = "design";
};

const setMode = (mode: "design" | "code") => {
  if (mode === designMode.value) return;
  if (mode === "code") {
    switchToCodeMode();
  } else {
    switchToDesignMode();
  }
};

const applyCodeChanges = () => {
  let data: unknown = currentJsonData;
  // Try reading directly from editor instance for most up-to-date content
  if (jsonEditorInstance) {
    try {
      const content = jsonEditorInstance.get();
      if (isTextContent(content)) {
        data = JSON.parse(content.text);
      } else {
        data = content.json;
      }
    } catch (e) {
      // Fallback: try parsing from tracked data as text
      if (typeof currentJsonData === "string") {
        try {
          data = JSON.parse(currentJsonData);
        } catch (_) {
        }
      }
    }
  }
  if (!Array.isArray(data)) {
    try {
      const parsed = toJSONContent({text: String(data)} as any);
      data = parsed.json;
    } catch (_) {
      warning("数据格式错误：需要 JSON 数组");
      return;
    }
  }
  if (!Array.isArray(data)) {
    warning("数据格式错误：需要 JSON 数组");
    return;
  }
  try {
    const parsed = JSON.parse(JSON.stringify(data));
    initContainerDimensions(parsed);
    designForm.setCompList(parsed);
    success(i18n("dyform.design.importSuccess"));
  } catch (e: any) {
    warning("应用更改失败：" + (e?.message || "未知错误"));
  }
};

const resetCodeEditor = () => {
  currentJsonData = JSON.parse(JSON.stringify(list.value));
  if (jsonEditorInstance) {
    jsonEditorInstance.set({json: currentJsonData});
  }
};

const formatCodeEditor = () => {
  if (!jsonEditorInstance) return;
  try {
    const content = jsonEditorInstance.get();
    let parsed: unknown;
    if (isTextContent(content)) {
      parsed = JSON.parse(content.text);
    } else {
      parsed = content.json;
    }
    jsonEditorInstance.set({text: JSON.stringify(parsed, null, 2)});
  } catch (_) {
    warning("JSON 格式错误，无法格式化");
  }
};

const connectionStatus = ref<string>(i18n("dyform.design.ws.disconnected"));
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
            `${i18n("dyform.design.ws.comp")} ${message.compId} ${i18n("dyform.design.ws.lockedBy")} ${message.userInfo?.name || i18n("dyform.design.ws.otherUser")}`,
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
          initContainerDimensions(message.data.list);
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
        connectionStatus.value = i18n("dyform.design.ws.connected");
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
        connectionStatus.value = i18n("dyform.design.ws.error") + error;
      },
      onDisconnected: () => {
        isConnected.value = false;
        connectionStatus.value = i18n("dyform.design.ws.disconnected2");
        console.log("WebSocket连接已断开");
      },
    });

    console.log("Attempting to connect to WebSocket server");
    formSocketInstance.value
        .connect()
        .then((connected) => {
          if (connected) {
            isConnected.value = true;
            connectionStatus.value = i18n("dyform.design.ws.connected");
            console.log("WebSocket服务连接成功");
          } else {
            isConnected.value = false;
            connectionStatus.value = i18n("dyform.design.ws.connectFailed");
            console.error("WebSocket服务连接失败");
          }
        })
        .catch((error) => {
          console.error("WebSocket连接过程中出错:", error);
          isConnected.value = false;
          connectionStatus.value = i18n("dyform.design.ws.connectError");
        });

    console.log("WebSocket服务初始化完成");
  } catch (error) {
    console.error("初始化WebSocket服务失败:", error);
    isConnected.value = false;
    connectionStatus.value = i18n("dyform.design.ws.initFailed");
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
  input.accept = '*.json;*.xls;*.xlsx;*.xlsm';
  input.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isJson = fileName.endsWith('.json');

    if (isJson) {
      // JSON文件：前端直接解析
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const jsonData = JSON5.parse(content);
          if (jsonData) {
            if (Array.isArray(jsonData)) {
              initContainerDimensions(jsonData);
              designForm.setCompList(jsonData);
            } else if (jsonData.dataList) {
              initContainerDimensions(jsonData.dataList);
              designForm.setCompList(jsonData.dataList);
              designForm.setFormInfo(jsonData.formInfo);
            } else {
              initContainerDimensions([jsonData]);
              designForm.setCompList([jsonData]);
            }
            if (designMode.value == "code") {
              switchToCodeMode();
            }
            success(i18n('dyform.design.importSuccess'));
          } else {
            error(i18n('dyform.design.importFormatError'));
          }
        } catch (err) {
          console.error('导入文件失败:', err);
          error(i18n('dyform.design.importParseError'));
        }
      };
      reader.readAsText(file);
    } else {
      // Excel文件：上传到后端解析
      const excelUrl = resolvedConfig.value?.api?.excelAnalysisUrl;
      if (!excelUrl) {
        error(i18n('dyform.design.importExcelNoApi'));
        return;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        load(i18n('dyform.design.parsing'));
        const res = await uploadRequest(excelUrl, formData);
        const jsonData = res?.data?.data;
        if (jsonData) {
          if (Array.isArray(jsonData)) {
            initContainerDimensions(jsonData);
            designForm.setCompList(jsonData);
          } else if (jsonData.dataList) {
            initContainerDimensions(jsonData.dataList);
            designForm.setCompList(jsonData.dataList);
            designForm.setFormInfo(jsonData.formInfo);
          } else {
            initContainerDimensions([jsonData]);
            designForm.setCompList([jsonData]);
          }
          if (designMode.value == "code") {
            switchToCodeMode();
          }
          success(i18n('dyform.design.importSuccess'));
        } else {
          error(i18n('dyform.design.importExcelFailed'));
        }
      } catch (err) {
        console.error('Excel文件解析失败:', err);
        error(i18n('dyform.design.importExcelFailed'));
      } finally {
        nextTick(() => {
          closeLoad();
        })
      }
    }
  };
  input.click();
}
const operExportFile = () => {
  try {
    // 获取要导出的数据
    const exportData = {
      formInfo: formInfo.value,
      dataList: list.value,
      exportTime: new Date().toISOString(),
      version: '1.0'
    };
    // 格式化JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    // 创建Blob对象
    const blob = new Blob([jsonString], {type: 'application/json'});
    // 创建下载链接
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-design-${new Date().getTime()}.json`;
    // 触发下载
    document.body.appendChild(a);
    a.click();
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    // 提示用户
    success(i18n('dyform.design.exportSuccess'));
  } catch (err) {
    console.error('导出失败:', err);
    error(i18n('dyform.design.exportFailed'));
  }
};
const actions = (action: ToolBtnType) => {
  switch (action.key) {
    case "formConfig":
      formConfigDialogVisible.value = true;
      break;
    case "rightPanel":
      rightPanelVisible.value = !rightPanelVisible.value;
      break;
    case "new":
      //添加组件
      quickAddItem(list.value);
      break;
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
      break;
    case "export":
      operExportFile();
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
  if (!resolvedConfig.value?.forbiddenSystemItems) {
    assignData(formContainer);
    assignData(formItems);
    assignData(formExtendItems);
    designForm.setContainerList(formContainer);
    designForm.setFormDataList(formItems);
    designForm.setSelfFormDataList(formExtendItems);
    designForm.setAllFormDataList(allFormDataList);
  }
  if (
      resolvedConfig.value?.containerList &&
      typeof resolvedConfig.value.containerList == "function"
    ) {
    resolvedConfig.value.containerList().then((res: CompType[]) => {
      designForm.addContainerList(res);
    });
  }
  if (
      resolvedConfig.value?.itemList &&
      typeof resolvedConfig.value.itemList == "function"
  ) {
    resolvedConfig.value.itemList().then((res: CompType[]) => {
      designForm.addFormDataList(res);
    });
  }
  if (
      resolvedConfig.value?.extendItemList &&
      typeof resolvedConfig.value.extendItemList == "function"
  ) {
    resolvedConfig.value.extendItemList().then((res: CompType[]) => {
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
  shortKeySwitch(true);
};

const clearData = (flag: boolean = true) => {
  if (list.value?.length > 0) {
    operationConfirm(i18n("dyform.design.newConfirmMsg")).then(
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
    initContainerDimensions(cacheData.value["dataList"]);
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
  setTimeout(() => {
    dialogStates.value.configDialogVisible = false;
  }, 500)
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
  destroyEditor();
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
  initContainerDimensions(nodeList);
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
      :optional="resolvedConfig"
      @save="saveData"
      @close="closeAction"
  />
  <CodeDialog
      :visible="dialogStates.codeDialogVisible"
      :optional="resolvedConfig"
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
          <el-form-item :label="i18n('dyform.design.pageStyle')" prop="pageStyle">
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
  <div class="sh-form-design-root">
    <el-splitter class="sh-splitter">
      <el-splitter-panel collapsible size="320" min="220" max="450">
        <field-panel
            ref="fieldPanelRef"
            :optional="resolvedConfig"
            @loadData="loadData"
        />
      </el-splitter-panel>
      <el-splitter-panel>
        <el-splitter layout="vertical" class="sh-splitter-vertical">
          <el-splitter-panel :collapsible="false" :resizable="false" size="48">
            <FormToolbar
                :list="list"
                :currentPageStyle="currentPageStyle"
                :cacheData="cacheData"
                @action="actions"
                @changeRole="changeRole"
                @cacheRestore="cacheDataRestore"
                :optional="resolvedConfig"
            />
          </el-splitter-panel>
          <el-splitter-panel>
            <el-splitter class="sh-splitter-inner">
              <el-splitter-panel>
                <div class="main-design-outer">
                  <!-- Mode Switcher Bar -->
                  <div class="mode-switcher-bar">
                    <div class="mode-switcher">
                      <button
                          :class="['mode-btn', { active: designMode === 'design' }]"
                          @click="setMode('design')"
                      >
                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                          <rect x="1" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/>
                          <rect x="9" y="1" width="6" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/>
                          <rect x="1" y="9" width="14" height="6" rx="1" stroke="currentColor" stroke-width="1.3"/>
                        </svg>
                        {{ i18n("dyform.action.designMode") || '设计' }}
                      </button>
                      <button
                          :class="['mode-btn', { active: designMode === 'code' }]"
                          @click="setMode('code')"
                      >
                        <svg viewBox="0 0 16 16" fill="none" width="14" height="14">
                          <path d="M5 3L1 8L5 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"
                                stroke-linejoin="round"/>
                          <path d="M11 3L15 8L11 13" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"
                                stroke-linejoin="round"/>
                        </svg>
                        {{ i18n("dyform.action.codeMode") || '代码' }}
                      </button>
                    </div>
                    <!-- Code mode actions -->
                    <div v-if="designMode === 'code'" class="mode-actions">
                      <el-button size="small" @click="formatCodeEditor">格式化</el-button>
                      <el-button size="small" @click="resetCodeEditor">重置</el-button>
                      <el-button size="small" type="primary" @click="applyCodeChanges">应用更改</el-button>
                    </div>
                  </div>

                  <!-- Design Mode -->
                  <template v-if="designMode === 'design'">
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
                        v-if="Object.keys(resolvedConfig?.api || {}).length > 0"
                        @change="changeDataHandle"
                        :dataUrl="resolvedConfig?.api"
                        :prop="resolvedConfig?.shotProps"
                        :primaryKey="resolvedConfig?.primaryKey"
                    />
                  </template>

                  <!-- Code Mode -->
                  <div v-else class="code-mode-editor" ref="codeEditorTarget"></div>

                  <div class="main-copyright">
                    {{ i18n("starhorse.copyright") }}
                  </div>
                </div>
              </el-splitter-panel>
              <el-splitter-panel
                  collapsible
                  :size="340"
                  min="260"
                  max="500"
                  class="sh-property-panel"
                  v-if="list.length > 0 && designMode === 'design'"
              >
                <el-scrollbar class="sh-property-scrollbar">
                  <property-panel ref="propertyRef" :optional="resolvedConfig"/>
                </el-scrollbar>
              </el-splitter-panel>
            </el-splitter>
          </el-splitter-panel>
        </el-splitter>
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style lang="scss" scoped>
/* ====== Root Container ====== */
.sh-form-design-root {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  overflow: hidden;
  border-radius: 6px;
}

/* ====== Splitter Refinements ====== */
.sh-splitter,
.sh-splitter-vertical,
.sh-splitter-inner {
  height: 100%;
}

:deep(.el-splitter__bar) {
  background: #eef0f3 !important;
  transition: background 0.2s ease;

  &:hover {
    background: #dce1e8 !important;
  }
}

:deep(.el-splitter__bar-draggable) {
  &::after {
    background: transparent !important;
  }
}

/* ====== Component Overrides ====== */
:deep(.el-icon) {
  color: #606266;
}

:deep {
  .el-card {
    margin: 0 !important;
    border: none;
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

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

:deep(.el-collapse-item__header) {
  height: 36px;
  background: #f8f9fb;
  border-bottom: 1px solid #ebeef5;
  font-size: 13px;
  font-weight: 500;
  color: #303133;
  padding: 0 12px;
}

:deep(.el-collapse-item__wrap) {
  margin-top: 4px;
  border-bottom: none;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

/* ====== Main Design Canvas Area ====== */
.main-design-outer {
  flex: 1;
  height: 100%;
  position: relative;
  background: #f0f2f5;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0;
}

/* ====== Property Panel ====== */
.sh-property-panel {
  overflow: hidden !important;
  background: #ffffff;
  border-left: 1px solid #ebeef5;
}

.sh-property-scrollbar {
  height: 100%;

  :deep(.el-scrollbar__wrap) {
    overflow-x: hidden;
  }
}

/* ====== Transitions ====== */
.fade-move {
  transition: transform 0.3s ease;
}

.design-form-container {
  width: 100%;
  display: flex;
  align-items: center;
}

.inner_content {
  display: flex;
  flex: 1;
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

/* ====== Mode Switcher ====== */
.mode-switcher-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 12px;
  background: #f8f9fb;
  border-bottom: 1px solid #ebeef5;
  flex-shrink: 0;
}

.mode-switcher {
  display: flex;
  background: #eef0f3;
  border-radius: 6px;
  padding: 2px;
}

.mode-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 14px;
  border: none;
  background: transparent;
  border-radius: 5px;
  cursor: pointer;
  font-size: 12px;
  color: #909399;
  transition: all 0.15s ease;
  white-space: nowrap;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    color: var(--star-horse-style);
  }

  &.active {
    background: #ffffff;
    color: var(--star-horse-style);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
}

.mode-actions {
  display: flex;
  gap: 8px;
}

/* ====== Code Editor Mode ====== */
.code-mode-editor {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  position: relative;

  /* Force light theme variables for the editor */
  --jse-theme-color: #3b6bb5 !important;
  --jse-theme-color-highlight: #2b5aa0 !important;
  --jse-background-color: #ffffff !important;
  --jse-text-color: #4d4d4d !important;
  --jse-text-color-inverse: #fff !important;
  --jse-menu-color: #4d4d4d !important;
  --jse-main-border: 1px solid #e4e7ed !important;
  --jse-panel-background: #f5f7fa !important;
  --jse-panel-background-border: 1px solid #e4e7ed !important;
  --jse-panel-color: #4d4d4d !important;
  --jse-panel-border: 1px solid #e4e7ed !important;
  --jse-key-color: #004ed0 !important;
  --jse-value-color: #4d4d4d !important;
  --jse-value-color-number: #1a1aa6 !important;
  --jse-value-color-boolean: #ff8c00 !important;
  --jse-value-color-null: #004ed0 !important;
  --jse-value-color-string: #008000 !important;
  --jse-value-color-url: #008000 !important;
  --jse-delimiter-color: #4d4d4d !important;
  --jse-selection-background-color: #d3e5f7 !important;
  --jse-hover-background-color: #f0f5ff !important;
  --jse-button-background: #e0e0e0 !important;
  --jse-button-background-highlight: #d5d5d5 !important;
  --jse-button-color: #4d4d4d !important;
  --jse-a-color: #3b6bb5 !important;
  --jse-a-color-highlight: #2b5aa0 !important;

  :deep(.jse-contents) {
    border: none !important;
  }

  :deep(.jse-menu) {
    background: #f8f9fb !important;
    border-bottom: 1px solid #ebeef5 !important;
    color: #4d4d4d !important;
  }

  :deep(.jse-menu button),
  :deep(.jse-menu .jse-menu-button) {
    color: #4d4d4d !important;
  }

  :deep(.jse-menu button:active),
  :deep(.jse-menu button.jse-selected),
  :deep(.jse-menu .jse-menu-button:active),
  :deep(.jse-menu .jse-menu-button.jse-selected) {
    color: #ffffff !important;
    background-color: var(--jse-theme-color, #3b6bb5) !important;
  }

  :deep(.jse-menu .fa-icon),
  :deep(.jse-menu svg) {
    fill: currentColor !important;
    color: #4d4d4d !important;
  }

  :deep(.jse-menu button:active .fa-icon),
  :deep(.jse-menu button:active svg),
  :deep(.jse-menu button.jse-selected .fa-icon),
  :deep(.jse-menu button.jse-selected svg) {
    color: #ffffff !important;
    fill: #ffffff !important;
  }

  :deep(.jse-text-mode .cm-editor) {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 13px;
  }

  :deep(.jse-status-bar) {
    background: #f5f7fa;
    border-top: 1px solid #ebeef5;
    color: #909399;
    font-size: 12px;
  }
}

/* ====== Copyright Footer ====== */
.main-copyright {
  text-align: center;
  padding: 6px 0;
  font-size: 11px;
  color: #c0c4cc;
  background: #f8f9fb;
  border-top: 1px solid #ebeef5;
  flex-shrink: 0;
}
</style>
