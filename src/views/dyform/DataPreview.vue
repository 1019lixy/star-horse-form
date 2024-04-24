<script setup lang="ts" name="DataPreview">
import {onMounted, ref, watch} from "vue";

const props = defineProps({
  item: {type: Object, default: {}},
  columns: {type: Array<any>, default: []}
});
const emits = defineEmits(["changePage", "exportData"]);
const viewDataPreviewRef = ref();
let toolFields = ref<Array<any>>([]);
let currentPage = ref(1);
let pageSize = ref(20);
const tableCompFunc = (func: any) => {
  if (func == 'refresh') {
    handleCurrentChange(currentPage.value, pageSize.value);
  } else if (func == "exportData") {
    emits("exportData");
  } else if (func == "exec") {

  }
};
const createCreateParams = (formData: any) => {
  handleCurrentChange(currentPage.value, pageSize.value);
};
const initData = () => {
  for (let i in props.columns) {
    let temp = props.columns[i];
    toolFields.value.push(...temp);
  }
}
onMounted(() => {
  initData()
});
watch(() => props.columns,
    (val) => {
      initData()
    }, {immediate: true, deep: true})
const viewDataDetail = () => {

};
const resultDataFormat = (row: any, column: any, val: any) => {
  return val;
};
const handleCurrentChange = (cp: number, ps: number) => {
  currentPage.value = cp;
  pageSize.value = ps;
  emits("changePage", currentPage.value, pageSize.value);
};
defineExpose({
  tableCompFunc,
  createCreateParams
})
</script>

<template>
  <div style="width: 100%;display: flex;flex-direction: row-reverse">
    <el-popover
        trigger="click"
        :width="340"
        placement="left-end"
    >
      <template #reference>
        <el-icon
            class="star-page-icon"
            style="cursor: pointer"
        >
          <el-tooltip content="显示/隐藏列">
            <Tools/>
          </el-tooltip>
        </el-icon>
      </template>
      <el-table
          class="sh-columns"
          ref="table"
          :data="toolFields"
          :strip="true"
          :fit="true"
          :highlight-current-row="true"
          max-height="400px"
          row-key="prop"
          style="width: 100%"
          border
      >
        <el-table-column
            prop=""
            label="排序"
            width="60"
        >
          <el-tag
              class="move"
              style="cursor: move;"
          >
            <el-icon style="cursor: move;">
              <Sort/>
            </el-icon>
          </el-tag>
        </el-table-column>
        <el-table-column
            prop="comment"
            label="列名"
            :show-overflow-tooltip="true"
        >
          <template #default="scope">
            <el-tag
                round
                :effect="scope.row.tableShow?'dark':'light'">
              {{ scope.row.comment }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
            prop="tableShow"
            label="显示/隐藏"
            width="100"
        >
          <template #default="scope">
            <el-switch
                v-model="scope.row.tableShow"
                size="small"
                :active-value="true"
                :inactive-value="false"
            />
          </template>
        </el-table-column>
      </el-table>
    </el-popover>
  </div>
  <el-table
      :data="item.dataList"
      id="'previewResultId'"
      @row-dblclick="viewDataDetail"
      highlight-current-row=true
      ref="viewDataPreviewRef"
      :strip=true
      :fit=true
      row-key="prop"
      style="width: 100%"
      border
  >
    <template v-for="(scols,key) in columns">
      <template v-for="(pp, index) in scols">
        <el-table-column
            :formatter="resultDataFormat"
            :index="index"
            :label="pp.comment"
            :prop="key+'&'+pp.name"
            :show-overflow-tooltip="true"
            min-width="120px"
            v-if="pp.tableShow"
            sortable
        >
        </el-table-column>
      </template>
    </template>
  </el-table>
  <hr>
  <el-pagination
      :total="item.totalDatas"
      @current-change="handleCurrentChange(item.currentPage,item.pageSize)"
      layout="total,  prev, pager, next,jumper"
      v-model:currentPage="item.currentPage"
      v-model:page-size="item.pageSize"
  />
</template>

<style scoped lang="scss">

</style>