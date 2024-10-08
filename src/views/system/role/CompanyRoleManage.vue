<script setup lang="ts">
import {computed, onMounted, provide, reactive, ref} from "vue";
import {apiInstance, closeLoad, createCondition, dialogPreps, load, loadData} from "@/api/sh_api.ts";
import {error, success, warning} from "@/utils/message.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getRowIdentity} from "element-plus/es/components/table/src/util";
import {GlobalConfig} from "@/store/GlobalConfigStore.ts";
import piniaInstance from "@/store";
import UserManage from "@/views/system/UserManage.vue";
import {postRequest} from "@/api/star_horse.ts";
import {SearchFields} from "@/components/types/SearchProps";
import {Config} from "@/api/settings.ts";
import {SearchParams} from "@/components/types/Params";

let configStore = GlobalConfig(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || "default");
const dataUrl = apiInstance("system-config", "system/companyRole");
dataUrl.loadByPageUrl = "/system-config/system/companyRole/companyRoleUserList";
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "公司名称/编码",
      fieldName: "companyName",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "角色名称/编码",
      fieldName: "roleName",
      defaultShow: true,
      matchType: "lk",
      type: "input"
    },
  ]
});
let pageField = reactive<PageFieldInfo>({
  fieldList: [{
    label: "公司名称",
    fieldName: "companyName",
    type: "input",
    tableShow: true,
  }]
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
  let result = await loadData("/system-config/system/companyRole/getAllByCondition", {
    fieldList: [createCondition("a.roleType", "company_role")],
    orderBy: [{fieldName: "a.createdTime", ascOrDesc: "asc"}]
  });
  if (result.error) {
    warning("加载公司角色信息异常");
    return;
  }
  for (let index in result.data) {
    let temp = result.data[index];
    pageField.fieldList.push({
      label: temp.roleName,
      fieldName: temp.idCompanyRole,
      type: "button",
      tableShow: true,
      preps: {
        showComp: "Y",
        styles: {
          height: "100%",
          width: "100%",
          display: "block",
        }
      }

    });
  }
  await loadInstanceData([]);
}
const loadInstanceData = async (data: SearchParams[]) => {
  let conditions: SearchParams[] = [];
  conditions.push(createCondition("a.roleType", "company_role"));
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
}

const companyRoleManageRef = ref();
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let currentRow = ref<any>({});
let currentItem = ref<any>({});
const cellClick = (row: any, item: any) => {
  if (item.fieldName == "companyName") {
    return;
  }
  currentRow.value = row;
  currentItem.value = item;
  dialogProps.bakeVisible1 = true;
  console.log(row, item);
}
const assignRoleUser = () => {
  let selectedDatas = companyRoleManageRef.value.$refs.employeeInfoRef.multipleSelection;
  console.log(selectedDatas);
  if (!selectedDatas || selectedDatas.length == 0) {
    warning("请选择人员信息");
    return;
  }
  let datas = [];
  for (let index in selectedDatas) {
    datas.push({
      idCompanyDefine: currentRow.value["idCompanyDefine"],
      idCompanyRole: currentItem.value.fieldName,
      idEmployee: selectedDatas[index].idEmployeeInfo
    });
  }
  console.log(datas);
  load("数据提交中");
  postRequest("/system-config/system/companyRolePkEmployee/mergeBatch", datas).then(res => {
    if (res.data.code) {
      error(res.data.cnMessage);
      return;
    }
    success(res.data.cnMessage);
    dialogProps.bakeVisible1 = false;
    loadInstanceData([]);
  }).finally(() => closeLoad());

}
onMounted(() => {
  init();
});
</script>

<template>
  <star-horse-dialog :self-func="true" :title="'添加人员'" :dialog-visible="dialogProps.bakeVisible1"
                     :dialogProps="dialogProps" @merge="assignRoleUser">
    <div class="dialog-body">
      <user-manage :cellEditable="false" :showButton="false" :dialogInput="true" :multipleSelect="true"
                   ref="companyRoleManageRef"/>
    </div>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
      <star-horse-search-comp @searchData="loadInstanceData"
                              :formData="searchFormData"
                              :compUrl="dataUrl"/>
    </div>
    <hr/>
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
            :fixed="item.fieldName=='companyName'?'left':false"
        >
          <template #default="scope">
            <div v-if="!scope.row[item.fieldName]||scope.row[item.fieldName].length==0"
                 :class="{'role-user-operation':true}" @click="cellClick(scope.row,item)">
              设置人员
            </div>
            <div class="role-user-content" v-else @click="cellClick(scope.row,item)">
              <template v-if="item.fieldName=='companyName'">
                {{ scope.row[item.fieldName] }}
              </template>
              <template v-else v-for="temp in scope.row[item.fieldName]">
                <el-tag type="success">{{ temp.name }}</el-tag>
              </template>

            </div>
          </template>
        </el-table-column>
      </template>
    </el-table>
  </el-card>
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

  :deep(.el-tag) {
    margin-left: 8px;
  }
}
</style>
