<script setup lang="ts" name="DataConsumerConfig">
import {nextTick, onMounted, ref, watch} from "vue";
import {ElTreeV2} from 'element-plus'
import {Cell} from "@antv/x6";
import type {TreeNode, TreeNodeData} from 'element-plus/es/components/tree-v2/src/types'
import {closeLoad, dictData, load, loadData, loadGetData, rowClassName, searchMatchList} from "@/api/sh_api";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {SelectOption} from "@/components/types/SearchProps";
import {LocationQueryValue, useRoute} from "vue-router";
import {ApiUrls} from "@/components/types/ApiUrls";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import DataPreview from "@/views/dyform/DataPreview.vue";
import Help from "@/components/help.vue";
import {CustomerItem} from "@/components/types/CompInfo.d.ts";

const route = useRoute();
const isView = ref<boolean>(false);
//后端交互接口地址
const dataUrl: ApiUrls = {
  loadByPageUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/pageList",
  mergeUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/merge",
  mergeDraftUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/mergeDraft",
  batchMergeUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/mergeBatch",
  batchMergeDraftUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/mergeBatchDraft",
  loadByIdUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/getById",
  deleteUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/batchDeleteById",
  exportAllUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/exportData",
  downloadTemplateUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/downloadTemplate",
  userConditionUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/getAllByCondition",
  uploadUrl: "/userdb-manage/userdb/dynamicFormConsumerConfig/importData",
  importUrl: ""
};

const customerItems = ref<CustomerItem[]>([]);
const formConditionProps = ref<any>({});
const relationConditionList = ref<Array<any>>([]);
const hasItemFlag = ref(false);
const hasItems = () => {
  return hasItemFlag.value = cells.value.length > 0;
};

const line_height = 24;
const table_width = 320;

