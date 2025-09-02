<script setup lang="ts" name="DbSearch">
import { Config } from "@/api/settings";
import { i18n } from "@/lang";
import QueryResult from "@/views/dbsearch/QueryResult.vue";
import { initDbList } from "@/views/dbsearch/utils/DbSearchUtils";
import {
  closeLoad,
  error,
  getRequest,
  piniaInstance,
  useGlobalConfigStore,
  warning
} from "star-horse-lowcode";
import { computed, onMounted, ref, unref } from "vue";

let editorRef = ref<any>(null);
let dbList = ref<any>([]);
let pageSize = ref<number>(10);
let tableAndColumnsList = ref<any>([]);
let tableList = ref<any>({});
let assignDataList = ref<any>([]);
let dbIndex = ref<any>(null);
let currentIndex = ref<any>(null);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
const init = async () => {
  dbList.value = await initDbList();
};
onMounted(() => {
  init();
});

const openDb = () => {
  let editor = editorRef.value!;
  getRequest(`/userdb-manage/dbsearch/dbinfo/openConn/${dbIndex.value}`).then(
    (res) => {
      tableList.value = {};
      if (res.data.code != 0) {
        error(res.data.cnMessage);
        return;
      }
      tableAndColumnsList.value = res.data.data;
      assignDataList.value = tableAndColumnsList.value;
      btnDisabled.value = false;
      currentIndex.value = dbIndex.value;
      editor.setAutoCompletion("test", tableAndColumnsList.value);
    },
  );
};
const getSql = () => {
  let editor = editorRef.value!.editor.state;
  let sData = editor.sliceDoc(
    editor.selection.main.from,
    editor.selection.main.to,
  );
  if (!sData) {
    sData = editor.doc.toString();
  }
  return sData;
};
const reqData = ref<any>({});
const executeSql = () => {
  if (!dbIndex.value) {
    warning(i18n("dbsearch.connect.database.first"));
    return;
  }
  let datas = getSql();
  if (!datas) {
    return;
  }
  datas = datas.split(";");
  let tempList: any = [];
  datas.forEach((item: any) => {
    let temp = item.replaceAll("\n", "");
    temp = temp.trim();
    if (temp) {
      tempList.push(temp);
    }
  });
  if (tempList.length > 5) {
    warning(i18n("dbsearch.max.sql.count"));
    return;
  }
  reqData.value = {
    sqls: tempList,
    pageSize: pageSize.value,
    currentPage: 1,
    idDbinfo: dbIndex.value,
  };
};
const executeStop = () => {};

const tableField = (tableName: string) => {
  let fdata = tableAndColumnsList.value.find(
    (item: any) => item.tableName == tableName,
  );
  if (fdata?.fields?.length > 0) {
    //如果已经有值，则不再请求后端
    return;
  }
  getRequest(
    `/userdb-manage/dbsearch/dbinfo/tableColumns/${dbIndex.value}/${tableName}`,
  )
    .then((res) => {
      if (res.data.code != 0) {
        warning(res.data.cnMessage);
        return;
      }
      tableList.value[tableName] = [];
      fdata.fields = res.data.data;
      fdata.fields.forEach((sitem: any) => {
        tableList.value[tableName].push(sitem.filedName);
      });
    })
    .finally(() => {
      closeLoad();
    });
};
const filterTableName = ref("");
const filterData = () => {
  if (!filterTableName.value) {
    assignDataList.value = tableAndColumnsList.value;
    return;
  }
  assignDataList.value = tableAndColumnsList.value.filter((item: any) =>
    item.tableName.toLowerCase().match(filterTableName.value.toLowerCase()),
  );
};
const dratStart = (item: any, evt: DragEvent) => {
  let dt = evt.dataTransfer!;
  dt.effectAllowed = "copy";
  dt.setData("text/plain", item.tableName);
};
let bakeData = ref<string>("");
const dragOver = (evt: DragEvent) => {
  evt.preventDefault();
  bakeData.value = unref(sqlInfo);
};
const sqlInfo = ref<string>("");
const dragDrop = (evt: DragEvent) => {
  let dt = evt.dataTransfer!;
  let data = dt.getData("text/plain");
  if (!unref(bakeData)) {
    sqlInfo.value = " SELECT * FROM " + data;
  } else {
    sqlInfo.value = unref(bakeData) + " " + data;
  }
};
let btnDisabled = ref<boolean>(true);
const btnList = [
  {
    label: i18n("dbsearch.execute"),
    icon: "run",
    disabled: btnDisabled,
    type: "primary",
    actions: executeSql,
  },
  {
    label: i18n("dbsearch.stop"),
    icon: "stop",
    disabled: btnDisabled,
    type: "danger",
    actions: executeStop,
  },
  {
    label: i18n("dbsearch.format"),
    icon: "format",
    disabled: btnDisabled,
    type: "warning",
    actions: () => {
      editorRef.value?.editor.dispatch({
        changes: {
          from: 0,
          to: editorRef.value?.editor.state.doc.length,
          insert:
            editorRef.value?.editor.state.doc.toString().replaceAll("\n", "") +
            "\n",
        },
      });
    },
  },
];
const operMsg = `
 ${i18n("dbsearch.usage.instructions")}:
     ${i18n("dbsearch.currently.shortcuts.disabled")}
    1、${i18n("dbsearch.connect.database.before.use")}
    2、${i18n("dbsearch.sql.executor.theoretically.supports")}
    3、${i18n("dbsearch.recommend.not.execute.time.consuming.sql")}
    4、${i18n("dbsearch.recommend.add.semicolon")}
    5、${i18n("dbsearch.default.each.sql.return.ten.records")}
    6、${i18n("dbsearch.each.time.max.execute.five.sql")}
    7、${i18n("dbsearch.executor.supports.selected.sql")}
    8、Ctrl+Enter ${i18n("dbsearch.execute")},Ctrl+Shift+F ${i18n("dbsearch.format")},Ctrl+Enter ${i18n("dbsearch.open.prompt")}.`;
