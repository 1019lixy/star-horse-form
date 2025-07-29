<script setup lang="ts" name="DataPreview">
import {onMounted, ref, watch} from 'vue';
import {commonDataFormat} from '@/api/star_horse_utils';
import {Config} from '@/api/settings';

const props = defineProps({
  item: {type: Object, default: {}},
  columns: {type: Array<any>, default: []},
  isPreview: {type: Boolean, default: false},
  compSize: {type: String, default: Config.compSize},
  sourceType: {type: String, default: 'consumer'}
});
const emits = defineEmits(['changePage', 'exportData']);
const viewDataPreviewRef = ref();
let toolFields = ref<Array<any>>([]);
let currentPage = ref(1);
let pageSize = ref(20);
const tableCompFunc = (func: any) => {
  if (func == 'refresh') {
    handleCurrentChange(currentPage.value, pageSize.value);
  } else if (func == 'exportData') {
    emits('exportData');
  } else if (func == 'exec') {
  }
};
const createSearchParams = (formData: any) => {
  handleCurrentChange(currentPage.value, pageSize.value);
};
const initData = () => {
  for (let i in props.columns) {
    let temp = props.columns[i];
    toolFields.value.push(...temp);
  }
};
onMounted(() => {
  initData();
});
watch(
    () => props.columns,
    (val) => {
      initData();
    },
    {immediate: true, deep: true},
);
const viewDataDetail = () => {
};
const resultDataFormat = (row: any, column: any, val: any) => {
  return commonDataFormat(row, column, val, 0);
};
const handleCurrentChange = (cp: number, ps: number) => {
  currentPage.value = cp;
  pageSize.value = ps;
  emits('changePage', currentPage.value, pageSize.value);
};
defineExpose({
  tableCompFunc,
  createSearchParams,
});
</script>
<template>
  <div style="width: 100%; display: flex; flex-direction: row-reverse">
    <el-popover
        trigger="click"
        :popper-style="{ width: 'unset !important' }"
        placement="left-end"
    >
      <template #reference>
        <el-tooltip content="显示/隐藏列">
          <star-horse-icon
              icon-class="setting"
              color="var(--star-horse-style)"
          />
        </el-tooltip>
      </template>
      <el-table
          class="sh-columns"
          ref="table"
          :data="toolFields"
          :strip="true"
          :fit="true"
          :size="compSize"
          :highlight-current-row="true"
          min-height="400px"
          row-key="prop"
          style="width: 100%"
          border
      >
        <el-table-column prop="" label="排序" width="60">
          <el-tag class="move" style="cursor: move">
            <el-icon style="cursor: move">
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
            <el-tag round :effect="scope.row.listVisible ? 'dark' : 'light'">
              {{ scope.row.comment }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="listVisible" label="显示/隐藏" width="100">
          <template #default="scope">
            <el-switch
                v-model="scope.row.listVisible"
                :size="Config.compSize"
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
      highlight-current-row
      ref="viewDataPreviewRef"
      :stripe="true"
      :fit="true"
      row-key="pop"
      :size="compSize"
      :height="isPreview ? 400 : '100%'"
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
      border
  >
    <template v-for="(scols, key) in columns" v-if="sourceType==='consumer'">
      <template v-for="(pp, index) in scols">
        <el-table-column
            :formatter="resultDataFormat"
            :index="index"
            :label="pp.comment"
            :prop="key + '&' + pp.fieldName"
            :show-overflow-tooltip="true"
            min-width="150px"
            v-if="pp.listVisible"
            sortable
        >
        </el-table-column>
      </template>
    </template>
    <template v-else>
      <template v-for="(pp, index) in columns">
        <el-table-column
            :formatter="resultDataFormat"
            :index="index"
            :label="pp.comment"
            :prop="pp.fieldName"
            :show-overflow-tooltip="true"
            min-width="150px"
            v-if="pp.listVisible"
            sortable
        >
        </el-table-column>
      </template>
    </template>
  </el-table>
  <el-pagination
      :size="compSize"
      :total="item.totalDatas"
      @current-change="handleCurrentChange(item.currentPage, item.pageSize)"
      layout="total,  prev, pager, next,jumper"
      v-model:currentPage="item.currentPage"
      v-model:page-size="item.pageSize"
  />
</template>
<style scoped lang="scss"></style>
