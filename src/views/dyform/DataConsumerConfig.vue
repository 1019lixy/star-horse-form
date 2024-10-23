<script setup lang="ts" name="DataConsumerConfig">
import {computed, nextTick, onMounted, ref, unref, watch} from "vue";
import {Cell} from "@antv/x6";
import {closeLoad, dictData, load, loadData, loadRolesInfo} from "@/api/sh_api";
import {error, success, warning} from "@/utils/message";
import {postRequest} from "@/api/star_horse";
import {SelectOption} from "@/components/types/SearchProps";
import {LocationQueryValue, useRoute} from "vue-router";
import {apiInstance} from "@/api/sh_api.ts";
import {ApiUrls} from "@/components/types/ApiUrls";
import StarHorseDialog from "@/components/comp/StarHorseDialog.vue";
import DataPreview from "@/views/dyform/DataPreview.vue";
import {CustomerItem} from "@/components/types/CompInfo.d.ts";
import {consumerNodeData, relationFieldInfo, table_width, viewFieldInfo} from "@/views/dyform/utils/DataConsumer.ts";
import {ConsumerView} from "@/store/ConsumerViewStore.ts";
import piniaInstance from "@/store";
import {tableColumns} from "@/views/dbsearch/utils/DbSearchUtils.ts";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import {useButtonPermission} from "@/store/ButtonPermissionStore.ts";
import {Config} from "@/api/settings.ts";

const route = useRoute();
const isView = ref<boolean>(false);
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicFormConsumerConfig");
const customerItems = ref<CustomerItem[]>([]);
const formConditionProps = ref<any>({});
const dataForm = ref<any>({});
const relationConditionList = ref<Array<any>>([]);
const consumerView = ConsumerView(piniaInstance);
let dbConfigId = computed(() => consumerView.dbConfigId);
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.buttonSize || Config.compSize);

const initDiagram = () => {
};
let viewTypeList = ref<SelectOption[]>();
let conditionList = ref<SelectOption[]>();
let consumeAuthorityList = ref<SelectOption[]>();
const init = async () => {
  initDiagram();
  viewTypeList.value = await dictData("consumer_type");
  conditionList.value = await dictData("consumer_relation_condition");
  consumeAuthorityList.value = await loadRolesInfo([]);
  if (route.query["configId"]) {
    loadConfigData(route.query["configId"]);
  }
};
onMounted(() => {
  init();
});
let cells = ref<Array<Cell>>([]);
const addNode = (data: any, columns: Array<any>, index: number = 0) => {
  console.log(data, columns, cells.value);
  let x = data.posX || (index % 4) * 350 + 450;
  let y = data.posY || Math.floor(index / 4) * 100 + 150;
  let datat = {
    items: columns,
    compType: "table",
    "shape": "er-rect",
    "label": data["key"],
    "tableName": data["key"],
    "name": data["key"],
    "width": table_width,
    posX: x,
    posY: y,
  };
  cells.value = containerDiagramRef.value.addNode(datat);
  // console.log(cells);
};
/**
 * 创建表之间的连线
 * @param tableName 表名
 * @param column 列明
 */
