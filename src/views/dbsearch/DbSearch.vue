<script setup lang="ts" name="DbSearch">
import StarHorseEditor from "@/components/comp/StarHorseEditor.vue";
import {onMounted, ref, unref} from "vue";
import {closeLoad, commonParseCodeToName, load, loadGetData} from "@/api/sh_api";
import {error, warning} from "@/utils/message";
import {download, getRequest, postRequest} from "@/api/star_horse";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import Help from "@/components/help.vue";
import {commands} from "@/utils/sh_design.ts";
import {sql} from "@codemirror/lang-sql";

let editorRef = ref(null);
let cacheValue = ref({});
let dbList = ref<any>([]);
let drawer = ref(false);
let direction = ref<string>("rtl"); //ltr:left to right,rtl:right to left ,ttb:top to bottom,btt:bottom to top
let queryResult = ref<any>([]);
let detailData = ref<any>({});
let pageSize = ref<number>(10);
let activeName = ref<string>("Result1");
let pageSizeLimit = ref<Array<number>>([10, 20, 50, 100]); //每条Sql允许一次查询数据量
let tableAndColumnsList = ref<any>([]);
let tableList = ref({});
let assignDataList = ref<any>([]);
let value = ref<string>("");
let dbIndex = ref<any>(null);
let currentIndex = ref<any>(null);
let readOnly = ref<boolean>(true);
const init = async () => {
  initDbList();
};
onMounted(() => {
  init();
});
const initDbList = async () => {
  let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbinfoEntity/getDbInfoByUser");
  if (error) {
    warning(error);
    return
  }
  dbList.value = data;
};
const handleClose = () => {
  drawer.value = !drawer.value;
};
/**
 * 查看详情
 */
const viewDataDetail = (row: any, column: any, event: Event) => {
  drawer.value = !drawer.value;
  detailData.value = row;
};
const openDb = () => {
  let editor = editorRef.value!;
  getRequest(`/dbsearch-manage/dbsearch/dbinfoEntity/openConn/${dbIndex.value}`).then((res) => {
        tableList.value = {};
        if (res.data.code != 0) {
          error(res.data.cnMessage);
          return;
        }
        tableAndColumnsList.value = res.data.data;
        assignDataList.value = tableAndColumnsList.value;
        currentIndex.value = dbIndex.value;
        editor.setAutoCompletion("test", tableAndColumnsList.value);
      }
  );
};
const getSql = () => {
  let editor = editorRef.value!.editor.state;
  let sData = editor.sliceDoc(
      editor.selection.main.from,
      editor.selection.main.to);
  if (!sData) {
    sData = editor.doc.toString();
  }
  return sData;
};
const executeSql = () => {
  if (!dbIndex.value) {
    warning("执行Sql前先连接数据库");
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
    warning("一次最多只能执行5条Sql");
    return;
  }
  let reqData = {
    sqls: tempList,
    pageSize: pageSize.value,
    currentPage: 1,
    idDbinfo: dbIndex.value,
  };
  load("数据查询中...");
  postRequest("/dbsearch-manage/dbsearch/dbinfoEntity/search", reqData).then((res) => {
    if (res.data.code != 0) {
      error(res.data.cnMessage);
    } else {
      queryResult.value = res.data.data;
    }
  }).finally(() => {
    closeLoad();
  });
};
const resultDataFormat = (row: any, column: any, cellValue: any, index: number) => {
  if (!cellValue) {
    return "-";
  }
  cellValue = commonParseCodeToName(column.property, cellValue);
  return cellValue;
};
const columnListFun = (datas: any) => {
  return `<el-popover placement="bottom" :width="100" trigger="click"><el-checkbox v-for="data in ${datas}" :label="data"/> </el-popover>`;
};
const handleCurrentChange = (index: number, sql: string, currentPage: number, pageSize: number) => {
  let reqData = {
    sqls: [sql],
    pageSize: pageSize,
    currentPage: currentPage,
    idDbinfo: dbIndex.value,
  };
  load("数据查询中...");
  postRequest("/dbsearch-manage/dbsearch/dbinfoEntity/search", reqData).then((res) => {
    if (res.data.code == 1) {
      warning(res.data.cnMessage);
      return;
    }
    queryResult.value[index] = res.data.data[0];

  }).finally(() => {
    closeLoad();
  });
};
const executeStop = () => {
};
const dataFormat = () => {
  //
  // let sData = editorRef.value!.editor.getSelection();
  // let flag = true;
  // if (!sData) {
  //   flag = !flag;
  //   sData = editorRef.value!.editor.getValue();
  // }
  // let fData = format(sData);
  // if (flag) {
  //   editorRef.value!.editor.replaceSelection(fData + "\n\t");
  // } else {
  //   editorRef.value!.editor.setValue(fData);
  // }
  // editorRef.value!.editor.refresh();
};
const exportData = (item: any) => {
  load("数据处理中");
  let params = {
    datasourceConfigId: dbIndex.value,
    currentSql: item.currentSql,
    pageSize: pageSize.value,
    currentPage: item.currentPage
  }
  download("/dbsearch-manage/dbsearch/dbinfoEntity/exportData", params).catch(err => {
    error("接口不存在或网络异常:" + err);
  }).finally(() => {
    closeLoad();
  });
};
const tableField = (tableName: string) => {
  let fdata = tableAndColumnsList.value.find((item: any) => item.tableName == tableName);
  if (fdata?.fields?.length > 0) {
    //如果已经有值，则不再请求后端
    return;
  }
  getRequest(`/dbsearch-manage/dbsearch/dbinfoEntity/tableColumns/${dbIndex.value}/${tableName}`).then((res) => {
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return;
    }
    tableList.value[tableName] = [];
    fdata.fields = res.data.data;
    fdata.fields.forEach((sitem: any) => {
      tableList.value[tableName].push(sitem.filedName);
    });

  }).finally(() => {
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
      item.tableName.toLowerCase().match(filterTableName.value.toLowerCase()));
};
const dratStart = (item: any, evt: DragEvent) => {
  let dt = evt.dataTransfer!;
  dt.effectAllowed = "copy";
  dt.setData("text/plain", item.tableName);
};
let bakeData = ref<String>("");
const dragOver = (evt: DragEvent) => {
  evt.preventDefault();
  bakeData.value = unref(sqlInfo);
};
const sqlInfo = ref<String>("");
const dragDrop = (evt: DragEvent) => {
  let dt = evt.dataTransfer!;
  let data = dt.getData("text/plain");
  if (!unref(bakeData)) {
    sqlInfo.value = " SELECT * FROM " + data;
  } else {
    sqlInfo.value = unref(bakeData) + " " + data;
  }
  // editorRef.value.editor.dispatch({
  //   changes: {from: 0, to: bakeData.value.length, insert: sqlInfo.value}
  // })
  // console.log(sqlInfo.value, bakeData.value, data);
}
const operMsg = `
 使用说明:
     目前快捷键失效,提示表字段需先单击表名加载字段到本地.
    1、使用前需先连接数据库;如果在左侧下拉框中,无数据或者无您要连接的DB,请联系管理员配置并授权;
    2、Sql查询器理论上支持数据库的所有DDL,DML,DCL等操作,但基于合规性,请在配置数据库的时候慎重赋予操作权限;
    3、建议不要执行耗时的Sql,容易被网关拦截;
    4、建议每条Sql写完后加上";",以方便多条sql拆分;
    5、默认每条Sql 一次最多返回10条数据,页面支持最大返回100条配置;
    6、每次最多执行的Sql数不能超过5条,超过数量取前5条;
    7、执行器支持选中某条Sql进行执行;
    8、Ctrl+Enter 执行,Ctrl+Shift+F 格式化,Ctrl+Enter 打开提示.`;