</script>
<template>
  <el-card class="inner_content db-search-container">
    <el-splitter>
      <el-splitter-panel collapsible size="260" min="250" max="350">
        <div class="flex flex-col items-center h-full overflow-hidden db-table-panel" style="width: 98%">
          <el-select :size="compSize" @change="openDb" clearable filterable id="dbInfo" placeholder="请选择数据库信息"
            v-model="dbIndex" class="db-select">
            <el-option :key="sitem.value" :label="sitem.name" :value="sitem.value" v-for="sitem in dbList" />
          </el-select>
          <div style="margin-top: 5px"></div>
          <template v-if="assignDataList.length > 0">
            <el-input :size="compSize" placeholder="请输入关键字" v-model="filterTableName" @keydown.enter="filterData" class="table-filter-input">
              <template #suffix>
                <star-horse-icon @click="filterData" icon-class="search" color="var(--star-horse-style)" class="search-icon" />
              </template>
            </el-input>
            <div class="flex-1 w-[99%] overflow-hidden table-list-container" style="margin: 1px auto">
              <el-scrollbar class="table-scrollbar">
                <ul class="db_table_list">
                  <template v-for="(data, index) in assignDataList" :key="index">
                    <el-popover :popper-style="{ width: 'unset !important' }" placement="right" trigger="click">
                      <template #reference>
                        <li @click="tableField(data.tableName)" @dragstart="(evt) => dratStart(data, evt)"
                          draggable="true" class="flex items-center cursor-move h-[30px] table-item">
                          <star-horse-icon icon-class="table" size="16px" height="16px" width="16px" class="table-icon" />
                          <el-tooltip :content="data.comment" class="table-name-tooltip">
                            <span class="table-name">{{ data.tableName }}</span>
                          </el-tooltip>
                        </li>
                      </template>
                      <div class="field-table-container">
                        <div class="el-table__header-wrapper">
                          <table class="el-table field-table">
                            <thead>
                              <tr>
                                <th>{{ i18n("dbsearch.field.name") }}</th>
                                <th>{{ i18n("dbsearch.field.type") }}</th>
                                <th>{{ i18n("dbsearch.null.flag") }}</th>
                                <th>{{ i18n("dbsearch.primary.key") }}</th>
                                <th>{{ i18n("dbsearch.comment") }}</th>
                              </tr>
                            </thead>
                          </table>
                        </div>
                        <div class="el-table__body-wrapper">
                          <table class="el-table field-table">
                            <tbody>
                              <tr v-for="(sdata, index) in data.fields" :key="sdata.filedName" 
                                  :class="index % 2 === 0 ? 'el-table__row--striped' : 'el-table__row'">
                                <td>{{ sdata.fieldName }}</td>
                                <td>{{ sdata.type }}</td>
                                <td>{{ sdata.nullFlag }}</td>
                                <td>{{ sdata.primaryKey }}</td>
                                <td>{{ sdata.comment }}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </el-popover>
                  </template>
                </ul>
              </el-scrollbar>
            </div>
          </template>
          <div v-else class="empty-tables">
            <el-empty :description="i18n('dbsearch.no.tables.found')" />
          </div>
        </div>
      </el-splitter-panel>
      <el-splitter-panel>
        <el-splitter layout="vertical">
          <el-splitter-panel>
            <div class="h-full sql-editor-container" @dragover.prevent="dragOver" @drop="dragDrop">
              <StarHorseEditor :lang="'sql'" ref="editorRef" :helpMsg="operMsg" :btnList="btnList"
                v-model:value="sqlInfo" class="sql-editor" />
            </div>
          </el-splitter-panel>
          <el-splitter-panel collapsible size="200">
            <QueryResult :reqData="reqData" :dbIndex="dbIndex" :compSize="compSize" class="query-result" />
          </el-splitter-panel>
        </el-splitter>
      </el-splitter-panel>
    </el-splitter>
  </el-card>
