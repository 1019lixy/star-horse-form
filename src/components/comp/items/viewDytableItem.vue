<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

const props = defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];
  let val=dataForm.value[name];
  try {
    return props.commonFormat(name, val, null);
  } catch (e) {
    return val||"--";
  }
};
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
          <div class="item" v-if="sitem.formShow||sitem.tableShow||sitem.viewShow">
            <label>{{ sitem.label }} :</label>
            <div class="content">
              <el-tooltip :content="dataFormat(sitem)">
                {{ dataFormat(sitem) }}
              </el-tooltip>
            </div>
          </div>
        </td>
      </tr>
      </tbody>
    </table>
  </template>
</template>

<style scoped lang="scss">
.instance-table {
  margin-top: 5px;
  border: 1px solid var(--star-horse-style);

  td {
    border: 1px solid var(--star-horse-style);
    line-height: 40px;
    height: 40px;
    padding: 0 10px 0 0;
    .item{
      padding: 0 10px;
      border-bottom: unset;
      label{
        background: unset;
        width: unset;
      }
    }
  }
}
</style>