</script>
<template>
  <el-card class="inner_content">
    <el-row>
      <el-col :span="4">
        <el-select
            size="small"
            @change="openDb"
            clearable
            filterable
            id="dbInfo"
            placeholder="请选择数据库信息"
            v-model="dbIndex"
        >
          <el-option
              :key="sitem.configId"
              :label="sitem.name"
              :value="sitem.configId"
              v-for="sitem in dbList"
          >
          </el-option>
        </el-select>
      </el-col>
      <el-col :span="20">
        <div class="inner_button">
          <el-menu mode="horizontal" style="height: inherit;width: 100%;">
            <el-menu-item index="0">
              <el-select style="width: 130px; margin-right: 5px" v-model="pageSize" size="small">
                <el-option
                    :key="sitem"
                    :label="'每页' + sitem + '条'"
                    :value="sitem"
                    v-for="sitem in pageSizeLimit">
                </el-option>
              </el-select>
            </el-menu-item>
            <el-menu-item @click="executeSql" index="1" v-if="!!dbIndex">
              <el-tooltip class="item" content="执行" index="1"
                          effect="dark"
                          placement="bottom">
                <star-horse-icon icon-class="run" size="24px" color="#303133"/>
              </el-tooltip>
            </el-menu-item>
            <el-menu-item @click="executeStop" index="2" v-if="!!dbIndex">
              <el-tooltip class="item" content="停止"
                          effect="dark"
                          placement="bottom">
                <star-horse-icon icon-class="stop" size="24px" color="red"/>
                停止
              </el-tooltip>
            </el-menu-item>
            <el-menu-item @click="executeStop" index="2" v-if="!!dbIndex">
              <el-tooltip class="item" content="格式化"
                          effect="dark"
                          placement="bottom">
                <star-horse-icon icon-class="format" size="24px" color="darkorange"/>
                格式化
              </el-tooltip>
            </el-menu-item>
          </el-menu>
          <help :message="operMsg" width="650"/>
        </div>
      </el-col>
    </el-row>

    <div class="search-area">
      <div class="table-list" v-if="assignDataList.length>0">
        <el-input size="small" placeholder="请输入关键字" v-model="filterTableName" @input="filterData"
                  suffix-icon="Search"/>
        <el-scrollbar height="90%">
          <ul>
            <template v-for="(data, index) in assignDataList">
              <el-popover :width="540" placement="right" trigger="click">
                <template #reference>
                  <li @click="tableField(data.tableName)" @dragstart="evt=>dratStart(data,evt)" draggable="true">
                    <star-horse-icon icon-class="table" style="margin-top: 5px;height: 18px"/>
                    <el-tooltip :content="data.comment">
                      {{ data.tableName }}
                    </el-tooltip>
                  </li>
                </template>
                <table class="el-table field-table">
                  <thead>
                  <tr>
                    <th>名称</th>
                    <th>类型</th>
                    <th>备注</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="sdata in data.fields">
                    <td>{{ sdata.filedName }}</td>
                    <td>{{ sdata.type }}</td>
                    <td>{{ sdata.comment }}</td>
                  </tr>
                  </tbody>
                </table>
              </el-popover>
            </template>
          </ul>
        </el-scrollbar>
      </div>
      <div class="search-editor-result">
        <div class="search-editor" @dragover.prevent="dragOver" @drop="dragDrop">
          <StarHorseEditor :lang="'sql'" ref="editorRef" v-model:value="sqlInfo"/>
        </div>
        <div class="search-result" v-if="queryResult?.length>0">
          <el-tabs class="demo-tabs" type="border-card" v-model="activeName">
            <el-tab-pane
                :label="'Result' + (indexa + 1)"
                :name="'Result' + (indexa + 1)"
                v-for="(item, indexa) in queryResult"
            >

              <el-button @click="exportData(item)" link title="" type="primary">
                <star-horse-icon icon-class="excel-export"/>
                <el-tooltip content="导出">导出</el-tooltip>
              </el-button>
              <hr>
              <el-table
                  :data="item.dataList"
                  :id="'queryResultId' + (indexa + 1)"
                  @row-dblclick="viewDataDetail"
                  highlight-current-row
                  ref="multipleTable"
                  stripe
                  style="width: 2500px;"
                  :row-style="{height: '30px',}"
                  :cell-style="{height: '30px','font-size': '12px',}"
                  :header-cell-style="{
                      background: '#f2f2f2',
                      color: '#707070',
                      'font-size': '13px',
                      'background-image': '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))',
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
              <hr>
              <el-pagination
                  small
                  :total="item.totalDatas"
                  @current-change="handleCurrentChange(indexa,item.currentSql,item.currentPage,item.pageSize)"
                  layout="total,  prev, pager, next,jumper"
                  v-model:currentPage="item.currentPage"
                  v-model:page-size="item.pageSize"/>
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
    </div>
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
          <tr :class="['el-table__row',index%2==0?'el-table__row--striped':'']"
              v-for="(val, key, index) in detailData">
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
  </el-card>
