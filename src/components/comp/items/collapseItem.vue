<script setup lang="ts">
import StarHorseFormItem from '@/components/comp/StarHorseFormItem.vue';
import {onMounted, PropType} from 'vue';
import {ApiUrls} from '@/components/types/ApiUrls';
import {FieldInfo} from '@/components/types/PageFieldInfo';
import {ModelRef} from 'vue-demi';
import {Config} from '@/api/settings.ts';

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  parentPreps: {type: Object, default: {}},
  subFormFlag: {type: String, default: 'N'},
  batchName: {type: String, default: 'batchDataList'},
  batchFieldName: {type: String, default: 'batchFieldList'},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
  isView: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false},
});
const emits = defineEmits(['addRow', 'removeRow']);
const dataForm: ModelRef<any> = defineModel('dataForm');
const checkObject = (item: any) => {
  if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
};
/**
 * 列表添加行数据
 * @param row
 */
const addRow = (row: any) => {
  emits('addRow', row);
};
/**
 * 列表删除行数据
 * @param row
 */
const removeRow = (row: any) => {
  emits('removeRow', row);
};
const init = () => {

};
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.collapseList&&item.collapseList.length>0">
    <el-scrollbar style="margin-top: 10px">
      <el-collapse v-model="item.fieldName" :accordion="item.preps?.accordion" v-on:change="item.actions">
        <template v-for="(collapseItem,key ) in item.collapseList">
          <el-collapse-item v-if="Object.keys(collapseItem).includes('disVisible')?collapseItem['disVisible']:Object.keys(collapseItem).length>0 " :name="collapseItem.tabName||key"
                            :disabled="collapseItem.disabled"
                            :index="checkObject(collapseItem)">
            <template #title>
              <div class="collapse-item-title title">
                <div style="width: 80%">{{ collapseItem.title }}
                  <help v-if="collapseItem.helpMsg" :message="collapseItem.helpMsg"/>
                </div>
                <star-horse-icon v-if="collapseItem.icon" :icon-class="collapseItem.icon"/>
              </div>
            </template>

            <star-horse-form-item v-if="collapseItem.objectName" :isView="isView" :compUrl="compUrl"
                                  v-model:dataForm="dataForm[collapseItem.objectName]"
                                  :compSize="compSize"
                                  @addRow="addRow"
                                  @removeRow="removeRow"
                                  :objectName="collapseItem.objectName"
                                  :fieldList="{
                                  ...collapseItem
                                 }"
                                  :rules="rules" :subFormFlag="collapseItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
            <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                                  v-model:dataForm="dataForm"
                                  :compSize="compSize"
                                  @addRow="addRow"
                                  @removeRow="removeRow"
                                  :objectName="collapseItem.objectName"
                                  :fieldList="{
                                   ...collapseItem
                                 }"
                                  :rules="rules" :subFormFlag="collapseItem.subFormFlag"
                                  :primaryKey="primaryKey"/>

          </el-collapse-item>
        </template>
      </el-collapse>
    </el-scrollbar>
  </template>
</template>

<style scoped lang="scss">
.el-collapse {
  margin: 5px 3px;

  :deep(.el-collapse-item__header) {
    border-bottom: 1px solid rgb(229, 230, 235);
    border-top: 1px solid rgb(229, 230, 235);
    height: 30px;
  }

  :deep(.el-collapse-item__wrap) {
    margin-top: 10px;
    border: unset;
  }
}
</style>