const addLine = (fromTable: string, fromKey: string, toTable: string, toKey: string) => {
  let nodes = unref(cells);
  const filterNode = (tableName: string) => {
    return nodes.find(item => item.getData().name == tableName);
  }
  const filterPort = (ports: Array<any>, column: string) => {
    return ports.find(item => item.attrs?.fieldName?.text == column).id;
  }
  let fromNode = filterNode(fromTable);
  let fromPorts = fromNode?.getPorts();
  let fromId = filterPort(fromPorts, fromKey);
  let toNode = filterNode(toTable);
  let toPorts = toNode?.getPorts();
  let toId = filterPort(toPorts, toKey);
  let edge = containerDiagramRef.value.graph.addEdge({
    source: {
      cell: fromNode!.id,
      port: fromId,
    },
    target: {
      cell: toNode!.id,
      port: toId
    },
    "attrs": {
      "line": {
        "stroke": "var(--star-horse-style)",
        "strokeWidth": 2
      }
    }
  });
  cells.value.push(edge);
}
const newCreate = () => {
  cells.value = [];
  containerDiagramRef.value.graph.clearCells();
};
const checkRelation = () => {
};
let isConfig = ref<boolean>(false);
let viewConfigInfo = ref<any>({});
/**
 *
 * @param tempCond
 */
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
const consumerDialogVisible = ref<boolean>(false);
const relationDialogVisible = ref<boolean>(false);
const dataPreviewVisible = ref<boolean>(false);
const containerDiagramRef = ref();
const formProps = ref<any>({});
const dataSourceFormRef = ref();
const submitValid = () => {
  if (isConfig.value) {
    closeAction();
    return;
  }
  dataSourceFormRef.value.$refs.starHorseFormRef.validate((result: boolean) => {
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
};
const resetDataSourceForm = () => {
  formProps.value = {};
};
const closeAction = () => {
  consumerDialogVisible.value = false;
  dataPreviewVisible.value = false;
};
const resetConditionForm = () => {
  formConditionProps.value = {};
};
const conditionClose = () => {
  resetConditionForm();
  relationDialogVisible.value = false;
}
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
  isView.value = route.query["isView"] == "Y";
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + configId, {});
  if (error) {
    warning(error);
    return;
  }
  newCreate();
  let dbCfgId = data["dataSourceConfigId"];
  consumerView.setDbConfigId(dbCfgId);
  formProps.value = data;
  formProps.value["sortFields"] = JSON.parse(data["sortFields"]);
  formProps.value["limitFields"] = JSON.parse(data["limitFields"]);
  let relationDatas = data["consumerConfigRelationList"];
//把表加入舞台
  //把关系加入舞台
  for (let index in relationDatas) {
    let temp = relationDatas[index];
    let tbColumns = await tableColumns(dbCfgId, temp.fromTable);
    addNode({comment: temp.fromTable, key: temp.fromTable, posX: temp.fromPosX, posY: temp.fromPosY}, tbColumns, 0);
    if (temp.toTable) {
      tbColumns = await tableColumns(dbCfgId, temp.toTable);
      addNode({comment: temp.toTable, key: temp.toTable, posX: temp.toPosX, posY: temp.toPosY}, tbColumns, 1);
      //创建连线
      addLine(temp.fromTable, temp.fromField, temp.toTable, temp.toField);
    }
  }
  if (cells.value.length > 0) {
    console.log(cells.value);
    containerDiagramRef.value.graph.resetCells(cells.value);
  }
};
const createMergeData = () => {
  let configInfo = viewConfigInfo.value;
  let relations = configInfo.relations;
  let formData: any = dataSourceFormRef.value?.getFormData().value||{};
  let tables = configInfo.tables;
  if (!relations && tables.length > 1) {
    warning("两张表之间必须要设置关联关系");
    return {};
  }
  //如果有关系则只处理有关系的数据
  let subData: Array<any> = [];
  if (relations && relations.length > 0) {
    for (let index in relations) {
      let temp = relations[index];
      subData.push({
        fromTable: temp.from,
        fromLabel: temp.fromLabel,
        fromKey: "from" + index,
        fromField: temp.fromPort,
        toTable: temp.to,
        toLabel: temp.toLabel,
        toKey: "to" + index,
        toField: temp.toPort,
        fromPosX: temp.fromData.posX,
        fromPosY: temp.fromData.posY,
        toPosX: temp.toData.posX,
        toPosY: temp.toData.posY,
      });
    }
  } else {
    let temp = tables[0];
    subData.push({
      fromTable: temp.from,
      fromKey: "from1",
    });
  }
  let sortFieldsTemp = formProps.value["sortFields"];
  let limitFieldsTemp = formProps.value["limitFields"];
  formProps.value["consumerConfigRelationList"] = subData;
  formProps.value["dataSourceConfigId"] = dbConfigId.value;
  formProps.value["sortFieldList"] = exclusionOptionList(sortFieldsTemp);
  formProps.value["limitFieldList"] = exclusionOptionList(limitFieldsTemp);
  let data = JSON.parse(JSON.stringify(formProps.value));
  data = {...data, ...formData};
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
        if (stemp.primaryFlag == "Y") {
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
}
/**
 * 保存数据前配置
 * @param dataInfo
 * @param isSubmit 是否是数据提交
 */
const configView = (dataInfo: any, isSubmit: boolean) => {
  isConfig.value = !isSubmit;
  viewConfigInfo.value = {...dataInfo};
  consumerDialogVisible.value = true;
};
/**
 * 预览数据
 * @param dataInfo
 */
const preview = (dataInfo: any) => {
  viewConfigInfo.value = {...dataInfo};
  //加载视图
  loadColumnFields();
  dataList(1, 20);
  dataPreviewVisible.value = true;
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
const conditionFormRef = ref();
const conditionValid = () => {
  conditionFormRef.value.$refs.starHorseFormRef.validate((result: boolean) => {
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
const lineOperation = (data: any) => {
  // console.log(data);
  let fdata = relationConditionList.value.find(item => item.from == data.from && item.fromPort == data.fromPort &&
      item.to == data.to && item.toPort == data.toPort);
  if (fdata) {
    formConditionProps.value = fdata;
  } else {
    formConditionProps.value = {...data};
  }
  relationDialogVisible.value = true;
};
const nodeOperation = (cell: any) => {
  // console.log(cell);
};
</script>
<template>
  <star-horse-dialog :dialogVisible="dataPreviewVisible" :title="'数据预览'"
                     @closeAction="closeAction"
                     :isBatch="false" :isView="true">
    <div class="dialog-body">
    <DataPreview :compSize="compSize" :item="previewDatas"  :columns="columnList" @changePage="dataList" :isPriview="true"/>
    </div>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="relationDialogVisible" :title="'关系配置'" :isBatch="false"
                     @merge="conditionValid"
                     @closeAction="conditionClose"
                     @reset="resetConditionForm" :selfFunc="true">
    <star-horse-form v-model:data-form="formConditionProps" ref="conditionFormRef" :compUrl="dataUrl"
                     :fieldList="relationFieldInfo(formConditionProps)"
                     :rules="{}"/>
  </star-horse-dialog>
  <star-horse-dialog :dialogVisible="consumerDialogVisible" :title="'消费配置'" :isBatch="false"
                     @merge="submitValid"
                     @closeAction="closeAction"
                     @reset="resetDataSourceForm" :selfFunc="true">
    <star-horse-form ref="dataSourceFormRef" :outerFormData="formProps" :compUrl="dataUrl"
                     :fieldList="viewFieldInfo(viewTypeList,consumeAuthorityList,viewConfigInfo)"
                     :rules="{}"/>
  </star-horse-dialog>
  <el-card class="inner_content" style="height: 100%;padding: 5px;">
    <star-horse-design :customerItems="customerItems" :register-node="consumerNodeData" ref="containerDiagramRef"
                       :tableFlag="true"
                       :activeCollapse="'db'"
                       :panelStyle="'other'"
                       :showDbList="true"
                       :showCompList="false"
                       :compType="'table'"
                       v-model:data-form="dataForm"
                       @lineClick="lineOperation"
                       @preview="preview"
                       @save="(val:any)=>configView(val,true)"
                       @config="(val:any)=>configView(val,false)"
                       @validation="checkRelation"
                       @nodeClick="nodeOperation"/>
  </el-card>
</template>
<style lang="scss" scoped>
</style>
