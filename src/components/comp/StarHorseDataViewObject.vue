<script setup lang="ts" name="StarHorseDataViewObject">
import {PropType, ref} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {rowClassName} from "@/api/sh_api";
import {Config} from "@/api/settings";
import StarHorseDataView from "@/components/comp/StarHorseDataView.vue";
import StarHorseDataViewTable from "@/components/comp/StarHorseDataViewTable.vue";

const props = defineProps({
  // compUrl: {type: Object as PropType<ApiUrls>},
  fieldList: {type: Object as PropType<PageFieldInfo>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  commonFormat: {type: Function, required: true},
});
let batchDefaultValues = ref({});
const dataForm = defineModel("dataForm");
const normalTabList = ref<any>("tab0");
const subTabObject = ref<any>();
const subTabList = ref<any>();
const viewDataFormat = (row: any, column: any, cellValue: any, index: number) => {
  //如果在这个地方遍历是否有隐藏属性，会拉低系统性能
  return props.commonFormat(column.property, cellValue, row);
};
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  try {
    // console.log(dataForm.value);
    let objInfo = dataForm.value[props.objectName];
    return objInfo ? objInfo[name] : "--";
  } catch (e) {
    console.log(e);
  }
  return name;

};
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array">
      <template v-for="sitem in item">
        <el-col :span="sitem.colSpan||(24/item.length)">
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
