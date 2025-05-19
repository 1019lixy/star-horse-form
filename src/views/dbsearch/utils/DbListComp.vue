<script setup lang="ts">
import {computed, ComputedRef, nextTick, onMounted, ref, unref} from "vue";
import {initDbList, openDatabase, tableColumns} from "@/views/dbsearch/utils/DbSearchUtils";
import {
  BtnAuth,
  convertToCamelCase,
  isJson,
  PageFieldInfo,
  piniaInstance,
  SelectOption,
  useDesignFormStore,
  useGlobalConfigStore,
  warning
} from "star-horse-lowcode";

let configStore = useGlobalConfigStore(piniaInstance);
let designForm = useDesignFormStore(piniaInstance);
let allFormDataList = computed(() => designForm.allFormDataList);
let compSize = computed(() => configStore.configFormInfo?.buttonSize || "small");
let dbIndex = ref<any>(null);
let formData: ComputedRef<any> = computed(() => designForm.formData);
let compList = computed(() => designForm.compList);
const filterTableName = ref<string>("");
const tbTab = ref<string>("tb1");
let assignDataList = ref<Array<any>>([]);
let selectFields = ref<Array<SelectOption>>([]);
let dbList = ref<any>([]);
let tableFieldInfoRef = ref<any>();
let tableAndColumnsList = ref<any>([]);
let currentIndex = ref<any>(null);
let containerTypeList = computed(() => {
  let temp: Array<SelectOption> = [];
  designForm.containerList.forEach((item: any) => {
    temp.push({
      name: item.itemName,
      value: item.itemType
    });
  });
  return temp;
});
let configData = ref<any>({
  columns: 1,
  commonFieldFlag: "N"
});
let currentData = ref<any>({});
const fieldCompTypesMsg = `类型操作提示：
1、系统默认将数字类型的字段映射为数字输入框组件；
   将字符串类型的字段映射为单行文本框组件；
   将日期类型映射为日期选择器组件；
2、如果字段有特色业务需要，则可以将字段配置为对应的组件类型`;
let columnsContr = ref<string>("Y");
let added = ref<string>("N");
/**
 * 判断列数是否需要禁用
 * @param val
 */
