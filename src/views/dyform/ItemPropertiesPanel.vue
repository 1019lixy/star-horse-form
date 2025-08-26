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
import { useDialogManager } from "@/views/dyform/composables/useDialogManager";
// Import the new dialog components
import ButtonEventDialog from "@/views/dyform/dialogs/ButtonEventDialog.vue";
import DataRelationDialog from "@/views/dyform/dialogs/DataRelationDialog.vue";
import DataSourceDialog from "@/views/dyform/dialogs/DataSourceDialog.vue";
import ParamsDialog from "@/views/dyform/dialogs/ParamsDialog.vue";
import ContainerDialog from "@/views/dyform/dialogs/ContainerDialog.vue";
import JsEditorDialog from "@/views/dyform/dialogs/JsEditorDialog.vue";

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
let fieldName = ref<string>("");
const itemPropertiesRef = ref();

// Use the dialog manager composable
const { dialogStates, openDialog, closeAllDialogs } = useDialogManager();

//-----------------------数据源相关属性---------------------
let matchTypeList = ref<SelectOption[]>();
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

const jsButtonClick = (data: any, actionName: string) => {
  openDialog('jsEditor');
  if (!Object.keys(formProps.value).includes(actionName)) {
    data[actionName] = "";
  }
  fieldName.value = actionName;
};

const condifRelationPolicy = async () => {
  openDialog('dataRelationDialog');
  await nextTick(()=>{
    // Data relation dialog will handle its own form data setting
  });
};

const configParams = async (params: any) => {
  openDialog('paramsDialog');
  fieldName.value = params;
  await nextTick();
  // Params dialog will handle its own form data setting
};

const dataSource = async (_type: string) => {
  openDialog('dataSourceDialog');
  await nextTick();
  // Data source dialog will handle its own form data setting
};

const btnClickOpen = () => {
  openDialog('buttonEventDialog');
};

const editContainerPrep = async () => {
  openDialog('containerDialog');
  await nextTick();
  // Container dialog will handle its own form data setting
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
      let commonFields = compCommonFields(
        customerValid,
        currentItemType.value == "number",
      );
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

let envList = ref<Array<SelectOption>>([]);
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

// Dialog event handlers
const handleDialogMerge = () => {
  closeAllDialogs();
};

const handleDialogClose = () => {
  closeAllDialogs();
  isInitDataSourceField.value = false;
};
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <!-- Button Event Dialog -->
    <ButtonEventDialog
      :visible="dialogStates.buttonEventDialog"
      :formProps="formProps"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
    />
    
    <!-- Data Relation Dialog -->
    <DataRelationDialog
      :visible="dialogStates.dataRelationDialog"
      :formProps="formProps"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
    />
    
    <!-- Data Source Dialog -->
    <DataSourceDialog
      :visible="dialogStates.dataSourceDialog"
      :formProps="formProps"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
    />
    
    <!-- Params Dialog -->
    <ParamsDialog
      :visible="dialogStates.paramsDialog"
      :formProps="formProps"
      :formInfo="formInfo"
      :fieldName="fieldName"
      :currentField="currentField"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
    />
    
    <!-- Container Dialog -->
    <ContainerDialog
      :visible="dialogStates.containerDialog"
      :formProps="formProps"
      :formInfo="formInfo"
      :currentItemType="currentItemType"
      @merge="handleDialogMerge"
      @close="handleDialogClose"
      @reset="handleDialogClose"
    />
    
    <!-- JS Editor Dialog -->
    <JsEditorDialog
      :visible="dialogStates.jsEditor"
      :formProps="formProps"
      :fieldName="fieldName"
      :currentField="currentField"
      :list="list"
      @close="handleDialogClose"
    />
    
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
        require-asterisk-position="right">
        <star-horse-form-item 
          :fieldList="formFields" 
          :rules="rules" 
          :compSize="compSize"
          v-model:dataForm="formProps" />
      </sh-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item-properties-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.properties-header {
  padding: 16px;
  border-bottom: 1px solid #ebeef5;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  
  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 500;
  }
  
  .component-info {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 8px;
    font-size: 13px;
    opacity: 0.9;
  }
  
  .component-icon {
    font-size: 16px;
  }
}

.properties-content {
  flex: 1;
  overflow: hidden;
}

.properties-form {
  padding: 16px;
}

.property-section {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 6px;
  overflow: hidden;
  
  .section-header {
    background: #f5f7fa;
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    
    &:hover {
      background: #ecf5ff;
    }
    
    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 500;
      color: #303133;
    }
    
    .section-actions {
      display: flex;
      gap: 8px;
    }
  }
  
  .section-content {
    padding: 16px;
    background: white;
  }
}

.property-group {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.property-item {
  display: flex;
  flex-direction: column;
  
  .property-label {
    font-size: 13px;
    color: #606266;
    margin-bottom: 6px;
    display: flex;
    align-items: center;
    gap: 4px;
    
    .required {
      color: #f56c6c;
    }
  }
  
  .property-control {
    flex: 1;
  }
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  border-top: 1px solid #ebeef5;
  background: #fafafa;
}

.action-button {
  flex: 1;
  min-width: 120px;
  
  &:hover {
    transform: translateY(-1px);
  }
}

.empty-properties {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  color: #909399;
  text-align: center;
  
  .empty-icon {
    font-size: 48px;
    margin-bottom: 12px;
    color: #c0c4cc;
  }
  
  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 500;
    color: #606266;
  }
  
  p {
    margin: 0;
    font-size: 13px;
    line-height: 1.5;
  }
}

// Responsive design
@media (max-width: 768px) {
  .property-group {
    grid-template-columns: 1fr;
  }
  
  .quick-actions {
    flex-direction: column;
    
    .action-button {
      width: 100%;
    }
  }
}

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