<script lang="ts" name="StationDefine" setup>
import {onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {Config} from "@/api/settings";
import {getCustomerParam} from "@/utils/auth";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {
  apiInstance,
  createCondition,
  dialogPreps,
  loadData,
  ApiUrls,
  SearchFields,
  PageFieldInfo,
  SearchParams
} from "star-horse-lowcode";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/stationDefine");
//主键
const primaryKey = "idStationDefine";
const stationDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let stationSequenceList = ref<Array<any>>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "岗位名称",
      fieldName: "stationName",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "岗位编码",
      fieldName: "stationCode",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    }
  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: "主键",
      fieldName: "idStationDefine",
      type: "input",
      required: true,
      formVisible: false,
      listVisible: false
    },

    [
      {
        label: "岗位名称",
        fieldName: "stationName",
        type: "input",
        required: false,
        formVisible: !false,
        listVisible: !false
      },
      {
        label: "岗位编码",
        fieldName: "stationCode",
        type: "input",
        required: false,
        formVisible: !false,
        listVisible: !false
      }
    ],
    [
      {
        label: "所属序列",
        fieldName: "idStationSequence",
        type: "tselect",
        optionList: stationSequenceList,
        required: false,
        formVisible: !false,
        listVisible: !false,
        preps: {
          checkStrictly: "Y",
          props: {
            label: "seqName",
            value: "idStationSequence"
          }
        }
      },
      {
        label: "岗位排序",
        fieldName: "stationSort",
        type: "number",
        defaultValue: 100,
        required: false,
        formVisible: !false,
        listVisible: !false
      }
    ],
    {
      label: "版本号",
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "创建人",
      fieldName: "createdBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "状态名称",
      fieldName: "statusName",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "国际编码",
      fieldName: "local",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "备注",
      fieldName: "remark",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()]
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let currentSeqId = ref<string>("");
let outForm = ref<any>({});
const sequenceChange = (data: TreeNodeData, _checked: boolean) => {
  currentSeqId.value = data["idStationSequence"];
  outForm.value["idStationSequence"] = currentSeqId.value;
  let params: SearchParams[] = [createCondition("a.idStationSequence", currentSeqId.value)];
  stationDefineRef.value.createSearchParams(params);
};
//初始化方法
const initData = async () => {
  let params: SearchParams[] = [];
  let cond = createCondition("a.parentId", null, "is");
  cond.orOperList = [createCondition("a.parentId", "")];
  let result = await loadData("/system-config/system/stationSequence/getAllByCondition", {
    fieldList: params,
    orderBy: [{fieldName: "seqSort", ascOrDesc: "asc"}]
  });
  if (result.error) {
    console.log(result.error);
    return;
  }
  stationSequenceList.value = result.data;
};
const activated = () => {
};
const deactivated = () => {
};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "idStationSequence") {
    return row["seqName"] || cellValue;
  }
  //转换显示信息
  return cellValue;
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
  activated();
});
onDeactivated(() => {
  deactivated();
});
</script>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps" :isShowBtnContinue="true">
    <star-horse-form
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outForm"
        @refresh="stationDefineRef.loadByPage()"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :isView="true"
      :title="'查看数据'"
  >
    <star-horse-data-view :compUrl="dataUrl" :dataFormat="dataFormat" :field-list="tableFieldList"/>
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree
          v-model:tree-datas="stationSequenceList"
          :expand="true"
          treeTitle="职位序列"
          @selectData="sequenceChange"
          :preps="{
          label: 'seqName',
          value: 'idStationSequence'
        }"
      />
    </el-col>
    <el-col :span="19" class="h100">
      <div class="search-content">
        <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
          <star-horse-search-comp
              @searchData="(data: any) => stationDefineRef.createSearchParams(data)"
              :formData="searchFormData"
              :compUrl="dataUrl"
          />
        </div>
      </div>
      <el-card class="inner_content h100">
        <star-horse-table-comp
            ref="stationDefineRef"
            :compUrl="dataUrl"
            :dataFormat="dataFormat"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
        />
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss" scoped>
//todo
</style>
