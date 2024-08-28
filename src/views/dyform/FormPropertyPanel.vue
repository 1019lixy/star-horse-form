<script setup lang="ts" name="FormPropertyPanel">
import {computed, onMounted, reactive, ref, watch} from "vue";
import {loadElementPlusIcon, loadGetData, loadSystemInfo} from "@/api/sh_api";
import {SelectOption} from "@/components/types/SearchProps";
import {permissionMenus, postRequest} from "@/api/star_horse";
import {warning} from "@/utils/message";
import {DesignForm} from "@/store/DesignFormStore.ts";
import piniaInstance from "@/store/index.ts";
import {PageFieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";

let designForm = DesignForm(piniaInstance);
let formInfo = computed(() => designForm.formInfo);
let dynamicFormItemRef = ref();
let dbList = ref<any>([]);
let systemIconList = ref<SelectOption[]>([]);
let relationDataList = ref<Array<SelectOption>>([]);
let relationTypeList = ref<Array<SelectOption>>([{name: "一对一", value: "11"}, {name: "一对多", value: "1n"}, {name: "多对一", value: "n1"}, {name: "多对多", value: "mn"}]);
let dataSourceData = ref<any>();
let primaryKeyPolicyList = ref<SelectOption[]>([{name: "自增", value: "auto"}, {name: "动态赋值", value: "manual"}, {name: "序列", value: "sequence"}]);
let pageStyleList = ref<SelectOption[]>([{name: "普通", value: "general"}, {name: "Tab", value: "tab"}, {name: "列表", value: "formtb"}]);
let requireAsteriskPositionList = ref<SelectOption[]>([{name: "左", value: "left"}, {name: "右", value: "right"}]);
let labelPositionList = ref<SelectOption[]>([{name: "左", value: "left"}, {name: "右", value: "right"}, {name: "顶部", value: "top"}]);
let formSizeList = ref<SelectOption[]>([{name: "大", value: "large"}, {name: "中", value: "default"}, {name: "小", value: "small"}]);
let informationsList = ref<any>([]);
let menusInfoList = ref<any>([]);
let menuFlag = ref<boolean>(false);
const relationMsg = `
映射关系表示当前表与所选择的表之间的关系:
 一对一: 表示当前表和被选择表数据是一一对应关系;
 一对多: 表示当前表一条数据对应被选择表多条数据;
 多对一: 表示当前表多条数据对应被选择表1条数据;
 多对多: 表示当前表1条数据对应被选择表多条,
        反之被选择表的一条数据也对于当前表的多条数据。`;
const dbPositionMsg = `
动态创建的表需要存在那个数据库，
如果为空，则在当前业务数据库创建表信息。`;
const loadMenus = (val: any) => {
  if (!val) {
    return;
  }
  permissionMenus({}, val).then((res) => {
    let redata = res.data.data;
    menusInfoList.value = [];
    redata.forEach((item: any) => {
      menusInfoList.value.push({name: item.menuName, value: item.dataNo});
    });
  });
};
const tableFieldList = reactive<PageFieldInfo | any>({
      fieldList: [
        [
          {label: "表单名称", fieldName: "formName", type: "input", required: true, formShow: true},
          {
            label: "数据源", fieldName: "datasourceConfigId", helpMsg: dbPositionMsg, type: "select", optionList: dbList, actionName: "change",
            actions: (val: any) => {
              if (val["datasourceConfigId"]) {
                console.log(val["datasourceConfigId"])
                loadSameDataSourceTables(val);
              }
            }, required: true, formShow: true
          },
        ], {
          fieldName: "tab1",
          tabList: [{
            title: "基础属性",
            tabName: "tab1",
            fieldList: [
              [
                {label: "表名", fieldName: "tbName", type: "input", required: true, formShow: true, editDisabled: "Y"},
                {label: "主键", fieldName: "formId", type: "input", required: true, formShow: true, editDisabled: "Y"},
                {label: "主键策略", fieldName: "primaryKeyPolicy", type: "select", optionList: primaryKeyPolicyList, formShow: true, editDisabled: "Y"},
              ],
              [
                {label: "是否创建表", fieldName: "createTable", type: "switch", defaultValue: "N", formShow: true,},
                {label: "是否需要公共字段", fieldName: "needCommonFields", type: "switch", defaultValue: "N", formShow: true,},
                {
                  label: "是否创建菜单", fieldName: "createMenu", type: "switch", actionName: "change", actions: (val: any) => {
                    menuFlag.value = val["createMenu"] == "Y";
                  }, defaultValue: "N", formShow: true,
                },
              ],
              [
                {
                  label: "所属系统", fieldName: "sysId", type: "select", optionList: informationsList, actionName: "change", actions: (val: any) => {
                    console.log(val);
                    loadMenus(val["sysId"]);
                  }, formShow: menuFlag, required: true
                },
                {label: "父级菜单", fieldName: "parentMenuId", type: "select", optionList: menusInfoList, formShow: menuFlag},
              ],
              [
                {label: "表单图标", fieldName: "formIcon", type: "icon", formShow: true,},
                {label: "页面版式", fieldName: "pageStyle", type: "select", optionList: pageStyleList, formShow: true},
              ],
            ]
          }, {
            title: "映射关系配置",
            tabName: "tab2",
            helpMsg: relationMsg,
            batchFieldList: [{
              batchName: "relations",
              fieldList: [
                {label: "关联表", fieldName: "tableId", type: "select", optionList: relationDataList, required: true, formShow: true},
                {label: "映射关系", fieldName: "relationType", type: "select", defaultValue: "1n", optionList: relationTypeList, required: true, formShow: true},
              ]
            }]
          }, {
            title: "脚本绑定",
            tabName: "tab3",
            fieldList: []
          }, {
            title: "其它属性",
            tabName: "tab4",
            fieldList: [
              [
                {label: "标签位置", fieldName: "labelPosition", defaultValue: "left", type: "select", optionList: labelPositionList, formShow: true},
                {label: "标签长度", fieldName: "labelWidth", helpMsg: "如：50px", type: "input", formShow: true},
                {label: "表单验证规则名称", fieldName: "rules", defaultValue: "rules", type: "input", formShow: true},
              ],
              [
                {label: "表单风格", fieldName: "size", defaultValue: "small", type: "select", optionList: formSizeList, formShow: true},
                {label: "表单域标签的后缀", fieldName: "labelSuffix", type: "input", formShow: true},
                {label: "是否禁用该表单内的所有组件", fieldName: "disabled", defaultValue: "N", type: "switch", formShow: true},
              ],
              [
                {label: "是否隐藏必填字段标签旁边的红色星号", fieldName: "hideRequiredAsterisk", defaultValue: "N", type: "switch", formShow: true},
                {label: "校验失败时，滚动到第一个错误表单项", fieldName: "scrollToError", defaultValue: "Y", type: "switch", formShow: true},
                {label: "星号的位置", fieldName: "requireAsteriskPosition", defaultValue: "right", type: "radio", optionList: requireAsteriskPositionList, formShow: true},
              ],
              [
                {label: "是否在输入框中显示校验结果反馈图标", fieldName: "statusIcon", defaultValue: "N", type: "switch", formShow: true},
                {label: "是否显示校验错误信息", fieldName: "showMessage", defaultValue: "Y", type: "switch", formShow: true},
                {label: "是否以行内形式展示校验信息", fieldName: "inlineMessage", defaultValue: "Y", type: "switch", formShow: true},
              ],
              [
                {label: "是否在 rules 属性改变后立即触发一次验证", fieldName: "validateOnRuleChange", defaultValue: "N", type: "switch", formShow: true},
                {label: "行内表单模式", fieldName: "inline", defaultValue: "Y", type: "switch", formShow: true},
              ]
            ]
          }
          ]
        }
      ]
    })
;
const initDbList = async () => {
  let {data, error} = await loadGetData("/dbsearch-manage/dbsearch/dbinfoEntity/getDbInfoByUser");
  if (error) {
    warning(error);
    return
  }
  dbList.value = [];
  data.forEach((item: any) => {
    dbList.value.push({
      name: item.name,
      value: item.configId + ""
    })
  });
};
const initData = async () => {
  let params = [{propertyName: "statusCode", value: "1"}];
  informationsList.value = await loadSystemInfo(params);
  systemIconList.value = loadElementPlusIcon();
};


//获取同数据源下的表,用来配置对应的关系
const loadSameDataSourceTables = (formInfo: any) => {
  let params: any = [];
  formInfo['relations'] = [];
  params.push({
    propertyName: "datasourceConfigId",
    value: formInfo["datasourceConfigId"] || null,
    operation: formInfo["datasourceConfigId"] ? "eq" : "is",
    datatype: "input"
  })
  postRequest("/userdb-manage/userdb/dynamicForm/getAllByCondition", {
    dataList: params
  }).then(res => {
    relationDataList.value = [];
    if (res.data.code != 0) {
      return;
    }
    dataSourceData.value = res.data.data;
    dataSourceData.value.forEach((item: any) => {
      relationDataList.value.push({
        name: item.formName,
        value: item.formId
      })
    });
  });
};

//赋值
const relationChange = (row: any) => {
  let tableId = row.tableId;
  let fdata = dataSourceData.value.find((item: any) => item.formId == tableId);
  row["formName"] = fdata?.formName;
  row["tbName"] = fdata?.tbName;
};
/**
 * 表单更新的时候，更新表单的属性
 */
const updateCompInfo = () => {
};
const getFormData = () => {
  return dynamicFormItemRef.value.getFormData();
}
onMounted(() => {
  initData();
  initDbList();
  loadMenus(formInfo.value['sysId']);
  // loadSameDataSourceTables();
});

watch(() => formInfo.value,
    () => {
      updateCompInfo();
    }, {
      immediate: true,
      deep: true
    })
defineExpose({
  loadMenus, getFormData
})
</script>
<style lang="scss" scoped>
.dynamic-form {
  width: 100%;
}

</style>
<template>
  <star-horse-form :outerFormData="formInfo" :fieldList="tableFieldList" ref="dynamicFormItemRef"/>
</template>