</template>
<style lang="scss" scoped>
.db-search-container {
  height: 100%;
  :deep(.el-card__body) {
    height: 100%;
    padding: 10px;
  }
}

.db-table-panel {
  .db-select {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .table-filter-input {
    width: 100%;
    margin-bottom: 8px;
    
    :deep(.el-input__suffix) {
      cursor: pointer;
    }
  }
  
  .table-list-container {
    .table-scrollbar {
      :deep(.el-scrollbar__view) {
        padding-right: 8px;
      }
    }
    
    .db_table_list {
      .table-item {
        padding: 8px 12px;
        margin-bottom: 4px;
        border-radius: 4px;
        transition: all 0.3s ease;
        background: var(--el-bg-color-overlay);
        border: 1px solid var(--el-border-color-light);
        
        &:hover {
          background: var(--el-color-primary-light-9);
          border-color: var(--el-color-primary);
          transform: translateY(-1px);
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        }
        
        .table-icon {
          margin-right: 8px;
          color: var(--el-color-primary);
        }
        
        .table-name {
          font-size: 14px;
          font-weight: 500;
          color: var(--el-text-color-primary);
        }
      }
    }
  }
  
  .empty-tables {
    width: 100%;
    padding: 20px 0;
  }
}

.sql-editor-container {
  .sql-editor {
    height: 100%;
    
    :deep(.star-horse-editor-header) {
      padding: 8px 12px;
      background: var(--el-bg-color-page);
      border-bottom: 1px solid var(--el-border-color-light);
    }
  }
}

.query-result {
  height: 100%;
  
  :deep(.el-tabs) {
    height: 100%;
    
    .el-tab-pane {
      height: calc(100% - 40px);
      padding: 10px 0;
    }
  }
}

:deep(.el-popover) {
  overflow-x: hidden;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}

.field-table {
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
  overflow: hidden;
  width: 100%;

  tr>th,
  tr>td {
    border: 1px solid var(--el-border-color-light);
    height: 30px;
    font-size: 13px;
    padding-left: 5px;
    background: var(--el-bg-color-page);

    &:first-child {
      min-width: 180px;
      font-weight: 600;
    }

    &:nth-child(2) {
      min-width: 120px;
    }

    &:nth-child(3) {
      width: 120px;
    }

    &:nth-child(5) {
      width: 250px;
    }
  }
  
  :deep(thead tr th) {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    font-weight: 600;
  }
  
  :deep(tbody tr:nth-child(even)) {
    background: var(--el-fill-color-light);
  }
  
  :deep(tbody tr:hover) {
    background: var(--el-color-primary-light-9);
  }
}

.field-table-container {
  height: 300px;
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-color-primary);
  border-radius: 4px;
  overflow: hidden;
  
  .el-table__header-wrapper {
    flex-shrink: 0;
    overflow: hidden;
    
    .field-table {
      border: none;
      
      thead tr th {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 600;
        height: 30px;
        padding: 0 5px;
        border: 1px solid var(--el-border-color-light);
        
        &:first-child {
          min-width: 180px;
          font-weight: 600;
        }

        &:nth-child(2) {
          min-width: 120px;
        }

        &:nth-child(3) {
          width: 120px;
        }

        &:nth-child(5) {
          width: 250px;
        }
      }
    }
  }
  
  .el-table__body-wrapper {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    
    .field-table {
      border: none;
      
      tbody tr.el-table__row--striped {
        background: var(--el-fill-color-light) !important;
      }
      
      tbody tr.el-table__row:hover,
      tbody tr.el-table__row--striped:hover {
        background: var(--el-color-primary-light-9) !important;
      }
      
      tbody tr {
        td {
          height: 30px;
          padding: 0 5px;
          border: 1px solid var(--el-border-color-light);
          font-size: 13px;
          
          &:first-child {
            min-width: 180px;
            font-weight: 600;
          }

          &:nth-child(2) {
            min-width: 120px;
          }

          &:nth-child(3) {
            width: 120px;
          }

          &:nth-child(5) {
            width: 250px;
          }
        }
      }
    }
  }
}
</style>