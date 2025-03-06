<script setup lang="ts">
import StarHorseFormItem from "@/components/comp/StarHorseFormItem.vue";
import {onMounted, PropType} from "vue";
import {ApiUrls} from "@/components/types/ApiUrls";
import {FieldInfo} from "@/components/types/PageFieldInfo";
import {ModelRef} from "vue-demi";
import {Config} from "@/api/settings.ts";
import {checkObject} from "@/api/sh_api.ts";

const props = defineProps({
  compUrl: {type: Object as PropType<ApiUrls>},
  item: {type: Array as PropType<Array<FieldInfo>>, required: true},
  objectName: {type: String},
  // 数据索引
  dataIndex: {type: Number, default: -1},
  parentPreps: {type: Object, default: {}},
  subFormFlag: {type: String, default: "N"},
  batchName: {type: String, default: "batchDataList"},
  batchFieldName: {type: String, default: "batchFieldList"},
  primaryKey: {type: String, required: true},
  rules: {type: Object},
  compSize: {type: String, default: Config.compSize},
  isView: {type: Boolean, default: false},
  isEdit: {type: Boolean, default: false}
});
const emits = defineEmits(["addRow", "removeRow"]);
const dataForm: ModelRef<any> = defineModel("dataForm");
/**
 * 列表添加行数据
 * @param row
 */
const addRow = (row: any) => {
  emits("addRow", row);
};
/**
 * 列表删除行数据
 * @param row
 */
const removeRow = (row: any) => {
  emits("removeRow", row);
};
const init = () => {
  console.log("carditem................", props.dataIndex)
};
onMounted(() => {
  init();
});
</script>

<template>
  <template v-if="item.cardList && item.cardList.length > 0">
    <template v-for="(cardItem,index) in item.cardList">
      <el-card
          shadow="hover"
          style="margin-bottom: 10px"
          v-if="Object.keys(cardItem).includes('disVisible') ? cardItem['disVisible'] : Object.keys(cardItem).length > 0"
          :index="checkObject(dataForm,cardItem,index,dataIndex)"
      >
        <template #header>
          <div class="card-header">
            <span>
              {{ cardItem.title || cardItem.tabName }} <help v-if="cardItem.helpMsg" :message="cardItem.helpMsg"/>
            </span>
            <template v-for="headerItem in cardItem.headerFieldList">
              <star-horse-item
                  style="flex: 1"
                  :compSize="compSize"
                  :bareFlag="true"
                  :isView="isView"
                  :primaryKey="primaryKey"
                  v-model:dataForm="dataForm"
                  :item="headerItem"
                  :dataIndex="dataIndex"
                  :isEdit="isEdit"
              />
            </template>
          </div>
        </template>
        <star-horse-form-item
            v-if="cardItem.subFormFlag=='Y'&&dataIndex>-1"
            :isView="isView"
            :compUrl="compUrl"
            v-model:dataForm="dataForm[cardItem.objectName][dataIndex]"
            :compSize="compSize"
            :dataIndex="dataIndex"
            :objectName="cardItem.objectName"
            @addRow="addRow"
            @removeRow="removeRow"
            :fieldList="{
            ...cardItem
          }"
            :rules="rules"
            :subFormFlag="cardItem.subFormFlag"
            :primaryKey="primaryKey"
        />
        <star-horse-form-item
            v-else-if="cardItem.objectName&&cardItem.subFormFlag == 'Y'"
            :isView="isView"
            :compUrl="compUrl"
            v-model:dataForm="dataForm[cardItem.objectName][index]"
            :compSize="compSize"
            :dataIndex="index"
            :objectName="cardItem.objectName"
            @addRow="addRow"
            @removeRow="removeRow"
            :fieldList="{
            ...cardItem
          }"
            :rules="rules"
            :subFormFlag="cardItem.subFormFlag"
            :primaryKey="primaryKey"
        />

        <star-horse-form-item
            v-else
            :isView="isView"
            :compUrl="compUrl"
            v-model:dataForm="dataForm"
            :compSize="compSize"
            :dataIndex="index"
            @addRow="addRow"
            @removeRow="removeRow"
            :objectName="cardItem.objectName"
            :fieldList="{
            ...cardItem
          }"
            :rules="rules"
            :subFormFlag="cardItem.subFormFlag"
            :primaryKey="primaryKey"
        />
      </el-card>
    </template>
  </template>
</template>

<style scoped lang="scss">
.card-header {
  span {
    width: 90%;
  }
}
:deep(.el-card__body),.el-card {
  height: unset !important;
  flex: unset !important;
}
</style>
