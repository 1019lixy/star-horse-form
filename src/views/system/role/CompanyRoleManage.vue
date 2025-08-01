<script setup lang="ts">
import { computed, onMounted, provide, reactive, ref } from 'vue';
import {
  apiInstance,
  closeLoad,
  createCondition,
  dialogPreps,
  error,
  load,
  loadData,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SearchParams,
  success,
  useGlobalConfigStore,
  warning,
} from 'star-horse-lowcode';
import { getRowIdentity } from 'element-plus/es/components/table/src/util';
import { Config } from '@/api/settings';

let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(
  () => configStore.configFormInfo?.inputSize || Config.compSize,
);
const dataUrl = apiInstance('system-config', 'system/companyRole');
dataUrl.pageListUrl = `${dataUrl.basePrefix}/companyRoleUserList`;
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: '公司名称/编码',
      fieldName: 'companyName',
      defaultVisible: true,
      matchType: 'lk',
    },
    {
      label: '角色名称/编码',
      fieldName: 'roleName',
      defaultVisible: true,
      matchType: 'lk',
    },
  ],
});
let pageField = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: '公司名称',
      fieldName: 'companyName',

      listVisible: true,
    },
  ],
});
let dataList = ref<Array<any>>([]);
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
// const dataFormat = (name: string, cellValue: any, row: any): any => {
//   if (Array.isArray(cellValue) && cellValue.length == 0) {
//     return "";
//   }
//   //转换显示信息
//   return cellValue;
// }
const init = async () => {
  let result = await loadData(
    '/system-config/system/companyRole/getAllByCondition',
    {
      fieldList: [createCondition('a.roleType', 'company_role')],
      orderBy: [{ fieldName: 'a.createdTime', ascOrDesc: 'asc' }],
    },
  );
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
        },
      },
    });
  }
  await loadInstanceData([]);
};
const loadInstanceData = async (data: SearchParams[]) => {
  let conditions: SearchParams[] = [];
  conditions.push(createCondition('a.roleType', 'company_role'));
  if (data) {
    conditions.push(...data);
  }
  let result = await loadData(dataUrl.pageListUrl!, {
    fieldList: conditions,
  });
  if (result.error) {
    warning(result.error);
    return;
  }
  dataList.value = result.data;
  dialogProps.bakeVisible2 = false;
};

const companyRoleManageRef = ref();
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide('dialogProps', dialogProps);
let currentRow = ref<any>({});
let currentItem = ref<any>({});
const cellClick = (row: any, item: any) => {
  if (item.fieldName == 'companyName') {
    return;
  }
  currentRow.value = row;
  currentItem.value = item;
  dialogProps.bakeVisible1 = true;
  console.log(row, item);
};
const assignRoleUser = () => {
  let selectedDatas =
    companyRoleManageRef.value.$refs.employeeInfoRef.multipleSelection;
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
      idEmployee: selectedDatas[index].idEmployeeInfo,
    });
  }
  console.log(datas);
  load('数据提交中');
  postRequest('/system-config/system/companyRolePkEmployee/mergeBatch', datas)
    .then((res) => {
      if (res.data.code) {
        error(res.data.cnMessage);
        return;
      }
      success(res.data.cnMessage);
      dialogProps.bakeVisible1 = false;
      loadInstanceData([]);
    })
    .finally(() => closeLoad());
};
let viewUserTitle = ref<string>('');
let queryCondition = ref<SearchParams[]>([]);
const showAllUsers = (row: any, item: any, event: MouseEvent) => {
  event.stopPropagation();
  viewUserTitle.value = `${row.companyName}--${item.label}人员列表`;
  queryCondition.value = [];
  dialogProps.bakeVisible2 = true;
  queryCondition.value.push(
    createCondition('b.idCompanyDefine', row['idCompanyDefine']),
  );
  queryCondition.value.push(createCondition('b.idCompanyRole', item.fieldName));
  console.log(row, item);
};
onMounted(() => {
  init();
});
</script>

<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :self-func="true"
      :title="viewUserTitle"
      :dialog-visible="dialogProps.bakeVisible2"
      :dialogProps="dialogProps"
      @merge="(data) => loadInstanceData([])"
      @closeAction="(data) => loadInstanceData([])"
    >
      <role-user-list
        :queryCondition="queryCondition"
        :showButton="false"
        :dialogInput="true"
        :multipleSelect="true"
        ref="companyRoleManageRef"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :self-func="true"
      :title="'添加人员'"
      :dialog-visible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
      @merge="assignRoleUser"
    >
      <user-manage
        :cellEditable="false"
        :showButton="false"
        :dialogInput="true"
        :multipleSelect="true"
        ref="companyRoleManageRef"
      />
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
          @searchData="loadInstanceData"
          :formData="searchFormData"
          :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <el-table
        ref="starHorseTableCompRef"
        :data="dataList"
        :row-key="getRowIdentity"
        :stripe="false"
        :fit="true"
        :size="compSize"
        :min-height="400"
        :highlight-current-row="false"
        :row-style="{ height: '80px' }"
        :cell-style="{ height: '80px', 'font-size': '12px' }"
        :header-cell-style="{
          background: '#f2f2f2',
          color: '#707070',
          'font-size': '13px',
          'background-image':
            '-webkit-gradient(linear,left 0,left 100%,from(#f8f8f8),to(#ececec))',
        }"
        border
      >
        <template v-for="item in pageField.fieldList">
          <el-table-column
            :prop="item.fieldName"
            :label="item.label"
            :min-width="200"
            :fixed="item.fieldName == 'companyName' ? 'left' : false"
          >
            <template #default="scope">
              <div
                v-if="
                  !scope.row[item.fieldName] ||
                  scope.row[item.fieldName].length == 0
                "
                :class="{ 'role-user-operation': true }"
                @click="cellClick(scope.row, item)"
              >
                设置人员
              </div>
              <div
                class="role-user-content"
                v-else
                @click="cellClick(scope.row, item)"
              >
                <template v-if="item.fieldName == 'companyName'">
                  {{ scope.row[item.fieldName] }}
                </template>
                <template v-else>
                  <el-tag
                    type="success"
                    v-for="temp in scope.row[item.fieldName]"
                    >{{ temp.name }}</el-tag
                  >
                  <star-horse-icon
                    icon-class="more"
                    v-if="scope.row[item.fieldName].length > 10"
                    style="cursor: pointer"
                    title="查看所有人员信息"
                    @click="showAllUsers(scope.row, item, $event)"
                  />
                </template>
              </div>
            </template>
          </el-table-column>
        </template>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
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
    margin: 5px;
  }
}
</style>
