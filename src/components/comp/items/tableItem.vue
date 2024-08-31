<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {ModelRef} from "vue-demi";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Object as PropType<PageFieldInfo>, required: true},
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
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>

  <template v-if="item[batchFieldName]?.length > 1 && (!item.displayStyle||item.displayStyle=='tab')">

    <el-tabs v-model="item[batchFieldName].fieldName">
      <template v-for="(temp,key) in item[batchFieldName]">
        <el-tab-pane :label="temp['title']" :name="temp.tabName||'sub_tab'+key" :disabled="temp.disabled">
          <star-horse-form-table :size="compSize" :rules="rules" :item="temp" v-model:dataForm="dataForm"/>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="item[batchFieldName]?.length == 1">
    <template v-for="temp in item[batchFieldName]">
      <star-horse-form-table :size="compSize" :rules="rules" :item="temp" v-model:dataForm="dataForm"/>
    </template>
  </template>
</template>

<style scoped lang="scss">

</style>
