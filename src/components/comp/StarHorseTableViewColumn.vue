<script setup lang="ts" name="StarHorseTableColumn">
import {PropType} from "vue";
import {Config} from "@/api/settings.ts";

const props = defineProps({
  batchName: {type: String, default: ""},
  item: {type: Object as PropType<any>, required: true},
  commonFormat: {type: Function, required: true},

});

const dataFormat = (scope: any) => {
  let item = props.item;
  let val: string = scope.row[item.hideName || item.fieldName];
  console.log(item, val);
  if (item.type == "select" || item.type == "checkbox" || item.type == "radio") {
    return item.preps?.values?.find((temp: any) => String(temp.value) == val)?.name || val;
  }
  if (props.commonFormat) {
    props.commonFormat(scope.row, scope.column, val, scope.$index)
  }
  return val;
};
</script>
<template>
  <el-table-column
      :prop="item.hideName||item.fieldName"
      :label="item.label"
      sortable
      v-if="item.formShow||item.tableShow||item.viewShow"
      :min-width="(item.minWidth||Config.defaultColumnWidth) + 'px'"
  >
    <template #default="scope">
      {{ dataFormat(scope) }}
    </template>
  </el-table-column>
</template>
<style lang="scss">
tbody {
  .cell {
    display: flex;
    flex-direction: row;

    .el-table__expand-icon {
      margin-top: 5px;
    }

    p {
      display: block;
    }
  }
}
</style>
