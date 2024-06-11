<script setup lang="ts">
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {computed, onMounted, ref} from "vue";
import {getRequest} from "@/api/star_horse.ts";
import {error, warning} from "@/utils/message.ts";
import {initDbList} from "@/views/dbsearch/utils/DbSearchUtils.ts";
import {closeLoad, load} from "@/api/sh_api.ts";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";

let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.buttonSize || "small");
let dbIndex = ref<any>(null);
let designForm = DesignForm(piniaInstance);
let formFieldList = computed(() => designForm.formFieldList);
const filterTableName = ref("");
let assignDataList = ref<Array<any>>([]);
let dbList = ref<any>([]);
let tableAndColumnsList = ref<any>([]);
let tableList = ref({});
let currentIndex = ref<any>(null);
let configData = ref<any>({
  columns: 1,
  commonField: 'N'
});
const openDb = () => {
  if (!dbIndex.value) {
    return;
  }
  load("数据加载中");
  getRequest(`/dbsearch-manage/dbsearch/dbinfoEntity/openConn/${dbIndex.value}`).then((res) => {
        tableList.value = {};
        if (res.data.code != 0) {
          error(res.data.cnMessage);
          return;
        }
        tableAndColumnsList.value = res.data.data;
        assignDataList.value = tableAndColumnsList.value;
        currentIndex.value = dbIndex.value;
      }
  ).finally(() => {
    closeLoad();
  });
};

const tableField = async (tableName: string) => {
  let fdata = tableAndColumnsList.value.find((item: any) => item.tableName == tableName);
  if (fdata?.fields?.length > 0) {
    //如果已经有值，则不再请求后端
    return fdata;
  } else {
    fdata['fields'] = [];
  }
  load(`${tableName}的属性加载中`);
  await getRequest(`/dbsearch-manage/dbsearch/dbinfoEntity/tableColumns/${dbIndex.value}/${tableName}`).then((res) => {
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return fdata;
    }
    fdata['fields'] = res.data.data;
  }).finally(() => {
    closeLoad();
  });
  return fdata;
};
const filterData = () => {
  if (!filterTableName.value) {
    assignDataList.value = tableAndColumnsList.value;
    return;
  }
  assignDataList.value = tableAndColumnsList.value.filter((item: any) =>
      item.tableName.toLowerCase().match(filterTableName.value.toLowerCase()));
};
const init = async () => {
  dbList.value = await initDbList();
};
const getDefaultVal = (type: String) => {
  if (type == "number" || type == "slider" || type == "rate") {
    return undefined;
  } else if (type == "checkbox" || type == "transfer") {
    return [];
  } else {
    return "";
  }
};

const getFieldType = (item: any) => {
  let type = item.type.toLowerCase();
  if (type.includes("varchar") || type.includes("character")) {
    return "input";
  } else if (type.includes("number") || type.includes("int") || type.includes("bigint") || type.includes("serial")) {
    return "number";
  } else if (type.includes("date") || type.includes("datetime") || type.includes("timestamp")) {
    return "datetime";
  }
  return "input";
};
const onDataCopy = async (data: any) => {
  console.log(data, data.tableName);
  let tableName = data.tableName;
  let tableInfo = await tableField(tableName);
  if (!tableInfo || !tableInfo.fields) {
    warning(`${tableInfo}属性异常，请检查`);
    return;
  }
  let fieldList = JSON.parse(JSON.stringify(tableInfo.fields));
  let mvDataList = [];
  for (let i in fieldList) {
    let reData = fieldList[i];
    let ms = formFieldList.value["index"]++;
    let mvData = {};
    mvData['id'] = 'persistId' + ms;

    /**
     * 处理preps
     */
    mvData["preps"] = {};
    if (reData.defaultValue) {
      mvData.preps[temp.fieldName] = temp.defaultValue;
    }
    mvData['itemType'] = getFieldType(reData);
    mvData.preps['id'] = mvData['id'];
    mvData.preps['label'] = reData.comment;
    mvData.preps['name'] = reData.fieldName.toLowerCase();
    formFieldList.value[reData.fieldName] = getDefaultVal(mvData['itemType']);
    mvData['compType'] = "formItem";
    mvDataList.push(mvData);
  }
  designForm.addComp(mvDataList);
  designForm.selectItem(mvDataList[0], mvDataList[0].itemType, "");
  return mvDataList;
};
const configDialogVisible = ref<Boolean>(false);
const closeAction = () => {
  configDialogVisible.value = false;
};
const doSave = () => {

}
const viewConfig = () => {
  configDialogVisible.value = true;
};
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      @merge="doSave"
      :title="'属性配置'"
      :is-show-btn-continue="false"
      :box-width="'20%'"
  >
    <el-form :model="configData" :size="compSize">
      <el-form-item label="每行显示列数">
        <el-input-number min="1" max="12" step="1" v-model="configData.columns" placeholder="请设置每行列数"/>
      </el-form-item>
      <el-form-item label="显示公共属性">
        <el-switch v-model="configData.commonField" active-value="Y" inactive-value="N"/>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <el-row>
    <el-col :span="18">
      <el-select
          :size="compSize"
          @change="openDb"
          clearable
          filterable
          id="dbInfo"
          placeholder="请选择数据库信息"
          v-model="dbIndex"
      >
        <el-option
            :key="sitem.value"
            :label="sitem.name"
            :value="sitem.value"
            v-for="sitem in dbList"
        >
        </el-option>
      </el-select>
    </el-col>
    <el-col :span="6">
      <el-button link @click="viewConfig" :size="compSize">
        <star-horse-icon icon-class="setting" color="var(--star-horse-style)"/>
        <span>配置</span>
      </el-button>
    </el-col>
  </el-row>
  <div style="margin-top:5px"></div>
  <el-input :size="compSize" placeholder="请输入关键字" v-model="filterTableName" @input="filterData"
            suffix-icon="Search"/>
  <el-scrollbar height="90%">
    <ul>
      <template v-for="(data, index) in assignDataList">
        <el-popover :width="640" placement="right" trigger="contextmenu">
          <template #reference>
            <li @click="onDataCopy(data)">
              <star-horse-icon icon-class="table" style="margin-top: 5px;height: 18px"/>
              <el-tooltip :content="data.comment">
                {{ data.tableName }}
              </el-tooltip>
            </li>
          </template>
          <table class="el-table field-table" style="width: 100%;overflow: auto;">
            <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>空标识</th>
              <th>主键</th>
              <th>备注</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sdata in data.fields">
              <td>{{ sdata.fieldName }}</td>
              <td>{{ sdata.type }}</td>
              <td>{{ sdata.nullFlag }}</td>
              <td>{{ sdata.primaryKey }}</td>
              <td>{{ sdata.comment }}</td>
            </tr>
            </tbody>
          </table>
        </el-popover>
      </template>
    </ul>
  </el-scrollbar>
</template>

<style scoped lang="scss">
:deep(.el-popover) {
  overflow-x: hidden;
}

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

.field-table {
  border: 1px solid var(--star-horse-style);

  tr > th, tr > td {
    border: 1px solid var(--star-horse-style);
    height: 25px;
    font-size: 12px;
    padding-left: 5px;

    :nth-child(2) {
      width: 120px;
    }
  }

}
</style>
