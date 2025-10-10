<script setup lang="ts" name="DictinfoType">
import {
  apiInstance,
  ApiUrls,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
  SearchParams,
} from "star-horse-lowcode";
import { onMounted, provide, reactive, ref } from "vue";
import { i18n } from "@/lang";

const dataUrl: ApiUrls = apiInstance("system-config", "system/dictinfoType");
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: i18n("system.name"),
      defaultVisible: false,
      matchType: "lk",
      fieldName: "dictTypeName",
    },
    {
      label: i18n("system.code"),
      defaultVisible: true,
      matchType: "eq",
      fieldName: "dictTypeCode",
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: i18n("system.primary.key"),
      fieldName: "idDictinfoType",
      type: "long",
    },
    {
      label: i18n("system.dictionary.type.name"),
      fieldName: "dictTypeName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.dictionary.type.code"),
      fieldName: "dictTypeCode",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: i18n("system.remark"),
      fieldName: "remark",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
  ],
  //在表格右侧添加自定义功能
});
const primaryKey = "idDictinfoType";
const rules = {};
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);

const dataFormat = (_name: string, cellValue: object): any => {
  return cellValue;
};
let dictTypeCode = ref<string>("");
const dictTypeRef = ref();
const dictTypeFormRef = ref();
//在ts中获取不到方法
const selectItemFun = (row: any) => {
  dictTypeCode.value = row["dictTypeCode"];
};
const searchData = (data: SearchParams[]) => {
  dictTypeRef.value.createSearchParams(data);
};
const initData = async () => {};
onMounted(async () => {
  await initData();
});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <star-horse-dialog
      :isShowBtnContinue="true"
      :dialogVisible="dialogProps.editVisible"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="dictTypeRef?.loadByPage()"
        :compUrl="dataUrl"
        ref="dictTypeFormRef"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialog-visible="dialogProps.viewVisible"
      :dialogProps="dialogProps"
      :source="3"
    >
      <star-horse-data-view
        :dataFormat="dataFormat"
        :field-list="tableFieldList"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>
    <el-card class="inner_content">
      <el-splitter>
        <el-splitter-panel collapsible>
          <el-card class="inner_content">
            <div class="search-content">
              <div class="search_btn">
                <star-horse-search-comp
                  @searchData="
                    (data: any) => dictTypeRef?.createSearchParams(data)
                  "
                  :formData="searchFormData"
                  :compUrl="dataUrl"
                />
              </div>
            </div>
            <star-horse-table-comp
              ref="dictTypeRef"
              @selectItem="selectItemFun"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :compUrl="dataUrl"
              :order-by="[
                {
                  fieldName: 'createdTime',
                  ascOrDesc: 'desc',
                },
              ]"
              :dataFormat="dataFormat"
            />
          </el-card>
        </el-splitter-panel>
        <el-splitter-panel :size="!dictTypeCode ? '0' : '50%'" collapsible>
          <div class="h-full overflow-hidden">
            <dictinfo-u-i :dictType="dictTypeCode" />
          </div>
        </el-splitter-panel>
      </el-splitter>
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
