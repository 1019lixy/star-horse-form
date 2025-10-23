<script lang="ts" setup name="DynamicForm">
import {computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch,} from "vue";

import {
  apiInstance,
  loadData,
  operationConfirm,
  piniaInstance,
  useButtonPermissionStore,
  useDesignFormStore,
  useGlobalConfigStore,
  useSelfOperationStore,
  warning,
} from "star-horse-lowcode";
import {useRoute, useRouter} from "vue-router";
import {validDynamicFormCompParams} from "@/views/dyform/utils/preview";
import {delCacheData, getCacheData, setCacheData} from "@/api/cached_utils";
import {i18n} from "@/lang";
import {Config} from "@/api/settings";
import {compFieldInit} from "@/views/dyform/utils/FieldOperationUtils";

// Import new components
import CodeDialog from "@/views/dyform/dialogs/CodeDialog.vue";
import ConfigDialog from "@/views/dyform/dialogs/ConfigDialog.vue";
import BatchEditDialog from "@/views/dyform/dialogs/BatchEditDialog.vue";
import PreviewDialog from "@/views/dyform/dialogs/PreviewDialog.vue";
import FieldLayerDrawer from "@/views/dyform/dialogs/FieldLayerDrawer.vue";
import FormToolbar from "@/views/dyform/components/FormToolbar.vue";
import FormDesigner from "@/views/dyform/components/FormDesigner.vue";
import FieldPanel from "@/views/dyform/FieldPanel.vue";
import PropertyPanel from "@/views/dyform/PropertyPanel.vue";
// Import composables
import {useKeyboardEvents} from "@/views/dyform/composables/useKeyboardEvents";
import {useDialogManager} from "@/views/dyform/composables/useDialogManager";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = useDesignFormStore(piniaInstance);
let route = useRoute();
let router = useRouter();
let pagePermission = useButtonPermissionStore(piniaInstance);
let userOperation = useSelfOperationStore(piniaInstance);
let configStore = useGlobalConfigStore(piniaInstance);
let permissions = ref<any>({});
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
let initFinish = ref<boolean>(false);
let currentPageStyle = ref<any>({label: "电脑", key: "pc"});
let currentPageClass = ref<string>("main-design");
let cacheName = "dynamicFormCache";
let cacheData = ref<any>([]);

let shortKeySwitch: Function = () => {
};
const {dialogStates, openDialog, closeAllDialogs} = useDialogManager();

// Define actions function before using it in composables
const actions = (action: string) => {
  switch (action) {
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
    case "save":
      tableEdit(true);
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
    case "goBack":
      goBack();
      break;
  }
};

// Initialize composables after actions function is defined
const keyboardEvents = useKeyboardEvents(actions);
shortKeySwitch = keyboardEvents.shortKeySwitch;

const init = async () => {
  //初始化数据
  designForm.clearAll(true);
  cacheDataRestore(null);
  //加载组件属性
  compFieldInit().then(() => {
    initFinish.value = true;
    console.log("初始化完成");
    //解决数据已经加载完成，但是组件属性没有加载完成的问题
    if (list.value.length > 0) {
      let activeItem = list.value[0];
      designForm.selectItem(
          activeItem,
          activeItem.itemType,
          activeItem.compType,
      );
    }
  });
  permissions.value = await pagePermission.addRoute(route);
};

