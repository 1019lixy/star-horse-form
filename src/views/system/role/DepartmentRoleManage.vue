<script setup lang="ts" name="CompanyRole">
import {apiInstance, closeLoad, createCondition, dialogPreps, dictData, load, loadData} from '@/api/sh_api';
import {ApiUrls} from '@/components/types/ApiUrls';
import {Config} from '@/api/settings';
import {computed, onActivated, onDeactivated, onMounted, provide, reactive, ref} from 'vue';
import {SearchFields, SelectOption} from '@/components/types/SearchProps';
import {PageFieldInfo} from '@/components/types/PageFieldInfo';
import {getCustomerParam} from '@/utils/auth';
import {GlobalConfig} from '@/store/GlobalConfigStore.ts';
import piniaInstance from '@/store';
import {SearchParams} from '@/components/types/Params';
import {TreeNodeData} from 'element-plus/es/components/tree-v2/src/types';
import {error, success, warning} from '@/utils/message.ts';
import {postRequest} from '@/api/star_horse.ts';
import {getRowIdentity} from 'element-plus/es/components/table/src/util';
import UserManage from '@/views/system/UserManage.vue';
import RoleUserList from '@/views/system/comp/RoleUserList.vue';
import StarHorseIcon from '@/components/comp/StarHorseIcon.vue';
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/companyRole');
dataUrl.loadByPageUrl = '/system-config/system/companyRole/departRoleUserList';
//主键
const companyRoleRef = ref();
const companyRoleManageRef = ref();
let companyList = ref<Array<any>>([]);
//定义表单的所有属性
const formFields = reactive<object>({});
provide('formFields', formFields);
let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);

//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '部门名称/编码',
      fieldName: 'deptName',
      defaultVisible: true,
      matchType: 'lk',
      type: 'input'
    },
    {
      label: '角色名称/编码',
      fieldName: 'roleName',
      defaultVisible: true,
      matchType: 'lk',
      type: 'input'
    },
  ]
});

let roleTypeList = ref<SelectOption[]>([]);
//页面属性
const pageField = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: '部门名称',
      fieldName: 'deptName',
      type: 'input',
      required: true,
      listVisible: true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
let dataList = ref<Array<any>>([]);
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  currentUserGroupId.value = data['idCompanyDefine'];
  defaultCondition.value = [createCondition('b.idCompanyDefine', currentUserGroupId.value)];
  loadInstanceData([]);
};

