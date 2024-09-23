<script setup lang="ts" name="StarHorseTableColumn">
import StarHorseItem from "@/components/comp/StarHorseItem.vue";
import {nextTick, PropType, ref} from "vue";
import {postRequest} from "@/api/star_horse";
import {closeLoad, commonParseCodeToName} from "@/api/sh_api";
import {error, success, warning} from "@/utils/message";
import {Config} from "@/api/settings.ts";

const props = defineProps({
  compUrl: {type: Object},
  batchName: {type: String, default: ""},
  item: {type: Object as PropType<any>, required: true},
  dataFormat: {type: Function, required: true},
  cellEditable: {type: Boolean, default: true},
  compSize: {type: String, default: "default"}
});
const emits = defineEmits(["focusEvent", "blurEvent"]);
const currentRow = ref();
const currentRowColumnRef = ref();
const focusEvent = (_column: any) => {
  // currentRow.value[column["property"]] = currentRow.value[column["property"]];
};
const blurEvent = (column: any) => {
  currentRow.value["isSelected"] = false;
  let bakeValue = currentRow.value["starHorseBakeValue"];
  delete currentRow.value["selectName"];
  delete currentRow.value["starHorseBakeValue"];
  if ((!bakeValue && bakeValue != 0) || bakeValue == currentRow.value[column["property"]]) {
    return;
  }
  postRequest(props.compUrl?.mergeUrl!, currentRow.value).then(res => {
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
    } else {
      success(res.data.cnMessage);
    }
  }).catch(err => {
    error("接口调用异常" + err);
  }).finally(() => {
    closeLoad();
  });
};
const cellClick = (row: any, column: any) => {
  if (!props.cellEditable || props.item["disabled"] == 'Y' || props.item["editDisabled"] == "Y") {
    return;
  }
  row["isSelected"] = true;
  row["selectName"] = column["property"];
  let bakeValue = row[column["property"]];
  //解决空值不能提交问题
  row["starHorseBakeValue"] = bakeValue ? bakeValue : "_";
  currentRow.value = row;
  nextTick(() => {
    setTimeout(() => {
      let obj = $("." + column["id"]).find("input");
      obj.focus();
      // obj.unbind().on("blur", () => {
      //   console.log(column);
      //   blurEvent(column);
      // });
    }, 300);
  })
};
const currentDataFormat = (scope: any) => {
  let item = props.item;
  let name = item.hideName || item.fieldName;
  let val: string = scope.row[name];
  //下拉数据,checkbox,radio切换为对应的名称
  let fname: string = "";
  if (item.type == "select" || item.type == "checkbox" || item.type == "radio") {
    fname = item.preps?.values?.find((temp: any) => String(temp.value) == val)?.name;
  }
  if (fname) {
    return fname;
  }
  val = commonParseCodeToName(name, val);
  if (props.dataFormat) {
    return props.dataFormat(name, val, scope.row)
  }
  return val;
}
</script>
<template>

  <el-table-column
      :prop="item.hideName||item.fieldName"
      :label="item.label"
      :min-width="(item.minWidth||Config.defaultColumnWidth) + 'px'"
      :formatter="dataFormat"
      v-if="item.tableShow"
      sortable
      :show-overflow-tooltip="true"
  >

    <template #default="scope">
      <template v-if="item.preps?.showComp=='Y'">
        <star-horse-item :dataForm="scope.row" :item="item"
                         :column="scope.column"
                         :batchName="batchName"
                         :compSize="compSize"
                         v-on:[item.preps.compAction]="item.preps.compFunc(scope.row)"
                         ref="currentRowColumnRef"
        />
      </template>
      <template v-else>
        <star-horse-item :dataForm="scope.row" :item="item"
                         :column="scope.column"
                         :batchName="batchName"
                         @focus="focusEvent"
                         :compSize="compSize"
                         ref="currentRowColumnRef"
                         @blur="blurEvent"
                         v-if="scope.row.isSelected&&(scope.row.selectName==item.hideName||scope.row.selectName==item.fieldName)"/>
        <p @click="cellClick(scope.row, scope.column)" v-else>
          {{ currentDataFormat(scope) }}</p>
      </template>
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
