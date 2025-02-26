<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType, ref} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import StarHorseFormTable from "@/components/comp/StarHorseFormTable.vue";
import {ModelRef} from "vue-demi";
import StarHorseIcon from "@/components/comp/StarHorseIcon.vue";
import {Config} from "@/api/settings.ts";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  parentPreps: {type: Object, default: {}},
  subFormFlag: {type: String, default: "N"},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
  isView: {type: Boolean, default: false},
});
const emits = defineEmits(["addRow", "removeRow"]);
const dataForm: ModelRef<any> = defineModel("dataForm");
const normalTabList = ref<string>("tab0");
const checkObject = (item: any) => {
  if (item && item.objectName && !Object.keys(dataForm.value).includes(item.objectName)) {
    dataForm.value[item.objectName] = {};
  }
  return 1;
}
/**
 * 列表添加行数据
 * @param row
 */
const addRow = (row: any) => {
  emits("addRow", row);
}
const closeOperation = (tabName: any) => {
  props.item.tabList?.forEach((item: any, index: number) => {
    if (item.tabName == tabName) {
      props.item.tabList.splice(index, 1);
      props.item.fieldName = props.item.tabList[0]?.tabName;
      let closeAction = props.item.closeAction;
      closeAction && closeAction(item);
      return false;
    }
  });
}
/**
 * 列表删除行数据
 * @param row
 */
const removeRow = (row: any) => {
  emits("removeRow", row);
}
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.tabList&&item.tabList.length>0">
    <el-tabs v-model="item.fieldName" :type="item.type||''" @tabRemove="closeOperation" :closable="item.closable=='Y'"
             @tabChange="item.actions">
      <template v-for="(tabItem,key) in item.tabList">
        <el-tab-pane :label="tabItem.title"
                     v-if="Object.keys(tabItem).includes('disVisible')?tabItem['disVisible']:Object.keys(tabItem).length>0"
                     :name="tabItem.tabName||key" :disabled="tabItem.disabled"
                     :index="checkObject(tabItem)">
          <template #label>
            <div class="custom-tabs-label">
              <star-horse-icon :icon-class="tabItem.icon" v-if="tabItem.icon"/>
              <span>{{ tabItem.title }}</span>
              <help v-if="tabItem.helpMsg" :message="tabItem.helpMsg"/>
            </div>
          </template>
          <el-scrollbar height="95%">
            <star-horse-form-item v-if="tabItem.objectName" :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  @addRow="addRow"
                                  @removeRow="removeRow"
                                  v-model:dataForm="dataForm[tabItem.objectName]"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                 ...tabItem
                                 }"
                                  :rules="rules" :subFormFlag="tabItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
            <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                                  :compSize="compSize"
                                  @addRow="addRow"
                                  @removeRow="removeRow"
                                  v-model:dataForm="dataForm"
                                  :objectName="tabItem.objectName"
                                  :fieldList="{
                                   ...tabItem
                                 }"
                                  :rules="rules" :subFormFlag="tabItem.subFormFlag"
                                  :primaryKey="primaryKey"/>
          </el-scrollbar>
        </el-tab-pane>
      </template>
    </el-tabs>
  </template>
  <template v-else-if="item.batchFieldList&&item.batchFieldList.length>0">
    <template v-if="item.batchFieldList.length>1&&(!item.displayStyle||item.displayStyle=='tab')">
      <el-tabs v-model="normalTabList" :type="item.type||''">
        <template v-for="(sitem,key) in item.batchFieldList">
          <el-tab-pane v-if="Object.keys(sitem).includes('disVisible')?sitem['disVisible']:Object.keys(sitem).length>0"
                       :label="sitem['title']" :name="sitem.tabName||'tab'+key"
                       :disabled="sitem.disabled">
            <template #label>
              <div class="custom-tabs-label">
                <star-horse-icon :icon-class="sitem.icon" v-if="sitem.icon"/>
                <span>{{ sitem.title }}</span>
              </div>
            </template>
            <star-horse-form-table :size="compSize" @addRow="addRow"
                                   @removeRow="removeRow" :rules="rules" :item="sitem" v-model:dataForm="dataForm"/>
          </el-tab-pane>
        </template>
      </el-tabs>
    </template>
    <template v-else v-for="temp in item.batchFieldList">
      <star-horse-form-table :rules="rules" :size="compSize" :item="temp"
                             @addRow="addRow"
                             @removeRow="removeRow"
                             v-if="Object.keys(temp).length>0"
                             v-model:dataForm="dataForm"/>
    </template>

  </template>
</template>

<style scoped lang="scss">

</style>