const propertyRef = ref();
const loadFormData = async (
    formId: any,
    isParent: boolean,
    isTemplate?: boolean,
) => {
  await nextTick();
  designForm.clearAll(false);
  let resultData: any = await loadData(dataUrl.loadByIdUrl! + "/" + formId, {});
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  let dynamicFormData: any = resultData.data;
  if (isParent) {
    dynamicFormData["idDynamicForm"] = null;
    dynamicFormData["parentId"] = formId;
    //数据编号一定要清空，否则数据会跳过重复验证
    dynamicFormData["dataNo"] = null;
    dynamicFormData["formId"] = dynamicFormData["formId"] + "Sub";
    dynamicFormData["tbName"] = dynamicFormData["tbName"] + "Sub";
  }
  if (dynamicFormData["relations"]) {
    dynamicFormData["relations"] = JSON.parse(dynamicFormData["relations"]);
  }

  let details = dynamicFormData["details"];
  if (isTemplate) {
    let times = new Date().getTime();
    dynamicFormData["idDynamicForm"] = undefined;
    dynamicFormData["parentId"] = undefined;
    dynamicFormData["dataNo"] = undefined;
    dynamicFormData["formId"] = "Id" + times + "Temp";
    dynamicFormData["tbName"] = "Tb" + times + "Temp";
    dynamicFormData["formName"] = undefined;
    dynamicFormData["datasourceConfigId"] = undefined;
    dynamicFormData["createMenu"] = "N";
    dynamicFormData["createTable"] = "N";
    details["idDynamicForm"] = undefined;
    details["idDynamicFormDetails"] = undefined;
    details["dataNo"] = undefined;
    details["tenantId"] = undefined;
    dynamicFormData["createdBy"] = undefined;
    dynamicFormData["updatedBy"] = undefined;
    dynamicFormData["createdTime"] = undefined;
    dynamicFormData["updatedTime"] = undefined;
    dynamicFormData["sysId"] = undefined;
    dynamicFormData["templateFlag"] = undefined;
    details["createdBy"] = undefined;
    details["updatedBy"] = undefined;
    details["createdTime"] = undefined;
    details["updatedTime"] = undefined;
  }
  dynamicFormData["details"] = {};
  designForm.setFormInfo(dynamicFormData);
  designForm.setCompList(JSON.parse(details?.content || "[]"));
  designForm.setFormData(JSON.parse(details?.fieldNames || "{}"));
  designForm.setIsEdit(true);
  let activeItem = list.value[0];
  //如果组件属性已经加载完成，则直接选中第一个组件
  if (activeItem && initFinish.value) {
    designForm.selectItem(activeItem, activeItem.itemType, activeItem.compType);
  }
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

const goBack = () => {
  let sdata = {
    path: "/dyform/DynamicFormUi",
    componentName: "DynamicFormUi",
  };
  router.push(sdata);
};

const onDragAdd = async (_evt: Event, dataList: Array<any>) => {
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

const isSubmit = ref(false);

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

const analysisParentParam = () => {
  let parentId = route.query["parentId"];
  if (parentId && "0" != parentId) {
    loadFormData(parentId, true);
  }
};

const analysisQueryParams = () => {
  let formId = route.query["formId"];
  if (formId) {
    loadFormData(formId, false);
    return;
  }
  analysisParentParam();
};

const loadTemplateData = (formId: string) => {
  loadFormData(formId, false, true);
};

const contextMenu = async (evt: MouseEvent) => {
  if (!isEdit.value) {
    console.log("当前处于预览状态，不能右键操作");
    return;
  }
  evt.preventDefault();
  evt.stopPropagation();
  await nextTick();
  contentMenuRef.value.show(evt);
};

/**
 * 数据操作
 * @param type 类别
 * @param data 选中的数据
 */
const changeDataHandle = (type: string, data: any) => {
  let formId = data["idDynamicForm"];
  if (type == "subAdd") {
    loadFormData(formId, true);
  } else if (type == "remove") {
  } else if (type == "edit") {
    loadFormData(formId, false);
  } else {
    console.log(type, data);
  }
};

onActivated(() => {
  analysisQueryParams();
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

watch(
    () => route.query,
    (val) => {
      if (val) {
        analysisQueryParams();
      }
    },
    {immediate: true, deep: true},
);

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

// Refs for child components
const configDialogRef = ref();
const contentMenuRef = ref();
const formListRef = ref();
const previewDialogRef = ref(); // Add this ref

// Add methods to call PreviewDialog functions
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

defineExpose({
  loadFormData,
  loadTemplateData,
  validatePreviewForm, // Expose validation method
  exportPreviewToHtml, // Expose export method
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Dialogs -->
    <CodeDialog
        :visible="dialogStates.codeDialogVisible"
        :compSize="compSize"
        @close="closeAction"
        @save="codeDoSave"
    />

    <ConfigDialog
        ref="configDialogRef"
        :visible="dialogStates.configDialogVisible"
        :compSize="compSize"
        @close="closeAction"
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

    <el-card class="inner_content my-0 mx-[5px]">
      <el-splitter>
        <el-splitter-panel collapsible size="350" min="200" max="450">
          <field-panel
              ref="fieldPanelRef"
              @loadData="loadTemplateData"
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
                @styleChange="actionsStyle"
                @cacheRestore="cacheDataRestore"
                @contextMenu="contextMenu"
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
                @change="changeDataHandle"
                :dataUrl="dataUrl"
                primaryKey="idDynamicForm"
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
    </el-card>
  </div>
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
