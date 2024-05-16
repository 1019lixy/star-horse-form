<script setup lang="ts" name="StarHorseFormItem">
import {inject, ref, Ref,PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormObject from "@/components/comp/StarHorseFormObject.vue";
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
// let batchDefaultValues = ref({});
const dataForm = inject("dataForm") as Ref;
const dialogProps = inject<DialogProps>("dialogProps", {});
const tableListRef = ref<any>([]);
const tabObject = ref<any>(0);
const tabList = ref<any>("tab0");
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
              :prop="sitem.fieldName"
              :rules="sitem.required?[{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}]:[]"
              v-if="sitem.formShow&&sitem.type!='button'">
            <star-horse-item :isView="isView" :primaryKey="primaryKey" v-model:dataForm="dataForm" :item="sitem"
                             :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
          </el-form-item>
          <star-horse-item v-else-if="sitem.formShow" :primaryKey="primaryKey" v-model:dataForm="dataForm"
                           :item="sitem"
                           :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
        </el-col>
      </template>
    </el-row>
    <template v-if="item.tabList&&item.tabList.length>0">

      <el-tabs v-model="item.fieldName" v-on:tab-change="item.actions">
        <template v-for="(tabItem,key ) in item.tabList">
          <el-tab-pane :label="tabItem.title" :name="tabItem.tabName||key" :disabled="tabItem.disabled">
            <template v-if="tabItem.subFormFlag">
              <star-horse-form-object v-if="tabItem.subFormFlag" :compUrl="compUrl" :objectName="tabItem.objectName"
                                      :rules="rules"
                                      :isView="isView"
                                      v-model:dataForm="dataForm"
                                      :primaryKey="tabItem.primaryKey" :fieldList="{
                    'fieldList':tabItem.fieldList,
                    'batchFieldList':tabItem.batchFieldList
                  }"/>
            </template>
            <template v-else>
              <star-horse-form-item :isView="isView" :compUrl="compUrl" :fieldList="{
                                  fieldList:tabItem.fieldList,
                                  batchFieldList:tabItem.batchFieldList
                                 }"
                                    :rules="rules" :subCreateFlag="true"
                                    :primaryKey="primaryKey"/>
            </template>
          </el-tab-pane>
        </template>

      </el-tabs>
    </template>
    <star-horse-item v-else-if="item.type=='comp'||item.type=='button'" :isView="isView" :primaryKey="primaryKey"
                     v-model:dataForm="dataForm"
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
      <star-horse-item :isView="isView" :primaryKey="primaryKey" v-model:dataForm="dataForm" :item="item"
                       :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    </el-form-item>
  </template>

  <template v-if="fieldList[batchFieldName]?.length > 1">
    <el-tabs v-model="tabList">
      <template v-for="(item,key) in fieldList[batchFieldName]">
        <el-tab-pane :label="item['title']" :name="'tab'+key" :disabled="item.disabled">
          <star-horse-form-list
              style="min-height:100px"
              v-model:dataForm="dataForm"
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
  <template v-else-if="fieldList[batchFieldName]?.length ==1">
    <template v-for="(item,key) in fieldList[batchFieldName]">
      <star-horse-form-list
          style="min-height:100px"
          v-model:dataForm="dataForm"
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
