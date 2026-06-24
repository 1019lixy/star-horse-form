<script setup lang="ts">
import {computed, nextTick, onMounted, PropType, ref, unref, watch} from "vue";
import {buttonClickDataField, containerField, fieldPlaceholder} from "@/components/system/items/utils/ItemPreps.js";
import {
  analysisCompDatas,
  getDesignFormStore,
  operationConfirm,
  uuid,
  validRulesList,
  warning
} from "star-horse-lowcode";
import {i18n} from "@/lang/index.js";
import {FormConfig} from "@/components/types";
import type {FormulaConfig} from "@/components/types/FormulaConfig";
import FormulaConfigDialog from "@/components/system/items/form/dialogs/FormulaConfigDialog.vue";
import DataSourceConfigPanel from "@/components/system/items/form/components/DataSourceConfigPanel.vue";
import LinkageConfigPanel from "@/components/system/items/form/components/LinkageConfigPanel.vue";
import DataSourceComp from "@/components/system/items/utils/DataSourceComp.vue";
import LinkPolicyComp from "@/components/system/items/utils/LinkPolicyComp.vue";

defineOptions({
  name: "ItemPropertiesPanel"
});

/** 支持公式配置的组件类型 */
const formulaSupportedTypes = ["input", "number"];

const props = defineProps({
  optional: {type: Object as PropType<FormConfig>}
});
let designForm = getDesignFormStore();
const quickConfig = ref<Record<string, number>>({
  rowNums: 1,
  columnNums: 1
});
let currentItemType = computed(() => {
  let comp = designForm.currentComp;
  comp.type = comp.itemType;
  // rowNums/columnNums may be at top-level (imported JSON) or in preps (created via UI)
  quickConfig.value.rowNums = comp.preps?.rowNums ?? comp.rowNums ?? 1;
  quickConfig.value.columnNums = comp.preps?.columnNums ?? comp.columnNums ?? 1;
  return comp.itemType;
});
let compSize = computed(() => props.optional?.compSize ?? "default");
const model = computed(() => props.optional?.model ?? "simple");
let currentCompCategory = computed(() => designForm.currentCompCategory);

const formProps = computed(() => {
  let preps = designForm.currentFormPreps;
  if (!preps) {
    return {};
  }
  if (!preps?.rules) {
    preps["rules"] = [];
  }
  fieldPlaceholder(preps);
  let keys = Object.keys(preps);
  if (!keys.includes("formVisible")) {
    preps.maxLength = currentItemType.value == "number" ? 10 : 255;
    preps.formVisible = true;
    preps.listVisible = true;
    preps.viewVisible = true;
  }
  return preps;
});

// ==================== 公式配置相关 ====================
const formulaDialogRef = ref<InstanceType<typeof FormulaConfigDialog>>();

/** All form fields available for API linkage target field mapping */
const linkageFormFields = computed(() => {
  const datas = analysisCompDatas(unref(designForm.compList));
  const dataList: any = [];
  Object.entries(datas.compListResult).forEach(([key, value]) => {
    if (value.compType != "container") {
      dataList.push(value);
    }
  });
  return dataList
      .filter((item: any) => item.fieldName)
      .map((item: any) => ({
        label: `${item.preps?.label ?? item.label} (${item.fieldName})`,
        value: item.fieldName,
        name: `${item.preps?.label ?? item.label} (${item.fieldName})`
      }));
});

/** 当前公式配置对象（响应式引用 formProps.formula） */
const formulaConfig = computed<FormulaConfig>(() => {
  if (!formProps.value.formula) {
    formProps.value.formula = {
      enable: false,
      type: "calc",
      sourceFields: [],
      expression: ""
    };
  }
  return formProps.value.formula;
});

/** 获取表单中所有可选字段（排除自身） */
const availableFields = computed(() => {
  const datas = analysisCompDatas(unref(designForm.compList));
  const currentFieldName = formProps.value.name;
  const dataList: any = [];
  Object.entries(datas.compListResult).forEach(([key, value]) => {
    if (value.compType != "container") {
      dataList.push(value);
    }
  });
  return dataList.filter((item: any) => item.fieldName && item.fieldName !== currentFieldName)
      .map((item: any) => ({label: `${item.label} (${item.fieldName})`, value: item.fieldName, id: item.id}));
});

