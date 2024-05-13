<script lang="ts" setup name="DynamicForm">
import FieldPanel from "@/views/dyform/FieldPanel.vue";
import {nextTick, onMounted, provide, reactive, ref, unref, watch} from "vue";
import PropertyPanel from "@/views/dyform/PropertyPanel.vue";
import {postRequest} from "@/api/star_horse";
import {confirm, error, warning} from "@/utils/message";
import {useRoute, useRouter} from "vue-router";
import {loadData, loadGetData} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {SearchParams} from "@/components/types/Params";
import FieldAnalysis from "@/views/dyform/FieldAnalysis.vue";
import FormPropertyPanel from "@/views/dyform/FormPropertyPanel.vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import Help from "@/components/help.vue";
import {formActions} from "@/views/dyform/utils/DynamicForm.ts";

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
let route = useRoute();
let router = useRouter();
let dragingItem = ref<any>({});
let list = ref<any>([]);
let isPreview = ref<any>(false);
let batchEditFieldVisible = ref<any>(false);
let isEdit = ref<any>(true);
let activeTab = ref<any>("first");
let activeId = ref<any>("");
let formFieldList = ref<any>({index: 1});
let editable = ref<any>(true);
let formInfo = ref<any>({
  rules: "",
  inline: "no",
  labelPosition: "left",
  labelWidth: "",
  labelSuffix: "",
  hideRequiredAsterisk: "no",
  requireAsteriskPosition: "left",
  showMessage: "yes",
  inlineMessage: "no",
  statusIcon: "no",
  createTable: "yes",
  validateOnRuleChange: "yes",
  size: "small",
  disabled: "no",
  scrollToError: "no",
});
let formDatas = ref<any>({
  formInfo: formInfo.value,
  dataList: list.value,
  activeId: activeId.value,
  isEdit: isEdit.value,
});
provide("formFieldList", formFieldList);
provide("dragingItem", dragingItem);
provide("tableEditable", editable);
provide("formInfo", formInfo);
let formDataList = ref<any>();
let containerList = ref<any>();
let selfFormDataList = ref<any>();
const fieldPanelRef = ref();
const url = "/userdb-manage/userdb/dynamicFormItems/getAllByCondition";
const initContainer = async () => {
  let params: SearchParams[] = [{
    propertyName: "category",
    value: 2
  }];
  let {data, error} = await loadData(url, params);
  containerList.value = data;
};
const initItems = async () => {
  let params: SearchParams[] = [{
    propertyName: "category",
    value: 1
  }];
  let {data, error} = await loadData(url, params);
  formDataList.value = data;
};
const initSelfItems = async () => {
  let params: SearchParams[] = [{
    propertyName: "category",
    value: 3
  }];
  let {data, error} = await loadData(url, params);
  selfFormDataList.value = data;
};
const init = async () => {
  await initContainer();
  await initItems();
  await initSelfItems();
  initPreps();
};
const initPreps = () => {
  fieldPanelRef.value.dataInit(containerList.value, formDataList.value, selfFormDataList.value);
  //给item 赋值
  propertyRef.value.$refs.formItemRef.dataInit(containerList.value, formDataList.value, selfFormDataList.value);
};
const activeItemFun = (name: string, data: any, itemType: string, item: any) => {
  if (name == "selectItem") {
    selectItem(data, itemType, item);
  } else {
  }
};
provide("activeItemFun", activeItemFun);
provide("activeItemData", formDatas);

const propertyRef = ref();

const loadFormData = async (formId: any, isParent: boolean) => {
  await nextTick();
  clearData();
  let {data, error} = await loadGetData(dataUrl.loadByIdUrl + "/" + formId);
  if (error) {
    warning(error);
    return;
  }
  formInfo.value = data;
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
  list.value = JSON.parse(data["details"].content);
  formFieldList.value = JSON.parse(data["details"].fieldNames);
  data["details"] = {};

  isEdit.value = true;
  formDatas.value["formInfo"] = formInfo.value;
  formDatas.value["dataList"] = list.value;
  formDatas.value["activeId"] = list.value[0].id;
  formDatas.value["isEdit"] = true;
  let activeItem = list.value[0];
  setTimeout(() => {
    selectItem(activeItem, activeItem.itemType, "item");
  }, 500);
};
onMounted(async () => {
  clearData();
  await init();
});
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
    (val) => {
      if (val > 0) {
        loadFormData(val, true);
      }
    },
    {immediate: true, deep: true}
);
/**
 * 加载Form数据
 * @param id
 */

