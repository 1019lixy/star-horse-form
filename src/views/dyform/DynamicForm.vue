<script lang="ts" setup name="DynamicForm">
import FieldPanel from "@/views/dyform/FieldPanel.vue";
import {computed, nextTick, onActivated, onBeforeUnmount, onDeactivated, onMounted, reactive, ref, watch} from "vue";
import PropertyPanel from "@/views/dyform/PropertyPanel.vue";
import {postRequest} from "@/api/star_horse";
import {confirm, error, warning} from "@/utils/message";
import {useRoute, useRouter} from "vue-router";
import {apiInstance, closeLoad, load, loadData} from "@/api/sh_api";
import FieldAnalysis from "@/views/dyform/FieldAnalysis.vue";
import FormPropertyPanel from "@/views/dyform/FormPropertyPanel.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import Help from "@/components/help.vue";
import {dynamicFormHelpMessage, formActions} from "@/views/dyform/utils/DynamicForm.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import {validDynamicFormCompParams} from "@/views/dyform/utils/preview.ts";
import CodeComp from "@/views/dyform/code/CodeComp.vue";
import {useButtonPermission} from "@/store/ButtonPermissionStore.ts";
import {useUserSelfOperation} from "@/store/SelfOperationStore.ts";
import {batchModifyAction} from "@/api/system.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import {delCacheData, getCacheData, setCacheData} from "@/api/cached_utils.ts";
import {i18n} from "@/lang";
import {Config} from "@/api/settings.ts";
import FormPreview from "@/views/dyform/FormPreview.vue";
import {initKeyboardEvent, removeKeyboardEvent} from "@/api/keyboard-event-utils.ts";
import {dynamicFormContextMenuData} from "@/views/dyform/page/AblesPlugin.ts";
import {ModuleEnums} from "@/components/enums/ModuleEnums.ts";

const dataUrl = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = DesignForm(piniaInstance);
let route = useRoute();
let router = useRouter();
let pagePermission = useButtonPermission(piniaInstance);
let userOperation = useUserSelfOperation(piniaInstance);
let configStore = GlobalConfig(piniaInstance);
let permissions = ref<any>({});
let compSize = computed(() => configStore.configFormInfo?.buttonSize || Config.compSize);
let draggingItem = computed(() => designForm.draggingItem);
let list = computed(() => designForm.compList);
let isPreview = computed(() => designForm.previewVisible);
let batchEditFieldVisible = computed(() => designForm.batchEditFieldVisible);
let activeTab = ref<any>("first");
let errMessage = ref<string>("");
let formData = computed(() => designForm.formData);
let formInfo = computed(() => designForm.formInfo);
let shortKeyDisabled = computed(() => designForm.shortKeyDisabled);
const fieldPanelRef = ref();
const dynamicFormRef = ref();
const previewDynamicFormRef = ref();
let reOrUnDoFlag = ref<boolean>(false);
let currentPageStyle = ref<any>({label: "电脑", key: "pc"});
let currentPageClass = ref<string>("main-design");
let cacheData = ref<any>("");
let cacheName = "dynamicFormCache";
const init = async () => {
  permissions.value = await pagePermission.addRoute(route);
  designForm.clearAll(true);
  cacheData.value = getCacheData(cacheName);
};
const propertyRef = ref();
const loadFormData = async (formId: any, isParent: boolean) => {
  await nextTick();
  designForm.clearAll(false);
  let resultData: any = await loadData(dataUrl.loadByIdUrl! + "/" + formId, {});
  if (resultData.error) {
    warning(resultData.error);
    return;
  }
  let data = resultData.data;
  if (isParent) {
    data["idDynamicForm"] = null;
    data["parentId"] = formId;
    //数据编号一定要清空，否则数据会跳过重复验证
    data["dataNo"] = null;
    data["formId"] = data["formId"] + "Sub";
    data["tbName"] = data["tbName"] + "Sub";
  }
  if (data["relations"]) {
    data["relations"] = JSON.parse(data["relations"]);
  }
  let details = data["details"];
  data["details"] = {};
  designForm.setFormInfo(data);
  designForm.setCompList(JSON.parse(details?.content || "[]"));
  designForm.setFormData(JSON.parse(details?.fieldNames || "{}"));
  designForm.setIsEdit(true);
  let activeItem = list.value[0];
  if (activeItem) {
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
    confirm("新建将清空舞台上的所有元素，是否确定要清空？").then((res: boolean) => {
      if (res) {
        designForm.clearAll(flag);
        delCacheData(cacheName);
      }
    })
  } else {
    designForm.clearAll(flag);
  }
};
const preview = async () => {
  designForm.setPreviewVisible(true);
  designForm.setIsEdit(false);
  designForm.setShortKeyDisabled(true);
  await nextTick();
  userOperation.setFormInstance(previewDynamicFormRef);
  list.value.forEach((item: any) => {
    userOperation.addFormItem(item);
  })
};
const formPropertyRef = ref();
/**
 * 代码操作
 */
