<script setup lang="ts" name="StarHorseDataViewObject">
import {PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {rowClassName} from "@/api/sh_api";
import {Config} from "@/api/settings";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import Help from "@/components/help.vue";

const props = defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  batchName: {type: String, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm = defineModel("dataForm");

const viewDataFormat = (row: any, column: any, cellValue: any, index: number) => {
  //如果在这个地方遍历是否有隐藏属性，会拉低系统性能
  return props.commonFormat(column.property, cellValue, row);
};
const dataFormat = (item: any) => {
  let name = item['hideName'] || item['fieldName'];

  return name;

};
</script>
<template>
    <div
        style="display:flex;justify-content:space-between;width: 100%;border-bottom:  var(--star-horse-style) 1px solid"
    >
      <div class="tb_title">
        <star-horse-icon icon-class="info" size="14px"/>
        {{ item.title }}
      </div>
      <div style="display: flex;align-items: center;flex-direction: row-reverse">

      </div>
    </div>
  <el-table
      :data="dataForm[batchName]"
      fit
      border
      :stripe="true"
      height="400px"
      :row-class-name="rowClassName"
      :highlight-current-row="true"
      :row-style="{
      height: '30px',
    }"
      :cell-style="{
      height: '30px',
      'font-size': '12px',
    }"
      :header-cell-style="{
      background: '#f2f2f2',
      color: '#707070',
      'font-size': '13px',
      'background-image':
        '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))',
    }"
  >
    <el-table-column
        label="序号"
        fixed
        align="center"
        prop="xh"
        width="60"
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
      {{ dataFormat(sitem) }}
    </template>
  </el-table>

</template>
<style lang="scss" scoped>
.el-table {
  :deep(.cell) {
    color: #000000;
  }
}
</style>
