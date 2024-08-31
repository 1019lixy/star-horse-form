<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {ModelRef} from "vue-demi";
import {validMsg} from "@/api/sh_api.ts";

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
  isEdit: {type: Boolean, default: false},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.dytableList&&item.dytableList.length>0">
    <table ref="containerTableRef" :class="{'dynamic-table':true,'instance-table':true }">
      <tbody>
      <tr v-for="(row,rowIndex) in item.dytableList" class="dy-tr">
        <td v-for="(sitem,colIndex) in row" :colspan="sitem.preps.colspan||1" :rowspan="sitem.preps.rowspan||1"
            :style="{width: sitem.preps.colWidth + '% !important' || '',
                     height: sitem.preps.colHeight + '% !important' || '',
                     'word-break': !!sitem.preps.wordBreak ? 'break-all' : 'normal'}">
          <el-form-item
              :size="compSize"
              :label="sitem.label"
              :required="sitem.required"
              :prop="sitem.fieldName"
              :rules="sitem.required?validMsg(sitem):[]"
              v-if="sitem.formShow&&sitem.label&&sitem.preps.headerFlag!='Y'">
            <star-horse-item :primaryKey="primaryKey" :compSize="compSize" v-model:dataForm="dataForm"
                             :item="sitem" :isEdit="isEdit"/>
          </el-form-item>
          <star-horse-item v-else-if="sitem.formShow||sitem.viewShow" :compSize="compSize" :primaryKey="primaryKey"
                           v-model:dataForm="dataForm" :item="sitem" :isEdit="isEdit"/>
        </td>
      </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped lang="scss">
.instance-table {
  border: 1px solid var(--star-horse-style);

  td {
    border: 1px solid var(--star-horse-style);
    line-height: 40px;
    height: 40px;
    padding: 0 10px 0 0;
  }
}
</style>
