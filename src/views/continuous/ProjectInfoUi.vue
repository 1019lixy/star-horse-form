<script setup lang="ts" name="ProjectInfoUi">
import {onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, SearchFields, SelectOption} from "star-horse-lowcode";
import {Config} from "@/api/settings";

const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/projectInfo");
let libTypeList = ref<Array<SelectOption>>([]);
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
        formVisible: true,
        listVisible: true
      },
      {
        label: "代码库端口",
        fieldName: "port",
        type: "number",
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
        label: "项目编码",
        fieldName: "projectCharset",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "项目类型",
        fieldName: "projectType",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "程序语言",
        fieldName: "language",
        type: "input",
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
              type: "input",
              formVisible: true,
              listVisible: true
            },
            {
              label: "姓名",
              fieldName: "name",
              type: "input",
              formVisible: true,
              listVisible: true
            },
            {
              label: "角色名称",
              fieldName: "roleName",
              type: "input",
              formVisible: true,
              listVisible: true
            },
            {
              label: "生效时间",
              fieldName: "effectiveDate",
              type: "input",
              formVisible: true,
              listVisible: true
            },
            {
              label: "失效日期",
              fieldName: "expirationDate",
              type: "input",
              formVisible: true,
              listVisible: true
            },
            {
              label: "是否管理员 1是 2否",
              fieldName: "isManager",
              type: "input",
              formVisible: true,
              listVisible: true
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
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="(data: any) => projectInfoRef.createSearchParams(data)"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
      <hr/>
      <star-horse-button-list
          @tableCompFunc="(fun: any) => projectInfoRef.tableCompFunc(fun)"
          :compUrl="dataUrl"
          :dialogProps="dialogProps"
          :showType="Config.buttonStyle"
      />
    </div>
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