</template>

<style lang="scss" scoped>
.search-area {
  display: flex;
  height: inherit;
  flex-direction: row;

  .table-list {
    min-width: 200px;
    height: inherit;
    overflow: hidden;
    text-overflow: ellipsis;

    ul {
      margin: 5px;
      display: flex;
      flex-direction: column;

      li {
        height: 25px;
        border-radius: 2px;
        cursor: pointer;
        margin: 1px;
        display: flex;

        :deep(.el-tooltip__trigger) {
          display: inline-flex;
          align-items: center;
          margin-top: 0;
          overflow: hidden;
          vertical-align: middle;
          text-overflow: ellipsis;
          white-space: nowrap;
          text-align: left;
          height: inherit;
          flex: 1;
        }

        .svg-icon {
          width: 18px;
          height: 18px;
        }
      }

      li:nth-child(even) {
        background: #e5e5e5;
      }

      li:nth-child(odd) {
        background: #f1f2f3;
      }
    }
  }

  .search-editor-result {
    flex: 1;
    display: flex;
    flex-direction: column;

    .search-editor {
      flex: 1;
    }

    .search-result {
      resize: both;
      overflow: auto;
      height: 350px;
    }
  }
}

:deep(.el-table__cell) {
  padding: 0;
}

:deep(th.el-table__cell:first-child) {
  padding: 5px 0;
}

.el-card {
  height: 100%;
  overflow: hidden;
}


.field-table {
  border: 1px solid #409eff;

  tr > th, tr > td {
    border: 1px solid #409eff;
    height: 30px;
    font-size: 13px;
    padding-left: 5px;

    :nth-child(2) {
      width: 120px;
    }
  }

}

:deep(.el-tabs__content) {
  padding-bottom: 5px;
}
</style>


