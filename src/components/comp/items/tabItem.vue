<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {ModelRef} from "vue-demi";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: "default"},
  isView: {type: Boolean, default: false},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const normalTabList = ref<string>("tab0");
const checkObject = (item: any) => {
  if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
}
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.tabList&&item.tabList.length>0">
    <el-tabs v-model="item.fieldName" :closable="item.closable=='Y'" v-on:tab-change="item.actions">
      <template v-for="(tabItem,key) in item.tabList">
        <el-tab-pane :label="tabItem.title" :name="tabItem.tabName||key" :disabled="tabItem.disabled"
                     :index="checkObject(tabItem)">
          <el-scrollbar height="95%">
            <star-horse-form-item v-if="tabItem.objectName" :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  v-model:dataForm="dataForm[tabItem.objectName]"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                  fieldList:tabItem.fieldList,
                                  batchFieldList:tabItem.batchFieldList
                                 }"
                                  :rules="rules" :subCreateFlag="tabItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
            <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  v-model:dataForm="dataForm"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                  fieldList:tabItem.fieldList,
                                  batchFieldList:tabItem.batchFieldList
                                 }"
                                  :rules="rules" :subCreateFlag="tabItem.subFormFlag"
                                  :primaryKey="primaryKey"/>

          </el-scrollbar>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
    <template v-if="item.batchFieldList.length>1&&(!item.displayStyle||item.displayStyle=='tab')">
      <el-tabs v-model="normalTabList">
        <template v-for="(sitem,key) in item.batchFieldList">
          <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
            <star-horse-form-table :size="compSize" :rules="rules" :item="sitem" v-model:dataForm="dataForm"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-else>
      <star-horse-form-table  :rules="rules" :size="compSize" :item="temp"
                             v-model:dataForm="dataForm" v-for="temp in item.batchFieldList"/>
    </template>

  </template>
</template>

<style scoped lang="scss">

</style>
