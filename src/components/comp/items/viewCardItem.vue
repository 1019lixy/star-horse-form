<script setup lang="ts">
import {onMounted, PropType} from "vue";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import StarHorseDataView from "@/components/comp/StarHorseDataView.vue";
import StarHorseDataViewObject from "@/components/comp/StarHorseDataViewItems.vue";

const props = defineProps({
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  commonFormat: {type: Function, required: true},
});
const dataForm: ModelRef<any> = defineModel("dataForm");
const init = () => {

}
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.cardList&&item.cardList.length>0">
    <template v-for="cardItem  in item.cardList">
      <el-card shadow="hover">
        <template #header>
          <div class="card-header">
            <span>{{ cardItem.title || cardItem.tabName }}</span>
          </div>
        </template>
        <star-horse-data-view-items :objectName="cardItem.objectName"
                              :subCreateFlag="true"
                              v-model:data-form="dataForm"
                              :commonFormat="commonFormat"
                              v-if="cardItem.subFormFlag"
                              primaryKey="id"
                              :fieldList="{
               fieldList:cardItem.fieldList,
              batchFieldList:cardItem.batchFieldList
            }"/>
        <star-horse-data-view-items v-else :fieldList="{
              fieldList:cardItem.fieldList,
              batchFieldList:cardItem.batchFieldList
            }"
                              v-model:data-form="dataForm"
                              :commonFormat="commonFormat"
        />
      </el-card>
    </template>
  </template>
</template>

<style scoped lang="scss">
.el-card:nth-child(n+1) {
  margin-top: 10px;
}
</style>
