<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: "small"},
  isView: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false},
});
const dataForm:ModelRef<any> = defineModel("dataForm");
const checkObject = (item: any) => {
  if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
}
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.collapseList&&item.collapseList.length>0">
    <el-collapse v-model="item.fieldName" v-on:change="item.actions">
      <template v-for="(collapseItem,key ) in item.collapseList">
        <el-collapse-item :title="collapseItem.title" :name="collapseItem.tabName||key"
                          :disabled="collapseItem.disabled"
                          :index="checkObject(collapseItem)">
          <el-scrollbar height="95%">
            <star-horse-form-item v-if="collapseItem.subFormFlag" :isView="isView" :compUrl="compUrl"
                                  v-model:dataForm="dataForm[collapseItem.objectName]"
                                  :objectName="collapseItem.objectName"
                                  :fieldList="{
                                  fieldList:collapseItem.fieldList,
                                  batchFieldList:collapseItem.batchFieldList
                                 }"
                                  :rules="rules" :subCreateFlag="collapseItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
            <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                                  v-model:dataForm="dataForm"
                                  :objectName="collapseItem.objectName"
                                  :fieldList="{
                                  fieldList:collapseItem.fieldList,
                                  batchFieldList:collapseItem.batchFieldList
                                 }"
                                  :rules="rules" :subCreateFlag="collapseItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
          </el-scrollbar>
        </el-collapse-item>
      </template>
    </el-collapse>
  </template>
</template>

<style scoped lang="scss">
.el-collapse {
  margin: 5px 10px;

  :deep(.el-collapse-item__header) {
    border: 1px solid var(--star-horse-disable);
    margin-top: 5px;
    height: 40px;
    padding-left: 15px;
  }

  :deep(.el-collapse-item__wrap) {
    margin-top: 10px;
    border: unset;
  }
}
</style>
