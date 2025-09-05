<script setup lang="ts">
import { Config } from "@/api/settings";
import { commonParseCodeToName } from "@/api/star_horse_utils";
import { postRequest } from "@/api/star_horse_apis";
import {
  apiInstance,
  closeLoad,
  download,
  error,
  load,
  warning,
} from "star-horse-lowcode";
import { onMounted, ref, watch } from "vue";
import { i18n } from "@/lang";

const props = defineProps({
  dbIndex: { type: String, required: true },
  reqData: { type: Object, default: {} },
  requestSource: { type: String, default: "db" },
});
const emits = defineEmits(["error"]);
const dataUrl = apiInstance("userdb-manage", "dbsearch/dbinfo");
const activeName = ref("Result1");
const pageSize = ref(20);
const pageSizeLimit = ref([20, 50, 100, 200, 500]);
const queryResult = ref<Array<any>>([]);
const drawer = ref(false);
const detailData = ref({});
const direction = ref("rtl");
const compSize = ref(Config.compSize);
const handleClose = (done: Function) => {
  done();
};
const viewDataDetail = (row: any) => {
  detailData.value = row;
  drawer.value = true;
};
const querySql = () => {
  if (!props.reqData?.sqls || props.reqData.sqls.length == 0) {
    return;
  }
  let reqData = {
    sqls: props.reqData.sqls,
    pageSize: pageSize.value,
    currentPage: 1,
    idDbinfo: props.dbIndex,
    requestSource: props.requestSource,
  };
  // load(i18n("dbSearch.dataProcessing"));
  postRequest(`${dataUrl.basePrefix}/search`, reqData) // Pass abortSignal
    .then((res) => {
      if (res.data.code == 1) {
        warning(res.data.cnMessage);
        emits("error", res.data.cnMessage);
        return;
      }
      queryResult.value = res.data.data;
      activeName.value = "Result1";
    })
    .catch((err) => {
      error(i18n("dbSearch.interfaceNotFound") + ":" + err);
      emits("error", i18n("dbSearch.interfaceNotFound") + ":" + err);
    });
  // .finally(() => {
  //   closeLoad();
  // });
};
const exportData = (item: any) => {
  load(i18n("dbSearch.dataProcessing"));
  let params = {
    datasourceConfigId: props.dbIndex,
    currentSql: item.currentSql,
    pageSize: pageSize.value,
    currentPage: item.currentPage,
    requestSource: props.requestSource,
  };
  download(`${dataUrl.basePrefix}/exportData`, params)
    .catch((err) => {
      error(i18n("dbSearch.interfaceNotFound") + ":" + err);
      emits("error", i18n("dbSearch.interfaceNotFound") + ":" + err);
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
    return "-";
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
  load(i18n("dbSearch.dataQuerying"));
  postRequest(`${dataUrl.basePrefix}/search`, reqData) // Pass abortSignal
    .then((res) => {
      if (res.data.code == 1) {
        warning(res.data.cnMessage);
        emits("error", res.data.cnMessage);
        return;
      }
      queryResult.value[index] = res.data.data[0];
    })
    .catch((err) => {
      error(i18n("dbSearch.interfaceNotFound") + ":" + err);
      emits("error", i18n("dbSearch.interfaceNotFound") + ":" + err);
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
  <el-tabs
    class="h-full query-result-tabs"
    type="border-card"
    v-model="activeName"
  >
    <el-tab-pane
      :label="'Result' + (indexa + 1)"
      :name="'Result' + (indexa + 1)"
      v-for="(item, indexa) in queryResult"
      :key="indexa"
    >
      <div class="flex items-center justify-between result-controls">
        <div class="controls-left">
          <el-select
            style="width: 200px !important; margin-right: 12px"
            v-model="pageSize"
            :size="compSize"
            class="page-size-select"
          >
            <el-option
              :key="sitem"
              :label="i18n('dbSearch.itemsPerPage', [sitem])"
              :value="sitem"
              v-for="sitem in pageSizeLimit"
            >
            </el-option>
          </el-select>
          <span class="result-info">
            {{ i18n("dbSearch.totalRecords", [item.totalDatas]) }}
          </span>
        </div>
        <el-button
          :size="compSize"
          @click="exportData(item)"
          type="info"
          plain
          class="export-btn"
        >
          <star-horse-icon icon-class="excel-export" size="16px" />
          {{ i18n("dbSearch.export") }}
        </el-button>
      </div>

      <div class="table-container enhanced-table-container">
        <el-table
          :size="compSize"
          :data="item.dataList"
          :id="'queryResultId' + (indexa + 1)"
          @row-dblclick="viewDataDetail"
          highlight-current-row
          ref="multipleTable"
          stripe
          min-height="350px"
          class="result-table enhanced-result-table"
          :row-style="{ height: '36px' }"
          :cell-style="{ padding: '0 8px', 'font-size': '13px' }"
          :header-cell-style="{
            background: 'linear-gradient(to bottom, #f8f9fa, #e9ecef)',
            color: 'var(--el-color-primary)',
            'font-size': '13px',
            'font-weight': '600',
            height: '36px',
            'border-bottom': '1px solid var(--el-border-color-light)',
          }"
          border
        >
          <el-table-column
            :formatter="resultDataFormat"
            :index="index"
            :label="pp"
            :prop="pp"
            :show-overflow-tooltip="true"
            min-width="200px"
            sortable
            v-for="(pp, index) in item.columnNames"
            :key="pp"
          >
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
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
          layout="total, prev, pager, next, jumper"
          v-model:currentPage="item.currentPage"
          v-model:page-size="item.pageSize"
          class="result-pagination"
          background
        />
      </div>
    </el-tab-pane>
  </el-tabs>
  <el-drawer
    :before-close="handleClose"
    :direction="direction"
    :title="i18n('dbSearch.dataDetails')"
    v-model="drawer"
    size="50%"
    class="detail-drawer"
  >
    <div class="drawer-content">
      <div class="detail-table-container">
        <div class="el-table__header-wrapper">
          <table class="el-table detail-table">
            <thead>
              <tr class="el-table__header">
                <th class="el-table__cell">
                  <div class="cell">{{ i18n("dbSearch.fieldName") }}</div>
                </th>
                <th class="el-table__cell">
                  <div class="cell">{{ i18n("dbSearch.value") }}</div>
                </th>
              </tr>
            </thead>
          </table>
        </div>
        <div class="el-table__body-wrapper">
          <table class="el-table detail-table">
            <tbody>
              <tr
                :class="[
                  'el-table__row',
                  index % 2 == 0 ? 'el-table__row--striped' : '',
                ]"
                v-for="(val, key, index) in detailData"
                :key="key"
              >
                <td class="el-table__cell field-name-cell">
                  <div class="cell">{{ key }}</div>
                </td>
                <td class="el-table__cell value-cell">
                  <div class="cell">{{ commonParseCodeToName(key, val) }}</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </el-drawer>
</template>

<style scoped lang="scss">
.query-result-tabs {
  height: 100%;

  :deep(.el-tabs__content) {
    height: calc(100% - 40px);
    padding: unset !important;
  }

  :deep(.el-tab-pane) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.result-controls {
  padding: 8px 0;
  background: var(--el-bg-color-page);
  border-radius: 4px;
  margin-bottom: 8px;

  .controls-left {
    display: flex;
    align-items: center;

    .page-size-select {
      margin-right: 8px;

      :deep(.el-input__inner) {
        height: 28px;
        font-size: 12px;
      }
    }

    .result-info {
      color: var(--el-text-color-secondary);
      font-size: 12px;
    }
  }

  .export-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
}

.table-container {
  flex: 1;
  overflow: hidden;
  border-radius: 4px;
  border: 1px solid var(--el-border-color-light);

  .result-table {
    width: 100%;
    height: 100%;

    :deep(.el-table__body-wrapper) {
      overflow-x: hidden;
    }
  }
}

.pagination-container {
  padding: 6px 0; /* Reduced padding */
  display: flex;
  justify-content: center;

  .result-pagination {
    :deep(.el-pagination__total) {
      color: var(--el-text-color-regular);
      font-size: 12px;
    }

    :deep(.el-pagination__jump) {
      margin-left: 12px;
      font-size: 12px;
    }

    :deep(.el-pagination__sizes) {
      font-size: 12px;
    }

    :deep(.btn-prev),
    :deep(.btn-next),
    :deep(.el-pager li) {
      min-width: 24px;
      height: 24px;
      line-height: 24px;
      font-size: 12px;
    }
  }
}

.detail-drawer {
  :deep(.el-drawer__header) {
    padding: 12px 16px; /* Reduced padding */
    margin-bottom: 0;
    border-bottom: 1px solid var(--el-border-color-light);
  }

  .drawer-content {
    padding: 12px; /* Reduced padding */
    height: calc(100% - 45px); /* Adjusted height */
    overflow: hidden;
  }

  .detail-table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--el-border-color-light);
    border-radius: 4px;
    overflow: hidden;

    .el-table__header-wrapper {
      flex-shrink: 0;
      overflow: hidden;

      .detail-table {
        width: 100%;
        border: none;

        .el-table__header {
          .el-table__cell {
            background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
            color: var(--el-color-primary);
            font-weight: 600;
            height: 35px; /* Reduced height */
            padding: 0 10px; /* Reduced padding */
            border-bottom: 1px solid var(--el-border-color-light);

            .cell {
              white-space: nowrap;
              text-overflow: ellipsis;
              overflow: hidden;
              font-size: 13px;
            }
          }
        }
      }
    }

    .el-table__body-wrapper {
      flex: 1;
      overflow-y: auto;

      .detail-table {
        width: 100%;
        border: none;

        .el-table__row {
          &:hover {
            background: var(--el-color-primary-light-9);
          }

          &.el-table__row--striped {
            background: var(--el-fill-color-light);

            &:hover {
              background: var(--el-color-primary-light-8);
            }
          }

          .el-table__cell {
            padding: 8px 10px; /* Reduced padding */
            border-bottom: 1px solid var(--el-border-color-lighter);
          }
        }
      }
    }
  }

  .field-name-cell {
    width: 30%;
    font-weight: 500;
  }

  .value-cell {
    width: 70%;
  }
}
</style>
