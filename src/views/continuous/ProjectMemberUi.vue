<script setup lang="ts" name="ProjectMember">
import {computed, onMounted, provide, reactive, ref, watch} from "vue";
import {apiInstance, ApiUrls, dialogPreps, SearchFields, SearchParams} from "star-horse-lowcode";

const props = defineProps({
  projectId: {type: String},
  roleList: {
    type: Array,
    default: () => []
  }
});
const dataUrl: ApiUrls = apiInstance("continuous-manage", "continuous/projectMember");
const searchFormData = reactive<SearchFields>({fieldList: []});
const rolesList = computed(() => props.roleList)
const tableFieldList = reactive({
  fieldList: [
    {
      label: "主键",
      fieldName: "idProjectMember",
      type: "long"
    },

    [{
      label: "用户名",
      fieldName: "username",
      type: "dialog-input",
      formVisible: true,
      listVisible: true,
      required: true,
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
          prefix: "a",
          formVisible: !false,
          listVisible: !false,
          searchVisible: true,
        },
          {
            label: "工号",
            fieldName: "employeeNo",
            type: "input",
            editDisabled: "Y",
            prefix: "a",
            helpMsg: "如不填写系统自动生成",
            required: false,
            formVisible: !false,
            listVisible: !false,
            searchVisible: true,
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
        listVisible: true,
      }],
    [{
      label: "角色名称",
      fieldName: "roleName",
      type: "select",
      required: true,
      optionList: rolesList,
      formVisible: true,
      listVisible: true,
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
      }],
    [{
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
      }],

    {
      label: "创建人",
      disabled: "Y",
      fieldName: "createdBy",
      type: "input"
    },

  ],
  stopAutoLoad: true
});
const primaryKey = "idProjectMember";
const projectMemberRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "isManager") {
    return "1" == cellValue ? "是" : "否";
  }
  if (name == "roleName") {
    return props.roleList.find((item: any) => item.value == cellValue)?.name || cellValue;
  }
  return cellValue;
};
const init = async () => {
};
let filterCondition = ref<SearchParams[]>([]);
const filterFun = () => {
  filterCondition.value = [];
  filterCondition.value.push({
    propertyName: "idProjectInfo",
    value: props.projectId
  });
  projectMemberRef.value.createSearchParams(filterCondition.value, []);
};
watch(
    () => props.projectId,
    () => {
      if (projectMemberRef.value && props.projectId) {
        filterFun();
      }
    },
    {deep: true, immediate: true}
);
onMounted(async () => {
  await init();
});
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="projectMemberRef.loadByPage()"
        :compUrl="dataUrl"
        :outerFormData="{
          idProjectInfo: projectId,
        }"
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
    <star-horse-table-comp
        ref="projectMemberRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :preValidFunc="[{
          authority:'add',
          valid:()=>{
            return projectId !='-1'
          },
          msg:'请先选择项目'
        }]"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
