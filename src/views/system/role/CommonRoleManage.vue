<script setup lang="ts" name="CompanyRole">
  import { apiInstance, closeLoad, createCondition, dialogPreps, dictData, load, loadData } from "@/api/star_horse_utils.ts";
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { Config } from "@/api/settings";
  import { computed, nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref } from "vue";
  import { SearchFields, SelectOption } from "@/components/types/SearchProps";
  import { ExpandTable, PageFieldInfo, UserFuncInfo } from "@/components/types/PageFieldInfo";
  import { getCustomerParam } from "@/utils/auth";
  import { useGlobalConfigStore } from "@/store/GlobalConfig.ts";
  import piniaInstance from "@/store";
  import { SearchParams } from "@/components/types/Params";
  import { TreeNodeData } from "element-plus/es/components/tree-v2/src/types";
  import { operationConfirm, error, success, warning } from "@/utils/message.ts";
  import { statusList } from "@/views/system/utils/UserFields.ts";
  import { postRequest } from "@/api/star_horse_apis.ts";
  import { DyCompField } from "@/components/types/DyCompField";
  import UserManage from "@/views/system/UserManage.vue";
  //后端交互接口地址
  const dataUrl: ApiUrls = apiInstance("system-config", "system/companyRolePkEmployee");
  dataUrl.condition = [createCondition("a.roleType", "common_role")];
  //主键
  const primaryKey = "idCompanyRole";
  const companyRoleRef = ref();
  const assignRoleCompanyRef = ref();
  let companyList = ref<Array<any>>([]);
  let outerFormData = ref<any>({
    roleType: "common_role"
  });
  //定义表单的所有属性
  const formFields = reactive<object>({});
  provide("formFields", formFields);
  let currentUserGroupId = ref<number>(0);
  let defaultCondition = ref<SearchParams[]>([]);
  const companyChange = (data: TreeNodeData, _checked: boolean) => {
    currentUserGroupId.value = data["idCompanyDefine"];
    defaultCondition.value = [createCondition("b.idCompanyDefine", currentUserGroupId.value)];
    companyRoleRef.value.createSearchParams(defaultCondition.value);
  };
  //查询属性
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      {
        label: "角色名称",
        fieldName: "roleName",
        defaultVisible: true,
        matchType: "lk",
        type: "input"
      },
      {
        label: "角色编码",
        fieldName: "roleCode",
        defaultVisible: true,
        matchType: "lk",
        type: "input"
      }
    ]
  });
  const viewCompField = ref<DyCompField>({
    name: "UserInfoComp",
    emits: ["closeAction"],
    methods: {},
    onMounted: () => {},
    template: `
    <el-descriptions
        title="人员信息"
        direction="vertical"
        border
        style="margin-top: 10px"
    >
      <el-descriptions-item
          :rowspan="2"
          :width="140"
          label="头像"
          align="center"
      >
        <el-image
            style="width: 100px; height: 100px"
            :src="data.name||''"
        />
      </el-descriptions-item>
      <el-descriptions-item label="姓名/工号">{{ data.name }}/{{ data.employeeNo }}</el-descriptions-item>
      <el-descriptions-item :width="140" label="联系电话">{{ data.phone || "--" }}</el-descriptions-item>
      <el-descriptions-item label="职级">{{ data.rank || "--" }}</el-descriptions-item>
      <el-descriptions-item label="岗位">{{ data.station || "--" }}</el-descriptions-item>
      <el-descriptions-item label="所属组织">
        {{ data.companyName }}-{{ data.deptName }}
      </el-descriptions-item>
    </el-descriptions>
  `
  });
  let roleTypeList = ref<SelectOption[]>([]);
  //页面属性
  const tableFieldList = reactive<PageFieldInfo | any>({
    //属性列表
    fieldList: [
      {
        label: "角色名称",
        fieldName: "roleName",
        type: "input",
        required: true,
        formVisible: !false,
        listVisible: !false
      },
      {
        label: "角色编码",
        fieldName: "roleCode",
        type: "input",
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
        type: "input",
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
        listVisible: true
      },
      {
        label: "修改时间",
        fieldName: "updatedTime",
        type: "input",
        required: false,
        formVisible: !true,
        listVisible: true
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
        type: "select",
        optionList: statusList,
        required: false,
        formVisible: true,
        listVisible: !true
      },
      {
        label: "状态名称",
        fieldName: "statusName",
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
        type: "textarea",
        required: false,
        formVisible: true,
        listVisible: !true
      }
    ],
    //默认查询条件
    condition: [getCustomerParam()]
  });

  const expandTable = reactive<ExpandTable>({
    dataField: "employeeList",
    title: "人员信息",
    primaryKey: [
      "idCompanyDefine",
      "idCompanyRole",
      {
        source: "idEmployeeInfo",
        dist: "idEmployee"
      }
    ],
    showButton: true,
    expandUrls: {
      deleteUrl: "/system-config/system/companyRolePkEmployee/batchDeleteById"
    },
    extandFuncs: [
      {
        icon: "delete",
        btnName: "删除",
        authority: "delete"
      }
    ],
    fieldList: [
      {
        label: "姓名",
        fieldName: "name",
        type: "tag",
        required: true,
        formVisible: true,
        listVisible: true,
        preps: {
          showComp: "Y",
          popover: "Y",
          placement: "top",
          compField: viewCompField
        }
      },
      {
        label: "所属公司",
        fieldName: "companyName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "所属部门",
        fieldName: "deptName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      }
    ]
  });
  //校验
  const rules = {};
  //控制弹窗相关设置
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);
  const userTableRef = ref();
  let currentRow = ref<any>({});
  let extandBtns = ref<UserFuncInfo[]>([
    {
      btnName: "添加人员",
      authority: "add",
      icon: "user-add",
      funcName: async (row: any) => {
        if (!currentUserGroupId.value) {
          warning("请先在左侧选择公司");
          return;
        }
        currentRow.value = row;
        dialogProps.bakeVisible1 = true;
        await nextTick();
        assignRoleCompanyRef.value.setSelectData(row.companyList);
      }
    }
  ]);
  //初始化方法
  const initData = async () => {
    let result = await loadData("/system-config/system/companyDefine/getAllByCondition", {});
    if (result.error) {
      warning(result.error);
      return;
    }
    companyList.value = result.data;
    roleTypeList.value = await dictData("company_role_type");
  };
  const assignRoleUser = () => {
    let selectedDatas = userTableRef.value.$refs.employeeInfoRef.multipleSelection;
    console.log(selectedDatas);
    if (!selectedDatas || selectedDatas.length == 0) {
      warning("请选择人员信息");
      return;
    }
    let datas = [];
    for (let index in selectedDatas) {
      datas.push({
        idCompanyDefine: currentRow.value.idCompanyDefine,
        idCompanyRole: currentRow.value.idCompanyRole,
        idEmployee: selectedDatas[index].idEmployeeInfo
      });
    }
    load("数据提交中");
    postRequest("/system-config/system/companyRolePkEmployee/mergeBatch", datas)
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
    :self-func="true"
    :title="'添加人员'"
    :dialog-visible="dialogProps.bakeVisible1"
    :dialogProps="dialogProps"
    @merge="assignRoleUser"
  >
    <div style="width: 100%">
      <user-manage
        :cellEditable="false"
        :showButton="false"
        :dialogInput="true"
        :multipleSelect="true"
        ref="userTableRef"
      />
    </div>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="companyRoleRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
      :outerFormData="outerFormData"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-row :gutter="10" class="h100-overflow-hidden">
    <el-col :span="5" class="h100">
      <star-horse-tree
        v-model:tree-datas="companyList"
        :expand="true"
        treeTitle="公司列表"
        @selectData="companyChange"
        :preps="{
          label: 'name',
          value: 'idCompanyDefine'
        }"
      />
    </el-col>
    <el-col :span="19" class="h100">
      <el-card class="inner_content h100">
        <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
          <star-horse-search-comp
            @searchData="(data) => companyRoleRef.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
          />
        </div>
        <hr />
        <star-horse-table-comp
          ref="companyRoleRef"
          :fieldList="tableFieldList"
          :primaryKey="primaryKey"
          :compUrl="dataUrl"
          :disableAction="true"
          :expandTable="expandTable"
          :extandBtns="extandBtns"
          :dataFormat="dataFormat"
        />
      </el-card>
    </el-col>
  </el-row>
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