const nodeData: any = {
  portName: "erPortPosition",
  name: 'er-rect',
  entity: {
    inherit: 'rect',
    markup: [
      {
        tagName: 'rect',
        selector: 'body',
      },
      {
        tagName: 'text',
        selector: 'label',

      },
    ],
    attrs: {
      rect: {
        strokeWidth: 1,
        stroke: '#5F95FF',
        fill: '#5F95FF',
      },
      label: {
        fontWeight: 'bold',
        fill: '#ffffff',
        fontSize: 12,
        textAnchor: 'middle',
        textVerticalAnchor: 'middle',
        textWrap: {
          width: 300,
          ellipsis: true,
          breakWord: true
        }
      },
    },
    ports: {
      groups: {
        list: {
          markup: [
            {
              tagName: 'rect',
              selector: 'portBody',
            },
            {
              tagName: 'text',
              selector: 'name',
            },
            {
              tagName: 'text',
              selector: 'type',
            },
            {
              tagName: 'text',
              selector: 'comment',
            },

            {
              tagName: 'text',
              selector: 'primaryFlag',
            },
          ],
          attrs: {
            portBody: {
              width: table_width,
              height: line_height,
              strokeWidth: 1,
              stroke: '#5F95FF',
              fill: '#EFF4FF',
              magnet: true,
            },
            name: {
              ref: 'portBody',
              refX: 5,
              refY: 6,
              fontSize: 10,
              textWrap: {
                width: 78,
                ellipsis: true,
                breakWord: true
              }
            },
            type: {
              ref: 'portBody',
              refX: 80,
              refY: 6,
              fontSize: 10,
            },
            comment: {
              ref: 'portBody',
              refX: 150,
              refY: 6,
              fontSize: 10,
              textWrap: {
                width: 150,
                ellipsis: true,
                breakWord: true
              }
            },
            primaryFlag: {
              ref: 'portBody',
              refX: 300,
              refY: 6,
              fontSize: 10,
            },
          },
          position: 'erPortPosition',
        },
      },
    },
  },
  force: true
};
const initDiagram = () => {

};
let viewTypeList = ref<SelectOption[]>();
let conditionList = ref<SelectOption[]>();
let matchTypeList = ref<SelectOption[]>();
const init = async () => {
  initDiagram();
  let {data, error} = await loadData("/userdb-manage/userdb/dynamicForm/modelList", {});
  viewTypeList.value = await dictData("consumer_type");
  conditionList.value = await dictData("consumer_relation_condition");
  matchTypeList.value = searchMatchList();
  if (error) {
    warning(error);
    return;
  }
  customerItems.value?.push({
    name: "db",
    title: "自定义表组件",
    compItems: data["dataList"]
  });
  customerItems.value?.push({
    name: "flow",
    title: "工艺流程组件",
    compItems: [
      {label: "盒标打印", name: "box_print",icon:"drag"},
      {label: "数据传输", name: "data_trans",icon:"equal"},
      {label: "测试过站", name: "data_test",icon:"edit"},
    ]
  });
  // containerDiagramRef.value.createStencil(null, data["dataList"], "er-rect");
  if (route.query["configId"]) {
    loadConfigData(route.query["configId"]);
  }
};
onMounted(() => {
  init();
});
let cells = ref<Array<Cell>>([]);
const addNode = (data: TreeNodeData, node: TreeNode, e: MouseEvent) => {
  let reData = JSON.parse(JSON.stringify(data));
  console.log(reData, cells.value);
  let fdata = cells.value.filter((item: any) => item.store.data["tableName"] == reData["key"]);
  if (fdata?.length >= 3) {
    warning("相同的表最多能添加三次");
    return;
  }
  // let graph = containerDiagramRef.value.graph;
  // let sceneWidth = graph.options.width;
  // let sceneHeight = graph.options.height;
  // let sceneX = graph.options.x;
  // let sceneY = graph.options.y;
  let len = cells.value.length;
  let x = (len % 4) * 350 + 15;
  let y = Math.floor(len / 4) * 400 + 10;

  let ports = [];

  let items = reData["items"];
  for (let index in items) {
    let temp = items[index];
    let field = {
      group: "list",
      "attrs": {}
    };
    for (let key in temp) {
      field["attrs"][key] = {"text": temp[key]};
    }
    ports.push(field);
  }
  let datat = {
    "shape": "er-rect",
    "label": `${reData["comment"]}:${reData["key"]} `,
    "name": reData["key"],
    "width": table_width,
    position: {
      x: x,
      y: y,
    },
    "height": 24,
    "ports": ports
  };
  let cell = containerDiagramRef.value.addNode(datat);
  if (cell) {
    cells.value.push(cell);
  }
  hasItems();
};
const cxcommand = (event: any) => {
  if (isView.value) {
    warning("查看视图，不能编辑");
    return;
  }

  let val = event.currentTarget.id;

  hasItems();
};
const newCreate = () => {
  cells.value = [];
  containerDiagramRef.value.graph.clearCells();
  hasItems();
};
const checkRelation = () => {
};

let isConfig = ref<boolean>(false);
const configView = (flag: boolean) => {
  isConfig.value = flag;
  submit();
};

/**
 *
 */
const submit = () => {

  let {subData, tableList} = relationData();
  if (subData) {
    consumerDialogVisible.value = true;
  }
};
const currentTableList = () => {
  let {subData, tableList} = relationData();
  return tableList;
};
const exclusionOptionList = (tempCond: any) => {
  let condition = [];
  if (tempCond && tempCond.length > 0) {
    //不破坏原有结构
    let dataList = JSON.parse(JSON.stringify(tempCond));
    for (let i in dataList) {
      let stemp = dataList[i];
      delete stemp["optionList"];
      condition.push(stemp);
    }
  }
  return condition;
}
const relationData = () => {
  let edges = containerDiagramRef.value.graph.getEdges();
  if (edges && edges.length > 0) {

  }
  return {};
};
const createTableList = (tableList: SelectOption[], name: string, value: string): SelectOption | any => {
  let fdata = tableList.find(item => item?.value == value);
  if (fdata) {
    return;
  }
  return {name, value};
}


