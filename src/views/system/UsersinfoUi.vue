<script setup lang="ts" name="Usersinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {nextTick, onMounted, provide, reactive, ref} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {createCondition, dictData, loadDepartmentInfo, loadRolesInfo} from "@/api/sh_api";
import {analysisData} from "@/api/deptment";
import {ElTreeV2} from "element-plus";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {SearchParams} from "@/components/types/Params";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";

const props = defineProps({
  viewRolesinfoId: {type: String},
  disableAction: {type: Boolean, default: false}
});
const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/usersinfoEntity/pageList",
  mergeUrl: "/system-config/system/usersinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/usersinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/usersinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/usersinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/usersinfoEntity/getById",
  deleteUrl: "/system-config/system/usersinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/usersinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/usersinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/usersinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/usersinfoEntity/importData",
  uploadUrl: "",
  condition: []
};
const nativePlaceList = ref<any>([]);
const sexList = ref([{name: "男", value: 1}, {name: "女", value: 2}, {name: "保密", value: 3}]);
const educationList = ref<SelectOption[]>([]);
const politicalStatusList = ref<SelectOption[]>([]);
const identityTypeList = ref<SelectOption[]>([]);
const rolesList = ref<SelectOption[]>([]);
const deptList = ref<SelectOption[]>([]);
const usersinfoTableListRef = ref();
const statusList = ref<SelectOption[]>([]);
const initData = async () => {
  rolesList.value = await loadRolesInfo([]);
  deptList.value = await loadDepartmentInfo([]);
  statusList.value = await dictData("common");
  //如果是从其它页面加载的该页面，则将条件加入查询
  if (props.viewRolesinfoId) {
    searchForm.value["b.idRolesinfo"] = props.viewRolesinfoId;
    await nextTick(() => {
      usersinfoTableListRef.value.createCreateParams(searchFormData);
      // usersinfoTableListRef.value.loadByPage();
    });
  }
};
onMounted(() => {
  initData();
});
const searchFormData = reactive<SearchProps[]>([
  {label: "姓名", fieldName: "name", defaultShow: true, type: "input", matchType: "lk"},
  {label: "用户名", fieldName: "username", defaultShow: true, type: "input", matchType: "lk"},
  {label: "员工编号", fieldName: "employeeNo", defaultShow: true, type: "input", matchType: "lk"},
  {
    label: "角色",
    fieldName: "idRolesinfo",
    type: "select",
    optionList: rolesList,
    disabled: props.viewRolesinfoId ? true : false
  },
  /* {label: "部门", fieldName: "idDepartment", type: "cascade", optionList: deptList},*/
  {label: "性别", fieldName: "sex", type: "select", optionList: sexList},
]);