const openFormulaConfig = () => {
  formulaDialogRef.value?.open();
};

let relationComps: Array<string> = [
  "select",
  "tselect",
  "switch",
  "autocomplete",
  "checkbox",
  "radio",
  "cascade",
  "transfer",
  "page-select",
  "dialog-input",
  "icon",
  "datapicker"
];
let exclusionDataSource: Array<string> = [
  "page-select",
  "switch",
  "dialog-input"
];
const dataSourceFormRef = ref();
const dataSourceVisible = ref<boolean>(false);
const dataRelationDialogVisible = ref<boolean>(false);
const buttonDialogVisible = ref<boolean>(false);
const containerDialogVisible = ref<boolean>(false);
/**
 * 自定义验证规则
 */
const customerValid = () => {
  warning(i18n("dyform.common.customValid Developing"));
};
const dataSource = (_type: string) => {
  dataSourceVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
  nextTick(() => {
    setDataSourceData();
  });
};
const setDataSourceData = () => {
  setTimeout(() => {
    dataSourceFormRef.value?.setFormData(formProps.value);
  }, 200);
};
const configRelationPolicy = () => {
  dataRelationDialogVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
  nextTick(() => {
    setRelationInitedData();
  });
};
const setRelationInitedData = () => {
  dataRelationFormRef.value?.setFormData(formProps.value);
};
const editContainerPrep = () => {
  containerDialogVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
};
const setContainerData = () => {
  const temp = {...formProps.value};
  containerPrepRef.value?.setFormData(temp);
};
const changeOperation = (val: any) => {
  if (val?.includes("custom")) {
    customerValid();
  }
};
const buttonClickFormRef = ref<any>(null);

const buttonEventMerge = () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.validate((res: boolean) => {
    if (!res) {
      return;
    }
    const formData = buttonClickFormRef.value.getFormData();
    Object.assign(formProps.value, formData);
  });
};

const buttonEventReset = () => {
  buttonClickFormRef.value.$refs.starHorseFormRef.resetFields();
};
const btnClickOpen = () => {
  buttonDialogVisible.value = true;
  getDesignFormStore().setShortKeyDisabled(true);
};
const closeAction = () => {
  dataSourceVisible.value = false;
  dataRelationDialogVisible.value = false;
  buttonDialogVisible.value = false;
  containerDialogVisible.value = false;
  getDesignFormStore().setShortKeyDisabled(false);
};
const submitValid = async () => {
  const result = await dataSourceFormRef.value.submitValid();
  if (result) {
    closeAction();
  } else {
    operationConfirm(i18n("dyform.common.submitConfirm")).then((res) => {
      closeAction();
    });
  }
};

const dataRelationFormRef = ref<any>(null);
const dataRelationMerge = async () => {
  const result = await dataRelationFormRef.value?.submitValid();

  if (result) {
    closeAction();
  } else {
    operationConfirm(i18n("dyform.common.submitConfirm")).then(() => {
      closeAction();
    });
  }
};
const dataRelationReset = () => {
  dataRelationFormRef.value?.setFormData({});
};

const containerPrepRef = ref<any>(null);

