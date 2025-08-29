<script lang="ts" name="RankDefine" setup>
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from "vue";
import { getCustomerParam } from "@/utils/auth";
import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SearchParams,
} from "star-horse-lowcode";
import { i18n } from "@/lang";

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/rankDefine");
//主键
const primaryKey = "idRankDefine";
const rankDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let rankTypeList = ref<any>({});
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.rank.name"),
      fieldName: "rankName",
      defaultVisible: true,
      matchType: "lk",
    },
    {
      label: i18n("system.rank.code"),
      fieldName: "rankCode",
      defaultVisible: true,
      matchType: "lk",
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: i18n("system.rank.name"),
        fieldName: "rankName",

        required: false,
        formVisible: true,
        listVisible: true,
      },
      {
        label: i18n("system.rank.code"),
        fieldName: "rankCode",

        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          editDisabled: true,
        },
      },
    ],
    [
      {
        label: i18n("system.belonging.category"),
        fieldName: "idRankType",
        type: "tselect",
        required: false,
        formVisible: true,
        listVisible: true,
        preps: {
          checkStrictly: true,
          data: rankTypeList,
          props: {
            label: "rankTypeName",
            value: "idRankType",
          },
        },
      },
      {
        label: i18n("system.rank.sort"),
        fieldName: "rankSort",
        type: "number",
        required: false,
        formVisible: true,
        listVisible: true,
      },
    ],
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      required: false,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.version"),
      fieldName: "version",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.created.by"),
      fieldName: "createdBy",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.created.time"),
      fieldName: "createdTime",

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: i18n("system.updated.by"),
      fieldName: "updatedBy",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.updated.time"),
      fieldName: "updatedTime",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.data.number"),
      fieldName: "dataNo",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.status.code"),
      fieldName: "statusCode",
      required: false,
      formVisible: !true,
      listVisible: !true,
      preps: {
        dataSource:"dict",
        urlOrDictName:"public"
      },
    },
    {
      label: i18n("system.status.name"),
      fieldName: "statusName",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.is.logical.deleted"),
      fieldName: "isDel",
      type: "number",
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: i18n("system.international.code"),
      fieldName: "local",

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let currentRankTypeId = ref<string>("");
let outForm = ref<any>({});

const rankTypeChange = (data: TreeNodeData, _checked: boolean) => {
  currentRankTypeId.value = data["idRankType"];
  outForm.value["idRankType"] = currentRankTypeId.value;
  let params: SearchParams[] = [
    createCondition("a.idRankType", currentRankTypeId.value),
  ];
  rankDefineRef.value.createSearchParams(params);
};
//初始化方法
const initData = async () => {
  let result = await loadData(
    "/system-config/system/rankType/getAllByCondition",
    {
      orderBy: [{ fieldName: "rankTypeSort", ascOrDesc: "asc" }],
    },
  );
  if (result.error) {
    console.log(result.error);
    return;
  }
  rankTypeList.value = result.data;
};
const activated = () => {};
const deactivated = () => {};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  if(name=="idRankType"){
    return rankTypeList.value.find((item: any) => item.idRankType == cellValue)?.rankTypeName??cellValue;
  }
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
      :isShowBtnContinue="true"
    >
      <star-horse-form
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outForm"
        @refresh="rankDefineRef?.loadByPage()"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="rankTypeList"
            :expand="true"
            :showCode="true"
            treeTitle="职级分类"
            @selectData="rankTypeChange"
            :preps="{
              label: 'rankTypeName',
              value: 'idRankType',
              code: 'rankTypeCode',
            }"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => rankDefineRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="rankDefineRef"
              :compUrl="dataUrl"
              :dataFormat="dataFormat"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