const tableFieldList = reactive<PageFieldInfo | any>({
  fieldList: [
    /*    {
          label: "主键", fieldName: "idUsersinfo", type: "long",
          required: false, formShow: false,
          tableShow: false, minWidth: 180
        },
        {
          label: "主键", fieldName: "idUserAudit", type: "long",
          required: false, formShow: false,
          tableShow: false, minWidth: 180
        },*/
    [{
      label: "用户名", fieldName: "username", type: "input",
      required: true, formShow: !false, disabled: 1,
      tableShow: !false, minWidth: 180
    }, {
      label: "员工编号", fieldName: "employeeNo", type: "input",
      required: true, formShow: !false,
      tableShow: !false, minWidth: 180
    }],

    [{
      label: "归属部门", fieldName: "deptList", type: "cascade", optionList: deptList,
      required: true, formShow: !false, multiple: true,
      tableShow: !false, minWidth: 180
    }, {
      label: "角色", fieldName: "rolesList", type: "select", optionList: rolesList,
      required: true, formShow: !false, multiSelect: true,
      tableShow: !false, minWidth: 180
    }],
    [
      {
        label: "邮箱地址", fieldName: "email", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      },
      {
        label: "联系电话", fieldName: "phone", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    [
      {
        label: "姓名", fieldName: "name", type: "input",
        required: true, formShow: !false,
        tableShow: !false, minWidth: 180
      },
      {
        label: "性别", fieldName: "sex", type: "select", optionList: sexList,
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    /*
     {
      label: "紧急联系人电话", fieldName: "bakePhone", type: "input",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "学历", fieldName: "education", type: "select", optionList: educationList.value,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    [{
      label: "入职时间", fieldName: "entryDate", type: "date",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
      {
        label: "离职时间", fieldName: "leaveDate", type: "date",
        required: false, formShow: false,
        tableShow: false, minWidth: 180
      }],
    {
      label: "籍贯", fieldName: "nativePlace", type: "select", optionList: nativePlaceList.value,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "政治面貌", fieldName: "politicalStatus", type: "select", optionList: politicalStatusList.value,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "证件类型", fieldName: "identityType", type: "select", optionList: identityTypeList.value,
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "证件编号", fieldName: "identityNo", type: "input",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },*/
    [{
      label: "状态", fieldName: "statusCode", type: "select",
      required: false, formShow: true,
      optionList: statusList,
      tableShow: !true, minWidth: 180
    },
      {
        label: "通信地址", fieldName: "address", type: "input",
        required: false, formShow: !false,
        tableShow: !false, minWidth: 180
      }],
    {
      label: "备注", fieldName: "remark", type: "textarea",
      required: false, formShow: !false,
      tableShow: !false, minWidth: 180
    },
    {
      label: "证件照", fieldName: "imagePath", type: "input",
      required: false, formShow: false,
      tableShow: false, minWidth: 180
    },
    {
      label: "创建人", disabled: 1, fieldName: "createdBy", type: "input",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改人", disabled: 1, fieldName: "updatedBy", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "创建日期", disabled: 1, fieldName: "createdDate", type: "date",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "修改日期", disabled: 1, fieldName: "updatedDate", type: "date",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据版本号", fieldName: "version", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "是否已逻辑删除", fieldName: "isDel", type: "number",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },

    {
      label: "状态", fieldName: "statusName", type: "input",
      required: false, formShow: !true,
      tableShow: true, minWidth: 180
    },
    {
      label: "国际码", fieldName: "local", type: "input",
      required: false, formShow: !true,
      tableShow: !true, minWidth: 180
    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  stopAutoLoad: props.viewRolesinfoId ? true : false
});
const primaryKey = "idUsersinfo";
const rules = {
  idUsersinfo: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  idUserAudit: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  name: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  username: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  sex: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  phone: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  bakePhone: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  email: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  address: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  education: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  entryDate: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  leaveDate: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  nativePlace: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  politicalStatus: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  identityType: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  identityNo: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  remark: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  imagePath: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  employeeNo: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  initPwd: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  deptList: [{required: true, message: "必填项不能为空", trigger: "blur"}],
  rolesList: [{required: true, message: "必填项不能为空", trigger: "blur"}],
};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
const dialogProps = reactive<DialogProps>({
  bakeVisible1: false, bakeVisible2: false, bakeVisible3: false,
  ids: 0,
  batchDialogTitle: "批量编辑",
  dialogTitle: "编辑",
  batchEditVisible: false,
  editVisible: false,
  uploadVisible: false,
  viewVisible: false

});
provide("dialogProps", dialogProps);
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "sex") {
    let fdata = sexList.value.find((item: any) => parseInt(item.value) == parseInt(cellValue));
    return fdata?.name || cellValue;
  }
  if (name == "rolesList" && row["rolesList"]) {
    let roles: Array<String> = [];

    row["rolesList"].forEach((item: any) => {
      roles.push(item.roleName);
    });
    return roles.join(";");
  }
  if (name == "deptList" && row['deptList']) {
    let {listNames, listValues} = analysisData(row['deptList'], "", "deptName", "idDepartment")
    return listNames.join("/");
  }
  return cellValue;
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const query = ref('');
const onQueryChanged = (query: string) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
  treeRef.value!.filter(query)
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name.toLowerCase()!.includes(query?.toLowerCase())
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  let checkedNodes = treeRef.value.getCheckedNodes();
  if (checkedNodes?.length > 0) {
    checkedNodes.forEach(item => {
      treeRef.value.setChecked(item.value, false);
    });
  }
  treeRef.value.setChecked(data.value, (checked instanceof Boolean) ? checked : true);

  let conditions: Array<SearchParams> = [];
  if (checked) {
    console.log(data.value);
    conditions.push(createCondition("c.idDepartment", data.value));
  }
  // menuTableListRef.value.setDataInfo(conditions, null);
  usersinfoTableListRef.value.createCreateParams(conditions);
};
const searchData = (data: SearchParams[]) => {
  usersinfoTableListRef.value.createCreateParams(data);
};
</script>
<style lang="scss" scoped>
.el-card {
  height: 100%;

  :deep(.el-card__body) {
    height: 98%;
    padding: 5px;
  }
}
</style>
<template>
  <star-horse-dialog :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="usersinfoTableListRef.loadByPage()" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title=
      "'查看数据'" :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content" style="height: 100%;padding: 5px;">
    <el-row style="height: 100%;">
      <el-col :span="3" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <el-input
              v-model="query"
              size="small"
              clearable
              placeholder="请输入关键字"
              @input="onQueryChanged"
          >
            <template #suffix>
              <star-horse-icon icon-class="search"/>
            </template>
          </el-input>
          <el-tree-v2 :data="deptList" :filter-method="filterMethod"
                      check-on-click-node="true"
                      @check-change="checkChange"
                      @node-click="checkChange"
                      :height="600"
                      show-checkbox
                      ref="treeRef" :props="{
            'label':'name',
            'value':'value'
          }"/>
        </el-card>
      </el-col>
      <el-col :span="21" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data)=>usersinfoTableListRef.createCreateParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list v-if="!viewRolesinfoId"
                                    @tableCompFunc="(fun)=>usersinfoTableListRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp ref="usersinfoTableListRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                                 :compUrl="dataUrl"
                                 :dataFormat="dataFormat" :disableAction="disableAction"/>
        </el-card>
      </el-col>
    </el-row>
  </el-card>

</template>