const consumerDialogVisible = ref<boolean>(false);
const relationDialogVisible = ref<boolean>(false);
const dataPreviewVisible = ref<boolean>(false);
const tableDialogVisible = ref<boolean>(false);
const containerDiagramRef = ref();
const formProps = ref<any>({});
const dataSourceFormRef = ref();
const dataRules = ref({
  viewName: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  viewType: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  tableName: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  fieldName: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  sortType: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  matchType: [{required: true, trigger: "blur", message: "必选项不能为空"}],
  matchValue: [{required: true, trigger: "blur", message: "必选项不能为空"}],
});
const submitValid = () => {
  if (isConfig.value) {
    console.log(formProps.value)
    closeAction();
    return;
  }
  dataSourceFormRef.value.validate((result: boolean) => {
    if (result) {
      let data = createMergeData();
      load("数据提交中");
      postRequest(dataUrl.mergeUrl, data).then(res => {
        let redata = res.data;
        if (redata.code != 0) {
          error(redata.cnMessage);
          return;
        }
        closeAction();
        resetDataSourceForm();
        newCreate();
        success("数据处理成功");
      }).finally(() => {
        closeLoad();
      });
    }
  });
  hasItems();
};
const resetDataSourceForm = () => {
  formProps.value = {};
  hasItems();
};
const closeAction = () => {
  consumerDialogVisible.value = false;
  dataPreviewVisible.value = false;
  hasItems();
};
const resetConditionForm = () => {
  formConditionProps.value = {};
};
const conditionClose = () => {
  resetConditionForm();
  relationDialogVisible.value = false;
}

const getTableName = (tableName: string) => {
  return getRelationTable(treeData.value, tableName)?.["comment"];
};
const getRelationTable = (datas: any, tableName: string): any => {
  let tempDatas = JSON.parse(JSON.stringify(datas));
  for (let index = 0; index < tempDatas.length; index++) {
    let temp = tempDatas[index];
    if (temp.key == tableName) {
      delete temp["children"];
      return temp;
    }
    if (temp.children?.length > 0) {
      let fdata = getRelationTable(temp.children, tableName);
      if (fdata && Object.keys(fdata).length > 0) {
        return fdata;
      }
    }
  }
}
const loadConfigData = async (configId: string | LocationQueryValue[]) => {
//加载数据
  await nextTick();
  isView.value = route.query["isView"] == "yes";
  let {data, error} = await loadGetData(dataUrl.loadByIdUrl + "/" + configId);
  if (error) {
    warning(error);
    return;
  }
  newCreate();
  formProps.value = data;
  formProps.value["sortFields"] = JSON.parse(data["sortFields"]);
  formProps.value["limitFields"] = JSON.parse(data["limitFields"]);
  let relationDatas = data["consumerConfigRelationList"];
//把表加入舞台
  //把关系加入舞台
  for (let index in relationDatas) {
    let temp = relationDatas[index];

    let fdata = getRelationTable(treeData.value, temp.fromTable) as Array<any>;
    if (parseInt(index) == 0) {
      addNode(fdata, {} as TreeNode, {} as MouseEvent);
    }

    fdata = getRelationTable(treeData.value, temp.toTable) as Array<any>;
    addNode(fdata, {} as TreeNode, {} as MouseEvent);
    //获取最新添加的两个节点Key

  }
  hasItems();
};
const createMergeData = () => {
  let {subData, tableList, dataSourceConfigId} = relationData();
  let sortFieldsTemp = formProps.value["sortFields"];
  let limitFieldsTemp = formProps.value["limitFields"];
  formProps.value["consumerConfigRelationList"] = subData;
  formProps.value["dataSourceConfigId"] = dataSourceConfigId;
  formProps.value["sortFieldList"] = exclusionOptionList(sortFieldsTemp);
  formProps.value["limitFieldList"] = exclusionOptionList(limitFieldsTemp);
  let data = JSON.parse(JSON.stringify(formProps.value));
  delete data["sortFields"];
  delete data["limitFields"];
  return data;
}
let previewDatas = ref<any>({});
const columnList = ref([]);
const searchFormData = ref<any>([]);
const loadColumnFields = async () => {
  searchFormData.value = [];
  columnList.value = [];
  await postRequest(`/userdb-manage/userdb/dynamicFormConsumerConfig/previewViewColumns`, createMergeData()).then(res => {
    let redata = res.data;
    if (redata.code != 0) {
      error(redata.cnMessage);
      return;
    }
    columnList.value = redata.data;
    for (let key in columnList.value) {
      let temp = columnList.value [key];
      for (let j in temp) {
        let stemp = temp[j] as any;
        if (stemp.primaryFlag == "yes") {
          continue;
        }
        searchFormData.value.push({
          label: stemp.comment,
          fieldName: key + "&" + stemp.name,
          type: stemp.type,
          matchType: "lk"
        })
      }
    }
  });
  // searchFormData.value = formDatas;
  // columnList.value = columns;
}
const preview = (currentPage: number, pageSize: number) => {

  //加载视图
  loadColumnFields();
  dataList(currentPage, pageSize);
}
const dataList = (currentPage: number, pageSize: number) => {
  load("数据解析中");
  let dataPo = {
    condition: createMergeData(),
    pageSize: pageSize || 20,
    currentPage: currentPage || 1
  };
  postRequest("/userdb-manage/userdb/dynamicFormConsumerConfig/preview", dataPo).then(res => {
    let redata = res.data;
    if (redata.code != 0) {
      error(redata.cnMessage);
      return;
    }
    previewDatas.value = redata.data;
    dataPreviewVisible.value = true;
  }).finally(() => {
    closeLoad();
  });
};
watch(
    () => route.query["configId"],
    (val) => {
      if (val) {
        loadConfigData(val);
      }
    },
    {immediate: false, deep: true}
);
const conditionParamsRef = ref();
const conditionFormRef = ref();

