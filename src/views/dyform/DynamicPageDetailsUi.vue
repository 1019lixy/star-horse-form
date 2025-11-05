<script setup lang="ts">
import {nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";

defineOptions({
  name: 'DynamicPageDetails',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("userdb-manage", "userdb/dynamicPageDetails");
//主键
const primaryKey = "idDynamicPageDetail";
const dynamicPageDetailsRef = ref();
const dynamicPageDetailsFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({"fieldList": []});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [{
    "label": "动态页面主键",
    "fieldName": "idDynamicPage",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "defaultValue": false,
    "preps": {}
  }, {
    "label": "节点序号",
    "fieldName": "nodeIndex",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "defaultValue": false,
    "preps": {}
  }, {
    "label": "节点内容",
    "fieldName": "nodeContent",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "defaultValue": false,
    "preps": {}
  }, {
    "label": "节点组件",
    "fieldName": "nodeCompContent",
    "type": "input",
    "required": true,
    "formVisible": true,
    "listVisible": true,
    "defaultValue": false,
    "preps": {}
  }, {
    "label": "创建人",
    "fieldName": "createdBy",
    "type": "input",
    "listVisible": true,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "修改人",
    "fieldName": "updatedBy",
    "type": "input",
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
    "type": "input",
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
    "type": "input",
    "listVisible": false,
    "preps": {},
    "commonFlag": "Y"
  }, {
    "label": "国际编码",
    "fieldName": "local",
    "type": "input",
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
  "orderBy": [{"fieldName": "idDynamicPageDetail", "ascOrDesc": "desc"}],
  "batchName": "batchDataList",
  "cellEditable": false,
  "stopAutoLoad": false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
};
const activated = async () => {
  await nextTick(() => {
    dynamicPageDetailsRef.value.loadByPage()
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
    dynamicPageDetailsFormRef.value.updateFormData(temp);
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
      <star-horse-form @refresh="dynamicPageDetailsRef?.loadByPage()" @dataLoaded="dataLoaded" :compUrl="dataUrl"
                       :fieldList="tableFieldList"
                       ref="dynamicPageDetailsFormRef"
                       :rules="rules"/>
    </star-horse-dialog>
    <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :source="3">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
            @searchData="(data: any) => dynamicPageDetailsRef?.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp ref="dynamicPageDetailsRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                             :compUrl="dataUrl"
                             :dataFormat="dataFormat"/>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
