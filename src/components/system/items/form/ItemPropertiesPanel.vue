<script setup lang="ts" name="ItemPropertiesPanel">
import { computed, nextTick, onMounted, ref, unref } from "vue";
import {
  buttonClickDataField,
  containerField,
  fieldPlaceholder,
  relationDataField,
} from "@/components/system/items/utils/ItemPreps.js";
import { piniaInstance, useDesignFormStore, warning } from "star-horse-lowcode";
import { validRulesList } from "@/api/valid_utils.js";
import Help from "@/components/help.vue";
import { i18n } from "@/lang/index.js";
import DataSourceComp from "@/components/system/items/utils/DataSourceComp.vue";
defineProps({
  compSize: { type: String, default: "default" },
});
let designForm = useDesignFormStore(piniaInstance);

let currentItemType = computed(() => {
  let comp = designForm.currentComp;
  comp.type = comp.itemType;
  return comp.itemType;
});
let currentCompCategory = computed(() => designForm.currentCompCategory);
const formProps = computed(() => {
  let preps = unref(designForm.currentFormPreps);
  if (!preps.rules) {
    preps.rules = [];
  }
  fieldPlaceholder(preps);
  let keys = Object.keys(preps);
  if (!keys.includes("maxLength")) {
    preps.maxLength = currentItemType.value == "number" ? 10 : 255;
  }
  if (!keys.includes("formVisible")) {
    preps.formVisible = true;
  }
  if (!keys.includes("listVisible")) {
    preps.listVisible = true;
  }
  if (!keys.includes("viewVisible")) {
    preps.viewVisible = true;
  }
  return preps;
});
let relationComps: Array<string> = [
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
];
let exclusionDataSource: Array<string> = [
  "page-select",
  "switch",
  "dialog-input",
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
  warning("自定义验证规则开发中");
};
const dataSource = (_type: string) => {
  dataSourceVisible.value = true;
  nextTick(() => {
    setDataSourceData();
  });
};
const setDataSourceData = () => {
  dataSourceFormRef.value?.setFormData(formProps.value);
};
const configRelationPolicy = () => {
  dataRelationDialogVisible.value = true;
  nextTick(() => {
    setRelationInitedData();
  });
};
const setRelationInitedData = () => {
  dataRelationFormRef.value?.setFormData(formProps.value["dataRelation"] || {});
};
const editContainerPrep = () => {
  containerDialogVisible.value = true;
};
const setContainerData = () => {
  const temp = {};
  Object.assign(temp, formProps.value);
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
};
const closeAction = () => {
  dataSourceVisible.value = false;
  dataRelationDialogVisible.value = false;
  buttonDialogVisible.value = false;
  containerDialogVisible.value = false;
};
const submitValid = async () => {
  const result = await dataSourceFormRef.value.submitValid();
  if (result) {
    closeAction();
  }
};

const dataRelationFormRef = ref<any>(null);
const dataRelationMerge = async () => {
  let flag: boolean = false;
  const formRef = dataRelationFormRef.value?.$refs.starHorseFormRef;
  await formRef.validate((res: boolean) => {
    flag = res;
  });
  if (!flag) {
    return;
  }
  formProps.value["dataRelation"] =
    dataRelationFormRef.value.getFormData().value;
  closeAction();
};
const dataRelationReset = () => {
  dataRelationFormRef.value.setFormData({});
};

const containerPrepRef = ref<any>(null);