const containerAction = () => {
  const formData = containerPrepRef.value.getFormData().value;
  Object.assign(formProps.value, formData);
  closeAction();
};
const requiredChange = (val: any) => {
  const comp = designForm.currentComp;
  if (comp) {
    comp.required = val;
  }
};
const resetForm = () => {
  // Reset logic if needed
};
const resetDataSourceForm = () => {
  formProps.value["dataSource"] = "data";
  formProps.value["httpMethod"] = null;
  formProps.value["urlOrDictName"] = null;
  formProps.value["queryParams"] = [];
  formProps.value["values"] = [];
};
const init = () => {

};
const boxAndTableQuickConfig = (val: any) => {
  // console.log("boxAndTableQuickConfig", val);
  if (!val.rowNums || !val.columnNums) {
    return;
  }
  if (!formProps.value["rowNums"] || !formProps.value["columnNums"]) {
    // For imported data: if elements already exist with valid structure, preserve them
    // and infer rowNums/columnNums from the existing structure instead of wiping it.
    const existingElements = formProps.value.elements;
    if (Array.isArray(existingElements) && existingElements.length > 0) {
      formProps.value["rowNums"] = existingElements.length;
      formProps.value["columnNums"] = existingElements[0]?.columns?.length || 1;
    } else {
      formProps.value.elements = [];
    }
  }
  const lastRowNums = formProps.value["rowNums"] || 0;
  const lastColNums = formProps.value["columnNums"] || 0;
  // console.log("lastRowNums", lastRowNums);
  // console.log("lastColNums", lastColNums);
  const elements: any = formProps.value.elements;
  const tempRows: any = [];
  if (val.rowNums >= lastRowNums) {
    const rows = val.rowNums - lastRowNums;
    for (let i = 0; i < rows; i++) {
      const columns: any = [];
      for (let j = 0; j < val.columnNums; j++) {
        columns.push({
          id: uuid(),
          colIndex: 1,
          rowspan: 1,
          colspan: currentItemType.value == "box" ? (24 / val.columnNums) : 1,
          items: [],
          cellVisible: true
        });
      }
      tempRows.push({
        id: uuid(),
        colIndex: 1,
        columns: columns
      });
    }
  } else {
    //删掉多余的行
    const rows = val.rowNums - lastRowNums;
    elements.splice(rows, -rows);
  }
  if (val.columnNums >= lastColNums) {
    const cols = val.columnNums - lastColNums;
    elements.forEach((row: any) => {
      for (let i = 0; i < cols; i++) {
        row.columns.push({
          id: uuid(),
          colIndex: 1,
          rowspan: 1,
          colspan: 1,
          cellVisible: true,
          items: []
        });
      }
      if (currentItemType.value == "box") {
        row.columns.forEach((col: any) => {
          col.colspan = 24 / val.columnNums;
        });
      }
    });
  } else {
    const cols = val.columnNums - lastColNums;
    elements.forEach((row: any) => {
      row.columns.splice(cols, -cols);
      if (currentItemType.value == "box") {
        row.columns.forEach((col: any) => {
          col.colspan = 24 / val.columnNums;
        });
      }
    });
  }
  elements.push(...tempRows);
  formProps.value["rowNums"] = val.rowNums;
  formProps.value["columnNums"] = val.columnNums;

};
onMounted(() => {
  init();
});
watch(() => quickConfig.value, (val) => {
  boxAndTableQuickConfig(val);
}, {
  deep: true
});
</script>
<template>
  <star-horse-dialog
      :dialogVisible="buttonDialogVisible"
      :title="i18n('dyform.button.event.title')"
      :isBatch="false"
      :compSize="compSize"
      @merge="buttonEventMerge"
      @closeAction="closeAction"
      @resetForm="buttonEventReset"
      :selfFunc="true"
  >
    <star-horse-form
        :outerFormData="formProps"
        primary-key=""
        :formSize="compSize"
        @inited="setDataSourceData"
        ref="buttonClickFormRef"
        :fieldList="buttonClickDataField()"
    />
  </star-horse-dialog>
  <!--Unified Linkage Strategy-->
  <star-horse-dialog
      :dialogVisible="dataRelationDialogVisible"
      :title="i18n('dyform.data.relation.dialog.title')"
      :isBatch="false"
      :compSize="compSize"
      @merge="dataRelationMerge"
      @closeAction="closeAction"
      @resetForm="dataRelationReset"
      :selfFunc="true"
      boxHeight="80%"
  >
    <link-policy-comp
        ref="dataRelationFormRef"
        :formProps="formProps"
        :model="model"
        :optional="optional"
        :formFields="linkageFormFields"
    />
  </star-horse-dialog>
  <!--Unified Data Source-->
  <star-horse-dialog
      :dialogVisible="dataSourceVisible"
      :title="i18n('dyform.data.source.dialog.title')"
      :isBatch="false"
      :compSize="compSize"
      @merge="submitValid"
      @closeAction="closeAction"
      @resetForm="resetDataSourceForm"
      :selfFunc="true"
      boxHeight="80%"
  >
    <data-source-comp
        ref="dataSourceFormRef"
        :model="model"
        :optional="optional"
        :formProps="formProps"
        :formFields="linkageFormFields"
    />
  </star-horse-dialog>
  <!--容器参数配置-->
  <star-horse-dialog
      :dialogVisible="containerDialogVisible"
      :title="i18n('dyform.container.dialog.title')"
      :isBatch="false"
      @merge="containerAction"
      @closeAction="closeAction"
      @resetForm="resetForm"
      :selfFunc="true"
  >
    <star-horse-form
        ref="containerPrepRef"
        @inited="setContainerData"
        :fieldList="containerField(currentItemType)"
    />
  </star-horse-dialog>
  <el-scrollbar>
    <template v-if="currentCompCategory == 'container'">
      <el-form-item :label="i18n('dyform.props.container.config')" prop="rows">
        <el-button
            type="primary"
            plain
            icon="Setting"
            @click="editContainerPrep"
        >{{ i18n("dyform.props.container.config.btn") }}
        </el-button>
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.quickConfig')" label-position="top" prop="rowAndCol"
                    v-if="['dytable','box'].includes(currentItemType)">
        <el-form-item :label="i18n('dyform.props.quickConfig.rows')">
          <el-input-number v-model="quickConfig.rowNums" min="1" max="500" controls-position="right"/>
        </el-form-item>
        <el-form-item :label="i18n('dyform.props.quickConfig.cols')" style="margin-top: 10px">
          <div class="flex flex-row items-center w-full" v-if="currentItemType=='box'">
            <help :message="i18n('dyform.props.quickConfig.cols.helpMsg')"/>
            <el-select v-model="quickConfig.columnNums" :options="[
              {label:i18n('dyform.props.quickConfig.cols.1'),value:1},
              {label:i18n('dyform.props.quickConfig.cols.2'),value:2},
              {label:i18n('dyform.props.quickConfig.cols.3'),value:3},
              {label:i18n('dyform.props.quickConfig.cols.4'),value:4},
              {label:i18n('dyform.props.quickConfig.cols.6'),value:6},
              {label:i18n('dyform.props.quickConfig.cols.8'),value:8},
              {label:i18n('dyform.props.quickConfig.cols.12'),value:12},
              {label:i18n('dyform.props.quickConfig.cols.24'),value:24}
          ]">
            </el-select>
          </div>
          <el-input-number v-else v-model="quickConfig.columnNums" min="1" max="50"
                           controls-position="right"/>
        </el-form-item>
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item :label="i18n('dyform.props.label')" label-position="top" prop="label" required>
        <el-input
            v-model="formProps.label"
            :placeholder="i18n('dyform.props.label.placeholder')"
            @blur="fieldPlaceholder(formProps)"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.name')" label-position="top" prop="name" required>
        <el-input
            v-model="formProps.name"
            :placeholder="i18n('dyform.props.name.placeholder')"
            @blur="fieldPlaceholder(formProps)"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.maxLength')" label-position="top" prop="maxLength">
        <el-input-number
            v-model="formProps.maxLength"
            controls-position="right"
            min="1"
        />
        <help :message="i18n('dyform.props.maxLength.helpMsg')"/>
      </el-form-item>
      <DataSourceConfigPanel
          :itemType="currentItemType"
          :model="model"
          @open="dataSource"
      />
      <LinkageConfigPanel
          :itemType="currentItemType"
          :model="model"
          @open="configRelationPolicy"
      />

      <el-form-item
          :label="i18n('dyform.props.event')"
          prop="cfgClickEvent"
          v-if="currentItemType == 'button'"
      >
        <el-button type="primary" @click="btnClickOpen">{{ i18n("dyform.props.event.btn") }}</el-button>
      </el-form-item>

      <!-- ==================== 公式计算配置 ==================== -->
      <el-form-item
          :label="i18n('dyform.formula.label')"
          prop="formula"
          v-if="formulaSupportedTypes.includes(currentItemType)"
      >
        <div style="display: flex; align-items: center; width: 100%">
          <el-switch
              v-model="formulaConfig.enable"
              :active-text="i18n('dyform.formula.enable')"
              :inactive-text="i18n('dyform.formula.disable')"
          />
          <help
              v-if="!formulaConfig.enable"
              :message="i18n('dyform.formula.helpMsg')"
          />
          <el-button
              v-if="formulaConfig.enable"
              type="primary"
              plain
              size="small"
              icon="Setting"
              @click="openFormulaConfig"
              style="margin-left: 8px"
          >{{ i18n("dyform.formula.config") }}
          </el-button>
        </div>

      </el-form-item>
      <FormulaConfigDialog
          ref="formulaDialogRef"
          v-model="formulaConfig"
          :prepsConfig="formProps"
          :item-type="currentItemType"
          :fields="availableFields"
      />
      <!-- ==================== 公式计算配置 END ==================== -->

      <el-form-item :label="i18n('dyform.props.rules')" label-position="top" prop="rules">
        <el-select
            v-model="formProps.rules"
            multiple
            @change="changeOperation"
            :placeholder="i18n('dyform.props.rules.placeholder')"
        >
          <el-option
              v-for="item in validRulesList"
              :key="item.value"
              :label="item.name"
              :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.required')" prop="required">
        <el-switch
            @change="requiredChange"
            v-model="formProps.required"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.formVisible')" prop="formVisible">
        <el-switch
            v-model="formProps.formVisible"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>

      <el-form-item :label="i18n('dyform.props.listVisible')" prop="listVisible">
        <el-switch
            v-model="formProps.listVisible"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.searchVisible')" prop="searchVisible">
        <el-switch
            v-model="formProps.searchVisible"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>

      <el-form-item :label="i18n('dyform.props.hideLabel')" prop="hideLabel">
        <el-switch
            v-model="formProps.hideLabel"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item
          :label="i18n('dyform.props.defaultVisible')"
          prop="defaultVisible"
          v-if="formProps.searchVisible"
      >
        <el-switch
            v-model="formProps.defaultVisible"
            :active-text="i18n('dyform.props.defaultVisible.show')"
            :inactive-text="i18n('dyform.props.defaultVisible.hide')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.viewVisible')" prop="viewVisible">
        <el-switch
            v-model="formProps.viewVisible"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>

      <el-form-item :label="i18n('dyform.props.disabled')" prop="disabled">
        <el-switch
            v-model="formProps.disabled"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.editDisabled')" prop="editDisabled">
        <el-switch
            v-model="formProps.editDisabled"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.readonly')" prop="readonly">
        <el-switch
            v-model="formProps.readonly"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.clearable')" prop="clearable">
        <el-switch
            v-model="formProps.clearable"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
      </el-form-item>


      <el-form-item :label="i18n('dyform.props.prototypeDisplay')" prop="prototypeDisplay">
        <el-switch
            v-model="formProps.prototypeDisplay"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
        <help
            :message="i18n('dyform.props.prototypeDisplay.helpMsg')"
        />
      </el-form-item>
      <el-form-item
          :label="i18n('dyform.props.listPrototypeDisplay')" label-position="top"
          prop="listPrototypeDisplay"
          v-if="formProps.prototypeDisplay === true"
      >
        <el-input
            v-model="formProps.listPrototypeDisplay"
            :placeholder="i18n('dyform.props.listPrototypeDisplay.placeholder')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.uniqueValid')" prop="uniqueValid">
        <el-switch
            v-model="formProps.uniqueValid"
            :active-text="i18n('dyform.props.yes')"
            :inactive-text="i18n('dyform.props.no')"
        />
        <help
            :message="i18n('dyform.props.uniqueValid.helpMsg')"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.labelPosition')" label-position="top" prop="labelPosition">
        <el-select
            clearable
            filterable
            v-model="formProps.labelPosition"
            :options="[{label:i18n('dyform.props.labelPosition.top'),value:'top'},{label:i18n('dyform.props.labelPosition.left'),value:'left'},{label:i18n('dyform.props.labelPosition.right'),value:'right'}]"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.helpMsg')" label-position="top" prop="helpMsg">
        <el-input
            v-model="formProps.helpMsg"
            :placeholder="i18n('dyform.props.helpMsg.placeholder')"
            type="textarea"
        />
      </el-form-item>
      <el-form-item :label="i18n('dyform.props.styles')" label-position="top" prop="styles">
        <el-input
            v-model="formProps.styles"
            :placeholder="i18n('dyform.props.styles.placeholder')"
            type="textarea"
        />
      </el-form-item>
    </template>
  </el-scrollbar>
</template>
<style lang="scss" scoped>
</style>
