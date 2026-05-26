<script setup lang="ts">
import { i18n } from "@/lang/index.js";
import {error, isMobile, success} from "star-horse-lowcode";
import { nextTick, onMounted, ref, watch } from "vue";

const props = defineProps<{
  compSize: string;
  list: any[];
  currentPageClass?: string;
  formStyle?: string;
}>();
const previewFormRef = ref();
const validateForm = async () => {
  if (
    previewFormRef.value &&
    previewFormRef.value.$refs &&
    previewFormRef.value.$refs.previewFormRef
  ) {
    try {
      await previewFormRef.value.$refs.previewFormRef.validate();
      success(i18n("dyform.preview.validate.success"));
      return true;
    } catch (e) {
      error(i18n("dyform.preview.validate.failure"));
      return false;
    }
  }
  return true;
};

// HTML export function
const exportToHtml = () => {
  // if (!previewFormRef.value) return;
  // let formContent = "";
  // if (
  //   previewFormRef.value.$el &&
  //   typeof previewFormRef.value.$el.innerHTML === "string"
  // ) {
  //   formContent = previewFormRef.value.$el.innerHTML;
  // } else {
  //   console.error("Unable to access form content for export");
  //   error(i18n("dyform.preview.html.export.failure"));
  //   return;
  // }


  // Create blob and download
  // const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
  // const url = URL.createObjectURL(blob);
  // const link = document.createElement("a");
  // link.href = url;
  // link.download = "form-preview.html";
  // document.body.appendChild(link);
  // link.click();
  // document.body.removeChild(link);
  // URL.revokeObjectURL(url);
  // success(i18n("dyform.preview.html.export.success"));
};
const selectDatas = ref<any>([]);
const formData = ref<any>({
  pageStyle: "normal",
});
onMounted(() => {
  nextTick(() => {
    selectDatas.value = [
      { name: i18n("dyform.common.428"), value: "normal", key: "normal" },
      { name: i18n("dyform.common.429"), value: "form", key: "form" },
      { name: i18n("dyform.common.430"), value: "form-table", key: "form-table" },
      { name: "Tab", value: "tab", key: "tab" },
      { name: i18n("dyform.common.431"), value: "view", key: "view" },
    ];
  });
});
watch(
  () => props.formStyle,
  (val) => {
    formData.value.pageStyle = val ?? "form";
  },
  { immediate: true },
);
watch(()=>props.currentPageClass, (val) => {
    // window["_isDebug_"]=val.includes("-phone");
    console.log(window,isMobile);
})
defineExpose({
  validateForm,
  exportToHtml,
});
</script>

<template>
  <div class="flex flex-col w-full h-full">
    <el-form-item :label="i18n('dyform.common.432')" class="w-[240px]!">
      <select-item
        v-model:formData="formData"
        source="1"
        :field="{
          fieldName: 'pageStyle',
          preps: {
            values: selectDatas,
          },
        }"
      />
    </el-form-item>
    <div class="flex-1 w-full h-full relative" :class="currentPageClass">
      <NormalPage v-if="formData.pageStyle == 'normal'" :compList="list" :currentPageClass="currentPageClass" :preview="true"/>
      <FormPage v-if="formData.pageStyle == 'form'" :compList="list" :currentPageClass="currentPageClass" :preview="true"/>
      <FormTablePage
        v-if="formData.pageStyle == 'form-table'"
        :compList="list"
        :currentPageClass="currentPageClass"
        :preview="true"
      />
      <TabPage v-if="formData.pageStyle == 'tab'" :compList="list" :currentPageClass="currentPageClass" :preview="true"/>
      <ViewFormPage v-if="formData.pageStyle == 'view'" :compList="list" :currentPageClass="currentPageClass" :preview="true"/>
    </div>
  </div>
</template>

<style scoped lang="scss">
.dialog-actions {
  display: flex;
  gap: 10px;
  margin-right: 10px;
}
</style>
