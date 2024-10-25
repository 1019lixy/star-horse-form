<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {ModelRef} from "vue-demi";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {Config} from "@/api/settings.ts";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  parentPreps: {type: Object, default: {}},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
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
          <template #label>
            <div class="custom-tabs-label">
              <star-horse-icon :icon-class="tabItem.icon" v-if="tabItem.icon"/>
              <span>{{ tabItem.title }}</span>
              <help v-if="tabItem.helpMsg" :message="tabItem.helpMsg"/>
            </div>
          </template>
          <el-scrollbar height="95%">
            <star-horse-form-item v-if="tabItem.objectName" :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  v-model:dataForm="dataForm[tabItem.objectName]"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                 ...tabItem
                                 }"
                                  :rules="rules" :subCreateFlag="tabItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
            <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  v-model:dataForm="dataForm"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                   ...tabItem
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
          <el-tab-pane v-if="Object.keys(sitem).length>0" :label="sitem['title']" :name="sitem.tabName||'tab'+key"
                       :disabled="sitem.disabled">
            <template #label>
              <div class="custom-tabs-label">
                <star-horse-icon :icon-class="sitem.icon" v-if="sitem.icon"/>
                <span>{{ sitem.title }}</span>
              </div>
            </template>
            <star-horse-form-table :size="compSize" :rules="rules" :item="sitem" v-model:dataForm="dataForm"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-else v-for="temp in item.batchFieldList">
      <star-horse-form-table :rules="rules" :size="compSize" :item="temp"
                             v-if="Object.keys(temp).length>0"
                             v-model:dataForm="dataForm"/>
    </template>

  </template>
</template>

<style scoped lang="scss">

</style>