const closeAction = () => {
  isEdit.value = false;
  isPreview.value = false;
  batchEditFieldVisible.value = false;
  configDialogVisible.value = false;
  formDatas.value["isEdit"] = true;
};
const clearData = () => {
  list.value = [];
  formFieldList.value = {index: 1};
  let ms = new Date().getTime();
  formInfo.value = {};
  formInfo.value["formId"] = "id" + ms;
  formInfo.value["tbName"] = "tb" + ms;
  formDatas.value["dataList"] = unref(list);
  formDatas.value["formInfo"] = unref(formInfo);
  formDatas.value["isEdit"] = unref(isEdit);
  formDatas.value["activeId"] = "";
  formDatas.value["compType"] = "";

};
const preview = () => {
  isPreview.value = true;
  formDatas.value["isEdit"] = false;
};
const formPropertyRef = ref();
const doSave = async () => {
  if (!isSubmit.value) {
    return;
  }
  let dynameForm = formDatas.value["formInfo"];
  let flag = false;
  await nextTick();
  await formPropertyRef.value.$refs.itemFormInfo.validate((evt: boolean) => {
    flag = evt;
  });
  if (!flag) {
    warning("请先填写表单信息");
    return;
  }
  //解决多次转换
  dynameForm!["relations"] = (dynameForm["relations"] instanceof Array) ? JSON.stringify(dynameForm["relations"]) : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(formDatas.value["dataList"]);
  dynameForm!["details"]["fieldNames"] = JSON.stringify(formFieldList.value);
  postRequest("/userdb-manage/userdb/dynamicForm/merge", dynameForm)
      .then((res) => {
        if (res.data.code != 0) {
          activeTab.value = "second";
          warning(res.data.cnMessage);
          return;
        }
        closeAction();
        //添加成功后是否还要继续添加，
        confirm(res.data.cnMessage + ",是否继续留在当前页面").then((res) => {
          if (res) {
            clearData();
          } else {
            let sdata = {
              path: "/dyform/DynamicFormUi",
              componentName: "DynamicFormUi",
            };
            router.push(sdata);
          }
        });
      }).catch((err) => {
    activeTab.value = "second";
    error("操作异常:" + err);
  });
};
const createData = () => {
};
const formInfoChange = (data: any) => {
};
/**
 * 激活组件的数下
 * @param data 数据
 * @param itemType 数据类型
 * @param parentCompType 父组件类型
 */
const selectItem = (data: any, itemType: string, parentCompType: string) => {
  formDatas.value["activeId"] = data?.id || "";
  formDatas.value["dataList"] = list.value;
  formDatas.value["formInfo"] = formInfo.value;
  //当前组件是否在容器组件内
  formDatas.value["parentCompType"] = parentCompType;
  formDatas.value["compType"] = data?.compType || "";
  propertyRef.value.$refs.formItemRef.activeItem(data["preps"] || data, itemType, parentCompType == "item");
};
const getComponentName = (data: any) => {
  return data.itemType + "-item";
};
const onDragAdd = (evt: Event, dataList: Array<any>) => {
  selectItem(dragingItem.value, dragingItem.value["itemType"], "");
  dragingItem.value = {};
};
const createCode = () => {
  warning("该功能还未上线");
};
const batchEdit = () => {
  batchEditFieldVisible.value = true;
};
const configDialogVisible = ref(false);
const isSubmit = ref(false);
const tableEdit = (submit: boolean) => {
  isSubmit.value = submit;
  configDialogVisible.value = true;
};
const helpMessage = `help`;
let leftPanelVisible = ref<Boolean>(true);
let rightPanelVisible = ref<Boolean>(true);
const actions = (action: string) => {
  switch (action) {
    case "leftPanel":
      leftPanelVisible.value = !leftPanelVisible.value;
      break;
    case "rightPanel":
      rightPanelVisible.value = !rightPanelVisible.value;
      break;
    case "new":
      clearData();
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
    case "code":
      createCode();
      break;
  }

};
</script>

