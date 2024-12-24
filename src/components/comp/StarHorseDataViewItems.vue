<script setup lang="ts" name="StarHorseDataViewObject">
import {PropType} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import {commonParseCodeToName} from "@/api/sh_api.ts";

const props = defineProps({
  // compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subFormFlag: {type: String, default: "N"},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const currentDataFormat = (scope: any) => {
  let item = props.fieldList;
  let val: string = scope.row[item.hideName || item.fieldName];
  //下拉数据,checkbox,radio切换为对应的名称
  if (item.type == "select" || item.type == "checkbox" || item.type == "radio") {
    return item.preps?.values?.find((temp: any) => String(temp.value) == val)?.name || val;
  }
  if (props.commonFormat && scope.column.property) {
    props.commonFormat(scope.column.property, val, scope.row)
  }
  return val;
}
const itemCommonFormat = (name: string, cellValue: any, row: any) => {
  cellValue = commonParseCodeToName(name, cellValue);
  if (name == "isDel") {
    return cellValue == 1 ? "是" : "否";
  }
  return null == props.commonFormat ? cellValue : props.commonFormat(name, cellValue, row);
};

const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  let val = dataForm.value[name];
  try {
    if (item.type == "select" || item.type == "checkbox" || item.type == "radio") {
      return item.preps?.values?.find((temp: any) => String(temp.value) == val)?.name || val;
    }
    return props.commonFormat(name, val);
  } catch (e) {
    console.log(e);
  }
  return val;
};
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <view-box-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
    <view-tab-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
    <view-card-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
    <view-collapse-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
    <view-dytable-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
    <view-other-item :item="item" v-model:dataForm="dataForm" :commonFormat="itemCommonFormat"/>
  </template>
  <view-table-item :item="fieldList" :batch-field-name="batchFieldName" v-model:dataForm="dataForm"
                   :commonFormat="itemCommonFormat"/>
  <div class="view-footer"></div>
</template>
<style lang="scss" scoped>

.view-footer {
  height: 30px;

}

</style>
