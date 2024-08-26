<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.tabList&&item.tabList.length>0">
    <el-tabs v-model="item.fieldName" type="border-card" class="view-tab">
      <template v-for="(tabItem,key )  in item.tabList">
        <el-tab-pane :label="tabItem.title||tabItem.tabName" :name="key">
          <template v-if="tabItem.subFormFlag">
            <star-horse-data-view-items :objectName="tabItem.objectName"
                                        :subCreateFlag="true"
                                        v-model:dataForm="dataForm[tabItem.objectName]"
                                        :commonFormat="commonFormat"
                                        primaryKey="id"
                                        :fieldList="{
               fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"/>
          </template>
          <template v-else>
            <star-horse-data-view-items
                :objectName="tabItem.objectName"
                :subCreateFlag="tabItem.subFormFlag"
                v-model:dataForm="dataForm"
                :commonFormat="commonFormat"
                :fieldList="{
              fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"
            />
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
    <template v-if="item.batchFieldList.length>1">
      <el-tabs v-model="item.fieldName">
        <template v-for="(sitem,key) in item.batchFieldList">
          <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
            <star-horse-data-view-table :batchName="sitem['batchName']" :commonFormat="commonFormat" :item="sitem"
                                        v-model:dataForm="dataForm"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <star-horse-data-view-table v-else :item="item.batchFieldList[0]" :commonFormat="commonFormat"
                                :batchName="item.batchFieldList[0]['batchName']"
                                v-model:dataForm="dataForm"/>
  </template>
</template>

<style scoped lang="scss">
.view-tab {
  margin-top: 5px;
}
</style>
