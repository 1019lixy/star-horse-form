<script setup lang="ts" name="ItemPropertiesPanel">
import { computed, nextTick, onMounted, ref, unref, watch } from "vue";
import {
  error,
  formFieldMapping,
  isJson,
  PageFieldInfo,
  piniaInstance,
  searchMatchList,
  SelectOption,
  success,
  useDesignFormStore,
  useGlobalConfigStore,
  warning,
} from "star-horse-lowcode";
import { loadDict } from "@/api/star_horse_apis";
import {
  buttonClickDataField,
  compCommonFields,
  containerField,
  paramsFields,
  relationDataField,
} from "@/views/dyform/utils/ItemPreps";
import { Config } from "@/api/settings";
import { loadSvgIcons } from "@/api/star_horse_utils";

let designForm = useDesignFormStore(piniaInstance);
let formDataList = computed(() => designForm.formDataList);
let containerList = computed(() => designForm.containerList);
let selfFormDataList = computed(() => designForm.selfFormDataList);
let formInfo = computed(() => designForm.formInfo);
let list = computed(() => designForm.compList);
const formProps = computed(() => designForm.currentFormPreps);
const currentItemId = computed(() => designForm.currentItemId);
let currentItemType = computed(() => designForm.currentItemType);
let currentCompCategory = computed(() => designForm.currentCompCategory);
let parentCompType = computed(() => designForm.parentCompType);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
let currentField = ref<any>({});
let jsEditor = ref<boolean>(false);
let containerDialogVisible = ref<boolean>(false);
let dataSourceDialogVisible = ref<boolean>(false);
let dataRelationDialogVisible = ref<boolean>(false);
let buttonEventDialogVisible = ref<boolean>(false);
let paramsDialogVisible = ref<boolean>(false);
let codeTab = ref<string>("code");
let jsValue = ref<string>("console.log('hello world')");
let fieldName = ref<string>("");
const codeCompRef = ref<any>(null);
const dataSourceFormRef = ref<any>(null);
const dataRelationFormRef = ref<any>(null);
const buttonClickFormRef = ref<any>(null);
const paramsConfigRef = ref<any>(null);
const containerPrepRef = ref<any>(null);

//-----------------------数据源相关属性---------------------
let matchTypeList = ref<SelectOption[]>();
const jsButtonClick = (data: any, actionName: string) => {
  console.log(data);
  jsEditor.value = !jsEditor.value;
  if (!Object.keys(formProps.value).includes(actionName)) {
    data[actionName] = "";
  }
  fieldName.value = actionName;
  jsValue.value = data[actionName];
};
const condifRelationPolicy = async () => {
  dataRelationDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  let temp = formProps.value["dataRelation"] ?? {};
  await nextTick();
  setTimeout(() => {
    dataRelationFormRef.value?.setFormData(temp);
  }, 200);
};
const configParams = async (params: any) => {
  paramsDialogVisible.value = true;
  // 等待对话框渲染完成
  await nextTick();
  fieldName.value = params;
  designForm.setShortKeyDisabled(true);
  let temp = formProps.value ?? {};
  // 再次等待确保子组件挂载
  await nextTick();
  setTimeout(() => {
    paramsConfigRef.value?.setFormData(temp);
  }, 200);
  // paramsConfigRef.value?.setFormData(temp);
};
const submitValid = async () => {
  let result = await dataSourceFormRef.value.submitValid();
  if (result) {
    closeAction();
  }
};
const dataRelationMerge = async () => {
  let flag: boolean = false;
  let formRef = dataRelationFormRef?.value?.$refs.starHorseFormRef;
  await formRef.validate((res: boolean) => {
    flag = res;
  });
  if (!flag) {
    return;
  }
  formProps.value["dataRelation"] =
    dataRelationFormRef?.value.getFormData().value;
  closeAction();
};
const paramsValid = async () => {
  let flag = false;
  await paramsConfigRef.value.$refs.starHorseFormRef.validate(
    (res: boolean) => {
      flag = res;
    },
  );
  if (!flag) {
    return;
  }
  let formDdata = unref(paramsConfigRef.value.getFormData());
  if (!formDdata["primaryKey"]) {
    warning("请选择主键字段");
    return;
  }
  if (!formDdata["needField"]?.length) {
    warning("请配置回调字段");
    return;
  }
  if (!formDdata["fieldLists"].length) {
    warning("请至少配置一个显示字段");
    return;
  }
  for (let key in formDdata) {
    formProps.value[key] = formDdata[key];
  }
  formProps.value["redirect"] = true;
  formProps.value["dataUrl"] = {
    redirect: true,
    env: formDdata["env"],
    host: formDdata["host"],
    pageListUrl: formDdata["interfaceUrl"],
    httpMethod: formDdata["httpMethod"],
    port: formDdata["port"],
    protocol: formDdata["protocol"],
    params: formDdata.params,
  };
  let searchFieldList: Array<any> = [];
  formProps.value["fieldLists"].forEach((item: any) => {
    item["listVisible"] = true;
    item["type"] = "input";
    item["formVisible"] = true;
    if (item.searchFlag) {
      searchFieldList.push({ ...item, matchType: "lk", defaultVisible: true });
    }
  });
  formProps.value["searchFieldList"] = {
    fieldList: searchFieldList,
  };
  formProps.value["fieldList"] = {
    fieldList: formProps.value["fieldLists"],
  };
  //删除多余的属性
  formProps.value["orderBy"]?.forEach((item: any) => {
    delete item["xh"];
  });
  closeAction();
};
const resetForm = () => {};
const resetDataSourceForm = () => {
  formProps.value["dataSource"] = "data";
  formProps.value["httpMethod"] = null;
  formProps.value["urlOrDictName"] = null;
  formProps.value["queryParams"] = [];
  formProps.value["values"] = [];
};
const dataRelationReset = () => {};
const editContainerPrep = async () => {
  containerDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  await nextTick();
  containerPrepRef.value.setFormData(formProps.value);
};
const containerAction = () => {
  let formDdata = containerPrepRef.value.getFormData();
  for (let key in formDdata.value) {
    formProps.value[key] = formDdata.value[key];
  }
  closeAction();
};
const closeAction = () => {
  jsEditor.value = false;
  containerDialogVisible.value = false;
  dataSourceDialogVisible.value = false;
  paramsDialogVisible.value = false;
  dataRelationDialogVisible.value = false;
  buttonEventDialogVisible.value = false;
  isInitDataSourceField.value = false;
  designForm.setShortKeyDisabled(false);
};
const buttonEventMerge = async () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    if (!res) {
      return;
    }
    let formDdata = buttonClickFormRef.value.getFormData();
    Object.entries(formDdata.value).forEach(([key, value]) => {
      formProps.value[key] = value;
    });
    closeAction();
  });
};
const buttonEventReset = () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.resetFields();
};
/**
 * 数据源操作框
 * @param _type
 */