<template>
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

    <el-row style="font-width: bold;font-size:12px;margin-bottom: 5px;">
      <el-col :span="3">标签名称</el-col>
      <el-col :span="3">属性名称</el-col>
      <el-col :span="3">最大长度/精度</el-col>
      <el-col :span="3">是否必须</el-col>
      <el-col :span="3">表单显示</el-col>
      <el-col :span="3">查询显示</el-col>
      <el-col :span="3">列表显示</el-col>
      <el-col :span="3">默认值</el-col>
    </el-row>
    <template v-for="(item,index) in list">
      <template v-if="item.preps['elements']?.length>0" v-for="sitem in item.preps['elements']">
        <template v-for="sitem1 in sitem['columns']">
          <template v-for="sitem2 in sitem1.items">
            <FieldAnalysis :index="index" :field="sitem2"/>
          </template>
        </template>
        <template v-for="sitem2 in sitem.items">
          <FieldAnalysis :index="index" :field="sitem2"/>
        </template>
      </template>
      <FieldAnalysis :index="index" :field="item"
                     v-if="item.itemType!=='box'&&item.itemType!=='table' &&item.itemType!='tab'"/>
    </template>

  </star-horse-dialog>

  <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :title="'表单预览'"
      :is-view="true"
  >

    <template v-for="data in list">
      <component
          :id="data.id"
          :field="data"
          :formDatas="formDatas"
          :formFieldList="formFieldList"
          :is="data.itemType + '-container'"
          v-if="data.compType === 'container'"
      >
      </component>
      <component
          :id="data.id"
          :field="data"
          :formDatas="formDatas"
          :formFieldList="formFieldList"
          :is="getComponentName(data)"
          v-else-if="data.compType === 'formItem'"
      />
    </template>
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
              <el-menu-item v-if="list.length>0||item.defaultEdit">
                <el-tooltip class="item" :content="item.label" :index="index"
                            effect="dark"
                            placement="bottom">
                  <star-horse-icon @click="actions(item.key)" :icon-class="item.icon" size="24px" style="color: var(--star-horse-style)"
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
                style="height: 100%"
                :disabled="formInfo['disabled'] == 'yes'"
                :hide-required-asterisk="formInfo['hideRequiredAsterisk'] == 'yes'"
                :inline="formInfo.inline == 'yes'"
                :inline-message="formInfo['inlineMessage'] == 'yes'"
                :label-position="formInfo['labelPosition']"
                :label-suffix="formInfo['labelSuffix']"
                :label-width="formInfo['labelWidth']"
                :model="formFieldList"
                :require-asterisk-position="formInfo['requireAsteriskPosition']"
                :rules="formInfo.rules"
                :scroll-to-error="formInfo['scrollToError'] == 'yes'"
                :show-message="formInfo['showMessage'] == 'yes'"
                :size="formInfo['size']"
                :status-icon="formInfo['statusIcon'] == 'yes'"
                :validate-on-rule-change="formInfo['validateOnRuleChange']=='yes'"
            >
              <el-scrollbar>
                <draggable
                    @add="(evt) => onDragAdd(evt, list)"
                    class="main-design"
                    :animation="100"
                    group="starHorseGroup"
                    :disable="!editable"
                    ghostClass="ghost"
                    :list="list"
                >
                  <template v-for="(data, index) in list">
                    <component
                        :key="data.id"
                        :field="data"
                        :formDatas="formDatas"
                        :is="data.itemType + '-container'"
                        :formFieldList="formFieldList"
                        @selectItem="selectItem"
                        v-if="data.compType === 'container'"
                    />
                    <component
                        :key="data.id"
                        :field="data"
                        :formDatas="formDatas"
                        :is="getComponentName(data)"
                        :parentCompType="'item'"
                        :formFieldList="formFieldList"
                        @selectItem="selectItem"
                        v-else-if="data.compType == 'formItem'"
                    />
                  </template>
                </draggable>
              </el-scrollbar>
            </el-form>
          </div>
          <div class="side-panel-item" v-show="rightPanelVisible">
            <property-panel
                :activeTab="activeTab"
                :formDatas="formDatas"
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
  padding: 5px;
  height: 100%;
}

:deep(.el-divider--horizontal) {
  margin: 10px 0px;
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
  margin-top: 0px;

  .side-panel {
    width: 270px !important;
    justify-content: flex-start;
    background: #ffffff;
    border: 1px solid #eee;
    overflow: auto;
  }

  .form-main {
    display: flex;
    flex: 1;
    flex-direction: column;
    height: 100%;

    .inner_button {
      height: 40px;
      text-align: left;
      justify-content: flex-start;
      background-color: #fafafa;
      border: solid 1px #ccc;
      -moz-user-select: none;
      -webkit-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }

    .main-design-a {
      display: flex;
      flex-direction: row;
      flex: 1;
      overflow: auto;

      .main-design-outer {
        flex: 1;
        background: #f1f2f3;
        justify-content: center;
        border: 1px dotted #eee;
        margin-top: 5px;
        border-radius: 3px;

        .main-design {
          height: 99%;
          width: inherit;
          margin: 3px 5px;
          background: rgba(255, 255, 255, 0.8);
        }
      }

      .side-panel-item {
        margin-top: 5px;
        border: 1px solid #eee;
      }
    }
  }
}
</style>
