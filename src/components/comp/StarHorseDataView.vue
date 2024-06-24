<script setup lang="ts" name="StarHorseDataView">
import {ApiUrls} from "@/components/types/ApiUrls";
import {inject, nextTick, onMounted, PropType, ref, watch} from "vue";
import {DialogProps} from "@/components/types/DialogProps";
import {commonParseCodeToName, formFieldMapping, loadById} from "@/api/sh_api";
import StarHorseDataViewObject from "@/components/comp/StarHorseDataViewObject.vue";
import StarHorseDataViewTable from "@/components/comp/StarHorseDataViewTable.vue";

const dataForm = ref({});
const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  fieldList: {type: Object, required: true},
  globalCondition: {type: Object},
  batchFieldName: {type: String, default: "batchFieldList"},
  dataFormat: {type: Function, default: null}
});
const emits = defineEmits(["dataLoaded"]);
const dialogProps = inject<DialogProps>("dialogProps") as any;
const normalTabList = ref<any>("tab0");
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
  let params = props.globalCondition || {};
  let objData = await loadById(props.compUrl?.loadByIdUrl, id, true, params);
  let data = formFieldMapping(props.fieldList);
  dataForm.value = objData;
  let mapping = data.mappingFields;
  if (mapping) {
    for (let index in mapping) {
      let temp = mapping[index];
      dataForm.value[temp.name] = dataForm.value[temp.alias];
    }
  }
  await nextTick(() => {
    emits("dataLoaded", objData, true);
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
      <el-col :span="sitem.colSpan||(24/item.length)" v-for="sitem in item">
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
          <el-tab-pane :label="tabItem.title||tabItem.tabName" :name="key">
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
        <el-tab-pane :label="item.title||item.tabName" :name="'tab'+key">
          <star-horse-data-view-table v-model:data-form="dataForm" :commonFormat="commonFormat"
                                      :batchName="item['batchName']" :item="item"/>
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