const dataSource = async (_type: string) => {
  dataSourceDialogVisible.value = true;
  designForm.setShortKeyDisabled(true);
  await nextTick();
  dataSourceFormRef.value?.setFormData(formProps.value);
};
const btnClickOpen = () => {
  buttonEventDialogVisible.value = true;
};
/**
 * 根据属性类别获取对应参数
 * @param itemType
 * @param isItem
 */
const assignPrep = async (itemType: string, isItem: boolean) => {
  await nextTick();
  let formDatas = unref(formDataList);
  let selfFormDatas = unref(selfFormDataList);
  let containers = unref(containerList);
  if (!isItem) {
    for (let key in containers) {
      let temp = containers[key];
      if (temp.itemType == itemType) {
        assignValue(temp);
        return temp;
      }
    }
  }
  for (let key in formDatas) {
    let temp = formDatas[key];
    if (temp.itemType == itemType) {
      assignValue(temp);
      return temp;
    }
  }
  for (let key in selfFormDatas) {
    let temp = selfFormDatas[key];
    if (temp.itemType == itemType) {
      assignValue(temp);
      return temp;
    }
  }
};
let relationComps = ref<Array<string>>([
  "select",
  "tselect",
  "switch",
  "autocomplete",
  "checkbox",
  "radio",
  "cascade",
  "page-select",
  "dialog-input",
  "icon",
]);
let exclusionDataSource = ref<Array<string>>([
  "page-select",
  "switch",
  "dialog-input",
]);
let formFields = ref<PageFieldInfo>({
  fieldList: [],
});
let rules: any = {};
const convertFormFieldData = (items: any, type: string) => {
  items.forEach((item: any) => {
    item["formVisible"] = true;
    item["type"] = item["fieldType"];
    if (!item.preps) {
      item.preps = {};
    }
    //增加Help
    item["helpMsg"] = `${item["remark"] ?? ""}`;
    if (item["selectValues"] && isJson(item["selectValues"])) {
      item.preps["values"] = [];
      let datas = JSON.parse(item.selectValues?.replace(/'/g, '"'));
      for (let i in datas) {
        let data: any = datas[i];
        item.preps["values"].push({
          name: data.name || data,
          value: data.value || data,
        });
      }
    }
    if (item["type"] == "button") {
      switch (type) {
        case "base":
          item["actions"] = {};
          break;
        case "other":
          item["actions"] = {};
          break;
        default:
          item["actions"] = {
            click: (data: any) => jsButtonClick(data, item.actionName),
          };
      }
    } else if (item["type"] == "config") {
      item["type"] = "button";
      item["label"] = "参数配置";
      item["actions"] = (_data: any) => configParams(item.actionName);
    } else if (item["type"] == "icon") {
      item.preps["iconType"] = "user";
      item.preps["values"] = loadSvgIcons();
    }
  });
};
/**
 * 自定义验证规则
 */
const customerValid = () => {
  warning("自定义验证规则开发中");
};
const assignValue = (fieldInfo: any) => {
  try {
    let temp = JSON.parse(JSON.stringify(fieldInfo));
    currentField.value = temp;
    convertFormFieldData(temp.fields, "base");
    convertFormFieldData(temp.advancedFields, "other");
    convertFormFieldData(temp.actions, "action");
    //如果是组件动态增加公共属性，公共属性不应该维护在数据库
    //如果是select,checkbox,radio 等，增加联动属性
    if (currentCompCategory.value == "container") {
      if (currentItemType.value != "table") {
        temp.fields.splice(0, 0, {
          label: "编辑容器属性",
          fieldName: "rows",
          type: "button",
          actions: { click: (_data: any) => editContainerPrep() },
          formVisible: true,
        });
      }
    } else {
      let commonFields = compCommonFields(customerValid);
      if (relationComps.value.includes(currentItemType.value)) {
        if (currentItemType.value != "icon") {
          commonFields.push({
            label: "配置联动策略",
            fieldName: "dataRelation",
            type: "button",
            actions: { click: (val: any) => condifRelationPolicy() },
            formVisible: true,
          });
        }
        if (!exclusionDataSource.value.includes(currentItemType.value)) {
          commonFields.push({
            label: "配置数据源",
            fieldName: "dataSource",
            type: "button",
            actions: {
              click: (val: any) => dataSource(formProps.value["itemType"]),
            },
            formVisible: true,
          });
        }
      }
      for (let i in commonFields) {
        temp.fields.splice(i, 0, commonFields[i]);
      }
      temp.advancedFields.push({
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true,
      });
      if (currentItemType.value == "button") {
        temp.fields.splice(5, 0, {
          label: "配置点击事件",
          fieldName: "cfgClickEvent",
          type: "button",
          formVisible: true,
          actions: { click: (_data: any) => btnClickOpen() },
        });
      }
    }

    formFields.value.fieldList = [
      {
        fieldName: "base",
        collapseList: [
          {
            title: "基础属性",
            icon: "base_preps",
            tabName: "base",
            fieldList: temp.fields,
          },
          {
            title: "其它属性",
            tabName: "other",
            icon: "advance_preps",
            preps: {
              labelPosition: "top",
              labelWidth: "120px",
            },
            fieldList: temp.advancedFields,
          },
          {
            title: "自定义事件",
            tabName: "action",
            icon: "event-action",
            preps: {
              labelPosition: "top",
              labelWidth: "120px",
            },
            fieldList: temp.actions,
          },
        ],
      },
    ];
    let defaultValues: any = formFieldMapping(formFields.value).defaultDatas;
    for (let key in defaultValues) {
      if (!Object.keys(formProps.value).includes(key)) {
        formProps.value[key] = defaultValues[key];
      }
    }
  } catch (e) {
    console.log(e);
  }
};
let dataList = ref<SelectOption[]>([]);
const recall = (
  options: SelectOption[],
  successMsg: string,
  errorMsg: string,
) => {
  dataList.value = options;
  if (successMsg) {
    success(successMsg);
  }
  if (errorMsg) {
    error(errorMsg);
  }
};
const isInitDataSourceField = ref<boolean>(false);
const hmsg: string = `
   自定义事件,提供了如下系统参数：
   currentField:Object 当前组件的信息
   formData:Object 表单数据
   formFields：Array<any>表单的所有元素
   formInstance:Object 表单实例对象
   具体参数或方法切换Tab查看
`;
let envList = ref<Array<SelectOption>>([]);
const itemPropertiesRef = ref();
onMounted(async () => {
  matchTypeList.value = searchMatchList();
  envList.value = await loadDict("system_environment");
});
const testvalid = () => {
  itemPropertiesRef.value?.validate((res: boolean) => {
    console.log(res);
  });
};
watch(
  () => [currentItemId, currentItemType],
  () => {
    assignPrep(currentItemType.value, parentCompType.value == "item");
  },
  {
    immediate: true,
    deep: true,
  },
);
</script>
<template>
  <star-horse-dialog
    :dialogVisible="buttonEventDialogVisible"
    :title="'按钮点击事件'"
    :isBatch="false"
    @merge="buttonEventMerge"
    @closeAction="closeAction"
    @resetForm="buttonEventReset"
    :selfFunc="true"
  >
    <star-horse-form
      :outerFormData="formProps"
      primary-key=""
      ref="buttonClickFormRef"
      :fieldList="buttonClickDataField()"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="dataRelationDialogVisible"
    :title="'数据联动策略配置'"
    :isBatch="false"
    @merge="dataRelationMerge"
    @closeAction="closeAction"
    @resetForm="dataRelationReset"
    :selfFunc="true"
  >
    <star-horse-form
      :outerFormData="formProps"
      primary-key=""
      ref="dataRelationFormRef"
      :fieldList="relationDataField()"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="dataSourceDialogVisible"
    :title="'数据源配置'"
    :isBatch="false"
    @merge="submitValid"
    @closeAction="closeAction"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
  >
    <data-source-comp ref="dataSourceFormRef" :formProps="formProps" />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="paramsDialogVisible"
    :title="'参数配置'"
    :isBatch="false"
    @merge="paramsValid"
    @closeAction="closeAction"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
  >
    <star-horse-form
      :outerFormData="formInfo"
      ref="paramsConfigRef"
      :fieldList="paramsFields(paramsConfigRef, fieldName, currentField)"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="containerDialogVisible"
    :title="'容器设置'"
    :isBatch="false"
    @merge="containerAction"
    @closeAction="closeAction"
    @resetForm="resetForm"
    :selfFunc="true"
  >
    <star-horse-form
      ref="containerPrepRef"
      :outerFormData="formInfo"
      :fieldList="containerField(currentItemType)"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="jsEditor"
    :title="'自定义信息'"
    :isBatch="false"
    @merge="closeAction"
    @closeAction="closeAction"
    @resetForm="closeAction"
    :selfFunc="true"
  >
    <el-tabs v-model="codeTab">
      <el-tab-pane label="代码" name="code">
        <star-horse-editor
          v-model:value="formProps[fieldName]"
          lang="javascript"
          ref="codeCompRef"
          :helpMsg="hmsg"
          style="height: 100%"
        />
      </el-tab-pane>
      <el-tab-pane label="当前组件属性" name="currentField">
        <pre>
          {{ JSON.stringify(currentField, null, 4) }}
        </pre>
      </el-tab-pane>
      <el-tab-pane label="表单实例" name="formInstance">
        对象名字：formInstance
        <table
          border="1"
          cellpadding="0"
          cellspacing="0"
          style="width: 100%; border: 1px dashed var(--star-horse-style)"
        >
          <thead style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <th>名称</th>
              <th>说明</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody style="border: 1px dashed var(--star-horse-style)">
            <tr>
              <td>validate</td>
              <td>
                对整个表单的内容进行验证。 接收一个回调函数，或返回
                <code>Promise</code>。
              </td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>validateField</td>
              <td>验证具体的某个字段。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>resetFields</td>
              <td>重置该表单项，将其值重置为初始值，并移除校验结果</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>scrollToField</td>
              <td>滚动到指定的字段</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>clearValidate</td>
              <td>清理某个字段的表单验证信息。</td>
              <td><span class="inline-flex items-center">Function</span></td>
            </tr>
            <tr>
              <td>fields</td>
              <td>获取所有字段的 context</td>
              <td><span class="inline-flex items-center">Array</span></td>
            </tr>
          </tbody>
        </table>
      </el-tab-pane>
      <el-tab-pane label="表单属性" name="formDatas">
        <pre>
          {{ JSON.stringify(list, null, 4) }}
        </pre>
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
  <div class="dynamic-form" v-if="currentItemType">
    <sh-form
      v-model:dataForm="formProps"
      class="dynamic-form"
      ref="itemPropertiesRef"
      :size="compSize"
      :rules="rules"
      :scroll-to-error="true"
      :scroll-into-view-options="true"
      :inline-message="false"
      :status-icon="true"
      label-width="auto"
      label-position="right"
      require-asterisk-position="right"
    >
      <star-horse-form-item
        :fieldList="formFields"
        :rules="rules"
        :compSize="compSize"
        v-model:dataForm="formProps"
      />
    </sh-form>
  </div>
</template>
<style lang="scss" scoped>
:deep(.el-collapse-item) {
  overflow: hidden;

  .el-collapse-item__wrap {
    height: 100%;
    overflow: hidden;

    .el-collapse-item__content {
      height: inherit;
      overflow: hidden;
    }
  }

  &:last-child {
    flex: 1;
    height: 100%;
  }
}

:deep(.el-form-item__content) {
  width: 90%;
  margin-left: 5px;
  padding-left: 5px;
}

:deep(.el-scrollbar) {
  border-top-width: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

:deep(.el-dialog__body) {
  padding: 0;
}

.widget-collapse {
  height: 99%;
}

.oper-btn {
  cursor: pointer;
}

.dynamic-form {
  width: 100%;
  margin: 0 auto;
  overflow: hidden;
}

:deep(.el-tabs) {
  overflow: auto !important;
}
</style>
