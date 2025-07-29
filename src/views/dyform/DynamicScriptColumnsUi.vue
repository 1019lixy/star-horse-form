<script setup lang="ts">
import {
  onMounted,
  provide,
  reactive,
  ref,
  onActivated,
  onDeactivated,
  nextTick,
} from 'vue';
import {
  apiInstance,
  dialogPreps,
  SearchFields,
  PageFieldInfo,
  ApiUrls,
  createDatetime,
} from 'star-horse-lowcode';
import { getCustomerParam } from '@/utils/auth';
defineOptions({
  name: 'DynamicScriptColumns',
});
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance(
  'userdb-manage',
  'userdb/dynamicScriptColumns',
);
//主键
const primaryKey = 'idDynamicScriptColumn';
const dynamicScriptColumnsRef = ref();
const dynamicScriptColumnsFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide('formFields', formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '字段名称',
      fieldName: 'columnName',
      matchType: 'lk',
    },
    {
      label: '描述',
      fieldName: 'labelName',
      matchType: 'lk',
    },
    {
      label: '查询显示',
      fieldName: 'searchVisible',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '表单显示',
      fieldName: 'formVisible',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '列表显示',
      fieldName: 'listVisible',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '动态脚本消费视图',
      fieldName: 'idDynamicScriptConsumerView',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      defaultVisible: true,
      matchType: 'lk',
    },
  ],
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: '主键',
      fieldName: 'idDynamicScriptColumn',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '字段名称',
      fieldName: 'columnName',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '描述',
      fieldName: 'labelName',
      formVisible: true,
      listVisible: true,
    },
    {
      label: '查询显示',
      fieldName: 'searchVisible',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '表单显示',
      fieldName: 'formVisible',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '列表显示',
      fieldName: 'listVisible',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '动态脚本消费视图',
      fieldName: 'idDynamicScriptConsumerView',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '版本号',
      fieldName: 'version',
      type: 'number',
    },
    {
      label: '创建人',
      fieldName: 'createdBy',
    },
    {
      label: '创建时间',
      fieldName: 'createdTime',
      type: 'datetime',
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',
    },
    {
      label: '修改时间',
      fieldName: 'updatedTime',
      type: 'datetime',
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',
    },
    {
      label: '状态',
      fieldName: 'statusCode',
    },
    {
      label: '状态名称',
      fieldName: 'statusName',
    },
    {
      label: '是否删除',
      fieldName: 'isDel',
      type: 'number',
    },
    {
      label: '国际编码',
      fieldName: 'local',
    },
    {
      label: '租户',
      fieldName: 'tenantId',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '备注',
      fieldName: 'remark',
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
//初始化方法
const initData = async () => {};
const activated = async () => {
  await nextTick(() => {
    dynamicScriptColumnsRef.value.loadByPage();
  });
};
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
  let temp: any = {};
  if (Object.keys(temp).length > 0) {
    dynamicScriptColumnsFormRef.value.updateFormData(temp);
  }
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
  <star-horse-dialog
    :isShowBtnContinue="true"
    :dialog-visible="dialogProps.editVisible"
    :dialogProps="dialogProps"
  >
    <star-horse-form
      @refresh="dynamicScriptColumnsRef?.loadByPage()"
      @dataLoaded="dataLoaded"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      ref="dynamicScriptColumnsFormRef"
      :rules="rules"
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
        @searchData="
          (data: any) => dynamicScriptColumnsRef?.createSearchParams(data)
        "
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="dynamicScriptColumnsRef"
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
