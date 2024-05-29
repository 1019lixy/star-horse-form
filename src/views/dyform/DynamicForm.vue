<script lang="ts" setup name="DynamicForm">
import FieldPanel from "@/views/dyform/FieldPanel.vue";
import {computed, nextTick, onMounted, provide, reactive, ref, unref, watch} from "vue";
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
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import {validDynamicFormCompParams} from "@/views/dyform/utils/preview.ts";

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
let draggingItem = computed(() => designForm.draggingItem);
let list = computed(() => designForm.compList);
let isPreview = ref<any>(false);
let batchEditFieldVisible = ref<any>(false);
let isEdit = computed(() => designForm.isEdit);
let activeTab = ref<any>("first");
let errMessage = ref<String>("");
let formFieldList = computed(() => designForm.formFieldList);
let editable = ref<any>(true);
let formInfo = computed(() => designForm.formInfo);
const fieldPanelRef = ref();

const init = async () => {
  clearData();

};
const propertyRef = ref();
const loadFormData = async (formId: any, isParent: boolean) => {
  await nextTick();
  clearData();
  let {data, error} = await loadGetData(dataUrl.loadByIdUrl + "/" + formId);
  if (error) {
    warning(error);
    return;
  }
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
  designForm.setFormFieldList(JSON.parse(data["details"].fieldNames));
  data["details"] = {};
  designForm.setIsEdit(true);
  let activeItem = list.value[0];
  designForm.selectItem(activeItem, activeItem.itemType, "item");

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
  designForm.setIsEdit(true);
  isPreview.value = false;
  batchEditFieldVisible.value = false;
  configDialogVisible.value = false;
};
const clearData = (flag: boolean = true) => {
  designForm.clearAll(flag);

};
const preview = () => {
  isPreview.value = true;
  designForm.setIsEdit(false);
};
const formPropertyRef = ref();
const doSave = async () => {
  if (!isSubmit.value) {
    closeAction();
    return;
  }

  let dynameForm = formInfo.value;
  let flag = false;
  await nextTick();
  errMessage.value = validDynamicFormCompParams(list.value);
  if (errMessage.value) {
    return;
  }
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
  dynameForm!["details"]["content"] = JSON.stringify(list.value);
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

const formInfoChange = (data: any) => {
};

const getComponentName = (data: any) => {
  return data.itemType + "-item";
};
const onDragAdd = (evt: Event, dataList: Array<any>) => {
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
  designForm.selectItem(draggingItem.value, draggingItem.value["itemType"], "");
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
const helpMessage =
    `
描述：StarHorse 表单设计器是一款通过拖拽即可实现复杂表单模型，可满足大部分常见业务。
   规则：所有同级组件的名字不能重复，在Tab组件中tabName和objectName 不能重复；
       Table组件中batchFieldName不能重复
操作步骤：
  1、将左边的组件拖动中间空白区域
  2、
  3、
  4、
  5、
`;
let leftPanelVisible = ref<Boolean>(true);
let rightPanelVisible = ref<Boolean>(true);
let processMsg = `
1,前后端Tab里的嵌套栅格，字段还没有解析
2、优化后前端页面联动效果没有验证
3、数据合法性校验没有做（主要考虑其字段重复，集合Key的重复）
4、组件必须项参数没有做校验
5、生成Vue 代码没有实现
6、后退和前进没有实现
8、参数和组件一致性没有处理
9、优化后的动态表单解析表字段还没有处理
10、关联表单还没有考虑其主键定义
11、其它还未总结项
`;
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
          <template v-for="sitem2 in sitem1.items">
            <FieldAnalysis :index="index" :field="sitem2" :container="item.preps.label"/>
          </template>
        </template>
        <template v-for="sitem2 in sitem.items">
          <FieldAnalysis :index="index" :field="sitem2" :container="sitem.label||item.preps.label"/>
        </template>
      </template>
      <FieldAnalysis :index="index" :field="item"
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

    <template v-for="data in list">
      <component
          :id="data.id"
          :field="data"
          :formFieldList="formFieldList"
          :is="data.itemType + '-container'"
          v-if="data.compType === 'container'"
      >
      </component>
      <component
          :id="data.id"
          :field="data"
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
                  <star-horse-icon @click="actions(item.key)" :icon-class="item.icon" size="24px"
                                   style="color: var(--star-horse-style)"
                  />
                </el-tooltip>
              </el-menu-item>
            </template>
          </el-menu>
          <help :message="helpMessage"/>
          <help :message="processMsg"/>
        </div>

        <div class="main-design-a">
          <div class="main-design-outer">
            <el-alert
                title="组件参数异常警告"
                type="warning"
                v-show="errMessage?.length>0"
                show-icon
                @close="()=>errMessage=''"
            >
              <template #default>
            <pre>
              {{ errMessage }}
            </pre>
              </template>
            </el-alert>
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
                      :is="data.itemType + '-container'"
                      :formFieldList="formFieldList"
                      v-if="data.compType === 'container'"
                  />
                  <component
                      :key="data.id"
                      :field="data"
                      :is="getComponentName(data)"
                      :parentCompType="'item'"
                      :formFieldList="formFieldList"
                      v-else-if="data.compType == 'formItem'"
                  />
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
      /*  overflow: auto;*/

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
          overflow-y: auto;
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
