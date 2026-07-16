<script setup lang="ts">
import {computed, nextTick, ref, watch} from "vue";
import {i18n} from "@/lang";
import { validDynamicFormCompParams } from "@/components/system/items/utils/FormParamsValid";
import { piniaInstance, useDesignFormStore, warning } from "star-horse-lowcode";
import FormPropertyPanel from "@/components/system/items/form/FormPropertyPanel.vue";
import { FormConfig } from "@/components/types";

const props = defineProps<{
  visible: boolean;
  optional: FormConfig;
}>();
const emits = defineEmits<{
  (e: "close"): void;
  (e: "save", isDraft: boolean, formInfo: any): void;
}>();

const designForm = useDesignFormStore(piniaInstance);
const list = computed(() => designForm.compList);
let formInfo = computed(() => designForm.formInfo);
let compSize = computed(() => props.optional?.compSize ?? "default");

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
    warning(i18n("dyform.dialog.414"));
    return;
  }
  emits("save", isDraft, createFormInfo());
};

const analysisDynamicFields = (submit: boolean) => {
  isSubmit.value = submit;
  console.log("[ConfigDialog] analysisDynamicFields called, submit:", submit);
  // 等待 el-dialog 内容渲染完成后再调用
  const tryCall = () => {
    nextTick(() => {
      if (formPropertyRef.value) {
        console.log("[ConfigDialog] formPropertyRef available, calling analysisDynamicFields");
        formPropertyRef.value.analysisDynamicFields(createFormInfo());
      } else {
        console.log("[ConfigDialog] formPropertyRef is null, retrying in 50ms...");
        // el-dialog 的 destroy-on-close 可能导致组件还未挂载，延迟重试
        setTimeout(tryCall, 50);
      }
    });
  };
  tryCall();
};
const dialogVisible=ref<boolean>(false);
watch(()=>props.visible,(val)=>{
  dialogVisible.value = val;
},{immediate:true});
defineExpose({
  analysisDynamicFields,
});
</script>

<template>
  <star-horse-dialog
    v-model="dialogVisible"
    @closeAction="closeAction"
    :selfFunc="true"
    :compSize="compSize"
    @merge="() => doSave(false)"
    boxHeight="70%"
    :title="i18n('dyform.config.dialog.title')"
  >
    <FormPropertyPanel ref="formPropertyRef" :optional="optional" />
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