const conditionValid = () => {
  conditionFormRef.value.validate((result: boolean) => {
    if (!result) {
      console.error("验证失败");
      return;
    }
    let item = formConditionProps.value;
    let flag = false;
    for (let index in relationConditionList.value) {
      let data = relationConditionList.value[index];
      if (item.from == data.from && item.fromPort == data.fromPort &&
          item.to == data.to && item.toPort == data.toPort) {
        relationConditionList.value[index] = item;
        flag = true;
        break;
      }
    }
    if (!flag) {
      relationConditionList.value.push(item);
    }
    conditionClose();
  });
};

//const fieldList = ref<SelectOption[]>([]);
const tableChange = (row: any) => {
  let reDatas = getRelationTable(treeData.value, row.tableName)?.items;
  let fieldList = [];
  for (let ind in reDatas) {
    fieldList.push({
      name: reDatas[ind].comment,
      value: reDatas[ind].name
    });
  }
  row["optionList"] = fieldList;
}

const handelAddParamData = () => {
  if (!formConditionProps.value["conditionList"]) {
    formConditionProps.value["conditionList"] = [];
  }
  formConditionProps.value["conditionList"].push({matchType: "eq"});
};
const handelDeleteParamData = (row: any) => {
  let data = formConditionProps.value.conditions;
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
const handelAddSortData = () => {
  if (!formProps.value.sortFields) {
    formProps.value["sortFields"] = [];
  }
  formProps.value.sortFields.push({});
};
const handelSortDeleteData = (row: any) => {
  let data = formProps.value.sortFields;
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
const handelAddLimitFieldsData = () => {
  if (!formProps.value.limitFields) {
    formProps.value["limitFields"] = [];
  }
  formProps.value.limitFields.push({});
};
const handelLimitFieldsDeleteData = (row: any) => {
  let data = formProps.value.limitFields;
  for (let item in data) {
    let temp = data[item];
    if (temp.xh == row.xh) {
      data.splice(item, 1)
    }
  }
};
const dataFormat = (row: any, column: any, cellValue: any, index: number): any => {
  if (column.property == "dataSortType" || column.property == "limitFieldType" || column.property == "conditionType") {
    if (cellValue == "yes") {
      tableChange(row);
    }
  }
  return cellValue;
};
const lineOperation = (data: any) => {
  console.log(data);
  let
      fdata = relationConditionList.value.find(item => item.from == data.from && item.fromPort == data.fromPort &&
          item.to == data.to && item.toPort == data.toPort);
  if (fdata) {
    formConditionProps.value = fdata;
  } else {
    formConditionProps.value = {...data};
  }
  relationDialogVisible.value = true;
};
const nodeOperation = (cell: any) => {
  console.log(cell);
};
const onDataCopy = (data: any, type: String) => {
  let reData = JSON.parse(JSON.stringify(data));

  return reData;
};
const onStart = () => {
};
const dragend = (evt) => {
  console.log("end", evt);
};
</script>


<template>
  <star-horse-dialog :dialogVisible="dataPreviewVisible" :title="'数据预览'"
                     @closeAction="closeAction"
                     :isBatch="false" :isView="true">

    <DataPreview :item="previewDatas" :columns="columnList" @changePage="preview"/>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="relationDialogVisible" :title="'关系配置'" :isBatch="false"
                     @merge="conditionValid"
                     @closeAction="conditionClose"
                     @reset="resetConditionForm" :selfFunc="true">
    <el-form :model="formConditionProps" size="small" :rules="dataRules" ref="conditionFormRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="关联主表名" prop="from">
            {{ formConditionProps['from'] }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="关联主表字段名" prop="fromPort">
            {{ formConditionProps['fromPort'] }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="被关联表名" prop="to">
            {{ formConditionProps['to'] }}
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="被关联表字段名" prop="toPort">
            {{ formConditionProps['toPort'] }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-form-item label="自定义条件" prop="condition">
        <el-switch active-value="yes" inactive-value="no" v-model="formConditionProps['conditionType']"/>
        <el-table
            v-if="formConditionProps['conditionType']=='yes'"
            :data="formConditionProps['conditionList']"
            :fit=true
            :row-class-name="rowClassName"
            height="200px"
            ref="conditionParamsRef"
            :row-style="{
        'height':'30px'
      }"
            :cell-style="{
        'height':'30px',
        'font-size':'12px'
      }"
            :header-cell-style="{'background':'#f2f2f2',
      'color': '#707070',
      'font-size':'13px',
      'background-image': '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))'
      }"
            border
        >
          <el-table-column
              :show-overflow-tooltip="true"
              :width="60"
              label="行号"
              prop="rowIndex"
              v-if="true ">
            <template #default="scope">
              <el-form-item :prop="'conditionList['+scope.$index+'].rowIndex'">
                {{ scope.row.xh }}
              </el-form-item>
            </template>

          </el-table-column>
          <el-table-column prop="name" label="表名">
            <template #default="scope">
              <el-form-item required
                            :rules="dataRules['tableName']"
                            :prop="'conditionList['+scope.$index+'].tableName'">
                <el-select v-model="scope.row.tableName" filterable clearable placeholder="请选择表名"
                           @change="tableChange(scope.row)">
                  <el-option :value="formConditionProps['from']" :label="getTableName(formConditionProps['from'])"
                             :key=
                                 "formConditionProps['from']"/>
                  <el-option :value="formConditionProps['to']" :label=
                      "getTableName(formConditionProps['to'])" :key=
                                 "formConditionProps['to']"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="属性名" :formatter="dataFormat">
            <template #default="scope">
              <el-form-item required :rules="dataRules['fieldName']"
                            :prop="'conditionList['+scope.$index+'].fieldName'">
                <el-select v-model="scope.row.fieldName" filterable clearable placeholder="请选择字段名">
                  <el-option v-for="item in scope.row['optionList']" :value="item.value" :label="item.name" :key=
                      "item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="matchType" label="匹配方式">
            <template #default="scope">
              <el-form-item required :rules="dataRules['matchType']"
                            :prop="'conditionList['+scope.$index+'].matchType'">
                <el-select v-model="scope.row.matchType">
                  <el-option :value="item.value" :label="item.name" :key="item.value" v-for="item in
                      matchTypeList"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="匹配值">
            <template #default="scope">
              <el-form-item required :rules="dataRules['matchValue']"
                            :prop="'conditionList['+scope.$index+'].matchValue'">
                <el-input v-model="scope.row.matchValue" placeholder="请输入匹配值"/>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              align="center"
              prop="oper"
              width="100px"
          >
            <template #header>
										<span
                        @click="handelAddParamData"
                        class="oper-btn"
                        title="添加">
                      操作
											<star-horse-icon icon-class="add"/>
										</span>
            </template>
            <template #default="scope">
										<span
                        @click="handelAddParamData"
                        class="oper-btn"
                        title="添加"
                    >
											<star-horse-icon icon-class="add"/>
										</span>&nbsp;&nbsp;
              <span
                  @click="handelDeleteParamData(scope.row)"
                  class="oper-btn"
                  title="删除"
                  v-if="formConditionProps.conditions?.length>1">
											<star-horse-icon icon-class="delete"/>
										</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="consumerDialogVisible" :title="'消费配置'" :isBatch="false"
                     @merge="submitValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <el-form :model="formProps" :rules="dataRules" ref="dataSourceFormRef">
      <el-row>
        <el-col :span="12">
          <el-form-item label="视图名称" prop="viewName" required>
            <el-input v-model="formProps['viewName']" placeholder="请输入视图名称" clearable/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="视图类型" prop="viewType" required>
            <el-select v-model="formProps['viewType']" filterable clearable placeholder="请选择视图类型">
              <el-option v-for="item in viewTypeList" :value="item.value" :key="item.value" :label="item.name"/>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="消费权限" prop="consumeAuthority">
            <el-select v-model="formProps['consumeAuthority']" filterable clearable
                       placeholder="请选择消费权限"></el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="单次最大数量" prop="dataLimits">
            <el-input-number v-model="formProps['dataLimits']" min="1" clearable
                             placeholder="请设置单次最大数量"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否认证" prop="isAudit">
            <el-switch v-model="formProps['isAudit']" active-value="yes" inactive-value="no" active-text="是"
                       inactive-text="否"/>
          </el-form-item>

        </el-col>
        <el-col :span="12">
          <el-form-item label="是否去重" prop="isDistinct">
            <el-switch v-model="formProps['isDistinct']" active-value="yes" inactive-value="no" active-text="是"
                       inactive-text="否"/>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="是否需要公共字段" prop="isCommonField">
            <el-switch v-model="formProps['isCommonField']" active-value="yes" inactive-value="no"
                       active-text="是"
                       inactive-text="否"/>
            <help message="如果指定返回字段，该设置实现"/>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="是否创建菜单" prop="isCreateMenu">
            <el-switch v-model="formProps['isCreateMenu']" active-value="yes" inactive-value="no"
                       active-text="是"
                       inactive-text="否"/>

          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="是否字段排序" prop="dataSortType">
        <el-switch v-model="formProps['dataSortType']" active-value="yes" inactive-value="no" active-text="是"
                   inactive-text="否"/>
        <el-table
            v-if="formProps['dataSortType']=='yes'"
            :data="formProps['sortFields']"
            :fit=true
            :row-class-name="rowClassName"
            border
            :height="'200px'"
            ref="sortFieldRef"
        >
          <el-table-column
              :show-overflow-tooltip="true"
              :width="60"
              label="行号"
              prop="rowIndex"
              v-if="true ">
            <template #default="scope">
              <el-form-item :prop="'sortFields['+scope.$index+'].rowIndex'">
                {{ scope.row.xh }}
              </el-form-item>
            </template>

          </el-table-column>
          <el-table-column prop="name" label="表名">
            <template #default="scope">
              <el-form-item required
                            :rules="dataRules['tableName']"
                            :prop="'sortFields['+scope.$index+'].tableName'">
                <el-select v-model="scope.row.tableName" filterable clearable placeholder="请选择表名"
                           @change="tableChange(scope.row)">
                  <el-option v-for="item in currentTableList()" :value="item.value" :label="item.name"
                             :key="item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="属性名" :formatter="dataFormat">
            <template #default="scope">
              <el-form-item required :rules="dataRules['fieldName']"
                            :prop="'sortFields['+scope.$index+'].fieldName'">
                <el-select multiple collapse-tags v-model="scope.row.fieldName" filterable clearable
                           placeholder="请选择字段名">
                  <el-option v-for="item in scope.row['optionList']" :value="item.value" :label="item.name" :key=
                      "item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="matchType" label="匹配方式">
            <template #default="scope">
              <el-form-item required :rules="dataRules['sortType']"
                            :prop="'sortFields['+scope.$index+'].sortType'">
                <el-select v-model="scope.row.sortType">
                  <el-option value="asc" label="正序"/>
                  <el-option value="desc" label="倒序"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>

          <el-table-column
              align="center"
              prop="oper"
              width="100px"
          >
            <template #header>
										<span
                        @click="handelAddSortData"
                        class="oper-btn"
                        title="添加">
                      操作
											<star-horse-icon icon-class="add"/>
										</span>
            </template>
            <template #default="scope">
										<span
                        @click="handelAddSortData"
                        class="oper-btn"
                        title="添加"
                    >
											<star-horse-icon icon-class="add"/>
										</span>&nbsp;&nbsp;
              <span
                  @click="handelSortDeleteData(scope.row)"
                  class="oper-btn"
                  title="删除"
                  v-if="formProps.sortFields.length>1">
											<star-horse-icon icon-class="delete"/>
										</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="是否指定返回字段" prop="limitFieldType">
        <el-switch v-model="formProps['limitFieldType']" active-value="yes" inactive-value="no" active-text="是"
                   inactive-text="否"/>
        <el-table
            v-if="formProps['limitFieldType']=='yes'"
            :data="formProps['limitFields']"
            :fit=true
            :row-class-name="rowClassName"
            border
            :height="'200px'"
            ref="limitFieldRef"
        >
          <el-table-column
              :show-overflow-tooltip="true"
              :width="60"
              label="行号"
              prop="rowIndex"
              v-if="true ">
            <template #default="scope">
              <el-form-item :prop="'sortFields['+scope.$index+'].rowIndex'">
                {{ scope.row.xh }}
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="表名">
            <template #default="scope">
              <el-form-item required
                            :rules="dataRules['tableName']"
                            :prop="'sortFields['+scope.$index+'].tableName'">
                <el-select v-model="scope.row.tableName" filterable clearable placeholder="请选择表名"
                           @change="tableChange(scope.row)"
                >
                  <el-option v-for="item in currentTableList()" :value="item.value" :label="item.name"
                             :key="item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column prop="value" label="属性名" :formatter="dataFormat">
            <template #default="scope">
              <el-form-item required :rules="dataRules['fieldName']"
                            :prop="'sortFields['+scope.$index+'].fieldName'">
                <el-select multiple collapse-tags v-model="scope.row.fieldName" filterable clearable
                           placeholder="请选择字段名">
                  <el-option v-for="item in scope.row['optionList']"
                             :value="item.value" :label="item.name" :key=
                                 "item.value"/>
                </el-select>
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column
              align="center"
              prop="oper"
              width="100px"
          >
            <template #header>
										<span
                        @click="handelAddLimitFieldsData"
                        class="oper-btn"
                        title="添加">
                      操作
											<star-horse-icon icon-class="add"/>
										</span>
            </template>
            <template #default="scope">
										<span
                        @click="handelAddLimitFieldsData"
                        class="oper-btn"
                        title="添加"
                    >
											<star-horse-icon icon-class="add"/>
										</span>&nbsp;&nbsp;
              <span
                  @click="handelLimitFieldsDeleteData(scope.row)"
                  class="oper-btn"
                  title="删除"
                  v-if="formProps.limitFields.length>1">
											<star-horse-icon icon-class="delete"/>
										</span>
            </template>
          </el-table-column>
        </el-table>
      </el-form-item>
      <el-form-item label="视图描述" prop="remark">
        <el-input type="textarea" v-model="formProps['remark']" clearable placeholder="请输入视图描述"/>
      </el-form-item>
    </el-form>
  </star-horse-dialog>
  <el-card class="inner_content" style="height: 100%;padding: 5px;">
    <star-horse-design :customerItems="customerItems" :register-node="nodeData" ref="containerDiagramRef"
                       :tableFlag="true"
                       :panelStyle="'other'"
                       :compType="'table'"
                       @lineClick="lineOperation"
                       @preview="preview"
                       @save="configView"
                       @validation="checkRelation"
                       @nodeClick="nodeOperation"/>
  </el-card>
</template>
<style lang="scss" scoped>
#myDiagramDiv {
  background-color: #F8F8F8;
  border: 1px solid #aaa;
}

.diagram-box {
  border: solid 1px blue;
  width: 1500px;
  height: 650px;
  margin-top: 100px;
}

#myDiagramDiv {
  flex: 1;
  border: 1px solid rgb(212, 212, 212);
}

