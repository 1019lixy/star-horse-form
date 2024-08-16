<script lang="ts" setup name="DynamicForm">
import FieldPanel from "@/views/dyform/FieldPanel.vue";
import {computed, nextTick, onMounted, reactive, ref, watch} from "vue";
import PropertyPanel from "@/views/dyform/PropertyPanel.vue";
import {postRequest} from "@/api/star_horse";
import {confirm, error, warning} from "@/utils/message";
import {useRoute, useRouter} from "vue-router";
import {loadData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import FieldAnalysis from "@/views/dyform/FieldAnalysis.vue";
import FormPropertyPanel from "@/views/dyform/FormPropertyPanel.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import Help from "@/components/help.vue";
import {formActions} from "@/views/dyform/utils/DynamicForm.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import {validDynamicFormCompParams} from "@/views/dyform/utils/preview.ts";
import CodeComp from "@/views/dyform/code/CodeComp.vue";
import {useButtonPermission} from "@/store/ButtonPermissionStore.ts";

const dataUrl = reactive<ApiUrls>(<ApiUrls>{
  loadByPageUrl: "/userdb-manage/userdb/dynamicForm/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicForm/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicForm/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicForm/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicForm/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicForm/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicForm/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicForm/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicForm/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicForm/getAllByCondition",
  importUrl: "/userdb-manage/userdb/dynamicForm/importData",
});
let designForm = DesignForm(piniaInstance);
let route = useRoute();
let router = useRouter();
let pagePermission = useButtonPermission(piniaInstance);
let permissions = computed(() => pagePermission.currentPermission);
let draggingItem = computed(() => designForm.draggingItem);
let list = computed(() => designForm.compList);
let isPreview = ref<any>(false);
let batchEditFieldVisible = ref<any>(false);
let activeTab = ref<any>("first");
let errMessage = ref<string>("");
let formData = computed(() => designForm.formData);
let formInfo = computed(() => designForm.formInfo);
const fieldPanelRef = ref();
let reOrUnDoFlag = ref<boolean>(false);
const init = async () => {
  clearData();
};
const propertyRef = ref();
const loadFormData = async (formId: any, isParent: boolean) => {
  await nextTick();
  clearData();
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + formId, {});
  if (error) {
    warning(error);
    return;
  }
  data["datasourceConfigId"] = data["datasourceConfigId"] + "";
  designForm.setFormInfo(data);
  if (isParent) {
    data["idDynamicForm"] = null;
    data["parentId"] = formId;
    //数据编号一定要清空，否则数据会跳过重复验证
    data["dataNo"] = null;
    formInfo.value["formId"] = formInfo.value["formId"] + "Sub";
    formInfo.value["tbName"] = formInfo.value["tbName"] + "Sub";
  }
  if (data["relations"]) {
    formInfo.value["relations"] = JSON.parse(data["relations"]);
  }
  designForm.setCompList(JSON.parse(data["details"].content));
  designForm.setFormData(JSON.parse(data["details"].fieldNames));
  data["details"] = {};
  designForm.setIsEdit(true);
  let activeItem = list.value[0];
  designForm.selectItem(activeItem, activeItem.itemType, "item");
};

const closeAction = () => {
  designForm.setIsEdit(true);
  isPreview.value = false;
  batchEditFieldVisible.value = false;
  configDialogVisible.value = false;
  codeDialogVisible.value = false;
};
const clearData = (flag: boolean = true) => {
  if (list.value?.length > 0) {
    confirm("新建将清空舞台上的所有元素，是否确定要清空？").then((res: boolean) => {
      if (res) {
        designForm.clearAll(flag);
      }
    })
  } else {
    designForm.clearAll(flag);
  }
};
const preview = () => {
  isPreview.value = true;
  designForm.setIsEdit(false);
};
const formPropertyRef = ref();
/**
 * 代码操作
 */
