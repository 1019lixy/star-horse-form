<script setup lang="ts" name="StarHorseDataViewObject">
import {PropType, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseDataView from "@/components/comp/StarHorseDataView.vue";
import StarHorseDataViewTable from "@/components/comp/StarHorseDataViewTable.vue";
import {ModelRef} from "vue-demi";

const props = defineProps({
  // compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String},
  commonFormat: {type: Function, required: true},
});
const dataForm:ModelRef<any> = defineModel("dataForm");
const normalTabList = ref<any>("tab0");
const subTabObject = ref<any>();
const subTabList = ref<any>();

const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  try {
    // console.log(dataForm.value);
    let objInfo = dataForm.value[props.objectName!];
    return objInfo ? objInfo[name] : "--";
  } catch (e) {
    console.log(e);
  }
  return name;
};
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array" :gutter="10">
      <template v-for="sitem in item">
        <el-col :span="sitem.colSpan||sitem.preps?.colSpan||(24/item.length)">
          <div class="item" v-if="sitem.formShow||sitem.tableShow||sitem.viewShow">
            <label>{{ sitem.label }} :</label>
            <div class="content">
              <el-tooltip :content="dataFormat(sitem)">
                {{ dataFormat(sitem) }}
              </el-tooltip>
            </div>
          </div>
        </el-col>
      </template>
    </el-row>
    <template v-if="item.tabList&&item.tabList.length>0">
      <el-tabs v-model="subTabObject">
        <template v-for="tabItem in item.tabList">
          <el-tab-pane :label="tabItem.title||tabItem.tabName">
            <star-horse-data-view :objectName="objectName" :fieldList="{
                        fieldList:tabItem.fieldList,
                        batchFieldList:tabItem.batchFieldList}" :subCreateFlag="true"
                                  :primaryKey="primaryKey"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-if="item.cardList&&item.cardList.length>0">
      <template v-for="cardItem in item.cardList">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              {{ cardItem.title || cardItem.tabName }}
            </div>
          </template>
          <star-horse-data-view :objectName="objectName" :fieldList="{
                        fieldList:cardItem.fieldList,
                        batchFieldList:cardItem.batchFieldList}" :subCreateFlag="true"
                                :primaryKey="primaryKey"/>
        </el-card>
      </template>
    </template>
    <star-horse-item v-else-if="item.type=='comp'" :primaryKey="'id'"
                     v-model:dataForm="dataForm" :item="item"
                     :isView="true"/>
    <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
      <template v-if="item.batchFieldList.length>1">
        <el-tabs v-model="normalTabList">
          <template v-for="(sitem,key) in item.batchFieldList">
            <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
              <star-horse-data-view-table :commonFormat="commonFormat" :item="sitem"
                                          :batchName="sitem['batchName']"
                                          v-model:dataForm="dataForm"/>
            </el-tab-pane>
          </template>
        </el-tabs>
      </template>
      <star-horse-data-view-table v-else :commonFormat="commonFormat" :item="item.batchFieldList[0]"
                                  v-model:dataForm="dataForm" :batchName="item.batchFieldList[0]['batchName']"/>
    </template>
    <template v-else>
      <div class="item" v-if="item.formShow||item.tableShow||item.viewShow">
        <label>{{ item.label }} :</label>
        <div class="content">
          <el-tooltip :content="dataFormat(item)">
            {{ dataFormat(item) }}
          </el-tooltip>
        </div>
      </div>
    </template>
  </template>
  <template v-if="fieldList[batchFieldName] instanceof Array&&fieldList[batchFieldName].length > 0">
    <el-tabs v-model="subTabList">
      <el-tab-pane v-for="(item,key) in fieldList[batchFieldName]" :label="item.title||item.tabName">
        <star-horse-data-view-table v-model:data-form="dataForm[objectName]" :commonFormat="commonFormat"
                                    :batchName="item['batchName']" :item="item"/>
      </el-tab-pane>
    </el-tabs>
  </template>
</template>
<style lang="scss" scoped>

.el-card:nth-child(n+1) {
  margin-top: 10px;
}

</style>
