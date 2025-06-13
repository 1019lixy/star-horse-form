<script setup lang="ts" name="UserManage">
import {Config} from "@/api/settings";
import {computed, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {
  apiInstance,
  ApiUrls,
  createCondition,
  createTree,
  dialogPreps,
  loadData,
  PageFieldInfo,
  SearchFields,
  SearchParams,
  SelectOption,
  warning
} from "star-horse-lowcode";
import {getCustomerParam} from "@/utils/auth";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/employeeInfo");
const props = defineProps({
  showButton: {type: Boolean, default: true},
  cellEditable: {type: Boolean, default: true},
  dialogInput: {type: Boolean, default: false},
  multipleSelect: {type: Boolean, default: false}
});
//主键
const primaryKey = "idEmployeeInfo";
const employeeInfoRef = ref();
const editable = computed(() => props.cellEditable);
//定义表单的所有属性
const formFields = reactive<object>({});
provide("formFields", formFields);
let companyDataList = ref<SelectOption[]>([]);
let departDataList = ref<SelectOption[]>([]);
let rankList = ref<any>([]);
let stationList = ref<any>([]);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "姓名",
      fieldName: "a.name",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "工号",
      fieldName: "a.employeeNo",
      defaultVisible: true,
      matchType: "lk",
      type: "input"
    },
    {
      label: "职级",
      fieldName: "a.rank",
      defaultVisible: false,
      optionList: rankList,
      type: "tselect"
    },
    {
      label: "岗位",
      fieldName: "a.station",
      defaultVisible: false,
      optionList: stationList,
      type: "tselect"
    }
  ]
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: editable,
  //属性列表
  fieldList: [
    {
      label: "主键",
      fieldName: "idEmployeeInfo",
      type: "input",
      required: true,
      formVisible: false,
      listVisible: false
    },
    {
      dytableList: [
        [
          {
            label: "姓名",
            fieldName: "name",
            type: "input",
            required: true,
            formVisible: !false,
            listVisible: !false
          },
          {
            label: "工号",
            fieldName: "employeeNo",
            type: "input",
            editDisabled: "Y",
            helpMsg: "如不填写系统自动生成",
            required: false,
            formVisible: !false,
            listVisible: !false
          },
          {
            label: "头像",
            fieldName: "photo",
            type: "upload",
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
              autoUpload: "N",
              action: "xx",
              wordBreak: true,
              rowspan: 4
            }
          }
        ],
        [
          {
            label: "职级",
            fieldName: "rank",
            type: "tselect",
            optionList: rankList,
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
            optionList: stationList,
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
              showCode: "Y"
            }
          }
        ],
        [
          {
            label: "所属公司",
            fieldName: "idCompanyDefine",
            type: "tselect",
            optionList: companyDataList,
            required: true,
            formVisible: !false,
            listVisible: !false,
            actionName: "change",
            actions: (val: any) => {
              loadDepartByCompId(val);
            },
            preps: {
              checkStrictly: "Y"
            }
          },
          {
            label: "所属部门",
            fieldName: "idDepartmentInfo",
            type: "tselect",
            optionList: departDataList,
            required: true,
            formVisible: !false,
            listVisible: !false,
            preps: {
              checkStrictly: "Y"
            }
          }
        ],
        [
          {
            label: "联系电话",
            fieldName: "phone",
            type: "input",
            required: true,
            formVisible: !false,
            listVisible: !false
          },
          {
            label: "紧急联系电话",
            fieldName: "bakePhone",
            type: "input",
            helpMsg: "方便特殊情况联系家属",
            required: true,
            formVisible: !false,
            listVisible: !false
          }
        ],
        [
          {
            label: "赋予系统登录权限",
            fieldName: "loginAuthority",
            type: "switch",
            defaultValue: "N",
            required: false,
            formVisible: !false,
            listVisible: !false,
            preps: {
              colspan: 1
            }
          }
        ]
      ]
    },
    {
      label: "邮箱",
      fieldName: "email",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: true
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
      listVisible: !true
    },
    {
      label: "创建时间",
      fieldName: "createdTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改人",
      fieldName: "updatedBy",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    },
    {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
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
      type: "input",
      required: false,
      formVisible: !true,
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
      type: "input",
      required: false,
      formVisible: !true,
      listVisible: !true
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()],
  stopAutoLoad: false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let companyList = ref<Array<any>>([]);
const companyChange = (data: TreeNodeData, _checked: boolean) => {
  let compOrDeptId = data.value;
  let params: SearchParams[] = [];
  let cond = createCondition("a.idCompanyDefine", compOrDeptId);
  cond.orOperList = [createCondition("a.idDepartmentInfo", compOrDeptId)];
  params.push(cond);
  employeeInfoRef.value.createSearchParams(params);
};
const loadDepartByCompId = async (val: any) => {
  let params: SearchParams[] = [];
  let compId = val["idCompanyDefine"];
  departDataList.value = [];
  if (!compId) {
    return;
  }
  params.push(createCondition("a.idCompanyDefine", compId));
  let result = await loadData("/system-config/system/departmentEntity/getAllByCondition", {
    fieldList: params
  });
  if (result.error) {
    console.log(result.error);
  } else {
    departDataList.value = createTree(result.data, "idDepartment", "deptName", "");
  }
};
//初始化方法
const initData = async () => {
  let result = await loadData("/system-config/system/companyDefine/compDeptTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    companyList.value = result.data;
  }

  result = await loadData("/system-config/system/companyDefine/getAllByCondition", {});
  if (result.error) {
    warning(result.error);
  } else {
    companyDataList.value = createTree(result.data, "idCompanyDefine", "name", "");
  }
  //加载职级
  result = await loadData("/system-config/system/rankDefine/rankTree", {});
  if (result.error) {
    warning(result.error);
  } else {
    rankList.value = result.data;
  }
  //加载岗位
  result = await loadData("/system-config/system/stationDefine/stationTree", {});
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
  if (name == "idCompanyDefine") {
    return row["companyName"] || cellValue;
  }
  if (name == "idDepartmentInfo") {
    return row["deptName"] || cellValue;
  }
  if (name == "rank") {
    return row["rankName"] || cellValue;
  }
  if (name == "station") {
    return row["stationName"] || cellValue;
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

let test = ref("");
const testChange = (val: any) => {
  console.log(val);
};
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps?.editVisible" :dialogProps="dialogProps">
    <star-horse-form
        @refresh="employeeInfoRef.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
      :dialog-visible="dialogProps?.viewVisible"
      :dialogProps="dialogProps"
      :title="'查看数据'"
      :isView="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <el-splitter>
      <el-splitter-panel collapsible size="240" min="100" max="500">
        <star-horse-tree
            v-model:tree-datas="companyList"
            :expand="true"
            treeTitle="组织机构"
            @selectData="companyChange"
        />
      </el-splitter-panel>
      <el-splitter-panel>

        <el-card class="inner_content ">
          <div class="search-content">
            <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
              <star-horse-search-comp
                  @searchData="(data: any) => employeeInfoRef.createSearchParams(data)"
                  :formData="searchFormData"
                  :compUrl="dataUrl"
              />
            </div>
          </div>
          <star-horse-table-comp
              ref="employeeInfoRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :dialogInput="dialogInput"
              :multipleSelect="multipleSelect"
              :disableAction="!showButton"
              :dataFormat="dataFormat"
          />
        </el-card>
      </el-splitter-panel>
    </el-splitter>
  </el-card>
</template>
<style lang="scss" scoped></style>
