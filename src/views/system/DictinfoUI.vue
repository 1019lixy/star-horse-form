<script setup lang="ts" name="Statusinfo">
import {
  apiInstance,
  ApiUrls,
  createCondition,
  dialogPreps,
  PageFieldInfo,
  SearchFields,
  SelectOption,
  UserFuncInfo,
} from "star-horse-lowcode";
import { Config } from "@/api/settings";
import { loadDict } from "@/api/star_horse_apis";
import { computed, onMounted, provide, reactive, ref, watch } from "vue";

const dictinfoRef = ref();
const dictSearchRef = ref();
const dataUrl: ApiUrls = apiInstance("system-config", "system/dictinfoEntity");
const commonDictList = ref<SelectOption[]>([]);
const props = defineProps({
  dictType: { type: String, required: true },
});
let dictType = computed(() => props.dictType);
const searchFormData = reactive<SearchFields>({
  fieldList: [
    {
      label: "字典类型",
      fieldName: "dictType",
      defaultValue: dictType,
      disabled: true,
    },
    {
      label: "字典名称",
      defaultVisible: true,
      fieldName: "dictName",
      matchType: "lk",
    },
  ],
});
const editFormField = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "字典名称",
      fieldName: "dictName",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "字典编码",
      fieldName: "dictCode",

      required: true,
      formVisible: true,
      listVisible: true,
    },
    {
      label: "排序",
      fieldName: "dataSort",
      type: "number",
      formVisible: true,
      required: false,
      listVisible: true,
      preps: {
        min: 0,
        max: 1000,
      },
    },
    {
      label: "状态",
      fieldName: "statusName",

      required: false,
      listVisible: true,
    },
    {
      label: "状态",
      fieldName: "statusCode",
      type: "select",
      required: false,
      formVisible: true,
      defaultValue: "1",

      preps: {
        values: commonDictList,
      },
    },
    {
      label: "字典描述",
      fieldName: "dictDesc",
      type: "textarea",
      formVisible: true,
      listVisible: true,
    },
  ],
});
const tableFieldList = reactive<PageFieldInfo>({
  fieldList: [
    {
      label: "主键",
      fieldName: "idDictinfo",
      type: "long",
    },
    {
      label: "字典类型",
      fieldName: "dictType",

      required: true,
      formVisible: true,
      defaultValue: dictType,
      listVisible: true,
      disabled: true,
    },
    {
      batchFieldList: [
        {
          title: "字典信息",
          batchName: "dictList",
          subFormFlag: "N",
          fieldList: editFormField.fieldList,
        },
      ],
    },
    {
      label: "创建人",
      disabled: true,
      fieldName: "createdBy",
    },
    {
      label: "修改人",
      disabled: true,
      fieldName: "updatedBy",
    },
    {
      label: "创建日期",
      disabled: true,
      fieldName: "createdTime",
      type: "date",
    },
    {
      label: "修改日期",
      disabled: true,
      fieldName: "updatedTime",
      type: "date",
    },
    {
      label: "数据版本号",
      fieldName: "version",
      type: "number",
    },
    {
      label: "是否已逻辑",
      fieldName: "isDel",
      type: "number",
    },
    {
      label: "数据编号",
      fieldName: "dataNo",
    },
    {
      label: "国际码",
      fieldName: "local",
    },
  ],
  //阻止初始化时自动加载列表数据
  stopAutoLoad: true,
});
const primaryKey = "idDictinfo";
const rules = {};
watch(
  () => props.dictType,
  (val) => {
    dictSearchRef.value?.setData({ dictType: val });
    let condition = [createCondition("dictType", val)];
    dictinfoRef.value!.setDataInfo(condition, null);
    dictinfoRef.value!.createSearchParams(condition);
  },
  {
    immediate: false,
    deep: true,
  },
);
const dialogProps = dialogPreps();
provide("dialogProps", dialogProps);
const extendBtns = ref<UserFuncInfo[]>([
  {
    btnName: "编辑",
    authority: "edit",
    icon: "edit",
    priority: 1,
    funcName: (data: any) => {
      dialogProps.ids = data[primaryKey];
      dialogProps.bakeVisible1 = true;
    },
  },
]);
const dataFormat = (name: string, cellValue: any): any => {
  if (name == "statusCode" || name == "statusName") {
    return cellValue === "1" ? "启用" : cellValue == "0" ? "禁用" : cellValue;
  }
  return cellValue;
};
const initData = async () => {
  commonDictList.value = await loadDict("public");
};
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
        @refresh="dictinfoRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="tableFieldList"
        :rules="rules"
      />
    </star-horse-dialog>
    <star-horse-dialog
      :dialogVisible="dialogProps.bakeVisible1"
      :dialogProps="dialogProps"
    >
      <star-horse-form
        @refresh="dictinfoRef?.loadByPage()"
        :compUrl="dataUrl"
        :fieldList="editFormField"
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
        :field-list="editFormField"
        :compUrl="dataUrl"
      />
    </star-horse-dialog>

    <el-card class="inner_content">
      <div class="search-content">
        <div
          class="search_btn"
          :style="{
            'flex-direction':
              Config.buttonStyle.value == 'line' ? 'column' : 'row',
          }"
        >
          <star-horse-search-comp
            @searchData="(data: any) => dictinfoRef?.createSearchParams(data)"
            :formData="searchFormData"
            :compUrl="dataUrl"
          />
        </div>
      </div>
      <star-horse-table-comp
        ref="dictinfoRef"
        :fieldList="tableFieldList"
        :primaryKey="primaryKey"
        :extend-btns="extendBtns"
        :preValidFunc="[
          {
            authority: 'add',
            valid: () => {
              return dictType && dictType != '-1';
            },
            msg: '请先选择字典类别',
          },
        ]"
        :compUrl="dataUrl"
        :dataFormat="dataFormat"
      />
    </el-card>
  </div>
</template>
<style lang="scss" scoped></style>
