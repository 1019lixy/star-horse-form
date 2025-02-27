<script setup lang="ts" name="RoleUserList">
import {analysisField, apiInstance, closeLoad, createCondition, dialogPreps, load, loadData} from '@/api/sh_api';
import {ApiUrls} from '@/components/types/ApiUrls';
import {Config} from '@/api/settings';
import {onActivated, onDeactivated, onMounted, PropType, provide, reactive, ref} from 'vue';
import {SearchFields} from '@/components/types/SearchProps';
import {PageFieldInfo, UserFuncInfo} from '@/components/types/PageFieldInfo';
import {getCustomerParam} from '@/utils/auth';
import {operationConfirm, success, warning} from '@/utils/message.ts';
import {SearchParams} from '@/components/types/Params';
import {postRequest} from '@/api/star_horse.ts';
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/employeeInfo');
dataUrl.loadByPageUrl = '/system-config/system/employeeInfo/compRolePageList';
dataUrl.deleteUrl = '/system-config/system/companyRolePkEmployee/batchDeleteById';
const props = defineProps({
  showButton: {type: Boolean, default: true},
  dialogInput: {type: Boolean, default: false},
  multipleSelect: {type: Boolean, default: false},
  queryCondition: {type: Array as PropType<SearchParams[]>, default: []}
});
//主键
const primaryKey = 'idEmployeeInfo';
const employeeInfoRef = ref();
//定义表单的所有属性
let rankList = ref<any>([]);
let stationList = ref<any>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '姓名',
      fieldName: 'name',
      defaultVisible: true,
      matchType: 'lk',
      type: 'input'
    },
    {
      label: '工号',
      fieldName: 'employeeNo',
      defaultVisible: true,
      matchType: 'lk',
      type: 'input'
    },
    {
      label: '职级',
      fieldName: 'rank',
      defaultVisible: false,
      optionList: rankList,
      type: 'tselect'
    },
    {
      label: '岗位',
      fieldName: 'station',
      defaultVisible: false,
      optionList: stationList,
      type: 'tselect'
    },
  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: false,
  //属性列表
  fieldList: [
    {
      label: '主键',
      fieldName: 'idEmployeeInfo',
      type: 'input',
      required: true,
      formVisible: false,
      listVisible: false,
    },
    {
      dytableList: [
        [{
          label: '姓名',
          fieldName: 'name',
          type: 'input',
          required: true,
          formVisible: !false,
          listVisible: !false,
        },
          {
            label: '工号',
            fieldName: 'employeeNo',
            type: 'input',
            editDisabled: 'Y',
            required: true,
            formVisible: !false,
            listVisible: !false,
          },
          {
            label: '头像',
            fieldName: 'photo',
            type: 'upload',
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
              autoUpload: 'N',
              action: 'xx',
              wordBreak: true,
              rowspan: 2,
            }
          },],
        [{
          label: '职级',
          fieldName: 'rank',
          type: 'tselect',
          optionList: rankList,
          required: false,
          formVisible: !false,
          listVisible: !false,
          preps: {
            showCode: 'Y',
          }
        },
          {
            label: '岗位',
            fieldName: 'station',
            type: 'tselect',
            optionList: stationList,
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
              showCode: 'Y',
            }
          },],
        [{
          label: '所属公司',
          fieldName: 'idCompanyDefine',
          type: 'input',
          required: true,
          formVisible: !false,
          listVisible: !false,

          preps: {
            checkStrictly: 'Y'
          }
        },
          {
            label: '所属部门',
            fieldName: 'idDepartmentInfo',
            type: 'input',
            required: true,
            formVisible: !false,
            listVisible: !false,
            preps: {
              checkStrictly: 'Y'
            }
          },]
        ,
        [{
          label: '联系电话',
          fieldName: 'phone',
          type: 'input',
          required: false,
          formVisible: !false,
          listVisible: !false,
          preps: {
            colspan: 1
          }
        }],
      ]
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
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '创建时间',
      fieldName: 'createdTime',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '修改时间',
      fieldName: 'updatedTime',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '数据编号',
      fieldName: 'dataNo',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '状态码',
      fieldName: 'statusCode',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '状态名称',
      fieldName: 'statusName',
      type: 'input',
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
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
    {
      label: '备注',
      fieldName: 'remark',
      type: 'input',
      required: false,
      formVisible: !true,
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
  stopAutoLoad: false
});
//校验
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
let extandBtns = ref<UserFuncInfo[]>([{
  btnName: '移出',
  authority: 'delete',
  icon: 'delete',
  funcName: async (row: any) => {
    let flag = await operationConfirm('确定要移出吗？');
    if (flag) {
      let params: Array<any> = [];
      let idCompanyDefine = analysisField(props.queryCondition, 'idCompanyDefine');
      let idCompanyRole = analysisField(props.queryCondition, 'idCompanyRole');
      params.push({
        idEmployee: row.idEmployeeInfo,
        idCompanyDefine: idCompanyDefine.value,
        idCompanyRole: idCompanyRole.value
      });
      load('数据处理中');
      employeeInfoRef.value.loadByPage();
      postRequest(dataUrl.deleteUrl!, params).then(res => {
        if (res.data.code) {
          warning(res.data.cnMessage);
          return;
        }
        success('操作成功');
      }).finally(() => closeLoad());
    }
  }
}]);
//初始化方法
const initData = async () => {
  console.log(props.queryCondition);
  tableFieldList.condition = [...props.queryCondition];
  let cond = getCustomerParam();
  if (cond) {
    tableFieldList.condition.push(cond);
  }
  //加载职级
  let result = await loadData('/system-config/system/rankDefine/rankTree', {});
  if (result.error) {
    warning(result.error);
  } else {
    rankList.value = result.data;
  }
  //加载岗位
  result = await loadData('/system-config/system/stationDefine/stationTree', {});
  if (result.error) {
    warning(result.error);
  } else {
    stationList.value = result.data;
  }
};
const activated = () => {
  //initData();
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
  //转换显示信息
  if (name == 'idCompanyDefine') {
    return row['companyName'] || cellValue;
  }
  if (name == 'idDepartmentInfo') {
    return row['deptName'] || cellValue;
  }
  if (name == 'rank') {
    return row['rankName'] || cellValue;
  }
  if (name == 'station') {
    return row['stationName'] || cellValue;
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
  <star-horse-dialog :dialog-visible="dialogProps?.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content ">
    <div class="search_btn" :style="{'flex-direction':Config?.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="(data)=>employeeInfoRef.createSearchParams(data)"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>employeeInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config?.buttonStyle" v-if="showButton"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="employeeInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dialogInput="dialogInput"
                           :filterCondition="tableFieldList.condition"
                           :multipleSelect="multipleSelect"
                           :disableAction="!showButton"
                           :extandBtns="extandBtns"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>

</style>
