<script setup lang="ts" name="StarHorseDataView">
import {ApiUrls} from "@/components/types/ApiUrls";
import {inject, nextTick, onMounted, ref, watch,PropType} from "vue";
import {DialogProps} from "@/components/types/DialogProps";
import {commonParseCodeToName, loadById, rowClassName} from "@/api/sh_api";
import {Config} from "@/api/settings";
import StarHorseDataViewObject from "@/components/comp/StarHorseDataViewObject.vue";

const dataForm = ref({});
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  fieldList: {type: Object, required: true},
  batchFieldName: {type: String, default: "batchFieldList"},
  dataFormat: {type: Function, default: null}
});
const emits = defineEmits(["dataLoaded"]);
const dialogProps = inject<DialogProps>("dialogProps") as any;
watch(() => dialogProps.ids,
    (val) => {
      if (val == -2) {
      } else if (!val || val == -1) {
        dataForm.value = {};
      } else {
        loadData();
      }
    }, {
      // immediate: true,
      deep: true
    });
onMounted(() => {
  if (dialogProps.ids) {
    loadData();
  }
});
const loadData = async () => {
  await nextTick();
  let id = dialogProps.ids instanceof Array ? dialogProps.ids[0] : dialogProps.ids;
  if (!props.compUrl) {
    return;
  }
  let objData = await loadById(props.compUrl?.loadByIdUrl, id, true);
  dataForm.value = objData;
  await nextTick(() => {
    emits("dataLoaded", objData,true);
  });
};
const viewDataFormat = (row: any, column: any, cellValue: any, index: number) => {
  //如果在这个地方遍历是否有隐藏属性，会拉低系统性能
  return commonFormat(column.property, cellValue, row);
};
const commonFormat = (name: string, cellValue: any, row: any) => {
  cellValue = commonParseCodeToName(name, cellValue);
  if (name == "isDel") {
    return cellValue == 1 ? "是" : "否";
  }
  return null == props.dataFormat ? cellValue : props.dataFormat(name, cellValue, dataForm.value);
};
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  try {
    return commonFormat(name, dataForm.value[name], null);
  } catch (e) {
    console.log(e);
  }
  return "--";
};
const tabObject = ref<any>(0);
const tabList = ref<any>("tab0");
</script>
<template>
  <template v-for="item in fieldList.fieldList">
    <el-row v-if="item instanceof Array">
      <el-col :span="24/item.length" v-for="sitem in item">
        <div class="item" v-if="sitem.formShow||sitem.tableShow||sitem.viewShow">
          <label>{{ sitem.label }} :</label>
          <div class="content">
            <el-tooltip :content="dataFormat(sitem)">
              {{ dataFormat(sitem) }}
            </el-tooltip>
          </div>
        </div>
      </el-col>
    </el-row>
    <template v-else-if="item.tabList&&item.tabList.length>0">
      <el-tabs v-model="tabObject" type="border-card">
        <template v-for="(tabItem,key )  in item.tabList">
          <el-tab-pane :label="tabItem.tabName" :name="key">
            <template v-if="tabItem.subFormFlag">
              <star-horse-data-view-object :objectName="tabItem.objectName"
                                           :subCreateFlag="true"
                                           v-bind:data-form="dataForm"
                                           :commonFormat="commonFormat"
                                           primaryKey="id"
                                           :fieldList="{
               fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"/>
            </template>
            <template v-else>
              <star-horse-data-view :compUrl="compUrl" :fieldList="{
              fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"
              />
            </template>

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
          <el-tooltip
              :content="dataFormat(item)">
            {{ dataFormat(item) }}
          </el-tooltip>
        </div>
      </div>
    </template>
  </template>

  <template v-if="fieldList[batchFieldName] instanceof Array&&fieldList[batchFieldName].length > 0">
    <el-tabs v-model="tabList">
      <template v-for="(item,key) in fieldList[batchFieldName]">
        <el-tab-pane :label="item['title']" :name="'tab'+key">
          <el-table
              :data="dataForm[item['batchName']]"
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
            </template>
          </el-table>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
</template>
<style lang="scss" scoped>
:deep(.el-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.el-tabs {
  height: 100%;
}

:deep(.el-tabs__content ) {
  height: 100%;
  flex: 1;
}

:deep(.el-tab-pane) {
  height: 100%;
  flex: 1;
}

:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}
</style>