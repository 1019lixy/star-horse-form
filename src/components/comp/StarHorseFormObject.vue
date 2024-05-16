<script setup lang="ts" name="StarHorseFormObject">
import {inject, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {batchFieldDefaultValues} from "@/api/sh_api.ts";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object, required: true},
  isView: {type: Boolean, default: false},
});
const dataForm = defineModel("dataForm");
if (!dataForm[props.objectName]) {
  dataForm[props.objectName] = {};

}
const dialogProps = inject<DialogProps>("dialogProps", {});
const subTabObject = ref<any>();
const subTabList = ref<any>();
const tableListRef = ref<any>([]);

const setTableRef = (el: any) => {
  if (el) {
    tableListRef.value.push(el);
  }
}
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array">
      <template v-for="sitem in item">
        <el-col :span="sitem.colSpan||(24/item.length)">
          <el-form-item
              :size="'small'"
              :label="sitem.label"
              :required="sitem.required"
              :prop="dataForm[objectName][sitem.fieldName]"
              :rules="sitem.required?[{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}]:[]"
              v-if="sitem.formShow&&sitem.type!='button'">
            <star-horse-item :primaryKey="primaryKey" v-model:dataForm="dataForm[objectName]" :item="sitem"
                             :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
          </el-form-item>
          <star-horse-item v-else-if="sitem.formShow" :primaryKey="primaryKey" v-model:dataForm="dataForm[objectName]"
                           :item="sitem"
                           :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
        </el-col>
      </template>
    </el-row>
    <template v-if="item.tabList&&item.tabList.length>0">
      <el-tabs v-model="item.fieldName">
        <template v-for="(tabItem,key) in item.tabList">
          <el-tab-pane :label="tabItem.title" :name="tabItem.tabName||key" :disabled="tabItem.disabled">
            <star-horse-form-item :compUrl="compUrl" :objectName="objectName" :fieldList="{
                        fieldList:tabItem.fieldList,
                        batchFieldList:tabItem.batchFieldList}" :rules="rules" :subCreateFlag="true"
                                  :primaryKey="primaryKey"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <star-horse-item v-else-if="item.type=='comp'||item.type=='button'" :primaryKey="primaryKey"
                     v-model:dataForm="dataForm[objectName]"
                     :item="item"
                     :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    <el-form-item
        v-else
        :size="'small'"
        :label="item.label"
        :required="item.required"
        :rules="item.required?[{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}]:[]"
        :prop="item.fieldName"
        v-if="item.formShow">
      <star-horse-item :primaryKey="primaryKey" v-model:dataForm="dataForm[objectName]" :item="item"
                       :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    </el-form-item>
  </template>
  <template v-if="fieldList[batchFieldName]?.length > 1">
    <el-tabs v-model="fieldList[batchFieldName].fieldName">
      <template v-for="(item,key) in fieldList[batchFieldName]">
        <el-tab-pane :label="item['title']" :name="item.tabName||'sub_tab'+key" :disabled="item.disabled">
          <star-horse-form-list
              style="min-height:100px"
              v-model:dataForm="dataForm[objectName]"
              :compUrl="item['compUrl']"
              :primaryKey="item['primaryKey']"
              :batchName="item['batchName']"
              :initRows="item['initRows']"
              :batchUrl="item['batchUrl']"
              :downloadTemplateUrl="item['downloadTemplateUrl']"
              :importInfo="item['importInfo']"
              :defaultValues="batchFieldDefaultValues(item)"
              :ref="setTableRef"
              :field-list="item['fieldList']"
              :rules="item['rules']||rules"
          />
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="fieldList[batchFieldName]?.length == 1">
    <template v-for="item in fieldList[batchFieldName]">
      <star-horse-form-list
          style="min-height:100px"
          v-model:dataForm="dataForm[objectName]"
          :compUrl="item['compUrl']"
          :primaryKey="item['primaryKey']"
          :batchName="item['batchName']"
          :initRows="item['initRows']"
          :batchUrl="item['batchUrl']"
          :title="item['title']"
          :downloadTemplateUrl="item['downloadTemplateUrl']"
          :importInfo="item['importInfo']"
          :defaultValues="batchFieldDefaultValues(item)"
          :ref="setTableRef"
          :field-list="item['fieldList']"
          :rules="item['rules']||rules"
      />
    </template>
  </template>
</template>
<style lang="scss" scoped>
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content ) {
  height: 100%;
  flex: 1;
}

:deep(.el-tab-pane) {
  height: 100%;
  flex: 1;
}

:deep(.el-form) {
  display: block;
  width: 100%;
}

.data-form {
  height: 100%;
}
</style>
