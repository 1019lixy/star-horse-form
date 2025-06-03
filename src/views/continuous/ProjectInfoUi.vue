<script setup lang="ts" name="ProjectInfoUi">
import {onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, dictData, SearchFields, SelectOption} from "star-horse-lowcode";
import {Config} from "@/api/settings";

const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/projectInfo");
let libTypeList = ref<Array<SelectOption>>([]);
let languageList = ref<Array<SelectOption>>([]);
let charsetList = ref<Array<SelectOption>>([]);
let projectRoleList = ref<Array<SelectOption>>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "项目名称", fieldName: "projectName", type: "input", matchType: "lk", defaultVisible: true},
    {label: "项目类型", fieldName: "projectType", type: "input", matchType: "lk", defaultVisible: true},
    {label: "程序语言", fieldName: "language", type: "input", matchType: "lk", defaultVisible: true}
  ]
});
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键",
      fieldName: "idProjectInfo",
      type: "long"
    },
    {
      label: "代码库类型",
      fieldName: "type",
      type: "select",
      optionList: libTypeList,
      required: true,
      formVisible: true,
      listVisible: true
    },
    [
      {
        label: "代码库地址",
        fieldName: "host",
        type: "input",
        helpMsg: "eg:[http://|https://|ssh://|git@]192.168.0.1/test",
        formVisible: true,
        listVisible: true
      },
      {
        label: "程序语言",
        fieldName: "language",
        type: "select",
        optionList: languageList,
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "项目名称",
        fieldName: "projectName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "字符集",
        fieldName: "projectCharset",
        type: "select",
        defaultValue: "UTF-8",
        optionList: charsetList,
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "流水线账号",
        fieldName: "account",
        type: "input",
        formVisible: true,
        listVisible: true
      },
      {
        label: "流水线密码",
        fieldName: "security",
        type: "input",
        formVisible: true,
        listVisible: true
      }
    ],
    {
      label: "备注",
      fieldName: "remark",
      type: "textarea",
      formVisible: true
    },
    {
      batchFieldList: [
        {
          batchName: "memberList",
          title: "项目成员",
          fieldList: [
            {
              label: "用户名",
              fieldName: "username",
              type: "dialog-input",
              formVisible: true,
              listVisible: true,
              params: {
                primaryKey: "idEmployeeInfo",
                dataUrl: {
                  pageListUrl: "system-config/system/employeeInfo/pageList",
                },
                needField: [
                  {sourceField: "employeeNo", distField: "username"},
                  {sourceField: "name", distField: "name"}
                ],

                fieldList: [{
                  label: "姓名",
                  fieldName: "name",
                  type: "input",
                  required: true,
                  formVisible: !false,
                  listVisible: !false,
                  searchFlag: "Y"
                },
                  {
                    label: "工号",
                    fieldName: "employeeNo",
                    type: "input",
                    editDisabled: "Y",
                    helpMsg: "如不填写系统自动生成",
                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                    searchFlag: "Y"
                  },
                  {
                    label: "职级",
                    fieldName: "rank",
                    type: "tselect",

                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                    preps: {
                      showCode: "Y"
                    }
                  },
                  {
                    label: "岗位",
                    fieldName: "station",
                    type: "tselect",
                    required: false,
                    formVisible: !false,
                    listVisible: !false,
                    preps: {
                      showCode: "Y"
                    }
                  }]
              },
            },
            {
              label: "姓名",
              fieldName: "name",
              type: "tag",
              formVisible: true,
              listVisible: true
            },
            {
              label: "角色名称",
              fieldName: "roleName",
              type: "select",
              optionList: projectRoleList,
              formVisible: true,
              listVisible: true
            },
            {
              label: "生效时间",
              fieldName: "effectiveDate",
              type: "datetime",
              formVisible: true,
              listVisible: true
            },
            {
              label: "失效日期",
              fieldName: "expirationDate",
              type: "datetime",
              formVisible: true,
              listVisible: true
            },
            {
              label: "是否管理员",
              fieldName: "isManager",
              type: "switch",
              defaultValue: "2",
              formVisible: true,
              listVisible: true,
              preps: {
                activeValue: "1",
                activeText: "是",
                inactiveValue: "2",
                inactiveText: "否"
              }
            }
          ]
        }
      ]
    },
    {
      label: "创建人",
      disabled: "Y",
      fieldName: "createdBy",
      type: "input"
    },
    {
      label: "修改人",
      disabled: "Y",
      fieldName: "updatedBy",
      type: "input"
    },
    {
      label: "创建日期",
      disabled: "Y",
      fieldName: "createdTime",
      type: "date"
    },
    {
      label: "修改日期",
      disabled: "Y",
      fieldName: "updatedTime",
      type: "date"
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number"
    },
    {
      label: "是否已逻辑",
      fieldName: "isDel",
      type: "number"
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
      type: "input"
    },
    {
      label: "状态码",
      fieldName: "statusCode",
      type: "input"
    },
    {
      label: "状态码名称",
      fieldName: "statusName",
      type: "input"
    },
    {
      label: "国际码",
      fieldName: "local",
      type: "input"
    }
  ],
  batchFieldList: []
});
const primaryKey = "idProjectInfo";
const projectInfoRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: object): any => {
  return cellValue;
};
const init = async () => {
  dictData("REPO_TYPE").then(res => {
    libTypeList.value = res;
  });
  dictData("program_language").then(res => {
    languageList.value = res;
  });
  dictData("CHARSET").then(res => {
    charsetList.value = res;
  });
  dictData("PROJECT_ROLE").then(res => {
    projectRoleList.value = res;
  });
};
let projectId = ref<number>(-1);
const selectItemFun = (row: any) => {
  projectId.value = row[primaryKey];
};
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="projectInfoRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <div class="search-content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => projectInfoRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <star-horse-table-comp
        ref="projectInfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
        @selectItem="selectItemFun"
    />
    <project-member-ui :projectId="projectId"/>
  </el-card>
</template>
<style lang="scss" scoped></style>
