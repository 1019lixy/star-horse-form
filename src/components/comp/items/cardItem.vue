<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import {Config} from "@/api/settings.ts";

defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  parentPreps:{type:Object,default:{}},
  subCreateFlag: {type: Boolean, default: false},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
  isView: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
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
  <template v-if="item.cardList&&item.cardList.length>0">
    <template v-for="cardItem in item.cardList">
      <el-card shadow="hover" v-if="Object.keys(cardItem).length>0" :index="checkObject(cardItem)">
        <template #header>
          <div class="card-header">
            <span>{{ cardItem.title || cardItem.tabName }}  <help v-if="cardItem.helpMsg" :message="cardItem.helpMsg"/></span>
            <template v-for="headerItem in cardItem.headerFieldList">
              <star-horse-item style="flex:1" :compSize="compSize" :bareFlag="true" :isView="isView"
                               :primaryKey="primaryKey"
                               v-model:dataForm="dataForm"
                               :item="headerItem"
                               :isEdit="isEdit"/>
            </template>
          </div>
        </template>
        <star-horse-form-item v-if="cardItem.objectName" :isView="isView" :compUrl="compUrl"
                              v-model:dataForm="dataForm[cardItem.objectName]"
                              :compSize="compSize"
                              :objectName="cardItem.objectName"
                              :fieldList="{
                                 ...cardItem
                                 }"
                              :rules="rules" :subCreateFlag="cardItem.subFormFlag"
                              :primaryKey="primaryKey"/>
        <star-horse-form-item v-else :isView="isView" :compUrl="compUrl"
                              v-model:dataForm="dataForm"
                              :compSize="compSize"
                              :objectName="cardItem.objectName"
                              :fieldList="{
                                  ...cardItem
                                 }"
                              :rules="rules" :subCreateFlag="cardItem.subFormFlag"
                              :primaryKey="primaryKey"/>

      </el-card>
    </template>
  </template>
</template>

<style scoped lang="scss">


.card-header {
  span {
    width: 90%;
  }
;
}

</style>
