<script setup lang="ts" name="SystemParams">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
} from 'star-horse-lowcode';
import {
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from 'vue';
import { getCustomerParam } from '@/utils/auth';
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/systemParams');
//主键
const primaryKey = 'idSystemParams';
const systemParamsRef = ref();
//定义表单的所有属性
const formFields = reactive<object>({});
provide('formFields', formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '参数名',
      fieldName: 'paramName',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '参数值',
      fieldName: 'paramValue',
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
      label: '参数名',
      fieldName: 'paramName',

      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        editDisabled: true,
      },
    },
    {
      label: '参数值',
      fieldName: 'paramValue',
      type: 'textarea',
      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '版本号',
      fieldName: 'version',
      type: 'number',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '创建人',
      fieldName: 'createdBy',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '创建时间',
      fieldName: 'createdTime',
      type: 'datetime',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '修改时间',
      fieldName: 'updatedTime',
      type: 'datetime',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '状态码',
      fieldName: 'statusCode',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '状态名称',
      fieldName: 'statusName',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '是否删除',
      fieldName: 'isDel',
      type: 'number',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '国际编码',
      fieldName: 'local',

      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '备注',
      fieldName: 'remark',
      type: 'textarea',
      required: false,
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
provide('dialogProps', dialogProps);
//初始化方法
const initData = async () => {};
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
      @refresh="systemParamsRef?.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
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
        @searchData="(data: any) => systemParamsRef?.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
      ref="systemParamsRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :help-msg="`系统参数创建后，请不要随便删除或者修改，\n否则可能导致系统功能异常`"
      :dataFormat="dataFormat"
    />
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
