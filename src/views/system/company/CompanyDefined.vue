<script setup lang="ts" name="CompanyDefine">
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from 'vue';
import { getCustomerParam } from '@/utils/auth';
import {
  apiInstance,
  ApiUrls,
  createTree,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SelectOption,
  UserFuncInfo,
  warning,
} from 'star-horse-lowcode';

//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/companyDefine');
//主键
const primaryKey = 'idCompanyDefine';
const companyDefineRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide('formFields', formFields);
let companyCategoryList = ref<SelectOption[]>([]);
let companyList = ref<SelectOption[]>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '公司名称',
      fieldName: 'name',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '公司编码',
      fieldName: 'code',
      defaultVisible: true,
      matchType: 'lk',
    },
  ],
});

//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    [
      {
        label: '公司名称',
        fieldName: 'name',

        required: true,
        formVisible: true,
        listVisible: true,
      },
      {
        label: '公司编码',
        fieldName: 'code',

        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          editdisabled: true,
        },
      },
    ],
    [
      {
        label: '公司类别',
        fieldName: 'category',
        type: 'tselect',
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          data: companyCategoryList,
          checkStrictly: true,
          defaultExpandAll: 'Y',
        },
      },
      {
        label: '排序',
        fieldName: 'dataSort',
        type: 'number',
        required: true,
        formVisible: true,
        listVisible: true,
      },
    ],
    [
      {
        label: '公司简称',
        fieldName: 'shortName',

        required: false,
        formVisible: true,
        listVisible: true,
      },
      {
        label: '父节点',
        fieldName: 'parentId',
        type: 'tselect',
        formVisible: true,
        preps: {
          data: companyList,
          checkStrictly: true,
          defaultExpandAll: 'Y',
        },
      },
    ],
    {
      label: '备注',
      fieldName: 'remark',
      type: 'textarea',
      formVisible: true,
      listVisible: true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
let outerForm = ref<any>({});
provide('dialogProps', dialogProps);
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: '添加子公司',
    authority: 'add',
    icon: 'plus',
    priority: 1,
    funcName: (row: any) => {
      outerForm.value['parentId'] = row[primaryKey];
      dialogProps.editVisible = true;
    },
  },
]);
//初始化方法
const initData = async () => {
  let data = await loadData(
    '/system-config/system/companyCategory/getAllByCondition',
    {},
  );
  if (data.error) {
    warning(data.error);
    return;
  }
  companyCategoryList.value = createTree(
    data.data,
    'categoryCode',
    'categoryName',
    '',
  );
  await actived();
};
const actived = async () => {
  let data = await loadData(
    '/system-config/system/companyDefine/getAllByCondition',
    {},
  );
  if (data.error) {
    warning(data.error);
    return;
  }
  companyList.value = createTree(data.data, primaryKey, 'name', '');
};
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  return cellValue;
};
onMounted(async () => {
  await initData();
});
onActivated(() => {
  actived();
});
onDeactivated(() => {});
</script>
<template>
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialog-visible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="companyDefineRef?.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
      :outerFormData="outerForm"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :source="3"
  >
    <star-horse-data-view
      :dataFormat="dataFormat"
      :field-list="tableFieldList"
      :compUrl="dataUrl"
    />
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn">
      <star-horse-search-comp
        @searchData="(data: any) => companyDefineRef?.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="companyDefineRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :extendBtns="extendBtns"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
