<script setup lang="ts" name="CompanyRole">
import { Config } from '@/api/settings';
import {
  computed,
  onActivated,
  onDeactivated,
  onMounted,
  provide,
  reactive,
  ref,
} from 'vue';
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createCondition,
  dialogPreps,
  dictData,
  error,
  load,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SearchParams,
  SelectOption,
  success,
  useGlobalConfigStore,
  UserFuncInfo,
  warning,
} from 'star-horse-lowcode';
import { statusList } from '@/views/system/utils/UserFields';
import { getCustomerParam } from '@/utils/auth';
import { TreeNodeData } from 'element-plus/es/components/tree-v2/src/types';
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance('system-config', 'system/companyRole');
dataUrl.condition = [createCondition('a.roleType', 'common_role', 'neq')];
//主键
const primaryKey = 'idCompanyRole';
const companyRoleRef = ref();
const assignRoleCompanyRef = ref();
let companyList = ref<Array<any>>([]);
let outerFormData = ref<any>({});
//定义表单的所有属性
const formFields = reactive<object>({});
provide('formFields', formFields);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
let currentUserGroupId = ref<number>(0);
let defaultCondition = ref<SearchParams[]>([]);

const roleTypeChange = (data: TreeNodeData, _checked: boolean) => {
  currentUserGroupId.value = data['value'];
  outerFormData.value['roleType'] = data['value'];
  defaultCondition.value = [
    createCondition('a.roleType', currentUserGroupId.value),
  ];
  companyRoleRef.value.createSearchParams(defaultCondition.value);
};
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '角色名称',
      fieldName: 'roleName',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '角色编码',
      fieldName: 'roleCode',
      defaultVisible: true,
      matchType: 'lk',
    },
  ],
});

let roleTypeList = ref<SelectOption[]>([]);
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: '角色类型',
      fieldName: 'roleType',
      type: 'select',
      required: true,
      formVisible: true,
      listVisible: true,
      preps: {
        values: roleTypeList,
      },
    },
    {
      label: '角色名称',
      fieldName: 'roleName',

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: '角色编码',
      fieldName: 'roleCode',

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
      listVisible: true,
    },
    {
      label: '创建时间',
      fieldName: 'createdTime',

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: '修改人',
      fieldName: 'updatedBy',

      required: false,
      formVisible: !true,
      listVisible: true,
    },
    {
      label: '修改时间',
      fieldName: 'updatedTime',

      required: false,
      formVisible: !true,
      listVisible: true,
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
      type: 'select',
      required: false,
      formVisible: true,
      listVisible: !true,
      preps: {
        values: statusList,
      },
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
      listVisible: !true,
    },
  ],
  //默认查询条件
  condition: [getCustomerParam()],
});
//校验
const rules = {};
let outerForm = ref<any>({});
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
let extendBtns = ref<UserFuncInfo[]>([]);
//初始化方法
const initData = async () => {
  roleTypeList.value = await dictData('company_role_type', ['common_role']);
};
const assignCompany = () => {
  let selectedDatas = assignRoleCompanyRef.value.getSelectData();
  console.log(selectedDatas);
  if (!selectedDatas || selectedDatas.length == 0) {
    warning('请设置当前角色的归属公司');
    return;
  }
  let datas = [];
  for (let index in selectedDatas) {
    datas.push({
      idCompanyRole: outerForm.value['idCompanyRole'],
      idCompanyDefine: selectedDatas[index].idCompanyDefine,
    });
  }
  load('数据提交中');
  postRequest('/system-config/system/companyRolePkDefine/mergeBatch', datas)
    .then((res) => {
      if (res.data.code) {
        error(res.data.cnMessage);
        return;
      }
      success(res.data.cnMessage);
      dialogProps.bakeVisible1 = false;
      companyRoleRef.value.loadByPage();
    })
    .finally(() => closeLoad());
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
  if (name == 'roleType') {
    return (
      roleTypeList.value.find((item) => item.value == cellValue)?.name ||
      cellValue
    );
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :self-func="true"
      :title="'设置角色归属公司'"
      :dialog-visible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
      @merge="assignCompany"
    >
      <star-horse-tree
        v-model:tree-datas="companyList"
        :showCheckBox="true"
        expand="true"
        treeTitle="公司列表"
        showSelectData="true"
        ref="assignRoleCompanyRef"
        :preps="{
          label: 'name',
          value: 'idCompanyDefine',
        }"
        :compSize="compSize"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialog-visible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="companyRoleRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
        :outerFormData="outerFormData"
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
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible size="240" min="100" max="500">
          <star-horse-tree
            v-model:tree-datas="roleTypeList"
            :expand="true"
            treeTitle="角色类型"
            @selectData="roleTypeChange"
            :showSearch="false"
            :compSize="compSize"
          />
        </el-splitter-panel>
        <el-splitter-panel>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => companyRoleRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="companyRoleRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :extendBtns="extendBtns"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss">
.hover_content {
  margin: 0;
  width: 400px;

  .content {
    margin: 10px 5px;
    display: flex;
    justify-content: start;

    .el-tag {
      margin-left: 10px;
    }
  }
}
</style>
