<script setup lang="ts">
import { Config } from '@/api/settings';
import {
  apiInstance,
  closeLoad,
  commonParseCodeToName,
  download,
  error,
  load,
  postRequest,
  warning,
} from 'star-horse-lowcode';
import { onMounted, ref, watch } from 'vue';

defineOptions({
  name: 'QueryResult',
});
const props = defineProps({
  reqData: { type: Object, default: {} },
  dbIndex: { type: String, default: '' },
  compSize: { type: String, default: Config.compSize },
  requestSource: { type: String, default: 'onlineQuery' },
});
const dataUrl = apiInstance('userdb-manage', 'dbsearch/dbinfoEntity');
const emits = defineEmits(['error', 'queryResultChange']);
const queryResult = ref<any>({});
let pageSize = ref<number>(10);
let activeName = ref<string>('Result1');
let drawer = ref(false);
let direction = ref<string>('rtl');
let pageSizeLimit = ref<Array<number>>([10, 20, 50, 100]);
let detailData = ref<any>({});
const handleClose = () => {
  drawer.value = false;
};
/**
 * 查看详情
 */
const viewDataDetail = (row: any, column: any, event: Event) => {
  drawer.value = true;
  detailData.value = row;
};
const columnListFun = (datas: any) => {
  return `<el-popover placement="bottom" :popper-style="{width: 'unset !important'}" trigger="click"><el-checkbox v-for="data in ${datas}" :label="data"/> </el-popover>`;
};

const querySql = () => {
  if (!props.reqData.sqls) {
    return;
  }
  load('数据查询中...');
  props.reqData.requestSource = props.requestSource;
  postRequest(`${dataUrl.basePrefix}/search`, props.reqData)
    .then((res) => {
      if (res.data.code != 0) {
        error(res.data.cnMessage);
        emits('error', res.data.cnMessage);
      } else {
        queryResult.value = res.data.data;
      }
    })
    .finally(() => {
      closeLoad();
    });
};
const exportData = (item: any) => {
  load('数据处理中');
  let params = {
    datasourceConfigId: props.dbIndex,
    currentSql: item.currentSql,
    pageSize: pageSize.value,
    currentPage: item.currentPage,
    requestSource: props.requestSource,
  };
  download(`${dataUrl.basePrefix}/exportData`, params)
    .catch((err) => {
      error('接口不存在或网络异常:' + err);
      emits('error', '接口不存在或网络异常:' + err);
    })
    .finally(() => {
      closeLoad();
    });
};
/**
 * 数据格式化
 * @param row
 * @param column
 * @param cellValue
 * @param index
 */
const resultDataFormat = (
  row: any,
  column: any,
  cellValue: any,
  index: number,
) => {
  if (!cellValue) {
    return '-';
  }
  cellValue = commonParseCodeToName(column.property, cellValue);
  return cellValue;
};
const handleCurrentChange = (
  index: number,
  sql: string,
  currentPage: number,
  pageSize: number,
) => {
  let reqData = {
    sqls: [sql],
    pageSize: pageSize,
    currentPage: currentPage,
    idDbinfo: props.dbIndex,
    requestSource: props.requestSource,
  };
  load('数据查询中...');
  postRequest(`${dataUrl.basePrefix}/search`, reqData)
    .then((res) => {
      if (res.data.code == 1) {
        warning(res.data.cnMessage);
        emits('error', res.data.cnMessage);
        return;
      }
      queryResult.value[index] = res.data.data[0];
    })
    .finally(() => {
      closeLoad();
    });
};
onMounted(() => {
  querySql();
});
watch(
  () => props.reqData.sqls,
  (val) => {
    querySql();
  },
  { immediate: false, deep: true },
);
defineExpose({
  queryResult,
});
</script>

<template>
  <el-tabs class="h-full" type="border-card" v-model="activeName">
    <el-tab-pane
      :label="'Result' + (indexa + 1)"
      :name="'Result' + (indexa + 1)"
      v-for="(item, indexa) in queryResult"
    >
      <div class="flex items-center justify-between h-[30px]">
        <el-select
          style="width: 200px !important; margin-right: 5px"
          v-model="pageSize"
          :size="compSize"
        >
          <el-option
            :key="sitem"
            :label="'每页' + sitem + '条'"
            :value="sitem"
            v-for="sitem in pageSizeLimit"
          >
          </el-option>
        </el-select>
        <el-button :size="compSize" @click="exportData(item)" link title="">
          <star-horse-icon icon-class="excel-export" />
          导出
        </el-button>
      </div>

      <hr />
      <el-table
        :size="compSize"
        :data="item.dataList"
        :id="'queryResultId' + (indexa + 1)"
        @row-dblclick="viewDataDetail"
        highlight-current-row
        ref="multipleTable"
        stripe
        min-height="350px"
        style="width: 2500px"
        :row-style="{ height: '30px' }"
        :cell-style="{ height: '30px', 'font-size': '12px' }"
        :header-cell-style="{
          background: '#f2f2f2',
          color: '#707070',
          'font-size': '13px',
          'background-image':
            '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))',
        }"
        border
      >
        <!--  <el-table-column label="显示/隐藏" :render-header="columnListFun(item.columnNames)"/>-->
        <el-table-column
          :formatter="resultDataFormat"
          :index="index"
          :label="pp"
          :prop="pp"
          :show-overflow-tooltip="true"
          min-width="200px"
          sortable
          v-for="(pp, index) in item.columnNames"
        >
        </el-table-column>
      </el-table>
      <hr />
      <el-pagination
        :size="compSize"
        :total="item.totalDatas"
        @current-change="
          handleCurrentChange(
            indexa,
            item.currentSql,
            item.currentPage,
            item.pageSize,
          )
        "
        layout="total,  prev, pager, next,jumper"
        v-model:currentPage="item.currentPage"
        v-model:page-size="item.pageSize"
      />
    </el-tab-pane>
  </el-tabs>
  <el-drawer
    :before-close="handleClose"
    :direction="direction"
    title="数据详情"
    v-model="drawer"
  >
    <div class="el-table__header-wrapper">
      <table class="el-table">
        <thead>
          <tr class="el-table__header">
            <th class="el-table__cell">
              <div class="cell">字段名</div>
            </th>
            <th class="el-table__cell">
              <div class="cell">值</div>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            :class="[
              'el-table__row',
              index % 2 == 0 ? 'el-table__row--striped' : '',
            ]"
            v-for="(val, key, index) in detailData"
          >
            <td class="el-table__cell">
              <div class="cell">{{ key }}</div>
            </td>
            <td class="el-table__cell">
              <div class="cell">{{ commonParseCodeToName(key, val) }}</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
:deep {
  .el-tab-pane {
    display: flex;
    flex-direction: column;
  }
}
</style>
