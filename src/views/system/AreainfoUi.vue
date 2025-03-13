<script setup lang="ts" name="Areainfo">
  import { ApiUrls } from "@/components/types/ApiUrls";
  import { apiInstance, dialogPreps } from "@/api/star_horse_utils.ts";
  import { Config } from "@/api/settings.ts";
  import { onMounted, provide, reactive, ref } from "vue";
  import { SearchFields } from "@/components/types/SearchProps";
  import { PageFieldInfo } from "@/components/types/PageFieldInfo";
  import { commonField } from "@/api/system.ts";

  const dataUrl: ApiUrls = apiInstance("system-config", "system/areainfo");
  const searchFormData = reactive<SearchFields>({
    fieldList: [
      { label: "区域名称", defaultVisible: true, matchType: "lk", fieldName: "areaName", type: "input" },
      { label: "区域编码", defaultVisible: true, matchType: "lk", fieldName: "areaCode", type: "input" }
    ]
  });
  const tableFieldList = reactive<PageFieldInfo>({
    fieldList: [
      {
        label: "区域主键",
        fieldName: "idAreainfo",
        type: "long"
      },
      {
        label: "父节点编号",
        fieldName: "parentNo",
        type: "select",
        formVisible: true,
        listVisible: true
      },
      {
        label: "区域名称",
        fieldName: "areaName",
        type: "input",
        formVisible: true,
        listVisible: true
      },
      {
        label: "区域编码",
        fieldName: "areaCode",
        type: "input",
        formVisible: true,
        listVisible: true
      },
      ...commonField()
    ],
    batchFieldList: []
  });
  const primaryKey = "idAreainfo";
  const areainfoRef = ref();
  const rules = {};
  const dialogProps = dialogPreps();
  provide("dialogProps", dialogProps);

  const dataFormat = (_name: string, cellValue: object): any => {
    return cellValue;
  };
  const initData = async () => {};
  onMounted(() => {
    initData();
  });
</script>
<template>
  <star-horse-dialog :isShowBtnContinue="true" :dialogVisible="dialogProps.editVisible" :dialogProps="dialogProps">
    <star-horse-form
      @refresh="areainfoRef.loadByPage()"
      :compUrl="dataUrl"
      :fieldList="tableFieldList"
      :rules="rules"
    />
  </star-horse-dialog>
  <star-horse-dialog
    :dialog-visible="dialogProps.viewVisible"
    :dialogProps="dialogProps"
    :title="'查看数据'"
    :is-view="true"
  >
    <star-horse-data-view :dataFormat="dataFormat" :field-list="tableFieldList" :compUrl="dataUrl" />
  </star-horse-dialog>
  <el-card class="inner_content">
    <div class="search_btn" :style="{ 'flex-direction': Config.buttonStyle.value == 'line' ? 'column' : 'row' }">
      <star-horse-search-comp
        @searchData="(data: any) => areainfoRef.createSearchParams(data)"
        :formData="searchFormData"
        :compUrl="dataUrl"
      />
      <hr />
      <star-horse-button-list
        @tableCompFunc="(fun: any) => areainfoRef.tableCompFunc(fun)"
        :compUrl="dataUrl"
        :dialogProps="dialogProps"
        :showType="Config.buttonStyle"
      />
    </div>
    <hr />
    <star-horse-table-comp
      ref="areainfoRef"
      :fieldList="tableFieldList"
      :primaryKey="primaryKey"
      :compUrl="dataUrl"
      :dataFormat="dataFormat"
      :showPageBar="false"
    />
  </el-card>
</template>
<style lang="scss" scoped></style>