const codeDoSave = () => {
};
/**
 * 创建表单信息
 */
const createFormInfo = () => {
  let dynameForm = JSON.parse(JSON.stringify(formInfo.value));
  console.log(dynameForm);
  //解决多次转换
  dynameForm!["relations"] = (dynameForm["relations"] && dynameForm["relations"] instanceof Array) ?
      JSON.stringify(dynameForm["relations"]) : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(list.value);
  dynameForm!["details"]["fieldNames"] = "{}";//JSON.stringify(formData.value);
  return dynameForm;
}
const doSave = async (isDraft: boolean = false) => {
  let formData = formPropertyRef.value.getFormData();
  console.log(formData);
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
  await formPropertyRef.value.$refs.dynamicFormItemRef.$refs.starHorseFormRef.validate((evt: boolean) => {
    flag = evt;
  });
  if (!flag) {
    warning("请先填写表单信息");
    return;
  }

  load("数据提交中，请等待");
  postRequest(`/userdb-manage/userdb/dynamicForm/${isDraft ? "mergeDraft" : "merge"}`, createFormInfo())
      .then((res) => {
        if (res.data.code != 0) {
          activeTab.value = "second";
          warning(res.data.cnMessage);
          return;
        }
        closeAction();
        delCacheData(cacheName);
        //添加成功清空缓存
        designForm.clearAll(false);
        //添加成功后是否还要继续添加，
        confirm(res.data.cnMessage + ",是否继续留在当前页面").then((cfm: boolean) => {
          if (cfm) {
            analysisParentParam();
          }
        }).catch(() => {
          goBack();
        });
      }).catch((err) => {
    activeTab.value = "second";
    closeAction();
    error("操作异常:" + err);
  }).finally(() => {
    closeLoad();
  });
};
const goBack = () => {
  let sdata = {
    path: "/dyform/DynamicFormUi",
    componentName: "DynamicFormUi",
  };
  router.push(sdata);
}
const formInfoChange = (_data: any) => {
};
/**
 * 开启或者关闭快捷键
 * @param val
 */
