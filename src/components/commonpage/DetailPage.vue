<script setup lang="ts">
import {ref} from "vue";
import {apiInstance} from "star-horse-lowcode";
import {appEndpoints} from "@/api/app_config";
import {useCommonPage} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";

const props = defineProps({
  currentPageClass: { type: String, default: "" },
  preview: { type: Boolean, default: false },
  compList: { type: Array, required: true },
});

const emit = defineEmits<{
  (e: "back"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const detailFormRef = ref();
const isEditing = ref(false);

const {
  isLoading,
  hasData,
  errorMsg,
  primaryKey,
  rules,
  relationTables,
  tableFieldList,
  dataUrl,
  dialogProps,
  onFormDataLoaded,
  handleBeforeSubmit,
  dataFormat,
  dataRecall,
  deleteVisible,
  deleteLoading,
  handleDelete,
  confirmDelete,
} = useCommonPage({
  props,
  formRef: detailFormRef,
  defaultDataUrl: apiInstance(appEndpoints.gatewayServiceName, "consumer/api"),
  enableOnChange: true,
});

const handleEdit = () => {
  if (props.preview) {
    isEditing.value = true;
  } else {
    dialogProps.editVisible = true;
  }
  emit("edit");
};
const handleBack = () => emit("back");
const handlePrint = () => window.print();
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton
      v-if="isLoading"
      :showHeader="true"
      :showPreview="true"
      :previewRowCount="8"
    />

    <template v-else-if="hasData">
      <star-horse-panel
        :isShowBtnContinue="true"
        v-model="dialogProps.editVisible"
      >
        <star-horse-form
          @refresh="dataRecall"
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :compUrl="dataUrl"
          :preview="preview"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="detailFormRef"
          :globalCondition="relationTables"
          :dynamicForm="true"
        />
      </star-horse-panel>

      <el-card class="inner_content">
        <template #header>
          <div class="flex items-center justify-between">
            <span class="font-semibold">{{
              i18n("commonPage.detail.title")
            }}</span>
            <div class="flex gap-2">
              <el-button @click="handleBack">
                {{ i18n("commonPage.detail.back") }}
              </el-button>
              <el-button type="primary" @click="handleEdit">
                {{ i18n("commonPage.detail.edit") }}
              </el-button>
              <el-button type="danger" @click="handleDelete(primaryKey)">
                {{ i18n("commonPage.detail.delete") }}
              </el-button>
              <el-button @click="handlePrint">
                {{ i18n("commonPage.detail.print") }}
              </el-button>
            </div>
          </div>
        </template>

        <star-horse-form
          v-if="isEditing && preview"
          @refresh="dataRecall"
          @dataLoaded="onFormDataLoaded"
          @beforeSubmit="handleBeforeSubmit"
          :compUrl="dataUrl"
          :preview="preview"
          :fieldList="tableFieldList"
          :primary-key="primaryKey"
          :rules="rules"
          ref="detailFormRef"
          :globalCondition="relationTables"
          :dynamicForm="true"
          :typeModel="'form'"
        />
        <star-horse-data-view
          v-else
          :field-list="tableFieldList"
          :dataFormat="dataFormat"
          :preview="preview"
          :compUrl="dataUrl"
          :globalCondition="relationTables"
          :dynamicForm="true"
        />
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else />

    <el-dialog
      v-model="deleteVisible"
      :title="i18n('commonPage.delete.title')"
      width="420px"
    >
      <span>{{ i18n("commonPage.delete.confirm") }}</span>
      <template #footer>
        <el-button @click="deleteVisible = false">{{
          i18n("commonPage.delete.cancel")
        }}</el-button>
        <el-button
          type="danger"
          :loading="deleteLoading"
          @click="
            confirmDelete();
            emit('delete');
          "
        >
          {{ i18n("commonPage.delete.ok") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style scoped></style>
