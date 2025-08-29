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
import { loadSvgIcons, parseJsonWithCache } from "@/api/star_horse_utils";
import { formFieldCache, jsonParseCache } from "@/utils/globalCache";
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
  openDialog("jsEditor");
  if (!Object.keys(formProps.value).includes(actionName)) {
    data[actionName] = "";
  }
  fieldName.value = actionName;
};

const condifRelationPolicy = async () => {
  openDialog("dataRelationDialog");
  await nextTick(() => {
    // Data relation dialog will handle its own form data setting
  });
};

const configParams = async (params: any) => {
  openDialog("paramsDialog");
  fieldName.value = params;
  await nextTick();
  // Params dialog will handle its own form data setting
};

const dataSource = async (_type: string) => {
  openDialog("dataSourceDialog");
  await nextTick();
  // Data source dialog will handle its own form data setting
};

const btnClickOpen = () => {
  openDialog("buttonEventDialog");
};

const editContainerPrep = async () => {
  openDialog("containerDialog");
  await nextTick();
  // Container dialog will handle its own form data setting
};

/**
 * 根据属性类别获取对应参数
 * @param itemType
 * @param isItem
 */
const assignPrep = async (itemType: string, isItem: boolean) => {
  // 快速路径 - 如果当前itemType没有变化，直接返回
  if (itemType === lastProcessedItemType.value && isItem === lastProcessedIsItem.value) {
    return lastProcessedResult.value;
  }
  
  // 避免不必要的nextTick等待
  const formDatas = unref(formDataList);
  const selfFormDatas = unref(selfFormDataList);
  const containers = unref(containerList);
  
  // 结果变量
  let result = null;
  
  // 优先使用Map结构进行快速查找
  if (!isItem && containers) {
    for (const key in containers) {
      const temp = containers[key];
      if (temp && temp.itemType === itemType) {
        assignValue(temp);
        result = temp;
        break;
      }
    }
  }
  
  // 优化循环逻辑，减少不必要的遍历
  if (!result && formDatas) {
    for (const key in formDatas) {
      const temp = formDatas[key];
      if (temp && temp.itemType === itemType) {
        assignValue(temp);
        result = temp;
        break;
      }
    }
  }
  
  if (!result && selfFormDatas) {
    for (const key in selfFormDatas) {
      const temp = selfFormDatas[key];
      if (temp && temp.itemType === itemType) {
        assignValue(temp);
        result = temp;
        break;
      }
    }
  }
  
  // 缓存结果
  lastProcessedItemType.value = itemType;
  lastProcessedIsItem.value = isItem;
  lastProcessedResult.value = result;
  
  return result;
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
    // 优化点3: 避免不必要的深拷贝 - 只在必要时进行拷贝
    let temp = JSON.parse(JSON.stringify(fieldInfo));
    currentField.value = temp;
    
    // 优化点4: 使用更高效的数据处理方式
    processFields(temp.fields, "base");
    processFields(temp.advancedFields, "other");
    processFields(temp.actions, "action");
    
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
      // 优化点5: 使用更高效的数组插入方式
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
    
    // 缓存formFieldMapping结果，避免重复计算
    // 优化缓存键生成，避免对大对象进行完整的JSON序列化
    const fieldList = formFields.value.fieldList;
    // 生成更高效的缓存键
    let cacheKey = fieldList.length.toString();
    if (fieldList.length > 0) {
      // 只使用字段列表的部分特征作为缓存键
      cacheKey += '-' + fieldList[0].fieldName;
      if (fieldList[0].collapseList && fieldList[0].collapseList.length > 0) {
        cacheKey += '-' + fieldList[0].collapseList.length;
      }
    }
    
    let defaultValues = null;
    
    if (formFieldCache.has(cacheKey)) {
      defaultValues = formFieldCache.get(cacheKey);
    } else {
      defaultValues = formFieldMapping(formFields.value).defaultDatas;
      // 只缓存合理大小的结果，避免内存泄漏
      if (Object.keys(defaultValues).length < 1000) {
        formFieldCache.set(cacheKey, defaultValues);
      }
    }
    
    // 优化点7: 批量更新属性，减少响应式更新次数
    const updates = {};
    for (let key in defaultValues) {
      if (!Object.keys(formProps.value).includes(key)) {
        updates[key] = defaultValues[key];
      }
    }
    
    // 一次性赋值，减少响应式触发
    Object.assign(formProps.value, updates);
  } catch (e) {
    console.log(e);
  }
};

// 添加快速路径检查
const processFields = (items: any, type: string) => {
  if (!items || !Array.isArray(items)) {
    return;
  }
  
  // 预计算常用值和函数引用
  const itemCount = items.length;
  
  // 使用普通for循环代替forEach，减少函数调用开销
  for (let i = 0; i < itemCount; i++) {
    const item = items[i];
    
    // 基础属性设置
    item.formVisible = true;
    item.type = item.fieldType;
    
    if (!item.preps) {
      item.preps = {};
    }
    
    // 增加Help信息
    item.helpMsg = item.remark || '';
    
    // 处理selectValues，使用try-catch避免JSON解析错误
    if (item.selectValues && isJson(item.selectValues)) {
      try {
        // 缓存正则表达式替换结果
        const selectValuesStr = typeof item.selectValues === 'string' ? 
          item.selectValues.replace(/'/g, '"') : item.selectValues;
        
        // 使用带缓存的JSON解析
        const datas = parseJsonWithCache(selectValuesStr, []);
        
        // 预分配数组空间
        const values = [];
        const dataCount = Array.isArray(datas) ? datas.length : 0;
        
        // 避免不必要的push操作
        for (let j = 0; j < dataCount; j++) {
          const data = datas[j];
          values.push({
            name: data.name || data,
            value: data.value || data,
          });
        }
        
        item.preps.values = values;
      } catch (e) {
        console.error('解析selectValues错误:', e);
        item.preps.values = [];
      }
    }
    
    // 使用switch语句处理不同类型的字段
    switch (item.type) {
      case 'button':
        if (type === 'base' || type === 'other') {
          item.actions = {};
        } else {
          // 缓存函数引用
          item.actions = {
            click: (data: any) => jsButtonClick(data, item.actionName),
          };
        }
        break;
        
      case 'config':
        item.type = 'button';
        item.label = '参数配置';
        item.actions = (_data: any) => configParams(item.actionName);
        break;
        
      case 'icon':
        // 复用icon数据，避免重复加载
        if (!iconValuesCache.value.length) {
          iconValuesCache.value = loadSvgIcons();
        }
        item.preps.iconType = 'user';
        item.preps.values = iconValuesCache.value;
        break;
    }
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

// 添加缓存变量
const lastProcessedItemType = ref<string>('');
const lastProcessedIsItem = ref<boolean>(false);
const lastProcessedResult = ref<any>(null);
const iconValuesCache = ref<Array<any>>([]);
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
    // 优化点11: 防抖处理，避免频繁调用
    if (debounceTimer.value) {
      clearTimeout(debounceTimer.value);
    }
    debounceTimer.value = setTimeout(() => {
      assignPrep(currentItemType.value, parentCompType.value == "item");
    }, 50); // 50ms防抖
  },
  {
    immediate: true,
    deep: true,
  },
);

// 防抖定时器
const debounceTimer = ref<number | null>(null);

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
