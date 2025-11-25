<script setup lang="ts">
import { Config } from "@/api/settings.js";
import { computed, ref } from "vue";
import { itemCheck,commonField } from "star-horse-lowcode";

const props = defineProps({
  list: { type: Array<any>, required: true },
  commonFieldList: { type: Array<any>, default: [] },
  compSize: { type: String, default: Config.compSize },
  formDisabled: { type: Boolean, default: false },
});

const previewFormRef = ref<any>();
const formPreviewRoot = ref<HTMLDivElement | null>(null);

let commonFields = commonField();
let fieldList = computed(() => {
  let tempList: any = [];
  props.commonFieldList
    ?.filter((item) => item.formVisible)
    .forEach((item) => {
      let tempItem = commonFields.find(
        (item2) => item2.fieldName == item.fieldName,
      );
      if (tempItem) {
        tempItem["required"] = item.required;
        tempItem["preps"] = { ...tempItem };
        tempList.push(tempItem);
      }
    });
  return tempList;
});

let formData = ref<any>({});

const checkIsDisabled = (item: any) => {
  // if (props.formDisabled) {
  //   item.preps.disabled = true;
  // }
  return item;
};

// Expose form validation method
const validate = () => {
  if (previewFormRef.value && previewFormRef.value.validate) {
    return previewFormRef.value.validate();
  }
  return Promise.resolve(true);
};

const getFields = () => {
  return previewFormRef.value.getFields();
};

// Expose methods
defineExpose({
  formData,
  getFields,
  validate,
  // Expose the root element for HTML export
  $el: formPreviewRoot,
});
</script>

<template>
  <div ref="formPreviewRoot" class="form-preview">
    <sh-form
      :label-width="'auto'"
      :label-position="'right'"
      :require-asterisk-position="'right'"
      :disabled="formDisabled"
      :rules="{}"
      v-model:dataForm="formData"
      :size="compSize"
      ref="previewFormRef"
    >
      <div class="form-content-wrapper">
        <template v-for="data in list" :key="data.id">
          <component
            :field="checkIsDisabled(data)"
            v-model:formData="formData"
            :isDesign="false"
            :formInfo="list"
            :showFormItem="true"
            :is="itemCheck(data)"
          />
        </template>
        <template v-for="data in fieldList" :key="data.fieldName">
          <component
            :field="checkIsDisabled(data)"
            v-model:formData="formData"
            :isDesign="false"
            :showFormItem="true"
            :formInfo="fieldList"
            :is="itemCheck(data)"
          />
        </template>
      </div>
    </sh-form>
  </div>
</template>

<style scoped lang="scss">
:deep {
  .el-tabs__item {
    height: 40px !important;
    writing-mode: horizontal-tb !important;
  }
  .edit_col {
    border: none !important;
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

.form-content-wrapper {
  width: 100%;
  max-height: 100%;
  overflow-x: hidden; // Remove horizontal scrollbar
  overflow-y: auto; // Enable vertical scrollbar when needed
  padding-right: 10px; // Prevent content cutoff due to scrollbar
}
</style>
