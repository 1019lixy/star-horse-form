<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import StarHorseDataView from "@/components/comp/StarHorseDataView.vue";
import StarHorseDataViewObject from "@/components/comp/StarHorseDataViewObject.vue";

const props = defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  try {
    return props.commonFormat(name, dataForm.value[name], null);
  } catch (e) {
    console.log(e);
    return name;
  }
};
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.tabList&&item.tabList.length>0">
    <el-tabs v-model="item.fieldName" type="border-card">
      <template v-for="(tabItem,key )  in item.tabList">
        <el-tab-pane :label="tabItem.title||tabItem.tabName" :name="key">
          <template v-if="tabItem.subFormFlag">
            <star-horse-data-view-object :objectName="tabItem.objectName"
                                         :subCreateFlag="true"
                                         v-model:dataForm="dataForm"
                                         :commonFormat="commonFormat"
                                         primaryKey="id"
                                         :fieldList="{
               fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"/>
          </template>
          <template v-else>
            <star-horse-data-view  :fieldList="{
              fieldList:tabItem.fieldList,
              batchFieldList:tabItem.batchFieldList
            }"
            />
          </template>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
</template>

<style scoped lang="scss">

</style>
