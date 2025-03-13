<script setup lang="ts" name="NodeProperties">
  import { apiInstance, dialogPreps } from "@/api/star_horse_utils.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { ref, reactive, provide, onMounted } from "vue";
  import { SearchFields } from "@/components/types/SearchProps";
  import { Config } from "@antv/x6";
  const dataUrl: ApiUrls = apiInstance("devops-continus", "continus/nodeProperties");
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "节点", fieldName: "idNodeProperty", type: "input", matchType: "lk", defaultVisible: true },
      { label: "测试报告类型", fieldName: "projectType", type: "reportType", matchType: "lk", defaultVisible: true }
    ]
  });
  const tableFieldList = reactive({
    fieldList: [
      {
        label: "主键",
        fieldName: "idNodeProperty",
        type: "input"
      },
      {
        label: "实例ID",
        fieldName: "idContinusInst",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      [
        {
          label: "名称",
          fieldName: "nodeName",
          formVisible: true,
          listVisible: true
        },
        {
          label: "列索引",
          fieldName: "columnIndex",
          type: "number",
          formVisible: true,
          listVisible: true
        }
      ],
      [
        {
          label: "执行方式",
          fieldName: "executionType",
          type: "select",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "程序语言",
          fieldName: "language",
          type: "select",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],
      [
        {
          label: "项目编码",
          fieldName: "charset",
          type: "select",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "源码相对目录",
          fieldName: "codeDir",
          type: "number",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],

      [
        {
          label: "执行失败通知",
          fieldName: "failurReport",
          type: "select",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "执行成功通知",
          fieldName: "successReport",
          type: "select",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],
      [
        {
          label: "自定义规则",
          fieldName: "selfRules",
          type: "input",
          required: true,
          formVisible: true,
          listVisible: true
        },
        {
          label: "行索引",
          fieldName: "rowIndex",
          type: "number",
          required: true,
          formVisible: true,
          listVisible: true
        }
      ],
      {
        label: "备注",
        fieldName: "remark",
        type: "textarea",
        formVisible: true
      },
      {
        label: "创建人",
        disabled: "Y",
        fieldName: "createdBy",
        type: "input"
      },
      {
        label: "修改人",
        disabled: "Y",
        fieldName: "updatedBy",
        type: "input"
      },
      {
        label: "创建日期",
        disabled: "Y",
        fieldName: "createdDate",
        type: "date"
      },
      {
        label: "修改日期",
        disabled: "Y",
        fieldName: "updatedDate",
        type: "date"
      },
      {
        label: "数据版本号",
        fieldName: "version",
        type: "number"
      },
      {
        label: "是否已逻辑",
        fieldName: "isDel",
        type: "number"
      },
      {
        label: "数据编号",
        fieldName: "dataNo",
        type: "input"
      },
      {
        label: "状态码",
        fieldName: "statusCode",
        type: "input"
      },
      {
        label: "状态码名称",
        fieldName: "statusName",
        type: "input"
      },
      {
        label: "国际码",
        fieldName: "local",
        type: "input"
      }
    ],
    batchFieldList: []
  });
  const primaryKey = "idNodeProperty";
  const nodePropertyRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const selectItemFun = (data: any) => {};
  const dataFormat = (name: string, cellValue: object): any => {
    return cellValue;
  };
  const init = async () => {};
  onMounted(async () => {
    await init();
  });
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="nodePropertyRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => nodePropertyRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => nodePropertyRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <star-horse-table-comp
      ref="nodePropertyRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      @selectItem="selectItemFun"
    />
  </el-card>
</template>