.menu {
  position: absolute;
  opacity: 0;
  margin: 0;
  padding: 8px 0;
  z-index: 999999;
  box-shadow: 0 5px 5px -3px rgba(0, 0, 0, 0.2), 0 8px 10px 1px rgba(0, 0, 0, 0.14), 0 3px 14px 2px rgba(0, 0, 0, 0.12);
  list-style: none;
  background-color: #ffffff;
  border-radius: 4px;
}

.menu-item {
  display: block;
  position: relative;
  min-width: 60px;
  margin: 0;
  padding: 6px 16px;
  border-bottom: #f1f2f3 solid 1px;
  font: bold 12px sans-serif;
  color: rgba(0, 0, 0, 0.87);
  cursor: pointer;
}

.menu-item[last-child] {
  border-bottom: none;
}

.menu-item::before {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
  content: '';
  width: 100%;
  height: 100%;
  background-color: #000000;
}

.menu-item:hover::before {
  opacity: 0.04;
}

.menu .menu {
  top: -8px;
  left: 100%;
}

.show-menu,
.menu-item:hover > .menu {
  display: block;
  opacity: 1;
}

.el-main {
  overflow: hidden;
  padding: 5px 10px;
}

.el-header {
  display: flex;
  flex-direction: row-reverse;
  margin-top: 10px;

  .el-button-group {
    height: 100%;
  }

}

.el-tree {
  height: 100%;

  .el-vl__wrapper {
    height: 100%;

    .el-vl__window {
      height: 100%;
    }
  }
}

.el-aside {
  overflow: hidden;
}

.backgournd-grid-app {
  display: flex;
  width: 100%;
  height: 100%;
  padding: 0;
  font-family: sans-serif;

  .app-content {
    flex: 1;
    height: 280px;
    margin-right: 8px;
    margin-left: 8px;
    border-radius: 5px;
    box-shadow: 0 12px 5px -10px rgb(0 0 0 / 10%), 0 0 4px 0 rgb(0 0 0 / 10%);
  }
}
</style>

