<script setup lang="ts">
import {nextTick, ref, unref, watch} from "vue";
import {warning} from "star-horse-lowcode";
import {paramsFields} from "@/views/dyform/utils/ItemPreps";
import {i18n} from "@/lang";

const props = defineProps<{
  visible: boolean;
  formProps: any;
  formInfo: any;
  fieldName: string;
  currentField: any;
}>();

const emit = defineEmits<{
  (e: "merge"): void;
  (e: "close"): void;
  (e: "reset"): void;
}>();

const paramsConfigRef = ref<any>(null);

const paramsValid = async () => {
  let flag = false;
  await paramsConfigRef.value.$refs.starHorseFormRef.validate(
      (res: boolean) => {
        flag = res;
      },
  );
  if (!flag) {
    return;
  }
  const formData = unref(paramsConfigRef.value.getFormData());
  if (!formData["primaryKey"]) {
    warning(i18n("dyform.params.warning.primaryKey"));
    return;
  }
  if (!formData["needField"]?.length) {
    warning(i18n("dyform.params.warning.callbackFields"));
    return;
  }
  if (!formData["fieldLists"].length) {
    warning(i18n("dyform.params.warning.displayFields"));
    return;
  }
  for (let key in formData) {
    props.formProps[key] = formData[key];
  }
  props.formProps["redirect"] = true;
  props.formProps["dataUrl"] = {
    redirect: true,
    env: formData["env"],
    host: formData["host"],
    pageListUrl: formData["url"],
    httpMethod: formData["httpMethod"],
    port: formData["port"],
    protocol: formData["protocol"],
    params: formData.params,
  };
  let searchFieldList: Array<any> = [];
  props.formProps["fieldLists"].forEach((item: any) => {
    item["listVisible"] = true;
    item["type"] = "input";
    item["formVisible"] = true;
    if (item.searchFlag) {
      searchFieldList.push({...item, matchType: "lk", defaultVisible: true});
    }
  });
  props.formProps["searchFieldList"] = {
    fieldList: searchFieldList,
  };
  props.formProps["fieldList"] = props.formProps["fieldLists"];
  //删除多余的属性
  props.formProps["orderBy"]?.forEach((item: any) => {
    delete item["xh"];
  });
  emit("merge");
};

const resetDataSourceForm = () => {
  // Reset logic if needed
};
const setFormData = async (data: any) => {
  await nextTick();
  if (paramsConfigRef.value) {
    setTimeout(() => {
      paramsConfigRef.value?.setFormData(data);
    }, 200);
  }
};
watch(() => props.visible, (newVal) => {
  if (newVal) {
    setFormData(props.formProps);
  }
},{immediate: true});
defineExpose({
  setFormData,
});
</script>

<template>
  <star-horse-dialog
      :dialogVisible="visible"
      :title="i18n('dyform.params.dialog.title')"
      :isBatch="false"
      @merge="paramsValid"
      @closeAction="emit('close')"
      @resetForm="resetDataSourceForm"
      :selfFunc="true"
  >
    <star-horse-form
        ref="paramsConfigRef"
        :fieldList="paramsFields(paramsConfigRef, fieldName, currentField)"
    />
  </star-horse-dialog>
</template>