const containerAction = () => {
  const formData = containerPrepRef.value.getFormData().value;
  Object.assign(formProps.value, formData);
  closeAction();
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
const init = () => {};
onMounted(() => {
  init();
});
</script>
<template>
  <star-horse-dialog
    :dialogVisible="buttonDialogVisible"
    :title="i18n('dyform.button.event.title')"
    :isBatch="false"
    @merge="buttonEventMerge"
    @closeAction="closeAction"
    @resetForm="buttonEventReset"
    :selfFunc="true"
  >
    <star-horse-form
      :outerFormData="formProps"
      primary-key=""
      @inited="setDataSourceData"
      ref="buttonClickFormRef"
      :fieldList="buttonClickDataField()"
    />
  </star-horse-dialog>
  <!--配置数据-->
  <star-horse-dialog
    :dialogVisible="dataRelationDialogVisible"
    :title="i18n('dyform.data.relation.dialog.title')"
    :isBatch="false"
    @merge="dataRelationMerge"
    @closeAction="closeAction"
    @resetForm="dataRelationReset"
    :selfFunc="true"
  >
    <star-horse-form
      primary-key=""
      ref="dataRelationFormRef"
      @inited="setRelationInitedData"
      :fieldList="relationDataField(formProps)"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialogVisible="dataSourceVisible"
    :title="i18n('dyform.data.source.dialog.title')"
    :isBatch="false"
    @merge="submitValid"
    @closeAction="closeAction"
    @resetForm="resetDataSourceForm"
    :selfFunc="true"
    boxHeight="80%"
  >
    <data-source-comp ref="dataSourceFormRef" :formProps="formProps" />
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
      <el-form-item label="配置容器属性" prop="rows">
        <el-button
          type="primary"
          plain
          icon="Setting"
          @click="editContainerPrep"
          >配置
        </el-button>
      </el-form-item>
    </template>
    <template v-else>
      <el-form-item label="标签名称" prop="label" required>
        <el-input
          v-model="formProps.label"
          placeholder="请输入标签名"
          @blur="fieldPlaceholder(formProps)"
        />
      </el-form-item>
      <el-form-item label="字段名称" prop="name" required>
        <el-input
          v-model="formProps.name"
          placeholder="请输入字段名"
          @blur="fieldPlaceholder(formProps)"
        />
      </el-form-item>
      <el-form-item label="数据长度" prop="maxLength">
        <el-input-number
          v-model="formProps.maxLength"
          controls-position="right"
          min="1"
        />
        <help :message="`长度超过4000，后台自动转为文本类型如：text,clob等`" />
      </el-form-item>
      <el-form-item
        label="数据源"
        prop="dataSource"
        v-if="
          !exclusionDataSource.includes(currentItemType) &&
          relationComps.includes(currentItemType)
        "
      >
        <el-button type="primary" plain icon="Setting" @click="dataSource"
          >配置
        </el-button>
        <help :message="`配置当前属性的备选数据项`" />
      </el-form-item>
      <el-form-item
        label="联动策略"
        prop="dataRelation"
        v-if="
          relationComps.includes(currentItemType) && currentItemType != 'icon'
        "
      >
        <el-button
          type="primary"
          plain
          icon="Setting"
          @click="configRelationPolicy"
          >配置
        </el-button>
        <help
          :message="`当前属性数据改变，控制表单内其他属性的数据范围及操作行为`"
        />
      </el-form-item>
      <el-form-item
        label="事件"
        prop="cfgClickEvent"
        v-if="currentItemType == 'button'"
      >
        <el-button type="primary" @click="btnClickOpen">配置</el-button>
      </el-form-item>
      <el-form-item label="校验规则" prop="rules">
        <el-select
          v-model="formProps.rules"
          multiple
          @change="changeOperation"
          placeholder="请选择校验规则"
        >
          <el-option
            v-for="item in validRulesList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="是否必须" prop="required">
        <el-switch
          v-model="formProps.required"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="表单显示" prop="formVisible">
        <el-switch
          v-model="formProps.formVisible"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>

      <el-form-item label="列表可见" prop="listVisible">
        <el-switch
          v-model="formProps.listVisible"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="查询可见" prop="searchVisible">
        <el-switch
          v-model="formProps.searchVisible"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item
        label="显示方式"
        prop="defaultVisible"
        v-if="formProps.searchVisible"
      >
        <el-switch
          v-model="formProps.defaultVisible"
          active-text="默认展示"
          inactive-text="默认隐藏"
        />
      </el-form-item>
      <el-form-item label="查看可见" prop="viewVisible">
        <el-switch
          v-model="formProps.viewVisible"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>

      <el-form-item label="全局禁用" prop="disabled">
        <el-switch
          v-model="formProps.disabled"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="修改禁用" prop="editDisabled">
        <el-switch
          v-model="formProps.editDisabled"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="全局只读" prop="readonly">
        <el-switch
          v-model="formProps.readonly"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>
      <el-form-item label="可清除" prop="clearable">
        <el-switch
          v-model="formProps.clearable"
          active-text="是"
          inactive-text="否"
        />
      </el-form-item>

      <el-form-item label="原样显示" prop="prototypeDisplay">
        <el-switch
          v-model="formProps.prototypeDisplay"
          active-text="是"
          inactive-text="否"
        />
        <help
          :message="`如果设置为true，组件值将原样显示，不进行任何处理，主要使用在数据列表`"
        />
      </el-form-item>
      <el-form-item
        label="组件值"
        prop="listPrototypeDisplay"
        v-if="formProps.prototypeDisplay === true"
      >
        <el-input
          v-model="formProps.listPrototypeDisplay"
          placeholder="请输入组件值"
        />
      </el-form-item>
      <el-form-item label="唯一性校验" prop="uniqueValid">
        <el-switch
          v-model="formProps.uniqueValid"
          active-text="是"
          inactive-text="否"
        />
        <help
          :message="`如果开启此功能，\n在新增数据时系统对数据进行唯一性校验。`"
        />
      </el-form-item>
      <el-form-item label="提示信息" prop="helpMsg">
        <el-input
          v-model="formProps.helpMsg"
          placeholder="请输入提示信息"
          type="textarea"
        />
      </el-form-item>
    </template>
  </el-scrollbar>
</template>
<style lang="scss" scoped></style>
