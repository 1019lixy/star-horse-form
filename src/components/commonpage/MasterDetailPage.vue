<script setup lang="ts">
import {ref, watch} from "vue";
import {
  analysisCompDatas,
  convertCompToAppComps,
  dialogPreps,
} from "star-horse-lowcode";
import {useCommonPage, DEFAULT_BTN_PERMISSIONS} from "./useCommonPage";
import CommonSkeleton from "./CommonSkeleton.vue";
import {i18n} from "@/lang";
import {nextTick, provide} from "vue";

const props = defineProps({
  currentPageClass: {type: String, default: ""},
  preview: {type: Boolean, default: false},
  compList: {type: Array, required: true},
});

const masterTableRef = ref();
const masterFormRef = ref();
const detailTableRef = ref();
const detailFormRef = ref();
const currentMasterRow = ref<any>(null);
const detailFieldList = ref<any>({fieldList: [], stopAutoLoad: true});
const detailLoading = ref(false);

const {
  isLoading, hasData, errorMsg, primaryKey, rules, relationTables,
  tableFieldList, searchFormData, dataUrl, extBtns, dialogProps,
  onFormDataLoaded, handleBeforeSubmit, dataFormat, dataRecall,
  deleteVisible, deleteLoading, handleDelete, confirmDelete,
} = useCommonPage({
  props,
  formRef: masterFormRef,
  tableRef: masterTableRef,
  autoLoad: true,
});

const detailDialogProps = dialogPreps();
provide("detailDialogProps", detailDialogProps);

const loadDetailFields = () => {
  const list = props.compList as any[];
  if (list && list.length > 1) {
    detailFieldList.value = analysisCompDatas([list[1]]);
    if (props.currentPageClass == "main-design-phone") {
      detailFieldList.value = convertCompToAppComps(detailFieldList.value);
    }
  }
};
loadDetailFields();

const handleMasterRowChange = (row: any) => {
  currentMasterRow.value = row;
  if (!row) return;
  nextTick(() => {
    detailTableRef.value?.createSearchParams?.({parentId: row[primaryKey.value]});
  });
};
const detailDataRecall = (formData: any, result: any) => {
  if (props.preview) {
    detailTableRef.value?.assignStaticData?.(formData);
  } else {
    detailTableRef.value?.loadByPage?.();
  }
};
const detailDataFormat = (name: string, cellValue: any) => cellValue;

watch(() => props.compList, () => loadDetailFields(), {deep: true});
</script>
<template>
  <div class="flex flex-col h-full overflow-hidden">
    <CommonSkeleton v-if="isLoading" :showSearch="true" :showHeader="true" :showTable="true" :tableRowCount="4"/>

    <template v-else-if="hasData">
      <star-horse-panel :isShowBtnContinue="true" v-model="dialogProps.editVisible">
        <star-horse-form
            @refresh="dataRecall"
            @dataLoaded="onFormDataLoaded"
            @beforeSubmit="handleBeforeSubmit"
            :compUrl="dataUrl"
            :preview="preview"
            :fieldList="tableFieldList"
            :primary-key="primaryKey"
            :rules="rules"
            ref="masterFormRef"
            :globalCondition="relationTables"
            :dynamicForm="true"
        />
      </star-horse-panel>
      <star-horse-panel v-model="dialogProps.viewVisible" :source="3">
        <star-horse-data-view
            :dataFormat="dataFormat"
            :field-list="tableFieldList"
            :preview="preview"
            :globalCondition="relationTables"
            :dynamicForm="true"
            :compUrl="dataUrl"
        />
      </star-horse-panel>

      <el-card class="inner_content flex-1 overflow-hidden flex flex-col gap-2">
        <div class="master-section">
          <div class="section-title">{{ i18n("commonPage.masterDetail.master") }}</div>
          <div class="search-content" v-if="searchFormData.searchItemList?.length > 0">
            <div class="search_btn">
              <star-horse-search-comp
                  @searchData="(data: any) => masterTableRef?.createSearchParams(data)"
                  :formData="{fieldList: tableFieldList.searchItemList}"
                  :preview="preview"
                  :compUrl="dataUrl"
              />
            </div>
          </div>
          <star-horse-table-comp
              ref="masterTableRef"
              :fieldList="tableFieldList"
              :primaryKey="primaryKey"
              :globalConfig="relationTables"
              :isDynamic="true"
              :preview="preview"
              :extendBtns="extBtns"
              :compUrl="dataUrl"
              :btnPermissions="DEFAULT_BTN_PERMISSIONS"
              :showBatchField="true"
              :dataFormat="dataFormat"
              @currentChange="handleMasterRowChange"
          />
        </div>

        <div class="detail-section" v-if="detailFieldList.fieldList?.length > 0">
          <div class="section-title">{{ i18n("commonPage.masterDetail.detail") }}</div>
          <el-empty v-if="!currentMasterRow" :description="i18n('commonPage.masterDetail.selectMaster')" size="small"/>
          <template v-else>
            <star-horse-panel :isShowBtnContinue="true" v-model="detailDialogProps.editVisible">
              <star-horse-form
                  @refresh="detailDataRecall"
                  :compUrl="dataUrl"
                  :preview="preview"
                  :fieldList="detailFieldList"
                  :primary-key="primaryKey"
                  ref="detailFormRef"
                  :dynamicForm="true"
              />
            </star-horse-panel>
            <star-horse-table-comp
                ref="detailTableRef"
                :fieldList="detailFieldList"
                :primaryKey="primaryKey"
                :isDynamic="true"
                :preview="preview"
                :compUrl="dataUrl"
                :btnPermissions="DEFAULT_BTN_PERMISSIONS"
                :showBatchField="true"
                :dataFormat="detailDataFormat"
            />
          </template>
        </div>
      </el-card>
    </template>

    <el-empty :content="errorMsg" v-else/>

    <el-dialog v-model="deleteVisible" :title="i18n('commonPage.delete.title')" width="420px">
      <span>{{ i18n("commonPage.delete.confirm") }}</span>
      <template #footer>
        <el-button @click="deleteVisible = false">{{ i18n("commonPage.delete.cancel") }}</el-button>
        <el-button type="danger" :loading="deleteLoading" @click="confirmDelete()">
          {{ i18n("commonPage.delete.ok") }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>
<style lang="scss" scoped>
.section-title {
  font-weight: 600;
  padding: 4px 0;
  border-left: 3px solid var(--el-color-primary);
  padding-left: 8px;
  margin-bottom: 8px;
}
.detail-section {
  margin-top: 12px;
}
</style>