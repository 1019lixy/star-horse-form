<script setup lang="ts">
import {nextTick, onActivated, onDeactivated, onMounted, provide, reactive, ref} from "vue";
import {apiInstance, ApiUrls, dialogPreps, PageFieldInfo, SearchFields} from "star-horse-lowcode";
import {getCustomerParam} from "@/utils/auth";

defineOptions({
  name: 'IndexModules',
})
//后端交互接口地址
const dataUrl: ApiUrls = apiInstance("system-config", "system/indexModules");
//主键
const primaryKey = "idIndexModule";
const indexModulesRef = ref();
const indexModulesFormRef = ref();
//定义表单的所有属性
const formFields = reactive<Object>({});
provide("formFields", formFields);
//查询属性
const searchFormData = reactive<SearchFields>({
  fieldList: []
});
//页面属性
const tableFieldList = reactive<PageFieldInfo | any>({
  //属性列表
  fieldList: [
    {
      label: "类别",
      fieldName: "moduleType",
      formVisible: true,
      listVisible: true
    }, {
      label: "图标",
      fieldName: "moduleIcon",
      formVisible: true,
      listVisible: true
    }, {
      label: "模块标题",
      fieldName: "title",
      formVisible: true,
      listVisible: true
    }, {
      label: "模块描述",
      fieldName: "description",
      formVisible: true,
      listVisible: true
    }, {
      label: "数据编号",
      fieldName: "dataNo",
    }
    , {
      label: "备注",
      fieldName: "remark",
    }
    , {
      label: "主键",
      fieldName: "idIndexModule",
      required: true,
    }
    , {
      label: "版本号",
      fieldName: "version",
      type: "number",
    }
    , {
      label: "创建人",
      fieldName: "createdBy",
    }
    , {
      label: "创建时间",
      fieldName: "createdTime",
      type: "datetime",
    }
    , {
      label: "修改人",
      fieldName: "updatedBy",
    }
    , {
      label: "修改时间",
      fieldName: "updatedTime",
      type: "datetime",
    }
    , {
      label: "状态",
      fieldName: "statusCode",
    }
    , {
      label: "状态名称",
      fieldName: "statusName",
    }
    , {
      label: "是否删除",
      fieldName: "isDel",
      type: "number",
    }
    , {
      label: "国际编码",
      fieldName: "local",
    }
    , {
      label: "租户",
      fieldName: "tenantId",
    }
  ],
  //默认查询条件
  condition: [getCustomerParam()],
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
    indexModulesRef.value.loadByPage()
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
    indexModulesFormRef.value.updateFormData(temp);
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
      <star-horse-form @refresh="indexModulesRef?.loadByPage()" @dataLoaded="dataLoaded" :compUrl="dataUrl"
                       :fieldList="tableFieldList"
                       ref="indexModulesFormRef"
                       :rules="rules"/>
    </star-horse-dialog>
    <star-horse-dialog :dialog-visible="dialogProps.viewVisible" :dialogProps="dialogProps" :source="3">
      <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl"/>
    </star-horse-dialog>
    <div class="search-content">
      <div class="search_btn">
        <star-horse-search-comp
            @searchData="(data: any) => indexModulesRef?.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
        />
      </div>
    </div>
    <el-card class="inner_content">
      <star-horse-table-comp ref="indexModulesRef" :fieldList="tableFieldList" :primaryKey="primaryKey"
                             :compUrl="dataUrl"
                             :dataFormat="dataFormat"/>
    </el-card>
  </div>
</template>
<style lang="scss" scoped>
//todo
</style>