const containerTypeOperation = (val: any) => {
  columnsContr.value = val["containerType"] == "box" ? "N" : "Y";
};
let dataFieldInfo = ref<PageFieldInfo>({
  fieldList: [
    [
      {
        label: "展示方式",
        fieldName: "containerType",
        type: "select",
        optionList: containerTypeList,
        formVisible: true,
        listVisible: true,
        actionNames: "change",
        actions: (val: any) => containerTypeOperation(val)
      },
      {
        label: "列数",
        fieldName: "columns",
        type: "number",
        helpMsg: "一行展示几列,展示方式为栅格时有效",
        formVisible: true,
        listVisible: true,
        disabled: columnsContr,
        defaultValue: configData.value.columns,
        preps: {
          min: 1,
          max: 12,
          step: 1
        }
      }
    ],
    {
      label: "排除字段",
      fieldName: "exclusionFields",
      type: "select",
      multiple: "Y",
      optionList: selectFields,
      formVisible: true,
      listVisible: true
    },
    {
      batchFieldList: [
        {
          batchName: "fieldCompTypes",
          title: "字段类型",
          helpMsg: fieldCompTypesMsg,
          fieldList: [
            {
              label: "字段",
              fieldName: "fieldName",
              type: "select",
              optionList: selectFields,
              formVisible: true,
              listVisible: true
            },
            {
              label: "组件类型",
              fieldName: "fieldType",
              type: "select",
              optionList: allFormDataList,
              formVisible: true,
              listVisible: true
            }
          ]
        }
      ]
    }
  ]
});
let currentDataVisible = ref<boolean>(false);
const contextOperation = async (evt: Event, data: any, _index: number) => {
  evt.preventDefault();
  evt.stopPropagation();
  currentData.value = data;
  // console.log(data, index);
  await tableField(data.tableName);
  currentDataVisible.value = true;
  selectFieldsOperation(data.fields);
  // dataForm.value = {...data};
  containerTypeOperation(data);
  await nextTick();
  added.value = data["added"];
  tableFieldInfoRef.value.setFormData(currentData.value);
};
const dataReset = () => {
  //dataForm.value = {...currentData.value};
  tableFieldInfoRef.value.setFormData(currentData.value);
};
const tableSubmit = async (addFlag: boolean = false) => {
  let data = tableFieldInfoRef.value.getFormData();
  currentData.value["containerType"] = unref(data)["containerType"];
  currentData.value["columns"] = unref(data)["columns"];
  currentData.value["exclusionFields"] = unref(data)["exclusionFields"];
  currentData.value["fieldCompTypes"] = unref(data)["fieldCompTypes"];
  tableOperClose();
  if (addFlag) {
    let datas = await onDataCopy(currentData.value);

    designForm.addComp(datas);
    if (datas instanceof Array) {
      let temp = datas[datas.length - 1];
      designForm.selectItem(temp, temp["itemType"], "");
    } else {
      designForm.selectItem(datas, datas["itemType"], "");
    }
  }
};
const tableOperClose = () => {
  // dataForm.value = {};
  currentDataVisible.value = false;
};
const openDb = () => {
  if (!dbIndex.value || dbIndex.value == "undefined") {
    return;
  }
  openDatabase(dbIndex.value)?.then((res: any) => {
    tableAndColumnsList.value = res;
    tableAndColumnsList.value.forEach((item: any) => {
      item["visible"] = false;
      item["containerType"] = "box";
      item["columns"] = configData.value.columns;
    });
    assignDataList.value = tableAndColumnsList.value;
  });
  currentIndex.value = dbIndex.value;
};
const selectFieldsOperation = (datas: any) => {
  selectFields.value = [];
  datas?.forEach((item: any) => {
    selectFields.value.push({
      name: item.fieldName + "(" + item.comment + ")",
      value: item.fieldName
    });
  });
};
const tableField = async (tableName: string) => {
  let fdata = tableAndColumnsList.value.find((item: any) => item.tableName == tableName);
  if (fdata?.fields?.length > 0) {
    //如果已经有值，则不再请求后端
    return fdata;
  } else {
    fdata["fields"] = [];
  }
  fdata["fields"] = await tableColumns(currentIndex.value, tableName);
  return fdata;
};
const filterData = () => {
  if (!filterTableName.value) {
    assignDataList.value = tableAndColumnsList.value;
    return;
  }
  assignDataList.value = tableAndColumnsList.value.filter((item: any) =>
      item.tableName.toLowerCase().match(filterTableName.value.toLowerCase())
  );
};
const init = async () => {
  dbList.value = await initDbList();
};
const getDefaultVal = (type: string) => {
  if (type == "number" || type == "slider" || type == "rate") {
    return undefined;
  } else if (type == "checkbox" || type == "transfer") {
    return [];
  } else {
    return "";
  }
};
const getFieldType = (item: any, fieldCompTypes: Array<any>) => {
  if (fieldCompTypes && fieldCompTypes.length > 0) {
    let result = fieldCompTypes.find((temp: any) => temp.fieldName == item.fieldName);
    if (result && result.fieldType) {
      return result.fieldType;
    }
  }
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
    return {};
  }
  let compLength = compList.value.length;
  let fieldList = JSON.parse(JSON.stringify(tableInfo.fields));
  let mvDataList = [];
  let config = unref(configData);
  let formInfo: any = {
    tbName: tableName,
    formName: data.comment || "",
    needCommonFields: data.commonFieldFlag == "Y" ? "Y" : configData.value.commonFieldFlag == "Y" ? "Y" : "N"
  };
  data["added"] = "Y";
  for (let i in fieldList) {
    let reData = fieldList[i];
    let fieldName: string = convertToCamelCase(reData.fieldName.toLowerCase())!;
    let ms = formData.value["index"]++;
    if (reData.commonFieldFlag?.toLowerCase() == "y" && config.commonFieldFlag?.toLowerCase() == "n") {
      continue;
    }
    if (reData.primaryKey?.toLowerCase() == "y") {
      formInfo["formId"] = fieldName;
      continue;
    }
    //如果有过滤的字段，则跳过
    let fResult = data.exclusionFields?.find((item: string) => item == reData.fieldName);
    if (fResult) {
      continue;
    }
    let mvData: any = {};
    mvData["id"] = "persistId" + ms;
    /**
     * 处理preps
     */
    mvData["preps"] = {
      clearable: "N",
      comment: "",
      controls: "Y",
      required: reData["nullFlag"] == "n" ? "Y" : "N",
      controlsPosition: "",
      disabled: "N",
      formVisible: "Y",
      placeholder: ""
    };
    mvData["itemType"] = getFieldType(reData, data.fieldCompTypes);
    mvData.preps["id"] = mvData["id"];
    let labelName = reData.comment;
    if (labelName && isJson(labelName)) {
      labelName = labelName.replaceAll("“", '"');
      labelName = labelName.replaceAll("”", '"');
      try {
        let jsonData = JSON.parse(labelName);
        labelName = jsonData["desc"];
      } catch (e) {
        labelName = "属性";
      }
    }
    mvData.preps["label"] = labelName;
    mvData.preps["itemNameLabel"] = labelName;
    mvData.preps["name"] = fieldName;
    formData.value[fieldName] = getDefaultVal(mvData["itemType"]);
    mvData["compType"] = "formItem";
    mvDataList.push(mvData);
  }
  if (compLength == 0 || compLength == 1) {
    designForm.setFormInfo(formInfo);
  }
  let elements = [];
  if ((config.columns > 1 || data.columns > 1) && data.containerType == "box") {
    let boxColumns = data.columns > 1 ? data.columns : config.columns;
    let boxId = "box" + formData.value["index"]++;
    let box: any = {
      id: boxId,
      compType: "container",
      itemType: "box",
      preps: {
        id: boxId,
        formVisible: "N",
        gutter: 0,
        justify: "start",
        readonly: "N",
        required: "N",
        searchVisible: "N",
        size: "small",
        listVisible: "N",
        tag: "div",
        label: "栅格",
        name: "box"
      }
    };
    let col = parseInt(boxColumns);
    let rows = mvDataList.length % col == 0 ? mvDataList.length / col : mvDataList.length / col + 1;
    let index = 0;
    for (let r = 1; r <= rows; r++) {
      let columns = [];
      for (let i = 1; i <= col; i++) {
        let temp = mvDataList[index++];
        if (temp) {
          columns.push({colIndex: i, colspan: 24 / col, items: [temp], xh: i});
        }
      }
      elements.push({
        rowIndex: r,
        columns: columns,
        xh: r
      });
    }
    box.preps["elements"] = elements;
    designForm.setDraggingItem(mvDataList[0]);
    return box;
  } else if (data.containerType == "table") {
    let tableId = "table" + formData.value["index"]++;
    let table: any = {
      id: tableId,
      compType: "container",
      itemType: "table",
      preps: {
        id: tableId,
        align: "top",
        batchFieldName: convertToCamelCase(tableName),
        primaryKeyName: formInfo.formId,
        columns: mvDataList.length,
        comment: "",
        formVisible: "N",
        readonly: "N",
        required: "N",
        searchVisible: "N",
        size: "small",
        listVisible: "N",
        label: "动态列表",
        templateDownFlag: "N",
        importFlag: "N",
        name: "table"
      }
    };
    for (let index in mvDataList) {
      let temp = mvDataList[index];
      elements.push({
        colIndex: parseInt(index) + 1,
        items: [temp]
      });
    }
    table.preps["elements"] = elements;
    designForm.setDraggingItem(mvDataList[0]);
    return table;
  } else {
    designForm.setDraggingItem(mvDataList[0]);
    return mvDataList;
  }
};
const configDialogVisible = ref<boolean>(false);
const closeAction = () => {
  configDialogVisible.value = false;
};
const viewConfig = () => {
  configDialogVisible.value = true;
};
const configMsg = `操作指引：
1、此处配置主要是对字段展示方式,排除字段和组件类型做配置；
1、表字段在添加到舞台前需要做配置，配置好后再拖入舞台，
   否则配置不生效；
3、其他细节配置需要在舞台中进行处理`;
const dynamicBtn = () => {
  let userBtn: BtnAuth[] = [];
  userBtn.push({
    btnName: "add",
    labelName: "添加",
    icon: "add",
    disabled: added.value,
    exec: () => {
      tableSubmit(true);
    }
  });
  return userBtn;
};
onMounted(() => {
  init();
});
</script>
<template>
  <star-horse-dialog
      :boxWidth="'640px'"
      :dialog-visible="currentDataVisible"
      :selfFunc="true"
      :userBtn="dynamicBtn()"
      @reset="dataReset"
      @closeAction="tableOperClose"
      @merge="() => tableSubmit(false)"
  >
    <el-tabs v-model="tbTab">
      <el-tab-pane name="tb1">
        <template #label>
          <div class="flex items-center">
            <star-horse-icon icon-class="config" color="var(--star-horse-style)"/>
            风格设置
            <help :width="400" :message="configMsg"
            />
          </div>
        </template>
        <star-horse-form ref="tableFieldInfoRef" :field-list="dataFieldInfo"/>
      </el-tab-pane>
      <el-tab-pane name="tb2" label="表格属性" class="h-full overflow-hidden">
        <el-scrollbar height="100%">
          <table class="el-table field-table" style="width: 100%; ">
            <thead>
            <tr class="font-bold size9">
              <th>名称</th>
              <th>类型</th>
              <th class="w-[60px]">空标识</th>
              <th class="w-[40px]">主键</th>
              <th>备注</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="sdata in currentData.fields">
              <td>{{ sdata.fieldName }}</td>
              <td>{{ sdata.type }}</td>
              <td>{{ sdata.nullFlag }}</td>
              <td>{{ sdata.primaryKey }}</td>
              <td>{{ sdata.comment }}</td>
            </tr>
            </tbody>
          </table>
        </el-scrollbar>
      </el-tab-pane>
    </el-tabs>
  </star-horse-dialog>
  <star-horse-dialog
      :dialogVisible="configDialogVisible"
      @closeAction="closeAction"
      :selfFunc="true"
      :hideFullScreenIcon="true"
      @resetForm="configData={columns:1}"
      @merge="closeAction"
      :title="'属性配置'"
      :box-width="'20%'"
  >
    <el-form :model="configData" :size="compSize">
      <el-form-item label="每行显示列数">
        <el-input-number min="1" max="12" step="1" v-model="configData.columns" placeholder="请设置每行列数"/>
      </el-form-item>
      <el-form-item label="显示公共属性">
        <el-switch v-model="configData.commonFieldFlag" active-value="Y" inactive-value="N"/>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <el-row style="margin-top: 15px">
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
        <el-option :key="sitem.value" :label="sitem.name" :value="sitem.value" v-for="sitem in dbList"></el-option>
      </el-select>
    </el-col>
    <el-col :span="6">
      <el-button link @click="viewConfig" :size="compSize">
        <star-horse-icon icon-class="setting" color="var(--star-horse-style)"/>
        <span>配置</span>
      </el-button>
    </el-col>
  </el-row>
  <div style="margin-top: 5px"></div>
  <el-input :size="compSize" placeholder="请输入关键字" v-model="filterTableName" @keydown.enter="filterData">
    <template #append>
      <star-horse-icon @click="filterData" icon-class="search" color="var(--star-horse-style)"/>
    </template>
  </el-input>
  <el-scrollbar height="90%">
    <draggable
        :clone="onDataCopy"
        :group="{ name: 'starHorseGroup', pull: 'clone', put: false }"
        :sort="false"
        animation="300"
        ghost-class="ghost"
        item-key="id"
        tag="ul"
        :list="assignDataList"
    >
      <template #item="{ element: data, index: idx }">
        <li
            :style="{
            border: currentData.tableName == data.tableName ? '2px dashed var(--star-horse-style)' : 'none',
            'align-items': 'center',
            cursor: 'move'
          }"
        >
          <star-horse-icon icon-class="table" style="height: 18px"/>
          <el-tooltip :content="data.comment">
            {{ data.tableName }}
          </el-tooltip>
          <star-horse-icon
              title="查看&配置"
              icon-class="setting"
              style="color: var(--star-horse-style); cursor: pointer"
              @click="(evt: Event) => contextOperation(evt, data, idx)"
          />
        </li>
      </template>
    </draggable>
  </el-scrollbar>
</template>
<style scoped lang="scss">
:deep(.el-popover) {
  overflow-x: hidden;
}

.popover-header {
  display: flex;
  background: var(--star-horse-style);
  height: 30px;
  justify-content: end;
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

  tr > th,
  tr > td {
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
