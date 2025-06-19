<script setup lang="ts" name="MessageRecord">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
  SelectOption
} from "star-horse-lowcode";
import {loadDict} from "@/api/star_horse_apis";
import {Config} from "@/api/settings";
import {onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {getCustomerParam} from "@/utils/auth";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/messageRecord");
//主键
const primaryKey = "idMessageRecord";
const messageRecordRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let typeList = ref<SelectOption[]>([]);
let categoryList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "分类",
      fieldName: "category",
      optionList: categoryList,
      defaultVisible: true,
      type: "select"
    },
    {
      label: "类别",
      fieldName: "type",
      optionList: typeList,
      defaultVisible: true,
      type: "select"
    },
    {
      label: "标题",
      fieldName: "title",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    }
  ]
});
let personsVisible = ref<boolean>(false);
let statusList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: "分类",
        fieldName: "category",
        type: "select",
        required: true,
        optionList: categoryList,
        formVisible: !false,
        listVisible: !false
      },
      {
        label: "类别",
        fieldName: "type",
        type: "select",
        required: true,
        optionList: typeList,
        formVisible: !false,
        listVisible: !false
      }
    ],
    {
      label: "标题",
      fieldName: "title",
      type: "input",
      required: true,
      formVisible: !false,
      listVisible: !false
    },

    [
      {
        label: "是否广播消息",
        fieldName: "commonFlag",
        type: "switch",
        defaultValue: "Y",
        actionName: "change",
        actions: (val: any) => {
          personsVisible.value = val["commonFlag"] == "N";
        },
        required: true,
        formVisible: !false,
        listVisible: !false
      },
      {
        label: "状态",
        fieldName: "statusCode",
        type: "select",
        optionList: statusList,
        required: false,
        formVisible: true,
        listVisible: !true
      }
    ],
    {
      label: "接收人",
      fieldName: "receivePersonsName",
      aliasName: "receivePersons",
      type: "user",
      required: true,
      formVisible: personsVisible,
      listVisible: !false,
      preps: {
        multiple: true,
      }
    },
    {
      label: "状态",
      fieldName: "statusName",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
    },
    {
      label: "跳转Url",
      fieldName: "url",
      type: "input",
      required: false,
      formVisible: !false,
      listVisible: !false
    },
    {
      label: "内容",
      fieldName: "content",
      type: "markdown",
      required: true,
      formVisible: !false,
      listVisible: !false
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
      type: "datetime",
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
      type: "datetime",
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
//初始化方法
const initData = async () => {
  typeList.value = await loadDict("message_type");
  categoryList.value = await loadDict("message_category");
  statusList.value = await loadDict("message_status");
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
  if (name == "type") {
    return typeList.value.find((item) => item.value == cellValue)?.name || cellValue;
  }
  if (name == "category") {
    return categoryList.value.find((item) => item.value == cellValue)?.name || cellValue;
  }
  if (name == "statusCode") {
    return statusList.value.find((item) => item.value == cellValue)?.name || cellValue;
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
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="messageRecordRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => messageRecordRef?.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="messageRecordRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