//初始化方法
const initData = async () => {
  let result = await loadData('/system-config/system/companyDefine/getAllByCondition', {});
  if (result.error) {
    warning(result.error);
    return;
  }
  companyList.value = result.data;
  roleTypeList.value = await dictData('company_role_type');
  result = await loadData('/system-config/system/companyRole/getAllByCondition', {
    fieldList: [createCondition('a.roleType', 'department_role')],
    orderBy: [{fieldName: 'a.createdTime', ascOrDesc: 'asc'}]
  });
  if (result.error) {
    warning('加载公司角色信息异常');
    return;
  }
  for (let index in result.data) {
    let temp = result.data[index];
    pageField.fieldList.push({
      label: temp.roleName,
      fieldName: temp.idCompanyRole,
      type: 'button',
      listVisible: true,
      preps: {
        showComp: 'Y',
        styles: {
          height: '100%',
          width: '100%',
          display: 'block',
        }
      }

    });
  }
  await loadInstanceData([]);
};
const assignRoleUser = () => {
  let selectedDatas = companyRoleManageRef.value.$refs.employeeInfoRef.multipleSelection;
  console.log(selectedDatas);
  if (!selectedDatas || selectedDatas.length == 0) {
    warning('请选择人员信息');
    return;
  }
  let datas = [];
  for (let index in selectedDatas) {
    datas.push({
      idCompanyDefine: currentRow.value['idCompanyDefine'],
      idCompanyRole: currentItem.value.fieldName,
      idDepartment: currentRow.value['idDepartment'],
      idEmployee: selectedDatas[index].idEmployeeInfo
    });
  }
  console.log(datas);
  load('数据提交中');
  postRequest('/system-config/system/companyRolePkEmployee/mergeBatch', datas).then(res => {
    if (res.data.code) {
      error(res.data.cnMessage);
      return;
    }
    success(res.data.cnMessage);
    dialogProps.bakeVisible1 = false;
    loadInstanceData([]);
  }).finally(() => closeLoad());

};
const activated = () => {
  // initData();
};
const deactivated = () => {
};
let currentRow = ref<any>({});
let currentItem = ref<any>({});
const cellClick = (row: any, item: any) => {
  if (item.fieldName == 'deptName') {
    return;
  }
  currentRow.value = row;
  currentItem.value = item;
  dialogProps.bakeVisible1 = true;
};
const loadInstanceData = async (data: SearchParams[]) => {
  let conditions: SearchParams[] = [];
  if (!currentUserGroupId.value) {
    return;
  }
  conditions.push(createCondition('a.roleType', 'department_role'));
  conditions.push(createCondition('a.idCompanyDefine', currentUserGroupId.value));
  if (data) {
    conditions.push(...data);
  }
  let result = await loadData(dataUrl.loadByPageUrl!, {
    fieldList: conditions
  });
  if (result.error) {
    warning(result.error);
    return;
  }
  dataList.value = result.data;
  dialogProps.bakeVisible2 = false;
};
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
let viewUserTitle = ref<string>('');
let queryCondition = ref<SearchParams[]>([]);
const showAllUsers = (row: any, item: any, event: MouseEvent) => {
  event.stopPropagation();
  viewUserTitle.value = `${row.companyName}--${item.label}人员列表`;
  queryCondition.value = [];
  dialogProps.bakeVisible2 = true;
  queryCondition.value.push(createCondition('b.idCompanyDefine', row['idCompanyDefine']));
  queryCondition.value.push(createCondition('b.idCompanyRole', item.fieldName));
  queryCondition.value.push(createCondition('b.idDepartment', row['idDepartment']));
  console.log(row, item);
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
  <star-horse-dialog :self-func="true" :title="viewUserTitle" :dialog-visible="dialogProps.bakeVisible2"
                     :dialogProps="dialogProps" @merge="(data)=>loadInstanceData([])"
                     @closeAction="(data)=>loadInstanceData([])">
      <role-user-list :queryCondition="queryCondition" :showButton="false" :dialogInput="true" :multipleSelect="true"
                      ref="companyRoleManageRef"/>
  </star-horse-dialog>
  <star-horse-dialog :self-func="true" :title="'添加人员'" :dialog-visible="dialogProps.bakeVisible1"
                     :dialogProps="dialogProps" @merge="assignRoleUser">
      <user-manage :cellEditable="false" :showButton="false" :dialogInput="true" :multipleSelect="true"
                   ref="companyRoleManageRef"/>
  </star-horse-dialog>

  <el-row :gutter="10" class="h100-overflow-hidden ">
    <el-col :span="5" class="h100">
      <star-horse-tree v-model:tree-datas="companyList" :expand="true" treeTitle="公司列表" @selectData="companyChange"
                       :preps="{
                       label:'name',
                       value:'idCompanyDefine'
                       }"
                       :compSize="compSize"/>
    </el-col>
    <el-col :span="19" class="h100">
      <el-card class="inner_content h100">
        <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
          <star-horse-search-comp @searchData="loadInstanceData"
                                  :formData="searchFormData"
                                  :compUrl="dataUrl"/>
          <hr/>
        </div>
        <el-table
            ref="starHorseTableCompRef"
            :data="dataList"
            :row-key="getRowIdentity"
            :stripe="false"
            :fit="true"
            :size="compSize"
            :min-height="400"
            :highlight-current-row="false"
            :row-style="{height: '80px'}"
            :cell-style="{ height: '80px','font-size': '12px'}"
            :header-cell-style="{ background: '#f2f2f2', color: '#707070', 'font-size': '13px','background-image':'-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))'}"
            border
        >
          <template v-for="item in pageField.fieldList">
            <el-table-column
                :prop="item.fieldName"
                :label="item.label"
                :min-width="200"
                :fixed="item.fieldName=='deptName'?'left':false"
            >
              <template #default="scope">
                <div v-if="!scope.row[item.fieldName]||scope.row[item.fieldName].length==0"
                     :class="{'role-user-operation':true}" @click="cellClick(scope.row,item)">
                  设置人员
                </div>
                <div class="role-user-content" v-else @click="cellClick(scope.row,item)">
                  <template v-if="item.fieldName=='deptName'">
                    {{ scope.row[item.fieldName] }}
                  </template>
                  <template v-else>
                    <el-tag type="success" v-for="temp in scope.row[item.fieldName]">{{ temp.name }}</el-tag>
                    <star-horse-icon icon-class="more" v-if="scope.row[item.fieldName].length>10"
                                     style="cursor: pointer"
                                     title="查看所有人员信息"
                                     @click="showAllUsers(scope.row,item,$event)"/>
                  </template>

                </div>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </el-card>
    </el-col>
  </el-row>
</template>
<style lang="scss">
:deep(.cell) {
  height: 100%;
  display: flex;
}

.role-user-operation {
  display: flex;
  opacity: 0;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 13px;
  font-weight: bold;
  cursor: pointer;
  flex-wrap: wrap;

  &:hover {
    opacity: 1;
    background: var(--star-horse-shadow);
  }
}

.role-user-content {
  display: flex;
  width: 100%;
  height: 100%;
  align-items: center;
  justify-content: left;
  margin: 0 auto;
  flex-wrap: wrap;

  :deep(.el-tag) {
    margin-left: 8px;
  }
}
</style>