const shortKeySwitch = (val: boolean) => {
  if (val) {
    initKeyboardEvent(actions, ModuleEnums.DYNAMIC_FORM);
  } else {
    removeKeyboardEvent(actions, ModuleEnums.DYNAMIC_FORM);
  }
}
const onDragAdd = async (_evt: Event, dataList: Array<any>) => {
  // let index = evt.oldIndex;
  if (draggingItem.value.itemType == 'table') {
    let id = draggingItem.value.id;
    let datas = dataList.filter(item => item.itemType == "table");
    if (datas.length > 1) {
      warning("同级容器中只能添加一次动态列表组件");
      for (let i = 0; i < dataList.length; i++) {
        let temp = dataList[i];
        if (temp.id == id) {
          dataList.splice(i, 1);
          break;
        }
      }
    }
  }
  if (!draggingItem.value) {
    return;
  }
  if (draggingItem.value instanceof Array) {
    let temp = draggingItem.value[draggingItem.value.length - 1];
    designForm.selectItem(temp, temp["itemType"], "");
  } else {
    designForm.selectItem(draggingItem.value, draggingItem.value["itemType"], "");
  }
};
const createCode = () => {
  codeDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
};
const batchEdit = () => {
  designForm.setBatchEditFieldVisible(true);
  designForm.setShortKeyDisabled(true);
};
const configDialogVisible = ref(false);
const codeDialogVisible = ref(false);
const isSubmit = ref(false);
let batchModifyData = reactive<any>({
  maxLength: 100,
  precision: 0,
  required: "N",
  formVisible: "Y",
  searchVisible: "Y",
  listVisible: "Y"
});
const tableEdit = async (submit: boolean) => {
  isSubmit.value = submit;
  configDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  await nextTick(() => {
    formPropertyRef.value.analysisDynamicFields(createFormInfo());
  })
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
}
const cacheDataRestore = (evt: MouseEvent) => {
  evt.stopPropagation();
  designForm.clearAll(true);
  if (cacheData.value) {
    try {
      designForm.setFormInfo(JSON.parse(cacheData.value));
    } catch (e) {
      designForm.setCompList(cacheData.value);
    }
    cacheData.value = "";
  }
}
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
    case "tprep":
      tableEdit(false);
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
const batchOperation = (val: any, fieldName: string) => {
  batchModifyAction(list.value, val, fieldName);
}
const analysisParentParam = () => {
  let parentId = route.query["parentId"];
  if (parentId && "0" != parentId) {
    // console.log(parentId);
    loadFormData(parentId, true);
  }
}
const analysisQueryParams = () => {
  let formId = route.query["formId"];
  if (formId) {
    // console.log(formId);
    loadFormData(formId, false);
    return;
  }
  analysisParentParam();
}
const contentMenuRef = ref();
const contextMenu = async (evt: MouseEvent) => {
  evt.preventDefault();
  evt.stopPropagation();
  await nextTick();
  contentMenuRef.value.show(evt);
}
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
})
watch(
    () => route.query,
    (val) => {
      if (val) {
        analysisQueryParams()
      }
    },
    {immediate: true, deep: true}
);

watch(() => list.value,
    (val: any) => {
      designForm.removePromise();
      designForm.setRefresh();
      designForm.addHistoryRecord(reOrUnDoFlag.value);
      reOrUnDoFlag.value = false;
      userOperation.setFormInstance(dynamicFormRef);
      userOperation.setFormData(formData);
      userOperation.addFormItemList(val);
      setCacheData(cacheName, val);
    }, {
      immediate: false,
      deep: true
    }
);

