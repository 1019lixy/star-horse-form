<script lang="ts" name="StationSequence" setup>
  import { apiInstance, createCondition, dialogPreps, loadData } from "@/api/star_horse_utils.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { Config } from "@/api/settings";
  import { nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref } from "vue";
  import { SearchFields } from "@/components/types/SearchProps";
  import { PageFieldInfo, UserFuncInfo } from "@/components/types/PageFieldInfo";
  import { getCustomerParam } from "@/utils/auth";
  import { SearchParams } from "@/components/types/Params";
  //后端交互接口地址
  const dataUrl: ApiUrls = apiInstance("system-config", "system/stationSequence");
  //主键
  const primaryKey = "idStationSequence";
  const stationSequenceRef = ref();
  //定义表单的所有属性
  const formFields = reactive<any>({});
  const outerForm = ref<any>({});
  provide("formFields", formFields);
  let stationSequenceList = ref<Array<any>>([]);
  let extandBtns = ref<UserFuncInfo[]>([
    {
      btnName: "添加子节点",
      authority: "add",
      icon: "add",
      priority: 1,
      funcName: async (row: any) => {
        console.log(row);
        outerForm.value["parentId"] = row[primaryKey];
        dialogProps.editVisible = true;
        await nextTick();
      }
    }
  ]);
  //查询属性
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      {
        label: "名称",
        fieldName: "seqName",
        defaultVisible: true,
        matchType: "lk",
        type: "input"
      },
      {
        label: "编码",
        fieldName: "seqCode",
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
        fieldName: "idStationSequence",
        type: "input",
        required: true,
        formVisible: false,
        listVisible: false
      },
      [
        {
          label: "名称",
          fieldName: "seqName",
          type: "input",
          required: true,
          formVisible: !false,
          listVisible: !false
        },
        {
          label: "编码",
          fieldName: "seqCode",
          type: "input",
          editDisabled: "Y",
          required: true,
          formVisible: !false,
          listVisible: !false
        }
      ],
      [
        {
          label: "父节点",
          fieldName: "parentId",
          type: "tselect",
          optionList: stationSequenceList,
          required: false,
          formVisible: !false,
          listVisible: false,
          preps: {
            checkStrictly: "Y",
            props: {
              label: "seqName",
              value: "idStationSequence"
            }
          }
        },
        {
          label: "排序",
          fieldName: "seqSort",
          type: "number",
          defaultValue: 100,
          required: false,
          formVisible: !false,
          listVisible: !false
        }
      ],
      {
        label: "序列描述",
        fieldName: "remark",
        type: "textarea",
        required: false,
        formVisible: true,
        listVisible: true
      },
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
        listVisible: true
      },
      {
        label: "创建时间",
        fieldName: "createdTime",
        type: "input",
        required: false,
        formVisible: !true,
        listVisible: true
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
  //初始化方法
  const initData = async () => {
    let params: SearchParams[] = [];
    let cond = createCondition("a.parentId", null, "is");
    cond.orOperList = [createCondition("a.parentId", "")];
    let result = await loadData(dataUrl.userConditionUrl!, {
      fieldList: params,
      orderBy: [{ fieldName: "seqSort", ascOrDesc: "asc" }]
    });
    if (result.error) {
      console.log(result.error);
      return;
    }
    stationSequenceList.value = result.data;
  };
  const activated = () => {
    initData();
  };
  const deactivated = () => {};
  /**
   * 列表，查看数据时数据转换
   * @param name 名称
   * @param cellValue 值
   * @param row 列表行数据
   */
  const dataFormat = (name: string, cellValue: any, row: any): any => {
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
      :outerFormData="outerForm"
      @refresh="stationSequenceRef.loadByPage()"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :isView="true"
    :title="'查看数据'"
  >
    <star-horse-data-view :compUrl="dataUrl" :dataFormat="dataFormat" :field-list="tableFieldList" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }" class="search_btn">
      <star-horse-search-comp
        :compUrl="dataUrl"
        :formData="searchFormData"
        @searchData="(data) => stationSequenceRef.createSearchParams(data)"
      />
      <hr />
      <star-horse-button-list
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
        @tableCompFunc="(fun) => stationSequenceRef.tableCompFunc(fun)"
      />
    </div>
    <hr />
    <star-horse-table-comp
      ref="stationSequenceRef"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      :fieldList="tableFieldList"
      :extandBtns="extandBtns"
      :primaryKey="primaryKey"
    />
  </el-card>
</template>
<style lang="scss" scoped>
  //todo
</style>
