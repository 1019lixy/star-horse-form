<script setup lang="ts" name="StarHorseFormItem">
import {inject, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import {Config} from "@/api/settings.ts";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String},
  compSize: {type: String, default: Config.compSize},
  rules: {type: Object},
  isView: {type: Boolean, default: false},
});
const emits = defineEmits(["addRow", "removeRow"]);
const dataForm: ModelRef<any> = defineModel("dataForm");
const dialogProps = inject<DialogProps>("dialogProps", {});
/**
 * 列表添加行数据
 * @param row
 */
const addRow = (row: any) => {
  emits("addRow", row);
}
/**
 * 列表删除行数据
 * @param row
 */
const removeRow = (row: any) => {
  emits("removeRow", row);
}
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <box-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
              :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
              :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
              :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>

    <tab-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
              :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
              :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
              :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>

    <collapse-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
                   :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
                   :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
                   :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    <card-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
               :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
               :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
               :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    <dytable-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
                  :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
                  :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
                  :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    <other-item :primary-key="primaryKey" :item="item" :rules="rules" :batchFieldName="batchFieldName"
                :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
                :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
                :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
  </template>
  <table-item :primary-key="primaryKey" :item="fieldList" :rules="rules" :batchFieldName="batchFieldName"
              :batchName="batchName" :compSize="compSize" :compUrl="compUrl" :subCreateFlag="subCreateFlag"
              :isView="isView" :objectName="objectName" v-model:dataForm="dataForm" :parentPreps="fieldList.preps"
              :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
</template>
<style lang="scss" scoped>

</style>
