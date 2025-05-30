<script setup lang="ts" name="DynamicForm">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  loadData,
  PageFieldInfo,
  piniaInstance,
  SearchFields,
  SearchParams,
  SelectOption,
  useDesignFormStore,
  useGlobalConfigStore,
  UserFuncInfo,
  warning
} from "star-horse-lowcode";
import {dbConfigList, loadSystemInfo} from "@/api/star_horse_utils";
import {computed, nextTick, onMounted, provide, reactive, ref} from "vue";
import {useRouter} from "vue-router";
import {Config} from "@/api/settings";

const router = useRouter();
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicForm");
let designForm = useDesignFormStore(piniaInstance);
let selfBtnFunc = ref<UserFuncInfo[]>([]);
let isPreview = ref<boolean>(false);
let dataSource = ref<SelectOption[]>([]);
let dynamicFormList = ref<Array<any>>([]);
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
const closeAction = () => {
  isPreview.value = false;
  designForm.setIsEdit(true);
};
let list = computed(() => designForm.compList);
const loadFormData = async (formId: any) => {
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + formId, {});
  if (error) {
    console.log(error);
  }
  await nextTick();
  isPreview.value = true;
  designForm.clearAll(false);
  designForm.setCompList(JSON.parse(data["details"].content));
  designForm.setFormData(JSON.parse(data["details"].fieldNames));
  designForm.setIsEdit(false);
  data["details"] = {};
  designForm.setFormInfo(data);
};
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {label: "表单名称", fieldName: "formName", defaultVisible: true, type: "input", matchType: "lk"},
    {
      label: "数据源",
      fieldName: "datasourceConfigId",
      defaultVisible: true,
      type: "select",
      optionList: dataSource
    },

    {
      label: "创建时间",
      fieldName: "createdTime",
      defaultVisible: true,
      type: "date",
      matchType: "bt",
      preps: {
        valueFormat: "YYYY-MM-DD"
      }
    }
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  cellEditable: false,
  fieldList: [
    {
      label: "主键",
      fieldName: "idDynamicForm",
      type: "long"
    },
    {
      label: "所属应用",
      fieldName: "sysId",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "表单名称",
      fieldName: "formName",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "表名",
      fieldName: "tbName",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "主键",
      fieldName: "formId",
      type: "input",
      formVisible: true,
      listVisible: true
    },
    {
      label: "数据源",
      fieldName: "datasourceConfigId",
      type: "select",
      formVisible: true,
      listVisible: true
    },
    {
      label: "是否需要公共字段",
      fieldName: "needCommonFields",
      type: "switch",
      formVisible: true,
      listVisible: true
    },
    {
      label: "主键策略",
      fieldName: "primaryKeyPolicy",
      type: "select",
      formVisible: true,
      listVisible: true
    },
    {
      label: "是否创建表",
      fieldName: "createTable",
      type: "switch",
      formVisible: true,
      listVisible: true
    },
    {
      label: "是否创建菜单",
      fieldName: "createMenu",
      type: "switch",
      formVisible: true,
      listVisible: true
    },
    {
      label: "创建人",
      disabled: "Y",
      fieldName: "createdBy",
      type: "input",
      listVisible: true
    },

    {
      label: "创建日期",
      disabled: "Y",
      fieldName: "createdTime",
      type: "date",
      listVisible: true
    },
    {
      label: "修改人",
      disabled: "Y",
      fieldName: "updatedBy",
      type: "input",
      listVisible: true
    },
    {
      label: "修改日期",
      disabled: "Y",
      fieldName: "updatedTime",
      type: "date",
      listVisible: true
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number",
      listVisible: true
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
  userTableFuncs: [
    {
      authority: "add",
      btnName: "添加子表",
      icon: "plus",
      priority: 1,
      funcName: (row) => {
        addSubForm(row);
      }
    }
  ]
});
const primaryKey = "idDynamicForm";
const dynamicFormRef = ref();
const starHorseTreeRef = ref();
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const addSubForm = (params: any) => {
  router.push({path: "/dyform/DynamicForm", query: {parentId: params.idDynamicForm}});
};
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "datasourceConfigId") {
    return dataSource.value.find((item) => item.value!.toString() == cellValue)?.name || cellValue;
  }
  return cellValue == "Y" ? "是" : cellValue == "N" ? "否" : cellValue;
};
let extendBtnList = ref<UserFuncInfo[]>([]);
let viewBtnList = ref<UserFuncInfo[]>([]);
let informationsList = ref<UserFuncInfo[]>([]);

