<script setup lang="ts">
import {computed, nextTick, ref} from "vue";
import {i18n} from "@/lang/index.js";
import {validDynamicFormCompParams} from "@/components/system/items/utils/FormParamsValid";
import {piniaInstance, SelectOption, useDesignFormStore, warning} from "star-horse-lowcode";
import FormPropertyPanel from "@/components/system/items/form/FormPropertyPanel.vue";
import {FormConfig} from "@/components/types";

const designForm = useDesignFormStore(piniaInstance);
const list = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
const emits = defineEmits<{
  (e: "close"): void;
  (e: "save", isDraft: boolean, formInfo: any): void;
}>();

defineProps<{
  visible: boolean;
  compSize: string;
  optional: FormConfig
}>();

const formPropertyRef = ref();

const closeAction = () => {
  emits("close");
};
/**
 * 创建表单信息
 */
const createFormInfo = () => {
  let dynameForm = JSON.parse(JSON.stringify(formInfo.value));
  //解决多次转换
  dynameForm!["relations"] =
      dynameForm["relations"] && dynameForm["relations"] instanceof Array
          ? JSON.stringify(dynameForm["relations"])
          : dynameForm["relations"];
  dynameForm!["details"] = {};
  dynameForm!["details"]["content"] = JSON.stringify(list.value);
  dynameForm!["details"]["fieldNames"] = "{}";
  return dynameForm;
};
let isSubmit = ref<boolean>(true);
const doSave = async (isDraft: boolean = false) => {
  let formData = formPropertyRef.value.getFormData();
  designForm.setFormInfo(formData.value);
  if (!isSubmit.value) {
    closeAction();
    return;
  }

  let flag = false;
  await nextTick();
  if (!isDraft) {
    let errMessage = validDynamicFormCompParams(list.value, true);
    if (errMessage) {
      warning(errMessage);
      return;
    }
  }
  await formPropertyRef.value.$refs.dynamicFormItemRef.$refs.starHorseFormRef.validate(
      (evt: boolean) => {
        flag = evt;
      },
  );
  if (!flag) {
    warning("请先填写表单信息");
    return;
  }
  emits("save", isDraft, createFormInfo());
};

const analysisDynamicFields = (submit: boolean) => {
  isSubmit.value = submit;
  nextTick(() => {
    if (formPropertyRef.value) {
      formPropertyRef.value.analysisDynamicFields(createFormInfo());
    }
  });
};

defineExpose({
  analysisDynamicFields,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      @closeAction="closeAction"
      :selfFunc="true"
      :compSize="compSize"
      @merge="() => doSave(false)"
      boxHeight="70%"
      :title="i18n('dyform.config.dialog.title')"
  >
    <FormPropertyPanel ref="formPropertyRef" :optional="optional"/>
    <template #extend>
      <el-button
          @click="() => doSave(true)"
          style="
          background: var(--star-horse-style);
          color: var(--star-horse-white);
        "
          :size="compSize"
      >
        <star-horse-icon
            icon-class="short_save"
            cursor="pointer"
            style="color: var(--star-horse-white)"
        />
        {{ i18n("dyform.config.draft.save") }}
      </el-button>
    </template>
  </star-horse-dialog>
</template>
