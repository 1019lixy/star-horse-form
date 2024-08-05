<script setup lang="ts" name="StarHorseFormObject">
import {inject, onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  size: {type: String, default: "small"},
  isView: {type: Boolean, default: false},
});
const dataForm = defineModel("dataForm");
const dialogProps = inject<DialogProps>("dialogProps", {});
const normalTabList = ref<String>("tab0");
const tableListRef = ref<any>([]);
const setTableRef = (el: any) => {
  if (el) {
    tableListRef.value.push(el);
  }
}
const validMsg = (item: any) => {
  if (item.required && item.disabled != 'Y') {
    return [{'required': true, 'message': '必填项不能为空', 'trigger': 'blur'}];
  }
  return []
};
onMounted(() => {
  if (!dataForm[props.objectName]) {
    dataForm[props.objectName] = {};
  }
});
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array" :gutter="10">
      <template v-for="sitem in item">
        <el-col :span="sitem.colSpan||sitem.preps?.colSpan||(24/item.length)">
          <el-form-item
              :size="size"
              :label="sitem.label"
              :required="sitem.required"
              :prop="sitem.fieldName"
              :rules="sitem.required?validMsg(sitem):[]"
              v-if="sitem.formShow&&sitem.type!='button'&&sitem.type!='comp'">
            <star-horse-item :primaryKey="primaryKey" :compSize="size" v-model:dataForm="dataForm[objectName]"
                             :item="sitem"
                             :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
          </el-form-item>
          <star-horse-item v-else-if="sitem.formShow" :compSize="size" :primaryKey="primaryKey"
                           v-model:dataForm="dataForm[objectName]"
                           :item="sitem"
                           :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
        </el-col>
      </template>
    </el-row>
    <template v-if="item.tabList&&item.tabList.length>0">
      <el-tabs v-model="item.fieldName">
        <template v-for="(tabItem,key) in item.tabList">
          <el-tab-pane :label="tabItem.title" :name="tabItem.tabName||key" :disabled="tabItem.disabled">
            <el-scrollbar height="100%">
            <star-horse-form-item :compUrl="compUrl" :objectName="objectName"  v-model:dataForm="dataForm" :fieldList="{
                        fieldList:tabItem.fieldList,
                        batchFieldList:tabItem.batchFieldList
                         }" :rules="rules" :subCreateFlag="true"
                                  :primaryKey="primaryKey"/>
            </el-scrollbar>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-if="item.cardList&&item.cardList.length>0">
      <template v-for="cardItem in item.cardList">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>{{ cardItem.title || cardItem.tabName }}</span>
              <template v-for="headerItem in cardItem.headerFieldList">
                <star-horse-item :compSize="size" :bareFlag="true" :isView="isView" :primaryKey="primaryKey"
                                 v-model:dataForm="dataForm"
                                 :item="headerItem"
                                 :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
              </template>
            </div>
          </template>
          <star-horse-form-object v-if="cardItem.subFormFlag" :compUrl="compUrl"
                                  :objectName="cardItem.objectName"
                                  :rules="rules"
                                  :size="size"
                                  :isView="isView"
                                  v-model:dataForm="dataForm"
                                  :primaryKey="cardItem.primaryKey" :fieldList="{
                    'fieldList':cardItem.fieldList,
                    'batchFieldList':cardItem.batchFieldList
                  }"/>
          <star-horse-form-item :isView="isView" :compUrl="compUrl" v-else
                                v-model:dataForm="dataForm"
                                :fieldList="{
                                  fieldList:cardItem.fieldList,
                                  batchFieldList:cardItem.batchFieldList
                                 }"
                                :rules="rules" :subCreateFlag="true"
                                :primaryKey="primaryKey"/>

        </el-card>
      </template>
    </template>
    <star-horse-item v-else-if="item.type=='comp'||item.type=='button'" :primaryKey="primaryKey"
                     v-model:dataForm="dataForm[objectName]"
                     :item="item"
                     :compSize="size"
                     :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
      <template v-if="item.batchFieldList.length>1">
        <el-tabs v-model="normalTabList">
          <template v-for="(sitem,key) in item.batchFieldList">
            <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
              <star-horse-form-table :size="size" :rules="rules" :item="sitem" v-model:dataForm="dataForm"/>
            </el-tab-pane>
          </template>
        </el-tabs>
      </template>
      <star-horse-form-table v-else :rules="rules" :size="size" :item="item.batchFieldList[0]"
                             v-model:dataForm="dataForm"/>
    </template>
    <el-form-item
        v-else
        :size="size"
        :label="item.label"
        :required="item.required"
        :rules="item.required?validMsg(item):[]"
        :prop="item.fieldName"
        v-if="item.formShow">
      <star-horse-item :primaryKey="primaryKey" :compSize="size" v-model:dataForm="dataForm[objectName]" :item="item"
                       :isEdit="!dialogProps?.ids||dialogProps?.ids==-1"/>
    </el-form-item>
  </template>
  <template v-if="fieldList[batchFieldName]?.length > 1">
    <el-tabs v-model="fieldList[batchFieldName].fieldName">
      <template v-for="(item,key) in fieldList[batchFieldName]">
        <el-tab-pane :label="item['title']" :name="item.tabName||'sub_tab'+key" :disabled="item.disabled">
          <star-horse-form-table :size="size" :rules="rules" :item="item" v-model:dataForm="dataForm"/>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="fieldList[batchFieldName]?.length == 1">
    <template v-for="item in fieldList[batchFieldName]">
      <star-horse-form-table :size="size" :rules="rules" :item="item" v-model:dataForm="dataForm"/>
    </template>
  </template>
</template>
<style lang="scss" scoped>
:deep(.el-card__header) {
  padding: 10px 20px;
}

.el-card:nth-child(n+1) {
  margin-top: 10px;
  height: 100%;
  overflow: hidden;
}

:deep(.el-card__body) {
  margin-top: 5px;
}

:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  margin: 5px 10px
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
