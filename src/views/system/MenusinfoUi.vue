<script setup lang="ts" name="Menusinfo">
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {DialogProps} from "@/components/types/DialogProps"
import {ComponentInternalInstance, getCurrentInstance, onMounted, provide, reactive, ref, unref, watch} from "vue";
import {SearchProps, SelectOption} from "@/components/types/SearchProps";
import {closeLoad, createTree, load, loadData, loadElementPlusIcon, loadSystemInfo} from "@/api/sh_api";
import {postRequest} from "@/api/star_horse";
import {error, success, warning} from "@/utils/message";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {TreeNode, TreeNodeData} from "element-plus/es/components/tree-v2/src/types";
import {ElTreeV2} from "element-plus";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {treeCheckChange} from "@/api/system";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/system-config/system/menusinfoEntity/pageList",
  mergeUrl: "/system-config/system/menusinfoEntity/merge",
  mergeDraftUrl: "/system-config/system/menusinfoEntity/mergeDraft",
  batchMergeUrl: "/system-config/system/menusinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/system-config/system/menusinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/system-config/system/menusinfoEntity/getById",
  deleteUrl: "/system-config/system/menusinfoEntity/batchDeleteById",
  exportAllUrl: "/system-config/system/menusinfoEntity/exportData",
  downloadTemplateUrl: "/system-config/system/menusinfoEntity/downloadTemplate",
  userConditionUrl: "/system-config/system/menusinfoEntity/getAllByCondition",
  importUrl: "/system-config/system/menusinfoEntity/importData",
  uploadUrl: "",
  condition: []
};
let parentMenus: any = ref<any>([]);
let searchParentMenus: any = ref<any>([]);
let informationsList: any = ref<any>([]);
const proxy: ComponentInternalInstance | null = getCurrentInstance();
/**
 * 自定义属性事件
 * @param funcName
 * @param params
 const commonFunction = (funcName: string, params: any) => {
 if (proxy) {
 let funs = proxy[funcName];
 funs.call(proxy, params);
 } else {
 console.log("未获取到实例");
 }

 }
 provide('commonFunction', commonFunction);*/
const initData = async () => {
  let params: any = [{propertyName: "statusCode", value: "1"}]
  const datas = await loadSystemInfo(params);
  informationsList.value = datas;
  // await loadMenuBySystemId(true);
  let {data, error} = await loadData(dataUrl.userConditionUrl, params);
  if (data) {
    data.forEach((item: any) => {
      let temp: SelectOption = {name: item.menuName, value: item.dataNo};
      searchParentMenus.value.push(temp);
    })
  }
  menuIconList.value = loadElementPlusIcon();
};


onMounted(() => {
  initData();
})
const searchFormData = reactive<SearchProps[]>([
  /*{label: "归属系统", fieldName: "informationsSingleId", type: "select", optionList: informationsList},
  {label: "父菜单", fieldName: "parentNo", type: "tselect", optionList: searchParentMenus},*/
  {label: "菜单名称", defaultShow: true, fieldName: "menuName", type: "input", matchType: "lk"},
  {label: "菜单编码", fieldName: "menuCode", type: "input", matchType: "lk"},

]);
let menuIconList = ref<SelectOption[]>([]);
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [{
    label: "主键", fieldName: "idMenusinfo", type: "long",
  },
    [{
      label: "菜单名称", fieldName: "menuName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
      {
        label: "菜单路径", fieldName: "menuPath", type: "input",
        required: true, formShow: !false,
        tableShow: !false
      }],
    [{
      label: "归属应用名称", fieldName: "informationsSingleId", type: "select", optionList: informationsList,
      required: true, formShow: !false, disabled: "Y",
      tableShow: !false
    },
      {
        label: "父菜单", fieldName: "parentNo", type: "tselect", optionList: parentMenus,
        formShow: !false,
        preps: {
          checkStrictly: "Y"
        }
      }],
    {
      label: "菜单编码", fieldName: "menuCode", type: "input",
      required: true, disabled: "Y",
      tableShow: !false
    },
    [{
      label: "菜单图标", fieldName: "menuIcon", type: "icon", optionList: menuIconList,
      required: true, formShow: !false,
      tableShow: !false
    },
      {
        label: "排序", fieldName: "dataIndex", type: "number",
        required: true, formShow: !false,
        tableShow: !false
      },
      {
        label: "是否缓存页面", fieldName: "keepAlive", type: "switch",
        defaultValue: "Y",
        formShow: !false,
        tableShow: !false
      }],
    {
      label: "菜单描述", fieldName: "menuDesc", type: "textarea",
      formShow: !false,
      tableShow: !false
    },
    {
      label: "创建人", disabled: "Y", fieldName: "createdBy", type: "input",


    },
    {
      label: "修改人", disabled: "Y", fieldName: "updatedBy", type: "input",


    },
    {
      label: "创建日期", disabled: "Y", fieldName: "createdDate", type: "date",


    },
    {
      label: "修改日期", disabled: "Y", fieldName: "updatedDate", type: "date",


    },
    {
      label: "数据版本号", fieldName: "version", type: "number",


    },
    {
      label: "是否已逻辑", fieldName: "isDel", type: "number",


    },
    {
      label: "数据编号", fieldName: "dataNo", type: "input",


    },
    {
      label: "状态码", fieldName: "statusCode", type: "input",


    },
    {
      label: "状态码名称", fieldName: "statusName", type: "input",


    },
    {
      label: "国际码", fieldName: "local", type: "input",


    },
  ],
  batchFieldList: [],
  userTableFuncs: [],
  cellEditable: true
});
const primaryKey = "idMenusinfo";
const rules = {};
const searchForm = ref({});
provide("searchForm", searchForm);
const dataForm = ref({});
provide("dataForm", dataForm);
watch(() => dataForm.value["informationsSingleId"],
    (val) => {
      if (val) {
        loadMenuBySystemId(false);
      }
    }, {
      deep: true,
      immediate: true
    }
)
const loadMenuBySystemId = async (loadAll: boolean) => {
  if (dataForm.value["batchDataList"]?.length > 0) {
    parentMenus.value = createTree(dataForm.value["batchDataList"], "dataNo", "menuName", "idMenusinfo");
  } else {
    let params = [{
      "propertyName": "informationsSingleId",
      "value": dataForm.value["informationsSingleId"]
    }];
    let {data, error} = await loadData("/system-config/system/menusinfoEntity/getAllTreeDataByCondition/false", params);
    if (data) {
      parentMenus.value = createTree(data, "dataNo", "menuName", "idMenusinfo");
    }
  }

};
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
const menuFormRef = ref(null);
const menuTableListRef = ref();
const dataFormat = (name: string, cellValue: any, row: any): any => {
  if (name == "informationsSingleId") {
    let fdata = informationsList.value.find(item => item.value == parseInt(cellValue));
    return fdata?.name || cellValue;
  } else if (name == "parentNo") {
    //let fdata = parentMenus.value.find(item => item.value == cellValue);
    return row && row["parentData"] ? row["parentData"].menuName : cellValue;
  }
  return cellValue;
}

