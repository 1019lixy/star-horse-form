<script setup lang="ts" name="StarHorseItem">
import {inject, onMounted, reactive, ref, unref, watch} from "vue";
import {warning} from "@/utils/message";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import Help from "@/components/help.vue";

const props = defineProps({
      // allItem: {type: Array, required: true},
      item: {type: Object, required: true},
      column: {type: Object},
      primaryKey: {type: String},
      // dataForm: {type: Object, required: true},
      batchName: {type: String, default: ""},
      compSize: {type: String, default: "small"},
      isSearch: {type: Boolean, default: false}, //是否查询数据
      showLabel: {type: Boolean, default: true},//是否显示标签
      isEdit: {type: Boolean, default: false}, //是否编辑数据
      isView: {type: Boolean, default: false} //是否编辑数据
    }
);
const dataForm = defineModel("dataForm");
const itemType = ref<String>("input");
const showPassword = ref(false);
const emit = defineEmits(["dataSearch", "focus", "blur"]);
const formFields = inject("formFields");
const field = ref<any>({
  preps: {
    clearable: "yes",
    label: props.item.label,
    name: props.item.fieldName,
    required: props.item.required,
    size: props.compSize,
    readonly: (props.item.readonly || props.isView) ? 'yes' : 'no',
  }
});
const dataSearch = (act: String) => {
  if (props.isSearch) {
    if (act == "focus" || act == "blur") {
      return;
    }
    emit("dataSearch");
  } else if (act != "keydown.enter") {
    let actionFun = props.item.actions;
    if (actionFun && actionName.value == act) {
      actionFun(dataForm.value)
    }
    if (act == "focus") {
      emit("focus", props.column)
    } else if (act == "blur") {
      emit("blur", props.column)
    }
  } else {

  }
};
//页面属性改变，重新刷新数据
watch(() => props.item,
    () => {
      typePreps();
    }, {
      immediate: false,
      deep: true
    }
);
watch(() => props.isEdit,
    () => {
      field.value.preps["disabled"] = props.item.disabled == 2 ? "yes" : props.isEdit && props.item.disabled == 1 ? "yes" : "no";
    }, {
      immediate: false,
      deep: true
    }
);
const typePreps = () => {
  itemType.value = props.item.type || props.item.fieldType;
  field.value.preps["values"] = props.item.optionList;
  if (itemType.value == "number") {
    field.value.preps["step"] = props.item.step || 1;
    field.value.preps["min"] = props.item.min || 0;
    field.value.preps["precision"] = props.item.precision || 0;
  } else if (itemType.value == "select") {
    field.value.preps["filterable"] = "yes";
    field.value.preps["collapseTags"] = "yes";
    field.value.preps['multiple'] = props.item.multiple ? "yes" : "no";
    field.value.preps['allowCreate'] = props.item.allowCreate ? "yes" : "no";
  } else if (itemType.value == "tselect") {
    field.value.preps["filterable"] = "yes";
    field.value.preps["collapseTags"] = "yes";
    field.value.preps["showCheckbox"] = "yes";
    field.value.preps["props"] = {
      label: 'name',
      value: "value"
    };
    field.value.preps['multiple'] = props.item.multiple ? "yes" : "no";
  } else if (itemType.value == 'cascade') {
    field.value.preps["props"] = {
      label: 'name',
      multiple: props.item.multiple,
      checkStrictly: true
    };
  } else if (itemType.value === 'date' || itemType.value === 'daterange') {
    field.value.preps['type'] = unref(itemType);
    itemType.value = "datetime"
    field.value.preps["valueFormat"] = "YYYY-MM-DD";
    field.value.preps["endPlaceholder"] = "结束日期";
    field.value.preps["rangeSeparator"] = "到";
    field.value.preps["startPlaceholder"] = "开始日期";
  } else if (itemType.value === "dialog-input" || itemType.value == "page-select") {
    let inputPreps = props.item.dialogInputPreps;
    if (!inputPreps) {
      warning("属性" + props.item.label + "需要配置dialogInputPreps 信息");
      return;
    }
    field.value.preps["primaryKey"] = inputPreps.primaryKey;
    field.value.preps["fieldList"] = {
      tableCellEditabled: false,
      fieldList: inputPreps.fieldList
    };
    field.value.preps["searchFieldList"] = [];
    field.value.preps["filterCondition"] = inputPreps.filterCondition;
    field.value.preps["orderBy"] = inputPreps.orderBy;
    inputPreps.fieldList?.forEach((item: FieldInfo) => {
      let temp = {
        ...item
      };
      temp["defaultShow"] = true;
      if (item.type == "input" && !item['matchType']) {
        temp["matchType"] = "lk";
      }
      field.value.preps["searchFieldList"].push(temp);
    });
    field.value.preps["dataUrl"] = inputPreps.dataUrl;
    field.value.preps["needField"] = inputPreps.needField;
    field.value.preps["dataFormat"] = inputPreps.dataFormat;
    // console.log(inputPreps);
    field.value.preps["recall"] = inputPreps.recall;
    field.value.preps["readonly"] = inputPreps.readonly;
  } else if (itemType.value == "switch") {
    field.value.preps["activeText"] = props.item.activeText || "是";
    field.value.preps["inactiveText"] = props.item.inactiveText || "否";
    field.value.preps["activeValue"] = props.item.activeValue || "Y";
    field.value.preps["inactiveValue"] = props.item.inactiveValue || "N";
  } else if (itemType.value == "comp") {
    field.value.preps["params"] = props.item.params || {};
  }
  field.value.preps["actionName"] = actionName.value;
  field.value.preps["disabled"] = props.isView ? "yes" :
      props.item.disabled == 2 ? "yes" : props.isEdit && props.item.disabled == 1 ? "yes" : "no";
  //联动
  field.value.preps['actionRelation'] = props.item.actionRelation;
  //触发事件
  field.value.preps['actions'] = props.item.actions;

  //过滤掉查询表单的信息
  if (!props.isSearch && formFields) {
    let fieldName = field.value.preps["name"];
    //如果数据来源于列表
    if (props.batchName) {
      let batchFields = formFields[props.batchName];
      if (!batchFields) {
        formFields[props.batchName] = [];
      }
      let row = formFields[props.batchName][dataForm.value["xh"] - 1]
      if (!row) {
        formFields[props.batchName].push([]);
      } else {
        row.push(field);
      }
      //[[{},{}],[]]
      // let temp1 = formFields[props.batchName][dataForm.value["xh"] - 1];

    } else {
      formFields[fieldName] = field;
    }

  }
//  console.log(field);
};
const viewOrHide = () => {
  showPassword.value = !showPassword.value;
}
const defaultAction = ref("keydown.enter")
const typeList = ["select", "tselect", "date", "daterange"];
const actionName = ref();
const randId = ref();
const componentRef = ref();
onMounted(() => {
  if (typeList.includes(props.item.type) || typeList.includes(props.item.fieldType)) {
    defaultAction.value = "change";
  }
  randId.value = "Id" + new Date().getTime();
  actionName.value = props.item.actionName ? props.item.actionName : defaultAction.value;
  typePreps();
});
</script>
<style lang="scss" scoped>
:deep(.el-cascader) {
  width: 100%;
}
</style>
<template>
  <div :style="{ 'width': isSearch && field.preps['type'] != 'daterange' ? '150px' : '100%','height':'100%' }">
    <component :id="randId" :is="itemType+'-item'" @selfFunc="dataSearch" :isDesign="false"
               ref="componentRef"
               :field="field" :formFieldList="dataForm"/>
    <help :message="item.helpMsg" v-if="item.helpMsg"/>
  </div>
</template>

<style scoped></style>