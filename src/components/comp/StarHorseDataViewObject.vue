<script setup lang="ts" name="StarHorseDataViewObject">
import {inject, ref, Ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PropType} from "vue/dist/vue";
import {DialogProps} from "@/components/types/DialogProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {rowClassName} from "@/api/sh_api";
import {Config} from "@/api/settings";
import StarHorseDataView from "@/components/comp/StarHorseDataView.vue";

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
        <el-col :span="24/item.length">
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
          <el-tab-pane :label="tabItem.tabName">
            <star-horse-data-view :objectName="objectName" :fieldList="{
                        fieldList:tabItem.fieldList,
                        batchFieldList:tabItem.batchFieldList}" :subCreateFlag="true"
                                  :primaryKey="primaryKey"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <star-horse-item v-else-if="item.type=='comp'" :primaryKey="'id'" v-model:dataForm="dataForm" :item="item"
                     :isView="true"/>
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
      <el-tab-pane v-for="(item,key) in fieldList[batchFieldName]" :label="item['title']">
        <el-table
            :data="dataForm[objectName]?dataForm[objectName][item['batchName']]:[]"
            fit=true
            border
            :stripe="true"
            height="400px"
            :row-class-name="rowClassName"
            :highlight-current-row="true"
            :header-cell-style="{'background':'var(--star-horse-white)',
      'color': 'var(--star-horse-font-color)',
      'font-size':'12px',
      'background-image': '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))'
      }"
            :cell-style="{'font-size':'12px'}"
        >
          <el-table-column
              label="序号"
              align="center"
              prop="xh"
              width="50"
          />
          <template v-for="sitem in item['fieldList']">
            <el-table-column
                :prop="sitem.hideName||sitem.fieldName"
                :label="sitem.label"
                sortable
                v-if="sitem.formShow||sitem.tableShow||sitem.viewShow"
                :formatter="viewDataFormat"
                :min-width="(item.minWidth||Config.defaultColumnWidth) + 'px'"
            />
            {{ dataFormat(sitem) }}
          </template>
        </el-table>
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
