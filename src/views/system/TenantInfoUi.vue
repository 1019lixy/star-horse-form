<script setup lang="ts">
import {apiInstance, dialogPreps} from "@/api/sh_api";
import {ApiUrls} from "@/components/types/ApiUrls";
import {Config} from "@/api/settings";
import {onMounted, provide, reactive, ref, onActivated, onDeactivated, nextTick} from "vue";
import {SearchFields, SelectOption} from "@/components/types/SearchProps";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import {getCustomerParam} from "@/utils/auth";
import {createDatetime} from "@/api/date_utils.ts";
import {loadDict} from "@/api/star_horse.ts";

defineOptions({
  name: 'TenantInfo',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/tenantInfo");
//主键
const primaryKey = "idTenantInfo";
const tenantInfoRef = ref();
const tenantInfoFormRef = ref();
let effectiveTimeList = ref<SelectOption[]>([]);
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  "fieldList": [
    {"label": "租户名称", "fieldName": "tenantName", matchType: "lk", defaultVisible: true},
    {"label": "租户编码", "fieldName": "tenantCode", matchType: "lk", defaultVisible: true},
    {
      "label": "临期租户", "fieldName": "effectiveTime", type: "select",
      actionName: "change",
      actions: (value) => {
        alert(value.effectiveTime);
      },
      optionList: effectiveTimeList, defaultVisible: true
    },
  ]
});
const tableFieldList = reactive<PageFieldInfo | any>({
  "fieldList": [[{"label": "租户名称", "fieldName": "tenantName", "type": "input", "required": true, "formVisible": true, "listVisible": true, "preps": {}}, {"label": "租户编码", "fieldName": "tenantCode", "type": "input", "required": true, "formVisible": true, "listVisible": true, "preps": {}}], [{"label": "联系人", "fieldName": "linkMan", "type": "input", "required": true, "formVisible": true, "listVisible": true, "preps": {}}, {"label": "联系电话", "fieldName": "phone", "type": "input", "required": true, "formVisible": true, "listVisible": true, "preps": {}}],
    [{"label": "邮箱", "fieldName": "email", "type": "input", "required": true, "formVisible": true, "listVisible": true, "preps": {}}, {"label": "座机", "fieldName": "tel", "type": "input", "required": false, "formVisible": true, "listVisible": true, "preps": {}}],
    [{"label": "行业", "fieldName": "industry", "type": "select", "required": true, "formVisible": true, "listVisible": true, "preps": {"urlOrDictName": "industry_list", "dataSource": "dict"}}, {"label": "有效期", "fieldName": "effectiveTime", "type": "daterange", "required": true, "formVisible": true, "listVisible": true, "preps": {"needSplitName": "Y"}}], [{"label": "过期策略", "fieldName": "expirePolicy", "type": "select", "required": true, "formVisible": true, "listVisible": true, "preps": {"urlOrDictName": "expire_policy", "dataSource": "dict"}}, {"label": "数据备份策略", "fieldName": "dataBakePolicy", "type": "cron", "required": true, "formVisible": true, "listVisible": true, "preps": {}}], [{"label": "业务提醒方式", "fieldName": "businessNotice", "type": "select", "required": true, "formVisible": true, "listVisible": true, "preps": {"urlOrDictName": "message_tools", "values": [{"name": "站内通知", "value": "innerMsg"}, {"name": "短信通知", "value": "shortMsg"}, {"name": "邮件通知", "value": "email"}, {"name": "钉钉通知", "value": "dingding"}, {"name": "企业微信", "value": "webchat"}], "dataSource": "dict"}}, {"label": "是否订阅接口", "fieldName": "orderIntfaceFlag", "type": "switch", "required": false, "formVisible": true, "listVisible": true, "preps": {}}], [{"label": "消息模板", "fieldName": "messageTemplate", "type": "textarea", "required": false, "formVisible": true, "listVisible": true, "preps": {}}, {"label": "联系人地址", "fieldName": "address", "type": "textarea", "required": false, "formVisible": true, "listVisible": true, "preps": {}}], [{"label": "业务描述", "fieldName": "businessDesc", "type": "textarea", "required": false, "formVisible": true, "listVisible": true, "preps": {}}], {"label": "创建人", "fieldName": "createdBy", "type": "input", "listVisible": true, "preps": {}, "commonFlag": "Y"}, {"label": "修改人", "fieldName": "updatedBy", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "创建时间", "fieldName": "createdTime", "type": "datetime", "listVisible": true, "preps": {}, "commonFlag": "Y"}, {"label": "修改时间", "fieldName": "updatedTime", "type": "datetime", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "版本号", "fieldName": "version", "type": "number", "listVisible": true, "preps": {}, "commonFlag": "Y"}, {"label": "是否删除", "fieldName": "isDel", "type": "number", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "数据编号", "fieldName": "dataNo", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "状态", "fieldName": "statusCode", "type": "select", "listVisible": false, "preps": {"urlOrDictName": "common", "name": "statusCode", "dataSource": "dict"}, "commonFlag": "Y"}, {"label": "状态名称", "fieldName": "statusName", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "国际编码", "fieldName": "local", "type": "input", "listVisible": false, "preps": {}, "commonFlag": "Y"}, {"label": "备注", "fieldName": "remark", "type": "textarea", "listVisible": false, "preps": {}, "commonFlag": "Y"}], "batchFieldList": [], "userTableFuncs": [], "dynamicFormas": [], "orderBy": [], "batchName": "batchDataList", "tableCellEditabled": false, "stopAutoLoad": false
});
//校验
const rules = {};
//控制弹窗相关设置
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
//初始化方法
const initData = async () => {
  effectiveTimeList.value = await loadDict("effective_time");
};
const activated = async () => {
  await nextTick(() => {
    tenantInfoRef.value.loadByPage()
  });
}
/**
 * 数据加载完成后
 * @param data 数据
 */
const dataLoaded = (data: any) => {
  //将数据范围的字段进行处理
  let temp: any = {};
  temp["effectiveTime"] = [data['effectiveTimeStart'], data['effectiveTimeEnd']];
  if (Object.keys(temp).length > 0) {
    tenantInfoFormRef.value.updateFormData(temp);
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
  if (name == "effectiveTime") {
    return createDatetime(row.effectiveTimeStart) + "-" + createDatetime(row.effectiveTimeEnd);
  }
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
  <star-horse-dialog :isShowBtnContinue="true" :dialog-visible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form @refresh="tenantInfoRef.loadByPage()" @dataLoaded="dataLoaded" :compUrl="dataUrl"
                     :fieldList="tableFieldList"
                     ref="tenantInfoFormRef"
                     :rules="rules"/>
  </star-horse-dialog>
  <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :title="'查看数据'"
                     :isView="true">
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{
      'flex-direction':(Config.buttonStyle.value=='line'?'column':'row')
    }">
      <star-horse-search-comp @searchData="(data)=>tenantInfoRef.createSearchParams(data)" :formData="searchFormData"
                              :compUrl="dataUrl"/>
      <hr/>
      <star-horse-button-list @tableCompFunc="(fun)=>tenantInfoRef.tableCompFunc(fun)" :compUrl="dataUrl"
                              :dialogProps="dialogProps" :showType="Config.buttonStyle"/>
    </div>
    <hr/>
    <star-horse-table-comp ref="tenantInfoRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                           :compUrl="dataUrl"
                           :dataFormat="dataFormat"/>
  </el-card>
</template>
<style lang="scss" scoped>
//todo
</style>
