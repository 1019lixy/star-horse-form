<script setup lang="ts" name="StarHorseFormItem">
import {inject, ref, Ref, PropType, computed} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormObject from "@/components/comp/StarHorseFormObject.vue";
import {batchFieldDefaultValues} from "@/api/sh_api.ts";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";

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
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "small");
const dataForm = inject("dataForm") as Ref;
const dialogProps = inject<DialogProps>("dialogProps", {});
const tableListRef = ref<any>([]);
const tabObject = ref<any>(0);
const tabList = ref<any>("tab0");
const normalTabList = ref<any>("tab0");
const setTableRef = (el: any) => {
  if (el) {
    tableListRef.value.push(el);
  }
}
const checkObject = (item: any) => {
  if (!Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
}
const validMsg = (item: any) => {
  if (item.required && item.disabled != 'yes') {
    return [{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}];
  }
  return []
};
</script>
<template>

  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array">
      <template v-for="sitem in item">
        <el-col :span="sitem.colSpan||(24/item.length)">
          <el-form-item
              :size="compSize"
              :label="sitem.label"
              :prop="sitem.fieldName"
              :rules="sitem.required?validMsg(sitem):[]"
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
          <el-tab-pane :label="tabItem.title" :name="tabItem.tabName||key" :disabled="tabItem.disabled"
                       :index="checkObject(tabItem)">
            <template v-if="tabItem.subFormFlag">
              <star-horse-form-object v-if="tabItem.subFormFlag" :compUrl="compUrl"
                                      :objectName="tabItem.objectName"
                                      :rules="rules"
                                      :size="compSize"
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

    <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
      <template v-if="item.batchFieldList.length>1">
        <el-tabs v-model="normalTabList">

          <template v-for="(sitem,key) in item.batchFieldList">
            <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
              <star-horse-form-table :rules="rules" :item="sitem" :size="compSize" v-model:dataForm="dataForm"/>
            </el-tab-pane>
          </template>
        </el-tabs>
      </template>
      <star-horse-form-table v-else :rules="rules" :size="compSize" :item="item.batchFieldList[0]"
                             v-model:dataForm="dataForm"/>
    </template>
    <el-form-item
        v-else
        :size="compSize"
        :label="item.label"
        :rules="item.required?validMsg(item):[]"
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
          <star-horse-form-table :rules="rules" :size="compSize" :item="item" v-model:dataForm="dataForm"/>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="fieldList[batchFieldName]?.length ==1">
    <template v-for="(item,key) in fieldList[batchFieldName]">
      <star-horse-form-table :rules="rules" :size="compSize" :item="item" v-model:dataForm="dataForm"/>
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