const merge = () => {
  menuFormRef.value!.$refs["starHorseFormRef"].validate((result: boolean) => {
    if (!result) {
      return;
    }
    doMerge();
  });
};


const mergeDraft = () => {
  doMerge();
};

const doMerge = () => {
  load("数据处理中");
  let temp = unref(dataForm);
  // let batchData = temp["batchDataList"];
  // batchData.forEach((item: any) => item["informationsSingleId"] = temp["informationsSingleId"]);
  postRequest(dataUrl.mergeUrl, temp).then(res => {
    closeLoad();
    if (res.data.code != 0) {
      warning(res.data.cnMessage);
      return;
    } else {
      success(res.data.cnMessage);
    }
    resetForm();
    dialogProps.editVisible = false;
    menuTableListRef.value!.loadByPage();
    //关闭弹窗
  }).catch(err => {
    error("接口调用异常" + err);
  }).finally(() => {
    closeLoad();
  });
};
const resetForm = () => {
  dataForm.value = {};
};
const treeRef = ref<InstanceType<typeof ElTreeV2>>();
const query = ref('');
const onQueryChanged = (query: string) => {
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
  treeRef.value!.filter(query)
};
const filterMethod = (query: string, node: TreeNode) => {
  return node.name!.toLowerCase().includes(query?.toLowerCase())
};
/**
 * 点击事件
 * @param data
 * @param checked
 */
const checkChange = (data: TreeNodeData, checked: boolean) => {

  treeCheckChange(treeRef.value, menuTableListRef.value, dataForm.value, data, checked);

};

</script>

<style lang="scss" scoped>

</style>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps"
                     :self-func="true"
                     @merge="merge" @mergeDraft="mergeDraft" @resetForm="resetForm">
    <star-horse-form v-model:data-form="dataForm" :compUrl="dataUrl" :fieldList="tableFieldList"
                     :primaryKey="primaryKey" :rules="rules"
                     ref="menuFormRef"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :is-view="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
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
              <star-horse-icon icon-class="search" color="var(--star-horse-style)"/>
            </template>
          </el-input>
          <el-tree-v2 :data="informationsList" :filter-method="filterMethod"
                      check-on-click-node="true"
                      show-checkbox
                      :height="600"
                      @check-change="checkChange"
                      @node-click="checkChange"
                      ref="treeRef" :props="{
            'label':'name',
            'value':'value'
          }"/>
        </el-card>
      </el-col>
      <el-col :span="21" style="height: inherit">
        <el-card class="inner_content" style="height: inherit">
          <div class="search_btn" :style="{'flex-direction':Config.buttonStyle.value=='line'?'column':'row'}">
            <star-horse-search-comp @searchData="(data)=>menuTableListRef.createCreateParams(data)"
                                    :formData="searchFormData"
                                    :compUrl="dataUrl"/>
            <hr/>
            <star-horse-button-list @tableCompFunc="(fun)=>menuTableListRef.tableCompFunc(fun)" :compUrl="dataUrl"
                                    :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
          </div>
          <hr>
          <star-horse-table-comp :fieldList="tableFieldList" :primaryKey="primaryKey" :compUrl="dataUrl"
                                 :dataFormat="dataFormat" :show-batch-field="true" ref="menuTableListRef"/>
        </el-card>
      </el-col>
    </el-row>

  </el-card>
</template>
