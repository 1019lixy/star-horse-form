<script setup lang="ts" name="Menusinfo">
import {
  apiInstance,
  ApiUrls,
  closeLoad,
  createTree,
  dialogPreps,
  dictData,
  error,
  load,
  loadData,
  PageFieldInfo,
  piniaInstance,
  postRequest,
  SearchFields,
  SelectOption,
  success,
  useGlobalConfigStore,
  UserFuncInfo,
  warning
} from "star-horse-lowcode";
import {findNodesWithValue, treeCheckChange,} from "@/api/system";
import {loadSvgIcons, loadSystemInfo} from "@/api/star_horse_utils";
import {Config} from "@/api/settings";
import {computed, onMounted, provide, reactive, ref, unref} from "vue";
import {TreeNodeData} from "element-plus/es/components/tree-v2/src/types";

const dataUrl: ApiUrls = apiInstance("system-config", "system/menusinfoEntity");
let parentMenus: any = ref<any>([]);
let searchParentMenus: any = ref<any>([]);
let informationsList: any = ref<any>([]);
const currentInformation = ref<any>(null);
const defaultCondition = ref<any>([]);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    /*{label: "归属系统", fieldName: "idInformations", type: "select", optionList: informationsList},
  {label: "父菜单", fieldName: "parentNo", type: "tselect", optionList: searchParentMenus},*/
    {label: "菜单名称", defaultVisible: true, fieldName: "menuName", type: "input", matchType: "lk"},
    {label: "菜单编码", fieldName: "menuCode", type: "input", matchType: "lk"}
  ]
});
let openTypeList = ref<SelectOption[]>([]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idMenusinfo",
      type: "input"
    },
    [
      {
        label: "菜单名称",
        fieldName: "menuName",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "菜单路径",
        fieldName: "menuPath",
        type: "input",
        required: true,
        formVisible: true,
        listVisible: true
      }
    ],
    [
      {
        label: "归属应用名称",
        fieldName: "idInformations",
        type: "tselect",
        required: true,
        formVisible: true,
        defaultValue: currentInformation,
        actionName: "change",
        actions: (val: any) => {
          let systemId = val["idInformations"];
          if (!systemId) {
            return;
          }
          loadMenuBySystemId(systemId);
        },
        listVisible: true,
        preps: {
          data:informationsList,
          checkStrictly: "Y"
        }
      },
      {
        label: "父菜单",
        fieldName: "parentNo",
        type: "tselect",
        formVisible: true,
        preps: {
          checkStrictly: "Y",
          data:parentMenus
        }
      }
    ],
    {
      label: "菜单编码",
      fieldName: "menuCode",
      type: "input",
      required: true,
      disabled: true,
      listVisible: true
    },
    [
      {
        label: "排序",
        fieldName: "dataIndex",
        type: "number",
        required: true,
        formVisible: true,
        listVisible: true
      },
      {
        label: "菜单图标",
        fieldName: "menuIcon",
        type: "icon",
        required: false,
        formVisible: true,
        listVisible: true,
        preps:{
          iconType:"user",
          values:loadSvgIcons()
        }
      }
    ],
    [
      {
        label: "是否缓存页面",
        fieldName: "keepAlive",
        type: "switch",
        defaultValue: "Y",
        formVisible: true,
        listVisible: true
      },
      {
        label: "页面打开方式",
        fieldName: "openType",
        type: "select",
        optionList: openTypeList,
        required: true,
        formVisible: true,
        defaultValue: "self",
        listVisible: true
      }
    ],
    {
      label: "菜单描述",
      fieldName: "menuDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
      type: "input"
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
      type: "input"
    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date"
    },
    {
      label: "修改日期",
      disabled: true,
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
  cellEditable: true
});
let configStore = useGlobalConfigStore(piniaInstance);
let compSize = computed(() => configStore.configFormInfo?.inputSize || Config.compSize);
const primaryKey = "idMenusinfo";
const rules = {};
const dataForm = ref<any>({});
const loadMenuBySystemId = async (systemId: string) => {
  if (!systemId) {
    return;
  }
  let params = [
    {
      propertyName: "idInformations",
      value: systemId
    }
  ];
  defaultCondition.value = params;
  let {data} = await loadData("/system-config/system/menusinfoEntity/getAllTreeDataByCondition/false", params);
  if (data) {
    parentMenus.value = createTree(data, "dataNo", "menuName", "idMenusinfo");
  }
};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const menuFormRef = ref(null);
const menuTableListRef = ref();
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "idInformations") {
    return (
        findNodesWithValue(informationsList.value, "value", cellValue)?.find((item) => item.value == cellValue)?.name ||
        cellValue
    );
  } else if (name == "parentNo") {
    //let fdata = parentMenus.value.find(item => item.value == cellValue);
    return row && row["parentData"] ? row["parentData"].menuName : cellValue;
  }
  return cellValue;
};
const merge = (type: string) => {
  menuFormRef.value!.$refs["starHorseFormRef"].validate((result: boolean) => {
    if (!result) {
      return;
    }
    doMerge(type);
  });
};
const mergeDraft = (type: string) => {
  doMerge(type);
};
const doMerge = (type: string) => {
  load("数据处理中");
  let temp = unref(menuFormRef.value.getFormData());
  postRequest(dataUrl.mergeUrl!, temp)
      .then((res) => {
        closeLoad();
        if (res.data.code != 0) {
          warning(res.data.cnMessage);
          return;
        } else {
          success(res.data.cnMessage);
        }
        resetForm();
        if (type == "close") {
          dialogProps.editVisible = false;
        }
        menuTableListRef.value!.loadByPage();
        loadMenuBySystemId(currentInformation.value);
        //关闭弹窗
      })
      .catch((err) => {
        error("接口调用异常" + err);
      })
      .finally(() => {
        closeLoad();
      });
};
const resetForm = () => {
  dataForm.value = {};
};
let extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: "添加子菜单",
    authority: "add",
    icon: "plus",
    priority: 1,
    funcName: (row: any) => {
      dialogProps.ids = -1;
      dataForm.value["parentNo"] = row["dataNo"];
      console.log(row);
      dialogProps.editVisible = true;
    }
  }
]);
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {
  treeCheckChange(menuTableListRef.value, data);
  currentInformation.value = data.value;
  loadMenuBySystemId(data.value);
};
const initData = async () => {
  let params: any = [{propertyName: "statusCode", value: "1"}];
  informationsList.value = await loadSystemInfo(params);
  openTypeList.value = await dictData("page_open_type");
  // await loadMenuBySystemId(true);
  let {data} = await loadData(dataUrl.listConditionUrl!, params);
  if (data) {
    data.forEach((item: any) => {
      let temp: SelectOption = {name: item.menuName, value: item.dataNo};
      searchParentMenus.value.push(temp);
    });
  }
  // menuIconList.value = loadElementPlusIcon();
};
onMounted(async () => {
  await initData();
});
</script>
<style lang="scss" scoped></style>
<template>
  <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
      :self-func="true"
      @merge="merge"
      @mergeDraft="mergeDraft"
      @resetForm="resetForm"
  >
    <star-horse-form
        :outerFormData="dataForm"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :rules="rules"
        ref="menuFormRef"
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
    <el-splitter>
      <el-splitter-panel collapsible size="240"  min="100" max="500">
        <star-horse-tree
            v-model:treeDatas="informationsList"
            :treeTitle="'应用列表'"
            @selectData="checkChange"
            :comp-size="compSize"
        />
      </el-splitter-panel>
      <el-splitter-panel>

        <el-card class="inner_content">
          <div class="search-content">
            <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line'? 'column' : 'row' }">
              <star-horse-search-comp
                  @searchData="(data: any) => menuTableListRef?.createSearchParams(data)"
                  :formData="searchFormData"
                  :compUrl="dataUrl"
              />
            </div>
          </div>
          <star-horse-table-comp
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :extendBtns="extendBtns"
              :dataFormat="dataFormat"
              :show-batch-field="true"
              ref="menuTableListRef"
          />
        </el-card>
      </el-splitter-panel>
    </el-splitter>

  </el-card>
</template>