onMounted(async () => {
  await init();
  shortKeySwitch(true);
});
let prepsModel = ref("one");
</script>
<template>
  <star-horse-dialog
      :dialogVisible="codeDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :isView="true"
      :full-screen="true"
      :compSize="compSize"
      @merge="codeDoSave"
      :title="'代码'"
  >
    <code-comp/>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="doSave(false)"
      :title="'表单配置'"
  >
    <FormPropertyPanel ref="formPropertyRef"/>
    <template #extand>
      <el-button @click="doSave(true)"
                 style="background: var(--star-horse-style);color: var(--star-horse-white)" :size="compSize">
        <star-horse-icon icon-class="short_save" style="color:var(--star-horse-white);"/>
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
      <el-tab-pane name="one" label="业务字段">
        <el-row style="font-weight: bold;font-size:12px;margin: 5px 0;">
          <el-col :span="3">容器名称</el-col>
          <el-col :span="3">标签名称</el-col>
          <el-col :span="3">属性名称</el-col>
          <el-col :span="3">最大长度/精度</el-col>
          <el-col :span="3">是否必须</el-col>
          <el-col :span="2">表单显示</el-col>
          <el-col :span="2">查询显示</el-col>
          <el-col :span="2">列表显示</el-col>
          <el-col :span="3">默认值</el-col>
        </el-row>
        <el-row style="font-weight: bold;font-size:12px;margin: 10px 0;">
          <el-col :span="3">批量设置</el-col>
          <el-col :span="2">--</el-col>
          <el-col :span="2">--</el-col>
          <el-col :span="5">
            <el-row>
              <el-col :span="12">
                <el-input-number v-model="batchModifyData.maxLength" controls-position="right" :size="compSize"
                                 @change="(val:any)=>batchOperation(val,'maxLength')" placeholder="字段长度"
                                 clearable/>
              </el-col>
              <el-col :span="12">
                <el-input-number v-model="batchModifyData.precision" controls-position="right" :size="compSize"
                                 @change="(val:any)=>batchOperation(val,'precision')" placeholder="精度" clearable/>
              </el-col>
            </el-row>
          </el-col>
          <el-col :span="3">
            <el-switch v-model="batchModifyData.required" :size="compSize"
                       @change="(val:any)=>batchOperation(val,'required')" active-value="Y" active-text="是"
                       inactive-value="N"
                       inactive-text="否"/>
          </el-col>
          <el-col :span="2">
            <el-switch v-model="batchModifyData.formVisible" :size="compSize"
                       @change="(val:any)=>batchOperation(val,'formVisible')" active-value="Y" active-text="是"
                       inactive-value="N"
                       inactive-text="否"/>
          </el-col>
          <el-col :span="2">
            <el-switch v-model="batchModifyData.searchVisible" :size="compSize"
                       @change="(val:any)=>batchOperation(val,'searchVisible')" active-value="Y" active-text="是"
                       inactive-value="N"
                       inactive-text="否"/>
          </el-col>
          <el-col :span="2">
            <el-switch v-model="batchModifyData.listVisible" :size="compSize"
                       @change="(val:any)=>batchOperation(val,'listVisible')" active-value="Y" active-text="是"
                       inactive-value="N"
                       inactive-text="否"/>
          </el-col>
          <el-col :span="3"></el-col>
        </el-row>
        <el-divider content-position="center" content="字段信息" style="margin: 5px 0 !important;"/>
        <template v-for="(item,index) in list">
          <template v-if="item.compType=='container'" v-for="sitem in item.preps['elements']">
            <template v-for="sitem1 in sitem['columns']">
              <template v-for="(sitem2,sindex) in sitem1.items">
                <FieldAnalysis :index="index+sindex+1" :size="compSize" :field="sitem2"
                               :container="item.preps.label"/>
              </template>
            </template>
            <template v-for="(sitem2,sindex) in sitem.items">
              <FieldAnalysis :index="index+sindex+1" :size="compSize" :field="sitem2"
                             :container="sitem.label||item.preps.label"/>
            </template>
          </template>
          <FieldAnalysis :index="index+1" :field="item" :size="compSize"
                         v-if="item.compType=='formItem'" :container="'--'"/>
        </template>

      </el-tab-pane>
      <el-tab-pane name="two" label="公共字段">

      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="isPreview" @closeAction="closeAction" :selfFunc="true" :compSize="compSize" :title="'表单预览'"
      :is-view="true">
    <form-preview :list="list"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="form_content">
      <div class="side-panel" v-show="leftPanelVisible">
        <field-panel ref="fieldPanelRef"/>
      </div>
      <div class="form-main">
        <div class="inner_button">
          <el-menu mode="horizontal" :ellipsis="false" style="height: inherit;width: 100%;">
            <template v-for="(item,index) in formActions">
              <el-menu-item
                  v-if="(list.length>0||item.defaultEdit)&&(item.auth=='none'||permissions[item.auth])&&!item.children"
                  :index="'1_'+index" @click="actions(item.key)">
                <el-tooltip class="item" :content="item.label" effect="dark" placement="bottom">
                  <star-horse-icon :icon-class="item.icon" size="24px"
                                   style="color: var(--star-horse-style)"/>
                </el-tooltip>
              </el-menu-item>
              <template v-if="item.children&&item.children.length>0">
                <el-sub-menu :index="'1_'+index">
                  <template #title>
                    <el-tooltip class="item" :content="currentPageStyle.label" effect="dark" placement="bottom">
                      <star-horse-icon :icon-class="item.icon" size="24px" style="color: var(--star-horse-style)"/>
                    </el-tooltip>
                  </template>
                  <el-menu-item v-for="(sitem,sindex) in item.children" :index="'2_'+sindex"
                                @click="actionsStyle(sitem)">
                    <star-horse-icon :icon-class="sitem.icon" size="24px"
                                     style="color: var(--star-horse-style)"/>
                    {{ sitem.label }}
                  </el-menu-item>
                </el-sub-menu>
              </template>
            </template>
          </el-menu>
          <el-tooltip content="恢复缓存数据" v-if="cacheData&&cacheData.length>0">
            <star-horse-icon icon-class="reset" @click="cacheDataRestore($event)"/>
          </el-tooltip>
          <help :message="dynamicFormHelpMessage"/>
        </div>
        <div class="main-design-a">
          <div class="main-design-outer" @contextmenu="contextMenu">
            <el-form
                ref="dynamicFormRef"
                class="design-form-container"
                :disabled="formInfo['disabled'] == 'Y'"
                :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'Y'"
                :inline="formInfo.inline == 'Y'"
                :inline-message="formInfo['inlineMessage'] == 'Y'"
                :label-position="formInfo['labelPosition']"
                :label-suffix="formInfo['labelSuffix']"
                :label-width="formInfo['labelWidth']"
                :model="formData"
                :require-asterisk-position="formInfo['requireAsteriskPosition']"
                :rules="formInfo.rules"
                :scroll-to-error="formInfo['scrollToError'] == 'Y'"
                :show-message="formInfo['showMessage'] == 'Y'"
                :size="formInfo['size']"
                :status-icon="formInfo['statusIcon'] == 'Y'"
                :validate-on-rule-change="formInfo['validateOnRuleChange']=='Y'"
            >
              <draggable
                  @add="(evt:Event) => onDragAdd(evt, list)"
                  :class="currentPageClass"
                  tag="div"
                  group="starHorseGroup"
                  ghostClass="ghost"
                  animation="300"
                  :list="list"
              >
                <template #item="{element:data}">
                  <div :class="{'comp-item':data?.preps['headerFlag']!='Y'}"
                       :style="{'height': data.itemType=='tab'?'500px':'unset'}">
                    <component
                        :key="data.id"
                        :field="data"
                        :isDesign="true"
                        :formInfo="formInfo"
                        :is="data.itemType +(data.compType === 'container'? '-container':'-item')"
                        :formData="formData"
                    />
                  </div>
                </template>
              </draggable>
            </el-form>
            <Teleport to="body">
              <ContentMenu ref="contentMenuRef" :menu-data="dynamicFormContextMenuData({},{})"/>
            </Teleport>
          </div>
          <div class="side-panel-item" v-show="rightPanelVisible">
            <property-panel
                :activeTab="activeTab"
                @formInfoChange="formInfoChange"
                ref="propertyRef"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="main-copyright">{{ i18n("starhorse.copyright") }}</div>
  </el-card>