const initData = () => {
  selfBtnFunc.value?.push({
    btnName: "新增",
    icon: "add",
    priority: 2,
    authority: "add",
    position: "toolbar",
    funcName: () => {
      router.push("/dyform/DynamicForm");
    }
  });
  selfBtnFunc.value?.push({
    btnName: "编辑",
    priority: 3,
    icon: "edit",
    authority: "edit",
    funcName: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({
        path: "/dyform/DynamicForm",
        query: {formId: params[primaryKey], parentId: params["parentId"] || 0}
      });
    }
  });
  selfBtnFunc.value?.push({
    btnName: "预览",
    priority: 4,
    authority: "view",
    icon: "data-view",
    funcName: (params: any) => {
      loadFormData(params[primaryKey]);
    }
  });
  extendBtnList.value = selfBtnFunc.value;//.slice(1, selfBtnFunc.value.length);
  dbConfigList().then((res: any) => {
    dataSource.value = res;
  });
  viewBtnList.value.push(...tableFieldList.userTableFuncs);
  viewBtnList.value.push(selfBtnFunc.value[1])
  let params = [{propertyName: "statusCode", value: "1"}];
  loadSystemInfo(params).then((res: SelectOption[]) => {
        informationsList.value = res;
      }
  )
};
let currentTab = ref<string>("list");
const createSearch = (data: SearchParams[]) => {
  if (currentTab.value == "preview") {
    starHorseTreeRef.value.createSearchParams(data);
  } else {
    dynamicFormRef.value.createSearchParams(data);
  }
};
const tabChange = async (name: string) => {
  currentTab.value = name;
  if (name == "preview") {
    starHorseTreeRef.value.createSearchParams([]);
  }
};
let dataList = ref<Array<any>>([]);
let currentData = ref<any>({});
let commonFieldList = ref<Array<any>>([]);
const dataChange = async (param: any) => {
  let {data, error} = await loadData(dataUrl.loadByIdUrl + "/" + param[primaryKey], {});
  if (error) {
    warning(error);
    return;
  }
  currentData.value = data;
  dataList.value = JSON.parse(data["details"].content);
  commonFieldList.value = data.commonFieldControllers;
};
onMounted(() => {
  initData();
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="isPreview"
      @closeAction="closeAction"
      :selfFunc="true"
      :title="'表单预览'"
      :is-view="true"
  >
    <form-preview :list="list"/>
  </star-horse-dialog>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form :compUrl="dataUrl" :fieldList="tableFieldList" :rules="rules"/>
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
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
      <star-horse-search-comp
          @searchData="createSearch"
          :formData="searchFormData"
          :compUrl="dataUrl"
      />
    </div>
  </div>
  <el-card class="inner_content">
    <el-tabs model-value="list" class="dyform-tabs" @tab-change="tabChange">
      <el-tab-pane label="列表视图" name="list">
        <template #label>
          <div class="custom-tabs-label">
            <star-horse-icon icon-class="list"/>
            <span>列表视图</span>
          </div>
        </template>
        <star-horse-table-comp
            ref="dynamicFormRef"
            :fieldList="tableFieldList"
            :primaryKey="primaryKey"
            :compUrl="dataUrl"
            :dataFormat="dataFormat"
            :extendBtns="extendBtnList"
            :orderBy="[
            {
              fieldName: 'a.createdTime',
              ascOrDesc: 'desc'
            }
          ]"
        />
      </el-tab-pane>
      <el-tab-pane label="预览视图" name="preview">
        <template #label>
          <div class="custom-tabs-label">
            <star-horse-icon icon-class="preview"/>
            <span>预览视图</span>
          </div>
        </template>
        <el-row :gutter="10" class="h100-overflow-hidden">
          <el-col :span="5" class="h100">
            <star-horse-tree
                v-model:tree-datas="dynamicFormList"
                ref="starHorseTreeRef"
                :expand="true"
                treeTitle="表单列表"
                @selectData="dataChange"
                :preps="{
                label: 'formName',
                value: primaryKey
              }"
                :showPageBar="true"
                :isDynamicData="true"
                :autoLoad="false"
                :compUrl="dataUrl"
                :compSize="compSize"
            />
          </el-col>
          <el-col :span="19" class="h100">
            <el-card class="inner_content h100">
              <div class="inner_button" v-if="dataList?.length > 0">
                <el-menu mode="horizontal" style="height: inherit; width: 100%">
                  <template v-for="(item, index) in viewBtnList">
                    <el-menu-item
                        v-if="item.authority == 'none' || dynamicFormRef.permissionList()[item.authority]"
                        :index="'1_' + index"
                        @click="item.funcName(currentData)"
                    >
                      <el-tooltip class="item" :content="item.btnName" effect="dark" placement="bottom">
                        <star-horse-icon :icon-class="item.icon" size="24px" style="color: var(--star-horse-style)"/>
                      </el-tooltip>
                    </el-menu-item>
                  </template>
                </el-menu>
              </div>
              <el-divider style="margin: 0 10px"/>
              <form-preview
                  :commonFieldList="commonFieldList"
                  :compSize="compSize"
                  :list="dataList"
                  v-if="dataList && dataList.length > 0"
              />
              <el-empty description="请在左侧选择表单" v-else/>
            </el-card>
          </el-col>
        </el-row>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>
<style lang="scss" scoped>
.dyform-tabs {
  height: 100%;
  display: flex;
  overflow: hidden;

  :deep(.el-tabs__content) {
    height: 100% !important;
    overflow: hidden !important;
    display: flex;
    flex: 1;
    flex-direction: column;

    :deep(.el-tab-pane) {
      height: inherit;
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
