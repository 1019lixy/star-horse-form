<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

const props = defineProps({
  item: {type: Object as PropType<PageFieldInfo>, required: true},
  batchFieldName: {type: String, default: "batchFieldList"},
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
  <template v-if="item[batchFieldName]?.length > 1">
    <el-tabs v-model="item[batchFieldName].fieldName">
      <template v-for="(sitem,key) in item.batchFieldList">
        <el-tab-pane :label="sitem['title']" :name="'tab'+key" :disabled="sitem.disabled">
          <star-horse-data-view-table :commonFormat="commonFormat" :item="sitem"
                                      :batchName="sitem['batchName']"
                                      v-model:dataForm="dataForm"/>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="item[batchFieldName]?.length == 1">
    <template v-for="temp in item[batchFieldName]">
      <star-horse-data-view-table :item="temp" :commonFormat="commonFormat" v-model:dataForm="dataForm"
                                  :batchName="temp"/>
    </template>
  </template>

</template>

<style scoped lang="scss">
:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}
</style>