</template>
<style lang="scss" scoped>
:deep(.el-card) {
  margin: 0 !important;
}

:deep(.el-card__body) {
  padding: 0 !important;
  margin: 0 !important;
  height: 100%;
}

.design-form-container {
  height: 100%;
  border: 1px dashed var(--star-horse-style);
  background: var(--star-horse-background);
}

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

.form_content {
  display: flex;
  width: 100%;
  flex: 1;
  height: 100%;
  overflow: hidden;
  flex-direction: row;
  margin-top: 0;

  .side-panel {
    width: 270px !important;
    justify-content: flex-start;
    background: var(--star-horse-background);
    border: 1px dashed var(--star-horse-font-color);
    overflow: hidden;
  }

  .form-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    /*height: 100%;*/
    overflow: hidden;

    .main-design-a {
      display: flex;
      flex-direction: row;
      flex: 1;
      overflow: hidden;

      .main-design-outer {
        flex: 1;
        position: relative;
        background: var(--star-horse-background);
        justify-content: center;
        border: 1px dashed var(--star-horse-shadow);
        padding: 0 5px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;
        top: 0;
        left: 0;
        transform: translate(0, 0);

      }

      .side-panel-item {
        margin-top: 0;
        border: 1px dashed var(--star-horse-font-color);
      }
    }
  }
}
</style>
