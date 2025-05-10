<script setup lang="ts">
import {Config} from "@/api/settings.ts";
import {computed, ref} from "vue";
import {commonField,ShForm} from "star-horse-lowcode";
const props = defineProps({
  list: {type: Array<any>, required: true},
  commonFieldList: {type: Array<any>, default: []},
  compSize: {type: String, default: Config.compSize},
  formDisabled: {type: Boolean, default: false}
});
let commonFields = commonField();
let fieldList = computed(() => {
  let tempList: any = [];
  props.commonFieldList
      ?.filter((item) => item.formVisible == "Y")
      .forEach((item) => {
        let tempItem = commonFields.find((item2) => item2.fieldName == item.fieldName);
        if (tempItem) {
          tempItem["required"] = item.required;
          tempItem["preps"] = {...tempItem};
          tempList.push(tempItem);
        }
      });
  return tempList;
});
let formData = ref<any>({});
const checkIsDisabled = (item: any) => {
  if (props.formDisabled) {
    item.preps.disabled = 'Y';
  }
  return item;
};
defineExpose({
  formData
});
</script>

<template>
  <div class="form-preview">
    <el-scrollbar height="100%" style="width: inherit">
      <sh-form
          label-width="auto"
          label-position="left"
          require-asterisk-position="right"
          :disabled="formDisabled"
          :rules="{}"
          v-model:dataForm="formData"
          :size="compSize"
      >
        <template v-for="data in list">
          <component
              :field="checkIsDisabled(data)"
              v-model:formData="formData"
              :isDesign="true"
              :disabled="formDisabled"
              :is="data?.itemType + '-container'"
              v-if="data?.compType === 'container'"
          >
          </component>
          <component v-else-if="data?.compType == 'formItem'" :field="checkIsDisabled(data)" v-model:formData="formData"
                     :isDesign="true" :disabled="formDisabled"
                     :is="data?.itemType + '-item'"/>
        </template>
        <template v-for="data in fieldList">
          <component :field="checkIsDisabled(data)" v-model:formData="formData" :isDesign="true" :disabled="formDisabled"
                     :is="data?.type + '-item'"/>
        </template>
      </sh-form>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss">
:deep {
  .el-tabs__item {
    height: 40px !important;
    writing-mode: horizontal-tb !important;
  }
}

.form-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 99%;
  height: 100%;
  margin: 5px auto;
  padding: 5px;
  flex: 1;
  overflow: hidden;
}
</style>
