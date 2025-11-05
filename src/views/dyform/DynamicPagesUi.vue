<script setup lang="ts">
import {nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields, UserFuncInfo} from "star-horse-lowcode";
import {permissionMenus} from "@/api/star_horse_apis.js";
import {loadRolesInfo, loadSystemInfo} from "@/api/star_horse_utils.js";
import {ServiceEnums} from "@/components/enums/ServiceEnums.js";
import {getUserInfo} from "@/utils/auth.js";
import {useRouter} from "vue-router";

defineOptions({
  name: 'DynamicPages',
})
const router = useRouter();
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicPages");
//主键
const primaryKey = "idDynamicPage";
const dynamicPagesRef = ref();
const dynamicPagesFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
let rolesList = ref<any>([]);

const loadMenus = (val: any) => {
  if (!val) {
    return;
  }
  permissionMenus({}, val).then((res: any) => {
    menusInfoList.value = res.data.data;
  });
  loadRolesInfo([]).then((res: any) => {
    rolesList.value = res;
  });
};
//查询属性
const searchFormData = reactive<SearchFields>({
  "fieldList": [
    {
      "label": "页面名称",
      "fieldName": "pageName",
      "defaultVisible": true,
    }, {
      "label": "页面编码",
      "fieldName": "pageCode",
      "defaultVisible": true,
    },
    {
      "label": "归属系统",
      "fieldName": "sysId",
      "type": "tselect",
      "defaultVisible": true,
      "preps": {
        checkStrictly: true,
        data: informationsList,
      }
    }
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [{
    "label": "页面名称",
    "fieldName": "pageName",
    "required": true,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "页面编码",
    "fieldName": "pageCode",

    "required": true,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "归属系统",
    "fieldName": "sysId",
    "type": "tselect",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    actions: {
      change: (val: any) => {
        loadMenus(val["sysId"]);
      },
    },
    "preps": {
      checkStrictly: true,
      data: informationsList,
    }
  }, {
    "label": "是否创建菜单",
    "fieldName": "createMenu",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "是否发布",
    "fieldName": "isPublish",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "模板标识",
    "fieldName": "templateFlag",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "授权用户组",
    "fieldName": "userGroupIds",

    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "页面风格",
    "fieldName": "pageStyle",

    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "父菜单",
    "fieldName": "parentMenuId",

    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "父节点",
    "fieldName": "parentId",

    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "是否需要认证",
    "fieldName": "authFlag",
    "type": "switch",
    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "页面图标",
    "fieldName": "pageIcon",

    "required": false,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "容器类别",
    "fieldName": "containerType",

    "required": true,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "容器名称",
    "fieldName": "containerName",

    "required": true,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "容器信息",
    "fieldName": "containerContent",

    "required": true,
    "formVisible": true,
    "listVisible": true,

    "preps": {}
  }, {
    "label": "创建人",
    "fieldName": "createdBy",

    "listVisible": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "修改人",
    "fieldName": "updatedBy",

    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "版本号",
    "fieldName": "version",
    "type": "number",
    "listVisible": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "是否删除",
    "fieldName": "isDel",
    "type": "number",
    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "数据编号",
    "fieldName": "dataNo",

    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "状态",
    "fieldName": "statusCode",
    "type": "select",
    "listVisible": false,
    "preps": {"urlOrDictName": "common", "name": "statusCode", "dataSource": "dict"},
    "commonFlag": "Y"
  }, {
    "label": "状态名称",
    "fieldName": "statusName",

    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "国际编码",
    "fieldName": "local",

    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "备注",
    "fieldName": "remark",
    "type": "textarea",
    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "租户",
    "fieldName": "tenantId",
    "type": "select",
    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }],
  "batchFieldList": [],
  "userTableFuncs": [],
  "dynamicFormas": [],
  "orderBy": [{"fieldName": "idDynamicPage", "ascOrDesc": "desc"}],
  "batchName": "batchDataList",
  "cellEditable": false,
  "stopAutoLoad": false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
let selfBtnFunc = ref<UserFuncInfo[]>([]);
let extendBtnList = ref<UserFuncInfo[]>([]);
//初始化方法
const initData = async () => {
  let params = [{propertyName: "statusCode", value: "1"}];
  informationsList.value = await loadSystemInfo(
      params,
      `${ServiceEnums.SYSTEM_PREFIX}informations/getUserSystem/${getUserInfo()?.idUsersinfo}`,
  );
  selfBtnFunc.value?.push({
    btnName: "新增",
    icon: "add",
    priority: 2,
    authority: "add",
    position: "toolbar",
    funcName: () => {
      router.push("/dyform/DynamicPage");
    },
  });
  selfBtnFunc.value?.push({
    btnName: "编辑",
    priority: 3,
    icon: "edit",
    authority: "edit",
    funcName: (params: any) => {
      //params 页面刷新后 参数丢失，query 页面刷新后参数不会丢失
      router.push({
        path: "/dyform/DynamicPage",
        query: {
          pageId: params[primaryKey],
          parentId: params["parentId"] || 0,
        },
      });
    },
  });
  selfBtnFunc.value?.push({
    btnName: "预览",
    priority: 4,
    authority: "view",
    icon: "data-view",
    funcName: (params: any) => {
      // loadFormData(params[primaryKey]);
    },
  });
  extendBtnList.value = selfBtnFunc.value;
};
const activated = async () => {
  await nextTick(() => {
    dynamicPagesRef.value.loadByPage()
  });
}
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
  let temp: any = {};
  if (Object.keys(temp).length > 0) {
    dynamicPagesFormRef.value.updateFormData(temp);
  }
}
const deactivated = () => {

}
/**
 * 列表，查看数据时数据转换
 * @param name 名称
 * @param cellValue 值
 * @param row 列表行数据
 */
const dataFormat = (name: string, cellValue: any, row: any): any => {
  //转换显示信息
  return cellValue;
}
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
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
      <star-horse-form @refresh="dynamicPagesRef?.loadByPage()" @dataLoaded="dataLoaded" :compUrl="dataUrl"
                       :fieldList="tableFieldList"
                       ref="dynamicPagesFormRef"
                       :rules="rules"/>
    </star-horse-dialog>
    <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :source="3">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
            @searchData="(data: any) => dynamicPagesRef?.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp ref="dynamicPagesRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                             :compUrl="dataUrl"
                             :extendBtns="extendBtnList"
                             :orderBy="[
                                      {
                                        fieldName: 'a.createdTime',
                                        ascOrDesc: 'desc',
                                      },
                                    ]"
                             :dataFormat="dataFormat"/>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