const codeDoSave = () => {
};
const doSave = async () => {
  let formData = formPropertyRef.value.getFormData();
  console.log(formData);
  designForm.setFormInfo(formData.value);
  if (!isSubmit.value) {
    closeAction();
    return;
  }

  let flag = false;
  await nextTick();
  errMessage.value = validDynamicFormCompParams(list.value, true);
  if (errMessage.value) {
    warning(errMessage.value);
    return;
  }
  await formPropertyRef.value.$refs.dynamicFormItemRef.$refs.starHorseFormRef.validate((evt: boolean) => {
    flag = evt;
  });
  if (!flag) {
    warning("请先填写表单信息");
    return;
  }
  let dynameForm = JSON.parse(JSON.stringify(formInfo.value));
  //解决多次转换
  dynameForm!["relations"] = (dynameForm["relations"] && dynameForm["relations"] instanceof Array) ?
      JSON.stringify(dynameForm["relations"]) : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(list.value);
  dynameForm!["details"]["fieldNames"] = JSON.stringify(formData.value);
  postRequest("/userdb-manage/userdb/dynamicForm/merge", dynameForm)
      .then((res) => {
        if (res.data.code != 0) {
          activeTab.value = "second";
          warning(res.data.cnMessage);
          return;
        }
        closeAction();
        //添加成功后是否还要继续添加，
        confirm(res.data.cnMessage + ",是否继续留在当前页面").then((cfm: boolean) => {
          if (cfm) {
            designForm.clearAll(false);
          }
        }).catch(() => {
          let sdata = {
            path: "/dyform/DynamicFormUi",
            componentName: "DynamicFormUi",
          };
          router.push(sdata);
        });
      }).catch((err) => {
    activeTab.value = "second";
    closeAction();
    error("操作异常:" + err);
  });
};
const formInfoChange = (_data: any) => {
};
const getComponentName = (data: any) => {
  return data.itemType + "-item";
};
const onDragAdd = async (_evt: Event, dataList: Array<any>) => {
  // let index = evt.oldIndex;
  if (draggingItem.value.itemType == 'table') {
    let id = draggingItem.value.id;
    let datas = dataList.filter(item => item.itemType == "table");
    console.log(dataList);
    if (datas.length > 1) {
      warning("同级容器中只能添加一次Table 组件");
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
};
const batchEdit = () => {
  batchEditFieldVisible.value = true;
};
const configDialogVisible = ref(false);
const codeDialogVisible = ref(false);
const isSubmit = ref(false);
const tableEdit = (submit: boolean) => {
  isSubmit.value = submit;
  configDialogVisible.value = true;
};
const helpMessage =
    `
描述：StarHorse 表单设计器是一款通过拖拽即可实现
     复杂表单模型，可满足大部分常见业务。
规则：所有同级组件的名字不能重复，在Tab组件中tabName
     和objectName不能重复;
     Table组件中batchFieldName不能重复。
操作步骤：
  1、将左边的组件拖动中间空白区域；
  2、在右边属性区域设置选中组件得属性；
  3、在头部可批量编辑按钮可编辑属性名称；
  4、在在头部设置按钮可设置表单属性；
  5、在头部代码按钮可以生产代码（目前只能生产vue3）；
  6、在头部预览按钮可以预览表单信息；
`;
let leftPanelVisible = ref<boolean>(true);
let rightPanelVisible = ref<boolean>(true);

const actions = (action: string) => {
  switch (action) {
    case "leftPanel":
      leftPanelVisible.value = !leftPanelVisible.value;
      break;
    case "rightPanel":
      rightPanelVisible.value = !rightPanelVisible.value;
      break;
    case "new":
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
  }
};
//监听参数变化
watch(
    () => route.query["formId"],
    (val) => {
      if (val) {
        loadFormData(val, false);
      }
    },
    {immediate: true, deep: true}
);
watch(
    () => route.query["parentId"],
    (val: any) => {
      if (val && val > 0) {
        loadFormData(val, true);
      }
    },
    {immediate: true, deep: true}
);
watch(() => list.value,
    () => {
      designForm.removePromise();
      designForm.setRefresh();
      designForm.addHistoryRecord(reOrUnDoFlag.value);
      reOrUnDoFlag.value = false;
    }, {
      immediate: false,
      deep: true
    }
);
onMounted(async () => {
  designForm.clearAll(true);
  await init();
});
</script>
<template>
  <star-horse-dialog
      :dialogVisible="codeDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :isView="true"
      :full-screen="true"
      @merge="codeDoSave"
      :title="'代码'"
  >
    <code-comp/>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      @merge="doSave"
      :title="'表单配置'"
  >
    <FormPropertyPanel ref="formPropertyRef"/>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="batchEditFieldVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      @merge="closeAction"
      :title="'批量修改属性'"
  >
    <el-row style="font-weight: bold;font-size:12px;margin-bottom: 5px;">
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
    <template v-for="(item,index) in list">
      <template v-if="item.preps['elements']?.length>0" v-for="sitem in item.preps['elements']">
        <template v-for="sitem1 in sitem['columns']">
          <template v-for="(sitem2,sindex) in sitem1.items">
            <FieldAnalysis :index="index+sindex+1" :field="sitem2" :container="item.preps.label"/>
          </template>
        </template>
        <template v-for="(sitem2,sindex) in sitem.items">
          <FieldAnalysis :index="index+sindex+1" :field="sitem2" :container="sitem.label||item.preps.label"/>
        </template>
      </template>
      <FieldAnalysis :index="index+1" :field="item"
                     v-if="item.itemType!=='box'&&item.itemType!=='table' &&item.itemType!='tab'" :container="'--'"/>
    </template>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :title="'表单预览'"
      :is-view="true"
  >
    <el-form
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
      <template v-for="data in list">
        <component
            :id="data.id"
            :field="data"
            :formData="formData"
            :is="data.itemType + '-container'"
            v-if="data.compType === 'container'"
        >
        </component>
        <component
            :id="data.id"
            :field="data"
            :formData="formData"
            :is="getComponentName(data)"
            v-else-if="data.compType === 'formItem'"
        />
      </template>
    </el-form>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="form_content">
      <div class="side-panel" v-show="leftPanelVisible">
        <field-panel ref="fieldPanelRef"/>
      </div>
      <div class="form-main">
        <div class="inner_button">
          <el-menu mode="horizontal" style="height: inherit;width: 100%;">
            <template v-for="(item,index) in formActions">
              <el-menu-item v-if="(list.length>0||item.defaultEdit)&&(item.auth=='none'||permissions[item.auth])">
                <el-tooltip class="item" :content="item.label" :index="index"
                            effect="dark"
                            placement="bottom">
                  <star-horse-icon @click="actions(item.key)" :icon-class="item.icon" size="24px"
                                   style="color: var(--star-horse-style)"
                  />
                </el-tooltip>
              </el-menu-item>
            </template>
          </el-menu>
          <help :message="helpMessage"/>
        </div>
        <div class="main-design-a">
          <div class="main-design-outer">
            <el-form
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
                  class="main-design"
                  tag="div"
                  group="starHorseGroup"
                  ghostClass="ghost"
                  animation="300"
                  :list="list"
              >
                <template #item="{element:data}">
                  <template v-if="data.compType === 'container'">
                    <div class="comp-item" :style="{height: data.itemType=='tab'?'100%':'none'}">
                      <component
                          :key="data.id"
                          :field="data"
                          :formInfo="formInfo"
                          :is="data.itemType + '-container'"
                          :formData="formData"
                      />
                    </div>
                  </template>
                  <template v-else-if="data.compType == 'formItem'">
                    <div class="comp-item">
                      <component
                          :key="data.id"
                          :field="data"
                          :formInfo="formInfo"
                          :is="getComponentName(data)"
                          :parentCompType="'item'"
                          :formData="formData"
                      />
                    </div>
                  </template>

                </template>
              </draggable>
            </el-form>
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
  </el-card>
</template>
<style lang="scss" scoped>

:deep(.el-card__body) {
  padding: 0;
  height: 100%;
}

.design-form-container {
  height: 100%;
  border: 2px dotted var(--star-horse-style);
  background: var(--star-horse-background);
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}

:deep(.el-collapse-item__header) {
  height: 30px;
  background: #eee;
  border-bottom: 1px solid #8F8F8F;
}

:deep(.el-collapse-item__wrap) {
  margin-top: 5px;
}

:deep(.el-scrollbar__view) {
  height: 100%;
}

.form_content {
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: row;
  margin-top: 0;

  .side-panel {
    width: 270px !important;
    justify-content: flex-start;
    background: var(--star-horse-background);
    border: 1px solid var(--star-horse-font-color);
    overflow: hidden;
  }

  .form-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    /*height: 100%;*/
    overflow: hidden;

    .inner_button {
      height: 40px;
      text-align: left;
      justify-content: flex-start;
      background: var(--star-horse-background);
      border: solid 1px var(--star-horse-font-color);
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .main-design-a {
      display: flex;
      flex-direction: row;
      flex: 1;
      overflow: hidden;

      .main-design-outer {
        flex: 1;
        background: var(--star-horse-background);
        justify-content: center;
        border: 1px dotted var(--star-horse-font-color);
        margin-top: 5px;
        border-radius: 3px;
        display: flex;
        flex-direction: column;

        .main-design {
          flex: 1;
          margin: 3px 3px 0 5px;
          height: 100%;
          overflow: auto;
          background: rgba(255, 255, 255, 0.8);
        }
      }

      .side-panel-item {
        margin-top: 5px;
        border: 1px solid var(--star-horse-font-color);
      }
    }
  }
}
</style>
