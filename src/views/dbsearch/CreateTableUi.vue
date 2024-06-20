<script setup lang="ts">
import {onMounted, ref, provide, reactive} from "vue";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import StarHorseForm from "@/components/comp/StarHorseForm.vue";
import {ApiUrls} from "@/components/types/ApiUrls.d.ts";
import StarHorseFormList from "@/components/comp/StarHorseFormList.vue";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {BatchFieldInfo} from "@/components/types/PageFieldInfo.d.ts";

const dataUrl: ApiUrls = {
  loadByPageUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/pageList",
  mergeUrl: "/dbsearch-manage/dbsearch/dbinfoEntity//merge",
  mergeDraftUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeDraft",
  batchMergeUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeBatch",
  batchMergeDraftUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/mergeBatchDraft",
  loadByIdUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/getById",
  deleteUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/batchDeleteById",
  exportAllUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/exportData",
  downloadTemplateUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/downloadTemplate",
  userConditionUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/getAllByCondition",
  uploadUrl: "/dbsearch-manage/dbsearch/dbinfoEntity/importData",
  importUrl: ""
};
const tableFieldList = reactive({
  fieldList: [
    {
      label: "表名", fieldName: "tableName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "描述", fieldName: "comment", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
  ]
});
const columnFieldList = reactive<BatchFieldInfo>({
  batchName: "column",
  fieldList: [
    {
      label: "名称", fieldName: "name", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "类型", fieldName: "type", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "长度", fieldName: "length", type: "input",
       formShow: !false,
      tableShow: !false
    },
    {
      label: "允许为空", fieldName: "allowNull", type: "switch",
      defaultValue: "Y",
       formShow: !false,
      tableShow: !false
    },
    {
      label: "是否主键", fieldName: "isPrimaryKey", type: "switch",
       formShow: !false,
      tableShow: !false
    },
    {
      label: "备注", fieldName: "comment", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
  ]
});
const indexFieldList = reactive<BatchFieldInfo>({
  batchName: "index",
  fieldList: [
    {
      label: "表名", fieldName: "tableName", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
    {
      label: "描述", fieldName: "comment", type: "input",
      required: true, formShow: !false,
      tableShow: !false
    },
  ]
});
const primaryKey = "idDbinfo";
const dataForm = ref({
  columns: [],
  index: []
});
provide("dataForm", dataForm);
type Option = {
  label: string
  value: string | number | boolean
  disabled?: boolean
  [key: string]: any
} | string | number | boolean | undefined
let segmentValue = ref("basic");
let options = ref<Array<Option>>([{
  label: '基础信息',
  value: 'basic',
  icon: "document",
},
  {
    label: '列名',
    value: 'column',
    icon: "document",
  },
  {
    label: '索引',
    value: 'index',
    icon: "document",
  },]);

onMounted(() => {

});
</script>

<template>
  <el-card class="inner_content">
    <div class="table-type">
      <el-segmented v-model="segmentValue" :options="options">
        <template #default="{ item }">
          <div class="flex flex-col items-center gap-2 p-2">
            <div>
              <star-horse-icon :icon-class="item.icon" :size="'20px'"/>
              {{ item.label }}
            </div>
          </div>
        </template>
      </el-segmented>
    </div>
    <star-horse-form v-model:data-form="dataForm" v-if="segmentValue=='basic'" :primaryKey="primaryKey"
                     :fieldList="tableFieldList"
                     :compUrl="dataUrl"/>
    <star-horse-form-table v-if="segmentValue=='column'" :item="columnFieldList"
                           v-model:dataForm="dataForm"
    />
    <star-horse-form-table v-if="segmentValue=='index'" :item="indexFieldList"
                           v-model:dataForm="dataForm"
    />
  </el-card>
</template>

<style scoped lang="scss">
.table-type {
  width: 200px;
}
</style>
