<script lang="ts" setup name="DynamicForm">
import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch,
} from 'vue';

import {
  apiInstance,
  closeLoad,
  error,
  itemCheck,
  load,
  loadData,
  operationConfirm,
  piniaInstance,
  postRequest,
  success,
  useButtonPermissionStore,
  useDesignFormStore,
  useGlobalConfigStore,
  useSelfOperationStore,
  uuid,
  warning,
} from 'star-horse-lowcode';
import { useRoute, useRouter } from 'vue-router';
import { validDynamicFormCompParams } from '@/views/dyform/utils/preview';
import { delCacheData, getCacheData, setCacheData } from '@/api/cached_utils';
import { i18n } from '@/lang';
import { Config } from '@/api/settings';
import {
  initKeyboardEvent,
  removeKeyboardEvent,
} from '@/api/keyboard-event-utils';
import { ModuleEnums } from '@/components/enums/ModuleEnums';
import { compFieldInit } from '@/views/dyform/utils/FieldOperationUtils';
import { dynamicFormContextMenuData } from '@/plugins/AblesPlugin.ts';
import {
  dynamicFormHelpMessage,
  formActions,
} from '@/views/dyform/utils/DynamicForm.ts';

const dataUrl = apiInstance('userdb-manage', 'userdb/dynamicForm');
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
let batchEditFieldVisible = computed(() => designForm.batchEditFieldVisible);
let activeTab = ref<any>('first');
let errMessage = ref<string>('');
let formData = computed(() => designForm.formData);
let formInfo = computed(() => designForm.formInfo);
const isDragging = computed(() => designForm.isDragging);
let shortKeyDisabled = computed(() => designForm.shortKeyDisabled);
const fieldPanelRef = ref();
const dynamicFormRef = ref();
const previewDynamicFormRef = ref();
let reOrUnDoFlag = ref<boolean>(false);
let initFinish = ref<boolean>(false);
let currentPageStyle = ref<any>({ label: '电脑', key: 'pc' });
let currentPageClass = ref<string>('main-design');
let cacheData = ref<any>('');
let cacheName = 'dynamicFormCache';
const init = async () => {
  //初始化数据
  designForm.clearAll(true);
  //加载组件属性
  compFieldInit().then(() => {
    initFinish.value = true;
    console.log('初始化完成');
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
  cacheData.value = getCacheData(cacheName);
};
const propertyRef = ref();
const loadFormData = async (
  formId: any,
  isParent: boolean,
  isTemplate?: boolean,
) => {
  await nextTick();
  designForm.clearAll(false);
  let resultData: any = await loadData(dataUrl.loadByIdUrl! + '/' + formId, {});
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  let dynamicFormData: any = resultData.data;
  if (isParent) {
    dynamicFormData['idDynamicForm'] = null;
    dynamicFormData['parentId'] = formId;
    //数据编号一定要清空，否则数据会跳过重复验证
    dynamicFormData['dataNo'] = null;
    dynamicFormData['formId'] = dynamicFormData['formId'] + 'Sub';
    dynamicFormData['tbName'] = dynamicFormData['tbName'] + 'Sub';
  }
  if (dynamicFormData['relations']) {
    dynamicFormData['relations'] = JSON.parse(dynamicFormData['relations']);
  }

  let details = dynamicFormData['details'];
  if (isTemplate) {
    let times = new Date().getTime();
    dynamicFormData['idDynamicForm'] = undefined;
    dynamicFormData['parentId'] = undefined;
    dynamicFormData['dataNo'] = undefined;
    dynamicFormData['formId'] = 'Id' + times + 'Temp';
    dynamicFormData['tbName'] = 'Tb' + times + 'Temp';
    dynamicFormData['formName'] = undefined;
    dynamicFormData['datasourceConfigId'] = undefined;
    dynamicFormData['createMenu'] = 'N';
    dynamicFormData['createTable'] = 'N';
    details['idDynamicForm'] = undefined;
    details['idDynamicFormDetails'] = undefined;
    details['dataNo'] = undefined;
    details['tenantId'] = undefined;
    dynamicFormData['createdBy'] = undefined;
    dynamicFormData['updatedBy'] = undefined;
    dynamicFormData['createdTime'] = undefined;
    dynamicFormData['updatedTime'] = undefined;
    dynamicFormData['sysId'] = undefined;
    dynamicFormData['templateFlag'] = undefined;
    details['createdBy'] = undefined;
    details['updatedBy'] = undefined;
    details['createdTime'] = undefined;
    details['updatedTime'] = undefined;
  }
  dynamicFormData['details'] = {};
  designForm.setFormInfo(dynamicFormData);
  designForm.setCompList(JSON.parse(details?.content || '[]'));
  designForm.setFormData(JSON.parse(details?.fieldNames || '{}'));
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
  configDialogVisible.value = false;
  codeDialogVisible.value = false;
  designForm.setShortKeyDisabled(false);
};
const clearData = (flag: boolean = true) => {
  if (list.value?.length > 0) {
    operationConfirm('新建将清空舞台上的所有元素，是否确定要清空？').then(
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
const formPropertyRef = ref();
/**
 * 代码操作
 */
const codeDoSave = () => {};
/**
 * 创建表单信息
 */
const createFormInfo = () => {
  let dynameForm = JSON.parse(JSON.stringify(formInfo.value));
  //解决多次转换
  dynameForm!['relations'] =
    dynameForm['relations'] && dynameForm['relations'] instanceof Array
      ? JSON.stringify(dynameForm['relations'])
      : dynameForm['relations'];
  dynameForm!['details'] = {};
  dynameForm!['details']['content'] = JSON.stringify(list.value);
  dynameForm!['details']['fieldNames'] = '{}'; //JSON.stringify(formData.value);
  return dynameForm;
};
const doSave = async (isDraft: boolean = false) => {
  let formData = formPropertyRef.value.getFormData();
  designForm.setFormInfo(formData.value);
  if (!isSubmit.value) {
    closeAction();
    return;
  }

  let flag = false;
  await nextTick();
  if (!isDraft) {
    errMessage.value = validDynamicFormCompParams(list.value, true);
    if (errMessage.value) {
      warning(errMessage.value);
      return;
    }
  }
  await formPropertyRef.value.$refs.dynamicFormItemRef.$refs.starHorseFormRef.validate(
    (evt: boolean) => {
      flag = evt;
    },
  );
  if (!flag) {
    warning('请先填写表单信息');
    return;
  }
  load('数据提交中，请等待');
  postRequest(
    `${dataUrl.basePrefix}/${isDraft ? 'mergeDraft' : 'merge'}`,
    createFormInfo(),
  )
    .then((res: any) => {
      if (res.data.code != 0) {
        activeTab.value = 'second';
        warning(res.data.cnMessage);
        return;
      }
      closeAction();
      delCacheData(cacheName);
      //添加成功清空缓存
      designForm.clearAll(false);
      success(res.data.cnMessage);
      //添加成功后是否还要继续添加，
      // operationConfirm(res.data.cnMessage + ",是否继续留在当前页面")
      //     .then((cfm: boolean) => {
      //       if (cfm) {
      //         analysisParentParam();
      //       }
      //     })
      //     .catch(() => {
      //       goBack();
      //     });
    })
    .catch((err: any) => {
      closeAction();
      error('操作异常:' + err);
    })
    .finally(() => {
      closeLoad();
    });
};
const goBack = () => {
  let sdata = {
    path: '/dyform/DynamicFormUi',
    componentName: 'DynamicFormUi',
  };
  router.push(sdata);
};
const formInfoChange = (_data: any) => {};
const scrollHandler = (e: CustomEvent) => {
  const customEvent = e as CustomEvent;
  nextTick(() => {
    const target = document.querySelector(
      `[data-field-id="${customEvent.detail}"]`,
    );
    target?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    });
  });
};
// 在组件顶部添加响应式引用
const keyboardHandlers = ref<{ keydown: Function; keyup: Function }>();

/**
 * 开启或者关闭快捷键
 * @param val
 */
const shortKeySwitch = (val: boolean) => {
  if (val) {
    keyboardHandlers.value = initKeyboardEvent(
      actions,
      ModuleEnums.DYNAMIC_FORM,
    );
    window.addEventListener('scroll-to-field', scrollHandler as EventListener);
  } else {
    if (keyboardHandlers.value) {
      removeKeyboardEvent(keyboardHandlers.value);
    }
    window.removeEventListener(
      'scroll-to-field',
      scrollHandler as EventListener,
    );
  }
};
const onDragAdd = async (_evt: Event, dataList: Array<any>) => {
  if (!draggingItem.value) {
    return;
  }
  if (Array.isArray(draggingItem.value)) {
    let temp = draggingItem.value[draggingItem.value.length - 1];
    designForm.selectItem(temp, temp['itemType'], '');
  } else {
    designForm.selectItem(
      draggingItem.value,
      draggingItem.value['itemType'],
      '',
    );
  }
};
const createCode = () => {
  codeDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  shortKeySwitch(false);
};
const batchEdit = () => {
  designForm.setBatchEditFieldVisible(true);
  designForm.setShortKeyDisabled(true);
};
const configDialogVisible = ref(false);
const codeDialogVisible = ref(false);
const isSubmit = ref(false);

const tableEdit = async (submit: boolean) => {
  isSubmit.value = submit;
  configDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  await nextTick(() => {
    formPropertyRef.value.analysisDynamicFields(createFormInfo());
  });
};

let leftPanelVisible = ref<boolean>(true);
let rightPanelVisible = ref<boolean>(true);

//页面风格
const actionsStyle = (item: any) => {
  currentPageStyle.value = item;
  if (item.key == 'pad') {
    currentPageClass.value = 'main-design-pad';
  } else if (item.key == 'phone') {
    currentPageClass.value = 'main-design-phone';
  } else {
    currentPageClass.value = 'main-design';
  }
};
const cacheDataRestore = (evt: MouseEvent) => {
  evt.stopPropagation();
  designForm.clearAll(true);
  if (cacheData.value) {
    try {
      designForm.setFormInfo(JSON.parse(cacheData.value));
    } catch (e) {
      designForm.setCompList(cacheData.value);
    }
    cacheData.value = '';
  }
};
const formFieldLayer = ref<boolean>(false);
const viewFieldLayer = () => {
  shortKeySwitch(false);
  formFieldLayer.value = true;
};
const actions = (action: string) => {
  switch (action) {
    case 'leftPanel':
      leftPanelVisible.value = !leftPanelVisible.value;
      break;
    case 'rightPanel':
      rightPanelVisible.value = !rightPanelVisible.value;
      break;
    case 'new':
    case 'empty':
      clearData(false);
      break;
    case 'eprep':
      batchEdit();
      break;
    case 'layer':
      viewFieldLayer();
      break;
    case 'save':
      tableEdit(true);
      break;
    case 'preview':
      preview();
      break;
    case 'valid':
      errMessage.value = validDynamicFormCompParams(list.value);
      if (errMessage.value) {
        warning(errMessage.value);
      }
      break;
    case 'code':
      createCode();
      break;
    case 'undo':
      reOrUnDoFlag.value = true;
      designForm.undo();
      break;
    case 'redo':
      reOrUnDoFlag.value = true;
      designForm.redo();
      break;
    case 'goBack':
      goBack();
      break;
  }
};

const analysisParentParam = () => {
  let parentId = route.query['parentId'];
  if (parentId && '0' != parentId) {
    loadFormData(parentId, true);
  }
};
const analysisQueryParams = () => {
  let formId = route.query['formId'];
  if (formId) {
    loadFormData(formId, false);
    return;
  }
  analysisParentParam();
};
const loadTemplateData = (formId: string) => {
  loadFormData(formId, false, true);
};
const contentMenuRef = ref();
const contextMenu = async (evt: MouseEvent) => {
  if (!isEdit.value) {
    console.log('当前处于预览状态，不能右键操作');
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
  console.log(type, data);
  let formId = data['idDynamicForm'];
  if (type == 'subAdd') {
    loadFormData(formId, true);
  } else if (type == 'remove') {
  } else if (type == 'edit') {
    loadFormData(formId, false);
  } else {
    console.log(type, data);
  }
};
/**
 * 键盘事件
 * @param evt
 */

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
  { immediate: true, deep: true },
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
let prepsModel = ref('one');
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialogVisible="codeDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :source="3"
      :full-screen="true"
      :compSize="compSize"
      @merge="codeDoSave"
      :title="'代码'"
    >
      <code-comp />
    </star-horse-dialog>
    <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="doSave(false)"
      :title="'表单配置'"
    >
      <FormPropertyPanel ref="formPropertyRef" />
      <template #extend>
        <el-button
          @click="doSave(true)"
          style="
            background: var(--star-horse-style);
            color: var(--star-horse-white);
          "
          :size="compSize"
        >
          <star-horse-icon
            icon-class="short_save"
            cursor="pointer"
            style="color: var(--star-horse-white)"
          />
          暂存
        </el-button>
      </template>
    </star-horse-dialog>
    <star-horse-dialog
      :dialogVisible="batchEditFieldVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="closeAction"
      :title="'批量修改属性'"
    >
      <el-tabs v-model="prepsModel">
        <el-tab-pane
          name="one"
          label="业务字段"
          class="flex overflow-hidden flex-col"
        >
          <batch-edit-fields :compSize="compSize" />
        </el-tab-pane>
        <el-tab-pane name="two" label="公共字段">
          在配置或者提交功能里设置</el-tab-pane
        >
      </el-tabs>
    </star-horse-dialog>
    <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      :title="'表单预览'"
      :source="3"
    >
      <form-preview :list="list" />
    </star-horse-dialog>
    <el-card class="inner_content my-0 mx-[5px]">
      <el-splitter>
        <el-splitter-panel collapsible size="280" min="200" max="350">
          <field-panel
            ref="fieldPanelRef"
            @loadData="loadTemplateData"
            :batchCreatePage="true"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <div class="main-design-outer">
            <div class="inner_button">
              <el-menu
                mode="horizontal"
                :ellipsis="false"
                style="height: inherit; width: 100%"
              >
                <template v-for="(item, index) in formActions">
                  <el-menu-item
                    v-if="
                      (list.length > 0 || item.defaultEdit) &&
                      (item.auth == 'none' || permissions[item.auth]) &&
                      !item.children
                    "
                    :index="'1_' + index"
                    @click="actions(item.key)"
                  >
                    <el-tooltip
                      class="item"
                      :content="item.label"
                      effect="dark"
                      placement="bottom"
                    >
                      <star-horse-icon
                        :icon-class="item.icon"
                        size="24px"
                        style="color: var(--star-horse-style)"
                      />
                    </el-tooltip>
                  </el-menu-item>
                  <template v-if="item.children && item.children.length > 0">
                    <el-sub-menu :index="'1_' + index">
                      <template #title>
                        <el-tooltip
                          class="item"
                          :content="currentPageStyle.label"
                          effect="dark"
                          placement="bottom"
                        >
                          <star-horse-icon
                            :icon-class="item.icon"
                            size="24px"
                            style="color: var(--star-horse-style)"
                          />
                        </el-tooltip>
                      </template>
                      <el-menu-item
                        v-for="(sitem, sindex) in item.children"
                        :index="'2_' + sindex"
                        @click="actionsStyle(sitem)"
                      >
                        <star-horse-icon
                          :icon-class="sitem.icon"
                          size="24px"
                          style="color: var(--star-horse-style)"
                        />
                        {{ sitem.label }}
                      </el-menu-item>
                    </el-sub-menu>
                  </template>
                </template>
              </el-menu>
              <el-tooltip
                content="恢复缓存数据"
                v-if="cacheData && cacheData.length > 0"
              >
                <star-horse-icon
                  icon-class="reset"
                  @click="cacheDataRestore($event)"
                />
              </el-tooltip>
              <help :message="dynamicFormHelpMessage" />
            </div>
            <sh-form
              ref="dynamicFormRef"
              :needScroller="false"
              class="design-form-container"
              :class="{ 'dragging-area': isDragging }"
              :disabled="formInfo['disabled'] == 'Y'"
              :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'Y'"
              :inline="formInfo.inline == 'Y'"
              :inline-message="formInfo['inlineMessage'] == 'Y'"
              :label-position="formInfo['labelPosition']"
              :label-suffix="formInfo['labelSuffix']"
              :label-width="formInfo['labelWidth']"
              v-model:dataForm="formData"
              :require-asterisk-position="formInfo['requireAsteriskPosition']"
              :rules="formInfo.rules || {}"
              :scroll-to-error="formInfo['scrollToError'] == 'Y'"
              :show-message="formInfo['showMessage'] == 'Y'"
              :size="'default'"
              :status-icon="formInfo['statusIcon'] == 'Y'"
              :validate-on-rule-change="formInfo['validateOnRuleChange'] == 'Y'"
              style="width: 100% !important"
            >
              <template v-if="list.length === 0">
                <div class="empty-info">
                  请从左侧组件库中选择一个组件,
                  然后用鼠标双击或者拖动该组件放置于此处
                </div>
              </template>
              <div
                :class="currentPageClass"
                style="overflow: auto; scrollbar-width: thin"
                @contextmenu="contextMenu"
              >
                <draggable
                  @add="(evt: Event) => onDragAdd(evt, list)"
                  style="width: 98%; height: 100%; margin: 0 auto"
                  tag="div"
                  group="starHorseGroup"
                  ghost-class="ghost"
                  :list="list"
                  :itemKey="uuid()"
                >
                  <template #item="{ element: data, index }">
                    <div
                      :class="{ 'comp-item': data.preps?.headerFlag == 'Y' }"
                      class="overflow-visible"
                      :data-field-id="data.id"
                      :key="data.id"
                    >
                      <component
                        :key="data.id"
                        :field="data"
                        :isDesign="true"
                        :formInfo="formInfo"
                        :showFormItem="true"
                        :index-of-parent-list="index"
                        :is="itemCheck(data)"
                        v-model:formData="formData"
                      />
                    </div>
                  </template>
                </draggable>
              </div>
            </sh-form>
            <Teleport to="body">
              <ContentMenu
                ref="contentMenuRef"
                :menu-data="dynamicFormContextMenuData({}, {})"
              />
            </Teleport>
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
          :size="list.length > 0 ? 280 : 0"
          min="260"
          max="500"
          class="!overflow-hidden"
        >
          <el-scrollbar>
            <item-properties-panel ref="propertyRef" />
          </el-scrollbar>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
    <el-drawer
      v-model="formFieldLayer"
      direction="ltr"
      size="20%"
      :with-header="false"
      :show-close="false"
    >
      <template #header>
        <h4>表单属性层级</h4>
      </template>
      <template #default>
        <FieldLayer />
      </template>
    </el-drawer>
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

.empty-info {
  position: absolute;
  left: 0;
  right: 0;
  top: 30px;
  bottom: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  color: #999999;
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
